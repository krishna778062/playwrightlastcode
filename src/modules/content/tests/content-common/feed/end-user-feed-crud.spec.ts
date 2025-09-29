import { faker } from '@faker-js/faker';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { FeedPage } from '@content/ui/pages/feedPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  '@FeedPost',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, ContentTestSuite.ATTACHMENTS],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';

    test.beforeEach(async ({ standardUserHomePage, feedManagementHelper, standardUserUINavigationHelper }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });

      await standardUserHomePage.verifyThePageIsLoaded();
      await standardUserUINavigationHelper.clickOnGlobalFeed();

      feedPage = new FeedPage(standardUserHomePage.page);
      await feedPage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({ feedManagementHelper }) => {
      // Cleanup: Delete post using API if test failed and post still exists
      if (createdPostId && feedManagementHelper) {
        try {
          await feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'Verify user can create, edit and delete a feed post with attachments',
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
        const initialPostText = `Automated Test Post ${faker.company.name()}`;
        const updatedPostText = `Updated Test Post ${faker.company.buzzPhrase()}`;

        // Step 1: Create a new post with multiple attachments via UI
        // Note: Post can also be created via API using:
        // const { postResult: apiPostResult, postId } = await feedManagerService.createPost({ text: initialPostText });
        const postResult = await feedPage.actions.createAndPost({
          text: initialPostText,
          attachments: {
            files: ['images/' + FEED_TEST_DATA.ATTACHMENTS.IMAGE, 'excel/' + FEED_TEST_DATA.ATTACHMENTS.DOCUMENT],
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
      }
    );
  }
);
