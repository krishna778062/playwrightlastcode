import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { tagTest } from '@core/utils/testDecorator';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
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
    test(
      'verify clicking View Post button closes Share modal from Home Dashboard, Site Dashboard, and Content Detail Page',
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
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);

            // Click Share icon on post
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Click "View Post" link in Share modal
            await feedPage.actions.clickViewPostLinkInShareModal();

            // Verify we're on the Feed Detail page
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);

            // Click Share icon again from Feed Detail page
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Click "View Post" link again
            await feedPage.actions.clickViewPostLinkInPostDetailPage();

            // Verify Share modal closes
            await feedPage.assertions.verifyShareModalIsClosed();
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
            await siteDashboardPage.actions.clickOnFeedLink();

            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);

            // Click Share icon on post
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Click "View Post" link in Share modal
            await feedPage.actions.clickViewPostLinkInShareModal();

            // Verify we're on the Feed Detail page
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);

            // Click Share icon again from Feed Detail page
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Click "View Post" link again
            await feedPage.actions.clickViewPostLinkInPostDetailPage();

            // Verify Share modal closes
            await feedPage.assertions.verifyShareModalIsClosed();
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
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);

            // Click Share icon on post
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Click "View Post" link in Share modal
            await feedPage.actions.clickViewPostLinkInShareModal();

            // Verify we're on the Feed Detail page
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);

            // Click Share icon again from Feed Detail page
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Click "View Post" link again
            await feedPage.actions.clickViewPostLinkInPostDetailPage();

            // Verify Share modal closes
            await feedPage.assertions.verifyShareModalIsClosed();
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
      'verify link preview is disabled while sharing feed posts',
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
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);

            // Click Share icon on Admin's feed post
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Enter embedded URL in Share Modal
            await feedPage.actions.enterShareDescription(embedUrl);

            // Click Share and get shared post ID
            const shareComponent = new ShareComponent(standardUserFixture.page);
            const sharedPostId = await shareComponent.actions.clickShareButtonAndGetPostId();
            sharedPostIds.push(sharedPostId);

            // Verify success message
            await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

            // Reload page and verify the shared post
            await feedPage.reloadPage();
            await feedPage.assertions.waitForPostToBeVisible(embedUrl);

            // Verify that the embedded URL does NOT unfurl on the shared feed post
            await feedPage.assertions.verifyEmbededUrlIsNotUnfurled(embedUrl, embedUrl);
          });

          // ==================== SITE FEED SCENARIO ====================
          await test.step('Site Feed: Share same post to Site Feed', async () => {
            // Get or create a public site
            const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
            const siteId = siteInfo.siteId;
            const siteName = siteInfo.name;

            const feedPage = new FeedPage(standardUserFixture.page);

            // Click Share icon again for the same feed post
            await feedPage.assertions.waitForPostToBeVisible(createdPostText);
            await feedPage.actions.clickShareIconOnPost(createdPostText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Enter Embedded URL
            await feedPage.actions.enterShareDescription(embedUrl);

            // Select Post in: Site Feed
            await feedPage.actions.selectShareOptionAsSiteFeed();

            // Choose a Public Site
            await feedPage.actions.enterSiteNameForShare(siteName);

            // Click Share and get shared post ID
            const shareComponent = new ShareComponent(standardUserFixture.page);
            const sharedPostId = await shareComponent.actions.clickShareButtonAndGetPostId();
            sharedPostIds.push(sharedPostId);

            // Verify success message
            await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

            // Navigate to that Public site
            const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
            await siteDashboardPage.loadPage({ stepInfo: 'Load public site dashboard page' });
            await siteDashboardPage.actions.clickOnFeedLink();
            await siteDashboardPage.navigateToTab(SitePageTab.FeedTab);

            const siteFeedPage = new FeedPage(standardUserFixture.page);
            await siteFeedPage.assertions.waitForPostToBeVisible(embedUrl);

            // Verify that the embedded URL does NOT unfurl
            await siteFeedPage.assertions.verifyEmbededUrlIsNotUnfurled(embedUrl, embedUrl);
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
            await contentPreviewPage.actions.clickShareThoughtsButton();
            const feedPage = new FeedPage(standardUserFixture.page);
            await feedPage.actions.enterFeedPostText(commentText);
            await feedPage.actions.clickPostButton();
            await feedPage.assertions.waitForPostToBeVisible(commentText);

            // Click Share icon on the comment
            await feedPage.actions.clickShareIconOnPost(commentText);

            // Verify Share modal is open
            await feedPage.assertions.verifyShareModalIsVisible();

            // Enter Embedded URL
            await feedPage.actions.enterShareDescription(embedUrl);

            // Share into Home Feed (default, no need to change) and get shared post ID
            const shareComponent = new ShareComponent(standardUserFixture.page);
            const sharedPostId = await shareComponent.actions.clickShareButtonAndGetPostId();
            sharedPostIds.push(sharedPostId);

            // Verify success message
            await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.TOAST_MESSAGES.SHARED_POST_SUCCESSFULLY);

            // Navigate to Home
            await standardUserFixture.homePage.loadPage();
            await standardUserFixture.homePage.verifyThePageIsLoaded();
            await standardUserFixture.navigationHelper.clickOnGlobalFeed();

            const homeFeedPage = new FeedPage(standardUserFixture.page);
            await homeFeedPage.verifyThePageIsLoaded();
            await homeFeedPage.assertions.waitForPostToBeVisible(embedUrl);

            // Verify that the embedded URL does NOT unfurl
            await homeFeedPage.assertions.verifyEmbededUrlIsNotUnfurled(embedUrl, embedUrl);
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
  }
);
