import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { TestGroupType } from '@/src/core/constants/testType';
import { SitePermission } from '@/src/core/types/siteManagement.types';
import { FeedSortBy } from '@/src/modules/content/constants/feedSortBy';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';

test.describe(
  '@FeedMultiUser - Verify Sort by Recent Activity shows shared posts accordingly',
  {
    tag: [ContentTestSuite.FEED_MULTI_USER, ContentTestSuite.FEED],
  },
  () => {
    let createdPostText: string;
    let createdPostId: string = '';
    let createdSite: any;

    test.beforeEach('Setup test environment: Create site and get user IDs', async ({ appManagerFixture }) => {
      const siteContentManagerInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(
        users.endUser.email
      );
      // Create a public site
      createdSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
        waitForSearchIndex: false,
      });

      // Make endUser (Site Content Manager) a content manager of the site
      await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
        siteId: createdSite.siteId,
        userId: siteContentManagerInfo.userId,
        role: SitePermission.CONTENT_MANAGER,
      });
    });

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
      'in Zeus Verify Sort by options should show shared posts accordingly - Recent Activity CONT-26729',
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

        // Create a Feed post with text "Created a Feed Post"
        createdPostText = FEED_TEST_DATA.POST_TEXT.INITIAL;

        // Login as Site Manager (Admin shouldn't be following Site Manager)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(siteManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.clickShareThoughtsButton();
        const feedResponse1 = await feedPage.postEditor.createAndPost({ text: createdPostText });
        createdPostId = feedResponse1.postId || '';
        await feedPage.feedList.waitForPostToBeVisible(createdPostText);

        // Login as Site Content Manager (Admin should be following Site Content Manager)
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const siteContentManagerFeedPage = new FeedPage(standardUserFixture.page);
        await siteContentManagerFeedPage.reloadPage();
        await siteContentManagerFeedPage.verifyThePageIsLoaded();
        await siteContentManagerFeedPage.clickOnShowOption('all');

        // Click on "Share" icon for the feed post created by "Site Manager"
        await siteContentManagerFeedPage.feedList.waitForPostToBeVisible(createdPostText);
        await siteContentManagerFeedPage.feedList.clickShareButtonForPost(createdPostText);

        // Add a message "Shared Manager's Post" and select Post in as "Home Feed"
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;
        await siteContentManagerFeedPage.share.enterShareDescription(shareMessage);

        // Click on "Share" button
        await siteContentManagerFeedPage.share.clickShareButton();

        // Login as Admin
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.reloadPage();
        await adminFeedPage.verifyThePageIsLoaded();

        // Navigate to Global Feed
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        await adminFeedPage.clickOnShowOption('all');

        // Like the Feed post made by Site Manager
        await adminFeedPage.feedList.waitForPostToBeVisible(shareMessage);

        await adminFeedPage.feedList.markPostAsFavourite();
        await adminFeedPage.feedList.verifyPostIsFavorited(shareMessage);

        // Select sort by option as "Recent Activity"
        await adminFeedPage.clickOnSortByOption(FeedSortBy.RECENT_ACTIVITY);

        // Wait for the feed to re-sort by waiting for the post to be visible again
        await adminFeedPage.feedList.waitForPostToBeVisible(shareMessage);

        // Verify User is able to view the Site Manager's Feed post at the top
        await adminFeedPage.feedList.verifyPostIsAtTop(shareMessage);
      }
    );
  }
);
