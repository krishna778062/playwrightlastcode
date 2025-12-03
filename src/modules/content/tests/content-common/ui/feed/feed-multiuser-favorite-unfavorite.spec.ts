import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestGroupType } from '@/src/core/constants/testType';
import { SitePermission } from '@/src/core/types/siteManagement.types';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

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
      async ({ appManagerFixture, standardUserFixture, siteManagerFixture }) => {
        // Configure app governance settings and enable timeline comment post(feed)
        /** await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */

        // Initialize feed pages for different user roles
        appManagerFeedPage = new FeedPage(appManagerFixture.page);
        standardUserFeedPage = new FeedPage(standardUserFixture.page);
        siteManagerFeedPage = new FeedPage(siteManagerFixture.page);

        // Setup user and site
        const identityManagementHelper = new IdentityManagementHelper(
          appManagerFixture.apiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );
        const endUserInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        createdSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });

        // update user as a content manager of the site
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: createdSite.siteId,
          userId: endUserInfo.userId,
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
        async ({ appManagerFixture }) => {
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
          const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
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

test.describe(
  'site Feed Post Favorite/Unfavorite Multi-User Tests',
  {
    tag: [ContentTestSuite.FEED_MULTI_USER],
  },
  () => {
    let createdPostText: string;
    let siteId: string;
    const siteName = 'All Employees';

    // Test data for data-driven testing
    const favoriteTestData = [
      {
        testName: 'without file attachment',
        description:
          'Verify Site Owner, Manager and Content Manager is able to favorite and unfavorite Feed post without File Attachment on Site Feed',
        hasAttachment: false as const,
        storyId: 'CONT-24907',
      },
      {
        testName: 'with file attachment',
        description:
          'Verify Site Owner, Manager and Content Manager is able to favorite and unfavorite Feed post with File Attachment on Site Feed',
        hasAttachment: true as const,
        fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileName,
        fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileSize,
        mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.mimeType,
        filePath: FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileName
        ),
        storyId: 'CONT-24907',
      },
    ];

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      /*
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */

      // Get or create "All Employees" site using getSiteIdWithName which handles both cases
      siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName, {
        accessType: SITE_TYPES.PUBLIC,
      });

      // Get user info for all roles
      const siteOwnerInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);
      const siteManagerInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(
        users.siteManager.email
      );
      const endUserInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

      // Make appManager as Site Owner
      try {
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteId,
          userId: siteOwnerInfo.userId,
          role: SitePermission.OWNER,
        });
      } catch (error) {
        // Log and continue - user may already have correct role or "All Employees" has API restrictions
        console.log(`Note: Could not set OWNER role (may already be set or site has restrictions): ${error}`);
      }

      // Make siteManager as Site Manager
      try {
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteId,
          userId: siteManagerInfo.userId,
          role: SitePermission.MANAGER,
        });
      } catch (error) {
        // Log and continue - user may already have correct role or "All Employees" has API restrictions
        console.log(`Note: Could not set MANAGER role (may already be set or site has restrictions): ${error}`);
      }

      // Make endUser as Content Manager
      try {
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteId,
          userId: endUserInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });
      } catch (error) {
        // Log and continue - user may already have correct role or "All Employees" has API restrictions
        console.log(`Note: Could not set CONTENT_MANAGER role (may already be set or site has restrictions): ${error}`);
      }
    });

    for (const testData of favoriteTestData) {
      test(
        `Verify Site Owner/Manager/Content Manager can favorite and unfavorite feed post ${testData.testName} on Site Feed`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, '@' + testData.storyId],
        },
        async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.storyId,
            storyId: testData.storyId,
          });

          // Generate feed test data using the test data generator
          const feedTestData = testData.hasAttachment
            ? TestDataGenerator.generateFeed({
                scope: 'site',
                siteId: siteId,
                withAttachment: true as const,
                fileName: testData.fileName,
                fileSize: testData.fileSize,
                mimeType: testData.mimeType,
                filePath: testData.filePath,
                waitForSearchIndex: false,
              })
            : TestDataGenerator.generateFeed({
                scope: 'site',
                siteId: siteId,
                withAttachment: false as const,
                waitForSearchIndex: false,
              });
          createdPostText = feedTestData.text;

          // Create feed based on test data via API
          // Note: feedManagementHelper automatically tracks created feeds for cleanup via fixture
          const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
          console.log(`Created feed via API: ${feedResponse.result.feedId}`);

          // Navigate all users to Site Feed via Site Dashboard → Feed Link in parallel
          const [ownerFeedPage, managerFeedPage, contentFeedPage] = await Promise.all([
            // Site Owner navigation
            (async () => {
              const siteOwnerDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
              await siteOwnerDashboardPage.goToUrl(PAGE_ENDPOINTS.getSiteDashboardPage(siteId));
              await siteOwnerDashboardPage.actions.clickOnFeedLink();
              const feedPage = new FeedPage(appManagerFixture.page);
              await feedPage.goToUrl(PAGE_ENDPOINTS.getFeedPage(feedResponse.result.feedId));
              return feedPage;
            })(),
            // Site Manager navigation
            (async () => {
              const siteManagerDashboardPage = new SiteDashboardPage(siteManagerFixture.page, siteId);
              await siteManagerDashboardPage.goToUrl(PAGE_ENDPOINTS.getSiteDashboardPage(siteId));
              await siteManagerDashboardPage.actions.clickOnFeedLink();
              const feedPage = new FeedPage(siteManagerFixture.page);
              await feedPage.goToUrl(PAGE_ENDPOINTS.getFeedPage(feedResponse.result.feedId));
              return feedPage;
            })(),
            // Content Manager navigation
            (async () => {
              const contentManagerDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
              await contentManagerDashboardPage.goToUrl(PAGE_ENDPOINTS.getSiteDashboardPage(siteId));
              await contentManagerDashboardPage.actions.clickOnFeedLink();
              const feedPage = new FeedPage(standardUserFixture.page);
              await feedPage.goToUrl(PAGE_ENDPOINTS.getFeedPage(feedResponse.result.feedId));
              return feedPage;
            })(),
          ]);

          // Wait for posts to be visible on all pages in parallel
          await Promise.all([
            ownerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
            managerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
            contentFeedPage.assertions.waitForPostToBeVisible(createdPostText),
          ]);

          // Test favorite/unfavorite operations in parallel for all user roles
          await Promise.all([
            // Site Owner favorite/unfavorite
            (async () => {
              await ownerFeedPage.actions.markPostAsFavourite();
              await ownerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await ownerFeedPage.actions.removePostFromFavourite(createdPostText);
              await ownerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Site Manager favorite/unfavorite
            (async () => {
              await managerFeedPage.actions.markPostAsFavourite();
              await managerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await managerFeedPage.actions.removePostFromFavourite(createdPostText);
              await managerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Content Manager favorite/unfavorite
            (async () => {
              await contentFeedPage.actions.markPostAsFavourite();
              await contentFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await contentFeedPage.actions.removePostFromFavourite(createdPostText);
              await contentFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
          ]);
        }
      );
    }
  }
);

test.describe(
  'home Feed Post Favorite/Unfavorite Tests',
  {
    tag: [ContentTestSuite.FEED_MULTI_USER],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';

    test.beforeEach(async ({ standardUserFixture }) => {
      await standardUserFixture.homePage.verifyThePageIsLoaded();
      await standardUserFixture.navigationHelper.clickOnGlobalFeed();

      feedPage = new FeedPage(standardUserFixture.page);
      await feedPage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({ appManagerFixture }) => {
      if (createdPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
        createdPostId = '';
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'verify EndUser1 can favorite and unfavorite a feed post on Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19557'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'In Zeus, verify user is able to favorite and unfavorite a Feed post on Home Feed',
          zephyrTestId: 'CONT-19557',
          storyId: 'CONT-19557',
        });

        await test.step('Create a global post', async () => {
          await feedPage.actions.clickShareThoughtsButton();

          createdPostText = FEED_TEST_DATA.POST_TEXT.INITIAL;

          await feedPage.actions.enterFeedPostText(createdPostText);

          const postResult = await feedPage.actions.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';

          await feedPage.assertions.waitForPostToBeVisible(createdPostText);
        });

        await test.step('Get the count of feed as favorite', async () => {
          await feedPage.assertions.verifyPostIsNotFavorited(createdPostText);
        });

        await test.step('Click on favourite icon on feed', async () => {
          await feedPage.actions.markPostAsFavourite();
        });

        await test.step('Verify the status of feed after favorite', async () => {
          await feedPage.assertions.verifyPostIsFavorited(createdPostText);
        });

        await test.step('Click on favourite icon on feed post to untag', async () => {
          await feedPage.actions.removePostFromFavourite(createdPostText);
        });

        await test.step('Verify the status of feed after unFavorite', async () => {
          await feedPage.assertions.verifyPostIsNotFavorited(createdPostText);
        });

        await test.step('Click on option menu three dot, click Delete, verify confirmation, and delete', async () => {
          await feedPage.actions.deletePost(createdPostText);
        });

        await test.step('Verify feed post is deleted without edit', async () => {
          await feedPage.assertions.verifyPostIsNotVisible(createdPostText);
          createdPostId = '';
          createdPostText = '';
        });
      }
    );
  }
);
