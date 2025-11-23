import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { RecognitionFormComponent } from '@content/ui/components/recognitionFormComponent';
import { ShareComponent } from '@content/ui/components/shareComponent';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
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
        createdPostId = ''; // Reset after cleanup attempt
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'verify user can create, edit and delete a feed post with attachments',
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

    test(
      'in Zeus, verify that a user is not allowed to add any attachment or media while sharing a Feed post',
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
      'in Zeus, Verify User is able to view "THIS POST HAS BEEN DELETED" message when User doesn\'t have access to the Feed post shared on Private or Unlisted Site',
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

        // Get Site Owner (siteManager) user info
        const siteOwnerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.siteManager.email
        );

        // Get or create a private site where Site Owner is the owner
        const privateSiteDetails = await appManagerApiFixture.siteManagementHelper.getSiteWithUserAsOwner(
          siteOwnerInfo.userId,
          SITE_TYPES.PRIVATE
        );
        const privateSiteName = privateSiteDetails.siteName;
        console.log(`Using private site: ${privateSiteName}`);

        // Create a Feed post on "Private Site" from Home Dashboard
        await adminFeedPage.actions.clickShareThoughtsButton();
        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        await adminFeedPage.actions.enterFeedPostText(postText);

        // Select "Post in Site Feed" option
        await adminFeedPage.actions.selectShareOptionAsSiteFeed();

        // Enter private site name
        await adminFeedPage.actions.enterSiteNameForShare(privateSiteName);

        // Post the feed
        const postResult = await adminFeedPage.actions.createAndPost({
          text: postText,
        });
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await adminFeedPage.assertions.waitForPostToBeVisible(postText);

        const siteOwnerDashboardPage = new SiteDashboardPage(siteManagerFixture.page, privateSiteDetails.siteId);
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
        await siteOwnerFeedPage.assertions.verifyToastMessage('Shared post successfully');

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
      'verify user can create and share recognition from home feed',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-28581'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Create and Share Recognition from Home Feed',
          zephyrTestId: 'CONT-28581',
          storyId: 'CONT-28581',
        });

        // Get a user to recognize (using standard user)
        const recipientInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        const recipientName = recipientInfo.fullName;

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

        // Select a user to recognize under "Who do you want to recognize?"
        await recognitionForm.selectUserForRecognition(recipientName);

        // Select recognition award under "Recognition for"
        await recognitionForm.selectPeerRecognitionAward(0);

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
        await feedPage.assertions.waitForPostToBeVisible(recipientName);
        await feedPage.assertions.waitForPostToBeVisible(recognitionMessage);

        // Click on Avatar profile menu and navigate to Recognition
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        // Create instance of RecognitionHubPage from reward module
        const recognitionHubPage = new RecognitionHubPage(appManagerFixture.page);
        await recognitionHubPage.verifyThePageIsLoaded();

        // Verify Recognition appears on the Recognition dashboard for the selected user
        await recognitionHubPage.verifyRecognitionPostVisible(recipientName, recognitionMessage);
      }
    );
  }
);
