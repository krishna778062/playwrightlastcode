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
        // const { postResult: apiPostResult, postId } = await feedManagerService.postEditor.createPost({ text: initialPostText });
        await feedPage.clickShareThoughtsButton();
        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        const documentPath = FILE_TEST_DATA.EXCEL.SAMPLE_XLSX.getPath(__dirname);
        const postResult = await feedPage.postEditor.createAndPost({
          text: initialPostText,
          attachments: {
            files: [imagePath, documentPath],
          },
        });

        // Store created post text and postId for cleanup (postId would be available if using API creation)
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible and get timestamp
        await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
        await feedPage.feedList.getPostTimestamp(postResult.postText);

        // Step 2: Verify post details and attachments
        await feedPage.verifyAllDataPointsForFeedPost(postResult.postText, postResult.attachmentCount);

        // Step 3: Edit the post
        await feedPage.postEditor.editPost(postResult.postText, updatedPostText);
        await feedPage.feedList.waitForPostToBeVisible(updatedPostText);

        // Step 4: Delete the post
        await feedPage.deletePost(updatedPostText);
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
          await appManagerFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);

        // Navigate to Site Dashboard as
        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, allEmployeesSiteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Click on Feed link
        await siteDashboardPage.clickOnFeedLink();

        // Create Feed Post with Attachment
        const initialPostText = FEED_TEST_DATA.POST_TEXT.INITIAL;

        // Click "Share your thoughts or questions" button
        await siteDashboardPage.clickShareThoughtsButton();

        // Get the createFeedPostComponent from siteDashboardPage
        const createFeedPostComponent = siteDashboardPage.createFeedPostComponent;

        // Upload file "image1.jpg"
        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);

        // Post the feed with attachment (createAndPost handles text and file upload internally)
        const postResult = await createFeedPostComponent.createAndPost({
          text: initialPostText,
          attachments: {
            files: [imagePath],
          },
        });

        // Store created post text and postId for cleanup
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Verify post successfully created
        await siteDashboardPage.listFeedComponent.validatePostText(postResult.postText);

        // Verify timestamp displayed
        const feedPageForSite = new FeedPage(standardUserFixture.page);
        await feedPageForSite.feedList.getPostTimestamp(postResult.postText);

        // Verify inline image preview visible
        await feedPageForSite.verifyAllDataPointsForFeedPost(postResult.postText, postResult.attachmentCount);

        // Edit Feed Post
        const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;

        // Open option menu (three dots)
        await siteDashboardPage.clickOnOptionsMenu(createdPostText);

        // Click Edit
        await createFeedPostComponent.clickEditOption();

        // Verify editor opens
        await createFeedPostComponent.verifyEditorVisible();

        // Verify file restrictions: User must NOT be able to remove files
        // Verify attached file count is still 1 (cannot remove files)
        await createFeedPostComponent.verifyAttachedFileCount(1);

        // Update text
        await createFeedPostComponent.updatePostText(updatedPostText);

        // Click Update
        await createFeedPostComponent.clickUpdateButton();

        // Verify updated content appears
        await siteDashboardPage.listFeedComponent.validatePostText(updatedPostText);

        // Delete Feed Post
        // Open option menu
        await siteDashboardPage.clickOnOptionsMenu(updatedPostText);

        // Click Delete
        await siteDashboardPage.listFeedComponent.clickDeleteOption();

        // Confirm Delete
        await siteDashboardPage.listFeedComponent.confirmDelete();

        // Verify feed post is removed
        await siteDashboardPage.validatePostNotVisible(updatedPostText);
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
          await appManagerFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);

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
        await contentPreviewPage.verifyCommentOptionIsVisible();

        // Create Feed Post (Comment) with Attachment
        const initialPostText = FEED_TEST_DATA.POST_TEXT.INITIAL;

        // Click "Share your thoughts or question" button
        await contentPreviewPage.clickShareThoughtsButton();

        // Get the createFeedPostComponent from contentPreviewPage
        const createFeedPostComponent = contentPreviewPage.createFeedPostComponent;

        // Upload file "favicon.png"
        const faviconPath = FILE_TEST_DATA.IMAGES.FAVICON.getPath(__dirname);

        // Post the feed with attachment (createAndPost handles text and file upload internally)
        const postResult = await createFeedPostComponent.createAndPost({
          text: initialPostText,
          attachments: {
            files: [faviconPath],
          },
        });

        // Store created post text and postId for cleanup
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Verify comment successfully created
        await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(postResult.postText);

        // Verify timestamp displayed
        const listFeedComponent = contentPreviewPage.listFeedComponent;
        await listFeedComponent.getPostTimestamp(postResult.postText);

        // Verify inline image preview visible
        const feedPageForContent = new FeedPage(standardUserFixture.page);
        await feedPageForContent.verifyAllDataPointsForFeedPost(postResult.postText, postResult.attachmentCount);

        // Edit Feed Post
        const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;

        // Open option menu (three dots)
        await listFeedComponent.openPostOptionsMenu(createdPostText);

        // Click Edit
        await createFeedPostComponent.clickEditOption();

        // Verify editor opens
        await createFeedPostComponent.verifyEditorVisible();

        await createFeedPostComponent.verifyAttachedFileCount(1);

        // Update text
        await createFeedPostComponent.updatePostText(updatedPostText);

        // Click Update
        await createFeedPostComponent.clickUpdateButton();

        // Verify updated content appears
        await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(updatedPostText);

        // Delete Feed Post
        // Open option menu
        await listFeedComponent.openPostOptionsMenu(updatedPostText);

        // Click Delete
        await listFeedComponent.clickDeleteOption();

        // Confirm Delete
        await listFeedComponent.confirmDelete();

        // Verify feed post is removed
        await contentPreviewPage.listFeedComponent.verifyPostIsNotVisible(updatedPostText);
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

        const userId = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const privateSiteResult = await appManagerFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
          [userId.userId],
          SITE_TYPES.PRIVATE
        );
        const privateSiteName = privateSiteResult.siteName;
        console.log(`Using private site: ${privateSiteName}`);

        // Step 2: Get or reuse an unlisted site that standard user is NOT a member of
        const unlistedSiteResult = await appManagerFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
          [userId.userId],
          SITE_TYPES.UNLISTED
        );
        const unlistedSiteName = unlistedSiteResult.siteName;
        console.log(`Using unlisted site: ${unlistedSiteName}`);

        // Step 3: Standard User is already on Feed page (from beforeEach setup)

        // Step 4: Click on "Share your thoughts" button
        await feedPage.clickShareThoughtsButton();

        // Step 5: Create a post and send it to the editor
        const initialPostText = TestDataGenerator.generateRandomText('Test Post', 3, true);
        await feedPage.postEditor.createPost(initialPostText);

        // Step 6: User select share option as "site feed"
        await feedPage.share.selectShareOptionAsSiteFeed();

        // Step 7: Enter private site name which User is not member of
        await feedPage.postEditor.searchForSiteName(privateSiteName);

        // Step 8: Verify "No results" is getting displayed for private site
        await feedPage.postEditor.verifyNoResultMessage();

        // Step 9: Close the dropdown and search again for unlisted site
        await standardUserFixture.page.keyboard.press('Escape'); // Close the dropdown
        await feedPage.postEditor.searchForSiteName(unlistedSiteName);

        // Step 10: Verify "No results" is getting displayed for unlisted site
        await feedPage.postEditor.verifyNoResultMessage();
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
        await feedPage.clickShareThoughtsButton();

        // Step 4: Enter post text
        const videoPostText = TestDataGenerator.generateRandomText('Video Post', 3, true);
        await feedPage.postEditor.createPost(videoPostText);

        // Step 5: Click on "Browse files" button
        await feedPage.postEditor.clickBrowseFilesButton();

        // Step 6: Enter '.mp4' in 'Search files' field
        await feedPage.postEditor.searchForFileInLibrary('.mp4');

        // Step 7: Select first result ".mp4" video
        await feedPage.postEditor.selectFileFromLibrary('.mp4');

        // Step 8: Click "Attach" button
        await feedPage.postEditor.clickAttachButton();

        // Step 9: Verify the selected video appears as an attachment
        await feedPage.postEditor.verifyFileIsAttached('.mp4');

        // Step 10: Click on "Post" button to publish
        await feedPage.postEditor.clickPostButton();

        // Step 11: Verify the feed post is published successfully with the post text
        await feedPage.feedList.waitForPostToBeVisible(videoPostText);

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
        await adminFeedPage.verifyThePageIsLoaded();

        await adminFeedPage.clickShareThoughtsButton();
        const videoPostText = FEED_TEST_DATA.POST_TEXT.VIDEO;
        await adminFeedPage.postEditor.createPost(videoPostText);

        // Add video attachment
        await adminFeedPage.postEditor.clickBrowseFilesButton();
        await adminFeedPage.postEditor.searchForFileInLibrary('.mp4');
        await adminFeedPage.postEditor.selectFileFromLibrary('.mp4');
        await adminFeedPage.postEditor.clickAttachButton();
        await adminFeedPage.postEditor.verifyFileIsAttached('.mp4');

        // Post the feed
        const postResult = await adminFeedPage.postEditor.createAndPost({
          text: videoPostText,
        });
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await adminFeedPage.feedList.waitForPostToBeVisible(videoPostText);

        await standardUserFixture.page.reload();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();

        await feedPage.feedList.clickShareIcon(videoPostText);

        // Add a message while sharing
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await feedPage.share.enterShareDescription(shareMessage);

        // Select Post in "Site Feed" option
        await feedPage.share.selectShareOptionAsSiteFeed();

        // Search for and select a site
        const siteResult = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public', {
          waitForSearchIndex: false,
        });
        const siteName = siteResult.name;
        await feedPage.share.enterSiteName(siteName);

        // Click the "Share" button
        const shareComponent = new ShareComponent(standardUserFixture.page);
        await shareComponent.clickShareButton();

        // Wait for share to complete
        await feedPage.feedList.verifyToastMessageIsVisibleWithText(
          FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
        );

        siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteResult.siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.listFeedComponent.validatePostText(shareMessage);

        // Click "View Post" - need to use feedPage on site dashboard
        const siteFeedPage = new FeedPage(standardUserFixture.page);
        await siteFeedPage.feedList.clickViewPostLink();

        // Verify the user is navigated to the Feed Detail Page
        // Wait for navigation to feed detail page
        await standardUserFixture.page.waitForURL(new RegExp(`/feed/${createdPostId}`), { timeout: 10000 });
        const feedDetailPage = new FeedPage(standardUserFixture.page, createdPostId);
        await feedDetailPage.feedList.waitForPostToBeVisible(videoPostText);

        // Verify video controls and functionalities
        await feedDetailPage.feedList.verifyVideoControls(videoPostText);
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
        await adminFeedPage.verifyThePageIsLoaded();

        // Create a Feed post with a native video attachment and a message
        await adminFeedPage.clickShareThoughtsButton();
        const videoPostText = FEED_TEST_DATA.POST_TEXT.VIDEO;
        await adminFeedPage.postEditor.createPost(videoPostText);

        // Add video attachment
        await adminFeedPage.postEditor.clickBrowseFilesButton();
        await adminFeedPage.postEditor.searchForFileInLibrary('.mp4');
        await adminFeedPage.postEditor.selectFileFromLibrary('.mp4');
        await adminFeedPage.postEditor.clickAttachButton();
        await adminFeedPage.postEditor.verifyFileIsAttached('.mp4');

        // Post the feed
        const postResult = await adminFeedPage.postEditor.createAndPost({
          text: videoPostText,
        });
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await adminFeedPage.feedList.waitForPostToBeVisible(videoPostText);

        await standardUserFixture.page.reload();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Click the "Share" icon on the Feed post created by Admin
        await feedPage.feedList.clickShareIcon(videoPostText);

        // Add a message while sharing
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await feedPage.share.enterShareDescription(shareMessage);

        const shareComponent = new ShareComponent(standardUserFixture.page);
        await shareComponent.clickShareButton();

        // Wait for share to complete
        await feedPage.feedList.verifyToastMessageIsVisibleWithText(
          FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
        );

        await feedPage.reloadPage();

        await feedPage.feedList.waitForPostToBeVisible(shareMessage);

        // Click "View Post"
        await feedPage.feedList.clickViewPostLink();

        // Verify the user is navigated to the Feed Detail Page
        // Wait for navigation to feed detail page
        await standardUserFixture.page.waitForURL(new RegExp(`/feed/${createdPostId}`));
        const feedDetailPage = new FeedPage(standardUserFixture.page, createdPostId);
        await feedDetailPage.feedList.waitForPostToBeVisible(videoPostText);

        // Verify video controls and functionalities
        await feedDetailPage.feedList.verifyVideoControls(videoPostText);
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
          await endUserFeedPage.clickShareThoughtsButton();

          const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
          const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);

          // Create post with image attachment
          const postResult = await endUserFeedPage.postEditor.createAndPost({
            text: postText,
            attachments: {
              files: [imagePath],
            },
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Verify global post is created
          await endUserFeedPage.feedList.waitForPostToBeVisible(postText);
          await endUserFeedPage.verifyAllDataPointsForFeedPost(postText, 1); // 1 attachment
        });

        // Share Post with mention and "Post in Home Feed" option
        await test.step('Share post with mention using Post in Home Feed option', async () => {
          const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;

          // Share the post with mention and "Post in Home Feed" option
          await endUserFeedPage.shareFeedPost({
            postText: createdPostText,
            mentionUserName: standardUserFullName,
            shareMessage: shareMessage,
            postIn: 'Home Feed',
          });

          // Verify success message
          await endUserFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );
        });

        // Verify shared post is visible on Home Feed
        await test.step('Verify shared post with message, mention, and inline image preview', async () => {
          // Reload page to see the shared post
          await endUserFeedPage.reloadPage();

          // Verify shared post is visible
          const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
          await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage);

          // Verify share message is displayed
          await endUserFeedPage.feedList.validatePostText(shareMessage);

          await endUserFeedPage.feedList.verifyUserNameMentionIsVisible(shareMessage, standardUserFullName);

          await endUserFeedPage.feedList.clickInlineImagePreview(shareMessage);
          await endUserFeedPage.feedList.verifyInlineImagePreviewVisible();
          await endUserFeedPage.feedList.closeImagePreview();
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
        await endUserFeedPage.verifyThePageIsLoaded();

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;

        await test.step('Create post with image attachment on Global Feed', async () => {
          await endUserFeedPage.clickShareThoughtsButton();

          const postResult = await endUserFeedPage.postEditor.createAndPost({
            text: postText,
            attachments: {
              files: [imagePath],
            },
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Verify global post is created successfully
          await endUserFeedPage.feedList.waitForPostToBeVisible(postText);
          await endUserFeedPage.verifyAllDataPointsForFeedPost(postText, 1);
        });

        await test.step('Share post to Site Feed with mention', async () => {
          await endUserFeedPage.shareFeedPost({
            postText: createdPostText,
            mentionUserName: standardUserFullName,
            shareMessage: shareMessage,
            postIn: 'Site Feed',
          });

          await endUserFeedPage.share.enterSiteName(publicSiteName);

          const shareComponent = new ShareComponent(standardUserFixture.page);
          await shareComponent.clickShareButton();

          await endUserFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );
        });

        await test.step('Verify shared post with mention is visible on Global Feed', async () => {
          await endUserFeedPage.reloadPage();

          await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage);
          await endUserFeedPage.feedList.validatePostText(shareMessage);

          await endUserFeedPage.feedList.verifyUserNameMentionIsVisible(shareMessage, standardUserFullName);
        });

        await test.step('Verify shared post is visible on Site Feed', async () => {
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.clickOnFeedLink();
          await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

          await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage);
          await endUserFeedPage.feedList.validatePostText(shareMessage);

          await endUserFeedPage.feedList.verifyUserNameMentionIsVisible(shareMessage, standardUserFullName);
        });

        await test.step('Delete the post from Global Feed', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await endUserFeedPage.reloadPage();
          await endUserFeedPage.verifyThePageIsLoaded();

          await endUserFeedPage.deletePost(createdPostText);
        });

        await test.step('Verify deleted post is not visible on Site Feed', async () => {
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard to verify deletion' });
          await siteDashboardPage.reloadPage();
          await siteDashboardPage.clickOnFeedLink();
          await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

          await endUserFeedPage.feedList.verifyPostIsNotVisible(shareMessage);
        });

        await test.step('Verify deleted post is not visible on Home Feed', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await endUserFeedPage.reloadPage();
          await endUserFeedPage.verifyThePageIsLoaded();

          await endUserFeedPage.feedList.verifyPostIsNotVisible(shareMessage);

          await endUserFeedPage.feedList.verifyPostIsNotVisible(createdPostText);
        });
      }
    );

    test(
      'sU : Verify site owner or manager can edit or delete comments from other users CONT-26611',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26611'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Test feed post creation, editing and deletion with file attachments',
          zephyrTestId: 'CONT-26611',
          storyId: 'CONT-26611',
        });

        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteWithUserAsOwner(
          endUserInfo.userId,
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

        await siteDashboardPage.clickOnFeedLink();
        await siteDashboardPage.clickOnOptionsMenu(createdPostText);
        await siteDashboardPage.verifyEditAndDeleteOptionsVisible(createdPostText);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        const updatedPostText = TestDataGenerator.generateRandomText('Updated Test Post', 3, true);
        // Step 3: Edit the post
        await siteDashboardPage.createFeedPostComponent.editPost(createdPostText, updatedPostText);
        await siteDashboardPage.listFeedComponent.validatePostText(updatedPostText);

        // Delete the post
        await siteDashboardPage.deletePost(updatedPostText);
        createdPostId = ''; // Clear post ID as post is already deleted
        await siteDashboardPage.validatePostNotVisible(updatedPostText);
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
          await feedPage.verifyPageNotFoundVisibility({
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
          await feedPage.verifyPageNotFoundVisibility({
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
          await adminFeedPage.clickShareThoughtsButton();

          // Create post with text, topic, user mention, site mentions, and embedded URL
          const postResult = await adminFeedPage.postEditor.createfeedWithMentionUserNameAndTopic({
            text: postText,
            userName: standardUserFullName,
            topicName: simpplrTopic.name,
            siteName: [publicSiteName],
            embedUrl: embedUrl,
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Wait for post to be visible
          await adminFeedPage.feedList.waitForPostToBeVisible(createdPostText);
        });

        // Navigate end user to the feed post
        await test.step('Navigate EndUser to the feed post', async () => {
          endUserFeedPage = new FeedPage(standardUserFixture.page, createdPostId);
          await standardUserFixture.page.goto(endUserFeedPage.url);
          await endUserFeedPage.feedList.waitForPostToBeVisible(createdPostText);
        });

        // Click Share button on the post
        await endUserFeedPage.feedList.clickShareIcon(createdPostText);
        await endUserFeedPage.verifyShareModalIsOpen();
        // Attempt to paste an image (simulates user pasting image from clipboard)
        await endUserFeedPage.share.attemptImagePaste();

        await endUserFeedPage.feedList.verifyToastMessageIsVisibleWithText(
          FEED_TEST_DATA.TOAST_MESSAGES.IMAGE_ADDED_TO_ATTACHMENTS
        );

        // Verify no attachments are visible
        await endUserFeedPage.share.verifyNoAttachmentsInShareModal();

        // Verify share modal remains functional
        await endUserFeedPage.share.verifyShareModalIsFunctional();
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
        await adminFeedPage.clickShareThoughtsButton();
        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        await adminFeedPage.postEditor.createPost(postText);

        // Select "Post in Site Feed" option
        await adminFeedPage.share.selectShareOptionAsSiteFeed();

        // Enter private site name
        await adminFeedPage.share.enterSiteName(privateSiteName || '');

        // Post the feed
        const postResult = await adminFeedPage.postEditor.createAndPost({
          text: postText,
        });
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await adminFeedPage.feedList.waitForPostToBeVisible(postText);

        const siteOwnerDashboardPage = new SiteDashboardPage(siteManagerFixture.page, privateSiteId || '');
        await siteOwnerDashboardPage.loadPage({ stepInfo: 'Load private site dashboard page' });
        await siteOwnerDashboardPage.clickOnFeedLink();
        await siteOwnerDashboardPage.navigateToTab(SitePageTab.FeedTab);
        const siteOwnerFeedPage = new FeedPage(siteManagerFixture.page);

        // Wait for the post to be visible on the Private Site's feed
        await siteOwnerFeedPage.feedList.waitForPostToBeVisible(postText);

        // Click Share icon on the feed post created on Private Site
        await siteOwnerFeedPage.feedList.clickShareIcon(postText);

        //  Add a Message
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await siteOwnerFeedPage.share.enterShareDescription(shareMessage);

        // Click "Share" button
        const shareComponent = new ShareComponent(siteManagerFixture.page);
        await shareComponent.clickShareButton();

        // Verify success message "Shared Feed post successfully."
        await siteOwnerFeedPage.feedList.verifyToastMessageIsVisibleWithText(
          FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
        );

        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.reloadPage();

        // Verify "End User" is able to view "Site Owner's" shared feed post with the message
        await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage);

        // Verify "End User" is unable to view the original post and is displayed with message "This post has been deleted"
        await endUserFeedPage.feedList.verifyDeletedPostMessage(shareMessage);

        // Verify user cannot interact with the deleted post
        await endUserFeedPage.feedList.verifyPostCannotBeInteracted(postText);
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
        await feedPage.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = feedPage.postEditor;
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
        await feedPage.feedList.waitForPostToBeVisible(recognitionMessage);

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
          await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);
        });

        // Helper function to test Home Dashboard inappropriate content warning
        const testHomeDashboardWarning = async (userFixture: any, inappropriateText: string) => {
          const homeFeedPage = new FeedPage(userFixture.page);
          await userFixture.homePage.loadPage();
          await userFixture.homePage.verifyThePageIsLoaded();
          await userFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await homeFeedPage.clickShareThoughtsButton();

          // Enter inappropriate text
          await homeFeedPage.postEditor.createPost(inappropriateText);

          // Click Post button
          await homeFeedPage.postEditor.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Close the popup
          await warningPopup.clickCancel();
        };

        // Helper function to test Site Dashboard inappropriate content warning
        const testSiteDashboardWarning = async (userFixture: any, siteId: string, inappropriateText: string) => {
          const siteDashboard = new SiteDashboardPage(userFixture.page, siteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await siteDashboard.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = siteDashboard.createFeedPostComponent;
          await createFeedPostComponent.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Close the popup
          await warningPopup.clickCancel();
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
          await contentPreviewPage.verifyCommentOptionIsVisible();

          // Click Share your thoughts button
          await contentPreviewPage.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
          await createFeedPostComponent.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Close the popup
          await warningPopup.clickCancel();
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
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        // Load Site Dashboard page
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Click Share your thoughts or questions on Site Dashboard
        await siteDashboardPage.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = siteDashboardPage.createFeedPostComponent;
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
        await recognitionForm.selectSiteInShareDialog(DEFAULT_PUBLIC_SITE_NAME);

        // Click Share post button to share the recognition
        await recognitionForm.clickSharePostButton();

        // Wait for share dialog to close before reloading
        await recognitionForm.waitForShareDialogToClose();

        // Reload the page to ensure the recognition post appears
        await siteDashboardPage.reloadPage();

        // Verify the Recognition feed post is created on Site feed
        await siteDashboardPage.listFeedComponent.waitForPostToBeVisible(recognitionMessage);

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
          await homeFeedPage.clickShareThoughtsButton();

          // Enter inappropriate text
          await homeFeedPage.postEditor.createPost(inappropriateText);

          // Click Post button
          await homeFeedPage.postEditor.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.clickCancel();

          // Verify popup is closed
          await warningPopup.verifyWarningPopupClosed();

          // Verify editor is still visible and editable
          const createFeedPostComponent = homeFeedPage.postEditor;
          await createFeedPostComponent.verifyEditorVisible();

          // Edit the content - clear and enter appropriate text
          await createFeedPostComponent.updatePostText(editedText);

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
          await siteDashboard.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = siteDashboard.createFeedPostComponent;
          await createFeedPostComponent.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.clickCancel();

          // Verify popup is closed
          await warningPopup.verifyWarningPopupClosed();

          // Verify editor is still visible and editable
          await createFeedPostComponent.verifyEditorVisible();

          // Edit the content - clear and enter appropriate text
          await createFeedPostComponent.updatePostText(editedText);

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
          await contentPreviewPage.verifyCommentOptionIsVisible();

          // Click Share your thoughts button
          await contentPreviewPage.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
          await createFeedPostComponent.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.clickPostWithoutWaitingForResponse();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.clickCancel();

          // Verify popup is closed
          await warningPopup.verifyWarningPopupClosed();

          // Verify editor is still visible and editable
          await createFeedPostComponent.verifyEditorVisible();

          // Edit the content - clear and enter appropriate text
          await createFeedPostComponent.updatePostText(editedText);

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
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        // Navigate to Home tab
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Click Share your thoughts or questions
        await feedPage.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = feedPage.postEditor;
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
        await recognitionForm.selectSiteInShareDialog(DEFAULT_PUBLIC_SITE_NAME);

        // Click Share post button to share the recognition
        await recognitionForm.clickSharePostButton();

        // Wait for share dialog to close before navigating
        await recognitionForm.waitForShareDialogToClose();

        // Navigate to Site Dashboard to verify the post
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Reload the page to ensure the recognition post appears
        await siteDashboardPage.reloadPage();

        // Verify the Recognition feed post is created on Site feed
        await siteDashboardPage.listFeedComponent.waitForPostToBeVisible(recognitionMessage);

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
        await adminHomeFeedPage.clickShareThoughtsButton();
        const homePostText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const homePostResult = await adminHomeFeedPage.postEditor.createAndPost({
          text: homePostText,
        });
        if (homePostResult.postId) createdFeedIds.push(homePostResult.postId);
        await adminHomeFeedPage.feedList.waitForPostToBeVisible(homePostText);

        // Admin creates a post on Site Dashboard
        const adminSiteDashboard = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
        await adminSiteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
        await adminSiteDashboard.navigateToTab(SitePageTab.DashboardTab);
        await adminSiteDashboard.verifyThePageIsLoaded();
        await adminSiteDashboard.clickShareThoughtsButton();
        const sitePostText = `Site Dashboard Post ${homePostText}`;
        const sitePostResult = await adminSiteDashboard.createFeedPostComponent.createAndPost({
          text: sitePostText,
        });
        if (sitePostResult.postId) createdFeedIds.push(sitePostResult.postId);
        const adminSiteFeedPage = new FeedPage(appManagerFixture.page);
        await adminSiteFeedPage.feedList.waitForPostToBeVisible(sitePostText);

        // Admin creates a comment on Content page
        const adminContentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          publicSiteId,
          pageContent.contentId,
          'page'
        );
        await adminContentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await adminContentPreviewPage.verifyThePageIsLoaded();
        await adminContentPreviewPage.clickShareThoughtsButton();
        const commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const commentPostResult = await adminContentPreviewPage.createFeedPostComponent.createAndPost({
          text: commentText,
        });
        if (commentPostResult.postId) createdFeedIds.push(commentPostResult.postId);
        await adminContentPreviewPage.listFeedComponent.waitForPostToBeVisible(commentText);

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
          await shareComponent.verifyShareModalIsFunctional();
          await shareComponent.enterShareDescription(inappropriateText);

          // Select post location if provided (for Site Feed)
          if (selectPostLocation) {
            await selectPostLocation();
          }

          await shareComponent.clickShareButton();
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();
          await warningPopup.clickCancel();
          await warningPopup.verifyWarningPopupClosed();
          await shareComponent.verifyShareModalIsFunctional();

          // Edit content (still inappropriate to test Submit Anyway)
          await shareComponent.enterShareDescription(inappropriateText);

          // Step 2: Submit Anyway Flow
          await shareComponent.clickShareButton();
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();
          await warningPopup.clickContinue();
          await warningPopup.verifyWarningPopupClosed();
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
            () => homeFeedPage.feedList.clickShareIcon(postText),
            inappropriateText,
            editedText,
            async () => {
              const shareComponent = new ShareComponent(userFixture.page);
              await shareComponent.selectShareOptionAsSiteFeed();
              await shareComponent.enterSiteName(siteName);
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
            () => siteFeedPage.feedList.clickShareIcon(postText),
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
            () => feedPage.feedList.clickShareIcon(commentText),
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
        await siteDashboardPage.clickShareThoughtsButton();

        // Click Recognition tab in the composer
        const createFeedPostComponent = siteDashboardPage.createFeedPostComponent;
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
        await feedPage.feedList.waitForPostToBeVisible(recognitionMessage);

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
          await contentPreviewPage.clickShareContentButton();

          // Wait for share modal to appear
          await shareComponent.verifyShareModalIsFunctional();

          // Step 1: Cancel Flow
          // Enter inappropriate text
          await shareComponent.enterShareDescription(inappropriateText);

          // Select post location
          if (postIn === 'Site Feed') {
            await shareComponent.selectShareOptionAsSiteFeed();
            if (siteName) {
              await shareComponent.enterSiteName(siteName);
            }
          }

          // Click Share button
          await shareComponent.clickShareButton();

          // Verify warning popup appears
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Click Cancel button
          await warningPopup.clickCancel();

          // Verify popup is closed
          await warningPopup.verifyWarningPopupClosed();

          // Verify share modal is still functional and user can edit content
          await shareComponent.verifyShareModalIsFunctional();

          // Step 2: Submit Anyway Flow
          // Enter inappropriate text again
          await shareComponent.enterShareDescription(inappropriateText);

          // Click Share button
          await shareComponent.clickShareButton();

          // Verify warning popup appears
          await warningPopup.verifyWarningPopupVisible();
          await warningPopup.verifyWarningMessage();

          // Click Submit Anyway button (Continue button)
          await warningPopup.clickContinue();

          // Verify popup is closed
          await warningPopup.verifyWarningPopupClosed();
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
      'verify user can mention sites, click mentions to navigate, edit site mentions, and delete post from Home Feed CONT-24122',
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
          await feedPage.clickShareThoughtsButton();

          // Create post mentioning Public Site, Private Site, and Unlisted Site
          // Note: createfeedWithMentionUserNameAndTopic requires userName and topicName, so we provide them
          const postResult = await feedPage.postEditor.createfeedWithMentionUserNameAndTopic({
            text: initialPostText,
            userName: userName,
            topicName: topicName,
            siteName: [publicSiteName, privateSiteName],
            embedUrl: '', // No embed URL needed
          });

          createdPostText = postResult.postText;
          createdPostId = postResult.postId || '';

          // Verify post creation - use base text for verification as mentions may render differently
          await feedPage.feedList.waitForPostToBeVisible(initialPostText);
          await feedPage.feedList.validatePostText(initialPostText);
        });

        // Step 2: Navigate via Site Mentions
        await test.step('Navigate via site mentions', async () => {
          // Click Public Site mention and verify navigation
          await feedPage.clickSiteMentionInPost(initialPostText, publicSiteName, publicSiteId);

          // Return to Home-Global Feed
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();
          await feedPage.feedList.waitForPostToBeVisible(initialPostText);

          // Click Private Site mention and verify navigation
          await feedPage.clickSiteMentionInPost(initialPostText, privateSiteName, privateSiteId);

          // Return to Home-Global Feed
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();
          await feedPage.feedList.waitForPostToBeVisible(initialPostText);
        });

        // Step 3: Edit Site Mentions
        await test.step('Edit site mentions', async () => {
          // Open ellipses menu
          await feedPage.feedList.openPostOptionsMenu(initialPostText);

          // Click Edit
          await feedPage.postEditor.clickEditOption();

          // Verify Update button is disabled initially
          await feedPage.postEditor.verifyUpdateButtonDisabled();

          // Remove "Public Site" mention
          await feedPage.postEditor.removeSiteMention(publicSiteName);

          // Add "Public Site2" mention
          await feedPage.postEditor.addSiteName(publicSite2Name);

          // Click Update button to save changes
          await feedPage.postEditor.clickUpdateButton();

          // Verify updated post shows new site mention
          await feedPage.feedList.waitForPostToBeVisible(initialPostText);
        });

        // Step 4: Verify Updated Mention Navigation
        await test.step('Verify updated mention navigation', async () => {
          // Click new site mention
          await feedPage.clickSiteMentionInPost(initialPostText, publicSite2Name, publicSite2Id);

          // Return to Home-Global Feed
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();
          await feedPage.feedList.waitForPostToBeVisible(initialPostText);
        });

        // Step 5: Delete Post
        await test.step('Delete post from Home Feed', async () => {
          // Return to Home-Global Feed (already there, but ensure)
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.verifyThePageIsLoaded();

          // Open ellipses menu
          await feedPage.feedList.openPostOptionsMenu(initialPostText);

          // Click Delete option
          await feedPage.feedList.clickDeleteOption();

          // Confirm delete in the dialog
          await feedPage.feedList.confirmDelete();

          // Verify post is removed from feed
          await feedPage.feedList.validatePostNotVisible(initialPostText);
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

        await adminFeedPage.clickShareThoughtsButton();
        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const postResult = await adminFeedPage.postEditor.createAndPost({ text: postText });
        await adminFeedPage.feedList.waitForPostToBeVisible(postText);

        // Add reply to the post
        const replyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await adminFeedPage.feedList.addReplyToPost(replyText, postResult.postId || '');
        await adminFeedPage.feedList.verifyReplyIsVisible(replyText);

        // Login as EndUser and verify Follow button on hover in feed post
        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.reloadPage();
        await endUserFeedPage.feedList.waitForPostToBeVisible(postText);

        // Hover on profile icon in feed post - verify user name, photo, and Follow button
        await endUserFeedPage.feedList.hoverOnProfileIconInPost(postText, appManagerFullName);
        await endUserFeedPage.feedList.verifyUserNameVisible(appManagerFullName);
        await endUserFeedPage.feedList.verifyFollowButtonVisible(appManagerFullName);

        // Click Follow button and verify Following button is visible
        await endUserFeedPage.feedList.clickFollowButton(appManagerFullName);
        await endUserFeedPage.feedList.verifyFollowingButtonVisible(appManagerFullName);

        await endUserFeedPage.feedList.clickOnSideToRemoveProfilePopover();

        // Hover on profile icon in reply - verify Following button is visible
        await endUserFeedPage.feedList.hoverOnProfileIconInReply(replyText, appManagerFullName);
        await endUserFeedPage.feedList.verifyFollowingButtonVisible(appManagerFullName);

        // Click Following button in reply and verify Follow button is visible
        await endUserFeedPage.feedList.clickFollowingButton(appManagerFullName);
        await endUserFeedPage.feedList.verifyFollowButtonVisible(appManagerFullName);
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

        await feedPage.clickShareThoughtsButton();

        await feedPage.postEditor.createPost(postText);

        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        await feedPage.postEditor.uploadFiles([imagePath]);

        await feedPage.share.selectShareOptionAsSiteFeed();

        await feedPage.share.enterSiteName(siteName);

        await feedPage.postEditor.clickPostButton();

        await feedPage.feedList.waitForPostToBeVisible(postText);

        await feedPage.verifyAllDataPointsForFeedPost(postText, 1);

        await feedPage.feedList.clickSiteNameOnPost(postText, siteName);

        siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });

        await siteDashboardPage.clickOnFeedLink();
        await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

        await feedPage.feedList.waitForPostToBeVisible(postText);

        await feedPage.verifyAllDataPointsForFeedPost(postText, 1);

        await feedPage.verifyThePageIsLoaded();
        await feedPage.feedList.waitForPostToBeVisible(postText);

        await feedPage.deletePost(postText);
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

        await test.step('Login as Admin and create global post with file attachment', async () => {
          await appManagerFixture.homePage.verifyThePageIsLoaded();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.verifyThePageIsLoaded();

          await adminFeedPage.clickShareThoughtsButton();

          const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
          createdPostText = postText;

          await adminFeedPage.postEditor.createPost(postText);

          const documentPath = FILE_TEST_DATA.EXCEL.SAMPLE_XLSX.getPath(__dirname);
          const postResult = await adminFeedPage.postEditor.createAndPost({
            text: postText,
            attachments: {
              files: [documentPath],
            },
          });

          createdPostId = postResult.postId || '';

          await adminFeedPage.feedList.waitForPostToBeVisible(postText);
        });

        let replyText: string = '';
        await test.step('Admin creates reply ', async () => {
          const adminFeedPage = new FeedPage(appManagerFixture.page);

          replyText = FEED_TEST_DATA.POST_TEXT.REPLY;

          await adminFeedPage.feedList.addReplyToPost(replyText, createdPostId);

          await adminFeedPage.feedList.verifyReplyIsVisible(replyText);
        });

        await test.step("End user verifies Copy link option on other user's post", async () => {
          const endUserFeedPage = new FeedPage(standardUserFixture.page);

          await endUserFeedPage.reloadPage();

          await endUserFeedPage.feedList.waitForPostToBeVisible(createdPostText);

          await endUserFeedPage.postEditor.openPostOptionsMenu(createdPostText);

          await endUserFeedPage.feedList.verifyOnlyCopyLinkOptionVisible(createdPostText);

          await endUserFeedPage.feedList.clickCopyLinkOption();

          await endUserFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.COPY_LINK_TO_POST_SUCCESSFULLY
          );

          await endUserFeedPage.postEditor.openPostOptionsMenu(replyText);

          await endUserFeedPage.feedList.verifyReplyOptionsMenuNotVisible(replyText);
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
          await adminFeedPage.clickShareThoughtsButton();

          const createFeedPostComponent = adminFeedPage.postEditor;

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

          await createFeedPostComponent.verifyAttachedFileCount(filePaths.length);

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
          await adminFeedPage.feedList.waitForPostToBeVisible(initialPostText);

          await adminFeedPage.feedList.getPostTimestamp(initialPostText);

          await adminFeedPage.verifyAllDataPointsForFeedPost(initialPostText, 7);
        });

        // ==================== EDIT FEED POST ====================
        await test.step('Edit feed post and remove one attachment', async () => {
          await adminFeedPage.postEditor.openPostOptionsMenu(initialPostText);

          await adminFeedPage.postEditor.clickEditOption();

          const createFeedPostComponent = adminFeedPage.postEditor;

          await createFeedPostComponent.verifyUpdateButtonDisabled();

          await createFeedPostComponent.verifyEditorVisible();

          const deleteIcons = await createFeedPostComponent.deleteFileIcon.all();
          if (deleteIcons.length > 0) {
            await deleteIcons[0].hover();
            await expect(deleteIcons[0]).toBeVisible();
          }

          const initialFileCount = await createFeedPostComponent.attachedFiles.count();
          await createFeedPostComponent.removeAttachedFile(0);

          await createFeedPostComponent.verifyAttachedFileCount(initialFileCount - 1);

          await createFeedPostComponent.updatePostText(updatedPostText);

          await createFeedPostComponent.clickUpdateButton();
        });

        // ==================== VERIFY POST UPDATED ====================
        await test.step('Verify feed post is updated successfully', async () => {
          await adminFeedPage.feedList.waitForPostToBeVisible(updatedPostText);

          await adminFeedPage.verifyAllDataPointsForFeedPost(updatedPostText, 6);
        });

        // ==================== DELETE FEED POST ====================
        await test.step('Delete feed post', async () => {
          await adminFeedPage.deletePost(updatedPostText);

          await adminFeedPage.feedList.verifyPostIsNotVisible(updatedPostText);
          createdPostId = '';
          createdPostText = '';
        });
      }
    );
  }
);
