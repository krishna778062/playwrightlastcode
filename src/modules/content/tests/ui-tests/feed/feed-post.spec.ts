import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@core/pages/homePage/oldUxHomePage';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { LoginHelper } from '@core/helpers/loginHelper';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { faker } from '@faker-js/faker';

test.describe(
  '@FeedPost',
  {
    tag: [ContentTestSuite.FEED, ContentTestSuite.ATTACHMENTS],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;

    test.beforeEach(async ({ page }) => {
      // Login as EndUser1
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().endUserEmail,
        password: getEnvConfig().endUserPassword,
      });

      // Initialize and navigate to feed page
      const HomePage = getEnvConfig().newUxEnabled ? NewUxHomePage : OldUxHomePage;
      const homePage = new HomePage(page);
      await homePage.actions.clickOnGlobalFeed();
      feedPage = new FeedPage(page);
      await feedPage.verifyThePageIsLoaded();
    });

    test.afterEach(async () => {
      // Cleanup: Delete post if test failed and post still exists
      if (createdPostText) {
        try {
          await feedPage.actions.deletePost(createdPostText);
        } catch (error) {
          console.log('Failed to cleanup post:', error);
        }
        createdPostText = '';
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
        const initialPostText = `Automated Test Post ${faker.lorem.sentence()}`;
        const updatedPostText = `Updated Test Post ${faker.lorem.sentence()}`;

        // Step 1: Create a new post with multiple attachments
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

        // Store created post text for cleanup
        createdPostText = postResult.postText;

        // Step 2: Verify post details and attachments
        await feedPage.assertions.verifyTimestampDisplayed(postResult.postText);
        await feedPage.assertions.verifyFileAttachmentsCount(postResult.postText, postResult.attachmentCount);
        //await feedPage.assertions.verifyInlineImage(postResult.postText, postResult.attachmentCount);
        await feedPage.verifyInlineImagePerview(postResult.postText);

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