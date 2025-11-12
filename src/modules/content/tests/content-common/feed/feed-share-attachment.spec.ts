import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

// ==================== HELPER FUNCTIONS ====================

/**
 * Fetches common test data including user, topics, and sites
 * @param helpers - Required helper instances
 * @returns Promise with requested data
 */
async function fetchUserSiteAndTopicData(helpers: {
  identityManagementHelper: IdentityManagementHelper;
  siteManagementHelper: any;
  contentManagementHelper: any;
}) {
  const [endUserInfo, topicList, publicSite] = await Promise.all([
    helpers.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
    helpers.contentManagementHelper.getTopicList(),
    helpers.siteManagementHelper.getSiteByAccessType('public'),
  ]);

  return {
    endUserInfo,
    topicList,
    publicSite,
  };
}

test.describe(
  '@FeedPost - Verify user cannot add attachments while sharing a Feed post',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, '@feed-share-no-attachment'],
  },
  () => {
    let adminFeedPage: FeedPage;
    let endUserFeedPage: FeedPage;
    let createdPostId: string = '';
    let createdPostText: string = '';
    let standardUserFullName: string;
    let publicSiteName: string;
    let simpplrTopic: any;
    let identityManagementHelper: IdentityManagementHelper;

    test.beforeEach('Setup test environment and data creation', async ({ appManagerFixture, appManagerApiContext }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

      // Initialize identity management helper
      identityManagementHelper = new IdentityManagementHelper(
        appManagerApiContext,
        getContentConfigFromCache().tenant.apiBaseUrl
      );

      // Fetch common test data via API calls
      const testDataResults = await fetchUserSiteAndTopicData({
        identityManagementHelper,
        siteManagementHelper: appManagerFixture.siteManagementHelper,
        contentManagementHelper: appManagerFixture.contentManagementHelper,
      });

      // Set data for test use via API calls
      standardUserFullName = testDataResults.endUserInfo.fullName;
      publicSiteName = testDataResults.publicSite.name;

      // Search for "Simpplr" topic, otherwise use first available topic
      simpplrTopic = testDataResults.topicList.result.listOfItems.find(
        (topic: any) => topic.name.toLowerCase() === 'simpplr'
      );
      if (!simpplrTopic) {
        console.log('Simpplr topic not found, using first available topic');
        simpplrTopic = testDataResults.topicList.result.listOfItems[0];
      }

      console.log('Test data retrieved:');
      console.log('Standard User Full Name:', standardUserFullName);
      console.log('Public Site Name:', publicSiteName);
      console.log('Simpplr Topic:', simpplrTopic?.name);

      // Initialize feed page for admin
      adminFeedPage = new FeedPage(appManagerFixture.page);

      // Navigate to Home-Global Feed as Admin
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      await appManagerFixture.navigationHelper.clickOnGlobalFeed();
      await adminFeedPage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Delete post using API if it exists
      if (createdPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
          console.log(`Successfully cleaned up feed post: ${createdPostId}`);
        } catch (error) {
          console.log(`Failed to cleanup feed post ${createdPostId} via API:`, error);
        }
        createdPostId = ''; // Reset after cleanup attempt
      }

      // Cleanup: Close EndUser browser context if it exists
      const endUserContext = (endUserFeedPage as any)?.endUserContext;
      if (endUserContext) {
        try {
          await endUserContext.close();
          console.log('EndUser browser context closed');
        } catch (error) {
          console.log('Failed to close EndUser browser context:', error);
        }
      }
    });

    test(
      'in Zeus, verify that a user is not allowed to add any attachment or media while sharing a Feed post',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-26727'],
      },
      async ({ appManagerFixture, browser }) => {
        tagTest(test.info(), {
          description:
            'In Zeus, verify that a user is not allowed to add any attachment or media while sharing a Feed post',
          zephyrTestId: 'CONT-26727',
          storyId: 'CONT-26727',
        });

        // Login as Admin (already done in beforeEach via appManagerFixture)
        await test.step('Verify Admin is logged in and on Global Feed', async () => {
          await adminFeedPage.verifyThePageIsLoaded();
          console.log('Admin is logged in and on Global Feed');
        });

        // Create a Feed post with mentions, topics, and a message
        await test.step('Create a Feed post with mentions, topics, and a message', async () => {
          const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
          const embedUrl = FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL;

          // Click "Share your thoughts" button
          await adminFeedPage.actions.clickShareThoughtsButton();

          // Create post with text, topic, user mention, site mentions, and embedded URL
          const postResult = await adminFeedPage.actions.createfeedWithMentionUserNameAndTopic({
            text: postText,
            userName: standardUserFullName,
            topicName: simpplrTopic.name,
            siteName: [publicSiteName],
            embedUrl: embedUrl,
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Wait for post to be visible
          await adminFeedPage.assertions.waitForPostToBeVisible(createdPostText);
        });

        const topNavBar = new TopNavBarComponent(appManagerFixture.page);
        await topNavBar.logout({ stepInfo: 'Logging out Admin user' });

        // Login as EndUser
        await test.step('Login as EndUser and navigate to Global Feed', async () => {
          // Create a new browser context and page for EndUser
          const endUserContext = await browser.newContext();
          const endUserPage = await endUserContext.newPage();

          // Login as EndUser
          const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
            email: users.endUser.email,
            password: users.endUser.password,
          });

          // Initialize navigation helper and feed page
          const endUserNavigationHelper = new NavigationHelper(endUserPage);
          endUserFeedPage = new FeedPage(endUserPage);

          // Navigate to Global Feed
          await endUserHomePage.verifyThePageIsLoaded();
          await endUserNavigationHelper.clickOnGlobalFeed();
          await endUserFeedPage.verifyThePageIsLoaded();
          console.log('EndUser is logged in and on Global Feed');

          // Store context for cleanup
          (endUserFeedPage as any).endUserContext = endUserContext;
        });

        // Wait for the post to be visible
        await endUserFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Click Share button on the post
        await endUserFeedPage.actions.clickShareButtonOnPost(createdPostText);
        await endUserFeedPage.assertions.verifyShareModalIsOpen();
        // Attempt to paste an image (simulates user pasting image from clipboard)
        await endUserFeedPage.actions.attemptImagePasteInShareModal();

        // Verify no attachments are visible
        await endUserFeedPage.assertions.verifyNoAttachmentsInShareModal();

        // Verify share modal remains functional
        await endUserFeedPage.assertions.verifyShareModalIsFunctional();
      }
    );
  }
);
