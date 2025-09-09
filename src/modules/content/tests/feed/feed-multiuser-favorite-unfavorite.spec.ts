import { faker } from '@faker-js/faker';
import path from 'path';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { FEED_TEST_DATA } from '../../test-data/feed.test-data';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { TestGroupType } from '@/src/core/constants/testType';
import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/pages/feedPage';

test.describe(
  '@FeedMultiUser - Multi-User Feed Post Favorite/Unfavorite Tests (Site Owner, Manager, Content Manager)',
  {
    tag: [ContentTestSuite.FEED_MULTI_USER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let standardUserFeedPage: FeedPage;
    let siteManagerFeedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';
    let createdSite: any;

    // Test data for data-driven testing
    const favoriteTestData = [
      {
        testName: 'without file attachment',
        description:
          'Verify Site Owner, Manager and Content Manager is able to favorite and unfavorite Feed post without File Attachment on Content Feed',
        hasAttachment: false as const,
        storyId: 'CONT-39249',
      },
      {
        testName: 'with file attachment',
        description:
          'Verify Site Owner, Manager and Content Manager is able to favorite and unfavorite Feed post with File Attachment',
        hasAttachment: true as const,
        fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileName,
        fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileSize,
        mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.mimeType,
        filePath: FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileName
        ),
        storyId: 'CONT-24919',
      },
    ];

    test.beforeEach(
      'Setup test environment and create feed',
      async ({
        appManagerHomePage,
        standardUserHomePage,
        siteManagerHomePage,
        appManagerApiClient,
        siteManagementHelper,
        feedManagementHelper,
      }) => {
        // Initialize feed pages for different user roles
        appManagerFeedPage = new FeedPage(appManagerHomePage.page);
        standardUserFeedPage = new FeedPage(standardUserHomePage.page);
        siteManagerFeedPage = new FeedPage(siteManagerHomePage.page);

        // Setup user and site
        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
        const endUserPeopleId = await identityManagementHelper.getUserIdByEmail(users.endUser.email);

        createdSite = await siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });

        // update user as a content manager of the site
        await siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: createdSite.siteId,
          userId: endUserPeopleId,
          role: SitePermission.CONTENT_MANAGER,
        });
      }
    );

    // Data-driven test for favorite/unfavorite functionality
    for (const testData of favoriteTestData) {
      test(
        `Verify Site Owner/Manager/Content Manager can favorite and unfavorite feed post ${testData.testName}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, '@' + testData.storyId],
        },
        async ({ feedManagementHelper }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.storyId,
            storyId: testData.storyId,
          });

          // Generate feed test data using the test data generator
          const feedTestData = testData.hasAttachment
            ? TestDataGenerator.generateFeed({
                scope: 'site',
                siteId: createdSite.siteId,
                withAttachment: true as const,
                fileName: testData.fileName,
                fileSize: testData.fileSize,
                mimeType: testData.mimeType,
                filePath: testData.filePath,
                waitForSearchIndex: false,
              })
            : TestDataGenerator.generateFeed({
                scope: 'site',
                siteId: createdSite.siteId,
                withAttachment: false as const,
                waitForSearchIndex: false,
              });
          createdPostText = feedTestData.text;

          // Create feed based on test data
          const feedResponse = await feedManagementHelper.createFeed(feedTestData);
          console.log(`Created feed via Helper: ${feedResponse.result.feedId}`);

          // Store created post ID for cleanup
          createdPostId = feedResponse.result.feedId;

          // Navigate all pages to the feed URL in parallel
          await Promise.all([
            appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId)),
            standardUserFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId)),
            siteManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId)),
          ]);

          // Wait for posts to be visible on all pages in parallel
          await Promise.all([
            appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
            standardUserFeedPage.assertions.waitForPostToBeVisible(createdPostText),
            siteManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
          ]);

          // Test favorite/unfavorite operations in parallel for all user roles
          await Promise.all([
            // App Manager favorite/unfavorite
            (async () => {
              await appManagerFeedPage.actions.markPostAsFavourite();
              await appManagerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await appManagerFeedPage.actions.removePostFromFavourite(createdPostText);
              await appManagerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Standard User favorite/unfavorite
            (async () => {
              await standardUserFeedPage.actions.markPostAsFavourite();
              await standardUserFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await standardUserFeedPage.actions.removePostFromFavourite(createdPostText);
              await standardUserFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Site Manager favorite/unfavorite
            (async () => {
              await siteManagerFeedPage.actions.markPostAsFavourite();
              await siteManagerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await siteManagerFeedPage.actions.removePostFromFavourite(createdPostText);
              await siteManagerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
          ]);
        }
      );
    }
  }
);
