import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { TestDbScenarios } from '@rewards/utils/testDatabaseHelper';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';

test.describe('recognition hub', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  let tenantCode: string;

  test.beforeEach(async ({ appManagerFixture }) => {
    const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
    await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();

    // Get tenant code
    tenantCode = await appManagerFixture.page.evaluate(() => {
      return (window as any).Simpplr?.Settings?.accountId;
    });
  });

  test(
    '[RC-2717] Validate adding the points pill to the recognition post',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate adding the points pill to the recognition post',
        zephyrTestId: 'RC-2717',
        storyId: 'RC-2717',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const rewardOptionIndex = 3;

      // Visit the Recognition Hub and give one recognition
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      const rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
        0,
        process.env.STANDARD_USER_FULL_NAME,
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

      // Login with the standard user and check the recognition post with points
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: process.env.STANDARD_USER_USERNAME!,
        password: process.env.STANDARD_USER_PASSWORD!,
      });
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardOptionText,
        'Only visible to you, your manager and app administrators'
      );

      // Login with the recognition user and check the recognition post with points
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: process.env.RECOGNITION_USER_USERNAME!,
        password: process.env.RECOGNITION_USER_PASSWORD!,
      });
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardOptionText,
        'Only visible to you, your manager and app administrators'
      );
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );

  test(
    '[RC-3327] Validate if "gift points" toggle button is disabled on recognition modal when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_DB_CASES, REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE_REFRESH, TestPriority.P2],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate if "gift points" toggle button is disabled on recognition modal when Allowances are refreshing',
        zephyrTestId: 'RC-3327',
        storyId: 'RC-3327',
      });
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();

      // Set distribution allowance as failed using test helper
      await TestDbScenarios.setupAllowanceRefresh(tenantCode);

      await recognitionHub.reloadPage();
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnGiveRecognition();
      await recognitionHub.checkTheGiftingOptionsAre(false);

      // Set distribution allowance as success using test helper
      await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
    }
  );

  test(
    "[RC-3328] Verify if user's point(points to give) balance is 0 when allowances are refreshing",
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE_REFRESH, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: "Verify if user's point(points to give) balance is 0 when allowances are refreshing",
        zephyrTestId: 'RC-3328',
        storyId: 'RC-3328',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);

      // Enable the distribution using test helper
      await TestDbScenarios.setupAllowanceRefresh(tenantCode);

      // Mock the Reward config API and enable the Distributing allowance
      await recognitionHub.visitRecognitionHub();

      // Validate the Gift points toggle button is disabled
      await recognitionHub.checkThePointsToGive(0);

      // Disable the distribution
      await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
    }
  );

  test(
    '[RC-3417] Verify the Gift points toggle button is disabled when Allowances are refreshing.',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_DB_CASES, REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE_REFRESH, TestPriority.P2],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify the Gift points toggle button is disabled when Allowances are refreshing.',
        zephyrTestId: 'RC-3417',
        storyId: 'RC-3417',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);

      // Enable the distribution using test helper
      await TestDbScenarios.setupAllowanceRefresh(tenantCode);

      // Mock the Reward config API and enable the Distributing allowance
      await appManagerFixture.page.reload();
      await recognitionHub.visitRecognitionHub();

      // Click on Give recognition button
      await recognitionHub.clickOnGiveRecognition();

      // Scroll to the 'Gift points' toggle button and check tooltip
      await recognitionHub.checkTheGiftingOptionsAre(false);

      // Disable the distribution
      await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
    }
  );

  test(
    '[RC-3326] Validate if user is able to Delete recognition with points rollback when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE_REFRESH, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate if user is able to Delete recognition with points rollback when Allowances are refreshing',
        zephyrTestId: 'RC-3326',
        storyId: 'RC-3326',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const recognizedUser = process.env.ZEUS_STANDARD_FULLNAME;

      // Disable the distribution
      await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);

      // Visit the Recognition Hub and give one recognition
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser || '');
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition('1');
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      await giveRecognitionModal.giftThePoints(1);
      await giveRecognitionModal.recognizeButton.click({ force: true });

      const shareModal = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(shareModal.container)) {
        await shareModal.skipButton.click();
        await expect(shareModal.container).not.toBeVisible();
      }

      // Enable the distribution
      await TestDbScenarios.setupAllowanceRefresh(tenantCode);

      // Validate the Delete recognition can not roll back the points
      await appManagerFixture.page.reload();
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnTheFirstPostMoreOption('Delete');

      // Validate the Delete recognition and revoke points is disabled in the dialog box
      await recognitionHub.deleteRecognitionDialogBoxContainer.waitFor({ state: 'visible' });
      await expect(recognitionHub.deleteRecognitionDialogBoxTitle).toHaveText('Delete recognition');
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).toBeDisabled();
      await recognitionHub.deleteRecognitionDialogBoxCloseButton.click({ force: true });
      await expect(recognitionHub.deleteRecognitionDialogBoxContainer).not.toBeVisible();

      // Disable the distribution
      await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
    }
  );

  test(
    '[RC-3099] Validate rewards points are not shown on posts when rewards is disabled.',
    {
      tag: [
        REWARD_FEATURE_TAGS.RECOGNITION_POINT_LABELING,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate rewards points are not shown on posts when rewards is disabled.',
        zephyrTestId: 'RC-3099',
        storyId: 'RC-3099',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const rewardOptionIndex = 3;

      // Visit the Recognition Hub and give one recognition
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      const rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
        0,
        process.env.ZEUS_RECOGNITION_FULLNAME,
        'Test Message' + Math.floor(Math.random() * 1000),
        rewardOptionIndex
      );

      // Validate the Peer award outer ring, reward point pill, tooltip icon
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardOptionText,
        'Only visible to recipients, their managers and app administrators'
      );

      // Disable the Rewards and Check the points are not visible
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.disableTheRewards();
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        false,
        rewardOptionText,
        'Only visible to recipients, their managers and app administrators'
      );

      // Enable the Rewards again
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
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
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate Points refreshing banner should not be shown on the delete recognition modal if grace period is over',
        zephyrTestId: 'RC-3223',
        storyId: 'RC-3223',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const recognitionGiverName: string = process.env[`APP_MANAGER_FULL_NAME`]!;
      await manageRewardsOverviewPage.loadPage();
      await expect(manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
      const rewardPointsText =
        await manageRewardsOverviewPage.openTheRecognitionCreatedBefore24Hrs(recognitionGiverName);
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to recipients, their managers and app administrators'
      );

      // Click on the Delete option in More Menu and validate revoke point is disabled
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
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser || '');
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition('1');
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      const rewardPointsTextNew = await giveRecognitionModal.giftThePoints(1);
      await giveRecognitionModal.recognizeButton.click({ force: true });

      const dialogBox = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsTextNew,
        'Only visible to you, your manager and app administrators'
      );

      // Validate the Delete recognition and revoke points is enabled in the dialog box
      await recognitionHub.clickOnTheFirstPostMoreOption('Delete');
      await recognitionHub.deleteRecognitionDialogBoxContainer.waitFor({ state: 'visible' });
      await expect(recognitionHub.deleteRecognitionDialogBoxTitle).toHaveText('Delete recognition');
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).toBeVisible();
      await expect(recognitionHub.deleteRecognitionOnly).toBeVisible();
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).toBeEnabled();
      await recognitionHub.deleteRecognitionDialogBoxCloseButton.click({ force: true });
      await expect(recognitionHub.deleteRecognitionDialogBoxContainer).not.toBeVisible();
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );
});
