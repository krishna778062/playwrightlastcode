import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage, FeedPostOptions } from '@/src/modules/content/ui/pages/feedPage';

test.describe(
  '@FeedPostCreationWithEmbedURL - Feed Post Creation With Embed URL Tests',
  {
    tag: [ContentTestSuite.FEED_POST_CREATION_WITH_EMBED_URL],
  },
  () => {
    let createdPostText: string;
    let feedPage: FeedPage;

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

      // Verify home page is loaded
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Initialize feed page
      feedPage = new FeedPage(appManagerFixture.page);

      // Navigate to Feed (handles both separate tab and home page scenarios)
      await appManagerFixture.navigationHelper.clickOnGlobalFeed({
        stepInfo: 'Navigate to Feed page or stay on Home if Feed is integrated',
      });
    });

    test(
      'verify user is able to Add Edit Delete Embedded URL on Home Feed Post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24123'],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'CONT-24123',
          description: 'Verify user can add, edit and delete embedded URL in home feed post',
          storyId: 'CONT-24123',
        });

        // Generate feed data with YouTube URL
        const postText = TestDataGenerator.generateRandomText();
        const embedUrl = TestDataGenerator.generateYouTubeEmbedUrl();

        await test.step('Create feed post with embedded URL', async () => {
          // First click the share thoughts button to open the editor
          await feedPage.clickShareThoughtsButton();

          const feedPostOptions: FeedPostOptions = {
            text: postText,
            embedUrl: embedUrl,
          };
          // Use the Page Object Model to create the post
          const postResult = await feedPage.createAndPost(feedPostOptions);

          // Store the created post details
          createdPostText = postText;
        });

        await test.step('Verify post is created with embedded URL', async () => {
          // Use existing functions to verify the post is visible with full content including URL
          await feedPage.assertions.validatePostText(postText);
          await feedPage.assertions.verifyEmbededUrlIsVisible(embedUrl);
        });

        const editText = TestDataGenerator.generateRandomText();
        await test.step('Edit the embedded URL in the post', async () => {
          const newEmbedUrl = TestDataGenerator.generateYouTubeEmbedUrl2();

          // Use the Page Object Model to edit the post
          await feedPage.editPost(postText, editText, newEmbedUrl);

          // Verify updated content is visible
          await feedPage.assertions.validatePostText(editText);
          await feedPage.assertions.verifyEmbededUrlIsVisible(embedUrl);
        });

        await test.step('Delete the post', async () => {
          // Use the Page Object Model to delete the post
          await feedPage.deletePost(editText);
        });
      }
    );

    test.afterEach('Cleanup test data', async ({ appManagerFixture }) => {
      try {
        // Clean up created post if it exists (using API method)
        if (createdPostText) {
          // Note: API cleanup might not be available, but UI deletion already handled in test
          console.log(`Post with text "${createdPostText}" was deleted via UI in the test`);
        }
      } catch (error) {
        console.warn('Cleanup failed:', error);
      }
    });
  }
);

test.describe(
  '@FeedPostCreationWithEmbedURL - Feed Post and Reply With Embed Video URL Tests',
  {
    tag: [ContentTestSuite.FEED_POST_CREATION_WITH_EMBED_URL],
  },
  () => {
    let createdPostId: string;
    const youtubeUrl = FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL;
    const vimeoUrl = FEED_TEST_DATA.URLS.EMBED_VIMEO_URL;

    test(
      'verify user is able to add embed video with text on Home Feed Post and reply',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19558'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'CONT-19558',
          description: 'Verify user able to add embed video with text on Home Feed Post and reply',
          storyId: 'CONT-19558',
        });

        const feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.actions.verifyThePageIsLoaded();

        // Generate test data
        const postText = TestDataGenerator.generateRandomText();
        const replyText = FEED_TEST_DATA.POST_TEXT.REPLY;

        await feedPage.actions.clickShareThoughtsButton();

        await test.step(`And Enter the text with video url "${youtubeUrl}" on the Feed Editor section`, async () => {
          const feedPostOptions: FeedPostOptions = {
            text: postText,
            embedUrl: youtubeUrl,
          };
          const postResult = await feedPage.actions.createAndPost(feedPostOptions);
          createdPostId = postResult.postId || '';
        });

        await feedPage.assertions.waitForPostToBeVisible(postText);
        await feedPage.assertions.verifyEmbedUrlPreviewIsVisible(youtubeUrl);

        await feedPage.actions.addReplyToPostWithEmbedUrl(replyText, createdPostId, vimeoUrl);

        await feedPage.assertions.verifyReplyIsVisible(replyText);
        await feedPage.assertions.verifyEmbedUrlPreviewIsVisibleInReply(vimeoUrl, replyText);
      }
    );

    test.afterEach('Cleanup test data', async ({ standardUserFixture }) => {
      try {
        // Clean up created post if it exists (using API method)
        if (createdPostId) {
          await standardUserFixture.feedManagementHelper.deleteFeed(createdPostId);
          createdPostId = '';
        }
      } catch (error) {
        console.warn('Cleanup failed:', error);
      }
    });
  }
);
