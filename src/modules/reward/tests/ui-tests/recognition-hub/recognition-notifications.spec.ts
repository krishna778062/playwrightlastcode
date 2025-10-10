import { expect } from '@playwright/test';
import { DialogBox } from '@rewards/components/common/dialog-box';
import { Notifications } from '@rewards/components/common/notifications';
import { GiveRecognitionDialogBox } from '@rewards/components/recognition/give-recognition-dialog-box';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { RecognitionHubPage } from '@rewards/pages/recognition-hub/recognition-hub-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';

test.describe('recognition post notification', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  test(
    '[RC-2619] Validate system notifications on rewards and recognition',
    {
      tag: [REWARD_FEATURE_TAGS.RECOGNITION_NOTIFICATION_CHECK, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate system notifications on rewards and recognition',
        zephyrTestId: 'RC-2619',
        storyId: 'RC-2619',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();
      const recognizedUser = process.env.STANDARD_USER_FULL_NAME!;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();

      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser);
      const recognitionAward = await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      const rewardPointsText = await giveRecognitionModal.giftThePoints(1);
      await giveRecognitionModal.recognizeButton.click({ force: true });

      const dialogBox = new DialogBox(appManagerFixture.page);
      if (
        await recognitionHub.verifier.verifyTheElementIsVisible(dialogBox.container, {
          timeout: 3000,
          assertionMessage: ' Container is not visible',
        })
      ) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );

      // Login with the standard user and check the recognition post with points
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: process.env.STANDARD_USER_USERNAME!,
        password: process.env.STANDARD_USER_PASSWORD!,
      });

      // Validate the Recognition with points Notification and redirection to post
      let notifications = new Notifications(appManagerFixture.page);
      await notifications.siteHeader.waitFor({ state: 'attached' });
      await notifications.navigateToRecentActivityNotifications();
      const firstNotificationText = await notifications.getNotificationText();
      expect(firstNotificationText).toContain(
        `${process.env.APP_MANAGER_FULL_NAME} recognized you for "${recognitionAward}" and gifted you ${rewardPointsText} point`
      );
      await notifications.notificationListItem.first().click();

      const recognitionHubStandard = new RecognitionHubPage(appManagerFixture.page);
      await recognitionHubStandard.verifier.verifyTheElementIsVisible(
        recognitionHubStandard.rewardRecognitionFirstPost
      );
      const countOfPost = await recognitionHubStandard.rewardRecognitionFirstPost.count();
      expect(countOfPost).toBeLessThan(2);
      await recognitionHubStandard.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );

      // Login with the standard user and check the recognition post with points
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: process.env.RECOGNITION_USER_USERNAME!,
        password: process.env.RECOGNITION_USER_PASSWORD!,
      });

      notifications = new Notifications(appManagerFixture.page);
      await notifications.siteHeader.waitFor({ state: 'attached' });
      await notifications.navigateToRecentActivityNotifications();
      const firstNotificationTextForRecognitionUser = await notifications.getNotificationText();
      expect(firstNotificationTextForRecognitionUser).toContain(
        `${recognizedUser} was recognized for "${recognitionAward}" and gifted ${rewardPointsText} point`
      );
      await notifications.notificationListItem.first().click();

      const recognitionHubRecoUser = new RecognitionHubPage(appManagerFixture.page);
      await recognitionHubRecoUser.verifier.verifyTheElementIsVisible(
        recognitionHubRecoUser.rewardRecognitionFirstPost
      );
      const countOfPosts = await recognitionHubRecoUser.rewardRecognitionFirstPost.count();
      expect(countOfPosts).toBeLessThan(2);
      await recognitionHubRecoUser.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );
      await recognitionHubRecoUser.deleteTheFirstRecognitionPost();
    }
  );
});
