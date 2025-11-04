import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SitePermission } from '@/src/core/types/siteManagement.types';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

/**
 * Navigates to the content feed page for a specific role
 * @param page - The Playwright page instance
 * @param navigationHelper - Navigation helper instance
 * @param siteId - The site ID
 * @param contentId - The content ID
 * @param siteName - The site name for searching
 * @returns Object containing ContentPreviewPage and FeedPage instances
 */
async function navigateToContentFeedAsRole(
  page: any,
  navigationHelper: any,
  siteId: string,
  contentId: string,
  siteName: string
): Promise<{ contentPreviewPage: ContentPreviewPage; feedPage: FeedPage }> {
  await test.step(`Search for site "${siteName}"`, async () => {
    await navigationHelper.searchForTerm(siteName, {
      stepInfo: `Searching for site "${siteName}"`,
    });
  });

  await test.step('Navigate to Content tab', async () => {
    const siteDashboardPage = new SiteDashboardPage(page, siteId);
    await siteDashboardPage.loadPage();
    await siteDashboardPage.navigateToTab(SitePageTab.ContentTab);
  });

  await test.step('Navigate to content preview page', async () => {
    const contentPreviewPage = new ContentPreviewPage(page, siteId, contentId, ContentType.PAGE.toLowerCase());
    await contentPreviewPage.loadPage();
  });

  const contentPreviewPage = new ContentPreviewPage(page, siteId, contentId, ContentType.PAGE.toLowerCase());
  const feedPage = new FeedPage(page);
  return { contentPreviewPage, feedPage };
}

