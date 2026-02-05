import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { UserProfilePage } from '@rewards-pages/user-profile/user-profile-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('manage Notifications', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test(
    'RC-3607 Validate new notification settings of rewards for Email setting',
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
      await userProfilePage.navigateToCurrentUserProfileNotificationSetting('email');
      const recognitionChanged = await userProfilePage.setTheNotificationSettingsForRecognition(false);
      if (recognitionChanged) {
        await userProfilePage.verifier.verifyTheElementIsEnabled(userProfilePage.notificationSettingSaveButton);
        await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
          stepInfo: 'Saving notification settings',
        });
        await userProfilePage.dismissTheToastMessage({ toastText: 'Saved changes successfully' });
      } else {
        await userProfilePage.verifier.verifyTheElementIsDisabled(userProfilePage.notificationSettingSaveButton);
      }

      await userProfilePage.setTheNotificationSettingsForRecognition(true);
      await userProfilePage.verifier.verifyTheElementIsEnabled(userProfilePage.notificationSettingSaveButton);
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await userProfilePage.dismissTheToastMessage({ toastText: 'Saved changes successfully' });
    }
  );

  test(
    'RC-3609 Validate new notification settings of rewards for Browser setting',
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
      await userProfilePage.navigateToCurrentUserProfileNotificationSetting('browser');
      const recognitionChanged = await userProfilePage.setTheNotificationSettingsForRecognition(false);
      const rewardsChanged = await userProfilePage.setTheNotificationSettingsForRewards(false);
      if (recognitionChanged || rewardsChanged) {
        await userProfilePage.verifier.verifyTheElementIsEnabled(userProfilePage.notificationSettingSaveButton);
        await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
          stepInfo: 'Saving notification settings',
        });
        await userProfilePage.dismissTheToastMessage({ toastText: 'Saved changes successfully' });
      } else {
        await userProfilePage.verifier.verifyTheElementIsDisabled(userProfilePage.notificationSettingSaveButton);
      }
      await userProfilePage.setTheNotificationSettingsForRecognition(true);
      await userProfilePage.setTheNotificationSettingsForRewards(true);
      await userProfilePage.verifier.verifyTheElementIsEnabled(userProfilePage.notificationSettingSaveButton);
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await userProfilePage.dismissTheToastMessage({ toastText: 'Saved changes successfully' });
    }
  );

  test(
    'RC-3610 Validate new notification settings of rewards for Mobile',
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
      await userProfilePage.navigateToCurrentUserProfileNotificationSetting('mobile');
      const recognitionChanged = await userProfilePage.setTheNotificationSettingsForRecognition(false);
      const rewardsChanged = await userProfilePage.setTheNotificationSettingsForRewards(false);
      if (recognitionChanged || rewardsChanged) {
        await userProfilePage.verifier.verifyTheElementIsEnabled(userProfilePage.notificationSettingSaveButton);
        await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
          stepInfo: 'Saving notification settings',
        });
        await userProfilePage.dismissTheToastMessage({ toastText: 'Saved changes successfully' });
      } else {
        await userProfilePage.verifier.verifyTheElementIsDisabled(userProfilePage.notificationSettingSaveButton);
      }
      await userProfilePage.setTheNotificationSettingsForRecognition(true);
      await userProfilePage.setTheNotificationSettingsForRewards(true);
      await userProfilePage.verifier.verifyTheElementIsEnabled(userProfilePage.notificationSettingSaveButton);
      await userProfilePage.clickOnElement(userProfilePage.notificationSettingSaveButton, {
        stepInfo: 'Saving notification settings',
      });
      await userProfilePage.dismissTheToastMessage({ toastText: 'Saved changes successfully' });
    }
  );
});
