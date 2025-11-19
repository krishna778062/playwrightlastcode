import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SitePermission } from '@/src/core/types/siteManagement.types';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ReactionsEmoji } from '@/src/modules/content/constants/reactionsEmoji';
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
  'feed Post Like/Unlike Multi-User Tests - Content Feed',
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
        /*
        await appManagerFixture.feedManagementHelper.configureAppGovernance({
          feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
        });
        */
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
        await siteOwnerContentPreviewPage.verifyThePageIsLoaded();

        // Generate test data
        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        createdPostText = postText;
        createdReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;

        // Click on "Share your thoughts or question" button
        await siteOwnerContentPreviewPage.actions.clickShareThoughtsButton();

        // Create a post and send it to the editor
        const postResult = await siteOwnerFeedPage.actions.createAndPost({ text: postText });
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await siteOwnerFeedPage.assertions.waitForPostToBeVisible(postText);

        // Create a reply to the post
        await siteOwnerFeedPage.actions.addReplyToPost(createdReplyText, createdPostId);
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24918'],
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
              await siteOwnerFeedPage.actions.likeFeedPost(createdPostText);
              await siteOwnerFeedPage.assertions.verifyLikeCountOnPost(createdPostText);
              await siteOwnerFeedPage.actions.unlikeFeedPost(createdPostText);
              await siteOwnerFeedPage.actions.likeFeedReply(createdReplyText);
              await siteOwnerFeedPage.assertions.verifyLikeCountOnReply(createdReplyText);
              await siteOwnerFeedPage.actions.unlikeFeedReply(createdReplyText);
            });
          })(),
          // Site Manager like/unlike operations
          (async () => {
            await test.step('Site Manager: Perform like/unlike operations on post and reply ', async () => {
              await siteManagerFeedPage.actions.likeFeedPost(createdPostText);
              await siteManagerFeedPage.assertions.verifyLikeCountOnPost(createdPostText);
              await siteManagerFeedPage.actions.unlikeFeedPost(createdPostText);
              await siteManagerFeedPage.actions.likeFeedReply(createdReplyText);
              await siteManagerFeedPage.assertions.verifyLikeCountOnReply(createdReplyText);
              await siteManagerFeedPage.actions.unlikeFeedReply(createdReplyText);
            });
          })(),
          // Content Manager like/unlike operations
          (async () => {
            await test.step('Content Manager: Perform like/unlike operations on post and reply', async () => {
              await contentManagerFeedPage.actions.likeFeedPost(createdPostText);
              await contentManagerFeedPage.assertions.verifyLikeCountOnPost(createdPostText);
              await contentManagerFeedPage.actions.unlikeFeedPost(createdPostText);
              await contentManagerFeedPage.actions.likeFeedReply(createdReplyText);
              await contentManagerFeedPage.assertions.verifyLikeCountOnReply(createdReplyText);
              await contentManagerFeedPage.actions.unlikeFeedReply(createdReplyText);
            });
          })(),
        ]);
      }
    );
  }
);

