import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { tagTest } from '@core/utils/testDecorator';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

test.describe(
  'feed share modal view post test',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    const createdPostIds: string[] = [];

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete all shared posts
      for (const sharedPostId of createdPostIds) {
        if (sharedPostId) {
          try {
            await appManagerApiFixture.feedManagementHelper.deleteFeed(sharedPostId);
          } catch (error) {
            console.warn(`Failed to delete shared post ${sharedPostId}:`, error);
          }
        }
      }
    });

    test(
      'verify clicking View Post button closes Share modal from Home Dashboard, Site Dashboard, and Content Detail Page CONT-27696',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, '@CONT-27696'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify clicking View Post button on Feed Detail page closes the Share modal from Home Dashboard, Site Dashboard, and Content Detail Page',
          zephyrTestId: 'CONT-27696',
          storyId: 'CONT-27696',
        });

        const createdPostIds: string[] = [];

        try {
          // ==================== HOME DASHBOARD SCENARIO ====================
          await test.step('Home Dashboard: Verify View Post button closes Share modal', async () => {
            // Create feed post as Admin
            const feedTestData = TestDataGenerator.generateFeed({
              scope: 'public',
              siteId: undefined,
              withAttachment: false,
              waitForSearchIndex: false,
            });

            const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
            const createdPostText = feedTestData.text;
            const createdPostId = feedResponse.result.feedId;
            createdPostIds.push(createdPostId);

            // Navigate to Home Dashboard as Standard User
            await standardUserFixture.homePage.loadPage();
            await standardUserFixture.homePage.verifyThePageIsLoaded();
            await standardUserFixture.navigationHelper.clickOnGlobalFeed();

            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.verifyThePageIsLoaded();
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);

            // Click Share icon on post
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Click "View Post" link in Share modal
            await feedPage.feedList.clickViewPostLinkInShareModal();

            // Verify we're on the Feed Detail page
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);

            // Click Share icon again from Feed Detail page
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Click "View Post" link again
            await feedPage.feedList.clickViewPostLinkInPostDetailPage();

            // Verify Share modal closes
            await feedPage.feedList.verifyShareModalIsClosed();
          });

          // ==================== SITE DASHBOARD SCENARIO ====================
          await test.step('Site Dashboard: Verify View Post button closes Share modal', async () => {
            // Get or create site
            const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
            const siteId = siteInfo.siteId;

            // Create feed post as Admin
            const feedTestData = TestDataGenerator.generateFeed({
              scope: 'site',
              siteId: siteId,
              withAttachment: false,
              waitForSearchIndex: false,
            });

            const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
            const createdPostText = feedTestData.text;
            const createdPostId = feedResponse.result.feedId;
            createdPostIds.push(createdPostId);

            // Navigate to Site Dashboard as Standard User
            const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
            await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
            await siteDashboardPage.clickOnFeedLink();

            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);

            // Click Share icon on post
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Click "View Post" link in Share modal
            await feedPage.feedList.clickViewPostLinkInShareModal();

            // Verify we're on the Feed Detail page
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);

            // Click Share icon again from Feed Detail page
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Click "View Post" link again
            await feedPage.feedList.clickViewPostLinkInPostDetailPage();

            // Verify Share modal closes
            await feedPage.feedList.verifyShareModalIsClosed();
          });

          // ==================== CONTENT DETAIL PAGE SCENARIO ====================
          await test.step('Content Detail Page: Verify View Post button closes Share modal', async () => {
            // Get content details
            const { contentId, siteId } = await appManagerFixture.contentManagementHelper.getContentId();

            // Create feed post as Admin
            const feedTestData = TestDataGenerator.generateFeed({
              scope: 'site',
              siteId: siteId,
              contentId: contentId,
              withAttachment: false,
              waitForSearchIndex: false,
            });

            const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
            const createdPostText = feedTestData.text;
            const createdPostId = feedResponse.result.feedId;
            createdPostIds.push(createdPostId);

            // Navigate to Content Detail Page as End User
            const contentPreviewPage = new ContentPreviewPage(
              standardUserFixture.page,
              siteId,
              contentId,
              ContentType.PAGE.toLowerCase()
            );
            await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });

            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);

            // Click Share icon on post
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Click "View Post" link in Share modal
            await feedPage.feedList.clickViewPostLinkInShareModal();

            // Verify we're on the Feed Detail page
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);

            // Click Share icon again from Feed Detail page
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Click "View Post" link again
            await feedPage.feedList.clickViewPostLinkInPostDetailPage();

            // Verify Share modal closes
            await feedPage.feedList.verifyShareModalIsClosed();
          });
        } finally {
          // Cleanup: Delete all created posts
          for (const createdPostId of createdPostIds) {
            if (createdPostId) {
              try {
                await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
              } catch (error) {
                console.warn(`Failed to delete post ${createdPostId}:`, error);
              }
            }
          }
        }
      }
    );

    test(
      'verify link preview is disabled while sharing feed posts CONT-27697',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-27697'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Link Preview is Disabled While Sharing Feed Posts',
          zephyrTestId: 'CONT-27697',
          storyId: 'CONT-27697',
        });

        const embedUrl = TestDataGenerator.generateYouTubeEmbedUrl();
        let createdPostId: string = '';
        let createdPostText: string = '';
        const sharedPostIds: string[] = [];

        try {
          // ==================== HOME FEED SCENARIO ====================
          await test.step('Home Feed: Create feed post as Admin', async () => {
            // Create feed post as Admin
            const feedTestData = TestDataGenerator.generateFeed({
              scope: 'public',
              siteId: undefined,
              withAttachment: false,
              waitForSearchIndex: false,
            });

            const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
            createdPostId = feedResponse.result.feedId;
            createdPostText = feedTestData.text;

            // Navigate to Home Dashboard as End User
            await standardUserFixture.homePage.loadPage();
            await standardUserFixture.homePage.verifyThePageIsLoaded();
            await standardUserFixture.navigationHelper.clickOnGlobalFeed();

            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.verifyThePageIsLoaded();
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);

            // Click Share icon on Admin's feed post
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Enter embedded URL in Share Modal
            await feedPage.share.enterShareDescription(embedUrl);

            // Click Share and get shared post ID
            const shareComponent = new ShareComponent(standardUserFixture.page);
            const sharedPostId = await shareComponent.clickShareButtonAndGetPostId();
            sharedPostIds.push(sharedPostId);

            // Verify success message
            await feedPage.feedList.verifyToastMessageIsVisibleWithText(
              FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
            );

            // Reload page and verify the shared post
            await feedPage.reloadPage();
            await feedPage.feedList.waitForPostToBeVisible(embedUrl);

            // Verify that the embedded URL does NOT unfurl on the shared feed post
            await feedPage.feedList.verifyEmbededUrlIsNotUnfurled(embedUrl, embedUrl);
          });

          // ==================== SITE FEED SCENARIO ====================
          await test.step('Site Feed: Share same post to Site Feed', async () => {
            // Get or create a public site
            const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
            const siteId = siteInfo.siteId;
            const siteName = siteInfo.name;

            const feedPage = new FeedPage(standardUserFixture.page);

            // Click Share icon again for the same feed post
            await feedPage.feedList.waitForPostToBeVisible(createdPostText);
            await feedPage.feedList.clickShareIcon(createdPostText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Enter Embedded URL
            await feedPage.share.enterShareDescription(embedUrl);

            // Select Post in: Site Feed
            await feedPage.share.selectShareOptionAsSiteFeed();

            // Choose a Public Site
            await feedPage.share.enterSiteName(siteName);

            // Click Share and get shared post ID
            const shareComponent = new ShareComponent(standardUserFixture.page);
            const sharedPostId = await shareComponent.clickShareButtonAndGetPostId();
            sharedPostIds.push(sharedPostId);

            // Verify success message
            await feedPage.feedList.verifyToastMessageIsVisibleWithText(
              FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
            );

            // Navigate to that Public site
            const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
            await siteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page' });
            await siteDashboardPage.clickOnFeedLink();
            await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

            const siteFeedPage = new FeedPage(standardUserFixture.page);
            await siteFeedPage.feedList.waitForPostToBeVisible(embedUrl);

            // Verify that the embedded URL does NOT unfurl
            await siteFeedPage.feedList.verifyEmbededUrlIsNotUnfurled(embedUrl, embedUrl);
          });

          // ==================== CONTENT PAGE SCENARIO ====================
          await test.step('Content Page: Share comment with embedded URL', async () => {
            // Get content details
            const { contentId, siteId } = await appManagerFixture.contentManagementHelper.getContentId();

            // Navigate to any Site
            const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
            await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });

            // Go to Content tab
            await siteDashboardPage.navigateToTab(SitePageTab.ContentTab);

            // Open any Content
            const contentPreviewPage = new ContentPreviewPage(
              standardUserFixture.page,
              siteId,
              contentId,
              ContentType.PAGE.toLowerCase()
            );
            await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });

            // Create a comment first (as Admin) so we can share it
            const commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
            await contentPreviewPage.clickShareThoughtsButton();
            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.postEditor.createPost(commentText);
            await feedPage.postEditor.clickPostButton();
            await feedPage.feedList.waitForPostToBeVisible(commentText);

            // Click Share icon on the comment
            await feedPage.feedList.clickShareIcon(commentText);

            // Verify Share modal is open
            await feedPage.feedList.verifyShareModalIsVisible();

            // Enter Embedded URL
            await feedPage.share.enterShareDescription(embedUrl);

            // Share into Home Feed (default, no need to change) and get shared post ID
            const shareComponent = new ShareComponent(standardUserFixture.page);
            const sharedPostId = await shareComponent.clickShareButtonAndGetPostId();
            sharedPostIds.push(sharedPostId);

            // Verify success message
            await feedPage.feedList.verifyToastMessageIsVisibleWithText(
              FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
            );

            // Navigate to Home
            await standardUserFixture.homePage.loadPage();
            await standardUserFixture.homePage.verifyThePageIsLoaded();
            await standardUserFixture.navigationHelper.clickOnGlobalFeed();

            const homeFeedPage = new FeedPage(standardUserFixture.page);
            await homeFeedPage.verifyThePageIsLoaded();
            await homeFeedPage.feedList.waitForPostToBeVisible(embedUrl);

            // Verify that the embedded URL does NOT unfurl
            await homeFeedPage.feedList.verifyEmbededUrlIsNotUnfurled(embedUrl, embedUrl);
          });
        } finally {
          // Cleanup: Delete all shared posts first
          for (const sharedPostId of sharedPostIds) {
            if (sharedPostId) {
              try {
                await appManagerFixture.feedManagementHelper.deleteFeed(sharedPostId);
              } catch (error) {
                console.warn(`Failed to delete shared post ${sharedPostId}:`, error);
              }
            }
          }

          // Delete the original post
          if (createdPostId) {
            try {
              await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
            } catch (error) {
              console.warn(`Failed to delete original post ${createdPostId}:`, error);
            }
          }
        }
      }
    );

    test(
      'verify Share icon is visible for Feed posts and comments on Private and Unlisted sites CONT-19565',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-19565'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the visibility of Share button on Private and Unlisted Site for Feed posts and comments',
          zephyrTestId: 'CONT-19565',
          storyId: 'CONT-19565',
        });

        const createdFeedIds: string[] = [];
        const createdContentIds: { siteId: string; contentId: string }[] = [];

        try {
          // Get Private and Unlisted sites
          const [privateSite, unlistedSite] = await Promise.all([
            appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE),
            appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED),
          ]);

          const privateSiteId = privateSite.siteId;
          const unlistedSiteId = unlistedSite.siteId;

          // ==================== CREATE FEED POSTS ====================
          await test.step('Create feed posts on Private and Unlisted sites', async () => {
            // Create feed post on Private site
            const privateFeedTestData = TestDataGenerator.generateFeed({
              scope: 'site',
              siteId: privateSiteId,
              withAttachment: false,
              waitForSearchIndex: false,
            });

            const privateFeedResponse = await appManagerFixture.feedManagementHelper.createFeed(privateFeedTestData);
            createdFeedIds.push(privateFeedResponse.result.feedId);

            // Create feed post on Unlisted site
            const unlistedFeedTestData = TestDataGenerator.generateFeed({
              scope: 'site',
              siteId: unlistedSiteId,
              withAttachment: false,
              waitForSearchIndex: false,
            });

            const unlistedFeedResponse = await appManagerFixture.feedManagementHelper.createFeed(unlistedFeedTestData);
            createdFeedIds.push(unlistedFeedResponse.result.feedId);

            // Navigate to Private site feed
            const privateSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, privateSiteId);
            await privateSiteDashboardPage.loadPage({ stepInfo: 'Load private site dashboard page' });
            await privateSiteDashboardPage.clickOnFeedLink();

            const privateFeedPage = new FeedPage(appManagerFixture.page);
            await privateFeedPage.feedList.waitForPostToBeVisible(privateFeedTestData.text);

            // Verify Share icon is visible on Private site feed post
            await privateFeedPage.feedList.verifyShareIconIsVisible(privateFeedTestData.text);

            // Navigate to Unlisted site feed
            const unlistedSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, unlistedSiteId);
            await unlistedSiteDashboardPage.loadPage({ stepInfo: 'Load unlisted site dashboard page' });
            await unlistedSiteDashboardPage.clickOnFeedLink();

            const unlistedFeedPage = new FeedPage(appManagerFixture.page);
            await unlistedFeedPage.feedList.waitForPostToBeVisible(unlistedFeedTestData.text);

            // Verify Share icon is visible on Unlisted site feed post
            await unlistedFeedPage.feedList.verifyShareIconIsVisible(unlistedFeedTestData.text);
          });

          // ==================== CREATE CONTENT AND COMMENTS ====================
          await test.step('Create content and comments on Private and Unlisted sites', async () => {
            // Create page on Private site
            const privatePageInfo = await appManagerFixture.contentManagementHelper.createPage({
              siteId: privateSiteId,
              contentInfo: {
                contentType: 'page',
                contentSubType: 'news',
              },
              options: {
                waitForSearchIndex: false,
              },
            });
            createdContentIds.push({ siteId: privateSiteId, contentId: privatePageInfo.contentId });

            // Create page on Unlisted site
            const unlistedPageInfo = await appManagerFixture.contentManagementHelper.createPage({
              siteId: unlistedSiteId,
              contentInfo: {
                contentType: 'page',
                contentSubType: 'news',
              },
              options: {
                waitForSearchIndex: false,
              },
            });
            createdContentIds.push({ siteId: unlistedSiteId, contentId: unlistedPageInfo.contentId });

            // Create comment on Private site content
            const privateContentPreviewPage = new ContentPreviewPage(
              appManagerFixture.page,
              privateSiteId,
              privatePageInfo.contentId,
              ContentType.PAGE.toLowerCase()
            );
            await privateContentPreviewPage.loadPage({ stepInfo: 'Load private site content preview page' });
            await privateContentPreviewPage.verifyThePageIsLoaded();

            const privateCommentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
            await privateContentPreviewPage.clickShareThoughtsButton();
            const privateFeedPage = new FeedPage(appManagerFixture.page);
            await privateFeedPage.postEditor.createPost(privateCommentText);
            await privateFeedPage.postEditor.clickPostButton();
            await privateFeedPage.feedList.waitForPostToBeVisible(privateCommentText);

            // Verify Share icon is visible on Private site comment
            await privateContentPreviewPage.verifyShareIconIsVisible(privateCommentText);

            // Create comment on Unlisted site content
            const unlistedContentPreviewPage = new ContentPreviewPage(
              appManagerFixture.page,
              unlistedSiteId,
              unlistedPageInfo.contentId,
              ContentType.PAGE.toLowerCase()
            );
            await unlistedContentPreviewPage.loadPage({ stepInfo: 'Load unlisted site content preview page' });
            await unlistedContentPreviewPage.verifyThePageIsLoaded();

            const unlistedCommentText = TestDataGenerator.generateFeed({
              scope: 'site',
              siteId: unlistedSiteId,
              withAttachment: false,
              waitForSearchIndex: false,
            }).text;

            await unlistedContentPreviewPage.clickShareThoughtsButton();
            const unlistedFeedPage = new FeedPage(appManagerFixture.page);
            await unlistedFeedPage.postEditor.createPost(unlistedCommentText);
            await unlistedFeedPage.postEditor.clickPostButton();
            await unlistedFeedPage.feedList.waitForPostToBeVisible(unlistedCommentText);

            // Verify Share icon is visible on Unlisted site comment
            await unlistedContentPreviewPage.listFeedComponent.verifyShareIconIsVisible(unlistedCommentText);

            // ==================== VERIFY SHARE ICON IN CONTENTS SECTION ====================
            await test.step('Verify Share icon visibility in Contents section', async () => {
              // Navigate to Contents section of Private site
              const privateSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, privateSiteId);
              await privateSiteDashboardPage.loadPage({ stepInfo: 'Load private site dashboard page' });
              await privateSiteDashboardPage.navigateToTab(SitePageTab.ContentTab);

              // Open the content page
              await privateContentPreviewPage.loadPage({ stepInfo: 'Load private site content preview page' });
              await privateContentPreviewPage.verifyThePageIsLoaded();

              // Verify Share icon is visible on comment in Contents section
              await privateContentPreviewPage.listFeedComponent.verifyShareIconIsVisible(privateCommentText);

              // Navigate to Contents section of Unlisted site
              const unlistedSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, unlistedSiteId);
              await unlistedSiteDashboardPage.loadPage({ stepInfo: 'Load unlisted site dashboard page' });
              await unlistedSiteDashboardPage.navigateToTab(SitePageTab.ContentTab);

              // Open the content page
              await unlistedContentPreviewPage.loadPage({ stepInfo: 'Load unlisted site content preview page' });
              await unlistedContentPreviewPage.verifyThePageIsLoaded();

              // Verify Share icon is visible on comment in Contents section
              await unlistedContentPreviewPage.listFeedComponent.verifyShareIconIsVisible(unlistedCommentText);
            });
          });
        } finally {
          // Cleanup: Delete all created feeds
          for (const feedId of createdFeedIds) {
            if (feedId) {
              try {
                await appManagerFixture.feedManagementHelper.deleteFeed(feedId);
              } catch (error) {
                console.warn(`Failed to delete feed ${feedId}:`, error);
              }
            }
          }

          // Cleanup: Delete all created content
          for (const { siteId, contentId } of createdContentIds) {
            if (contentId) {
              try {
                await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
              } catch (error) {
                console.warn(`Failed to delete content ${contentId} from site ${siteId}:`, error);
              }
            }
          }
        }
      }
    );

    test(
      'verify shared post remains visible with deleted message when original post is deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26726'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that when original feed post is deleted, shared post remains visible with "This Post has been deleted" message',
          zephyrTestId: 'CONT-26726',
          storyId: 'CONT-26726',
        });

        let originalPostText: string = '';
        let sharedPostId: string = '';
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;

        // ==================== PART 1: ADMIN CREATES FEED POST ====================
        await test.step('Part 1: Admin creates feed post with mentions, topics, and message', async () => {
          const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.endUser.email
          );

          const endUserFullName = endUserInfo.fullName;
          const publicSiteName = DEFAULT_PUBLIC_SITE_NAME;

          const simpplrTopic = await appManagerFixture.contentManagementHelper.getTopicListWithName(
            FEED_TEST_DATA.DEFAULT_TOPIC_NAME
          );

          // Navigate to Home Feed as Admin
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.homePage.verifyThePageIsLoaded();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.verifyThePageIsLoaded();

          // Create feed post with mentions, topics, and message
          const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
          const embedUrl = FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL;

          await adminFeedPage.clickShareThoughtsButton();

          const postResult = await adminFeedPage.postEditor.createfeedWithMentionUserNameAndTopic({
            text: postText,
            userName: endUserFullName,
            topicName: simpplrTopic.name,
            siteName: [publicSiteName],
            embedUrl: embedUrl,
          });

          originalPostText = postResult.postText;
          createdPostIds.push(postResult.postId || '');

          // Wait for post to be visible
          await adminFeedPage.feedList.waitForPostToBeVisible(originalPostText);
        });

        // ==================== PART 2: ENDUSER SHARES TO HOME FEED ====================
        await test.step('Part 2: EndUser shares post to Home Feed and verifies View Post link', async () => {
          // Navigate to Home Feed as EndUser
          await standardUserFixture.homePage.loadPage();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const endUserFeedPage = new FeedPage(standardUserFixture.page);
          await endUserFeedPage.verifyThePageIsLoaded();
          await endUserFeedPage.feedList.waitForPostToBeVisible(originalPostText);

          // Click Share button on Admin's feed post
          await endUserFeedPage.feedList.clickShareOnPost(originalPostText);

          // Verify Share modal is open
          await endUserFeedPage.feedList.verifyShareModalIsVisible();

          const shareComponent = new ShareComponent(standardUserFixture.page);
          await shareComponent.verifyViewPostLinkInShareDialog();

          await endUserFeedPage.share.enterShareDescription(shareMessage);

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();
          createdPostIds.push(sharedPostId);

          await endUserFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY
          );

          await endUserFeedPage.reloadPage();
          await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage);
        });

        // ==================== PART 3: ADMIN DELETES ORIGINAL POST ====================
        await test.step('Part 3: Admin deletes original post', async () => {
          // Navigate to Home Feed as Admin
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.homePage.verifyThePageIsLoaded();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const adminFeedPage = new FeedPage(appManagerFixture.page);
          await adminFeedPage.verifyThePageIsLoaded();
          await adminFeedPage.feedList.waitForPostToBeVisible(originalPostText);

          await adminFeedPage.deletePost(originalPostText);

          await adminFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.DELETED_POST_SUCCESSFULLY
          );

          await adminFeedPage.reloadPage();

          // Verify original post is no longer visible
          await adminFeedPage.feedList.verifyPostIsNotVisible(originalPostText);
        });

        // ==================== PART 4: ENDUSER VERIFIES DELETED MESSAGE ====================
        await test.step('Part 4: EndUser verifies shared post shows deleted message', async () => {
          // Navigate to Home Feed as EndUser
          await standardUserFixture.homePage.loadPage();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const endUserFeedPage = new FeedPage(standardUserFixture.page);
          await endUserFeedPage.verifyThePageIsLoaded();

          await endUserFeedPage.feedList.waitForPostToBeVisible(shareMessage);

          await endUserFeedPage.feedList.verifyDeletedPostMessage(shareMessage);
        });
      }
    );
  }
);
