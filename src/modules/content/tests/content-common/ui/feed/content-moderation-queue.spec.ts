import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { CreateFeedPostComponent } from '@content/ui/components/createFeedPostComponent';
import { InappropriateContentWarningPopupComponent } from '@content/ui/components/inappropriateContentWarningPopupComponent';
import { ListFeedComponent } from '@content/ui/components/listFeedComponent';
import { ReportPostModalComponent } from '@content/ui/components/reportPostModalComponent';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { FeedPostingPermission } from '@/src/modules/content/constants/feedPostingPermission';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';

test.describe(
  '@ContentModerationQueue',
  {
    tag: [ContentTestSuite.FEED, ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    test.slow();
    // Shared helper functions for both test parts
    const createHomeDashboardPost = async (userFixture: any, inappropriateText: string) => {
      const homeFeedPage = new FeedPage(userFixture.page);
      await userFixture.homePage.loadPage();
      await userFixture.homePage.verifyThePageIsLoaded();
      await userFixture.navigationHelper.clickOnGlobalFeed();
      await homeFeedPage.verifyThePageIsLoaded();

      // Click Share your thoughts button
      await homeFeedPage.clickShareThoughtsButton();

      // Enter inappropriate text
      await homeFeedPage.postEditor.createPost(inappropriateText);

      // Click Post button
      await homeFeedPage.postEditor.clickPostWithoutWaitingForResponse();

      // Verify warning popup appears
      const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
      await warningPopup.verifyWarningPopupVisible();
      await warningPopup.verifyWarningMessage();

      // Click Submit Anyway
      await warningPopup.clickContinue();
      await warningPopup.verifyWarningPopupClosed();

      // Wait for post to be submitted
      await homeFeedPage.feedList.waitForPostToBeVisible(inappropriateText);
    };

    const createSiteDashboardPost = async (userFixture: any, siteId: string, inappropriateText: string) => {
      const siteDashboard = new SiteDashboardPage(userFixture.page, siteId);
      await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
      await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
      await siteDashboard.verifyThePageIsLoaded();

      // Click Share your thoughts button
      await siteDashboard.clickShareThoughtsButton();

      // Enter inappropriate text
      const createFeedPostComponent = siteDashboard.createFeedPostComponent;
      await createFeedPostComponent.createPost(inappropriateText);

      // Click Post button
      await createFeedPostComponent.clickPostWithoutWaitingForResponse();

      // Verify warning popup appears
      const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
      await warningPopup.verifyWarningPopupVisible();
      await warningPopup.verifyWarningMessage();

      // Click Submit Anyway
      await warningPopup.clickContinue();
      await warningPopup.verifyWarningPopupClosed();

      // Wait for post to be submitted
      await siteDashboard.listFeedComponent.validatePostText(inappropriateText);
    };

    const createContentPageComment = async (
      userFixture: any,
      siteId: string,
      contentId: string,
      inappropriateText: string
    ) => {
      const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
      await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
      await contentPreviewPage.verifyThePageIsLoaded();

      // Verify comment option is visible
      await contentPreviewPage.verifyCommentOptionIsVisible();

      // Click Share your thoughts button
      await contentPreviewPage.clickShareThoughtsButton();

      // Enter inappropriate text
      const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
      await createFeedPostComponent.createPost(inappropriateText);

      // Click Post button
      await createFeedPostComponent.clickPostWithoutWaitingForResponse();

      // Verify warning popup appears
      const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
      await warningPopup.verifyWarningPopupVisible();
      await warningPopup.verifyWarningMessage();

      // Click Submit Anyway
      await warningPopup.clickContinue();
      await warningPopup.verifyWarningPopupClosed();

      // Wait for comment to be submitted
      await contentPreviewPage.waitForPostToBeVisible(inappropriateText);
    };

    test(
      'verify Content Moderator can view Toxic posts/comments/replies in Content Moderation queue - Part 1 (Content Manager and Manager) CONT-29513',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-29513'],
      },
      async ({ appManagerFixture, appManagerApiFixture, siteManagerFixture, standardUserFixture }) => {
        test.slow();
        tagTest(test.info(), {
          description:
            'Verify Content Moderator can view Toxic posts/comments/replies in Content Moderation queue for Content Manager and Manager roles',
          zephyrTestId: 'CONT-29513',
          storyId: 'CONT-29513',
          isKnownFailure: true,
          bugTicket: 'CONT-43260',
        });

        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
        const inappropriateSitePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
        const inappropriateCommentText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_COMMENT_TEXT;

        // Phase 1: Parallel Setup - Get site, user info, and create content in parallel
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;

        const [endUserInfo, siteManagerInfo, pageContent] = await Promise.all([
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
          appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
            options: { waitForSearchIndex: false },
          }),
        ]);

        // Phase 2: Role-Based Users - Serial creation and verification for each role
        // Note: These must run sequentially (not in parallel) because they all use the same standardUserFixture.page

        // Site Content Manager
        await test.step('Site Content Manager: Assign role, create all content, then verify in queue', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: endUserInfo.userId,
            role: SitePermission.CONTENT_MANAGER,
          });

          // Create all 3 content types first (batched)
          await createHomeDashboardPost(standardUserFixture, inappropriatePostText);
          await createSiteDashboardPost(standardUserFixture, publicSiteId, inappropriateSitePostText);
          await createContentPageComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriateCommentText
          );

          // Navigate to queue once and verify all 3 items
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.clickQueuesTab();

          // Verify all items are in queue (2 posts + 1 comment)
          // Note: Since all items use the same text, we verify posts and comments separately
          await moderationQueuePage.verifyPostInQueue(inappropriatePostText);
          await moderationQueuePage.verifyPostInQueue(inappropriateSitePostText);
          await moderationQueuePage.verifyCommentInQueue(inappropriateCommentText);
        });

        // Site Manager
        await test.step('Site Manager: Assign role, create all content, then verify in queue', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: siteManagerInfo.userId,
            role: SitePermission.MANAGER,
          });

          // Create all 3 content types first (batched)
          await createHomeDashboardPost(siteManagerFixture, inappropriatePostText);
          await createSiteDashboardPost(siteManagerFixture, publicSiteId, inappropriatePostText);
          await createContentPageComment(
            siteManagerFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText
          );

          // Navigate to queue once and verify all 3 items
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.clickQueuesTab();

          // Verify all items are in queue (2 posts + 1 comment)
          // Note: Since all items use the same text, we verify posts and comments separately
          await moderationQueuePage.verifyPostInQueue(inappropriatePostText);
          await moderationQueuePage.verifyPostInQueue(inappropriatePostText);
          await moderationQueuePage.verifyCommentInQueue(inappropriateCommentText);
        });
      }
    );

    test(
      'verify Content Moderator can view Toxic posts/comments/replies in Content Moderation queue - Part 2 (Member and Owner) CONT-29513',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-29513'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Content Moderator can view Toxic posts/comments/replies in Content Moderation queue for Member and Owner roles',
          zephyrTestId: 'CONT-29513',
          storyId: 'CONT-29513',
          isKnownFailure: true,
          bugTicket: 'CONT-43260',
        });

        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
        const inappropriateSitePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
        const inappropriateCommentText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;

        // Phase 1: Parallel Setup - Get site, user info, and create content in parallel
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;
        const manageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
        await manageSitePage.clickDashboardAndFeedTab();
        await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);

        const [endUserInfo, pageContent] = await Promise.all([
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
            options: { waitForSearchIndex: false },
          }),
        ]);

        // Phase 2: Role-Based Users - Serial creation and verification for each role
        // Note: These must run sequentially (not in parallel) because they all use the same standardUserFixture.page

        // Member
        await test.step('Member: Assign role, create all content, then verify in queue', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: endUserInfo.userId,
            role: SitePermission.MEMBER,
          });

          // Create all 3 content types first (batched)
          await createHomeDashboardPost(standardUserFixture, inappropriatePostText);
          await createSiteDashboardPost(standardUserFixture, publicSiteId, inappropriateSitePostText);
          await createContentPageComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriateCommentText
          );

          // Navigate to queue once and verify all 3 items
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.clickQueuesTab();

          // Verify all items are in queue (2 posts + 1 comment)
          // Note: Since all items use the same text, we verify posts and comments separately
          await moderationQueuePage.verifyPostInQueue(inappropriatePostText);
          await moderationQueuePage.verifyPostInQueue(inappropriateSitePostText);
          await moderationQueuePage.verifyCommentInQueue(inappropriateCommentText);
        });

        // Site Owner
        await test.step('Site Owner: Assign role, create all content, then verify in queue', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: endUserInfo.userId,
            role: SitePermission.OWNER,
          });

          // Create all 3 content types first (batched)
          await createHomeDashboardPost(standardUserFixture, inappropriatePostText);
          await createSiteDashboardPost(standardUserFixture, publicSiteId, inappropriateSitePostText);
          await createContentPageComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriateCommentText
          );

          // Navigate to queue once and verify all 3 items
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.clickQueuesTab();

          // Verify all items are in queue (2 posts + 1 comment)
          // Note: Since all items use the same text, we verify posts and comments separately
          await moderationQueuePage.verifyPostInQueue(inappropriatePostText);
          await moderationQueuePage.verifyPostInQueue(inappropriateSitePostText);
          await moderationQueuePage.verifyCommentInQueue(inappropriateCommentText);
        });
      }
    );

    test(
      'verify Content Moderator can view Reported posts/comments/replies in Content Moderation queue CONT-29514',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-29514'],
      },
      async ({ appManagerFixture, appManagerApiFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Content Moderator can view Reported posts/comments/replies in Content Moderation queue',
          zephyrTestId: 'CONT-29514',
          storyId: 'CONT-29514',
        });

        const appropriatePostText = FEED_TEST_DATA.POST_TEXT.APPROPRIATE_POST_TEXT;
        const reportReason = FEED_TEST_DATA.POST_TEXT.REPORT_REASON;
        const reportToastMessage = FEED_TEST_DATA.TOAST_MESSAGES.REPORT_POST_SUCCESS;

        // Phase 1: Setup - Get site and create content
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;
        const manageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
        await manageSitePage.clickDashboardAndFeedTab();
        await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);

        const pageContent = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: publicSiteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: { waitForSearchIndex: false },
        });

        // Helper function to create appropriate comment on Content Detail Page and submit anyway and add reply
        const createContentPageCommentAndReply = async (
          userFixture: any,
          siteId: string,
          contentId: string,
          appropriateText: string,
          replyText: string
        ) => {
          const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();
          await contentPreviewPage.verifyCommentOptionIsVisible();

          await contentPreviewPage.clickShareThoughtsButton();
          const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
          await createFeedPostComponent.createPost(appropriateText);
          await createFeedPostComponent.clickPostButton();

          await contentPreviewPage.waitForPostToBeVisible(appropriateText);

          const listFeedComponent = new ListFeedComponent(userFixture.page);
          // Use the new method that handles appropriate content warning popup
          await listFeedComponent.addReplyToPostWithInappropriateContent(replyText, '');

          // Wait for reply to be visible
          await contentPreviewPage.waitForPostToBeVisible(replyText);
        };

        // Helper function to report a post
        const reportPost = async (userFixture: any, postText: string, reason: string, feedPage: FeedPage) => {
          const listFeedComponent = new ListFeedComponent(userFixture.page);
          await listFeedComponent.openPostOptionsMenu(postText);
          await listFeedComponent.clickReportPostOption();

          const reportModal = new ReportPostModalComponent(userFixture.page);
          await reportModal.verifyModalVisible();
          await reportModal.verifyReportButtonDisabled();
          await reportModal.enterReportReason(reason);
          await reportModal.verifyReportButtonEnabled();
          await reportModal.clickReportButton();
          await reportModal.verifyModalClosed();

          // Verify toast message
          await feedPage.feedList.verifyToastMessageIsVisibleWithText(reportToastMessage);
        };

        // Helper function to report a comment
        const reportComment = async (userFixture: any, commentText: string, reason: string, feedPage: FeedPage) => {
          const listFeedComponent = new ListFeedComponent(userFixture.page);
          await listFeedComponent.openPostOptionsMenu(commentText);
          await listFeedComponent.clickReportPostOption();

          const reportModal = new ReportPostModalComponent(userFixture.page);
          await reportModal.verifyModalVisible();
          await reportModal.verifyReportButtonDisabled();
          await reportModal.enterReportReason(reason);
          await reportModal.verifyReportButtonEnabled();
          await reportModal.clickReportButton();
          await reportModal.verifyModalClosed();

          await feedPage.feedList.verifyToastMessageIsVisibleWithText(reportToastMessage);
        };

        // Helper function to report a reply
        const reportReply = async (userFixture: any, replyText: string, reason: string, feedPage: FeedPage) => {
          const listFeedComponent = new ListFeedComponent(userFixture.page);
          await listFeedComponent.openReplyOptionsMenu(replyText);
          await listFeedComponent.clickReportReplyOption();

          const reportModal = new ReportPostModalComponent(userFixture.page, 'reply');
          await reportModal.verifyModalVisible();
          await reportModal.verifyReportButtonDisabled();
          await reportModal.enterReportReason(reason);
          await reportModal.verifyReportButtonEnabled();
          await reportModal.clickReportButton();
          await reportModal.verifyModalClosed();

          await feedPage.feedList.verifyToastMessageIsVisibleWithText(reportToastMessage);
        };

        // Home Dashboard: Create post, report it, and verify in queue
        await test.step('Home Dashboard', async () => {
          // End User 1 creates post
          const homeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFixture.homePage.loadPage();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.verifyThePageIsLoaded();

          await homeFeedPage.clickShareThoughtsButton();
          await homeFeedPage.postEditor.createPost(appropriatePostText);
          await homeFeedPage.postEditor.clickPostButton();
          await homeFeedPage.feedList.waitForPostToBeVisible(appropriatePostText);

          // End User 2 reports the post
          await siteManagerFixture.homePage.loadPage();
          await siteManagerFixture.homePage.verifyThePageIsLoaded();
          await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
          const feedPage = new FeedPage(siteManagerFixture.page);
          await feedPage.verifyThePageIsLoaded();
          await feedPage.feedList.waitForPostToBeVisible(appropriatePostText);
          await reportPost(siteManagerFixture, appropriatePostText, reportReason, feedPage);

          // Admin views reported post in moderation queue
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.clickQueuesTab();
          await moderationQueuePage.verifyPostInQueue(appropriatePostText);
          await moderationQueuePage.dismissPost(appropriatePostText);
        });

        // Site Dashboard: Create post, report it, and verify in queue
        await test.step('Site', async () => {
          // End User 1 creates post
          const siteDashboard = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();

          await siteDashboard.clickShareThoughtsButton();
          const createFeedPostComponent = siteDashboard.createFeedPostComponent;
          await createFeedPostComponent.createPost(appropriatePostText);
          await createFeedPostComponent.clickPostButton();
          await siteDashboard.validatePostText(appropriatePostText);

          // End User 2 reports the post
          const siteDashboard2 = new SiteDashboardPage(siteManagerFixture.page, publicSiteId);
          await siteDashboard2.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard2.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard2.verifyThePageIsLoaded();
          await siteDashboard2.clickOnFeedLink();
          await siteDashboard2.validatePostText(appropriatePostText);
          await reportPost(
            siteManagerFixture,
            appropriatePostText,
            reportReason,
            new FeedPage(siteManagerFixture.page)
          );

          // Admin views reported post in moderation queue
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.clickQueuesTab();
          await moderationQueuePage.verifyPostInQueue(appropriatePostText);
          await moderationQueuePage.removePost(appropriatePostText);
        });

        // Content Detail Page: Create comment and reply, report them, and verify in queue
        await test.step('Content', async () => {
          // End User 1 creates comment and reply
          await createContentPageCommentAndReply(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            appropriatePostText,
            `Reply to ${appropriatePostText}`
          );

          // End User 2 reports comment and reply
          const contentPreviewPage = new ContentPreviewPage(
            siteManagerFixture.page,
            publicSiteId,
            pageContent.contentId,
            'page'
          );
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          // Report comment
          await reportComment(
            siteManagerFixture,
            appropriatePostText,
            reportReason,
            new FeedPage(siteManagerFixture.page)
          );

          // Report reply
          const replyText = `Reply to ${appropriatePostText}`;
          await reportReply(siteManagerFixture, replyText, reportReason, new FeedPage(siteManagerFixture.page));

          // Admin views reported comment and reply in moderation queue
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.clickQueuesTab();
          await moderationQueuePage.verifyCommentInQueue(appropriatePostText);
          await moderationQueuePage.verifyCommentInQueue(`Reply to ${appropriatePostText}`);
          await moderationQueuePage.removeComment(`Reply to ${appropriatePostText}`);
          await moderationQueuePage.dismissComment(appropriatePostText);
        });
      }
    );
  }
);
