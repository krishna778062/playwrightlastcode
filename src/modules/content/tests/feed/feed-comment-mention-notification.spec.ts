import { faker } from '@faker-js/faker';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FeedManagementService } from '@/src/core/api/services/FeedManagementService';
import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { NotificationComponent } from '@/src/modules/content/components/notificationComponent';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/pages/feedPage';

test.describe(
  '@FeedCommentMentionNotification - Feed Comment Mention Notification Tests',
  {
    tag: [ContentTestSuite.FEED_COMMENT_MENTION_NOTIFICATION],
  },
  () => {
    let createdPostText: string;
    let createdPostId: string;
    let commentText: string;
    let siteManagerFullName: string;
    let siteManagerId: string;
    let standardUserFullName: string;

    test.beforeEach('Setup test environment', async ({ appManagerApiClient }) => {
      // Get user full names for mentions
      const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);

      const [user2, user3, userId3] = await Promise.all([
        identityManagementHelper.getUserNameByEmail(users.endUser.email),
        identityManagementHelper.getUserNameByEmail(users.siteManager.email),
        identityManagementHelper.getUserIdByEmail(users.siteManager.email),
      ]);
      standardUserFullName = user2;
      siteManagerFullName = user3;
      siteManagerId = userId3;
    });

    test.afterEach('Cleanup created posts', async ({ feedManagementHelper }) => {
      if (createdPostId) {
        await feedManagementHelper.deleteFeed(createdPostId);
        createdPostId = '';
      }
    });

    test(
      'Verify that User gets notified when it is getting mentioned in the reply of the comment of any post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-30438'],
      },
      async ({ appManagerApiClient, standardUserApiClient, siteManagerHomePage, feedManagementHelper }) => {
        tagTest(test.info(), {
          description:
            'Verify that User gets notified when it is getting mentioned in the reply of the comment of any post',
          zephyrTestId: 'CONT-30438',
          storyId: 'CONT-30438',
        });

        // Generate feed test data
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
        createdPostText = feedTestData.text;

        // Create feed using API (more reliable than UI)
        const feedResponse = await feedManagementHelper.createFeed(feedTestData);

        createdPostId = feedResponse.result.feedId;
        console.log(`Created feed post via API: ${createdPostId} with text: "${createdPostText}"`);

        const replyData = TestDataGenerator.generateReply({
          userId: siteManagerId,
          userName: siteManagerFullName,
        });

        // Add reply via API
        const feedManagementService = new FeedManagementService(standardUserApiClient.context);
        await feedManagementService.addComment(createdPostId, replyData);
        console.log(`Added reply via API with mention: "${replyData.replyText}"`);

        await siteManagerHomePage.page.reload();

        //SiteManager clicking on bell icon to view notifications
        const notificationComponentSiteManager = await siteManagerHomePage.actions.clickOnBellIcon({
          stepInfo: 'Application Manager clicking on bell icon to view notifications',
        });

        const activityNotificationPage = await notificationComponentSiteManager.actions.clickOnViewAllNotifications();

        // Verify notification message for mention in reply
        const expectedNotificationMessage = `${standardUserFullName} mentioned you "${replyData.replyText}"`;

        siteManagerHomePage.page.pause();
        await activityNotificationPage.assertions.verifyNotificationExists(expectedNotificationMessage);
      }
    );
  }
);
