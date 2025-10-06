import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';
import { DialogBox } from '@modules/reward/components/common/dialog-box';
import { Notifications } from '@modules/reward/components/common/notifications';
import { GiveRecognitionDialogBox } from '@modules/reward/components/recognition/give-recognition-dialog-box';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';

test.describe('Recognition post notification', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const recognitionHub = new RecognitionHubPage(appManagerPage);
    await recognitionHub.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-2619] Validate system notifications on rewards and recognition',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async ({ appManagerPage, recoManagerPage, standardUserPage }) => {
      tagTest(test.info(), {
        description: 'Validate system notifications on rewards and recognition',
        zephyrTestId: 'RC-2619',
        storyId: 'RC-2619',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const recognizedUser = process.env.ZEUS_STANDARD_FULLNAME;

      // Visit the Recognition Hub and give one recognition
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
      if (await dialogBox.container.isVisible()) {
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
      await LoginHelper.loginWithPassword(recoManagerPage, {
        email: process.env.ZEUS_RECOGNITION_USER_USERNAME!,
        password: process.env.ZEUS_RECOGNITION_USER_PASSWORD!,
      });

      // Validate the Recognition with points Notification and redirection to post
      const notifications = new Notifications(recoManagerPage);
      await notifications.siteHeader.waitFor({ state: 'attached' });
      await recoManagerPage.waitForTimeout(5000);
      await notifications.navigateToRecentActivityNotifications();
      const firstNotificationText = await notifications.getNotificationText();
      expect(firstNotificationText).toContain(
        `${process.env.ZEUS_ADMIN_FULLNAME} recognized you for "${recognitionAward}" and gifted you ${rewardPointsText} point`
      );
      await notifications.notificationListItem.first().click();

      const recognitionHubRecoManager = new RecognitionHubPage(recoManagerPage);
      await recognitionHubRecoManager.rewardRecognitionFirstPost.waitFor({ state: 'visible' });
      const countOfPost = await recognitionHubRecoManager.rewardRecognitionFirstPost.count();
      expect(countOfPost).toBeLessThan(2);
      await recognitionHubRecoManager.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );

      // Login with the recognition user and check notifications
      await LoginHelper.logoutByNavigatingToLogoutPage(recoManagerPage);
      await LoginHelper.loginWithPassword(standardUserPage, {
        email: process.env.ZEUS_RECOGNITION_USER_USERNAME!,
        password: process.env.ZEUS_RECOGNITION_USER_PASSWORD!,
      });

      const notificationsStandard = new Notifications(standardUserPage);
      await notificationsStandard.siteHeader.waitFor({ state: 'attached' });
      await standardUserPage.waitForTimeout(5000);
      await notificationsStandard.navigateToRecentActivityNotifications();
      const recognitionManagerNotification = await notificationsStandard.getNotificationText();
      expect(recognitionManagerNotification).toContain(
        `${process.env.ZEUS_STANDARD_FULLNAME} was recognized for "${recognitionAward}" and gifted ${rewardPointsText} point`
      );
      await notificationsStandard.notificationListItem.first().click();

      const recognitionHubStandard = new RecognitionHubPage(standardUserPage);
      await recognitionHubStandard.rewardRecognitionFirstPost.waitFor({ state: 'visible' });
      const postCount = await recognitionHubStandard.rewardRecognitionFirstPost.count();
      expect(postCount).toBeLessThan(2);
      await recognitionHubStandard.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );
    }
  );
});
