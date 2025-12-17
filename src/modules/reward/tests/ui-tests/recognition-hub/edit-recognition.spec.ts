import { expect } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';
import * as fs from 'fs';
import * as path from 'path';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { CSVUtils } from '@core/utils/csvUtils';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';

test.describe('edit Recognition', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
    await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();
  });

  test(
    '[RC-5348] Verify user can edit points within the 24hr pending period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify user can edit points within the 24hr pending period',
        zephyrTestId: 'RC-5348',
        storyId: 'RC-5348',
      });
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      let availablePoints: string;
      let recognitionPostId: string;
      const rewardPointIndex: number = 3;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      if (existingOptions.length <= 1) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().recognitionManagerName);
      await giveRecognitionModal.selectTheUserForRecognition(2);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      const recognitionPostMessage = 'Test Message' + Math.floor(Math.random() * 1000);
      await giveRecognitionModal.enterTheRecognitionMessage(recognitionPostMessage);
      await giveRecognitionModal.giftThePoints(rewardPointIndex);
      const [response] = await Promise.all([
        recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);
      const shareModal = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(shareModal.container, { timeout: 2000 })) {
        await shareModal.skipButton.click();
        await expect(shareModal.container).not.toBeVisible();
      }

      const body = await response.json();
      if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      recognitionPostId = String(body.id);

      // Handle dialog box if it appears
      const dialogBox = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }
      const currentPointsToGive = (await recognitionHub.pointsToGive.textContent()) || '0';
      expect(Number(currentPointsToGive)).toBe(Number(availablePoints) - 6);

      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(rewardPointIndex),
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
      const rewardPoints = 1;
      const newRewardPointsText =
        (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
      if (!(await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
        await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).click();
        await expect(giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1)).toBeChecked();
      }
      await expect(giveRecognitionModal.doneButton).toBeEnabled();
      await recognitionHub.clickOnElement(giveRecognitionModal.doneButton);
      const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
      await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        newRewardPointsText,
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );

  test(
    '[RC-5704] Verify App manager can remove the given points within the 24hr pending period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify App manager can remove the given points within the 24hr pending period',
        zephyrTestId: 'RC-5704',
        storyId: 'RC-5704',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const rewardPointIndex = 3;
      let availablePoints: string, recognitionPostId: String;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().recognitionManagerName);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(rewardPointIndex);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      await giveRecognitionModal.giftThePoints(rewardPointIndex);
      const [response] = await Promise.all([
        recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);
      const shareModal = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(shareModal.container, { timeout: 2000 })) {
        await shareModal.skipButton.click();
        await expect(shareModal.container).not.toBeVisible();
      }

      const body = await response.json();
      if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      recognitionPostId = String(body.id);

      // Handle dialog box if it appears
      const dialogBox = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }
      await recognitionHub.verifier.waitUntilElementIsVisible(recognitionHub.pointsToGive);
      const currentPointsToGive = (await recognitionHub.pointsToGive.textContent()) || '0';
      expect(Number(currentPointsToGive)).toBe(Number(availablePoints) - 3);

      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(rewardPointIndex),
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
      await giveRecognitionModal.giftingToggle.uncheck();
      await expect(giveRecognitionModal.doneButton).toBeEnabled();
      await giveRecognitionModal.doneButton.click({ force: true });
      const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
      await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        false,
        '3',
        'Only visible to recipients, their managers and app administrators'
      );
      const manageRecognitionPage = new ManageRewardsOverviewPage(recognitionHub.page);
      await manageRecognitionPage.loadPage();
      const [download] = await Promise.all([
        manageRecognitionPage.page.waitForEvent('download'),
        manageRecognitionPage.clickOnElement(manageRecognitionPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      ]);
      const csvFilePath = path.resolve('./downloads', download.suggestedFilename());
      await download.saveAs(csvFilePath);
      const validationResult = await CSVUtils.validateRowValue('last', 14, 'REJECTED', csvFilePath);
      expect(validationResult.isMatch, `Expected "REJECTED" but got "${validationResult.actualValue}"`).toBeTruthy();
      fs.unlinkSync(csvFilePath);
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );

  test(
    '[RC-5350] Verify app manager can edit points within the 24hr pending period for multiple recipient',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify app manager can edit points within the 24hr pending period for multiple recipient',
        zephyrTestId: 'RC-5350',
        storyId: 'RC-5350',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      const rewardPointIndex = 3;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().recognitionManagerName);
      await giveRecognitionModal.selectTheUserForRecognition(2);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(rewardPointIndex);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      await giveRecognitionModal.giftThePoints(rewardPointIndex);
      const [response] = await Promise.all([
        recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);

      const dialogBox = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      const body = await response.json();
      if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      const recognitionPostId = String(body.id);

      await recognitionHub.verifier.waitUntilElementIsVisible(recognitionHub.pointsToGive);
      let currentPointsToGive = (await recognitionHub.pointsToGive.textContent()) || '0';
      expect(Number(currentPointsToGive)).toBe(Number(availablePoints) - 6);

      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(rewardPointIndex),
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
      const rewardPoints = 1;
      const rewardPointsText =
        (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
      if (!(await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
        await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
        await expect(giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1)).toBeChecked();
      }

      await expect(giveRecognitionModal.doneButton).toBeEnabled();
      await giveRecognitionModal.doneButton.click({ force: true });
      const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
      await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(rewardPointsText),
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.verifier.waitUntilElementIsVisible(recognitionHub.pointsToGive);
      currentPointsToGive = (await recognitionHub.pointsToGive.textContent()) || '0';
      expect(Number(currentPointsToGive)).toBe(Number(availablePoints) - 2);
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );

  test(
    '[RC-5351] Verify recognition manager can edit points within the 24hr pending period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify recognition manager can edit points within the 24hr pending period',
        zephyrTestId: 'RC-5351',
        storyId: 'RC-5351',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      const rewardOptionIndex = 3;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().recognitionManagerName);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(rewardOptionIndex);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      await giveRecognitionModal.giftThePoints(rewardOptionIndex);
      const [response] = await Promise.all([
        recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);
      // Handle dialog box if it appears
      const dialogBox = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      const body = await response.json();
      if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      const recognitionPostId = String(body.id);

      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      expect(Number(newAvailablePoints)).toBe(Number(availablePoints) - 3);
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(rewardOptionIndex),
        'Only visible to recipients, their managers and app administrators'
      );
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
        password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
      });
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
      const rewardPoints = 1;
      const rewardPointsText =
        (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
      if (!(await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
        await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
        await expect(giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1)).toBeChecked();
      }
      await expect(giveRecognitionModal.doneButton).toBeEnabled();
      await giveRecognitionModal.doneButton.click({ force: true });
      const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
      await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );

  test(
    '[RC-5354] Verify user can edit points within the 24hr pending period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify user can edit points within the 24hr pending period',
        zephyrTestId: 'RC-5354',
        storyId: 'RC-5354',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      const dialogBox = new DialogBox(appManagerFixture.page);
      const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
      const rewardOptionIndex = 3;
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRewardTenantConfigFromCache().endUserEmail!,
        password: getRewardTenantConfigFromCache().endUserPassword!,
      });
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      await recognitionHub.clickOnGiveRecognition();
      await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().recognitionManagerName);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(rewardOptionIndex);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      await giveRecognitionModal.giftThePoints(rewardOptionIndex);
      const [response] = await Promise.all([
        recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);
      // Handle dialog box if it appears
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      const body = await response.json();
      if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      const recognitionPostId = String(body.id);

      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      expect(Number(newAvailablePoints)).toBe(Number(availablePoints) - rewardOptionIndex);
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(rewardOptionIndex),
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
      const rewardPoints = 4;
      const rewardPointsText =
        (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
      if (!(await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
        await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
        await expect(giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1)).toBeChecked();
      }
      await expect(giveRecognitionModal.doneButton).toBeEnabled();
      await giveRecognitionModal.doneButton.click({ force: true });
      await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to recipients, their managers and app administrators'
      );
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );

  test(
    '[RC-5349] Verify app manager can not edit points after the 24hr pending period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify app manager can not edit points after the 24hr pending period',
        zephyrTestId: 'RC-5349',
        storyId: 'RC-5349',
      });

      const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRecognitionPage.loadPage();
      await expect(manageRecognitionPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
      const rewardData = await manageRecognitionPage.openTheRecognitionPostCreatedBefore24Hrs();
      const points = rewardData.resultAny?.points!;
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      await recognitionHub.page.goto(rewardData.resultAny?.URL!);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
      await giveRecognitionModal.closeButton.click();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(points),
        'Only visible to recipients, their managers and app administrators'
      );
    }
  );

  test(
    '[RC-5353] Verify recognition manager can not edit points after 24hr period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify recognition manager can not edit points after 24hr period',
        zephyrTestId: 'RC-5353',
        storyId: 'RC-5353',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
        password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
      });
      await manageRecognitionPage.loadPage();
      await expect(manageRecognitionPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
      const rewardData = await manageRecognitionPage.openTheRecognitionPostCreatedBefore24Hrs();
      const points = rewardData.resultAny?.points!;
      await recognitionHub.page.goto(rewardData.resultAny?.URL!);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
      await giveRecognitionModal.closeButton.click({ force: true });
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(points),
        'Only visible to recipients, their managers and app administrators'
      );
    }
  );

  test(
    '[RC-5705] Verify App manager can not remove given points after the 24hr pending period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify App manager can not remove given points after the 24hr pending period',
        zephyrTestId: 'RC-5705',
        storyId: 'RC-5705',
      });
      const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const recognitionGiverName = getRewardTenantConfigFromCache().appManagerName;
      await manageRecognitionPage.loadPage();
      await expect(manageRecognitionPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
      const rewardData = await manageRecognitionPage.openTheRecognitionPostCreatedBefore24Hrs(recognitionGiverName);
      const points = rewardData.resultAny?.points!;
      await recognitionHub.page.goto(rewardData.resultAny?.URL!);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
      await giveRecognitionModal.closeButton.click({ force: true });
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(points),
        'Only visible to recipients, their managers and app administrators'
      );
    }
  );

  test(
    '[RC-5355] Verify user can not edit points after the 24hr pending period',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify user can not edit points after the 24hr pending period',
        zephyrTestId: 'RC-5355',
        storyId: 'RC-5355',
      });
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
        password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
      });
      const recognitionGiverName = getRewardTenantConfigFromCache().endUserName;
      await manageRecognitionPage.loadPage();
      await expect(manageRecognitionPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
      const rewardData = await manageRecognitionPage.openTheRecognitionPostCreatedBefore24Hrs(recognitionGiverName);
      const points = rewardData.resultAny?.points!;
      const currentUrl = rewardData.resultForGiver?.URL!;
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRewardTenantConfigFromCache().endUserEmail!,
        password: getRewardTenantConfigFromCache().endUserPassword!,
      });
      await recognitionHub.page.goto(currentUrl);
      await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'visible', timeout: 25000 });
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
      await giveRecognitionModal.closeButton.click();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(points),
        'Only visible to recipients, their managers and app administrators'
      );
    }
  );

  test(
    '[RC-5629] Validate status of transaction history when edit recognition with points within 24hr',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_EDIT_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate status of transaction history when edit recognition with points within 24hr',
        zephyrTestId: 'RC-5629',
        storyId: 'RC-5629',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const rewardOptionIndex = 3;
      const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const existingOptions = await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      if (existingOptions.length <= 1) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().recognitionManagerName);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      const recognitionPostMessage = 'Test Message' + Math.floor(Math.random() * 1000);
      await giveRecognitionModal.enterTheRecognitionMessage(recognitionPostMessage);
      await giveRecognitionModal.giftThePoints(rewardOptionIndex);
      const [response] = await Promise.all([
        recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);
      // Handle dialog box if it appears
      const dialogBox = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }
      const body = await response.json();
      if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      const recognitionPostId = String(body.id);
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        String(rewardOptionIndex),
        'Only visible to recipients, their managers and app administrators'
      );

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
        password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
      });
      await manageRecognitionPage.loadPage();
      await manageRecognitionPage.verifyThePageIsLoaded();
      // ✅ Trigger and capture download
      let [download] = await Promise.all([
        manageRecognitionPage.page.waitForEvent('download', { timeout: 25000 }),
        manageRecognitionPage.clickOnElement(manageRecognitionPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      ]);

      // ✅ Save in downloads folder
      let csvFilePath = path.resolve('./downloads', download.suggestedFilename());
      await download.saveAs(csvFilePath);

      // ✅ Validate last row column value
      let validationResult = await CSVUtils.validateRowValue('last', 14, 'PENDING', csvFilePath);
      expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();
      fs.unlinkSync(csvFilePath);
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
      await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
      const rewardPoints = 4;
      const rewardPointsText =
        (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
      if (!(await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
        await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
        await expect(giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1)).toBeChecked();
      }
      await expect(giveRecognitionModal.doneButton).toBeEnabled();
      await giveRecognitionModal.doneButton.click({ force: true });
      const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
      await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
      await recognitionHub.page.reload();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'visible' });
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to recipients, their managers and app administrators'
      );
      // Validate the new Entry in the Downloaded CSV file:
      await manageRecognitionPage.loadPage();
      // ✅ Trigger and capture download
      [download] = await Promise.all([
        manageRecognitionPage.page.waitForEvent('download'),
        manageRecognitionPage.clickOnElement(manageRecognitionPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      ]);

      // ✅ Save in downloads folder
      csvFilePath = path.resolve('./downloads', download.suggestedFilename());
      await download.saveAs(csvFilePath);

      // ✅ Validate last row column value
      validationResult = await CSVUtils.validateRowValue(1, 14, 'REJECTED', csvFilePath);
      expect(validationResult.isMatch, `Expected "REJECTED" but got "${validationResult.actualValue}"`).toBeTruthy();
      validationResult = await CSVUtils.validateRowValue('last', 14, 'PENDING', csvFilePath);
      expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();
      fs.unlinkSync(csvFilePath);
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );
});
