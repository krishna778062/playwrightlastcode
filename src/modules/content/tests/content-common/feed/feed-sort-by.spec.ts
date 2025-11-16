import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestGroupType } from '@/src/core/constants/testType';
import { SitePermission } from '@/src/core/types/siteManagement.types';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { FeedSortBy } from '@/src/modules/content/constants/feedSortBy';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';

test.describe(
  '@FeedMultiUser - Verify Sort by Recent Activity shows shared posts accordingly',
  {
    tag: [ContentTestSuite.FEED_MULTI_USER],
  },
  () => {
    let siteManagerFeedPage: FeedPage;
    let siteContentManagerFeedPage: FeedPage;
    let adminFeedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';
    let createdSite: any;

    test.beforeEach(
      'Setup test environment: Create site and get user IDs',
      async ({ siteManagerFixture, appManagerFixture }) => {
        const siteContentManagerInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        // Create a public site
        createdSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });

        // Make endUser (Site Content Manager) a content manager of the site
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: createdSite.siteId,
          userId: siteContentManagerInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });

        // Initialize feed pages
        siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        siteContentManagerFeedPage = new FeedPage(siteManagerFixture.page);
        adminFeedPage = new FeedPage(appManagerFixture.page);
      }
    );

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Delete post using API if test failed and post still exists
      if (createdPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
      }
    });

    test(
      'in Zeus Verify Sort by options should show shared posts accordingly - Recent Activity',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26729'],
      },
      async ({ siteManagerFixture, standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that when sorting by Recent Activity, shared posts appear at the top based on recent activity (likes, shares, etc.)',
          zephyrTestId: 'CONT-26729',
          storyId: 'CONT-26729',
        });

        // Login as Site Manager (Admin shouldn't be following Site Manager)
        await siteManagerFixture.homePage.verifyThePageIsLoaded();

        // Create a Feed post with text "Created a Feed Post"
        createdPostText = FEED_TEST_DATA.POST_TEXT.SHARED;
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: createdSite.siteId,
          withAttachment: false as const,
          waitForSearchIndex: false,
        });

        // Navigate to site feed
        await siteManagerFeedPage.page.goto(PAGE_ENDPOINTS.getSiteFeedPage(createdSite.siteId));

        // Create feed post with custom text
        const feedResponse = await siteManagerFixture.feedManagementHelper.createFeed({
          ...feedTestData,
          text: createdPostText,
        });
        createdPostId = feedResponse.result.feedId;
        console.log(`Created feed via API: ${createdPostId}`);

        // Navigate to the feed URL to see the post
        await siteManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Login as Site Content Manager (Admin should be following Site Content Manager)
        siteContentManagerFeedPage = new FeedPage(standardUserFixture.page);
        await standardUserFixture.homePage.verifyThePageIsLoaded();

        // Navigate to Global Feed and Select Show filter as "All Posts"
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await siteContentManagerFeedPage.verifyThePageIsLoaded();
        await siteContentManagerFeedPage.actions.clickOnShowOption('all');

        // Click on "Share" icon for the feed post created by "Site Manager"
        await siteContentManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
        await siteContentManagerFeedPage.actions.clickShareButtonForPost(createdPostText);

        // Add a message "Shared Manager's Post" and select Post in as "Home Feed"
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;
        await siteContentManagerFeedPage.actions.enterShareDescription(shareMessage);

        // Click on "Share" button
        await siteContentManagerFeedPage.actions.clickShareButton();

        // Login as Admin
        await appManagerFixture.homePage.verifyThePageIsLoaded();

        // Navigate to Global Feed
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        await adminFeedPage.actions.clickOnShowOption('all');

        // Like the Feed post made by Site Manager
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        await adminFeedPage.actions.markPostAsFavourite();
        await adminFeedPage.assertions.verifyPostIsFavorited(shareMessage);

        // Select sort by option as "Recent Activity"
        await adminFeedPage.actions.clickOnSortByOption(FeedSortBy.RECENT_ACTIVITY);

        // Wait for the feed to re-sort by waiting for the post to be visible again
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Verify User is able to view the Site Manager's Feed post at the top
        await adminFeedPage.assertions.verifyPostIsAtTop(shareMessage);
      }
    );
  }
);
