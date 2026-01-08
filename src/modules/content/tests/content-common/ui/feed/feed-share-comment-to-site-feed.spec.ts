import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { log } from '@/src/core/utils/logger';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@/src/modules/content/test-data/social-campaign.test-data';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';

test.describe(
  'content Feed Comment Share to Site Feed Tests',
  {
    tag: [ContentTestSuite.FEED_MENTION_SITE_TOPIC_USER_APP_MANAGER],
  },
  () => {
    const sharedPostIds: string[] = [];

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete all shared posts
      for (const postId of sharedPostIds) {
        try {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(postId);
        } catch (error) {
          log.error(`Failed to cleanup shared post ${postId}:`, error);
        }
      }
    });
    // Test data constants
    const commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
    const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;

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

        // Get user info for mentions
        const [adminInfo, endUserInfo] = await Promise.all([
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email),
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
        ]);
        const adminFullName = adminInfo.fullName;
        const endUserFullName = endUserInfo.fullName;
        // Get content for testing
        const contentResponse = await appManagerFixture.contentManagementHelper.getContentId({ status: 'published' });
        const siteId = contentResponse.siteId;
        const contentId = contentResponse.contentId;

        const siteDetails = await appManagerFixture.siteManagementHelper.siteManagementService.getSiteDetails(siteId);
        const siteName = siteDetails.result.name;

        const contentListResponse =
          await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
            siteId: siteId,
            status: 'published',
          });
        const contentItem = contentListResponse.result.listOfItems.find(
          (item: any) => item.contentId === contentId || item.id === contentId
        );
        const contentTitle = contentItem?.title || '';

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
          await adminContentPreviewPage.clickShareThoughtsButton();
          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.postEditor.createPost(commentText);
          await adminFeedPage.postEditor.clickPostButton();

          // Wait for comment to be visible
          await adminFeedPage.feedList.waitForPostToBeVisible(commentText);

          // Click Share on the added comment
          await adminFeedPage.feedList.clickShareOnComment();

          // Fill share dialog with message, mentions and embedded URL
          await adminFeedPage.fillShareDialogWithMentionsAndTopics({
            shareMessage,
            userNames: [endUserFullName],
            embedUrl,
          });

          // Verify Original Post is displayed with View Post link
          await adminFeedPage.share.verifyViewPostLinkInShareDialog();

          // Click Share and get shared post ID
          const shareComponent = new ShareComponent(appManagerFixture.page);
          const sharedPostId = await shareComponent.clickShareButtonAndGetPostId();
          sharedPostIds.push(sharedPostId);

          // Verify success message
          await adminFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );

          // Navigate to Home Dashboard
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.homePage.verifyThePageIsLoaded();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await adminFeedPage.verifyThePageIsLoaded();

          // Verify feed appears on Home Dashboard
          await adminFeedPage.feedList.waitForPostToBeVisible(shareMessage);

          // Verify feed title: "Admin shared Admin's Post"
          const expectedFeedTitle = `${adminFullName} shared ${adminFullName}'s Post`;
          await adminFeedPage.feedList.verifyFeedTitle(shareMessage, expectedFeedTitle);

          // Verify share message is displayed
          await adminFeedPage.feedList.validatePostText(shareMessage);

          // Verify original post title format: "<Admin> in <Site Name> on <Content Title>"
          const expectedOriginalPostTitle = `${adminFullName} in ${siteName} on ${contentTitle}`;
          await adminFeedPage.feedList.verifyOriginalPostTitle(shareMessage, expectedOriginalPostTitle);

          // Verify View Post link is visible
          await adminFeedPage.feedList.clickViewPostLink();

          // Verify navigation to Feed Detail Page
          await adminFeedPage.verifyFeedDetailPageLoaded();

          // Verify content details are visible
          await adminFeedPage.feedList.waitForPostToBeVisible(commentText);

          await adminFeedPage.verifyVideoLinkUnfurled(embedUrl);
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
          await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage);

          // Click Share on Admin's shared feed
          await endUserFeedPage.feedList.clickShareOnPost(shareMessage);

          // Fill share dialog with message, mentions, topics, and embedded URL
          const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
          await endUserFeedPage.fillShareDialogWithMentionsAndTopics({
            shareMessage,
            userNames: [endUserFullName],
            embedUrl,
          });

          // Verify original post with View Post link
          await endUserFeedPage.share.verifyViewPostLinkInShareDialog();

          // Select Post in → Site Feed
          await endUserFeedPage.share.selectShareOptionAsSiteFeed();

          // Choose a Public Site
          await endUserFeedPage.share.enterSiteName(siteName);

          // Click Share and get shared post ID
          const endUserShareComponent = new ShareComponent(standardUserFixture.page);
          const sharedPostId = await endUserShareComponent.clickShareButtonAndGetPostId();
          sharedPostIds.push(sharedPostId);

          // Verify success message
          await endUserFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );

          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.clickOnFeedLink();

          await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage2);

          // Verify feed title: "End User shared Admin's Post"
          const expectedEndUserFeedTitle = `${endUserFullName} shared ${adminFullName}'s Post`;
          await endUserFeedPage.feedList.verifyFeedTitle(shareMessage2, expectedEndUserFeedTitle);

          await endUserFeedPage.feedList.validatePostText(shareMessage2);

          await endUserFeedPage.feedList.clickViewPostLink();
          await endUserFeedPage.verifyFeedDetailPageLoaded();

          // Verify share count, likes, replies belong to shared post only
          await Promise.all([
            endUserFeedPage.feedList.verifyShareCount(shareMessage2, 0),
            endUserFeedPage.feedList.verifyLikesCount(shareMessage2, 0),
            endUserFeedPage.feedList.verifyRepliesCount(shareMessage2, 0),
          ]);

          // Click View Post again to verify navigation
          await endUserFeedPage.feedList.clickViewPostLink();
          await endUserFeedPage.verifyFeedDetailPageLoaded();
          await endUserFeedPage.feedList.waitForPostToBeVisible(commentText);
        });
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

        // Get user info for mentions and role assignment
        const [siteOwnerInfo, siteManagerInfo] = await Promise.all([
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email),
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
        ]);
        const siteOwnerFullName = siteOwnerInfo.fullName;
        const siteManagerFullName = siteManagerInfo.fullName;

        // Get content for testing
        const contentResponse = await appManagerFixture.contentManagementHelper.getContentId({ status: 'published' });
        const contentId = contentResponse.contentId;
        const contentSiteId = contentResponse.siteId;

        const siteDetails =
          await appManagerFixture.siteManagementHelper.siteManagementService.getSiteDetails(contentSiteId);
        const contentSiteName = siteDetails.result.name;

        // Get or create Public Sites
        const publicSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const publicSiteName = publicSite.name;
        const publicSiteId = publicSite.siteId;

        const secondPublicSiteName: string = DEFAULT_PUBLIC_SITE_NAME;

        // Get a second public site
        const secondPublicSiteId =
          await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        // Assign Site Owner role to appManager user
        try {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: siteOwnerInfo.userId,
            role: SitePermission.OWNER,
          });
        } catch (error) {
          log.error(`Failed to assign Site Owner role to appManager user:`, error);
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
          const contentTitle = contentItem?.title || 'Content';

          const siteOwnerContentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            contentSiteId,
            contentId,
            ContentType.PAGE.toLowerCase()
          );
          await siteOwnerContentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await siteOwnerContentPreviewPage.verifyThePageIsLoaded();

          await siteOwnerContentPreviewPage.clickShareThoughtsButton();
          const siteOwnerFeedPage = new FeedPage(appManagerFixture.page);
          await siteOwnerFeedPage.postEditor.createPost(commentText);
          await siteOwnerFeedPage.postEditor.clickPostButton();

          await siteOwnerFeedPage.feedList.waitForPostToBeVisible(commentText);

          await siteOwnerFeedPage.feedList.clickShareOnComment();

          await siteOwnerFeedPage.fillShareDialogWithMentionsAndTopics({
            shareMessage,
            userNames: [siteManagerFullName],
            embedUrl,
          });

          await siteOwnerFeedPage.share.verifyViewPostLinkInShareDialog();

          await siteOwnerFeedPage.share.selectShareOptionAsSiteFeed();

          await siteOwnerFeedPage.share.enterSiteName(publicSiteName);

          const siteOwnerShareComponent = new ShareComponent(appManagerFixture.page);
          const sharedPostId = await siteOwnerShareComponent.clickShareButtonAndGetPostId();
          sharedPostIds.push(sharedPostId);

          await siteOwnerFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );

          const publicSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
          await publicSiteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page' });
          await publicSiteDashboardPage.clickOnFeedLink();

          await siteOwnerFeedPage.feedList.waitForPostToBeVisible(shareMessage);

          const expectedFeedTitle = `${siteOwnerFullName} shared ${siteOwnerFullName}'s Post`;
          await siteOwnerFeedPage.feedList.verifyFeedTitle(shareMessage, expectedFeedTitle);

          await siteOwnerFeedPage.feedList.validatePostText(shareMessage);

          const expectedOriginalPostTitle = `${siteOwnerFullName} in ${contentSiteName} on ${contentTitle}`;
          await siteOwnerFeedPage.feedList.verifyOriginalPostTitle(shareMessage, expectedOriginalPostTitle);

          await siteOwnerFeedPage.feedList.clickViewPostLink();

          await siteOwnerFeedPage.verifyFeedDetailPageLoaded();

          await siteOwnerFeedPage.feedList.waitForPostToBeVisible(commentText);

          await siteOwnerFeedPage.verifyVideoLinkUnfurled(embedUrl);
        });

        // ==================== PART 2: Site Manager Re-Shares to Site Feed ====================
        await test.step('Part 2: Site Manager re-shares to Site Feed', async () => {
          const publicSiteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, publicSiteId);
          await publicSiteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page as Site Manager' });
          await publicSiteDashboardPage.clickOnFeedLink();

          const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
          await siteManagerFeedPage.verifyThePageIsLoaded();

          await siteManagerFeedPage.feedList.waitForPostToBeVisible(shareMessage);

          await siteManagerFeedPage.feedList.clickShareOnPost(shareMessage);

          const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
          await siteManagerFeedPage.fillShareDialogWithMentionsAndTopics({
            shareMessage: shareMessage2,
            userNames: [siteOwnerFullName],
            embedUrl,
          });

          await siteManagerFeedPage.share.verifyViewPostLinkInShareDialog();

          await siteManagerFeedPage.share.selectShareOptionAsSiteFeed();

          await siteManagerFeedPage.share.enterSiteName(secondPublicSiteName);

          const siteManagerShareComponent = new ShareComponent(siteManagerFixture.page);
          const sharedPostId = await siteManagerShareComponent.clickShareButtonAndGetPostId();
          sharedPostIds.push(sharedPostId);

          await siteManagerFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );

          const secondPublicSiteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, secondPublicSiteId);
          await secondPublicSiteDashboardPage.loadPage({ stepInfo: 'Load second public site dashboard page' });
          await secondPublicSiteDashboardPage.clickOnFeedLink();

          await siteManagerFeedPage.feedList.waitForPostToBeVisible(shareMessage2);

          const expectedSiteManagerFeedTitle = `${siteManagerFullName} shared ${siteOwnerFullName}'s Post`;
          await siteManagerFeedPage.feedList.verifyFeedTitle(shareMessage2, expectedSiteManagerFeedTitle);

          await siteManagerFeedPage.feedList.validatePostText(shareMessage2);

          await siteManagerFeedPage.verifyVideoLinkUnfurled(embedUrl);

          await siteManagerFeedPage.feedList.clickViewPostLink();
          await siteManagerFeedPage.verifyFeedDetailPageLoaded();

          await Promise.all([
            siteManagerFeedPage.feedList.verifyShareCount(shareMessage2, 0),
            siteManagerFeedPage.feedList.verifyLikesCount(shareMessage2, 0),
            siteManagerFeedPage.feedList.verifyRepliesCount(shareMessage2, 0),
          ]);

          await siteManagerFeedPage.feedList.clickViewPostLink();
          await siteManagerFeedPage.verifyFeedDetailPageLoaded();
          await siteManagerFeedPage.feedList.waitForPostToBeVisible(commentText);
        });
      }
    );

    test(
      'verify that a user can share a Content Feed post comment with a message to both a Private Site and an Unlisted Site using the "Post in SITE FEED" option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26712'],
      },
      async ({ siteManagerFixture, standardUserFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that a user can share a Content Feed post comment with a message to both a Private Site and an Unlisted Site using the "Post in SITE FEED" option',
          zephyrTestId: 'CONT-26712',
          storyId: 'CONT-26712',
        });

        const embedUrl = SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE;
        const newTopicName = FEED_TEST_DATA.POST_TEXT.TOPIC;

        // Get user info for mentions
        const [endUserInfo, siteManagerInfo] = await Promise.all([
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
        ]);
        const endUserFullName = endUserInfo.fullName;
        const siteManagerFullName = siteManagerInfo.fullName;

        // Get topic list
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const randomTopic =
          topicList.result.listOfItems[Math.floor(Math.random() * topicList.result.listOfItems.length)];

        // Get or create Private and Unlisted sites
        const [privateSite, unlistedSite] = await Promise.all([
          siteManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE),
          siteManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED),
        ]);
        const privateSiteName = privateSite.name;
        const privateSiteId = privateSite.siteId;
        const unlistedSiteName = unlistedSite.name;
        const unlistedSiteId = unlistedSite.siteId;

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
        const contentId = contentResponse.contentId;
        const contentSiteId = contentResponse.siteId;

        // Initialize feed pages
        const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        const siteContentManagerFeedPage = new FeedPage(standardUserFixture.page);

        // ==================== PART 1: Site Manager Flow ====================

        // Navigate directly to content preview page
        const contentPreviewPage = new ContentPreviewPage(
          siteManagerFixture.page,
          contentSiteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Add a Comment for the Content
        // Click "Post on this content" button to open comment editor
        await contentPreviewPage.clickShareThoughtsButton();
        // Use FeedPage methods to create the comment (contentPreviewPage has feed components)
        await siteManagerFeedPage.postEditor.createPost(commentText);
        await siteManagerFeedPage.postEditor.clickPostButton();

        // Wait for comment to be visible
        await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(commentText);
        await siteManagerFeedPage.feedList.clickShareOnComment();

        // Fill share dialog with message, mentions, topics, and embedded URL
        await siteManagerFeedPage.fillShareDialogWithMentionsAndTopics({
          shareMessage,
          userNames: [endUserFullName],
          siteNames: [privateSiteName],
          topicNames: [randomTopic.name, newTopicName],
          embedUrl,
        });

        // Verify the Original Post is displayed with "View Post" link
        await siteManagerFeedPage.share.verifyViewPostLinkInShareDialog();

        // Select "Post in" as "Site Feed"
        await siteManagerFeedPage.share.selectShareOptionAsSiteFeed();

        // Choose a private site
        await siteManagerFeedPage.share.enterSiteName(privateSiteName);

        // Click on "Share"
        await siteManagerFeedPage.share.clickShareButton();

        // Verify success message
        await siteManagerFeedPage.feedList.verifyToastMessageIsVisibleWithText(
          FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
        );

        // ==================== PART 2: Site Content Manager Flow ====================

        // Navigate both users to the private site feed in parallel
        await Promise.all([
          // Site Manager: Navigate to verify the shared post
          (async () => {
            const siteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, privateSiteId);
            await siteDashboardPage.loadPage();
            await siteDashboardPage.clickOnFeedLink();
          })(),
          // Standard User: Navigate to prepare for sharing the post
          (async () => {
            const privateSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, privateSiteId);
            await privateSiteDashboardPage.loadPage();
            await privateSiteDashboardPage.clickOnFeedLink();
          })(),
        ]);

        // Wait for post to be visible on both pages in parallel
        await Promise.all([
          siteManagerFeedPage.feedList.waitForPostToBeVisible(shareMessage),
          siteContentManagerFeedPage.feedList.waitForPostToBeVisible(shareMessage),
        ]);

        await siteManagerFeedPage.feedList.validatePostText(shareMessage);

        // Click "View Post" → verify navigation to Feed Detail Page
        await siteManagerFeedPage.feedList.clickViewPostLink();
        await siteManagerFeedPage.verifyFeedDetailPageLoaded();

        // Store shared post ID for cleanup (extract from URL)
        const currentUrl = siteManagerFixture.page.url();
        const feedIdMatch = currentUrl.match(/\/feed\/([a-f0-9-]+)/);
        if (feedIdMatch) {
          sharedPostIds.push(feedIdMatch[1]);
        }

        // Click "Share" on the feed post shared by "Site Manager"
        await siteContentManagerFeedPage.feedList.clickShareOnPost(shareMessage);

        // Fill share dialog with message, mentions, topics, and embedded URL
        const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        const newTopicName2 = FEED_TEST_DATA.POST_TEXT.TOPIC;
        await siteContentManagerFeedPage.fillShareDialogWithMentionsAndTopics({
          shareMessage: shareMessage2,
          userNames: [siteManagerFullName],
          siteNames: [unlistedSiteName],
          topicNames: [randomTopic.name, newTopicName2],
          embedUrl,
        });

        // Verify original post with "View Post" link
        await siteContentManagerFeedPage.share.verifyViewPostLinkInShareDialog();

        // Select "Post in" = "Site Feed"
        await siteContentManagerFeedPage.share.selectShareOptionAsSiteFeed();

        // Choose an "Unlisted" site
        await siteContentManagerFeedPage.share.enterSiteName(unlistedSiteName);

        // Click "Share"
        await siteContentManagerFeedPage.share.clickShareButton();

        // Verify success message
        await siteContentManagerFeedPage.feedList.verifyToastMessageIsVisibleWithText(
          FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
        );

        // Navigate directly to the unlisted site feed
        const unlistedSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, unlistedSiteId);
        await unlistedSiteDashboardPage.loadPage();
        await unlistedSiteDashboardPage.clickOnFeedLink();

        await siteContentManagerFeedPage.feedList.validatePostText(shareMessage2);

        // Click "View Post" and validate navigation
        await siteContentManagerFeedPage.feedList.clickViewPostLink();
        await siteContentManagerFeedPage.verifyFeedDetailPageLoaded();

        // Verify share count, likes, and replies belong only to the shared post in parallel
        await Promise.all([
          siteContentManagerFeedPage.feedList.verifyShareCount(shareMessage2, 1),
          siteContentManagerFeedPage.feedList.verifyLikesCount(shareMessage2, 1),
          siteContentManagerFeedPage.feedList.verifyRepliesCount(shareMessage2, 1),
        ]);
      }
    );
  }
);
