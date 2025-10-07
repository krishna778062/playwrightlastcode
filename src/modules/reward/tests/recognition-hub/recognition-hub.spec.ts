import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getQuery } from '@core/utils/dbQuery';
import { executeQuery } from '@core/utils/dbUtils';
import { tagTest } from '@core/utils/testDecorator';
import { DialogBox } from '@modules/reward/components/common/dialog-box';
import { GiveRecognitionDialogBox } from '@modules/reward/components/recognition/give-recognition-dialog-box';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsOverviewPage } from '@modules/reward/pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';

test.describe('Recognition hub', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  let tenantCode: string;

  test.beforeEach(async ({ appManagerPage }) => {
    const recognitionHub = new RecognitionHubPage(appManagerPage);
    await recognitionHub.enableTheRewardsInAndPeerGiftingIfDisabled();

    // Get tenant code
    tenantCode = await appManagerPage.evaluate(() => {
      return (window as any).Simpplr?.Settings?.accountId;
    });
  });

  test(
    '[RC-2717] Validate adding the points pill to the recognition post',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate adding the points pill to the recognition post',
        zephyrTestId: 'RC-2717',
        storyId: 'RC-2717',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;

      // Visit the Recognition Hub and give one recognition
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      const rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
        0,
        process.env.ZEUS_RECOGNITION_FULLNAME,
        'Test Message' + Math.floor(Math.random() * 1000),
        rewardOptionIndex
      );

      // Validate for App Manager user
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardOptionText,
        'Only visible to recipients, their managers and app administrators'
      );

      // TODO: Add login functionality for multiple users when available
    }
  );

  test(
    '[RC-3327] Validate if "gift points" toggle button is disabled on recognition modal when Allowances are refreshing',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate if "gift points" toggle button is disabled on recognition modal when Allowances are refreshing',
        zephyrTestId: 'RC-3327',
        storyId: 'RC-3327',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);

      // Enable the distribution using DB
      const resultAsFailed = getQuery('setDistributionAllowanceAsFail');
      await executeQuery(resultAsFailed.replace('tenantCode', tenantCode));

      // Mock the Reward config API and enable the Distributing allowance
      await appManagerPage.reload();
      await recognitionHub.visitRecognitionHub();

      // Click on Give recognition button
      await recognitionHub.clickOnGiveRecognition();

      // Validate the Gift points toggle button is disabled
      await recognitionHub.checkTheGiftingOptionsAre(false);

      // Disable the distribution
      const resultAsSuccess = getQuery('setDistributionAllowanceAsSuccess');
      await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode));
    }
  );

  test(
    "[RC-3328] Verify if user's point(points to give) balance is 0 when allowances are refreshing",
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: "Verify if user's point(points to give) balance is 0 when allowances are refreshing",
        zephyrTestId: 'RC-3328',
        storyId: 'RC-3328',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);

      // Enable the distribution using DB
      const resultAsFailed = getQuery('setDistributionAllowanceAsFail');
      await executeQuery(resultAsFailed.replace('tenantCode', tenantCode));

      // Mock the Reward config API and enable the Distributing allowance
      await recognitionHub.visitRecognitionHub();

      // Validate the Gift points toggle button is disabled
      await recognitionHub.checkThePointsToGive(0);

      // Disable the distribution
      const resultAsSuccess = getQuery('setDistributionAllowanceAsSuccess');
      await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode));
    }
  );

  test(
    '[RC-3417] Verify the Gift points toggle button is disabled when Allowances are refreshing.',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify the Gift points toggle button is disabled when Allowances are refreshing.',
        zephyrTestId: 'RC-3417',
        storyId: 'RC-3417',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);

      // Enable the distribution using DB
      const resultAsFailed = getQuery('setDistributionAllowanceAsFail');
      await executeQuery(resultAsFailed.replace('tenantCode', tenantCode));

      // Mock the Reward config API and enable the Distributing allowance
      await appManagerPage.reload();
      await recognitionHub.visitRecognitionHub();

      // Click on Give recognition button
      await recognitionHub.clickOnGiveRecognition();

      // Scroll to the 'Gift points' toggle button and check tooltip
      await recognitionHub.checkTheGiftingOptionsAre(false);

      // Disable the distribution
      const resultAsSuccess = getQuery('setDistributionAllowanceAsSuccess');
      await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode));
    }
  );

  test(
    '[RC-3326] Validate if user is able to Delete recognition with points rollback when Allowances are refreshing',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate if user is able to Delete recognition with points rollback when Allowances are refreshing',
        zephyrTestId: 'RC-3326',
        storyId: 'RC-3326',
      });

      // TODO: Implement when RecognitionHubPage and GiveRecognitionDialogBox are available

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const recognizedUser = process.env.ZEUS_STANDARD_FULLNAME;

      // Disable the distribution
      const resultAsSuccess = getQuery('setDistributionAllowanceAsSuccess');
      await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode));

      // Visit the Recognition Hub and give one recognition
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      await giveRecognitionModal.giftThePoints(1);
      await giveRecognitionModal.recognizeButton.click({ force: true });

      const shareModal = new DialogBox(appManagerPage);
      if (await shareModal.container.isVisible()) {
        await shareModal.skipButton.click();
        await expect(shareModal.container).not.toBeVisible();
      }

      // Enable the distribution
      const resultAsFailed = getQuery('setDistributionAllowanceAsFail');
      await executeQuery(resultAsFailed.replace('tenantCode', tenantCode));

      // Validate the Delete recognition can not rollback the points
      await appManagerPage.reload();
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnTheFirstPostMoreOption('Delete');

      // Validate the Delete recognition and revoke points is disabled in dialog box
      await recognitionHub.deleteRecognitionDialogBoxContainer.waitFor({ state: 'visible' });
      await expect(recognitionHub.deleteRecognitionDialogBoxTitle).toHaveText('Delete recognition');
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).toBeDisabled();
      await recognitionHub.deleteRecognitionDialogBoxCloseButton.click({ force: true });
      await expect(recognitionHub.deleteRecognitionDialogBoxContainer).not.toBeVisible();

      // Disable the distribution
      await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode));
    }
  );

  test(
    '[RC-3099] Validate rewards points are not shown on posts when rewards is disabled.',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate rewards points are not shown on posts when rewards is disabled.',
        zephyrTestId: 'RC-3099',
        storyId: 'RC-3099',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerPage);
      const rewardOptionIndex = 3;

      // Visit the Recognition Hub and give one recognition
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      const rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
        0,
        process.env.ZEUS_RECOGNITION_FULLNAME,
        'Test Message' + Math.floor(Math.random() * 1000),
        rewardOptionIndex
      );

      // Validate the Peer award outer ring, reward point pill, tooltip icon
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardOptionText,
        'Only visible to recipients, their managers and app administrators'
      );

      // Disable the Rewards and Check the points are not visible
      await manageRewardsPage.loadPage();
      await manageRewardsPage.disableTheRewards();
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        false,
        rewardOptionText,
        'Only visible to recipients, their managers and app administrators'
      );

      // Enable the Rewards again
      await manageRewardsPage.loadPage();
      await manageRewardsPage.enableTheRewards();
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardOptionText,
        'Only visible to recipients, their managers and app administrators'
      );
    }
  );

  test(
    '[RC-3223] Validate Points refreshing banner should not be shown on the delete recognition modal if grace period is over',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate Points refreshing banner should not be shown on the delete recognition modal if grace period is over',
        zephyrTestId: 'RC-3223',
        storyId: 'RC-3223',
      });

      // TODO: Implement when RecognitionHubPage and ManageRewardsOverviewPage are available

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);

      // Open the Recognition post which is published 24 hrs earlier
      await appManagerPage.waitForTimeout(5000);
      const recognitionGiverName = process.env[`${process.env.PLATFORM}_STANDARD_FULLNAME`];
      await manageRewardsOverviewPage.loadPage();
      await expect(manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
      const rewardPointsText =
        await manageRewardsOverviewPage.openTheRecognitionCreatedBefore24Hrs(recognitionGiverName);
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to recipients, their managers and app administrators'
      );

      // Click on Delete option in More Menu and validate revoke point is disabled
      await recognitionHub.clickOnTheFirstPostMoreOption('Delete');
      await expect(recognitionHub.deleteRecognitionDialogBoxTitle).toHaveText('Delete recognition');
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).not.toBeVisible();
      await recognitionHub.deleteRecognitionDialogBoxCloseButton.click({ force: true });
      await expect(recognitionHub.deleteRecognitionDialogBoxContainer).not.toBeVisible();

      // Create One more Recognition and validate revoke points is enabled
      const recognizedUser = process.env.ZEUS_STANDARD_FULLNAME;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      const rewardPointsTextNew = await giveRecognitionModal.giftThePoints(1);
      await giveRecognitionModal.recognizeButton.click({ force: true });

      const dialogBox = new DialogBox(appManagerPage);
      if (await dialogBox.container.isVisible()) {
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsTextNew,
        'Only visible to you, your manager and app administrators'
      );

      // Validate the Delete recognition and revoke points is enabled in dialog box
      await recognitionHub.clickOnTheFirstPostMoreOption('Delete');
      await recognitionHub.deleteRecognitionDialogBoxContainer.waitFor({ state: 'visible' });
      await expect(recognitionHub.deleteRecognitionDialogBoxTitle).toHaveText('Delete recognition');
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).toBeVisible();
      await expect(recognitionHub.deleteRecognitionOnly).toBeVisible();
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).toBeEnabled();
      await recognitionHub.deleteRecognitionDialogBoxCloseButton.click({ force: true });
      await expect(recognitionHub.deleteRecognitionDialogBoxContainer).not.toBeVisible();
    }
  );
});
