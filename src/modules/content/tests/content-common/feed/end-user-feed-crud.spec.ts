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
