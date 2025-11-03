import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';

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
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

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

        // Step 1: App Manager creates a private site that standard user is NOT a member of
        const privateSiteResult = await appManagerFixture.siteManagementHelper.createPrivateSite({
          waitForSearchIndex: false,
        });
        const privateSiteName = privateSiteResult.siteName;
        console.log(`Created private site: ${privateSiteName}`);

        // Step 2: App Manager creates an unlisted site that standard user is NOT a member of
        const unlistedSiteResult = await appManagerFixture.siteManagementHelper.createUnlistedSite({
          waitForSearchIndex: false,
        });
        const unlistedSiteName = unlistedSiteResult.siteName;
        console.log(`Created unlisted site: ${unlistedSiteName}`);

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
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Test feed post creation, editing and deletion with file attachments',
          zephyrTestId: 'CONT-26611',
          storyId: 'CONT-26611',
        });

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteWithUserAsOwner(users.endUser.email);

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
  }
);
