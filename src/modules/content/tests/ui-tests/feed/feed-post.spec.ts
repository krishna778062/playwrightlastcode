import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';

import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedManagerService } from '@core/api/services/FeedManagerService';
import { faker } from '@faker-js/faker';

test.describe(
  '@FeedPost',
  {
    tag: [ContentTestSuite.FEED, ContentTestSuite.ATTACHMENTS],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';
    let feedManagerService: FeedManagerService;

    test.beforeEach(async ({ endUserHomePage, feedManagerService: feedService }) => {
      // Navigate to feed page using the logged-in enduser fixture
      await endUserHomePage.actions.clickOnGlobalFeed();
      feedPage = new FeedPage(endUserHomePage.page);
      await feedPage.verifyThePageIsLoaded();
      
      // Store the feed service for cleanup
      feedManagerService = feedService;
    });

    test.afterEach(async () => {
      // Cleanup: Delete post using API if test failed and post still exists
      if (createdPostText && feedManagerService) {
        try {

          if (createdPostId) {
            await feedManagerService.deletePost(createdPostId);
          } else {
            console.log('No feed was published, hence skipping the deletion');
          }
        } catch (error) {
          console.log('Failed to cleanup post via API:', error);
        }
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
        const postResult = await feedPage.actions.createAndPublishPost({
          text: initialPostText,
          attachments: {
            files: [
              'images/' + FEED_TEST_DATA.ATTACHMENTS.IMAGE,
              'excel/' + FEED_TEST_DATA.ATTACHMENTS.DOCUMENT,
              'images/' + FEED_TEST_DATA.ATTACHMENTS.FAVICON
            ],
            removeCount: 1 // Remove one file to test attachment removal
          }
        });

        // Store created post text and postId for cleanup (postId would be available if using API creation)
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Get timestamp from list component (verification moved from create component)
       await feedPage.getPostTimestamp(postResult.postText);
      

        // Step 2: Verify post details and attachments
        await feedPage.assertions.verifyPostDetails(postResult.postText, postResult.attachmentCount);

        // Step 3: Edit the post
        await feedPage.actions.editPost(postResult.postText, updatedPostText);
        createdPostText = updatedPostText;

        // Step 4: Delete the post
        await feedPage.actions.deletePost(updatedPostText);
        createdPostText = ''; // Clear stored text as post is deleted
      }
    );
  }
); 