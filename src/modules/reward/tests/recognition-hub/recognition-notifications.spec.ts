import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';
import { DialogBox } from '@modules/reward/components/common/dialog-box';
import { Notifications } from '@modules/reward/components/common/notifications';
import { GiveRecognitionDialogBox } from '@modules/reward/components/recognition/give-recognition-dialog-box';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';

test.describe('Recognition post notification', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  test(
    '[RC-2619] Validate system notifications on rewards and recognition',
    {
      tag: [REWARD_FEATURE_TAGS.RECOGNITION_NOTIFICATION_CHECK, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate system notifications on rewards and recognition',
        zephyrTestId: 'RC-2619',
        storyId: 'RC-2619',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();
      const recognizedUser = process.env.STANDARD_USER_FULL_NAME!;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();

      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser);
      const recognitionAward = await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      await giveRecognitionModal.enterTheRecognitionMessage('Test Message' + Math.floor(Math.random() * 1000));
      const rewardPointsText = await giveRecognitionModal.giftThePoints(1);
      await giveRecognitionModal.recognizeButton.click({ force: true });

      const dialogBox = new DialogBox(appManagerPage);
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
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: process.env.STANDARD_USER_USERNAME!,
        password: process.env.STANDARD_USER_PASSWORD!,
      });

      // Validate the Recognition with points Notification and redirection to post
      let notifications = new Notifications(appManagerPage);
      await notifications.siteHeader.waitFor({ state: 'attached' });
      await appManagerPage.waitForTimeout(5000);
      await notifications.navigateToRecentActivityNotifications();
      const firstNotificationText = await notifications.getNotificationText();
      expect(firstNotificationText).toContain(
        `${process.env.APP_MANAGER_FULL_NAME} recognized you for "${recognitionAward}" and gifted you ${rewardPointsText} point`
      );
      await notifications.notificationListItem.first().click();

      const recognitionHubStandard = new RecognitionHubPage(appManagerPage);
      await recognitionHubStandard.rewardRecognitionFirstPost.waitFor({ state: 'visible' });
      const countOfPost = await recognitionHubStandard.rewardRecognitionFirstPost.count();
      expect(countOfPost).toBeLessThan(2);
      await recognitionHubStandard.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );

      // Login with the standard user and check the recognition post with points
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: process.env.RECOGNITION_USER_USERNAME!,
        password: process.env.RECOGNITION_USER_PASSWORD!,
      });

      notifications = new Notifications(appManagerPage);
      await notifications.siteHeader.waitFor({ state: 'attached' });
      await appManagerPage.waitForTimeout(5000);
      await notifications.navigateToRecentActivityNotifications();
      const firstNotificationTextForRecognitionUser = await notifications.getNotificationText();
      expect(firstNotificationTextForRecognitionUser).toContain(
        `${recognizedUser} was recognized for "${recognitionAward}" and gifted ${rewardPointsText} point`
      );
      await notifications.notificationListItem.first().click();

      const recognitionHubRecoUser = new RecognitionHubPage(appManagerPage);
      await recognitionHubRecoUser.rewardRecognitionFirstPost.waitFor({ state: 'visible' });
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
