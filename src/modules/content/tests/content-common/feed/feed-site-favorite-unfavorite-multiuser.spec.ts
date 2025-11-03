import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { TestGroupType } from '@/src/core/constants/testType';
import { SitePermission } from '@/src/core/types/siteManagement.types';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

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
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

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
              await siteOwnerDashboardPage.loadPage();
              await siteOwnerDashboardPage.actions.clickOnFeedLink();
              const feedPage = new FeedPage(appManagerFixture.page);
              await feedPage.verifyThePageIsLoaded();
              return feedPage;
            })(),
            // Site Manager navigation
            (async () => {
              const siteManagerDashboardPage = new SiteDashboardPage(siteManagerFixture.page, siteId);
              await siteManagerDashboardPage.loadPage();
              await siteManagerDashboardPage.actions.clickOnFeedLink();
              const feedPage = new FeedPage(siteManagerFixture.page);
              await feedPage.verifyThePageIsLoaded();
              return feedPage;
            })(),
            // Content Manager navigation
            (async () => {
              const contentManagerDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
              await contentManagerDashboardPage.loadPage();
              await contentManagerDashboardPage.actions.clickOnFeedLink();
              const feedPage = new FeedPage(standardUserFixture.page);
              await feedPage.verifyThePageIsLoaded();
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
              await ownerFeedPage.actions.markPostAsFavourite(createdPostText);
              await ownerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await ownerFeedPage.actions.removePostFromFavourite(createdPostText);
              await ownerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Site Manager favorite/unfavorite
            (async () => {
              await managerFeedPage.actions.markPostAsFavourite(createdPostText);
              await managerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await managerFeedPage.actions.removePostFromFavourite(createdPostText);
              await managerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Content Manager favorite/unfavorite
            (async () => {
              await contentFeedPage.actions.markPostAsFavourite(createdPostText);
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
