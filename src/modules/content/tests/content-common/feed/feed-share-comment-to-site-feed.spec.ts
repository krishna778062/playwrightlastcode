import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@/src/modules/content/test-data/social-campaign.test-data';
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
        // Configure app governance settings and enable timeline comment post(feed)
        try {
          await siteManagerFixture.feedManagementHelper.configureAppGovernance({
            feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
          });
        } catch (error) {
          console.warn('Failed to configure app governance, continuing with test:', error);
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
        await siteManagerFeedPage.actions.enterShareDescription(shareMessage);

        // Add user mention
        await siteManagerFeedPage.actions.addUserNameMentionInShareDialog(endUserFullName);

        // Add site mention
        await siteManagerFeedPage.actions.addSiteMentionInShareDialog(privateSiteName);

        // Add existing topic
        await siteManagerFeedPage.actions.addTopicMentionInShareDialog(randomTopic.name);

        // Add new topic
        await siteManagerFeedPage.actions.addTopicMentionInShareDialog(newTopicName);

        // Add embedded URL
        await siteManagerFeedPage.actions.addEmbeddedUrlInShareDialog(embedUrl);

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

        // Site Manager: Validate post message and original post in parallel
        await Promise.all([
          siteManagerFeedPage.assertions.validatePostText(shareMessage),
          siteManagerFeedPage.assertions.verifyOriginalPostInSharedPost(shareMessage, commentText),
        ]);

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

        // Add message, mentions, topics, and embedded URL
        const shareMessage2 = FEED_TEST_DATA.POST_TEXT.SHARE_MESSAGE;
        await siteContentManagerFeedPage.actions.enterShareDescription(shareMessage2);

        // Add user mention
        console.log(`Adding user mention: @${siteManagerFullName}`);
        await siteContentManagerFeedPage.actions.addUserNameMentionInShareDialog(siteManagerFullName);

        // Add site mention
        await siteContentManagerFeedPage.actions.addSiteMentionInShareDialog(unlistedSiteName);

        // Add existing topic
        await siteContentManagerFeedPage.actions.addTopicMentionInShareDialog(randomTopic.name);

        // Add new topic
        const newTopicName2 = FEED_TEST_DATA.POST_TEXT.TOPIC;
        await siteContentManagerFeedPage.actions.addTopicMentionInShareDialog(newTopicName2);

        // Add embedded URL
        await siteContentManagerFeedPage.actions.addEmbeddedUrlInShareDialog(embedUrl);

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

        // Verify message and original post details in parallel
        await Promise.all([
          siteContentManagerFeedPage.assertions.validatePostText(shareMessage2),
          siteContentManagerFeedPage.assertions.verifyOriginalPostInSharedPost(shareMessage2, shareMessage),
        ]);

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
  }
);
