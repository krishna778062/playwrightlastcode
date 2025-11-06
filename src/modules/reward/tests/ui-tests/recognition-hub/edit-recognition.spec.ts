import { expect } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
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
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      let availablePoints: string;

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length <= 1) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          getRewardTenantConfigFromCache().endUserName,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit and change the points', async () => {
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
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
        await recognitionHub.page.reload();
        await recognitionHub.verifyThePageIsLoaded();
        await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'attached' });
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) + 1);
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit and add one more recipient in the post', async () => {
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        const rewardPoints = 1;
        const rewardPointsText =
          (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
        await giveRecognitionModal.selectTheUserForRecognition('1');
        await expect(giveRecognitionModal.doneButton).toBeEnabled();
        await giveRecognitionModal.doneButton.click({ force: true });
        const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
        await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
        await recognitionHub.page.reload();
        await recognitionHub.verifyThePageIsLoaded();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) - 2);
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      let availablePoints: string;

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          getRewardTenantConfigFromCache().endUserName,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit and Remove points', async () => {
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
        await giveRecognitionModal.giftingToggle.uncheck();
        await expect(giveRecognitionModal.doneButton).toBeEnabled();
        await giveRecognitionModal.doneButton.click({ force: true });
        const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
        await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
        await recognitionHub.page.reload();
        await recognitionHub.verifyThePageIsLoaded();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) + 1);
        const rewardPointsText = '1';
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          false,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Validate the new Entry and last entry in the Downloaded CSV file', async () => {
        const manageRecognitionPage = new ManageRewardsOverviewPage(recognitionHub.page);
        // Validate the new Entry in the Downloaded CSV file:
        await manageRecognitionPage.loadPage();
        // ✅ Trigger and capture download
        const [download] = await Promise.all([
          manageRecognitionPage.page.waitForEvent('download'),
          manageRecognitionPage.clickOnElement(manageRecognitionPage.activityTableDownloadCSVButton, {
            stepInfo: 'Clicking on Download CSV button',
          }),
        ]);

        // ✅ Save in downloads folder
        const csvFilePath = path.resolve('./downloads', download.suggestedFilename());
        await download.saveAs(csvFilePath);

        // ✅ Validate last row column value
        const validationResult = await CSVUtils.validateRowValue('last', 14, 'REJECTED', csvFilePath);
        expect(validationResult.isMatch, `Expected "REJECTED" but got "${validationResult.actualValue}"`).toBeTruthy();
        fs.unlinkSync(csvFilePath);
      });
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
      const rewardOptionIndex = 3;
      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        const rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          getRewardTenantConfigFromCache().endUserName,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) + 6);
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit', async () => {
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.verifyThePageIsLoaded();
        const availablePoints = await recognitionHub.pointsToGive.textContent();
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
        const rewardPoints = 1;
        const rewardPointsText =
          (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
        if (!(await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
          await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
          await expect(giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1)).toBeChecked();
        }
        await giveRecognitionModal.doneButton.click({ force: true });
        const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
        await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
        await recognitionHub.page.reload();
        await recognitionHub.verifyThePageIsLoaded();
        await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'attached' });
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) + 2);
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      let availablePoints: string;

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          getRewardTenantConfigFromCache().endUserName,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) + 6);
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit', async () => {
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
        await LoginHelper.loginWithPassword(appManagerFixture.page, {
          email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
          password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
        });
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.verifyThePageIsLoaded();
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
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
        await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'attached' });
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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
      const rewardOptionIndex = 3;
      let rewardOptionText: string;

      await test.step('Navigate to Recognition Hub and Click on Give recognition Modal', async () => {
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
        await LoginHelper.loginWithPassword(appManagerFixture.page, {
          email: getRewardTenantConfigFromCache().endUserEmail!,
          password: getRewardTenantConfigFromCache().endUserPassword!,
        });
      });

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        await recognitionHub.navigateToRecognitionHub();
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          getRewardTenantConfigFromCache().endUserName,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit', async () => {
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
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
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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

      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
        const recognitionGiverName = getRewardTenantConfigFromCache().appManagerName;
        await manageRecognitionPage.loadPage();
        await expect(manageRecognitionPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
        const rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(
          recognitionGiverName!
        );
        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
        await giveRecognitionModal.closeButton.click();
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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

      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
        await LoginHelper.loginWithPassword(appManagerFixture.page, {
          email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
          password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
        });
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
        const recognitionGiverName = getRewardTenantConfigFromCache().appManagerName;
        await manageRecognitionPage.loadPage();
        await expect(manageRecognitionPage.activityPanelTableRows.last()).toBeVisible();
        const rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(
          recognitionGiverName!
        );
        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
        await giveRecognitionModal.closeButton.click({ force: true });
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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

      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
        const recognitionGiverName = getRewardTenantConfigFromCache().appManagerName;
        await manageRecognitionPage.loadPage();
        await manageRecognitionPage.verifyThePageIsLoaded();
        await expect(manageRecognitionPage.activityPanelTableRows.last()).toBeVisible();
        const rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(
          recognitionGiverName!
        );
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
        await giveRecognitionModal.closeButton.click({ force: true });
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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

      let rewardPointsText: string;
      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
        await LoginHelper.loginWithPassword(appManagerFixture.page, {
          email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
          password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
        });
        const recognitionGiverName = getRewardTenantConfigFromCache().endUserName;
        await manageRecognitionPage.loadPage();
        await manageRecognitionPage.verifyThePageIsLoaded();
        await expect(manageRecognitionPage.activityPanelTableRows.last()).toBeVisible();
        rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(recognitionGiverName!);
      });
      await test.step('Navigate to the Recognition Post, Login with Standard User and validate Can not edit Reward point', async () => {
        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
        const currentUrl = recognitionHub.page.url();
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
        await LoginHelper.loginWithPassword(appManagerFixture.page, {
          email: getRewardTenantConfigFromCache().endUserEmail!,
          password: getRewardTenantConfigFromCache().endUserPassword!,
        });
        await recognitionHub.page.goto(currentUrl);
        await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'visible', timeout: 25000 });
      });
      await test.step('Edit the Recognition and validate', async () => {
        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
        await giveRecognitionModal.closeButton.click();
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardPointsText,
          'Only visible to recipients, their managers and app administrators'
        );
      });
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
      let rewardOptionText: string;
      const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          getRewardTenantConfigFromCache().endUserName,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRewardTenantConfigFromCache().recognitionManagerEmail!,
        password: getRewardTenantConfigFromCache().recognitionManagerPassword!,
      });
      await recognitionHub.page.waitForTimeout(5000);

      await test.step('Validate the new Entry in the Downloaded CSV file:', async () => {
        await manageRecognitionPage.loadPage();
        // ✅ Trigger and capture download
        const [download] = await Promise.all([
          manageRecognitionPage.page.waitForEvent('download', { timeout: 25000 }),
          manageRecognitionPage.clickOnElement(manageRecognitionPage.activityTableDownloadCSVButton, {
            stepInfo: 'Clicking on Download CSV button',
          }),
        ]);

        // ✅ Save in downloads folder
        const csvFilePath = path.resolve('./downloads', download.suggestedFilename());
        await download.saveAs(csvFilePath);

        // ✅ Validate last row column value
        const validationResult = await CSVUtils.validateRowValue('last', 14, 'PENDING', csvFilePath);
        expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();
        fs.unlinkSync(csvFilePath);
      });

      await test.step('Edit the points for the last given Recognition post', async () => {
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
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
      });

      await test.step('Validate the new Entry and last entry in the Downloaded CSV file', async () => {
        // Validate the new Entry in the Downloaded CSV file:
        await manageRecognitionPage.loadPage();
        // ✅ Trigger and capture download
        const [download] = await Promise.all([
          manageRecognitionPage.page.waitForEvent('download'),
          manageRecognitionPage.clickOnElement(manageRecognitionPage.activityTableDownloadCSVButton, {
            stepInfo: 'Clicking on Download CSV button',
          }),
        ]);

        // ✅ Save in downloads folder
        const csvFilePath = path.resolve('./downloads', download.suggestedFilename());
        await download.saveAs(csvFilePath);

        // ✅ Validate last row column value
        let validationResult = await CSVUtils.validateRowValue(1, 14, 'REJECTED', csvFilePath);
        expect(validationResult.isMatch, `Expected "REJECTED" but got "${validationResult.actualValue}"`).toBeTruthy();
        validationResult = await CSVUtils.validateRowValue('last', 14, 'PENDING', csvFilePath);
        expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();
        fs.unlinkSync(csvFilePath);
      });
    }
  );
});
