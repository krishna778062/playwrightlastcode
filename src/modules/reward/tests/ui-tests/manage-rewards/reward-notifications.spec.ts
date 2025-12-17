import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { UserProfilePage } from '@rewards-pages/user-profile/user-profile-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('manage Notifications', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.loadPageWithHarness();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3607] Validate new notification settings of rewards for Email setting',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_NOTIFICATIONS, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate new notification settings of rewards for Email setting',
        zephyrTestId: 'RC-3607',
        storyId: 'RC-3607',
      });

      const userProfilePage = new UserProfilePage(appManagerFixture.page);
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await userProfilePage.navigateToCurrentUserProfileNotificationSetting('email');
      await userProfilePage.setTheNotificationSettingsForRecognition(false);
      await expect(userProfilePage.notificationSettingSaveButton).toBeEnabled();
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await userProfilePage.setTheNotificationSettingsForRecognition(true);
      await expect(userProfilePage.notificationSettingSaveButton).toBeEnabled();
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
    }
  );

  test(
    '[RC-3609] Validate new notification settings of rewards for Browser setting',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_NOTIFICATIONS, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate new notification settings of rewards for Browser setting',
        zephyrTestId: 'RC-3609',
        storyId: 'RC-3609',
      });

      const userProfilePage = new UserProfilePage(appManagerFixture.page);
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await userProfilePage.navigateToCurrentUserProfileNotificationSetting('browser');
      await userProfilePage.setTheNotificationSettingsForRecognition(false);
      await userProfilePage.setTheNotificationSettingsForRewards(false);
      await expect(userProfilePage.notificationSettingSaveButton).toBeEnabled();
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await userProfilePage.setTheNotificationSettingsForRecognition(true);
      await userProfilePage.setTheNotificationSettingsForRewards(true);
      await expect(userProfilePage.notificationSettingSaveButton).toBeEnabled();
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
    }
  );

  test(
    '[RC-3610] Validate new notification settings of rewards for Mobile',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_NOTIFICATIONS, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate new notification settings of rewards for Mobile',
        zephyrTestId: 'RC-3610',
        storyId: 'RC-3610',
      });

      const userProfilePage = new UserProfilePage(appManagerFixture.page);
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await userProfilePage.navigateToCurrentUserProfileNotificationSetting('mobile');
      await userProfilePage.setTheNotificationSettingsForRewards(false);
      await expect(userProfilePage.notificationSettingSaveButton).toBeEnabled();
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await userProfilePage.setTheNotificationSettingsForRewards(true);
      await expect(userProfilePage.notificationSettingSaveButton).toBeEnabled();
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
    }
  );
});
