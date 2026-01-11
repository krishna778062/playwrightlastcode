import { SitePageTab } from '@content/constants/sitePageEnums';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { FeedPostApiResponse } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

test.describe(
  '@FeedCommentMentionNotification - Feed Comment Mention Notification Tests',
  {
    tag: [ContentTestSuite.FEED_COMMENT_MENTION_NOTIFICATION, ContentTestSuite.FEED],
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
      'verify that User gets notified when it is getting mentioned in the reply of the comment of any post CONT-30438',
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
        const activityNotificationPage = await notificationComponentSiteManager.clickOnViewAllNotifications();
        // Verify notification message for mention in reply
        const expectedNotificationMessage = `${endUserInfo.fullName} mentioned you "${replyData.replyText}"`;
        await activityNotificationPage.verifyNotificationExists(expectedNotificationMessage);
      }
    );

    test(
      'verify that User gets notified when it is getting mentioned in the reply of the comment of any content CONT-30411',
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
        await contentPreviewPage.waitForPostToBeVisible(createdPostText);
        const endUserReplyText = TestDataGenerator.generateRandomText('Reply', 1, false);
        const replyText = await contentPreviewPage.addReplyToComment(
          endUserReplyText,
          createdPostId,
          siteManagerInfo.fullName
        );
        await siteManagerFixture.homePage.loadPage();
        const notificationComponentSiteManager = await siteManagerFixture.navigationHelper.clickOnBellIcon({
          stepInfo: 'Site Manager clicking on bell icon to view notifications',
        });
        const activityNotificationPage = await notificationComponentSiteManager.clickOnViewAllNotifications();
        const expectedNotificationMessage = `${endUserInfo.fullName} mentioned you "${replyText}"`;
        await activityNotificationPage.verifyNotificationExists(expectedNotificationMessage);
      }
    );

    test(
      'verify that users can add mentions and topics in Site Feed replies with inline image and notification validation CONT-19554',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19554'],
      },
      async ({ appManagerFixture, standardUserFixture, siteManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify that users can add mentions in Site Feed replies and notification appears',
          zephyrTestId: 'CONT-19554',
          storyId: 'CONT-19554',
        });

        let replyText: string = '';

        // Get DEFAULT_PUBLIC_SITE_NAME site ID
        const siteName = DEFAULT_PUBLIC_SITE_NAME;
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);

        // Phase 1: EndUser Creates Site Feed Post on DEFAULT_PUBLIC_SITE_NAME site
        // Navigate to site dashboard
        const siteDashboard = new SiteDashboardPage(standardUserFixture.page, siteId);
        await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
        await siteDashboard.verifyThePageIsLoaded();

        // Click on Feed link to navigate to site feed
        await siteDashboard.clickOnFeedLink();

        // Create FeedPage instance for site feed operations
        const feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Click "Share your thoughts or questions" button to open editor
        await feedPage.clickShareThoughtsButton();

        // Create site feed post
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        createdPostText = feedTestData.text;

        const postResult = await feedPage.postEditor.createAndPost({
          text: createdPostText,
        });
        createdPostId = postResult.postId || '';

        // Verify post creation
        await feedPage.feedList.waitForPostToBeVisible(createdPostText);

        // Phase 2: EndUser Creates Reply with Mention
        // Open reply editor
        await feedPage.feedList.openReplyEditorForPost(createdPostText);

        // Generate reply text
        const baseReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        replyText = baseReplyText;

        // Access CreateFeedPostComponent for reply operations
        const createFeedPostComponent = feedPage['postEditor'];
        const listFeedComponent = feedPage['feedList'];

        // Create reply text with mention using CreateFeedPostComponent methods
        await createFeedPostComponent.createPost(baseReplyText);
        await createFeedPostComponent.addUserNameMention(siteManagerInfo.fullName);

        // Submit reply using ListFeedComponent method (handles API response internally)
        await listFeedComponent.submitReplyAndGetResponse();

        // Update replyText to include mention for verification
        replyText = `${baseReplyText} @${siteManagerInfo.fullName}`;

        // Verify reply is visible
        await feedPage.feedList.verifyReplyIsVisible(replyText);

        // Phase 3: Site Manager Validates Notification
        // Navigate to site dashboard as Site Manager
        const siteManagerDashboard = new SiteDashboardPage(siteManagerFixture.page, siteId);
        await siteManagerDashboard.navigateToTab(SitePageTab.DashboardTab);
        await siteManagerDashboard.verifyThePageIsLoaded();

        // Open notifications
        const notificationComponent = await siteManagerFixture.navigationHelper.clickOnBellIcon({
          stepInfo: 'Site Manager clicking on bell icon to view notifications',
        });
        const activityNotificationPage = await notificationComponent.clickOnViewAllNotifications();

        // Verify mention notification exists
        const expectedNotificationMessage = `${endUserInfo.fullName} mentioned you "${replyText}"`;
        const shortExpectedNotificationMessage =
          expectedNotificationMessage.length > 40
            ? expectedNotificationMessage.substring(0, 25)
            : expectedNotificationMessage;
        await activityNotificationPage.verifyNotificationExists(shortExpectedNotificationMessage);
      }
    );

    test(
      'verify that User able to add mention and topic in Site feed post CONT-19553',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19553'],
      },
      async ({ appManagerFixture, standardUserFixture, appManagerApiContext }) => {
        tagTest(test.info(), {
          description:
            'Verify that User gets notified when mentioned in Site Feed post with attachment and can navigate to view inline image',
          zephyrTestId: 'CONT-19553',
          storyId: 'CONT-19553',
        });

        // Get appManager user info for notification message
        const identityManagementHelper = new IdentityManagementHelper(
          appManagerApiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );
        const appManagerData = await identityManagementHelper.getUserInfoByEmail(users.appManager.email);
        const appManagerFullName = appManagerData.fullName;

        // Get DEFAULT_PUBLIC_SITE_NAME site ID
        const siteName = DEFAULT_PUBLIC_SITE_NAME;
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);

        // Phase 1: Admin Creates Site Feed Post with Mention + Attachment
        const siteDashboard = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
        await siteDashboard.verifyThePageIsLoaded();
        await siteDashboard.clickOnFeedLink();

        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.clickShareThoughtsButton();

        // Generate feed test data
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        createdPostText = feedTestData.text;

        // Access CreateFeedPostComponent for mention and attachment operations
        const createFeedPostComponent = adminFeedPage['postEditor'];

        // Create post with text
        await createFeedPostComponent.createPost(createdPostText);

        // Add user mention
        await createFeedPostComponent.addUserNameMention(endUserInfo.fullName);

        // Submit post
        const postResult = await createFeedPostComponent.createFeedPost();
        const feedResponseBody = (await postResult.json()) as FeedPostApiResponse;
        createdPostId = feedResponseBody.result.feedId;

        // Verify post creation with mention and inline image
        await adminFeedPage.feedList.waitForPostToBeVisible(createdPostText);

        // Phase 2: EndUser Validates Notification
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        const notificationComponent = await standardUserFixture.navigationHelper.clickOnBellIcon({
          stepInfo: 'EndUser clicking on bell icon to view notifications',
        });
        const activityNotificationPage = await notificationComponent.clickOnViewAllNotifications();

        // Verify notification message for mention in post
        const expectedNotificationMessage = `${appManagerFullName} mentioned you "${createdPostText}" @${endUserInfo.fullName}`;
        const shortExpectedNotificationMessage =
          expectedNotificationMessage.length > 40
            ? expectedNotificationMessage.substring(0, 25)
            : expectedNotificationMessage;
        await activityNotificationPage.verifyNotificationExistsForMention(shortExpectedNotificationMessage);

        // Phase 3: EndUser Clicks Notification and Navigates to Post
        await activityNotificationPage.clickOnNotificationForMention(shortExpectedNotificationMessage);

        // Wait for navigation to feed post
        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.feedList.waitForPostToBeVisible(createdPostText);

        await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        createdPostId = '';
      }
    );

    test(
      'verify Add Mention & Topic in Home Feed Post + Validate Notification Flow',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19551'],
      },
      async ({ appManagerFixture, standardUserFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user able to add mention and topic in Home feed post',
          zephyrTestId: 'CONT-19551',
          storyId: 'CONT-19551',
        });

        const appManagerData = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );
        const appManagerFullName = appManagerData.fullName;

        await test.step('Post Creation (Admin User)', async () => {
          await appManagerFixture.homePage.verifyThePageIsLoaded();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.verifyThePageIsLoaded();

          await adminFeedPage.clickShareThoughtsButton();

          const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
          createdPostText = postText;

          const createFeedPostComponent = adminFeedPage.postEditor;

          await createFeedPostComponent.createPost(postText);

          await createFeedPostComponent.addUserNameMention(endUserInfo.fullName);

          const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
          await createFeedPostComponent.uploadFiles([imagePath]);

          const postResult = await createFeedPostComponent.createFeedPost();
          const feedResponseBody = (await postResult.json()) as FeedPostApiResponse;
          createdPostId = feedResponseBody.result.feedId;

          await adminFeedPage.feedList.waitForPostToBeVisible(postText);

          await adminFeedPage.verifyAllDataPointsForFeedPost(postText, 1);
        });

        await test.step('Notification Validation (EndUser)', async () => {
          await standardUserFixture.homePage.verifyThePageIsLoaded();

          const notificationComponent = await standardUserFixture.navigationHelper.clickOnBellIcon({
            stepInfo: 'EndUser clicking on bell icon to view notifications',
          });

          const activityNotificationPage = await notificationComponent.clickOnViewAllNotifications();

          // Verify notification "mentioned you" exists from "Application Manager1" for mentioned user Standard User1
          const expectedNotificationMessage = `${appManagerFullName} mentioned you "${createdPostText}" @${endUserInfo.fullName}`;
          const shortExpectedNotificationMessage =
            expectedNotificationMessage.length > 40
              ? expectedNotificationMessage.substring(0, 25)
              : expectedNotificationMessage;
          await activityNotificationPage.verifyNotificationExistsForMention(shortExpectedNotificationMessage);

          await activityNotificationPage.clickOnNotificationForMention(shortExpectedNotificationMessage);

          const endUserFeedPage = new FeedPage(standardUserFixture.page);
          await endUserFeedPage.feedList.waitForPostToBeVisible(createdPostText);

          await endUserFeedPage.verifyAllDataPointsForFeedPost(createdPostText, 1);
        });

        await test.step('Post Cleanup (Admin User)', async () => {
          // await appManagerFixture.homePage.verifyThePageIsLoaded();

          // Open Home → Global Feed
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.verifyThePageIsLoaded();
          await adminFeedPage.feedList.waitForPostToBeVisible(createdPostText);

          await adminFeedPage.deletePost(createdPostText);
          createdPostId = '';
        });
      }
    );

    test(
      'verify user able to add mention + topic in Home Feed reply',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19552'],
      },
      async ({ appManagerFixture, standardUserFixture, siteManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user able to add mention + topic in Home Feed reply',
          zephyrTestId: 'CONT-19552',
          storyId: 'CONT-19552',
        });

        let replyText: string = '';

        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result.listOfItems;
        const topicName: string = availableTopics.length > 0 ? availableTopics[0].name : FEED_TEST_DATA.TOPIC_NAME;

        await test.step('Phase 1: EndUser Creates Post in Home Feed', async () => {
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const endUserFeedPage = new FeedPage(standardUserFixture.page);
          await endUserFeedPage.verifyThePageIsLoaded();

          await endUserFeedPage.clickShareThoughtsButton();

          const feedTestData = TestDataGenerator.generateFeed({
            scope: 'public',
            siteId: undefined,
            withAttachment: false,
            waitForSearchIndex: false,
          });
          createdPostText = feedTestData.text;

          const postResult = await endUserFeedPage.postEditor.createAndPost({
            text: createdPostText,
          });
          createdPostId = postResult.postId || '';
          await endUserFeedPage.feedList.waitForPostToBeVisible(createdPostText);
        });

        await test.step('Phase 2: EndUser Creates Reply with Mention + Topic + Image', async () => {
          const endUserFeedPage = new FeedPage(standardUserFixture.page);

          await endUserFeedPage.feedList.openReplyEditorForPost(createdPostText);

          const baseReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
          replyText = baseReplyText;

          const createFeedPostComponent = endUserFeedPage['postEditor'];
          const listFeedComponent = endUserFeedPage['feedList'];

          await createFeedPostComponent.createPost(baseReplyText);
          await createFeedPostComponent.addUserNameMention(siteManagerInfo.fullName);

          await createFeedPostComponent.addTopicMention(topicName);

          const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
          await createFeedPostComponent.uploadFiles([imagePath]);

          await createFeedPostComponent.verifyAttachedFileCount(1);

          await listFeedComponent.submitReplyAndGetResponse();

          replyText = `${baseReplyText} @${siteManagerInfo.fullName} #${topicName}`;
          await endUserFeedPage.feedList.verifyReplyIsVisible(replyText);
        });

        await test.step('Phase 3: Standard User2 (EndUser1) Validates Notification', async () => {
          await siteManagerFixture.homePage.verifyThePageIsLoaded();

          const notificationComponent = await siteManagerFixture.navigationHelper.clickOnBellIcon({
            stepInfo: 'Standard User2 clicking on bell icon to view notifications',
          });
          const activityNotificationPage = await notificationComponent.clickOnViewAllNotifications();

          // Verify "mentioned you" notification exists

          const expectedNotificationMessage = `${endUserInfo.fullName} mentioned you "${replyText}"`;
          const shortExpectedNotificationMessage =
            expectedNotificationMessage.length > 40
              ? expectedNotificationMessage.substring(0, 25)
              : expectedNotificationMessage;
          await activityNotificationPage.verifyNotificationExists(shortExpectedNotificationMessage);

          // Click notification
          await activityNotificationPage.clickOnNotificationForMention(shortExpectedNotificationMessage);

          // Verify user can view the feed reply with the mention
          const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
          await siteManagerFeedPage.feedList.waitForPostToBeVisible(createdPostText);
          await siteManagerFeedPage.feedList.verifyReplyIsVisible(replyText);

          // Verify inline image in the reply
          const listFeedComponent = siteManagerFeedPage['feedList'];
          const replyImageLocator = listFeedComponent.getReplyBoxImageLocator(replyText);
          await siteManagerFeedPage['verifier'].verifyTheElementIsVisible(replyImageLocator, {
            assertionMessage: 'Inline image should be displayed in reply',
          });
        });

        await test.step('Phase 4: Admin Deletes Post', async () => {
          // Navigate as Admin
          await appManagerFixture.homePage.verifyThePageIsLoaded();

          // Navigate to Home → Global Feed
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.verifyThePageIsLoaded();
          await adminFeedPage.feedList.waitForPostToBeVisible(createdPostText);

          // Delete the created post
          await adminFeedPage.deletePost(createdPostText);

          createdPostId = '';
        });
      }
    );
  }
);
