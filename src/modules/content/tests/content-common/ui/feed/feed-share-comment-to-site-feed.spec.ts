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
    // Test data constants
    const commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
    const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;

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
        let sharedPostId: string = '';

        try {
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
          await contentPreviewPage.actions.clickShareThoughtsButton();
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
          await siteManagerFeedPage.assertions.verifyToastMessage(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );

          // ==================== PART 2: Site Content Manager Flow ====================

          // Navigate both users to the private site feed in parallel
          await Promise.all([
            // Site Manager: Navigate to verify the shared post
            (async () => {
              const siteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, privateSiteId);
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
        } finally {
          // Cleanup
          if (sharedPostId) {
            try {
              await siteManagerFixture.feedManagementHelper.deleteFeed(sharedPostId);
            } catch (error) {
              log.error(`Failed to cleanup first shared post ${sharedPostId}:`, error);
            }
          }
        }
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
        let adminSharedPostId: string = '';
        let endUserSharedPostId: string = '';

        try {
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
            await adminContentPreviewPage.actions.clickShareThoughtsButton();
            const adminFeedPage = new FeedPage(appManagerFixture.page);
            await adminFeedPage.actions.createPost(commentText);
            await adminFeedPage.actions.clickPostButton();

            // Wait for comment to be visible
            await adminContentPreviewPage.assertions.waitForPostToBeVisible(commentText);

            // Click Share on the added comment
            await adminFeedPage.actions.clickShareOnComment();

            // Fill share dialog with message, mentions and embedded URL
            await adminFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage,
              userNames: [endUserFullName],
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
            await endUserFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage,
              userNames: [endUserFullName],
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

            const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
            await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
            await siteDashboardPage.actions.clickOnFeedLink();

            await endUserFeedPage.assertions.waitForPostToBeVisible(shareMessage2);

            // Verify feed title: "End User shared Admin's Post"
            const expectedEndUserFeedTitle = `${endUserFullName} shared ${adminFullName}'s Post`;
            await endUserFeedPage.assertions.verifyFeedTitle(shareMessage2, expectedEndUserFeedTitle);

            await endUserFeedPage.assertions.validatePostText(shareMessage2);

            await endUserFeedPage.actions.clickViewPostLink();
            await endUserFeedPage.assertions.verifyFeedDetailPageLoaded();

            // Verify share count, likes, replies belong to shared post only
            await Promise.all([
              endUserFeedPage.assertions.verifyShareCount(shareMessage2, 0),
              endUserFeedPage.assertions.verifyLikesCount(shareMessage2, 0),
              endUserFeedPage.assertions.verifyRepliesCount(shareMessage2, 0),
            ]);

            // Click View Post again to verify navigation
            await endUserFeedPage.actions.clickViewPostLink();
            await endUserFeedPage.assertions.verifyFeedDetailPageLoaded();
            await endUserFeedPage.assertions.waitForPostToBeVisible(commentText);
          });
        } finally {
          // Cleanup: Delete all shared posts
          if (endUserSharedPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(endUserSharedPostId);
            } catch (error) {
              log.error(`Failed to cleanup end user shared post ${endUserSharedPostId}:`, error);
            }
          }
          if (adminSharedPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(adminSharedPostId);
            } catch (error) {
              log.error(`Failed to cleanup admin shared post ${adminSharedPostId}:`, error);
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
        let siteOwnerSharedPostId: string = '';
        let siteManagerSharedPostId: string = '';

        try {
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

            await siteOwnerContentPreviewPage.actions.clickShareThoughtsButton();
            const siteOwnerFeedPage = new FeedPage(appManagerFixture.page);
            await siteOwnerFeedPage.actions.createPost(commentText);
            await siteOwnerFeedPage.actions.clickPostButton();

            await siteOwnerContentPreviewPage.assertions.waitForPostToBeVisible(commentText);

            await siteOwnerFeedPage.actions.clickShareOnComment();

            await siteOwnerFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage,
              userNames: [siteManagerFullName],
              embedUrl,
            });

            await siteOwnerFeedPage.assertions.verifyViewPostLinkInShareDialog();

            await siteOwnerFeedPage.actions.selectShareOptionAsSiteFeed();

            await siteOwnerFeedPage.actions.enterSiteNameInShareDialog(publicSiteName);

            const siteOwnerShareComponent = new ShareComponent(appManagerFixture.page);
            siteOwnerSharedPostId = await siteOwnerShareComponent.actions.clickShareButtonAndGetPostId();

            await siteOwnerFeedPage.assertions.verifyToastMessage(
              FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
            );

            const publicSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
            await publicSiteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page' });
            await publicSiteDashboardPage.actions.clickOnFeedLink();

            await siteOwnerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

            const expectedFeedTitle = `${siteOwnerFullName} shared ${siteOwnerFullName}'s Post`;
            await siteOwnerFeedPage.assertions.verifyFeedTitle(shareMessage, expectedFeedTitle);

            await siteOwnerFeedPage.assertions.validatePostText(shareMessage);

            const expectedOriginalPostTitle = `${siteOwnerFullName} in ${contentSiteName} on ${contentTitle}`;
            await siteOwnerFeedPage.assertions.verifyOriginalPostTitle(shareMessage, expectedOriginalPostTitle);

            await siteOwnerFeedPage.actions.clickViewPostLink();

            await siteOwnerFeedPage.assertions.verifyFeedDetailPageLoaded();

            await siteOwnerFeedPage.assertions.waitForPostToBeVisible(commentText);

            await siteOwnerFeedPage.assertions.verifyVideoLinkUnfurled(embedUrl);
          });

          // ==================== PART 2: Site Manager Re-Shares to Site Feed ====================
          await test.step('Part 2: Site Manager re-shares to Site Feed', async () => {
            const publicSiteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, publicSiteId);
            await publicSiteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page as Site Manager' });
            await publicSiteDashboardPage.actions.clickOnFeedLink();

            const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
            await siteManagerFeedPage.verifyThePageIsLoaded();

            await siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

            await siteManagerFeedPage.actions.clickShareIconOnPost(shareMessage);

            const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
            await siteManagerFeedPage.actions.fillShareDialogWithMentionsAndTopics({
              shareMessage: shareMessage2,
              userNames: [siteOwnerFullName],
              embedUrl,
            });

            await siteManagerFeedPage.assertions.verifyViewPostLinkInShareDialog();

            await siteManagerFeedPage.actions.selectShareOptionAsSiteFeed();

            await siteManagerFeedPage.actions.enterSiteNameInShareDialog(secondPublicSiteName);

            const siteManagerShareComponent = new ShareComponent(siteManagerFixture.page);
            siteManagerSharedPostId = await siteManagerShareComponent.actions.clickShareButtonAndGetPostId();

            await siteManagerFeedPage.assertions.verifyToastMessage(
              FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
            );

            const secondPublicSiteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, secondPublicSiteId);
            await secondPublicSiteDashboardPage.loadPage({ stepInfo: 'Load second public site dashboard page' });
            await secondPublicSiteDashboardPage.actions.clickOnFeedLink();

            await siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage2);

            const expectedSiteManagerFeedTitle = `${siteManagerFullName} shared ${siteOwnerFullName}'s Post`;
            await siteManagerFeedPage.assertions.verifyFeedTitle(shareMessage2, expectedSiteManagerFeedTitle);

            await siteManagerFeedPage.assertions.validatePostText(shareMessage2);

            await siteManagerFeedPage.assertions.verifyVideoLinkUnfurled(embedUrl);

            await siteManagerFeedPage.actions.clickViewPostLink();
            await siteManagerFeedPage.assertions.verifyFeedDetailPageLoaded();

            await Promise.all([
              siteManagerFeedPage.assertions.verifyShareCount(shareMessage2, 0),
              siteManagerFeedPage.assertions.verifyLikesCount(shareMessage2, 0),
              siteManagerFeedPage.assertions.verifyRepliesCount(shareMessage2, 0),
            ]);

            await siteManagerFeedPage.actions.clickViewPostLink();
            await siteManagerFeedPage.assertions.verifyFeedDetailPageLoaded();
            await siteManagerFeedPage.assertions.waitForPostToBeVisible(commentText);
          });
        } finally {
          // Cleanup: Delete all shared posts
          if (siteManagerSharedPostId) {
            try {
              await appManagerApiFixture.feedManagementHelper.deleteFeed(siteManagerSharedPostId);
            } catch (error) {
              log.error(`Failed to cleanup site manager shared post ${siteManagerSharedPostId}:`, error);
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