test.describe(
  'feed Post Like/Unlike Multi-User Tests',
  {
    tag: [ContentTestSuite.FEED_MENTION_SITE_TOPIC_USER_APP_MANAGER],
  },
  () => {
    let siteOwnerFeedPage: FeedPage;
    let siteOwnerContentPreviewPage: ContentPreviewPage;
    let siteManagerFeedPage: FeedPage;
    let contentManagerFeedPage: FeedPage;
    let createdPostText: string;
    let createdReplyText: string;
    let createdPostId: string;
    let siteId: string;
    let contentId: string;
    const siteName = 'All Employees';

    test.beforeEach(
      'Setup test environment and create feed post',
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        // Configure app governance settings and enable timeline comment post(feed)
        await appManagerFixture.feedManagementHelper.configureAppGovernance({
          feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
        });

        // Initialize feed pages for all user roles (users are already logged in via fixtures)
        siteOwnerFeedPage = new FeedPage(appManagerFixture.page);
        siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        contentManagerFeedPage = new FeedPage(standardUserFixture.page);

        // Get or create "All Employees" site using getSiteIdWithName which handles both cases
        siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName, {
          accessType: SITE_TYPES.PUBLIC,
        });

        // Create a page in the site to use for the feed
        const pageResult = await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'news',
          },
          options: {
            waitForSearchIndex: false,
          },
        });
        contentId = pageResult.contentId;

        // Get user info for all roles
        const siteOwnerInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        const siteManagerInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(
          users.siteManager.email
        );

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

        // Get endUser for Content Manager role
        const endUserInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Make endUser as Content Manager
        // Use updateUserSiteMembershipWithRole which handles CONTENT_MANAGER properly
        try {
          await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: siteId,
            userId: endUserInfo.userId,
            role: SitePermission.CONTENT_MANAGER,
          });
        } catch (error) {
          // Log and continue - user may already have correct role or "All Employees" has API restrictions
          console.log(
            `Note: Could not set CONTENT_MANAGER role (may already be set or site has restrictions): ${error}`
          );
        }

        // Navigate to content page and create feed post as Site Owner (Application Manager)
        siteOwnerContentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await siteOwnerContentPreviewPage.loadPage();

        // Generate test data
        const postText = TestDataGenerator.generateRandomText('Feed Post', 3, true);
        createdPostText = postText;
        createdReplyText = TestDataGenerator.generateRandomText('Feed Reply', 3, true);

        // Click on "Share your thoughts or question" button
        await siteOwnerContentPreviewPage.actions.clickShareThoughtsButton();

        // Create a post and send it to the editor
        const postResult = await siteOwnerFeedPage.actions.createAndPost({ text: postText });
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await siteOwnerFeedPage.assertions.waitForPostToBeVisible(postText);

        // Create a reply to the post
        await siteOwnerFeedPage.actions.addReplyToPost(createdReplyText);
        await siteOwnerFeedPage.assertions.verifyReplyIsVisible(createdReplyText);
      }
    );

    test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
      if (createdPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.warn(`Failed to delete feed post: ${error}`);
        }
        createdPostId = '';
      }
    });

    test(
      'verify Site Owner, Manager, Content Manager is able to like and unlike Feed post and Reply on Content Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Site Owner, Manager, Content Manager is able to like and unlike Feed post and Reply on Content Feed',
          zephyrTestId: 'CONT-24918',
          storyId: 'CONT-24918',
        });

        // Navigate all 3 users to content feed in parallel
        await test.step('Navigate all users to content feed', async () => {
          await Promise.all([
            // Site Owner (Application Manager) - already on content feed page from beforeEach
            (async () => {
              // Refresh the page to ensure we're on the content feed
              await siteOwnerContentPreviewPage.loadPage();
            })(),
            // Site Manager - navigate to content feed
            (async () => {
              const { feedPage } = await navigateToContentFeedAsRole(
                siteManagerFixture.page,
                siteManagerFixture.navigationHelper,
                siteId,
                contentId,
                siteName
              );
              siteManagerFeedPage = feedPage;
            })(),
            // Content Manager - navigate to content feed
            (async () => {
              const { feedPage } = await navigateToContentFeedAsRole(
                standardUserFixture.page,
                standardUserFixture.navigationHelper,
                siteId,
                contentId,
                siteName
              );
              contentManagerFeedPage = feedPage;
            })(),
          ]);
        });

        // Wait for posts and replies to be visible on all pages in parallel
        await test.step('Wait for posts and replies to be visible on all pages', async () => {
          await Promise.all([
            // Site Owner
            (async () => {
              await siteOwnerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
              await siteOwnerFeedPage.assertions.verifyReplyIsVisible(createdReplyText);
            })(),
            // Site Manager
            (async () => {
              await siteManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
              await siteManagerFeedPage.assertions.verifyReplyIsVisible(createdReplyText);
            })(),
            // Content Manager
            (async () => {
              await contentManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
              await contentManagerFeedPage.assertions.verifyReplyIsVisible(createdReplyText);
            })(),
          ]);
        });

        // Perform like/unlike operations in parallel for all user roles
        await Promise.all([
          // Site Owner like/unlike operations
          (async () => {
            await test.step('Site Owner: Perform like/unlike operations on post and reply', async () => {
              await siteOwnerFeedPage.assertions.verifyPostCanBeLiked(createdPostText);
              await siteOwnerFeedPage.actions.likeFeedPost(createdPostText);
              await siteOwnerFeedPage.assertions.verifyPostCanBeLiked(createdPostText);
              await siteOwnerFeedPage.assertions.verifyLikeCountOnPost(createdPostText);
              await siteOwnerFeedPage.actions.unlikeFeedPost(createdPostText);
              await siteOwnerFeedPage.assertions.verifyPostCanBeUnliked(createdPostText);
              await siteOwnerFeedPage.actions.likeFeedReply(createdReplyText);
              await siteOwnerFeedPage.assertions.verifyReplyCanBeLiked(createdReplyText);
              await siteOwnerFeedPage.assertions.verifyLikeCountOnReply(createdReplyText);
              await siteOwnerFeedPage.actions.unlikeFeedReply(createdReplyText);
              await siteOwnerFeedPage.assertions.verifyReplyCanBeUnliked(createdReplyText);
            });
          })(),
          // Site Manager like/unlike operations
          (async () => {
            await test.step('Site Manager: Perform like/unlike operations on post and reply ', async () => {
              await siteManagerFeedPage.assertions.verifyPostCanBeLiked(createdPostText);
              await siteManagerFeedPage.actions.likeFeedPost(createdPostText);
              await siteManagerFeedPage.assertions.verifyPostCanBeLiked(createdPostText);
              await siteManagerFeedPage.assertions.verifyLikeCountOnPost(createdPostText);
              await siteManagerFeedPage.actions.unlikeFeedPost(createdPostText);
              await siteManagerFeedPage.assertions.verifyPostCanBeUnliked(createdPostText);
              await siteManagerFeedPage.actions.likeFeedReply(createdReplyText);
              await siteManagerFeedPage.assertions.verifyReplyCanBeLiked(createdReplyText);
              await siteManagerFeedPage.assertions.verifyLikeCountOnReply(createdReplyText);
              await siteManagerFeedPage.actions.unlikeFeedReply(createdReplyText);
              await siteManagerFeedPage.assertions.verifyReplyCanBeUnliked(createdReplyText);
            });
          })(),
          // Content Manager like/unlike operations
          (async () => {
            await test.step('Content Manager: Perform like/unlike operations on post and reply', async () => {
              await contentManagerFeedPage.assertions.verifyPostCanBeLiked(createdPostText);
              await contentManagerFeedPage.actions.likeFeedPost(createdPostText);
              await contentManagerFeedPage.assertions.verifyPostCanBeLiked(createdPostText);
              await contentManagerFeedPage.assertions.verifyLikeCountOnPost(createdPostText);
              await contentManagerFeedPage.actions.unlikeFeedPost(createdPostText);
              await contentManagerFeedPage.assertions.verifyPostCanBeUnliked(createdPostText);
              await contentManagerFeedPage.actions.likeFeedReply(createdReplyText);
              await contentManagerFeedPage.assertions.verifyReplyCanBeLiked(createdReplyText);
              await contentManagerFeedPage.assertions.verifyLikeCountOnReply(createdReplyText);
              await contentManagerFeedPage.actions.unlikeFeedReply(createdReplyText);
              await contentManagerFeedPage.assertions.verifyReplyCanBeUnliked(createdReplyText);
            });
          })(),
        ]);
      }
    );
  }
);
