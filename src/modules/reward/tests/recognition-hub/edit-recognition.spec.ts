import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import fs from 'fs';
import path from 'path';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { CSVUtils } from '@core/utils/csvUtils';
import { tagTest } from '@core/utils/testDecorator';
import { GiveRecognitionDialogBox } from '@modules/reward/components/recognition/give-recognition-dialog-box';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsOverviewPage } from '@modules/reward/pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';

test.describe('Edit Recognition', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const recognitionHub = new RecognitionHubPage(appManagerPage);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify user can edit points within the 24hr pending period',
        zephyrTestId: 'RC-5348',
        storyId: 'RC-5348',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      let availablePoints: string;

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length <= 1) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          process.env.STANDARD_USER_FULL_NAME,
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
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
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
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        const rewardPoints = 1;
        const rewardPointsText =
          (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
        await giveRecognitionModal.selectTheUserForRecognition(1);
        await expect(giveRecognitionModal.doneButton).toBeEnabled();
        await giveRecognitionModal.doneButton.click({ force: true });
        const manageRecognition = new ManageRewardsOverviewPage(giveRecognitionModal.page);
        await manageRecognition.verifyToastMessageIsVisibleWithText('Recognition updated');
        await recognitionHub.page.reload();
        await recognitionHub.verifyThePageIsLoaded();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints) + 2).toBe(Number(availablePoints));
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify App manager can remove the given points within the 24hr pending period',
        zephyrTestId: 'RC-5704',
        storyId: 'RC-5704',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      let availablePoints: string;

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          process.env.STANDARD_USER_FULL_NAME,
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
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
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
        const csvUtils = new CSVUtils('./downloads');
        // ✅ Trigger and capture download
        const [download] = await Promise.all([
          manageRecognitionPage.page.waitForEvent('download'),
          manageRecognitionPage.clickOnElement(manageRecognitionPage.activityTableDownloadCSVButton, {
            stepInfo: 'Clicking on Download CSV button',
          }),
        ]);

        // ✅ Save in downloads folder
        await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));

        // ✅ Validate last row column value
        const validationResult = await csvUtils.validateRowValue('last', 14, 'REJECTED');
        expect(validationResult.isMatch, `Expected "REJECTED" but got "${validationResult.actualValue}"`).toBeTruthy();
        fs.unlinkSync(csvUtils.getLatestCSV());
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify app manager can edit points within the 24hr pending period for multiple recipient',
        zephyrTestId: 'RC-5350',
        storyId: 'RC-5350',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      let availablePoints: string;

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          process.env.STANDARD_USER_FULL_NAME,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        const newAvailablePoints = await recognitionHub.pointsToGive.textContent();
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) + 6);
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit', async () => {
        await recognitionHub.page.waitForTimeout(5000);
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        await recognitionHub.page.waitForTimeout(1000);
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        await giveRecognitionModal.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
        const rewardPoints = 1;
        const rewardPointsText =
          (await giveRecognitionModal.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent()) || '';
        if (!(await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
          await giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
          await expect(giveRecognitionModal.giftingOptionsContainerPill.nth(rewardPoints - 1)).toBeChecked();
        }
        await recognitionHub.page.waitForTimeout(2000);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify recognition manager can edit points within the 24hr pending period',
        zephyrTestId: 'RC-5351',
        storyId: 'RC-5351',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      let availablePoints: string;

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          process.env.STANDARD_USER_FULL_NAME,
          'Test Message' + Math.floor(Math.random() * 1000),
          rewardOptionIndex
        );
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
        availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        const newAvailablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
        expect(Number(newAvailablePoints)).toBe(Number(availablePoints) + 6);
        await recognitionHub.validateTheRewardElementsInRecognitionPost(
          true,
          rewardOptionText,
          'Only visible to recipients, their managers and app administrators'
        );
      });

      await test.step('Click on Edit', async () => {
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
        await LoginHelper.loginWithPassword(appManagerPage, {
          email: process.env.RECOGNITION_USER_USERNAME!,
          password: process.env.RECOGNITION_USER_PASSWORD!,
        });
        await recognitionHub.page.waitForTimeout(5000);
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'attached' });
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        await recognitionHub.page.waitForTimeout(1000);
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify user can edit points within the 24hr pending period',
        zephyrTestId: 'RC-5354',
        storyId: 'RC-5354',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;
      let rewardOptionText: string;

      await test.step('Navigate to Recognition Hub and Click on Give recognition Modal', async () => {
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
        await LoginHelper.loginWithPassword(appManagerPage, {
          email: process.env.STANDARD_USER_USERNAME!,
          password: process.env.STANDARD_USER_PASSWORD!,
        });
      });

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        await recognitionHub.navigateToRecognitionHub();
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          process.env.STANDARD_USER_FULL_NAME,
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
        await recognitionHub.page.waitForTimeout(1000);
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify app manager can not edit points after the 24hr pending period',
        zephyrTestId: 'RC-5349',
        storyId: 'RC-5349',
      });

      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerPage);
        const recognitionGiverName = process.env[`APP_MANAGER_FULL_NAME`];
        await manageRecognitionPage.loadPage();
        await expect(manageRecognitionPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
        const rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(
          recognitionGiverName!
        );
        const recognitionHub = new RecognitionHubPage(appManagerPage);
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify recognition manager can not edit points after 24hr period',
        zephyrTestId: 'RC-5353',
        storyId: 'RC-5353',
      });

      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
        await LoginHelper.loginWithPassword(appManagerPage, {
          email: process.env.RECOGNITION_USER_USERNAME!,
          password: process.env.RECOGNITION_USER_PASSWORD!,
        });
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerPage);
        const recognitionGiverName = process.env[`APP_MANAGER_FULL_NAME`];
        await manageRecognitionPage.loadPage();
        await expect(manageRecognitionPage.activityPanelTableRows.last()).toBeVisible();
        const rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(
          recognitionGiverName!
        );
        const recognitionHub = new RecognitionHubPage(appManagerPage);
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        await recognitionHub.page.waitForTimeout(1000);
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
        await recognitionHub.page.waitForTimeout(1000);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify App manager can not remove given points after the 24hr pending period',
        zephyrTestId: 'RC-5705',
        storyId: 'RC-5705',
      });

      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerPage);
        const recognitionHub = new RecognitionHubPage(appManagerPage);
        await recognitionHub.page.waitForTimeout(5000);
        const recognitionGiverName = process.env[`APP_MANAGER_FULL_NAME`];
        await manageRecognitionPage.loadPage();
        await expect(manageRecognitionPage.activityPanelTableRows.last()).toBeVisible();
        const rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(
          recognitionGiverName!
        );
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        await recognitionHub.page.waitForTimeout(1000);
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
        await recognitionHub.page.waitForTimeout(1000);
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify user can not edit points after the 24hr pending period',
        zephyrTestId: 'RC-5355',
        storyId: 'RC-5355',
      });

      await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
        const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerPage);
        let rewardPointsText: string;
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
        await LoginHelper.loginWithPassword(appManagerPage, {
          email: process.env.RECOGNITION_USER_USERNAME!,
          password: process.env.RECOGNITION_USER_PASSWORD!,
        });
        await test.step('Click on Edit for the Recognition post which is published 24 hrs earlier', async () => {
          const recognitionHub = new RecognitionHubPage(appManagerPage);
          await recognitionHub.page.waitForTimeout(5000);
          const recognitionGiverName = process.env[`STANDARD_USER_FULL_NAME`];
          await manageRecognitionPage.loadPage();
          await expect(manageRecognitionPage.activityPanelTableRows.last()).toBeVisible();
          rewardPointsText = await manageRecognitionPage.openTheRecognitionCreatedBefore24Hrs(recognitionGiverName!);
        });
        await test.step('Navigate to the Recognition Post, Login with Standard User and validate Can not edit Reward point', async () => {
          const recognitionHub = new RecognitionHubPage(appManagerPage);
          const currentUrl = recognitionHub.page.url();
          await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
          await LoginHelper.loginWithPassword(appManagerPage, {
            email: process.env.STANDARD_USER_USERNAME!,
            password: process.env.STANDARD_USER_PASSWORD!,
          });
          await recognitionHub.page.goto(currentUrl);
          await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'visible', timeout: 25000 });
        });
        await test.step('Edit the Recognition and validate', async () => {
          const recognitionHub = new RecognitionHubPage(appManagerPage);
          await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
          const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
          await expect(giveRecognitionModal.giftingOptionsContainerPill).not.toBeVisible();
          await giveRecognitionModal.closeButton.click();
          await recognitionHub.validateTheRewardElementsInRecognitionPost(
            true,
            rewardPointsText,
            'Only visible to recipients, their managers and app administrators'
          );
        });
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate status of transaction history when edit recognition with points within 24hr',
        zephyrTestId: 'RC-5629',
        storyId: 'RC-5629',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;
      let rewardOptionText: string;
      const manageRecognitionPage = new ManageRewardsOverviewPage(appManagerPage);

      await test.step('Visit the Recognition Hub and give one recognition', async () => {
        const existingOptions = await recognitionHub.visitRecognitionHub();
        if (existingOptions.length < 2) {
          await recognitionHub.setupTheMultipleGiftingOptions();
        }
        await recognitionHub.clickOnGiveRecognition();
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
        rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
          0,
          process.env.STANDARD_USER_FULL_NAME,
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

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: process.env.RECOGNITION_USER_USERNAME!,
        password: process.env.RECOGNITION_USER_PASSWORD!,
      });
      await recognitionHub.page.waitForTimeout(5000);
      const csvUtils = new CSVUtils('./downloads');

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
        await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));

        // ✅ Validate last row column value
        const validationResult = await csvUtils.validateRowValue('last', 14, 'PENDING');
        expect(validationResult.isMatch, `Expected "25" but got "${validationResult.actualValue}"`).toBeTruthy();
        fs.unlinkSync(csvUtils.getLatestCSV());
      });

      await test.step('Edit the points for the last given Recognition post', async () => {
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.clickOnTheFirstPostMoreOption('Edit');
        await recognitionHub.page.waitForTimeout(1000);
        const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
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
        await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));

        // ✅ Validate last row column value
        let validationResult = await csvUtils.validateRowValue(1, 14, 'REJECTED');
        expect(validationResult.isMatch, `Expected "REJECTED" but got "${validationResult.actualValue}"`).toBeTruthy();
        validationResult = await csvUtils.validateRowValue('last', 14, 'PENDING');
        expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();
        fs.unlinkSync(csvUtils.getLatestCSV());
      });
    }
  );
});
