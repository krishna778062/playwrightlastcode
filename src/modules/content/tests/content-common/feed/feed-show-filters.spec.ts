import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SitePermission } from '@/src/core/types/siteManagement.types';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

test.describe(
  '@FeedPost - Show Filters Display Correct Shared Feed Posts',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    let adminFeedPage: FeedPage;
    let siteManagerFeedPage: FeedPage;
    let siteOwnerFeedPage: FeedPage;
    let siteContentManagerFeedPage: FeedPage;
    let adminFullName: string;
    let createdPostId1: string = '';
    let createdPostId2: string = '';
    let createdPostId3: string = '';
    const sharedPostId1: string = '';
    const sharedPostId2: string = '';
    const sharedPostId3: string = '';

    test.beforeEach(
      'Setup test environment and user relationships',
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        // Configure app governance settings
        await appManagerFixture.feedManagementHelper.configureAppGovernance({
          feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
        });

        // Initialize identity management helper
        const identityManagementHelper = new IdentityManagementHelper(
          appManagerFixture.apiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );

        // Get user information
        const adminInfo = await identityManagementHelper.getUserInfoByEmail(users.appManager.email);
        const siteOwnerInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        adminFullName = adminInfo.fullName;

        // Get or create a site where endUser is content manager
        // First, get a public site
        const publicSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });

        // Assign endUser as content manager of the site
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSite.siteId,
          userId: siteOwnerInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });

        // Ensure Admin is following Site Owner and Site Content Manager
        // Note: Following relationships may need to be set up via API if not already configured

        // Initialize feed pages
        adminFeedPage = new FeedPage(appManagerFixture.page);
        siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        siteOwnerFeedPage = new FeedPage(standardUserFixture.page);
        siteContentManagerFeedPage = new FeedPage(standardUserFixture.page);
      }
    );

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Delete all created posts
      const postsToDelete = [
        createdPostId1,
        createdPostId2,
        createdPostId3,
        sharedPostId1,
        sharedPostId2,
        sharedPostId3,
      ];
      for (const postId of postsToDelete) {
        if (postId) {
          try {
            await appManagerFixture.feedManagementHelper.deleteFeed(postId);
            console.log(`Deleted post: ${postId}`);
          } catch (error) {
            console.warn(`Failed to delete post ${postId}:`, error);
          }
        }
      }
    });

    test(
      ' posts To Me: Verify Admin sees only posts where they are mentioned and their own posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26728'],
      },
      async ({ appManagerFixture, siteManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus, verify "Show Filters" display the correct shared feed posts - Posts To Me filter',
          zephyrTestId: 'CONT-26728',
          storyId: 'CONT-26728',
        });

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;

        // Login as Admin and create a feed post
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.actions.clickShareThoughtsButton();
        const adminPostResult = await adminFeedPage.actions.createAndPost({ text: postText });
        createdPostId1 = adminPostResult.postId || '';
        await adminFeedPage.assertions.waitForPostToBeVisible(postText);

        // Use Site Manager's page (already logged in via fixture)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts"
        await siteManagerFeedPage.actions.clickOnShowOption('all');

        // Click Share icon for the feed post created by Admin
        await siteManagerFeedPage.actions.shareFeedPost({
          postText: postText,
          mentionUserName: adminFullName,
          shareMessage: shareMessage,
          postIn: 'Home Feed',
        });

        // Wait for shared post to appear
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Use Admin's page (already logged in via fixture)
        await adminFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "Posts to me"
        console.log('Select Show filter = "Posts to me"');
        await adminFeedPage.actions.clickOnShowOption('toMe');

        // Verify Admin sees:
        // - Only posts where they are mentioned
        // - Posts created by themselves
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage); // Shared post mentioning Admin
        await adminFeedPage.assertions.waitForPostToBeVisible(postText); // Admin's own post
      }
    );

    test(
      'posts I Follow: Verify Admin sees posts from users he follows and his own posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26728'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus, verify "Show Filters" display the correct shared feed posts - Posts I Follow filter',
          zephyrTestId: 'CONT-26728',
          storyId: 'CONT-26728',
        });

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;

        // Use Site Manager's page (already logged in via fixture, Admin should not be following Site Manager)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Create a feed post
        await siteManagerFeedPage.actions.clickShareThoughtsButton();
        const siteManagerPostResult = await siteManagerFeedPage.actions.createAndPost({ text: postText });
        createdPostId2 = siteManagerPostResult.postId || '';
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(postText);

        // Use Site Owner's page (already logged in via fixture, Admin is following Site Owner)
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await siteOwnerFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts"
        await siteOwnerFeedPage.actions.clickOnShowOption('all');

        // Click Share on the feed post created by Site Manager
        console.log('Share the feed post created by Site Manager');
        await siteOwnerFeedPage.actions.shareFeedPost({
          postText: postText,
          shareMessage: shareMessage,
          postIn: 'Home Feed',
        });

        // Wait for shared post to appear
        await siteOwnerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Use Admin's page (already logged in via fixture)
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "Posts I follow"
        console.log('Select Show filter = "Posts I follow"');
        await adminFeedPage.actions.clickOnShowOption('Posts I follow');

        // Verify Admin can see:
        // - Feed posts shared or created by users he follows (Site Owner)
        // - His own posts
        // - NOT Site Manager's post
        console.log('Verify Admin sees posts from followed users and own posts');
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage); // Site Owner's shared post

        // Verify Site Manager's original post is NOT visible (since Admin is not following Site Manager)
        await adminFeedPage.assertions.verifyPostIsNotVisible(postText);
      }
    );

    test(
      'favourited Posts: Verify Admin sees only favourited posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26728'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus, verify "Show Filters" display the correct shared feed posts - Favourited Posts filter',
          zephyrTestId: 'CONT-26728',
          storyId: 'CONT-26728',
        });

        const postText = 'Created a Feed Post';
        const shareMessage = "Shared Manager's Post";

        // Use Site Manager's page (already logged in via fixture, Admin should not be following Site Manager)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Create a feed post
        await siteManagerFeedPage.actions.clickShareThoughtsButton();
        const siteManagerPostResult = await siteManagerFeedPage.actions.createAndPost({ text: postText });
        createdPostId3 = siteManagerPostResult.postId || '';
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(postText);

        //  Use Site Content Manager's page (already logged in via fixture, Admin is following Site Content Manager)
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await siteContentManagerFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts"
        console.log('Select Show filter = "All Posts"');
        await siteContentManagerFeedPage.actions.clickOnShowOption('all');

        // Click Share icon for the feed post created by Site Manager
        await siteContentManagerFeedPage.actions.shareFeedPost({
          postText: postText,
          shareMessage: shareMessage,
          postIn: 'Home Feed',
        });

        // Wait for shared post to appear
        await siteContentManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Use Admin's page (already logged in via fixture)
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts" to see the shared post
        console.log('Select Show filter = "All Posts" to see the shared post');
        await adminFeedPage.actions.clickOnShowOption('all');
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Favourite the Site Content Manager's shared feed post
        // Wait for the shared post to be visible
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);
        // Mark the specific post as favorite by its text
        await adminFeedPage.actions.markPostAsFavourite();
        await adminFeedPage.assertions.verifyPostIsFavorited(shareMessage);

        // Select Show filter = "Favourited Posts"
        await adminFeedPage.actions.clickOnShowOption('favourited');

        // Verify Admin sees only the favourited shared post
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);
      }
    );
  }
);
