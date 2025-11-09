import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { getContentConfigFromCache } from '../../../config/contentConfig';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '../../../test-data/social-campaign.test-data';
import { SiteDashboardPage } from '../../../ui/pages/sitePages';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
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
        // Note: This may fail if user doesn't have app manager permissions, which is OK
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
        const endUserInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const siteManagerInfo = await identityManagementHelper.getUserInfoByEmail(users.siteManager.email);
        endUserFullName = endUserInfo.fullName;
        siteManagerFullName = siteManagerInfo.fullName;

        // Get topic list (requires app manager permissions)
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        console.log(`Found ${topicList.result.listOfItems.length} topics`);
        randomTopic = topicList.result.listOfItems[Math.floor(Math.random() * topicList.result.listOfItems.length)];

        // Get or create Private site (method always returns a site, creating one if needed)
        const privateSite = await siteManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
        privateSiteName = privateSite.name;
        privateSiteId = privateSite.siteId;

        // Get or create Unlisted site (method always returns a site, creating one if needed)
        const unlistedSite = await siteManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED);
        unlistedSiteName = unlistedSite.name;
        unlistedSiteId = unlistedSite.siteId;

        // Add standard user as member to both sites so they can access them in Part 2
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          privateSiteId,
          endUserInfo.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          unlistedSiteId,
          endUserInfo.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        // Get content for testing
        const contentResponse = await siteManagerFixture.contentManagementHelper.getContentId();
        contentId = contentResponse.contentId;
        contentSiteId = contentResponse.siteId;

        // Initialize feed page
        siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        siteContentManagerFeedPage = new FeedPage(standardUserFixture.page);

        // Generate test data
        commentText = TestDataGenerator.generateRandomText('Comment', 2, true);
        shareMessage = TestDataGenerator.generateRandomText('Share Message', 3, true);
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
      },
      async ({ siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that a user can share a Content Feed post comment with a message to both a Private Site and an Unlisted Site using the "Post in SITE FEED" option',
          zephyrTestId: 'CONT-26712',
          storyId: 'CONT-26712',
        });

        const embedUrl = SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE;

        const newTopicName = TestDataGenerator.generateRandomString();

        // ==================== PART 1: Site Manager Flow ====================

        // Step 2 & 3: Navigate directly to content preview page
        contentPreviewPage = new ContentPreviewPage(
          siteManagerFixture.page,
          contentSiteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Step 4: Add a Comment for the Content
        // Click "Post on this content" button to open comment editor
        await contentPreviewPage.actions.clickShareThoughtsButton();
        // Use FeedPage methods to create the comment (contentPreviewPage has feed components)
        await siteManagerFeedPage.actions.createPost(commentText);
        await siteManagerFeedPage.actions.clickPostButton();

        // Wait for comment to be visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        await siteManagerFeedPage.actions.clickShareOnComment(commentText);

        // Step 6: Fill share dialog with message, mentions, topics, and embedded URL
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

        // Step 7: Verify the Original Post is displayed with "View Post" link
        await siteManagerFeedPage.assertions.verifyViewPostLinkInShareDialog();

        // Step 8: Select "Post in" as "Site Feed"
        await siteManagerFeedPage.actions.selectShareOptionAsSiteFeed();

        // Step 9: Choose a "Private" site
        await siteManagerFeedPage.actions.enterSiteNameInShareDialog(privateSiteName);

        // Step 10: Click on "Share"
        await siteManagerFeedPage.actions.clickShareButtonInShareDialog();

        // Step 11: Verify success message
        await siteManagerFeedPage.assertions.verifyToastMessage('Shared post successfully');

        // Step 12: Navigate directly to site feed (optimized - no search needed)
        siteDashboardPage = new SiteDashboardPage(siteManagerFixture.page, privateSiteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();

        // Step 13: Validate post message and original post
        await siteManagerFeedPage.assertions.validatePostText(shareMessage);
        await siteManagerFeedPage.assertions.verifyOriginalPostInSharedPost(shareMessage, commentText);

        // Step 14: Click "View Post" → verify navigation to Feed Detail Page
        await siteManagerFeedPage.actions.clickViewPostLink(shareMessage);
        await siteManagerFeedPage.assertions.verifyFeedDetailPageLoaded();

        // Store shared post ID for cleanup (extract from URL)
        const currentUrl = siteManagerFixture.page.url();
        const feedIdMatch = currentUrl.match(/\/feed\/([a-f0-9-]+)/);
        if (feedIdMatch) {
          sharedPostId = feedIdMatch[1];
          console.log(`Extracted shared post ID: ${sharedPostId}`);
        }

        // ==================== PART 2: Site Content Manager Flow ====================

        // Step 15: Logout (handled by fixture cleanup, but we need to switch users)
        // For this test, we'll use standardUserFixture which should be a Site Content Manager

        // Step 17: Navigate to the private site feed where the post was shared
        const privateSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, privateSiteId);
        await privateSiteDashboardPage.loadPage();
        await privateSiteDashboardPage.actions.clickOnFeedLink();
        await siteContentManagerFeedPage.verifyThePageIsLoaded();

        // Step 18: Click "Share" on the feed post shared by "Site Manager"
        await siteContentManagerFeedPage.actions.clickShareOnPost(shareMessage);

        // Step 19: Add message, mentions, topics, and embedded URL
        const shareMessage2 = TestDataGenerator.generateRandomText('Share Message 2', 3, true);
        await siteContentManagerFeedPage.actions.enterShareDescription(shareMessage2);

        // Add user mention
        console.log(`Adding user mention: @${siteManagerFullName}`);
        await siteContentManagerFeedPage.actions.addUserNameMentionInShareDialog(siteManagerFullName);

        // Add site mention
        await siteContentManagerFeedPage.actions.addSiteMentionInShareDialog(unlistedSiteName);

        // Add existing topic
        await siteContentManagerFeedPage.actions.addTopicMentionInShareDialog(randomTopic.name);

        // Add new topic
        const newTopicName2 = TestDataGenerator.generateRandomString();
        await siteContentManagerFeedPage.actions.addTopicMentionInShareDialog(newTopicName2);

        // Add embedded URL
        await siteContentManagerFeedPage.actions.addEmbeddedUrlInShareDialog(embedUrl);

        // Step 20: Verify original post with "View Post" link
        await siteContentManagerFeedPage.assertions.verifyViewPostLinkInShareDialog();

        // Step 21: Select "Post in" = "Site Feed"
        await siteContentManagerFeedPage.actions.selectShareOptionAsSiteFeed();

        // Step 22: Choose an "Unlisted" site
        console.log(`Step 22: Selecting unlisted site: ${unlistedSiteName}`);
        await siteContentManagerFeedPage.actions.enterSiteNameInShareDialog(unlistedSiteName);

        // Step 23: Click "Share"
        console.log('Step 23: Clicking Share button');
        await siteContentManagerFeedPage.actions.clickShareButtonInShareDialog();

        // Step 24: Verify success message
        console.log('Step 24: Verifying success message');
        await siteContentManagerFeedPage.assertions.verifyToastMessage('Shared post successfully');

        // Step 25: Navigate directly to the unlisted site feed (avoiding search indexing delay)
        const unlistedSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, unlistedSiteId);
        await unlistedSiteDashboardPage.loadPage();
        await unlistedSiteDashboardPage.actions.clickOnFeedLink();

        // Step 26: Verify message and original post details
        await siteContentManagerFeedPage.assertions.validatePostText(shareMessage2);
        await siteContentManagerFeedPage.assertions.verifyOriginalPostInSharedPost(shareMessage2, shareMessage);

        // Step 27: Click "View Post" and validate navigation
        await siteContentManagerFeedPage.actions.clickViewPostLink(shareMessage2);
        await siteContentManagerFeedPage.assertions.verifyFeedDetailPageLoaded();

        // Step 28: Verify share count, likes, and replies belong only to the shared post
        // Navigate back to site feed for count verification
        await standardUserFixture.page.goBack();
        await siteContentManagerFeedPage.assertions.verifyShareCount(shareMessage2, 0);
        await siteContentManagerFeedPage.assertions.verifyLikesCount(shareMessage2, 0);
        await siteContentManagerFeedPage.assertions.verifyRepliesCount(shareMessage2, 0);

        console.log('=== Test completed successfully ===');
      }
    );
  }
);
