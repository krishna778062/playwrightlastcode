import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { CreateFeedPostComponent } from '@content/ui/components/createFeedPostComponent';
import { InappropriateContentWarningPopupComponent } from '@content/ui/components/inappropriateContentWarningPopupComponent';
import { RecognitionFormComponent } from '@content/ui/components/recognitionFormComponent';
import { ShareComponent } from '@content/ui/components/shareComponent';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages';
import { SiteFilesPage } from '@content/ui/pages/sitePages/siteFilesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { FeedPostingPermission } from '@/src/modules/content/constants/feedPostingPermission';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { GovernanceScreenPage } from '@/src/modules/content/ui/pages/governanceScreenPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

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
    // Variables for share-attachment test
    let adminFeedPage: FeedPage;
    let endUserFeedPage: FeedPage;
    let standardUserFullName: string;
    let publicSiteName: string;
    let simpplrTopic: any;
    let identityManagementHelper: IdentityManagementHelper;

    test.beforeEach(async ({ standardUserFixture }) => {
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

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete post using API if test failed and post still exists
      if (createdPostId) {
        try {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
        createdPostId = ''; // Reset after cleanup attempt
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'verify user can create, edit and delete a feed post with attachments CONT-19533',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@attachments', '@healthcheck'],
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
        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        const documentPath = FILE_TEST_DATA.EXCEL.SAMPLE_XLSX.getPath(__dirname);
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
      'verify user can create, edit and delete a feed post with file attachment on site feed CONT-19544',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19544'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user can create, edit and delete a feed post with file attachment on site feed',
          zephyrTestId: 'CONT-19544',
          storyId: 'CONT-19544',
        });

        const allEmployeesSiteId =
          await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        // Navigate to Site Dashboard as
        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, allEmployeesSiteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Click on Feed link
        await siteDashboardPage.actions.clickOnFeedLink();

        // Create Feed Post with Attachment
        const initialPostText = FEED_TEST_DATA.POST_TEXT.INITIAL;

        // Click "Share your thoughts or questions" button
        await siteDashboardPage.actions.clickShareThoughtsButton();

        // Get the createFeedPostComponent from siteDashboardPage
        const createFeedPostComponent = siteDashboardPage['createFeedPostComponent'];

        // Upload file "image1.jpg"
        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);

        // Post the feed with attachment (createAndPost handles text and file upload internally)
        const postResult = await createFeedPostComponent.actions.createAndPost({
          text: initialPostText,
          attachments: {
            files: [imagePath],
          },
        });

        // Store created post text and postId for cleanup
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Verify post successfully created
        await siteDashboardPage.assertions.validatePostText(postResult.postText);

        // Verify timestamp displayed
        const feedPageForSite = new FeedPage(standardUserFixture.page);
        await feedPageForSite.getPostTimestamp(postResult.postText);

        // Verify inline image preview visible
        await feedPageForSite.assertions.verifyPostDetails(postResult.postText, postResult.attachmentCount);

        // Edit Feed Post
        const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;

        // Open option menu (three dots)
        await siteDashboardPage.actions.clickOnOptionsMenu(createdPostText);

        // Click Edit
        await createFeedPostComponent.clickEditOption();

        // Verify editor opens
        await createFeedPostComponent.assertions.verifyEditorVisible();

        // Verify file restrictions: User must NOT be able to remove files
        // Verify attached file count is still 1 (cannot remove files)
        await createFeedPostComponent.assertions.verifyAttachedFileCount(1);

        // Update text
        await createFeedPostComponent.actions.updatePostText(updatedPostText);

        // Click Update
        await createFeedPostComponent.actions.clickUpdateButton();

        // Verify updated content appears
        await siteDashboardPage.assertions.validatePostText(updatedPostText);

        // Delete Feed Post
        // Open option menu
        await siteDashboardPage.actions.clickOnOptionsMenu(updatedPostText);

        // Click Delete
        await siteDashboardPage.listFeedComponent.actions.clickDeleteOption();

        // Confirm Delete
        await siteDashboardPage.listFeedComponent.actions.confirmDelete();

        // Verify feed post is removed
        await siteDashboardPage.assertions.validatePostNotVisible(updatedPostText);
        createdPostId = '';
        createdPostText = '';
      }
    );

    test(
      'verify user can create, edit and delete a feed post with file attachment on content feed CONT-19540',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19540'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user can create, edit and delete a feed post with file attachment on content feed',
          zephyrTestId: 'CONT-19540',
          storyId: 'CONT-19540',
        });

        // Get DEFAULT_PUBLIC_SITE_NAME site ID
        const allEmployeesSiteId =
          await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        // Create a page in DEFAULT_PUBLIC_SITE_NAME site for testing
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: allEmployeesSiteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'news',
          },
          options: {
            waitForSearchIndex: false,
          },
        });
        const contentId = pageInfo.contentId;
        const contentType = 'page';

        // Navigate to Content Preview Page
        const contentPreviewPage = new ContentPreviewPage(
          standardUserFixture.page,
          allEmployeesSiteId,
          contentId,
          contentType
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Verify comment option is visible
        await contentPreviewPage.assertions.verifyCommentOptionIsVisible();

        // Create Feed Post (Comment) with Attachment
        const initialPostText = FEED_TEST_DATA.POST_TEXT.INITIAL;

        // Click "Share your thoughts or question" button
        await contentPreviewPage.actions.clickShareThoughtsButton();

        // Get the createFeedPostComponent from contentPreviewPage
        const createFeedPostComponent = contentPreviewPage['createFeedPostComponent'];

        // Upload file "favicon.png"
        const faviconPath = FILE_TEST_DATA.IMAGES.FAVICON.getPath(__dirname);

        // Post the feed with attachment (createAndPost handles text and file upload internally)
        const postResult = await createFeedPostComponent.actions.createAndPost({
          text: initialPostText,
          attachments: {
            files: [faviconPath],
          },
        });

        // Store created post text and postId for cleanup
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Verify comment successfully created
        await contentPreviewPage.assertions.waitForPostToBeVisible(postResult.postText);

        // Verify timestamp displayed
        const listFeedComponent = contentPreviewPage['listFeedComponent'];
        await listFeedComponent.assertions.getPostTimestamp(postResult.postText);

        // Verify inline image preview visible
        const feedPageForContent = new FeedPage(standardUserFixture.page);
        await feedPageForContent.assertions.verifyPostDetails(postResult.postText, postResult.attachmentCount);

        // Edit Feed Post
        const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;

        // Open option menu (three dots)
        await listFeedComponent.actions.openPostOptionsMenu(createdPostText);

        // Click Edit
        await createFeedPostComponent.clickEditOption();

        // Verify editor opens
        await createFeedPostComponent.assertions.verifyEditorVisible();

        await createFeedPostComponent.assertions.verifyAttachedFileCount(1);

        // Update text
        await createFeedPostComponent.actions.updatePostText(updatedPostText);

        // Click Update
        await createFeedPostComponent.actions.clickUpdateButton();

        // Verify updated content appears
        await contentPreviewPage.assertions.waitForPostToBeVisible(updatedPostText);

        // Delete Feed Post
        // Open option menu
        await listFeedComponent.actions.openPostOptionsMenu(updatedPostText);

        // Click Delete
        await listFeedComponent.actions.clickDeleteOption();

        // Confirm Delete
        await listFeedComponent.actions.confirmDelete();

        // Verify feed post is removed
        await contentPreviewPage.assertions.verifyPostIsNotVisible(updatedPostText);
        createdPostId = '';
        createdPostText = '';
      }
    );

    test(
      'verify End User should not be able to search an Private and Unlisted site if he is not a member of a site CONT-24150',
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
        const privateSiteResult = await appManagerFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
          [users.endUser.email],
          SITE_TYPES.PRIVATE
        );
        const privateSiteName = privateSiteResult.siteName;
        console.log(`Using private site: ${privateSiteName}`);

        // Step 2: Get or reuse an unlisted site that standard user is NOT a member of
        const unlistedSiteResult = await appManagerFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
          [users.endUser.email],
          SITE_TYPES.UNLISTED
        );
        const unlistedSiteName = unlistedSiteResult.siteName;
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
      'verify user is able to add video to a feed post using "Browse files" CONT-36599',
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
      'in Zeus, Verify User is able to share a Feed post with a video and message using "Post in SITE FEED" option CONT-28219',
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

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.actions.verifyThePageIsLoaded();

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

        await standardUserFixture.page.reload();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.actions.verifyThePageIsLoaded();

        await feedPage.actions.clickShareIconOnPost(videoPostText);

        // Add a message while sharing
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await feedPage.actions.enterShareDescription(shareMessage);

        // Select Post in "Site Feed" option
        await feedPage.actions.selectShareOptionAsSiteFeed();

        // Search for and select a site
        const siteResult = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public', {
          waitForSearchIndex: false,
        });
        const siteName = siteResult.name;
        await feedPage.actions.enterSiteNameForShare(siteName);

        // Click the "Share" button
        const shareComponent = new ShareComponent(standardUserFixture.page);
        await shareComponent.actions.clickShareButton();

        // Wait for share to complete
        await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

        siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteResult.siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.assertions.validatePostText(shareMessage);

        // Click "View Post" - need to use feedPage on site dashboard
        const siteFeedPage = new FeedPage(standardUserFixture.page);
        await siteFeedPage.actions.clickViewPostLink();

        // Verify the user is navigated to the Feed Detail Page
        // Wait for navigation to feed detail page
        await standardUserFixture.page.waitForURL(new RegExp(`/feed/${createdPostId}`), { timeout: 10000 });
        const feedDetailPage = new FeedPage(standardUserFixture.page, createdPostId);
        await feedDetailPage.assertions.waitForPostToBeVisible(videoPostText);

        // Verify video controls and functionalities
        await feedDetailPage.assertions.verifyVideoControls(videoPostText);
      }
    );

    test(
      'in Zeus Verify User is able to Share a Feed post with a video and message using "Post in HOME FEED" option CONT-28215',
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

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.actions.verifyThePageIsLoaded();

        // Create a Feed post with a native video attachment and a message
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

        await standardUserFixture.page.reload();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.actions.verifyThePageIsLoaded();

        // Click the "Share" icon on the Feed post created by Admin
        await feedPage.actions.clickShareIconOnPost(videoPostText);

        // Add a message while sharing
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await feedPage.actions.enterShareDescription(shareMessage);

        const shareComponent = new ShareComponent(standardUserFixture.page);
        await shareComponent.actions.clickShareButton();

        // Wait for share to complete
        await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

        await feedPage.reloadPage();

        await feedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Click "View Post"
        await feedPage.actions.clickViewPostLink();

        // Verify the user is navigated to the Feed Detail Page
        // Wait for navigation to feed detail page
        await standardUserFixture.page.waitForURL(new RegExp(`/feed/${createdPostId}`));
        const feedDetailPage = new FeedPage(standardUserFixture.page, createdPostId);
        await feedDetailPage.assertions.waitForPostToBeVisible(videoPostText);

        // Verify video controls and functionalities
        await feedDetailPage.assertions.verifyVideoControls(videoPostText);
      }
    );

    test(
      'in Zeus Verify User is able to Share a Feed post with image and mention using "Post in HOME FEED" option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19561'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify User is able to Share a Feed post with image and mention using "Post in HOME FEED" option',
          zephyrTestId: 'CONT-19561',
          storyId: 'CONT-19561',
        });

        const standardUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        const standardUserFullName = standardUserInfo.fullName;

        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();

        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.verifyThePageIsLoaded();

        // Create Post with image1.jpg
        await test.step('Create post with image attachment', async () => {
          await endUserFeedPage.actions.clickShareThoughtsButton();

          const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
          const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);

          // Create post with image attachment
          const postResult = await endUserFeedPage.actions.createAndPost({
            text: postText,
            attachments: {
              files: [imagePath],
            },
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Verify global post is created
          await endUserFeedPage.assertions.waitForPostToBeVisible(postText);
          await endUserFeedPage.assertions.verifyPostDetails(postText, 1); // 1 attachment
        });

        // Share Post with mention and "Post in Home Feed" option
        await test.step('Share post with mention using Post in Home Feed option', async () => {
          const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;

          // Share the post with mention and "Post in Home Feed" option
          await endUserFeedPage.actions.shareFeedPost({
            postText: createdPostText,
            mentionUserName: standardUserFullName,
            shareMessage: shareMessage,
            postIn: 'Home Feed',
          });

          // Verify success message
          await endUserFeedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);
        });

        // Verify shared post is visible on Home Feed
        await test.step('Verify shared post with message, mention, and inline image preview', async () => {
          // Reload page to see the shared post
          await endUserFeedPage.reloadPage();

          // Verify shared post is visible
          const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
          await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage);

          // Verify share message is displayed
          await endUserFeedPage.assertions.validatePostText(shareMessage);

          await endUserFeedPage.assertions.verifyUserNameMentionIsVisible(shareMessage, standardUserFullName);

          await endUserFeedPage.actions.clickInlineImagePreview(shareMessage);
          await endUserFeedPage.assertions.verifyInlineImagePreviewVisible();
          await endUserFeedPage.actions.closeImagePreview();
        });
      }
    );

    test(
      'in Zeus, Verify User is able to share Global Feed Post with image and mention to Public Site Feed using Share button and delete it',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19562'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus, Verify User is able to share Global Feed Post with image and mention to Public Site Feed using Share button and delete it',
          zephyrTestId: 'CONT-19562',
          storyId: 'CONT-19562',
        });

        // Get Standard User1's full name for mention
        const standardUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        const standardUserFullName = standardUserInfo.fullName;

        const publicSiteName = DEFAULT_PUBLIC_SITE_NAME;
        const publicSiteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(publicSiteName);

        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();

        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
        await endUserFeedPage.actions.verifyThePageIsLoaded();

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;

        await test.step('Create post with image attachment on Global Feed', async () => {
          await endUserFeedPage.actions.clickShareThoughtsButton();

          const postResult = await endUserFeedPage.actions.createAndPost({
            text: postText,
            attachments: {
              files: [imagePath],
            },
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Verify global post is created successfully
          await endUserFeedPage.assertions.waitForPostToBeVisible(postText);
          await endUserFeedPage.assertions.verifyPostDetails(postText, 1);
        });

        await test.step('Share post to Site Feed with mention', async () => {
          await endUserFeedPage.actions.shareFeedPost({
            postText: createdPostText,
            mentionUserName: standardUserFullName,
            shareMessage: shareMessage,
            postIn: 'Site Feed',
          });

          await endUserFeedPage.actions.enterSiteNameForShare(publicSiteName);

          const shareComponent = new ShareComponent(standardUserFixture.page);
          await shareComponent.actions.clickShareButton();

          await endUserFeedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);
        });

        await test.step('Verify shared post with mention is visible on Global Feed', async () => {
          await endUserFeedPage.reloadPage();

          await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage);
          await endUserFeedPage.assertions.validatePostText(shareMessage);

          await endUserFeedPage.assertions.verifyUserNameMentionIsVisible(shareMessage, standardUserFullName);
        });

        await test.step('Verify shared post is visible on Site Feed', async () => {
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.actions.clickOnFeedLink();
          await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

          await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage);
          await endUserFeedPage.assertions.validatePostText(shareMessage);

          await endUserFeedPage.assertions.verifyUserNameMentionIsVisible(shareMessage, standardUserFullName);
        });

        await test.step('Delete the post from Global Feed', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await endUserFeedPage.reloadPage();
          await endUserFeedPage.actions.verifyThePageIsLoaded();

          await endUserFeedPage.actions.deletePost(createdPostText);
        });

        await test.step('Verify deleted post is not visible on Site Feed', async () => {
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard to verify deletion' });
          await siteDashboardPage.reloadPage();
          await siteDashboardPage.actions.clickOnFeedLink();
          await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

          await endUserFeedPage.assertions.verifyPostIsNotVisible(shareMessage);
        });

        await test.step('Verify deleted post is not visible on Home Feed', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await endUserFeedPage.reloadPage();
          await endUserFeedPage.actions.verifyThePageIsLoaded();

          await endUserFeedPage.assertions.verifyPostIsNotVisible(shareMessage);

          await endUserFeedPage.assertions.verifyPostIsNotVisible(createdPostText);
        });
      }
    );

    test(
      'sU : Verify site owner or manager can edit or delete comments from other users CONT-26611',
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

        // Delete the post
        await siteDashboardPage.actions.deletePost(updatedPostText);
        createdPostId = ''; // Clear post ID as post is already deleted
        await siteDashboardPage.assertions.validatePostNotVisible(updatedPostText);
      }
    );

    test(
      'sU : Verify that application should not allow user to view the Private or unlisted site content comment using link CONT-26362',
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

    test(
      'in Zeus, verify that a user is not allowed to add any attachment or media while sharing a Feed post CONT-26727',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-26727'],
      },
      async ({ appManagerFixture, appManagerApiContext, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus, verify that a user is not allowed to add any attachment or media while sharing a Feed post',
          zephyrTestId: 'CONT-26727',
          storyId: 'CONT-26727',
        });

        // Initialize identity management helper
        identityManagementHelper = new IdentityManagementHelper(
          appManagerApiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );

        // Fetch common test data via API calls
        const [endUserInfo, topicList, publicSite] = await Promise.all([
          identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          appManagerFixture.contentManagementHelper.getTopicList(),
          appManagerFixture.siteManagementHelper.getSiteByAccessType('public'),
        ]);

        // Set data for test use via API calls
        standardUserFullName = endUserInfo.fullName;
        publicSiteName = publicSite.name;

        // Search for "Simpplr" topic, otherwise use first available topic
        simpplrTopic = topicList.result.listOfItems.find((topic: any) => topic.name.toLowerCase() === 'simpplr');
        if (!simpplrTopic) {
          console.log('Simpplr topic not found, using first available topic');
          simpplrTopic = topicList.result.listOfItems[0];
        }

        console.log('Test data retrieved:');
        console.log('Standard User Full Name:', standardUserFullName);
        console.log('Public Site Name:', publicSiteName);
        console.log('Simpplr Topic:', simpplrTopic?.name);

        // Initialize feed page for admin
        adminFeedPage = new FeedPage(appManagerFixture.page);

        // Navigate to Home-Global Feed as Admin
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminFeedPage.verifyThePageIsLoaded();

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

        // Navigate end user to the feed post
        await test.step('Navigate EndUser to the feed post', async () => {
          endUserFeedPage = new FeedPage(standardUserFixture.page, createdPostId);
          await standardUserFixture.page.goto(endUserFeedPage.url);
          await endUserFeedPage.assertions.waitForPostToBeVisible(createdPostText);
        });

        // Click Share button on the post
        await endUserFeedPage.actions.clickShareButtonOnPost(createdPostText);
        await endUserFeedPage.assertions.verifyShareModalIsOpen();
        // Attempt to paste an image (simulates user pasting image from clipboard)
        await endUserFeedPage.actions.attemptImagePasteInShareModal();

        await endUserFeedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.IMAGE_ADDED_TO_ATTACHMENTS);

        // Verify no attachments are visible
        await endUserFeedPage.assertions.verifyNoAttachmentsInShareModal();

        // Verify share modal remains functional
        await endUserFeedPage.assertions.verifyShareModalIsFunctional();
      }
    );

    test(
      'in Zeus, Verify User is able to view "THIS POST HAS BEEN DELETED" message when User doesn\'t have access to the Feed post shared on Private or Unlisted Site CONT-26801',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26801'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus, Verify User is able to view "THIS POST HAS BEEN DELETED" message when User doesn\'t have access to the Feed post shared on Private or Unlisted Site',
          zephyrTestId: 'CONT-26801',
          storyId: 'CONT-26801',
        });

        // Login as Admin
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();

        // Get or create a private site where Site Owner is the owner
        const siteManagerprivateSites = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          filter: SITE_TYPES.PRIVATE,
        });

        const standardUserPrivateSites = await standardUserFixture.siteManagementHelper.getListOfSites({
          filter: SITE_TYPES.PRIVATE,
        });

        const standardUserSiteIds = new Set(
          standardUserPrivateSites.result.listOfItems.map((site: any) => site.siteId)
        );

        const privateSiteDetails = siteManagerprivateSites.result.listOfItems.find(
          (site: any) => site.isActive === true && !standardUserSiteIds.has(site.siteId)
        );

        let privateSiteId = privateSiteDetails?.siteId;
        let privateSiteName = privateSiteDetails?.name;

        if (!privateSiteDetails) {
          console.log(
            'No private site found where Site Owner is the owner and standard user is not a member, Hence creating a new private site'
          );
        } else {
          const siteName = `Private Site ${faker.company.name()}`;
          const privateSiteDetailsResponse = await appManagerApiFixture.siteManagementHelper.createSite({
            siteName: siteName,
            accessType: SITE_TYPES.PRIVATE,
            waitForSearchIndex: false,
          });
          privateSiteId = privateSiteDetailsResponse.siteId;
          privateSiteName = privateSiteDetailsResponse.siteName;
        }
        console.log(`Using private site: ${privateSiteName}`);

        // Create a Feed post on "Private Site" from Home Dashboard
        await adminFeedPage.actions.clickShareThoughtsButton();
        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        await adminFeedPage.actions.enterFeedPostText(postText);

        // Select "Post in Site Feed" option
        await adminFeedPage.actions.selectShareOptionAsSiteFeed();

        // Enter private site name
        await adminFeedPage.actions.enterSiteNameForShare(privateSiteName || '');

        // Post the feed
        const postResult = await adminFeedPage.actions.createAndPost({
          text: postText,
        });
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await adminFeedPage.assertions.waitForPostToBeVisible(postText);

        const siteOwnerDashboardPage = new SiteDashboardPage(siteManagerFixture.page, privateSiteId || '');
        await siteOwnerDashboardPage.loadPage({ stepInfo: 'Load private site dashboard page' });
        await siteOwnerDashboardPage.actions.clickOnFeedLink();
        await siteOwnerDashboardPage.navigateToTab(SitePageTab.FeedTab);
        const siteOwnerFeedPage = new FeedPage(siteManagerFixture.page);

        // Wait for the post to be visible on the Private Site's feed
        await siteOwnerFeedPage.assertions.waitForPostToBeVisible(postText);

        // Click Share icon on the feed post created on Private Site
        await siteOwnerFeedPage.actions.clickShareIconOnPost(postText);

        //  Add a Message
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await siteOwnerFeedPage.actions.enterShareDescription(shareMessage);

        // Click "Share" button
        const shareComponent = new ShareComponent(siteManagerFixture.page);
        await shareComponent.actions.clickShareButton();

        // Verify success message "Shared Feed post successfully."
        await siteOwnerFeedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.reloadPage();

        // Verify "End User" is able to view "Site Owner's" shared feed post with the message
        await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Verify "End User" is unable to view the original post and is displayed with message "This post has been deleted"
        await endUserFeedPage.assertions.verifyDeletedPostMessage(shareMessage);

        // Verify user cannot interact with the deleted post
        await endUserFeedPage.assertions.verifyPostCannotBeInteracted(postText);
      }
    );

    test(
      'verify user can create and share recognition from home feed CONT-28581',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-28581'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Create and Share Recognition from Home Feed',
          zephyrTestId: 'CONT-28581',
          storyId: 'CONT-28581',
        });

        // Navigate to Home tab
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Click Share your thoughts or questions
        await feedPage.actions.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = feedPage['createFeedPostComponent'];
        await createFeedPostComponent.clickRecognitionTab();

        const recognitionForm = new RecognitionFormComponent(appManagerFixture.page);

        // Verify recognition form is loaded and ready
        await recognitionForm.verifyRecognitionFormIsLoaded();

        // Select recognition award under "Recognition for"
        await recognitionForm.selectPeerRecognitionAward(0);

        // Select a user to recognize under "Who do you want to recognize?"
        await recognitionForm.selectUserForRecognition(0);

        // Enter a message
        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionForm.enterRecognitionMessage(recognitionMessage);

        // Click Recognize button
        await recognitionForm.clickRecognizeButtonAndWaitForShareDialog();

        // Select Post in Home feed in the share dialog
        await recognitionForm.selectPostInHomeFeedInShareDialog();

        // Click Share post button to share the recognition
        await recognitionForm.clickSharePostButton();

        // Wait for share dialog to close before reloading
        await recognitionForm.waitForShareDialogToClose();

        // Reload the page to ensure the recognition post appears
        await feedPage.reloadPage();

        // Verify the Recognition feed post is created on Home feed
        await feedPage.assertions.waitForPostToBeVisible(recognitionMessage);

        // Click on Avatar profile menu and navigate to Recognition
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        // Create instance of RecognitionHubPage from reward module
        const recognitionHubPage = new RecognitionHubPage(appManagerFixture.page);

        // Verify Recognition appears on the Recognition dashboard for the selected user
        await recognitionHubPage.verifyRecognitionPostVisible(recognitionMessage);
      }
    );

    test.describe(
      'inappropriate content warning tests CONT-28090',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION],
      },
      () => {
        // Shared setup variables
        let publicSiteId: string;
        let pageContent: any;
        let endUserInfo: any;
        let siteManagerInfo: any;
        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;

        test.beforeEach('Setup test data', async ({ appManagerApiFixture, appManagerFixture }) => {
          // Get site
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: false,
          });
          publicSiteId = publicSite.siteId;

          // Get user info and create page in parallel
          const [endUser, siteManager, page] = await Promise.all([
            appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
            appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
            appManagerApiFixture.contentManagementHelper.createPage({
              siteId: publicSiteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
              options: { waitForSearchIndex: false },
            }),
          ]);
          endUserInfo = endUser;
          siteManagerInfo = siteManager;
          pageContent = page;

          // Set feed posting permission
          const manageSitePage = new ManageSitePage(appManagerFixture.page);
          await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
          await manageSitePage.actions.setFeedPostingPermission(FeedPostingPermission.EVERYONE);
        });

        // Helper function to test Home Dashboard inappropriate content warning
        const testHomeDashboardWarning = async (userFixture: any, inappropriateText: string) => {
          const homeFeedPage = new FeedPage(userFixture.page);
          await userFixture.homePage.loadPage();
          await userFixture.homePage.verifyThePageIsLoaded();
          await userFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await homeFeedPage.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          await homeFeedPage.actions.createPost(inappropriateText);

          // Click Post button
          await homeFeedPage.actions.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Close the popup
          await warningPopup.actions.clickCancel();
        };

        // Helper function to test Site Dashboard inappropriate content warning
        const testSiteDashboardWarning = async (userFixture: any, siteId: string, inappropriateText: string) => {
          const siteDashboard = new SiteDashboardPage(userFixture.page, siteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await siteDashboard.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = siteDashboard['createFeedPostComponent'];
          await createFeedPostComponent.actions.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.actions.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Close the popup
          await warningPopup.actions.clickCancel();
        };

        // Helper function to test Content Page inappropriate content warning
        const testContentPageWarning = async (
          userFixture: any,
          siteId: string,
          contentId: string,
          inappropriateText: string
        ) => {
          const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          // Verify comment option is visible
          await contentPreviewPage.assertions.verifyCommentOptionIsVisible();

          // Click Share your thoughts button
          await contentPreviewPage.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
          await createFeedPostComponent.actions.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.actions.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Close the popup
          await warningPopup.actions.clickCancel();
        };

        test(
          'verify warning popup appears when inappropriate content is submitted for App Manager and Standard User CONT-42996',
          {
            tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-28090', '@inappropriate-content-warning'],
          },
          async ({ appManagerFixture, standardUserFixture }) => {
            tagTest(test.info(), {
              description:
                'Verify warning popup appears when inappropriate content is submitted for App Manager and Standard User',
              zephyrTestId: 'CONT-28090',
              storyId: 'CONT-28090',
            });

            // Group 1: Home Dashboard Tests - App Manager and Standard User in parallel
            await Promise.all([
              testHomeDashboardWarning(appManagerFixture, inappropriatePostText),
              testHomeDashboardWarning(standardUserFixture, inappropriatePostText),
            ]);

            // Group 2: Site Dashboard Tests - App Manager and Standard User in parallel
            await Promise.all([
              testSiteDashboardWarning(appManagerFixture, publicSiteId, inappropriatePostText),
              testSiteDashboardWarning(standardUserFixture, publicSiteId, inappropriatePostText),
            ]);

            // Group 3: Content Page Tests - App Manager and Standard User in parallel
            await Promise.all([
              testContentPageWarning(appManagerFixture, publicSiteId, pageContent.contentId, inappropriatePostText),
              testContentPageWarning(standardUserFixture, publicSiteId, pageContent.contentId, inappropriatePostText),
            ]);
          }
        );

        test(
          'verify warning popup appears when inappropriate content is submitted for Site Manager and Site Content Manager CONT-42996',
          {
            tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-42996', '@inappropriate-content-warning'],
          },
          async ({ appManagerApiFixture, siteManagerFixture, standardUserFixture }) => {
            tagTest(test.info(), {
              description:
                'Verify warning popup appears when inappropriate content is submitted for Site Manager and Site Content Manager',
              zephyrTestId: 'CONT-42996',
              storyId: 'CONT-42996',
            });

            // Assign Site Manager role
            await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
              siteId: publicSiteId,
              userId: siteManagerInfo.userId,
              role: SitePermission.MANAGER,
            });

            // Assign Site Content Manager role
            await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
              siteId: publicSiteId,
              userId: endUserInfo.userId,
              role: SitePermission.CONTENT_MANAGER,
            });

            // Group 1: Home Dashboard Tests - Site Manager and Site Content Manager in parallel
            await Promise.all([
              testHomeDashboardWarning(siteManagerFixture, inappropriatePostText),
              testHomeDashboardWarning(standardUserFixture, inappropriatePostText),
            ]);

            // Group 2: Site Dashboard Tests - Site Manager and Site Content Manager in parallel
            await Promise.all([
              testSiteDashboardWarning(siteManagerFixture, publicSiteId, inappropriatePostText),
              testSiteDashboardWarning(standardUserFixture, publicSiteId, inappropriatePostText),
            ]);

            // Group 3: Content Page Tests - Site Manager and Site Content Manager in parallel
            await Promise.all([
              testContentPageWarning(siteManagerFixture, publicSiteId, pageContent.contentId, inappropriatePostText),
              testContentPageWarning(standardUserFixture, publicSiteId, pageContent.contentId, inappropriatePostText),
            ]);
          }
        );

        test(
          'verify warning popup appears when inappropriate content is submitted for Site Member CONT-42997',
          {
            tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-42997', '@inappropriate-content-warning'],
          },
          async ({ appManagerApiFixture, standardUserFixture }) => {
            tagTest(test.info(), {
              description: 'Verify warning popup appears when inappropriate content is submitted for Site Member',
              zephyrTestId: 'CONT-42997',
              storyId: 'CONT-42997',
            });

            // Test Member role - Sequential context testing
            await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
              siteId: publicSiteId,
              userId: endUserInfo.userId,
              role: SitePermission.MEMBER,
            });

            await testHomeDashboardWarning(standardUserFixture, inappropriatePostText);
            await testSiteDashboardWarning(standardUserFixture, publicSiteId, inappropriatePostText);
            await testContentPageWarning(
              standardUserFixture,
              publicSiteId,
              pageContent.contentId,
              inappropriatePostText
            );
          }
        );
        test(
          'verify warning popup appears when inappropriate content is submitted for Site Owner CONT-42999',
          {
            tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-42999', '@inappropriate-content-warning'],
          },
          async ({ appManagerApiFixture, standardUserFixture }) => {
            tagTest(test.info(), {
              description: 'Verify warning popup appears when inappropriate content is submitted for Site Owner',
              zephyrTestId: 'CONT-42999',
              storyId: 'CONT-42999',
            });

            await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
              siteId: publicSiteId,
              userId: endUserInfo.userId,
              role: SitePermission.OWNER,
            });

            await testHomeDashboardWarning(standardUserFixture, inappropriatePostText);
            await testSiteDashboardWarning(standardUserFixture, publicSiteId, inappropriatePostText);
            await testContentPageWarning(
              standardUserFixture,
              publicSiteId,
              pageContent.contentId,
              inappropriatePostText
            );
          }
        );
      }
    );

    test(
      'verify user can create and share recognition from site feed CONT-28582',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-28582'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Create and Share Recognition from Site Feed',
          zephyrTestId: 'CONT-28582',
          storyId: 'CONT-28582',
        });

        // Get or create a site for testing
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        const siteName = siteDetails.name;

        // Load Site Dashboard page
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteDetails.siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Click Share your thoughts or questions on Site Dashboard
        await siteDashboardPage.actions.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = siteDashboardPage['createFeedPostComponent'];
        await createFeedPostComponent.clickRecognitionTab();

        const recognitionForm = new RecognitionFormComponent(appManagerFixture.page);

        // Verify recognition form is loaded and ready
        await recognitionForm.verifyRecognitionFormIsLoaded();

        // Select recognition award under "Recognition for"
        await recognitionForm.selectPeerRecognitionAward(0);

        // Select a user to recognize under "Who do you want to recognize?"
        await recognitionForm.selectUserForRecognition(0);

        // Enter a message
        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionForm.enterRecognitionMessage(recognitionMessage);

        // Click Recognize button
        await recognitionForm.clickRecognizeButtonAndWaitForShareDialog();

        // Select Post in Site feed in the share dialog
        await recognitionForm.selectPostInSiteFeedInShareDialog();

        // Select the site from dropdown
        await recognitionForm.selectSiteInShareDialog(siteName);

        // Click Share post button to share the recognition
        await recognitionForm.clickSharePostButton();

        // Wait for share dialog to close before reloading
        await recognitionForm.waitForShareDialogToClose();

        // Reload the page to ensure the recognition post appears
        await siteDashboardPage.reloadPage();

        // Verify the Recognition feed post is created on Site feed
        await siteDashboardPage.listFeedComponent.assertions.waitForPostToBeVisible(recognitionMessage);

        // Click on Avatar profile menu and navigate to Recognition
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        // Create instance of RecognitionHubPage from reward module
        const recognitionHubPage = new RecognitionHubPage(appManagerFixture.page);

        // Verify Recognition appears on the Recognition dashboard for the selected user
        await recognitionHubPage.verifyRecognitionPostVisible(recognitionMessage);
      }
    );

    test(
      'verify user cancels inappropriate content warning and can edit toxic content in Feed post or Comment CONT-28091',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-28091'],
      },
      async ({ appManagerFixture, appManagerApiFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify user cancels inappropriate content warning and can edit toxic content in Feed post or Comment for all roles',
          zephyrTestId: 'CONT-28091',
          storyId: 'CONT-28091',
        });

        // Inappropriate and edited text to test
        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
        const editedPostText = FEED_TEST_DATA.POST_TEXT.EDITED_POST_TEXT;

        // Phase 1: Parallel Setup - Get site, user info, and create content in parallel
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;

        const [endUserInfo, siteManagerInfo, pageContent] = await Promise.all([
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
          appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
            options: { waitForSearchIndex: false },
          }),
        ]);

        // Pre-assign Site Manager role (needed for Group 1-3 parallel tests)
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId: siteManagerInfo.userId,
          role: SitePermission.MANAGER,
        });

        // Helper function to test Home Dashboard cancel and edit inappropriate content
        const testHomeDashboardCancelAndEdit = async (
          userFixture: any,
          inappropriateText: string,
          editedText: string
        ) => {
          const homeFeedPage = new FeedPage(userFixture.page);
          await userFixture.homePage.loadPage();
          await userFixture.homePage.verifyThePageIsLoaded();
          await userFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await homeFeedPage.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          await homeFeedPage.actions.createPost(inappropriateText);

          // Click Post button
          await homeFeedPage.actions.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.actions.clickCancel();

          // Verify popup is closed
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Verify editor is still visible and editable
          const createFeedPostComponent = homeFeedPage['createFeedPostComponent'];
          await createFeedPostComponent.assertions.verifyEditorVisible();

          // Edit the content - clear and enter appropriate text
          await createFeedPostComponent.actions.updatePostText(editedText);

          // Verify the edited text is in the editor
          const editorContent = await createFeedPostComponent.feedEditor.textContent();
          if (!editorContent?.includes(editedText)) {
            throw new Error(`Editor should contain edited text "${editedText}", but found: ${editorContent}`);
          }
        };

        // Helper function to test Site Dashboard cancel and edit inappropriate content
        const testSiteDashboardCancelAndEdit = async (
          userFixture: any,
          siteId: string,
          inappropriateText: string,
          editedText: string
        ) => {
          const siteDashboard = new SiteDashboardPage(userFixture.page, siteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await siteDashboard.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = siteDashboard['createFeedPostComponent'];
          await createFeedPostComponent.actions.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.actions.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.actions.clickCancel();

          // Verify popup is closed
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Verify editor is still visible and editable
          await createFeedPostComponent.assertions.verifyEditorVisible();

          // Edit the content - clear and enter appropriate text
          await createFeedPostComponent.actions.updatePostText(editedText);

          // Verify the edited text is in the editor
          const editorContent = await createFeedPostComponent.feedEditor.textContent();
          if (!editorContent?.includes(editedText)) {
            throw new Error(`Editor should contain edited text "${editedText}", but found: ${editorContent}`);
          }
        };

        // Helper function to test Content Page cancel and edit inappropriate content
        const testContentPageCancelAndEdit = async (
          userFixture: any,
          siteId: string,
          contentId: string,
          inappropriateText: string,
          editedText: string
        ) => {
          const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          // Verify comment option is visible
          await contentPreviewPage.assertions.verifyCommentOptionIsVisible();

          // Click Share your thoughts button
          await contentPreviewPage.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
          await createFeedPostComponent.actions.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.actions.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.actions.clickCancel();

          // Verify popup is closed
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Verify editor is still visible and editable
          await createFeedPostComponent.assertions.verifyEditorVisible();

          // Edit the content - clear and enter appropriate text
          await createFeedPostComponent.actions.updatePostText(editedText);

          // Verify the edited text is in the editor
          const editorContent = await createFeedPostComponent.feedEditor.textContent();
          if (!editorContent?.includes(editedText)) {
            throw new Error(`Editor should contain edited text "${editedText}", but found: ${editorContent}`);
          }
        };

        // Phase 2: Parallel Context Testing

        // Group 1: Home Dashboard Tests - All users in parallel
        await Promise.all([
          testHomeDashboardCancelAndEdit(appManagerFixture, inappropriatePostText, editedPostText),
          testHomeDashboardCancelAndEdit(standardUserFixture, inappropriatePostText, editedPostText),
          testHomeDashboardCancelAndEdit(siteManagerFixture, inappropriatePostText, editedPostText),
        ]);

        // Group 2: Site Dashboard Tests - All users in parallel
        await Promise.all([
          testSiteDashboardCancelAndEdit(appManagerFixture, publicSiteId, inappropriatePostText, editedPostText),
          testSiteDashboardCancelAndEdit(standardUserFixture, publicSiteId, inappropriatePostText, editedPostText),
          testSiteDashboardCancelAndEdit(siteManagerFixture, publicSiteId, inappropriatePostText, editedPostText),
        ]);

        // Group 3: Content Page Tests - All users in parallel
        await Promise.all([
          testContentPageCancelAndEdit(
            appManagerFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText,
            editedPostText
          ),
          testContentPageCancelAndEdit(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText,
            editedPostText
          ),
          testContentPageCancelAndEdit(
            siteManagerFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText,
            editedPostText
          ),
        ]);

        // Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId: endUserInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });

        await testHomeDashboardCancelAndEdit(standardUserFixture, inappropriatePostText, editedPostText);
        await testSiteDashboardCancelAndEdit(standardUserFixture, publicSiteId, inappropriatePostText, editedPostText);
        await testContentPageCancelAndEdit(
          standardUserFixture,
          publicSiteId,
          pageContent.contentId,
          inappropriatePostText,
          editedPostText
        );

        // Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId: endUserInfo.userId,
          role: SitePermission.MEMBER,
        });

        await testHomeDashboardCancelAndEdit(standardUserFixture, inappropriatePostText, editedPostText);
        await testSiteDashboardCancelAndEdit(standardUserFixture, publicSiteId, inappropriatePostText, editedPostText);
        await testContentPageCancelAndEdit(
          standardUserFixture,
          publicSiteId,
          pageContent.contentId,
          inappropriatePostText,
          editedPostText
        );

        // Site Owner
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId: endUserInfo.userId,
          role: SitePermission.OWNER,
        });

        await testHomeDashboardCancelAndEdit(standardUserFixture, inappropriatePostText, editedPostText);
        await testSiteDashboardCancelAndEdit(standardUserFixture, publicSiteId, inappropriatePostText, editedPostText);
        await testContentPageCancelAndEdit(
          standardUserFixture,
          publicSiteId,
          pageContent.contentId,
          inappropriatePostText,
          editedPostText
        );
      }
    );

    test(
      'verify user can create and share recognition from home feed to site feed CONT-28583',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-28583'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Create and Share Recognition from Home Feed to a Site',
          zephyrTestId: 'CONT-28583',
          storyId: 'CONT-28583',
        });

        // Get or create a site for testing
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const siteName = siteDetails.name;

        // Navigate to Home tab
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Click Share your thoughts or questions
        await feedPage.actions.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = feedPage['createFeedPostComponent'];
        await createFeedPostComponent.clickRecognitionTab();

        const recognitionForm = new RecognitionFormComponent(appManagerFixture.page);

        // Verify recognition form is loaded and ready
        await recognitionForm.verifyRecognitionFormIsLoaded();

        // Select recognition award under "Recognition for"
        await recognitionForm.selectPeerRecognitionAward(0);

        // Select a user to recognize under "Who do you want to recognize?"
        await recognitionForm.selectUserForRecognition(0);

        // Enter a message
        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionForm.enterRecognitionMessage(recognitionMessage);

        // Click Recognize button
        await recognitionForm.clickRecognizeButtonAndWaitForShareDialog();

        // Select Post in Site feed in the share dialog
        await recognitionForm.selectPostInSiteFeedInShareDialog();

        // Select the site from dropdown
        await recognitionForm.selectSiteInShareDialog(siteName);

        // Click Share post button to share the recognition
        await recognitionForm.clickSharePostButton();

        // Wait for share dialog to close before navigating
        await recognitionForm.waitForShareDialogToClose();

        // Navigate to Site Dashboard to verify the post
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteDetails.siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Reload the page to ensure the recognition post appears
        await siteDashboardPage.reloadPage();

        // Verify the Recognition feed post is created on Site feed
        await siteDashboardPage.listFeedComponent.assertions.waitForPostToBeVisible(recognitionMessage);

        // Click on Avatar profile menu and navigate to Recognition
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        // Create instance of RecognitionHubPage from reward module
        const recognitionHubPage = new RecognitionHubPage(appManagerFixture.page);

        // Verify Recognition appears on the Recognition dashboard for the selected user
        await recognitionHubPage.verifyRecognitionPostVisible(recognitionMessage);
      }
    );

    test(
      'verify inappropriate content warning when sharing feed posts/comments CONT-28474',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-28474'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify inappropriate content warning when sharing feed posts/comments for End User',
          zephyrTestId: 'CONT-28474',
          storyId: 'CONT-28474',
        });

        // Inappropriate and edited text to test
        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
        const editedPostText = FEED_TEST_DATA.POST_TEXT.EDITED_POST_TEXT;

        // Variables for cleanup
        const createdFeedIds: string[] = [];

        // Phase 1: Setup - Admin creates posts/comments
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;
        const publicSiteName = publicSite.name;

        const pageContent = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: publicSiteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: { waitForSearchIndex: false },
        });

        // Admin creates a post on Home Dashboard
        const adminHomeFeedPage = new FeedPage(appManagerFixture.page);
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminHomeFeedPage.verifyThePageIsLoaded();
        await adminHomeFeedPage.actions.clickShareThoughtsButton();
        const homePostText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const homePostResult = await adminHomeFeedPage.actions.createAndPost({
          text: homePostText,
        });
        if (homePostResult.postId) createdFeedIds.push(homePostResult.postId);
        await adminHomeFeedPage.assertions.waitForPostToBeVisible(homePostText);

        // Admin creates a post on Site Dashboard
        const adminSiteDashboard = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
        await adminSiteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
        await adminSiteDashboard.navigateToTab(SitePageTab.DashboardTab);
        await adminSiteDashboard.verifyThePageIsLoaded();
        await adminSiteDashboard.actions.clickShareThoughtsButton();
        const sitePostText = `Site Dashboard Post ${homePostText}`;
        const sitePostResult = await adminSiteDashboard['createFeedPostComponent'].actions.createAndPost({
          text: sitePostText,
        });
        if (sitePostResult.postId) createdFeedIds.push(sitePostResult.postId);
        const adminSiteFeedPage = new FeedPage(appManagerFixture.page);
        await adminSiteFeedPage.assertions.waitForPostToBeVisible(sitePostText);

        // Admin creates a comment on Content page
        const adminContentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          publicSiteId,
          pageContent.contentId,
          'page'
        );
        await adminContentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await adminContentPreviewPage.verifyThePageIsLoaded();
        await adminContentPreviewPage.actions.clickShareThoughtsButton();
        const commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const commentPostResult = await adminContentPreviewPage['createFeedPostComponent'].actions.createAndPost({
          text: commentText,
        });
        if (commentPostResult.postId) createdFeedIds.push(commentPostResult.postId);
        await adminContentPreviewPage.assertions.waitForPostToBeVisible(commentText);

        // Phase 2: Helper Functions for Share Flows

        // Common helper to handle share with inappropriate content warning (Cancel and Submit Anyway flows)
        const testShareWithInappropriateContent = async (
          userFixture: any,
          clickShareIcon: () => Promise<void>,
          inappropriateText: string,
          editedText: string,
          selectPostLocation?: () => Promise<void>
        ) => {
          const shareComponent = new ShareComponent(userFixture.page);
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);

          // Step 1: Cancel Flow
          await clickShareIcon();
          await shareComponent.assertions.verifyShareModalIsFunctional();
          await shareComponent.actions.enterShareDescription(inappropriateText);

          // Select post location if provided (for Site Feed)
          if (selectPostLocation) {
            await selectPostLocation();
          }

          await shareComponent.actions.clickShareButton();
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickCancel();
          await warningPopup.assertions.verifyWarningPopupClosed();
          await shareComponent.assertions.verifyShareModalIsFunctional();

          // Edit content (still inappropriate to test Submit Anyway)
          await shareComponent.actions.enterShareDescription(inappropriateText);

          // Step 2: Submit Anyway Flow
          await shareComponent.actions.clickShareButton();
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();
        };

        // Helper function to test Home Dashboard share flow
        const testHomeDashboardShare = async (
          userFixture: any,
          postText: string,
          inappropriateText: string,
          editedText: string,
          siteName: string
        ) => {
          const homeFeedPage = new FeedPage(userFixture.page);
          await userFixture.homePage.loadPage();
          await userFixture.homePage.verifyThePageIsLoaded();
          await userFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.verifyThePageIsLoaded();

          await testShareWithInappropriateContent(
            userFixture,
            () => homeFeedPage.actions.clickShareIconOnPost(postText),
            inappropriateText,
            editedText,
            async () => {
              const shareComponent = new ShareComponent(userFixture.page);
              await shareComponent.selectShareOptionAsSiteFeed();
              await shareComponent.actions.enterSiteName(siteName);
            }
          );
        };

        // Helper function to test Site Dashboard share flow
        const testSiteDashboardShare = async (
          userFixture: any,
          siteId: string,
          postText: string,
          inappropriateText: string,
          editedText: string
        ) => {
          const siteDashboard = new SiteDashboardPage(userFixture.page, siteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();

          const siteFeedPage = new FeedPage(userFixture.page);
          await testShareWithInappropriateContent(
            userFixture,
            () => siteFeedPage.actions.clickShareIconOnPost(postText),
            inappropriateText,
            editedText
          );
        };

        // Helper function to test Content Comment share flow
        const testContentCommentShare = async (
          userFixture: any,
          siteId: string,
          contentId: string,
          commentText: string,
          inappropriateText: string,
          editedText: string
        ) => {
          const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          const feedPage = new FeedPage(userFixture.page);
          await testShareWithInappropriateContent(
            userFixture,
            () => feedPage.actions.clickShareIconOnPost(commentText),
            inappropriateText,
            editedText
          );
        };

        // Phase 3: Test Execution (as End User)
        await testHomeDashboardShare(
          standardUserFixture,
          homePostText,
          inappropriatePostText,
          editedPostText,
          publicSiteName
        );

        await testSiteDashboardShare(
          standardUserFixture,
          publicSiteId,
          sitePostText,
          inappropriatePostText,
          editedPostText
        );

        await testContentCommentShare(
          standardUserFixture,
          publicSiteId,
          pageContent.contentId,
          commentText,
          inappropriatePostText,
          editedPostText
        );

        // Cleanup: Delete created feeds
        for (const feedId of createdFeedIds) {
          try {
            await appManagerApiFixture.feedManagementHelper.deleteFeed(feedId);
          } catch (error) {
            console.warn(`Failed to cleanup feed ${feedId}:`, error);
          }
        }
      }
    );

    test(
      'verify user can create and share recognition from site feed to home feed CONT-28584',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-28584'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Create and Share Recognition from Site Feed to Home Dashboard',
          zephyrTestId: 'CONT-28584',
          storyId: 'CONT-28584',
        });

        // Get or create a site for testing
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        // Load Site Dashboard page
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteDetails.siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Click Share your thoughts or questions on Site Dashboard
        await siteDashboardPage.actions.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = siteDashboardPage['createFeedPostComponent'];
        await createFeedPostComponent.clickRecognitionTab();

        const recognitionForm = new RecognitionFormComponent(appManagerFixture.page);

        // Verify recognition form is loaded and ready
        await recognitionForm.verifyRecognitionFormIsLoaded();

        // Select recognition award under "Recognition for"
        await recognitionForm.selectPeerRecognitionAward(0);

        // Select a user to recognize under "Who do you want to recognize?"
        await recognitionForm.selectUserForRecognition(0);

        // Enter a message
        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionForm.enterRecognitionMessage(recognitionMessage);

        // Click Recognize button
        await recognitionForm.clickRecognizeButtonAndWaitForShareDialog();

        // Select Post in Home feed in the share dialog
        await recognitionForm.selectPostInHomeFeedInShareDialog();

        // Click Share post button to share the recognition
        await recognitionForm.clickSharePostButton();

        // Wait for share dialog to close before navigating
        await recognitionForm.waitForShareDialogToClose();

        // Navigate to Home Feed to verify the post
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Reload the page to ensure the recognition post appears
        await feedPage.reloadPage();

        // Verify the Recognition feed post is created on Home feed
        await feedPage.assertions.waitForPostToBeVisible(recognitionMessage);

        // Click on Avatar profile menu and navigate to Recognition
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        // Create instance of RecognitionHubPage from reward module
        const recognitionHubPage = new RecognitionHubPage(appManagerFixture.page);

        // Verify Recognition appears on the Recognition dashboard for the selected user
        await recognitionHubPage.verifyRecognitionPostVisible(recognitionMessage);
      }
    );

    test(
      'in Zeus verify user submits inappropriate content while sharing a content to home dashboard and site dashboard CONT-28476',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-28476'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify User submits inappropriate content while Sharing a Content to Home Dashboard and Site Dashboard',
          zephyrTestId: 'CONT-28476',
          storyId: 'CONT-28476',
        });

        // Inappropriate text to test
        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;

        // Phase 1: Setup - Admin creates content
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;
        const publicSiteName = publicSite.name;

        // Admin creates content
        const pageContent = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: publicSiteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: { waitForSearchIndex: false },
        });

        // Helper function to test sharing content with inappropriate content warning (Cancel and Submit Anyway flows)
        const testShareContentWithInappropriateContent = async (
          userFixture: any,
          siteId: string,
          contentId: string,
          inappropriateText: string,
          postIn: 'Home Feed' | 'Site Feed',
          siteName?: string
        ) => {
          const shareComponent = new ShareComponent(userFixture.page);
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);

          // Navigate to site and content (matching scenario: Search site -> Click content tab -> Click content)
          const siteDashboardPage = new SiteDashboardPage(userFixture.page, siteId);
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.navigateToTab(SitePageTab.ContentTab);

          // Navigate to content page
          const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          // Click Share icon on the Content
          await contentPreviewPage.actions.clickShareContentButton();

          // Wait for share modal to appear
          await shareComponent.assertions.verifyShareModalIsFunctional();

          // Step 1: Cancel Flow
          // Enter inappropriate text
          await shareComponent.actions.enterShareDescription(inappropriateText);

          // Select post location
          if (postIn === 'Site Feed') {
            await shareComponent.selectShareOptionAsSiteFeed();
            if (siteName) {
              await shareComponent.actions.enterSiteName(siteName);
            }
          }

          // Click Share button
          await shareComponent.actions.clickShareButton();

          // Verify warning popup appears
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.actions.clickCancel();

          // Verify popup is closed
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Verify share modal is still functional and user can edit content
          await shareComponent.assertions.verifyShareModalIsFunctional();

          // Step 2: Submit Anyway Flow
          // Enter inappropriate text again
          await shareComponent.actions.enterShareDescription(inappropriateText);

          // Click Share button
          await shareComponent.actions.clickShareButton();

          // Verify warning popup appears
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Submit Anyway button (Continue button)
          await warningPopup.actions.clickContinue();

          // Verify popup is closed
          await warningPopup.assertions.verifyWarningPopupClosed();
        };

        // Phase 2: Test Execution (as End User)

        // Test Home Feed scenario
        await test.step('Test Home Feed: Inappropriate content warning when sharing content', async () => {
          await testShareContentWithInappropriateContent(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText,
            'Home Feed'
          );
        });

        // Test Site Feed scenario
        await test.step('Test Site Feed: Inappropriate content warning when sharing content', async () => {
          await testShareContentWithInappropriateContent(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText,
            'Site Feed',
            publicSiteName
          );
        });
      }
    );

    test(
      'in Zeus verify user submits inappropriate content while sharing a file to home dashboard and site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-28478'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify User submits inappropriate content while Sharing a File to Home Dashboard and Site Dashboard',
          zephyrTestId: 'CONT-28478',
          storyId: 'CONT-28478',
        });

        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
        const siteName = 'All Employees';
        const fileName = 'V2.png';
        const folderName = 'AVISTA BOX FILES EDITOR';

        // Get site ID and setup page objects once
        const publicSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);

        // Admin page objects for setup
        const adminManageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        const adminSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
        const adminSiteFilesPage = new SiteFilesPage(appManagerFixture.page, publicSiteId);

        // Standard user page objects (reused across both scenarios)
        const userSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
        const userSiteFilesPage = new SiteFilesPage(standardUserFixture.page, publicSiteId);
        const shareComponent = new ShareComponent(standardUserFixture.page);
        const warningPopup = new InappropriateContentWarningPopupComponent(standardUserFixture.page);

        // Setup - Admin configures external files and uploads folder
        await test.step('Admin: Setup external files provider and upload folder', async () => {
          await adminManageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
          await adminManageSitePage.actions.setExternalFilesProvider('Box files');
          await adminSiteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page for file setup' });
          await adminSiteDashboardPage.navigateToTab(SitePageTab.FilesTab);
          await adminSiteFilesPage.assertions.verifyThePageIsLoaded();
          await adminSiteFilesPage.actions.clickOnFilesFolder('Box files');
          await adminSiteFilesPage.actions.uploadBoxFileFolder(folderName);
        });

        // Test Home Feed scenario
        await test.step('Home Feed: Verify inappropriate content warning - Cancel and Continue flows', async () => {
          // Navigate to file
          await userSiteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await userSiteDashboardPage.navigateToTab(SitePageTab.FilesTab);
          await userSiteFilesPage.assertions.verifyThePageIsLoaded();
          await userSiteFilesPage.actions.clickOnFilesFolder('Box files');
          await userSiteFilesPage.actions.clickOnFilesFolder(folderName);
          await userSiteFilesPage.assertions.verifyFileIsPresentInTheSiteFilesList(fileName);

          // Open share modal and enter inappropriate text
          await userSiteFilesPage.actions.hoverOverFileOptionsDropdown(fileName);
          await userSiteFilesPage.actions.clickShareOptionFromFileMenu();
          await shareComponent.assertions.verifyShareModalIsFunctional();
          await shareComponent.actions.enterShareDescription(inappropriatePostText);

          // Click share and verify warning popup - then Cancel
          await shareComponent.actions.clickShareButton();
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickCancel();
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Verify modal still open, re-enter text and Continue
          await shareComponent.assertions.verifyShareModalIsFunctional();
          await shareComponent.actions.enterShareDescription(inappropriatePostText);
          await shareComponent.actions.clickShareButton();
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();
        });

        // Test Site Feed scenario
        await test.step('Site Feed: Verify inappropriate content warning - Cancel and Continue flows', async () => {
          // Navigate to file
          await userSiteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await userSiteDashboardPage.navigateToTab(SitePageTab.FilesTab);
          await userSiteFilesPage.assertions.verifyThePageIsLoaded();
          await userSiteFilesPage.actions.clickOnFilesFolder('Box files');
          await userSiteFilesPage.actions.clickOnFilesFolder(folderName);
          await userSiteFilesPage.assertions.verifyFileIsPresentInTheSiteFilesList(fileName);

          // Open share modal, select Site Feed, enter inappropriate text
          await userSiteFilesPage.actions.hoverOverFileOptionsDropdown(fileName);
          await userSiteFilesPage.actions.clickShareOptionFromFileMenu();
          await shareComponent.assertions.verifyShareModalIsFunctional();
          await shareComponent.actions.enterShareDescription(inappropriatePostText);
          await shareComponent.selectShareOptionAsSiteFeed();
          await shareComponent.actions.enterSiteName(siteName);

          // Click share and verify warning popup - then Cancel
          await shareComponent.actions.clickShareButton();
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickCancel();
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Verify modal still open, re-enter text and Continue
          await shareComponent.assertions.verifyShareModalIsFunctional();
          await shareComponent.actions.enterShareDescription(inappropriatePostText);
          await shareComponent.actions.clickShareButton();
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();
        });
      }
    );

    test(
      'verify user can mention sites, click mentions to navigate, edit site mentions, and delete post from Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24122'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify user can mention sites, click mentions to navigate, edit site mentions, and delete post from Home Feed',
          zephyrTestId: 'CONT-24122',
          storyId: 'CONT-24122',
        });

        // Setup: Get public, private, and unlisted sites, plus user and topic for mentions
        const [publicSite, privateSite, endUserInfo, topicList] = await Promise.all([
          appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: false,
          }),
          appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE, {
            waitForSearchIndex: false,
          }),
          appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          appManagerFixture.contentManagementHelper.getTopicList(),
        ]);

        const publicSiteName = publicSite.name;
        const privateSiteName = privateSite.name;
        const publicSiteId = publicSite.siteId;
        const privateSiteId = privateSite.siteId;

        // Get a user name and topic for the post
        const userName = endUserInfo.fullName;
        const topicName = topicList.result.listOfItems[0]?.name || 'General';

        const publicSite2Name = publicSiteName;
        const publicSite2Id = publicSiteId;

        // Navigate to Home → Global Feed
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        // Initialize feedPage for this test
        feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Generate base post text (will be used for all post lookups)
        const initialPostText = TestDataGenerator.generateRandomText('Site Mention Post', 2, false);

        // Step 1: Create Post with Site Mentions
        await test.step('Create post with site mentions', async () => {
          await feedPage.actions.clickShareThoughtsButton();

          // Create post mentioning Public Site, Private Site, and Unlisted Site
          // Note: createfeedWithMentionUserNameAndTopic requires userName and topicName, so we provide them
          const postResult = await feedPage.actions.createfeedWithMentionUserNameAndTopic({
            text: initialPostText,
            userName: userName,
            topicName: topicName,
            siteName: [publicSiteName, privateSiteName],
            embedUrl: '', // No embed URL needed
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Verify post creation - use base text for verification as mentions may render differently
          await feedPage.assertions.waitForPostToBeVisible(initialPostText);
          await feedPage.assertions.validatePostText(initialPostText);
        });

        // Step 2: Navigate via Site Mentions
        await test.step('Navigate via site mentions', async () => {
          // Click Public Site mention and verify navigation
          await feedPage.actions.clickSiteMentionInPost(initialPostText, publicSiteName, publicSiteId);

          // Return to Home-Global Feed
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();
          await feedPage.assertions.waitForPostToBeVisible(initialPostText);

          // Click Private Site mention and verify navigation
          await feedPage.actions.clickSiteMentionInPost(initialPostText, privateSiteName, privateSiteId);

          // Return to Home-Global Feed
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();
          await feedPage.assertions.waitForPostToBeVisible(initialPostText);
        });

        // Step 3: Edit Site Mentions
        await test.step('Edit site mentions', async () => {
          // Open ellipses menu
          await feedPage.actions.openPostOptionsMenu(initialPostText);

          // Click Edit
          await feedPage.actions.clickEditOption();

          // Verify Update button is disabled initially
          await feedPage.assertions.verifyUpdateButtonDisabled();

          // Remove "Public Site" mention
          await feedPage.actions.removeSiteMention(publicSiteName);

          // Add "Public Site2" mention
          await feedPage.actions.addSiteName(publicSite2Name);

          // Click Update button to save changes
          await feedPage.actions.clickUpdateButton();

          // Verify updated post shows new site mention
          await feedPage.assertions.waitForPostToBeVisible(initialPostText);
        });

        // Step 4: Verify Updated Mention Navigation
        await test.step('Verify updated mention navigation', async () => {
          // Click new site mention
          await feedPage.actions.clickSiteMentionInPost(initialPostText, publicSite2Name, publicSite2Id);

          // Return to Home-Global Feed
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();
          await feedPage.assertions.waitForPostToBeVisible(initialPostText);
        });

        // Step 5: Delete Post
        await test.step('Delete post from Home Feed', async () => {
          // Return to Home-Global Feed (already there, but ensure)
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();

          // Open ellipses menu
          await feedPage['listFeedComponent'].openPostOptionsMenu(initialPostText);

          // Click Delete option
          await feedPage['listFeedComponent'].clickDeleteOption();

          // Confirm delete in the dialog
          await feedPage['listFeedComponent'].confirmDelete();

          // Verify post is removed from feed
          await feedPage['listFeedComponent'].validatePostNotVisible(initialPostText);
          createdPostId = '';
        });
      }
    );

    test(
      'verify user is able to see Follow button on hovering profile icon on Home Feed CONT-20094',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20094'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user is able to see Follow button on hovering profile icon on Home Feed',
          zephyrTestId: 'CONT-20094',
          storyId: 'CONT-20094',
        });

        // Get Application Manager user info
        const appManagerInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );
        const appManagerFullName = appManagerInfo.fullName;

        // Create feed post by App Manager
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();

        await adminFeedPage.actions.clickShareThoughtsButton();
        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const postResult = await adminFeedPage.actions.createAndPost({ text: postText });
        await adminFeedPage.assertions.waitForPostToBeVisible(postText);

        // Add reply to the post
        await adminFeedPage.actions.openReplyEditorForPost(postText);
        const replyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await adminFeedPage.actions.addReplyToPost(replyText, postResult.postId || '');
        await adminFeedPage.assertions.verifyReplyIsVisible(replyText);

        // Login as EndUser and verify Follow button on hover in feed post
        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.reloadPage();
        await endUserFeedPage.assertions.waitForPostToBeVisible(postText);

        // Hover on profile icon in feed post - verify user name, photo, and Follow button
        await endUserFeedPage.actions.hoverOnProfileIconInPost(postText, appManagerFullName);
        await endUserFeedPage.assertions.verifyUserNameVisibleOnHover(appManagerFullName);
        await endUserFeedPage.assertions.verifyFollowButtonVisibleOnHover(appManagerFullName);

        // Click Follow button and verify Following button is visible
        await endUserFeedPage.actions.clickFollowButtonOnHover(appManagerFullName);
        await endUserFeedPage.assertions.verifyFollowingButtonVisibleOnHover(appManagerFullName);

        await endUserFeedPage.actions.clickOnSideToRemoveProfilePopover();

        // Hover on profile icon in reply - verify Following button is visible
        await endUserFeedPage.actions.hoverOnProfileIconInReply(replyText, appManagerFullName);
        await endUserFeedPage.assertions.verifyFollowingButtonVisibleOnHover(appManagerFullName);

        // Click Following button in reply and verify Follow button is visible
        await endUserFeedPage.actions.clickFollowingButtonOnHover(appManagerFullName);
        await endUserFeedPage.assertions.verifyFollowButtonVisibleOnHover(appManagerFullName);
      }
    );

    test(
      'in Zeus verify share option is not visible for GDrive file when Feed is disabled',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-20080'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify share option is not visible for GDrive file when Feed is disabled',
          zephyrTestId: 'CONT-20080',
          storyId: 'CONT-20080',
        });

        const siteName = 'All Employees';
        const fileName = 'V2.png';
        const folderName = 'AVISTA BOX FILES EDITOR';

        const publicSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);

        // Create page objects once and reuse
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
        const manageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        const siteFilesPage = new SiteFilesPage(appManagerFixture.page, publicSiteId);
        const governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);

        // Setup - Configure external files provider and upload folder
        await test.step('Setup: Configure external files and upload folder', async () => {
          await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
          await manageSitePage.actions.setExternalFilesProvider('Box files');
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page for file setup' });
          await siteDashboardPage.navigateToTab(SitePageTab.FilesTab);
          await siteFilesPage.assertions.verifyThePageIsLoaded();
          await siteFilesPage.actions.clickOnFilesFolder('Box files');
          await siteFilesPage.actions.uploadBoxFileFolder(folderName);
          await siteFilesPage.actions.clickOnFilesFolder(folderName);
          await siteFilesPage.assertions.verifyFileIsPresentInTheSiteFilesList(fileName);
        });

        // Change governance to Timeline mode and verify share option is hidden
        await test.step('Verify share option is NOT visible when Feed is disabled (Timeline mode)', async () => {
          await governanceScreenPage.loadPage();
          await governanceScreenPage.verifyThePageIsLoaded();
          await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimeline();

          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page after governance change' });
          await siteDashboardPage.navigateToTab(SitePageTab.FilesTab);
          await siteFilesPage.assertions.verifyThePageIsLoaded();
          await siteFilesPage.actions.clickOnFilesFolder('Box files');
          await siteFilesPage.actions.clickOnFilesFolder(folderName);
          await siteFilesPage.assertions.verifyShareOptionIsNotVisible(fileName);
        });

        // Restore governance to default mode and verify share option is visible
        await test.step('Verify share option is visible when Feed is enabled (Default mode)', async () => {
          await governanceScreenPage.loadPage();
          await governanceScreenPage.verifyThePageIsLoaded();
          await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();

          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page after governance change' });
          await siteDashboardPage.navigateToTab(SitePageTab.FilesTab);
          await siteFilesPage.assertions.verifyThePageIsLoaded();
          await siteFilesPage.actions.clickOnFilesFolder('Box files');
          await siteFilesPage.actions.clickOnFilesFolder(folderName);
          await siteFilesPage.assertions.verifyShareOptionIsVisible(fileName);
        });
      }
    );

    test(
      'verify user able to share Feed post on Public Site feed using "Post in Site Feed" option',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19560'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user able to share Feed post on Public Site feed using "Post in Site Feed" option',
          zephyrTestId: 'CONT-19560',
          storyId: 'CONT-19560',
        });

        const siteName = DEFAULT_PUBLIC_SITE_NAME;
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;

        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();

        await feedPage.actions.clickShareThoughtsButton();

        await feedPage.actions.enterFeedPostText(postText);

        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        await feedPage.actions.uploadFiles([imagePath]);

        await feedPage.actions.selectShareOptionAsSiteFeed();

        await feedPage.actions.enterSiteNameForShare(siteName);

        await feedPage.actions.clickPostButton();

        await feedPage.assertions.waitForPostToBeVisible(postText);

        await feedPage.assertions.verifyPostDetails(postText, 1);

        await feedPage.actions.clickSiteNameOnPost(postText, siteName);

        siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });

        await siteDashboardPage.actions.clickOnFeedLink();
        await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

        await feedPage.assertions.waitForPostToBeVisible(postText);

        await feedPage.assertions.verifyPostDetails(postText, 1);

        await feedPage.assertions.verifyThePageIsLoaded();
        await feedPage.assertions.waitForPostToBeVisible(postText);

        await feedPage.actions.deletePost(postText);
      }
    );

    test(
      "in Zeus verify end user able to see Copy link option on other users' post",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19568'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: "In Zeus verify end user able to see Copy link option on other users' post",
          zephyrTestId: 'CONT-19568',
          storyId: 'CONT-19568',
        });
        let createdPostText: string = '';
        let createdPostId: string = '';

        await test.step('Login as Admin and create global post with file attachment', async () => {
          await appManagerFixture.homePage.verifyThePageIsLoaded();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.verifyThePageIsLoaded();

          await adminFeedPage.actions.clickShareThoughtsButton();

          const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
          createdPostText = postText;

          await adminFeedPage.actions.enterFeedPostText(postText);

          const documentPath = FILE_TEST_DATA.EXCEL.SAMPLE_XLSX.getPath(__dirname);
          const postResult = await adminFeedPage.actions.createAndPost({
            text: postText,
            attachments: {
              files: [documentPath],
            },
          });

          createdPostId = postResult.postId || '';

          await adminFeedPage.assertions.waitForPostToBeVisible(postText);
        });

        let replyText: string = '';
        await test.step('Admin creates reply ', async () => {
          const adminFeedPage = new FeedPage(appManagerFixture.page);

          await adminFeedPage.actions.openReplyEditorForPost(createdPostText);

          replyText = FEED_TEST_DATA.POST_TEXT.REPLY;

          await adminFeedPage.actions.addReplyToPost(replyText, createdPostId);

          await adminFeedPage.assertions.verifyReplyIsVisible(replyText);
        });

        await test.step("End user verifies Copy link option on other user's post", async () => {
          const endUserFeedPage = new FeedPage(standardUserFixture.page);

          await endUserFeedPage.reloadPage();

          await endUserFeedPage.assertions.waitForPostToBeVisible(createdPostText);

          await endUserFeedPage.actions.openPostOptionsMenu(createdPostText);

          await endUserFeedPage.assertions.verifyOnlyCopyLinkOptionVisible(createdPostText);

          await endUserFeedPage.actions.clickCopyLinkOption();

          await endUserFeedPage.assertions.verifyToastMessage(
            FEED_TEST_DATA.TOAST_MESSAGES.COPY_LINK_TO_POST_SUCCESSFULLY
          );

          await endUserFeedPage.actions.openPostOptionsMenu(replyText);

          await endUserFeedPage.assertions.verifyReplyOptionsMenuNotVisible(replyText);
        });
      }
    );

    test(
      'verify Admin can create, edit and delete a feed post with multiple file attachments on Home Feed CONT-24135',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-24135'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Admin is able to Add, Edit, and Delete Feed Post with File Attachments on Home Feed',
          zephyrTestId: 'CONT-24135',
          storyId: 'CONT-24135',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();

        const initialPostText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;

        // ==================== CREATE FEED POST ====================
        await test.step('Create feed post with multiple file attachments', async () => {
          await adminFeedPage.actions.clickShareThoughtsButton();

          const createFeedPostComponent = adminFeedPage['createFeedPostComponent'];

          const filePaths = [
            FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname), // image1.jpg
            FILE_TEST_DATA.IMAGES.IMAGE3.getPath(__dirname), // image3.jpg
            FILE_TEST_DATA.IMAGES.IMAGE4.getPath(__dirname), // image4.jpg
            FILE_TEST_DATA.IMAGES.FAVICON.getPath(__dirname), // favicon.png
            FILE_TEST_DATA.EXCEL.SAMPLE_DOCX.getPath(__dirname), // sample.docx
            FILE_TEST_DATA.EXCEL.SAMPLE_XLSX.getPath(__dirname), // sample.xlsx
            FILE_TEST_DATA.DOCUMENTS.FILES_PREVIEW_BEHAVE_DOC_1_PDF.getPath(__dirname), // sample.pdf
          ];

          await createFeedPostComponent.createPost(initialPostText);

          await createFeedPostComponent.uploadFiles(filePaths);

          await createFeedPostComponent.assertions.verifyAttachedFileCount(filePaths.length);

          const deleteIcons = await createFeedPostComponent.deleteFileIcon.all();
          if (deleteIcons.length > 0) {
            await deleteIcons[0].hover();
            await expect(deleteIcons[0]).toBeVisible();
          }

          const postResponse = await createFeedPostComponent.createFeedPost();
          const feedResponseBody = (await postResponse.json()) as any;
          createdPostText = initialPostText;
          createdPostId = feedResponseBody.result?.feedId || '';
        });

        // ==================== VERIFY POST CREATED ====================
        await test.step('Verify feed post is created with file attachments', async () => {
          await adminFeedPage.assertions.waitForPostToBeVisible(initialPostText);

          await adminFeedPage.getPostTimestamp(initialPostText);

          await adminFeedPage.assertions.verifyPostDetails(initialPostText, 7);
        });

        // ==================== EDIT FEED POST ====================
        await test.step('Edit feed post and remove one attachment', async () => {
          await adminFeedPage.actions.openPostOptionsMenu(initialPostText);

          await adminFeedPage.actions.clickEditOption();

          const createFeedPostComponent = adminFeedPage['createFeedPostComponent'];

          await createFeedPostComponent.assertions.verifyUpdateButtonDisabled();

          await createFeedPostComponent.assertions.verifyEditorVisible();

          const deleteIcons = await createFeedPostComponent.deleteFileIcon.all();
          if (deleteIcons.length > 0) {
            await deleteIcons[0].hover();
            await expect(deleteIcons[0]).toBeVisible();
          }

          const initialFileCount = await createFeedPostComponent.attachedFiles.count();
          await createFeedPostComponent.removeAttachedFile(0);

          await createFeedPostComponent.assertions.verifyAttachedFileCount(initialFileCount - 1);

          await createFeedPostComponent.updatePostText(updatedPostText);

          await createFeedPostComponent.clickUpdateButton();
        });

        // ==================== VERIFY POST UPDATED ====================
        await test.step('Verify feed post is updated successfully', async () => {
          await adminFeedPage.assertions.waitForPostToBeVisible(updatedPostText);

          await adminFeedPage.assertions.verifyPostDetails(updatedPostText, 6);
        });

        // ==================== DELETE FEED POST ====================
        await test.step('Delete feed post', async () => {
          await adminFeedPage.actions.deletePost(updatedPostText);

          await adminFeedPage.assertions.verifyPostIsNotVisible(updatedPostText);
          createdPostId = '';
          createdPostText = '';
        });
      }
    );
  }
);