test.describe(
  'feed Post Like/Unlike Multi-User Tests - Site Feed',
  {
    tag: [ContentTestSuite.FEED_MENTION_SITE_TOPIC_USER_APP_MANAGER],
  },
  () => {
    let siteFeedPostText: string;
    let siteFeedReplyText: string;
    let siteFeedSiteId: string;
    const siteFeedSiteName = 'All Employees';

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      /*
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */
      // Get or create "All Employees" site using getSiteIdWithName which handles both cases
      siteFeedSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteFeedSiteName, {
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
          siteId: siteFeedSiteId,
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
          siteId: siteFeedSiteId,
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
          siteId: siteFeedSiteId,
          userId: endUserInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });
      } catch (error) {
        // Log and continue - user may already have correct role or "All Employees" has API restrictions
        console.log(`Note: Could not set CONTENT_MANAGER role (may already be set or site has restrictions): ${error}`);
      }
    });

    test(
      'verify Site Owner, Manager, Content Manager is able to like and unlike Feed post and Reply on Site Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24906'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Site Owner, Manager, Content Manager is able to like and unlike Feed post and Reply on Site Feed',
          zephyrTestId: 'CONT-24906',
          storyId: 'CONT-24906',
        });

        // Generate feed test data using the test data generator
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteFeedSiteId,
          withAttachment: false as const,
          waitForSearchIndex: false,
        });
        siteFeedPostText = feedTestData.text;
        siteFeedReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;

        // Create feed based on test data via API
        const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
        console.log(`Created feed via API: ${feedResponse.result.feedId}`);

        // Navigate all users to Site Feed via Site Dashboard → Feed Link in parallel
        const [ownerFeedPage, managerFeedPage, contentFeedPage] = await Promise.all([
          // Site Owner navigation
          (async () => {
            const siteOwnerDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteFeedSiteId);
            await siteOwnerDashboardPage.loadPage();
            await siteOwnerDashboardPage.actions.clickOnFeedLink();
            const feedPage = new FeedPage(appManagerFixture.page);
            await feedPage.verifyThePageIsLoaded();
            return feedPage;
          })(),
          // Site Manager navigation
          (async () => {
            const siteManagerDashboardPage = new SiteDashboardPage(siteManagerFixture.page, siteFeedSiteId);
            await siteManagerDashboardPage.loadPage();
            await siteManagerDashboardPage.actions.clickOnFeedLink();
            const feedPage = new FeedPage(siteManagerFixture.page);
            await feedPage.verifyThePageIsLoaded();
            return feedPage;
          })(),
          // Content Manager navigation
          (async () => {
            const contentManagerDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteFeedSiteId);
            await contentManagerDashboardPage.loadPage();
            await contentManagerDashboardPage.actions.clickOnFeedLink();
            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.verifyThePageIsLoaded();
            return feedPage;
          })(),
        ]);

        // Create a reply to the post via UI (as Site Owner)
        await ownerFeedPage.actions.addReplyToPost(siteFeedReplyText, feedResponse.result.feedId);
        await ownerFeedPage.assertions.verifyReplyIsVisible(siteFeedReplyText);

        // Wait for posts to be visible on all pages in parallel
        await Promise.all([
          ownerFeedPage.assertions.waitForPostToBeVisible(siteFeedPostText),
          managerFeedPage.assertions.waitForPostToBeVisible(siteFeedPostText),
          contentFeedPage.assertions.waitForPostToBeVisible(siteFeedPostText),
        ]);

        // Refresh pages for Site Manager and Content Manager to see the reply
        await Promise.all([managerFeedPage.page.reload(), contentFeedPage.page.reload()]);

        // Wait for pages to load after refresh
        await Promise.all([managerFeedPage.verifyThePageIsLoaded(), contentFeedPage.verifyThePageIsLoaded()]);

        // Wait for reply to be visible on all pages (with longer timeout for sync)
        await Promise.all([
          ownerFeedPage.assertions.verifyReplyIsVisible(siteFeedReplyText),
          managerFeedPage.assertions.verifyReplyIsVisible(siteFeedReplyText),
          contentFeedPage.assertions.verifyReplyIsVisible(siteFeedReplyText),
        ]);

        // Perform like/unlike operations in parallel for all user roles
        await Promise.all([
          // Site Owner like/unlike operations
          (async () => {
            await test.step('Site Owner: Perform like/unlike operations on post and reply', async () => {
              await ownerFeedPage.actions.likeFeedPost(siteFeedPostText);
              await ownerFeedPage.assertions.verifyLikeCountOnPost(siteFeedPostText);
              await ownerFeedPage.actions.unlikeFeedPost(siteFeedPostText);
              await ownerFeedPage.actions.likeFeedReply(siteFeedReplyText);
              await ownerFeedPage.assertions.verifyLikeCountOnReply(siteFeedReplyText);
              await ownerFeedPage.actions.unlikeFeedReply(siteFeedReplyText);
            });
          })(),
          // Site Manager like/unlike operations
          (async () => {
            await test.step('Site Manager: Perform like/unlike operations on post and reply', async () => {
              await managerFeedPage.actions.likeFeedPost(siteFeedPostText);
              await managerFeedPage.assertions.verifyLikeCountOnPost(siteFeedPostText);
              await managerFeedPage.actions.unlikeFeedPost(siteFeedPostText);
              await managerFeedPage.actions.likeFeedReply(siteFeedReplyText);
              await managerFeedPage.assertions.verifyLikeCountOnReply(siteFeedReplyText);
              await managerFeedPage.actions.unlikeFeedReply(siteFeedReplyText);
            });
          })(),
          // Content Manager like/unlike operations
          (async () => {
            await test.step('Content Manager: Perform like/unlike operations on post and reply', async () => {
              await contentFeedPage.actions.likeFeedPost(siteFeedPostText);
              await contentFeedPage.assertions.verifyLikeCountOnPost(siteFeedPostText);
              await contentFeedPage.actions.unlikeFeedPost(siteFeedPostText);
              await contentFeedPage.actions.likeFeedReply(siteFeedReplyText);
              await contentFeedPage.assertions.verifyLikeCountOnReply(siteFeedReplyText);
              await contentFeedPage.actions.unlikeFeedReply(siteFeedReplyText);
            });
          })(),
        ]);
      }
    );
  }
);

