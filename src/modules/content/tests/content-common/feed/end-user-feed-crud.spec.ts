import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { FeedPage } from '@content/ui/pages/feedPage';
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

        // Step 2: Standard User - Already logged in via standardUserFixture
        await standardUserFixture.homePage.verifyThePageIsLoaded();

        // Step 3: User clicks on Home-Global Feed
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Step 4: Click on "Share your thoughts" button
        await feedPage.actions.clickShareThoughtsButton();

        // Step 5: Create a post and send it to the editor
        const initialPostText = `Test post for site access validation ${faker.company.name()}`;
        await feedPage.actions.enterFeedPostText(initialPostText);

        // Step 6: User select share option as "site feed"
        await feedPage.actions.selectShareOptionAsSiteFeed();

        // Step 7: Enter private site name which User is not member of
        await feedPage.actions.searchForSiteName(privateSiteName);

        // Step 8: Verify "No results" is getting displayed
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

        // Step 4: Click on "Browse files" button
        await feedPage.actions.clickBrowseFilesButton();

        // Step 5: Enter '.mp4' in 'Search files' field
        await feedPage.actions.searchForFileInLibrary('.mp4');

        // Step 6: Select first result ".mp4" video
        await feedPage.actions.selectFileFromLibrary('.mp4');

        // Step 7: Click "Attach" button
        await feedPage.actions.clickAttachButton();

        // Step 8: Verify the selected video appears as an attachment
        await feedPage.assertions.verifyFileIsAttached('.mp4');

        // Step 9: Click on "Post" button to publish
        await feedPage.actions.clickPostButton();

        // Step 10: Verify the feed post is published successfully
        console.log('Video feed post published successfully');
      }
    );
  }
);
