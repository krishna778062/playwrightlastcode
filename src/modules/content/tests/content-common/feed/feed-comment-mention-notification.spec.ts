import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getContentConfigFromCache } from '../../../config/contentConfig';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

test.describe(
  '@FeedCommentMentionNotification - Feed Comment Mention Notification Tests',
  {
    tag: [ContentTestSuite.FEED_COMMENT_MENTION_NOTIFICATION],
  },
  () => {
    let createdPostText: string;
    let createdPostId: string;
    let siteManagerInfo: { userId: string; fullName: string };
    let endUserInfo: { userId: string; fullName: string };

    test.beforeEach('Setup test environment', async ({ appManagerApiContext, appManagerFixture }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

      // Get user information for mentions (optimized single API calls)
      const identityManagementHelper = new IdentityManagementHelper(
        appManagerApiContext,
        getContentConfigFromCache().tenant.apiBaseUrl
      );

      const [endUserData, siteManagerData] = await Promise.all([
        identityManagementHelper.getUserInfoByEmail(users.endUser.email),
        identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
      ]);

      endUserInfo = { userId: endUserData.userId, fullName: endUserData.fullName };
      siteManagerInfo = { userId: siteManagerData.userId, fullName: siteManagerData.fullName };
    });

    test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
      if (createdPostId) {
        await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        createdPostId = '';
      }
    });

    test(
      'Verify that User gets notified when it is getting mentioned in the reply of the comment of any post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-30438'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserApiContext }) => {
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
        createdPostText = feedTestData.text;

        // Create feed using API (more reliable than UI)
        const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);

        createdPostId = feedResponse.result.feedId;
        console.log(`Created feed post via API: ${createdPostId} with text: "${createdPostText}"`);

        const replyData = TestDataGenerator.generateReply({
          userId: siteManagerInfo.userId,
          userName: siteManagerInfo.fullName,
        });

        // Add reply via API
        const feedManagementService = new FeedManagementService(
          standardUserApiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );
        await feedManagementService.addComment(createdPostId, replyData);
        console.log(`Added reply via API with mention: "${replyData.replyText}"`);

        //SiteManager clicking on bell icon to view notifications
        await siteManagerFixture.homePage.verifyThePageIsLoaded();
        const notificationComponentSiteManager = await siteManagerFixture.navigationHelper.clickOnBellIcon({
          stepInfo: 'Application Manager clicking on bell icon to view notifications',
        });
        const activityNotificationPage = await notificationComponentSiteManager.actions.clickOnViewAllNotifications();
        // Verify notification message for mention in reply
        const expectedNotificationMessage = `${endUserInfo.fullName} mentioned you "${replyData.replyText}"`;
        await activityNotificationPage.assertions.verifyNotificationExists(expectedNotificationMessage);
      }
    );
  }
);