test.describe(
  'feed Post Reaction Emoji Replacement Test',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';

    test.beforeEach('Setup test environment and create feed post', async ({ standardUserFixture }) => {
      await standardUserFixture.homePage.verifyThePageIsLoaded();
      await standardUserFixture.navigationHelper.clickOnGlobalFeed();

      feedPage = new FeedPage(standardUserFixture.page);
      await feedPage.verifyThePageIsLoaded();

      // Create a feed post
      await feedPage.actions.clickShareThoughtsButton();
      const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
      createdPostText = postText;

      const postResult = await feedPage.actions.createAndPost({ text: postText });
      createdPostId = postResult.postId || '';

      await feedPage.assertions.waitForPostToBeVisible(postText);
    });

    test.afterEach('Cleanup created posts', async ({ standardUserFixture }) => {
      if (createdPostId) {
        try {
          await standardUserFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.warn(`Failed to delete feed post: ${error}`);
        }
        createdPostId = '';
      }
    });

    test(
      'verify that adding a reaction replaces the "Add Reaction" icon with the selected emoji',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-31817', '@CONT-31818'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify that adding a reaction replaces the "Add Reaction" icon with the selected emoji',
          zephyrTestId: ['CONT-31817', 'CONT-31818'],
          storyId: 'CONT-31817',
        });

        // Given: The "Add Reaction" icon is visible on a feed post
        // When: User hovers on "React to this post" button and selects "like" emoji
        await feedPage.actions.hoverOnReactionButton(createdPostText);
        await feedPage.actions.clickReactionEmoji(createdPostText, ReactionsEmoji.LIKE);

        // Verify the selected emoji (like) replaces the "Add Reaction" icon and Remove the reaction to test another emoji
        await feedPage.actions.unlikeFeedPost(createdPostText);

        // When: User hovers on "React to this post" button and selects "love" emoji
        await feedPage.actions.hoverOnReactionButton(createdPostText);
        await feedPage.actions.clickReactionEmoji(createdPostText, ReactionsEmoji.LOVE);

        // Then: Verify the selected emoji (love) replaces the "Add Reaction" icon
        await feedPage.actions.verifyReactionButtonTextContent(createdPostText, ReactionsEmoji.LOVE);

        // When: User hovers on "React to this post" button and selects "Haha" emoji
        await feedPage.actions.hoverOnReactionButton(createdPostText);
        await feedPage.actions.clickReactionEmoji(createdPostText, ReactionsEmoji.INSIGHTFUL);

        // Then: Verify the selected emoji (Haha) replaces the "Add Reaction" icon
        await feedPage.actions.verifyReactionButtonTextContent(createdPostText, ReactionsEmoji.INSIGHTFUL);
      }
    );

    test(
      'verify that clicking on reaction count opens modal with users grouped by emoji',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-31819'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify that clicking on reaction count opens modal with users grouped by emoji',
          zephyrTestId: 'CONT-31819',
          storyId: 'CONT-31819',
        });

        // Get user info for all roles to get their full names
        const [appManagerInfo, siteManagerInfo, standardUserInfo] = await Promise.all([
          appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email),
          appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
          appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
        ]);

        // Load home pages first, then verify and navigate all users to global feed
        await Promise.all([
          appManagerFixture.homePage.loadPage(),
          siteManagerFixture.homePage.loadPage(),
          standardUserFixture.homePage.loadPage(),
        ]);

        await Promise.all([
          appManagerFixture.homePage.verifyThePageIsLoaded(),
          siteManagerFixture.homePage.verifyThePageIsLoaded(),
          standardUserFixture.homePage.verifyThePageIsLoaded(),
        ]);

        await Promise.all([
          appManagerFixture.navigationHelper.clickOnGlobalFeed(),
          siteManagerFixture.navigationHelper.clickOnGlobalFeed(),
          standardUserFixture.navigationHelper.clickOnGlobalFeed(),
        ]);

        // Create feed pages for all users after navigation
        const appManagerFeedPage = new FeedPage(appManagerFixture.page);
        const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        const standardUserFeedPage = new FeedPage(standardUserFixture.page);

        await Promise.all([
          appManagerFeedPage.verifyThePageIsLoaded(),
          siteManagerFeedPage.verifyThePageIsLoaded(),
          standardUserFeedPage.verifyThePageIsLoaded(),
        ]);

        await Promise.all([
          appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
          siteManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
          standardUserFeedPage.assertions.waitForPostToBeVisible(createdPostText),
        ]);

        // Given: A post has reactions from multiple users
        // App Manager reacts with "like"
        await appManagerFeedPage.actions.hoverOnReactionButton(createdPostText);
        await appManagerFeedPage.actions.clickReactionEmoji(createdPostText, ReactionsEmoji.LIKE);

        await standardUserFeedPage.page.reload();
        await standardUserFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Standard User reacts with "haha"
        await standardUserFeedPage.actions.hoverOnReactionButton(createdPostText);
        await standardUserFeedPage.actions.clickReactionEmoji(createdPostText, ReactionsEmoji.HAHA);

        await siteManagerFeedPage.page.reload();
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Site Manager reacts with "insightful"
        await siteManagerFeedPage.actions.hoverOnReactionButton(createdPostText);
        await siteManagerFeedPage.actions.clickReactionEmoji(createdPostText, ReactionsEmoji.INSIGHTFUL);

        // Refresh pages to ensure all reactions are visible
        await Promise.all([
          appManagerFeedPage.page.reload(),
          siteManagerFeedPage.page.reload(),
          standardUserFeedPage.page.reload(),
        ]);

        await Promise.all([
          appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
          siteManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
          standardUserFeedPage.assertions.waitForPostToBeVisible(createdPostText),
        ]);

        // When: The user clicks on the reaction count or reactions text
        await feedPage.actions.clickReactionCountButton(createdPostText);

        // Then: A modal should open
        await feedPage.actions.verifyReactionModalIsVisible();

        // And: The modal should display users grouped by each reaction emoji
        // Verify tabs exist for each emoji type
        // Click on "like" tab and verify user is displayed
        await feedPage.actions.verifyReactionModalTabExists(ReactionsEmoji.LIKE);
        await feedPage.actions.verifyUsersInReactionModalTab(ReactionsEmoji.LIKE, [appManagerInfo.fullName]);

        await feedPage.actions.verifyReactionModalTabExists(ReactionsEmoji.HAHA);
        await feedPage.actions.verifyUsersInReactionModalTab(ReactionsEmoji.HAHA, [standardUserInfo.fullName]);

        await feedPage.actions.verifyReactionModalTabExists(ReactionsEmoji.INSIGHTFUL);
        await feedPage.actions.verifyUsersInReactionModalTab(ReactionsEmoji.INSIGHTFUL, [siteManagerInfo.fullName]);

        // Close the modal
        await feedPage.actions.closeReactionModal();
      }
    );
  }
);
