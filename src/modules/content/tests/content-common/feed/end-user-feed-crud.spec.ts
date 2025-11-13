import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { ShareComponent } from '@content/ui/components/shareComponent';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

test.describe(
  '@FeedPost',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, ContentTestSuite.ATTACHMENTS],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';
    let siteDashboardPage: SiteDashboardPage;

    test.beforeEach(async ({ standardUserFixture, appManagerFixture }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      /** await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */

      await standardUserFixture.homePage.verifyThePageIsLoaded();
      await standardUserFixture.navigationHelper.clickOnGlobalFeed();

      feedPage = new FeedPage(standardUserFixture.page);
      await feedPage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Delete post using API if test failed and post still exists
      if (createdPostId && appManagerFixture.feedManagementHelper) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'verify user can create, edit and delete a feed post with attachments',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@attachments'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Test feed post creation, editing and deletion with file attachments',
          zephyrTestId: 'CONT-19533',
          storyId: 'CONT-19533',
        });

        // Generate test data
        const initialPostText = TestDataGenerator.generateRandomText('Test Post', 3, true);
        const updatedPostText = TestDataGenerator.generateRandomText('Updated Test Post', 3, true);

        // Step 1: Create a new post with multiple attachments via UI
        // Note: Post can also be created via API using:
        // const { postResult: apiPostResult, postId } = await feedManagerService.createPost({ text: initialPostText });
        await feedPage.actions.clickShareThoughtsButton();
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          FEED_TEST_DATA.ATTACHMENTS.IMAGE
        );
        const documentPath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'excel',
          FEED_TEST_DATA.ATTACHMENTS.DOCUMENT
        );
        const postResult = await feedPage.actions.createAndPost({
          text: initialPostText,
          attachments: {
            files: [imagePath, documentPath],
          },
        });

        // Store created post text and postId for cleanup (postId would be available if using API creation)
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible and get timestamp
        await feedPage.assertions.waitForPostToBeVisible(postResult.postText);
        await feedPage.getPostTimestamp(postResult.postText);

        // Step 2: Verify post details and attachments
        await feedPage.assertions.verifyPostDetails(postResult.postText, postResult.attachmentCount);

        // Step 3: Edit the post
        await feedPage.actions.editPost(postResult.postText, updatedPostText);
        await feedPage.assertions.waitForPostToBeVisible(updatedPostText);

        // Step 4: Delete the post
        await feedPage.actions.deletePost(updatedPostText);
        createdPostId = ''; // Clear post ID as post is already deleted
        createdPostText = ''; // Clear post text as post is already deleted
      }
    );

    test(
      'verify End User should not be able to search an Private and Unlisted site if he is not a member of a site',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-24150'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify End User should not be able to search an Private and Unlisted site if he is not a member of a site',
          zephyrTestId: 'CONT-24150',
          storyId: 'CONT-24150',
        });

        // Step 1: Get or reuse a private site that standard user is NOT a member of
        // This will reuse an existing private site if available, or create a new one if needed
        const privateSiteResult = await appManagerFixture.siteManagementHelper.getSiteByAccessType('private', {
          waitForSearchIndex: false,
        });
        const privateSiteName = privateSiteResult.name;
        console.log(`Using private site: ${privateSiteName}`);

        // Step 2: Get or reuse an unlisted site that standard user is NOT a member of
        // This will reuse an existing unlisted site if available, or create a new one if needed
        const unlistedSiteResult = await appManagerFixture.siteManagementHelper.getSiteByAccessType('unlisted', {
          waitForSearchIndex: false,
        });
        const unlistedSiteName = unlistedSiteResult.name;
        console.log(`Using unlisted site: ${unlistedSiteName}`);

        // Step 3: Standard User is already on Feed page (from beforeEach setup)

        // Step 4: Click on "Share your thoughts" button
        await feedPage.actions.clickShareThoughtsButton();

        // Step 5: Create a post and send it to the editor
        const initialPostText = TestDataGenerator.generateRandomText('Test Post', 3, true);
        await feedPage.actions.enterFeedPostText(initialPostText);

        // Step 6: User select share option as "site feed"
        await feedPage.actions.selectShareOptionAsSiteFeed();

        // Step 7: Enter private site name which User is not member of
        await feedPage.actions.searchForSiteName(privateSiteName);

        // Step 8: Verify "No results" is getting displayed for private site
        await feedPage.assertions.verifyNoResultMessage();

        // Step 9: Close the dropdown and search again for unlisted site
        await standardUserFixture.page.keyboard.press('Escape'); // Close the dropdown
        await feedPage.actions.searchForSiteName(unlistedSiteName);

        // Step 10: Verify "No results" is getting displayed for unlisted site
        await feedPage.assertions.verifyNoResultMessage();
      }
    );

    test(
      'verify user is able to add video to a feed post using "Browse files"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-36599'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user is able to add video to a feed post using "Browse files"',
          zephyrTestId: 'CONT-36599',
          storyId: 'CONT-36599',
        });

        // Step 1: Standard User is already logged in via beforeEach
        // Step 2: Feed page is already loaded via beforeEach

        // Step 3: Click on "Share your thoughts" button (Create Post)
        await feedPage.actions.clickShareThoughtsButton();

        // Step 4: Enter post text
        const videoPostText = TestDataGenerator.generateRandomText('Video Post', 3, true);
        await feedPage.actions.enterFeedPostText(videoPostText);

        // Step 5: Click on "Browse files" button
        await feedPage.actions.clickBrowseFilesButton();

        // Step 6: Enter '.mp4' in 'Search files' field
        await feedPage.actions.searchForFileInLibrary('.mp4');

        // Step 7: Select first result ".mp4" video
        await feedPage.actions.selectFileFromLibrary('.mp4');

        // Step 8: Click "Attach" button
        await feedPage.actions.clickAttachButton();

        // Step 9: Verify the selected video appears as an attachment
        await feedPage.assertions.verifyFileIsAttached('.mp4');

        // Step 10: Click on "Post" button to publish
        await feedPage.actions.clickPostButton();

        // Step 11: Verify the feed post is published successfully with the post text
        await feedPage.assertions.waitForPostToBeVisible(videoPostText);

        // Step 12: Verify video attachment is visible in the published feed post
        // Note: Videos are displayed as a video container div, not as HTML <video> elements
        const videoContainer = standardUserFixture.page
          .locator('div[class*="postContent"]')
          .filter({ hasText: videoPostText })
          .locator('div[class*="videoFluid"]');

        await feedPage.verifier.verifyTheElementIsVisible(videoContainer, {
          timeout: 10000,
          assertionMessage: 'Video container should be visible in the published feed post',
        });

        // Store post text for cleanup
        createdPostText = videoPostText;
      }
    );

    test(
      'in Zeus, Verify User is able to share a Feed post with a video and message using "Post in SITE FEED" option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-28219'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus, Verify User is able to share a Feed post with a video and message using "Post in SITE FEED" option',
          zephyrTestId: 'CONT-28219',
          storyId: 'CONT-28219',
        });

        // Step 1: Login as Admin (appManagerFixture is already logged in via fixture)
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();

        // Step 2: Create a Feed post with a native video attachment and a message
        await adminFeedPage.actions.clickShareThoughtsButton();
        const videoPostText = FEED_TEST_DATA.POST_TEXT.VIDEO;
        await adminFeedPage.actions.enterFeedPostText(videoPostText);

        // Add video attachment
        await adminFeedPage.actions.clickBrowseFilesButton();
        await adminFeedPage.actions.searchForFileInLibrary('.mp4');
        await adminFeedPage.actions.selectFileFromLibrary('.mp4');
        await adminFeedPage.actions.clickAttachButton();
        await adminFeedPage.assertions.verifyFileIsAttached('.mp4');

        // Post the feed
        const postResult = await adminFeedPage.actions.createAndPost({
          text: videoPostText,
        });
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await adminFeedPage.assertions.waitForPostToBeVisible(videoPostText);

        // // Step 3: Logout using the profile avatar menu
        // await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);

        // Step 4: Login as End User (standardUserFixture is already logged in via fixture)
        await standardUserFixture.page.reload();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Step 5: Click the "Share" icon on the Feed post created by Admin
        await feedPage.actions.clickShareIconOnPost(videoPostText);

        // Step 6: Add a message while sharing
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await feedPage.actions.enterShareDescription(shareMessage);

        // Step 7: Select Post in "Site Feed" option
        await feedPage.actions.selectShareOptionAsSiteFeed();

        // Step 8: Search for and select a site
        const siteResult = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public', {
          waitForSearchIndex: false,
        });
        const siteName = siteResult.name;
        await feedPage.actions.enterSiteNameForShare(siteName);

        // Step 9: Click the "Share" button
        const shareComponent = new ShareComponent(standardUserFixture.page);
        await shareComponent.actions.clickShareButton();

        // Wait for share to complete
        await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.POST_SHARED);

        // Step 10: Search for the site where the feed post was shared
        // Step 11: Verify the Feed post appears on the Site Dashboard
        siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteResult.siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.assertions.validatePostText(shareMessage);

        // Step 12: Click "View Post" - need to use feedPage on site dashboard
        const siteFeedPage = new FeedPage(standardUserFixture.page);
        await siteFeedPage.actions.clickViewPostLink(videoPostText);

        // Step 13: Verify the user is navigated to the Feed Detail Page
        // Wait for navigation to feed detail page
        await standardUserFixture.page.waitForURL(new RegExp(`/feed/${createdPostId}`), { timeout: 10000 });
        const feedDetailPage = new FeedPage(standardUserFixture.page, createdPostId);
        await feedDetailPage.assertions.waitForPostToBeVisible(videoPostText);

        // Step 14: Verify the video autoplays in the feed detail view
        await feedDetailPage.assertions.verifyVideoAutoplay(videoPostText);

        // Step 15: Verify video controls and functionalities
        await feedDetailPage.assertions.verifyVideoControls(videoPostText);
      }
    );

    test(
      'in Zeus Verify User is able to Share a Feed post with a video and message using "Post in HOME FEED" option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-28215'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify User is able to Share a Feed post with a video and message using "Post in HOME FEED" option',
          zephyrTestId: 'CONT-28215',
          storyId: 'CONT-28215',
        });

        // Step 1: Login as Admin (appManagerFixture is already logged in via fixture)
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();

        // Step 2: Create a Feed post with a native video attachment and a message
        await adminFeedPage.actions.clickShareThoughtsButton();
        const videoPostText = FEED_TEST_DATA.POST_TEXT.VIDEO;
        await adminFeedPage.actions.enterFeedPostText(videoPostText);

        // Add video attachment
        await adminFeedPage.actions.clickBrowseFilesButton();
        await adminFeedPage.actions.searchForFileInLibrary('.mp4');
        await adminFeedPage.actions.selectFileFromLibrary('.mp4');
        await adminFeedPage.actions.clickAttachButton();
        await adminFeedPage.assertions.verifyFileIsAttached('.mp4');

        // Post the feed
        const postResult = await adminFeedPage.actions.createAndPost({
          text: videoPostText,
        });
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await adminFeedPage.assertions.waitForPostToBeVisible(videoPostText);

        // Step 3: Login as End User (standardUserFixture is already logged in via fixture)
        await standardUserFixture.page.reload();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Step 4: Click the "Share" icon on the Feed post created by Admin
        await feedPage.actions.clickShareIconOnPost(videoPostText);

        // Step 5: Add a message while sharing
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await feedPage.actions.enterShareDescription(shareMessage);

        // Step 6: Select Post in "Home Feed" option
        // By default, the share option is "Home Feed"
        //await feedPage.actions.selectShareOptionAsHomeFeed();

        // Step 7: Click the "Share" button (no site selection needed for home feed)
        const shareComponent = new ShareComponent(standardUserFixture.page);
        await shareComponent.actions.clickShareButton();

        // Wait for share to complete
        await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.POST_SHARED);

        // Step 8: Navigate to Home/Global Feed
        await feedPage.reloadPage();

        // Step 9: Verify the Feed post appears on Home Feed
        await feedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Step 10: Click "View Post"
        await feedPage.actions.clickViewPostLink(shareMessage);

        // Step 11: Verify the user is navigated to the Feed Detail Page
        // Wait for navigation to feed detail page
        await standardUserFixture.page.waitForURL(new RegExp(`/feed/${createdPostId}`), { timeout: 10000 });
        const feedDetailPage = new FeedPage(standardUserFixture.page, createdPostId);
        await feedDetailPage.assertions.waitForPostToBeVisible(videoPostText);

        // Step 12: Verify the video autoplays in the feed detail view
        await feedDetailPage.assertions.verifyVideoAutoplay(videoPostText);

        // Step 13: Verify video controls and functionalities
        await feedDetailPage.assertions.verifyVideoControls(videoPostText);
      }
    );

    test(
      'sU : Verify site owner or manager can edit or delete comments from other users',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26611'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Test feed post creation, editing and deletion with file attachments',
          zephyrTestId: 'CONT-26611',
          storyId: 'CONT-26611',
        });

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteWithUserAsOwner(
          users.endUser.email,
          SITE_TYPES.PRIVATE
        );

        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteDetails.siteId,
          waitForSearchIndex: false,
        });

        const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
        createdPostText = feedTestData.text;
        createdPostId = feedResponse.result.feedId;

        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteDetails.siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });

        await siteDashboardPage.actions.clickOnFeedLink();
        await siteDashboardPage.actions.clickOnOptionsMenu(createdPostText);
        await siteDashboardPage.assertions.verifyEditAndDeleteOptionsVisible(createdPostText);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        const updatedPostText = TestDataGenerator.generateRandomText('Updated Test Post', 3, true);
        // Step 3: Edit the post
        await siteDashboardPage.actions.editPost(createdPostText, updatedPostText);
        await siteDashboardPage.assertions.validatePostText(updatedPostText);

        // Step 4: Delete the post
        await siteDashboardPage.actions.deletePost(updatedPostText);
        createdPostId = ''; // Clear post ID as post is already deleted
        await siteDashboardPage.assertions.validatePostNotVisible(updatedPostText);
      }
    );

    test(
      'sU : Verify that application should not allow user to view the Private or unlisted site content comment using link',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26362'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that application should not allow user to view the Private or unlisted site content comment using link',
          zephyrTestId: 'CONT-26362',
          storyId: 'CONT-26362',
        });

        // Test for Private site
        await test.step('Verify access denied for Private site feed', async () => {
          // Get user ID from email
          const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.endUser.email
          );

          // Get private site with content
          const privateSiteDetails = await appManagerApiFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
            [endUserInfo.userId],
            SITE_TYPES.PRIVATE
          );

          // Create feed using app manager on private site
          const feedTestData = TestDataGenerator.generateFeed({
            scope: 'site',
            siteId: privateSiteDetails.siteId,
            waitForSearchIndex: false,
          });

          const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);
          createdPostId = feedResponse.result.feedId;

          // Create feedPage object and navigate to the feed page
          const feedPage = new FeedPage(standardUserFixture.page, createdPostId);
          await test.step('Load feed page with standard user for private site feed', async () => {
            await standardUserFixture.page.goto(feedPage.url);
          });

          // Verify page not found page is visible
          await feedPage.assertions.verifyPageNotFoundVisibility({
            stepInfo: 'Verify access denied page is shown for private site feed',
          });

          // Cleanup
          await appManagerApiFixture.feedManagementHelper.deleteFeed(createdPostId);
          createdPostId = '';
        });

        // Test for Unlisted site
        await test.step('Verify access denied for Unlisted site feed', async () => {
          // Get user ID from email
          const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.endUser.email
          );

          // Get unlisted site with content
          const unlistedSiteDetails = await appManagerApiFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
            [endUserInfo.userId],
            SITE_TYPES.UNLISTED
          );

          // Create feed using app manager on unlisted site
          const feedTestData = TestDataGenerator.generateFeed({
            scope: 'site',
            siteId: unlistedSiteDetails.siteId,
            waitForSearchIndex: false,
          });

          const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);
          createdPostId = feedResponse.result.feedId;

          // Create feedPage object and navigate to the feed page
          const feedPage = new FeedPage(standardUserFixture.page, createdPostId);
          await test.step('Load feed page with standard user for unlisted site feed', async () => {
            await standardUserFixture.page.goto(feedPage.url);
          });

          // Verify page not found page is visible
          await feedPage.assertions.verifyPageNotFoundVisibility({
            stepInfo: 'Verify access denied page is shown for unlisted site feed',
          });

          // Cleanup
          await appManagerApiFixture.feedManagementHelper.deleteFeed(createdPostId);
          createdPostId = '';
        });
      }
    );
  }
);
