import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
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

    test.beforeEach('Setup test environment', async ({ appManagerApiContext }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      /** await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */

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
      'verify that User gets notified when it is getting mentioned in the reply of the comment of any post',
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
        createdPostText = feedTestData.text.length > 25 ? feedTestData.text.substring(0, 25) : feedTestData.text;

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

    test(
      'verify that User gets notified when it is getting mentioned in the reply of the comment of any content',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-30411'],
      },
      async ({
        appManagerFixture,
        standardUserFixture,
        siteManagerFixture,
        standardUserApiContext,
        siteManagerApiContext,
      }) => {
        tagTest(test.info(), {
          description:
            'Verify that User gets notified when it is getting mentioned in the reply of the comment of any content',
          zephyrTestId: 'CONT-30411',
          storyId: 'CONT-30411',
        });

        // Get user information for mentions
        const identityManagementHelper = new IdentityManagementHelper(
          appManagerFixture.apiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );

        const [siteManagerData] = await Promise.all([
          identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
        ]);
        const user3Info = { userId: siteManagerData.userId, fullName: siteManagerData.fullName };

        // Step 1: When Login as "User1" (appManager) - already logged in via fixture
        // Step 2: And Create a content on any accessible sites
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        const siteId = siteDetails.siteId;

        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'knowledge',
          },
          options: {
            pageName: TestDataGenerator.generateRandomText('Test Page', 2),
            contentDescription: 'Test page for comment reply mention notification',
            waitForSearchIndex: false,
          },
        });
        const contentId = pageInfo.contentId;
        const contentType = 'page';

        // Step 3: And Create a comment post on the content
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          contentId: contentId,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
        createdPostId = feedResponse.result.feedId;
        createdPostText = feedTestData.text;
        console.log(`Created feed post on content via API: ${createdPostId} with text: "${createdPostText}"`);

        const contentPreviewPage = new ContentPreviewPage(standardUserFixture.page, siteId, contentId, contentType);
        await contentPreviewPage.loadPage({ stepInfo: 'User2: Load content preview page' });
        await contentPreviewPage.assertions.waitForPostToBeVisible(createdPostText);
        const endUserReplyText = TestDataGenerator.generateRandomText('Reply', 1, false);
        const replyText = await contentPreviewPage.actions.addReplyToComment(
          endUserReplyText,
          siteManagerInfo.fullName,
          createdPostId
        );
        await siteManagerFixture.homePage.loadPage();
        const notificationComponentSiteManager = await siteManagerFixture.navigationHelper.clickOnBellIcon({
          stepInfo: 'Site Manager clicking on bell icon to view notifications',
        });
        const activityNotificationPage = await notificationComponentSiteManager.actions.clickOnViewAllNotifications();
        const expectedNotificationMessage = `${endUserInfo.fullName} mentioned you "${replyText}"`;
        await activityNotificationPage.assertions.verifyNotificationExists(expectedNotificationMessage);
      }
    );
  }
);
