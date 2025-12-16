import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { log } from '@/src/core/utils/logger';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@/src/modules/content/test-data/social-campaign.test-data';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

test.describe(
  'content Feed Comment Share to Site Feed Tests',
  {
    tag: [ContentTestSuite.FEED_MENTION_SITE_TOPIC_USER_APP_MANAGER],
  },
  () => {
    let siteManagerFeedPage: FeedPage;
    let siteContentManagerFeedPage: FeedPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteDashboardPage: SiteDashboardPage;
    let createdPostId: string;
    let sharedPostId: string;
    let commentText: string;
    let shareMessage: string;
    let privateSiteName: string;
    let privateSiteId: string;
    let unlistedSiteName: string;
    let unlistedSiteId: string;
    let contentId: string;
    let contentSiteId: string;
    let endUserFullName: string;
    let siteManagerFullName: string;
    let randomTopic: any;
    let identityManagementHelper: IdentityManagementHelper;

    test.beforeEach(
      'Setup test environment and data creation',
      async ({ siteManagerFixture, appManagerApiContext, appManagerApiFixture, standardUserFixture }) => {
        //Enable feed mode - Skip in production environments as governance changes are restricted
        const currentEnv = process.env.TEST_ENV;
        if (currentEnv !== 'prodUS' && currentEnv !== 'prodEU') {
          await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
            feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
          });
        } else {
          log.info(`Skipping governance configuration for production environment: ${currentEnv}`);
        }

        // Initialize identity management helper with app manager context (needed for user info access)
        identityManagementHelper = new IdentityManagementHelper(
          appManagerApiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );

        // Get user info for mentions
        const [endUserInfo, siteManagerInfo] = await Promise.all([
          identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
        ]);
        endUserFullName = endUserInfo.fullName;
        siteManagerFullName = siteManagerInfo.fullName;

        // Get topic list (requires app manager permissions)
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        console.log(`Found ${topicList.result.listOfItems.length} topics`);
        randomTopic = topicList.result.listOfItems[Math.floor(Math.random() * topicList.result.listOfItems.length)];

        // Get or create Private and Unlisted sites
        const [privateSite, unlistedSite] = await Promise.all([
          siteManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE),
          siteManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED),
        ]);
        privateSiteName = privateSite.name;
        privateSiteId = privateSite.siteId;
        unlistedSiteName = unlistedSite.name;
        unlistedSiteId = unlistedSite.siteId;

        // Add standard user as member to both sites so they can access them in Part 2
        await Promise.all([
          appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            privateSiteId,
            endUserInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.ADD
          ),
          appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            unlistedSiteId,
            endUserInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.ADD
          ),
        ]);

        // Get content for testing
        const contentResponse = await siteManagerFixture.contentManagementHelper.getContentId();
        contentId = contentResponse.contentId;
        contentSiteId = contentResponse.siteId;

        // Initialize feed page
        siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        siteContentManagerFeedPage = new FeedPage(standardUserFixture.page);

        // Generate test data
        commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
      }
    );

    test.afterEach('Cleanup created posts', async ({ siteManagerFixture }) => {
      // Only cleanup if test completed (sharedPostId2 will be set if Part 2 completed)
      if (createdPostId) {
        try {
          await siteManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.warn(`Failed to cleanup comment post ${createdPostId}:`, error);
        }
        createdPostId = '';
      }
      if (sharedPostId) {
        try {
          await siteManagerFixture.feedManagementHelper.deleteFeed(sharedPostId);
          console.log(`Cleaned up first shared post: ${sharedPostId}`);
        } catch (error) {
          console.warn(`Failed to cleanup first shared post ${sharedPostId}:`, error);
        }
        sharedPostId = '';
      }
    });

    test(
      'verify that a user can share a Content Feed post comment with a message to both a Private Site and an Unlisted Site using the "Post in SITE FEED" option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26712'],
      },
      async ({ siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that a user can share a Content Feed post comment with a message to both a Private Site and an Unlisted Site using the "Post in SITE FEED" option',
          zephyrTestId: 'CONT-26712',
          storyId: 'CONT-26712',
        });

        const embedUrl = SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE;

        const newTopicName = FEED_TEST_DATA.POST_TEXT.TOPIC;

        // ==================== PART 1: Site Manager Flow ====================

        // Navigate directly to content preview page
        contentPreviewPage = new ContentPreviewPage(
          siteManagerFixture.page,
          contentSiteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Add a Comment for the Content
        // Click "Post on this content" button to open comment editor
        await contentPreviewPage.actions.clickShareThoughtsButton();
        // Use FeedPage methods to create the comment (contentPreviewPage has feed components)
        await siteManagerFeedPage.actions.createPost(commentText);
        await siteManagerFeedPage.actions.clickPostButton();

        // Wait for comment to be visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        await siteManagerFeedPage.actions.clickShareOnComment();

        // Fill share dialog with message, mentions, topics, and embedded URL
        await siteManagerFeedPage.actions.fillShareDialogWithMentionsAndTopics({
          shareMessage,
          userNames: [endUserFullName],
          siteNames: [privateSiteName],
          topicNames: [randomTopic.name, newTopicName],
          embedUrl,
        });

        // Verify the Original Post is displayed with "View Post" link
        await siteManagerFeedPage.assertions.verifyViewPostLinkInShareDialog();

        // Select "Post in" as "Site Feed"
        await siteManagerFeedPage.actions.selectShareOptionAsSiteFeed();

        // Choose a private site
        await siteManagerFeedPage.actions.enterSiteNameInShareDialog(privateSiteName);

        // Click on "Share"
        await siteManagerFeedPage.actions.clickShareButtonInShareDialog();

        // Verify success message
        await siteManagerFeedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

        // ==================== PART 2: Site Content Manager Flow ====================

        // Navigate both users to the private site feed in parallel
        await Promise.all([
          // Site Manager: Navigate to verify the shared post
          (async () => {
            siteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, privateSiteId);
            await siteDashboardPage.loadPage();
            await siteDashboardPage.actions.clickOnFeedLink();
          })(),
          // Standard User: Navigate to prepare for sharing the post
          (async () => {
            const privateSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, privateSiteId);
            await privateSiteDashboardPage.loadPage();
            await privateSiteDashboardPage.actions.clickOnFeedLink();
          })(),
        ]);

        // Wait for post to be visible on both pages in parallel
        await Promise.all([
          siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage),
          siteContentManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage),
        ]);

        await siteManagerFeedPage.assertions.validatePostText(shareMessage);

        // Click "View Post" → verify navigation to Feed Detail Page
        await siteManagerFeedPage.actions.clickViewPostLink();
        await siteManagerFeedPage.assertions.verifyFeedDetailPageLoaded();

        // Store shared post ID for cleanup (extract from URL)
        const currentUrl = siteManagerFixture.page.url();
        const feedIdMatch = currentUrl.match(/\/feed\/([a-f0-9-]+)/);
        if (feedIdMatch) {
          sharedPostId = feedIdMatch[1];
          console.log(`Extracted shared post ID: ${sharedPostId}`);
        }

        // Click "Share" on the feed post shared by "Site Manager"
        await siteContentManagerFeedPage.actions.clickShareOnPost(shareMessage);

        // Fill share dialog with message, mentions, topics, and embedded URL
        const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        const newTopicName2 = FEED_TEST_DATA.POST_TEXT.TOPIC;
        await siteContentManagerFeedPage.actions.fillShareDialogWithMentionsAndTopics({
          shareMessage: shareMessage2,
          userNames: [siteManagerFullName],
          siteNames: [unlistedSiteName],
          topicNames: [randomTopic.name, newTopicName2],
          embedUrl,
        });

        // Verify original post with "View Post" link
        await siteContentManagerFeedPage.assertions.verifyViewPostLinkInShareDialog();

        // Select "Post in" = "Site Feed"
        await siteContentManagerFeedPage.actions.selectShareOptionAsSiteFeed();

        // Choose an "Unlisted" site
        await siteContentManagerFeedPage.actions.enterSiteNameInShareDialog(unlistedSiteName);

        // Click "Share"
        await siteContentManagerFeedPage.actions.clickShareButtonInShareDialog();

        // Verify success message
        await siteContentManagerFeedPage.assertions.verifyToastMessage(
          FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
        );

        // Navigate directly to the unlisted site feed
        const unlistedSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, unlistedSiteId);
        await unlistedSiteDashboardPage.loadPage();
        await unlistedSiteDashboardPage.actions.clickOnFeedLink();

        await siteContentManagerFeedPage.assertions.validatePostText(shareMessage2);

        // Click "View Post" and validate navigation
        await siteContentManagerFeedPage.actions.clickViewPostLink();
        await siteContentManagerFeedPage.assertions.verifyFeedDetailPageLoaded();

        // Verify share count, likes, and replies belong only to the shared post in parallel
        await Promise.all([
          siteContentManagerFeedPage.assertions.verifyShareCount(shareMessage2, 1),
          siteContentManagerFeedPage.assertions.verifyLikesCount(shareMessage2, 1),
          siteContentManagerFeedPage.assertions.verifyRepliesCount(shareMessage2, 1),
        ]);
      }
    );

    test(
      'verify Admin can share a Content Feed post comment with a message to Home Feed and End User can re-share to Site Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26710'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Admin can share a Content Feed post comment with a message to Home Feed and End User can re-share to Site Feed',
          zephyrTestId: 'CONT-26710',
          storyId: 'CONT-26710',
        });

        const embedUrl = SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE;
        const newTopicName = FEED_TEST_DATA.POST_TEXT.TOPIC;
        let adminSharedPostId: string = '';
        let endUserSharedPostId: string = '';
        let contentTitle: string = '';
        let siteName: string = '';
        let adminFullName: string = '';
        let endUserFullName: string = '';

        try {
          const [adminInfo, endUserInfo] = await Promise.all([
            identityManagementHelper.getUserInfoByEmail(users.appManager.email),
            identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          ]);
          adminFullName = adminInfo.fullName;
          endUserFullName = endUserInfo.fullName;

          // Get content for testing
          const contentResponse = await appManagerFixture.contentManagementHelper.getContentId({ status: 'published' });
          const siteId = contentResponse.siteId;

          const siteDetails = await appManagerFixture.siteManagementHelper.siteManagementService.getSiteDetails(siteId);
          siteName = siteDetails.result.name;

          const contentListResponse =
            await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
              siteId: contentSiteId,
              status: 'published',
            });
          const contentItem = contentListResponse.result.listOfItems.find(
            (item: any) => item.contentId === contentResponse.contentId || item.id === contentResponse.contentId
          );
          contentTitle = contentItem?.title || '';

          // ==================== PART 1: Admin Shares Content Comment to Home Feed ====================
          await test.step('Part 1: Admin shares content feed post comment to Home Feed', async () => {
            // Navigate to content preview page
            const adminContentPreviewPage = new ContentPreviewPage(
              appManagerFixture.page,
              contentResponse.siteId,
              contentResponse.contentId,
              ContentType.PAGE.toLowerCase()
            );

            await adminContentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
            await adminContentPreviewPage.verifyThePageIsLoaded();

            // Add a comment to the content
            await adminContentPreviewPage.actions.clickShareThoughtsButton();
            const adminFeedPage = new FeedPage(appManagerFixture.page);
            await adminFeedPage.actions.createPost(commentText);
            await adminFeedPage.actions.clickPostButton();

            // Wait for comment to be visible
            await adminContentPreviewPage.assertions.waitForPostToBeVisible(commentText);

            // Click Share on the added comment
            await adminFeedPage.actions.clickShareOnComment();

            // Fill share dialog with message, mentions, topics, and embedded URL
            await adminFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage,
              userNames: [endUserFullName],
              siteNames: [siteName],
              topicNames: [randomTopic.name, newTopicName],
              embedUrl,
            });

            // Verify Original Post is displayed with View Post link
            await adminFeedPage.assertions.verifyViewPostLinkInShareDialog();

            // Click Share and get shared post ID
            const shareComponent = new ShareComponent(appManagerFixture.page);
            adminSharedPostId = await shareComponent.actions.clickShareButtonAndGetPostId();

            // Verify success message
            await adminFeedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

            // Navigate to Home Dashboard
            await appManagerFixture.homePage.loadPage();
            await appManagerFixture.homePage.verifyThePageIsLoaded();
            await appManagerFixture.navigationHelper.clickOnGlobalFeed();
            await adminFeedPage.verifyThePageIsLoaded();

            // Verify feed appears on Home Dashboard
            await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);

            // Verify feed title: "Admin shared Admin's Post"
            const expectedFeedTitle = `${adminFullName} shared ${adminFullName}'s Post`;
            await adminFeedPage.assertions.verifyFeedTitle(shareMessage, expectedFeedTitle);

            // Verify share message is displayed
            await adminFeedPage.assertions.validatePostText(shareMessage);

            // Verify original post title format: "<Admin> in <Site Name> on <Content Title>"
            const expectedOriginalPostTitle = `${adminFullName} in ${siteName} on ${contentTitle}`;
            await adminFeedPage.assertions.verifyOriginalPostTitle(shareMessage, expectedOriginalPostTitle);

            // Verify View Post link is visible
            await adminFeedPage.actions.clickViewPostLink();

            // Verify navigation to Feed Detail Page
            await adminFeedPage.assertions.verifyFeedDetailPageLoaded();

            // Verify content details are visible
            await adminFeedPage.assertions.waitForPostToBeVisible(commentText);

            await adminFeedPage.assertions.verifyVideoLinkUnfurled(embedUrl);
          });

          // ==================== PART 2: End User Re-Shares to Site Feed ====================
          await test.step('Part 2: End User re-shares to Site Feed', async () => {
            // Logout Admin and Login as End User (using standardUserFixture which is already logged in)
            await standardUserFixture.homePage.loadPage();
            await standardUserFixture.homePage.verifyThePageIsLoaded();
            await standardUserFixture.navigationHelper.clickOnGlobalFeed();

            const endUserFeedPage = new FeedPage(standardUserFixture.page);
            await endUserFeedPage.verifyThePageIsLoaded();

            // Wait for Admin's shared post to be visible
            await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage);

            // Click Share on Admin's shared feed
            await endUserFeedPage.actions.clickShareIconOnPost(shareMessage);

            // Fill share dialog with message, mentions, topics, and embedded URL
            const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
            const newTopicName2 = FEED_TEST_DATA.POST_TEXT.TOPIC;
            await endUserFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage: shareMessage2,
              userNames: [adminFullName],
              siteNames: [siteName],
              topicNames: [randomTopic.name, newTopicName2],
              embedUrl,
            });

            // Verify original post with View Post link
            await endUserFeedPage.assertions.verifyViewPostLinkInShareDialog();

            // Select Post in → Site Feed
            await endUserFeedPage.actions.selectShareOptionAsSiteFeed();

            // Choose a Public Site
            await endUserFeedPage.actions.enterSiteNameInShareDialog(siteName);

            // Click Share and get shared post ID
            const endUserShareComponent = new ShareComponent(standardUserFixture.page);
            endUserSharedPostId = await endUserShareComponent.actions.clickShareButtonAndGetPostId();

            // Verify success message
            await endUserFeedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

            // Navigate to Site Dashboard
            const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
            await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
            await siteDashboardPage.actions.clickOnFeedLink();

            // Verify shared post visible on Site Dashboard
            await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage2);

            // Verify feed title: "End User shared Admin's Post"
            const expectedEndUserFeedTitle = `${endUserFullName} shared ${adminFullName}'s Post`;
            await endUserFeedPage.assertions.verifyFeedTitle(shareMessage2, expectedEndUserFeedTitle);

            // Verify share message is displayed
            await endUserFeedPage.assertions.validatePostText(shareMessage2);

            // Verify original post title: "Admin shared Admin's Post"
            const expectedOriginalPostTitle2 = `${adminFullName} shared ${adminFullName}'s Post`;
            await endUserFeedPage.assertions.verifyOriginalPostTitle(shareMessage2, expectedOriginalPostTitle2);

            // Verify View Post is displayed and navigation works
            await endUserFeedPage.actions.clickViewPostLink();
            await endUserFeedPage.assertions.verifyFeedDetailPageLoaded();

            // Verify share count, likes, replies belong to shared post only
            await Promise.all([
              endUserFeedPage.assertions.verifyShareCount(shareMessage2, 0), // No shares on the shared post itself
              endUserFeedPage.assertions.verifyLikesCount(shareMessage2, 0), // No likes initially
              endUserFeedPage.assertions.verifyRepliesCount(shareMessage2, 0), // No replies initially
            ]);

            // Click View Post again to verify navigation
            await endUserFeedPage.actions.clickViewPostLink();
            await endUserFeedPage.assertions.verifyFeedDetailPageLoaded();
            await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage2);
          });
        } finally {
          // Cleanup: Delete all shared posts
          if (endUserSharedPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(endUserSharedPostId);
              console.log(`Cleaned up end user shared post: ${endUserSharedPostId}`);
            } catch (error) {
              console.warn(`Failed to cleanup end user shared post ${endUserSharedPostId}:`, error);
            }
          }
          if (adminSharedPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(adminSharedPostId);
              console.log(`Cleaned up admin shared post: ${adminSharedPostId}`);
            } catch (error) {
              console.warn(`Failed to cleanup admin shared post ${adminSharedPostId}:`, error);
            }
          }
          if (createdPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(createdPostId);
              console.log(`Cleaned up comment post: ${createdPostId}`);
            } catch (error) {
              console.warn(`Failed to cleanup comment post ${createdPostId}:`, error);
            }
          }
        }
      }
    );

    test(
      'verify Site Owner can share a Content Feed post comment to Public Site Feed and Site Manager can re-share to Site Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26711'],
      },
      async ({ appManagerFixture, appManagerApiFixture, siteManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Site Owner can share a Content Feed post comment to Public Site Feed and Site Manager can re-share to Site Feed',
          zephyrTestId: 'CONT-26711',
          storyId: 'CONT-26711',
        });

        const embedUrl = SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE;
        const newTopicName = FEED_TEST_DATA.POST_TEXT.TOPIC;
        let siteOwnerSharedPostId: string = '';
        let siteManagerSharedPostId: string = '';
        let contentTitle: string = '';
        let publicSiteName: string = '';
        let publicSiteId: string = '';
        let secondPublicSiteName: string = '';
        let secondPublicSiteId: string = '';
        let siteOwnerFullName: string = '';
        let siteManagerFullName: string = '';
        let contentId: string = '';
        let contentSiteId: string = '';

        try {
          // Get user info for mentions and role assignment
          const [siteOwnerInfo, siteManagerInfo] = await Promise.all([
            identityManagementHelper.getUserInfoByEmail(users.appManager.email),
            identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
          ]);
          siteOwnerFullName = siteOwnerInfo.fullName;
          siteManagerFullName = siteManagerInfo.fullName;

          // Get content for testing
          const contentResponse = await appManagerFixture.contentManagementHelper.getContentId({ status: 'published' });
          contentId = contentResponse.contentId;
          contentSiteId = contentResponse.siteId;

          const siteDetails =
            await appManagerFixture.siteManagementHelper.siteManagementService.getSiteDetails(contentSiteId);
          const contentSiteName = siteDetails.result.name;

          // Get or create Public Sites
          const publicSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          publicSiteName = publicSite.name;
          publicSiteId = publicSite.siteId;

          // Get a second public site (try to get a different one)
          let secondPublicSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          // If same site, try getting site list and finding a different one
          if (secondPublicSite.siteId === publicSiteId) {
            const siteListResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
            const differentSite = siteListResponse.result.listOfItems.find(
              (site: any) => site.siteId !== publicSiteId && (site.isPublic || site.access?.toLowerCase() === 'public')
            );
            if (differentSite) {
              secondPublicSite = { siteId: differentSite.siteId, name: differentSite.name };
            }
          }
          secondPublicSiteName = secondPublicSite.name;
          secondPublicSiteId = secondPublicSite.siteId;

          // Assign Site Owner role to appManager user
          try {
            await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
              siteId: publicSiteId,
              userId: siteOwnerInfo.userId,
              role: SitePermission.OWNER,
            });
          } catch (error) {
            console.log(`Note: Could not set OWNER role (may already be set): ${error}`);
          }

          // ==================== PART 1: Site Owner Shares Content Comment to Public Site Feed ====================
          await test.step('Part 1: Site Owner shares content feed post comment to Public Site Feed', async () => {
            // Get content title for Global Search from content list
            const contentListResponse =
              await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
                siteId: contentSiteId,
                status: 'published',
              });
            const contentItem = contentListResponse.result.listOfItems.find(
              (item: any) => item.contentId === contentId || item.id === contentId
            );
            contentTitle = contentItem?.title || 'Content';

            // Wait for content preview page to load
            const siteOwnerContentPreviewPage = new ContentPreviewPage(
              appManagerFixture.page,
              contentSiteId,
              contentId,
              ContentType.PAGE.toLowerCase()
            );
            await siteOwnerContentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
            await siteOwnerContentPreviewPage.verifyThePageIsLoaded();

            // Add a comment to the content
            await siteOwnerContentPreviewPage.actions.clickShareThoughtsButton();
            const siteOwnerFeedPage = new FeedPage(appManagerFixture.page);
            await siteOwnerFeedPage.actions.createPost(commentText);
            await siteOwnerFeedPage.actions.clickPostButton();

            // Wait for comment to be visible
            await siteOwnerContentPreviewPage.assertions.waitForPostToBeVisible(commentText);

            // Extract comment post ID from the page (if needed for cleanup)
            // Note: We'll extract it from the shared post later

            // Click Share on the added comment
            await siteOwnerFeedPage.actions.clickShareOnComment();

            // Fill share dialog with message, mentions, topics, and embedded URL
            await siteOwnerFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage,
              userNames: [siteManagerFullName],
              siteNames: [publicSiteName],
              topicNames: [randomTopic.name, newTopicName],
              embedUrl,
            });

            // Verify Original Post is displayed with View Post link
            await siteOwnerFeedPage.assertions.verifyViewPostLinkInShareDialog();

            // Select Post in → Site Feed
            await siteOwnerFeedPage.actions.selectShareOptionAsSiteFeed();

            // Choose a Public Site
            await siteOwnerFeedPage.actions.enterSiteNameInShareDialog(publicSiteName);

            // Click Share and get shared post ID
            const siteOwnerShareComponent = new ShareComponent(appManagerFixture.page);
            siteOwnerSharedPostId = await siteOwnerShareComponent.actions.clickShareButtonAndGetPostId();

            // Verify success message
            await siteOwnerFeedPage.assertions.verifyToastMessage(
              FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
            );

            // Navigate to Public Site Dashboard
            const publicSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
            await publicSiteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page' });
            await publicSiteDashboardPage.actions.clickOnFeedLink();

            // Verify feed appears on Site Dashboard
            await siteOwnerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

            // Verify feed title: "Site Owner shared Site Owner's Post"
            const expectedFeedTitle = `${siteOwnerFullName} shared ${siteOwnerFullName}'s Post`;
            await siteOwnerFeedPage.assertions.verifyFeedTitle(shareMessage, expectedFeedTitle);

            // Verify share message is displayed
            await siteOwnerFeedPage.assertions.validatePostText(shareMessage);

            // Verify original post title format: "<Site Owner> in <Site Name> on <Content Title>"
            const expectedOriginalPostTitle = `${siteOwnerFullName} in ${contentSiteName} on ${contentTitle}`;
            await siteOwnerFeedPage.assertions.verifyOriginalPostTitle(shareMessage, expectedOriginalPostTitle);

            // Verify View Post link is visible
            await siteOwnerFeedPage.actions.clickViewPostLink();

            // Verify navigation to Feed Detail Page
            await siteOwnerFeedPage.assertions.verifyFeedDetailPageLoaded();

            // Verify content details are visible
            await siteOwnerFeedPage.assertions.waitForPostToBeVisible(commentText);

            // Verify embedded video URL is unfurled
            await siteOwnerFeedPage.assertions.verifyVideoLinkUnfurled(embedUrl);
          });

          // ==================== PART 2: Site Manager Re-Shares to Site Feed ====================
          await test.step('Part 2: Site Manager re-shares to Site Feed', async () => {
            // Navigate to the Public Site Feed where Site Owner shared the post
            const publicSiteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, publicSiteId);
            await publicSiteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page as Site Manager' });
            await publicSiteDashboardPage.actions.clickOnFeedLink();

            const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
            await siteManagerFeedPage.verifyThePageIsLoaded();

            // Wait for Site Owner's shared post to be visible
            await siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

            // Click Share on Site Owner's shared feed
            await siteManagerFeedPage.actions.clickShareIconOnPost(shareMessage);

            // Fill share dialog with message, mentions, topics, and embedded URL
            const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
            const newTopicName2 = FEED_TEST_DATA.POST_TEXT.TOPIC;
            await siteManagerFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage: shareMessage2,
              userNames: [siteOwnerFullName],
              siteNames: [secondPublicSiteName],
              topicNames: [randomTopic.name, newTopicName2],
              embedUrl,
            });

            // Verify original post with View Post link
            await siteManagerFeedPage.assertions.verifyViewPostLinkInShareDialog();

            // Select Post in → Site Feed
            await siteManagerFeedPage.actions.selectShareOptionAsSiteFeed();

            // Choose another Public Site (or same site)
            await siteManagerFeedPage.actions.enterSiteNameInShareDialog(secondPublicSiteName);

            // Click Share and get shared post ID
            const siteManagerShareComponent = new ShareComponent(siteManagerFixture.page);
            siteManagerSharedPostId = await siteManagerShareComponent.actions.clickShareButtonAndGetPostId();

            // Verify success message
            await siteManagerFeedPage.assertions.verifyToastMessage(
              FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
            );

            // Navigate to Site Dashboard
            const secondPublicSiteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, secondPublicSiteId);
            await secondPublicSiteDashboardPage.loadPage({ stepInfo: 'Load second public site dashboard page' });
            await secondPublicSiteDashboardPage.actions.clickOnFeedLink();

            // Verify shared post visible on Site Dashboard
            await siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage2);

            // Verify feed title: "Site Manager shared Site Owner's Post"
            const expectedSiteManagerFeedTitle = `${siteManagerFullName} shared ${siteOwnerFullName}'s Post`;
            await siteManagerFeedPage.assertions.verifyFeedTitle(shareMessage2, expectedSiteManagerFeedTitle);

            // Verify share message is displayed
            await siteManagerFeedPage.assertions.validatePostText(shareMessage2);

            // Verify embedded video is unfurled
            await siteManagerFeedPage.assertions.verifyVideoLinkUnfurled(embedUrl);

            // Verify original post title: "Site Owner shared a Post"
            const expectedOriginalPostTitle2 = `${siteOwnerFullName} shared ${siteOwnerFullName}'s Post`;
            await siteManagerFeedPage.assertions.verifyOriginalPostTitle(shareMessage2, expectedOriginalPostTitle2);

            // Verify View Post link is visible and navigation works
            await siteManagerFeedPage.actions.clickViewPostLink();
            await siteManagerFeedPage.assertions.verifyFeedDetailPageLoaded();

            // Verify share count, likes, replies belong to shared post only
            await Promise.all([
              siteManagerFeedPage.assertions.verifyShareCount(shareMessage2, 0), // No shares on the shared post itself
              siteManagerFeedPage.assertions.verifyLikesCount(shareMessage2, 0), // No likes initially
              siteManagerFeedPage.assertions.verifyRepliesCount(shareMessage2, 0), // No replies initially
            ]);

            // Click View Post again to verify navigation
            await siteManagerFeedPage.actions.clickViewPostLink();
            await siteManagerFeedPage.assertions.verifyFeedDetailPageLoaded();
            await siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage2);

            // Verify content details are visible on detail page
            await siteManagerFeedPage.assertions.waitForPostToBeVisible(commentText);
          });
        } finally {
          // Cleanup: Delete all shared posts
          if (siteManagerSharedPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(siteManagerSharedPostId);
              console.log(`Cleaned up site manager shared post: ${siteManagerSharedPostId}`);
            } catch (error) {
              console.warn(`Failed to cleanup site manager shared post ${siteManagerSharedPostId}:`, error);
            }
          }
          if (siteOwnerSharedPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(siteOwnerSharedPostId);
              console.log(`Cleaned up site owner shared post: ${siteOwnerSharedPostId}`);
            } catch (error) {
              console.warn(`Failed to cleanup site owner shared post ${siteOwnerSharedPostId}:`, error);
            }
          }
        }
      }
    );
  }
);
