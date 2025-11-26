import { FeedPostingPermission } from '@content/constants/feedPostingPermission';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { CreateFeedPostComponent } from '@content/ui/components/createFeedPostComponent';
import { InappropriateContentWarningPopupComponent } from '@content/ui/components/inappropriateContentWarningPopupComponent';
import { ListFeedComponent } from '@content/ui/components/listFeedComponent';
import { ReportPostModalComponent } from '@content/ui/components/reportPostModalComponent';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { FeedPage } from '@content/ui/pages/feedPage';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

test.describe(
  '@ContentModerationQueue',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    test(
      'verify Content Moderator can view Toxic posts/comments/replies in Content Moderation queue',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-29513'],
      },
      async ({ appManagerFixture, appManagerApiFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Content Moderator can view Toxic posts/comments/replies in Content Moderation queue for all roles',
          zephyrTestId: 'CONT-29513',
          storyId: 'CONT-29513',
          isKnownFailure: true,
          bugTicket: 'CONT-42477',
        });

        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;

        // Phase 1: Parallel Setup - Get site, user info, and create content in parallel
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;
        const manageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
        await manageSitePage.clickDashboardAndFeedTab();
        await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);

        const [endUserInfo, siteManagerInfo, pageContent] = await Promise.all([
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
          appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email),
          appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
            options: { waitForSearchIndex: false },
          }),
        ]);

        // Helper function to create inappropriate post on Home Dashboard and submit anyway
        const createHomeDashboardPost = async (userFixture: any, inappropriateText: string) => {
          const homeFeedPage = new FeedPage(userFixture.page);
          await userFixture.homePage.loadPage();
          await userFixture.homePage.verifyThePageIsLoaded();
          await userFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await homeFeedPage.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          await homeFeedPage.actions.createPost(inappropriateText);

          // Click Post button
          await homeFeedPage.actions.clickPostButton();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Submit Anyway
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Wait for post to be submitted
          await homeFeedPage.assertions.waitForPostToBeVisible(inappropriateText);
        };

        // Helper function to create inappropriate post on Site Dashboard and submit anyway
        const createSiteDashboardPost = async (userFixture: any, siteId: string, inappropriateText: string) => {
          const siteDashboard = new SiteDashboardPage(userFixture.page, siteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();

          // Click Share your thoughts button
          await siteDashboard.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = siteDashboard['createFeedPostComponent'];
          await createFeedPostComponent.actions.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.actions.clickPostButton();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Submit Anyway
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Wait for post to be submitted
          await siteDashboard.assertions.validatePostText(inappropriateText);
        };

        // Helper function to create inappropriate comment on Content Detail Page and submit anyway
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
          await contentPreviewPage.assertions.verifyCommentOptionIsVisible();

          // Click Share your thoughts button
          await contentPreviewPage.actions.clickShareThoughtsButton();

          // Enter inappropriate text
          const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
          await createFeedPostComponent.actions.createPost(inappropriateText);

          // Click Post button
          await createFeedPostComponent.actions.clickPostButton();

          // Verify warning popup appears
          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();

          // Click Submit Anyway
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Wait for comment to be submitted
          await contentPreviewPage.assertions.waitForPostToBeVisible(inappropriateText);
        };

        // Phase 2: Role-Based Users - Serial creation and verification for each role
        // Note: These must run sequentially (not in parallel) because they all use the same standardUserFixture.page

        // Site Content Manager
        await test.step('Site Content Manager: Assign role and create inappropriate content serially', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: endUserInfo.userId,
            role: SitePermission.CONTENT_MANAGER,
          });

          // Home Dashboard: Create post and verify in queue
          await createHomeDashboardPost(standardUserFixture, inappropriatePostText);
          const moderationQueuePage1 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage1.actions.clickQueuesTab();
          await moderationQueuePage1.assertions.verifyPostInQueue(inappropriatePostText);

          // Site Dashboard: Create post and verify in queue
          await createSiteDashboardPost(standardUserFixture, publicSiteId, inappropriatePostText);
          const moderationQueuePage2 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage2.actions.clickQueuesTab();
          await moderationQueuePage2.assertions.verifyPostInQueue(inappropriatePostText);

          // Content Page: Create comment and verify in queue
          await createContentPageComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText
          );
          const moderationQueuePage3 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage3.actions.clickQueuesTab();
          await moderationQueuePage3.assertions.verifyCommentInQueue(inappropriatePostText);
        });

        // Site Manager
        await test.step('Site Manager: Assign role and create inappropriate content serially', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: siteManagerInfo.userId,
            role: SitePermission.MANAGER,
          });

          // Home Dashboard: Create post and verify in queue
          await createHomeDashboardPost(siteManagerFixture, inappropriatePostText);
          const moderationQueuePage1 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage1.actions.clickQueuesTab();
          await moderationQueuePage1.assertions.verifyPostInQueue(inappropriatePostText);

          // Site Dashboard: Create post and verify in queue
          await createSiteDashboardPost(siteManagerFixture, publicSiteId, inappropriatePostText);
          const moderationQueuePage2 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage2.actions.clickQueuesTab();
          await moderationQueuePage2.assertions.verifyPostInQueue(inappropriatePostText);

          // Content Page: Create comment and verify in queue
          await createContentPageComment(
            siteManagerFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText
          );
          const moderationQueuePage3 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage3.actions.clickQueuesTab();
          await moderationQueuePage3.assertions.verifyCommentInQueue(inappropriatePostText);
        });

        // Member
        await test.step('Member: Assign role and create inappropriate content serially', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: endUserInfo.userId,
            role: SitePermission.MEMBER,
          });

          // Home Dashboard: Create post and verify in queue
          await createHomeDashboardPost(standardUserFixture, inappropriatePostText);
          const moderationQueuePage1 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage1.actions.clickQueuesTab();
          await moderationQueuePage1.assertions.verifyPostInQueue(inappropriatePostText);

          // Site Dashboard: Create post and verify in queue
          await createSiteDashboardPost(standardUserFixture, publicSiteId, inappropriatePostText);
          const moderationQueuePage2 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage2.actions.clickQueuesTab();
          await moderationQueuePage2.assertions.verifyPostInQueue(inappropriatePostText);

          // Content Page: Create comment and verify in queue
          await createContentPageComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText
          );
          const moderationQueuePage3 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage3.actions.clickQueuesTab();
          await moderationQueuePage3.assertions.verifyCommentInQueue(inappropriatePostText);
        });

        // Site Owner
        await test.step('Site Owner: Assign role and create inappropriate content serially', async () => {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: publicSiteId,
            userId: endUserInfo.userId,
            role: SitePermission.OWNER,
          });

          // Home Dashboard: Create post and verify in queue
          await createHomeDashboardPost(standardUserFixture, inappropriatePostText);
          const moderationQueuePage1 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage1.actions.clickQueuesTab();
          await moderationQueuePage1.assertions.verifyPostInQueue(inappropriatePostText);

          // Site Dashboard: Create post and verify in queue
          await createSiteDashboardPost(standardUserFixture, publicSiteId, inappropriatePostText);
          const moderationQueuePage2 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage2.actions.clickQueuesTab();
          await moderationQueuePage2.assertions.verifyPostInQueue(inappropriatePostText);

          // Content Page: Create comment and verify in queue
          await createContentPageComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText
          );
          const moderationQueuePage3 = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage3.actions.clickQueuesTab();
          await moderationQueuePage3.assertions.verifyCommentInQueue(inappropriatePostText);
        });
      }
    );

    test(
      'verify Content Moderator can view Reported posts/comments/replies in Content Moderation queue',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-29514'],
      },
      async ({ appManagerFixture, appManagerApiFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Content Moderator can view Reported posts/comments/replies in Content Moderation queue',
          zephyrTestId: 'CONT-29514',
          storyId: 'CONT-29514',
        });

        const inappropriatePostText = FEED_TEST_DATA.POST_TEXT.INAPPROPRIATE_POST_TEXT;
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

        // Helper function to create inappropriate post on Home Dashboard and submit anyway
        const createHomeDashboardPost = async (userFixture: any, inappropriateText: string) => {
          const homeFeedPage = new FeedPage(userFixture.page);
          await userFixture.homePage.loadPage();
          await userFixture.homePage.verifyThePageIsLoaded();
          await userFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.verifyThePageIsLoaded();

          await homeFeedPage.actions.clickShareThoughtsButton();
          await homeFeedPage.actions.createPost(inappropriateText);
          await homeFeedPage.actions.clickPostButton();

          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();

          await homeFeedPage.assertions.waitForPostToBeVisible(inappropriateText);
        };

        // Helper function to create inappropriate post on Site Dashboard and submit anyway
        const createSiteDashboardPost = async (userFixture: any, siteId: string, inappropriateText: string) => {
          const siteDashboard = new SiteDashboardPage(userFixture.page, siteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();

          await siteDashboard.actions.clickShareThoughtsButton();
          const createFeedPostComponent = siteDashboard['createFeedPostComponent'];
          await createFeedPostComponent.actions.createPost(inappropriateText);
          await createFeedPostComponent.actions.clickPostButton();

          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();

          await siteDashboard.assertions.validatePostText(inappropriateText);
        };

        // Helper function to create inappropriate comment on Content Detail Page and submit anyway
        const createContentPageComment = async (
          userFixture: any,
          siteId: string,
          contentId: string,
          inappropriateText: string
        ) => {
          const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();
          await contentPreviewPage.assertions.verifyCommentOptionIsVisible();

          await contentPreviewPage.actions.clickShareThoughtsButton();
          const createFeedPostComponent = new CreateFeedPostComponent(userFixture.page);
          await createFeedPostComponent.actions.createPost(inappropriateText);
          await createFeedPostComponent.actions.clickPostButton();

          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();

          await contentPreviewPage.assertions.waitForPostToBeVisible(inappropriateText);
        };

        // Helper function to add reply to comment with inappropriate content handling
        const addReplyToComment = async (
          userFixture: any,
          siteId: string,
          contentId: string,
          commentText: string,
          replyText: string
        ) => {
          const contentPreviewPage = new ContentPreviewPage(userFixture.page, siteId, contentId, 'page');
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          // Wait for comment to be visible first
          await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);

          const listFeedComponent = new ListFeedComponent(userFixture.page);
          // Use the new method that handles inappropriate content warning popup
          await listFeedComponent.addReplyToPostWithInappropriateContent(replyText, '');

          const warningPopup = new InappropriateContentWarningPopupComponent(userFixture.page);
          await warningPopup.assertions.verifyWarningPopupVisible();
          await warningPopup.assertions.verifyWarningMessage();
          await warningPopup.actions.clickContinue();
          await warningPopup.assertions.verifyWarningPopupClosed();

          // Wait for reply to be visible
          await contentPreviewPage.assertions.waitForPostToBeVisible(replyText);
        };

        // Helper function to report a post
        const reportPost = async (userFixture: any, postText: string, reason: string, feedPage: FeedPage) => {
          const listFeedComponent = new ListFeedComponent(userFixture.page);
          await listFeedComponent.openPostOptionsMenu(postText);
          await listFeedComponent.clickReportPostOption();

          const reportModal = new ReportPostModalComponent(userFixture.page);
          await reportModal.assertions.verifyModalVisible();
          await reportModal.assertions.verifyReportButtonDisabled();
          await reportModal.actions.enterReportReason(reason);
          await reportModal.assertions.verifyReportButtonEnabled();
          await reportModal.actions.clickReportButton();
          await reportModal.assertions.verifyModalClosed();

          // Verify toast message
          await feedPage.assertions.verifyToastMessageIsVisibleWithText(reportToastMessage);
        };

        // Helper function to report a comment
        const reportComment = async (userFixture: any, commentText: string, reason: string, feedPage: FeedPage) => {
          const listFeedComponent = new ListFeedComponent(userFixture.page);
          await listFeedComponent.openPostOptionsMenu(commentText);
          await listFeedComponent.clickReportPostOption();

          const reportModal = new ReportPostModalComponent(userFixture.page);
          await reportModal.assertions.verifyModalVisible();
          await reportModal.assertions.verifyReportButtonDisabled();
          await reportModal.actions.enterReportReason(reason);
          await reportModal.assertions.verifyReportButtonEnabled();
          await reportModal.actions.clickReportButton();
          await reportModal.assertions.verifyModalClosed();

          await feedPage.assertions.verifyToastMessageIsVisibleWithText(reportToastMessage);
        };

        // Helper function to report a reply
        const reportReply = async (userFixture: any, replyText: string, reason: string, feedPage: FeedPage) => {
          const listFeedComponent = new ListFeedComponent(userFixture.page);
          await listFeedComponent.openReplyOptionsMenu(replyText);
          await listFeedComponent.clickReportReplyOption();

          const reportModal = new ReportPostModalComponent(userFixture.page, 'reply');
          await reportModal.assertions.verifyModalVisible();
          await reportModal.assertions.verifyReportButtonDisabled();
          await reportModal.actions.enterReportReason(reason);
          await reportModal.assertions.verifyReportButtonEnabled();
          await reportModal.actions.clickReportButton();
          await reportModal.assertions.verifyModalClosed();

          await feedPage.assertions.verifyToastMessageIsVisibleWithText(reportToastMessage);
        };

        // Phase 2: Home Dashboard Scenario
        await test.step('Home Dashboard: End User 1 creates inappropriate post', async () => {
          await createHomeDashboardPost(standardUserFixture, inappropriatePostText);
        });

        await test.step('Home Dashboard: End User 2 reports the post', async () => {
          await siteManagerFixture.homePage.loadPage();
          await siteManagerFixture.homePage.verifyThePageIsLoaded();
          await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
          const feedPage = new FeedPage(siteManagerFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Scroll to find the post (may need to scroll down)
          await feedPage.assertions.waitForPostToBeVisible(inappropriatePostText);
          await reportPost(siteManagerFixture, inappropriatePostText, reportReason, feedPage);
        });

        await test.step('Home Dashboard: Admin views reported post in moderation queue', async () => {
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.actions.clickQueuesTab();
          await moderationQueuePage.assertions.verifyPostInQueue(inappropriatePostText);
          await moderationQueuePage.actions.dismissPost(inappropriatePostText);
        });

        // Phase 3: Site Dashboard Scenario
        await test.step('Site Dashboard: End User 1 creates inappropriate post', async () => {
          await createSiteDashboardPost(standardUserFixture, publicSiteId, inappropriatePostText);
        });

        await test.step('Site Dashboard: End User 2 reports the post', async () => {
          const siteDashboard = new SiteDashboardPage(siteManagerFixture.page, publicSiteId);
          await siteDashboard.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
          await siteDashboard.verifyThePageIsLoaded();
          await siteDashboard.actions.clickOnFeedLink();

          await siteDashboard.assertions.validatePostText(inappropriatePostText);
          await reportPost(
            siteManagerFixture,
            inappropriatePostText,
            reportReason,
            new FeedPage(siteManagerFixture.page)
          );
        });

        await test.step('Site Dashboard: Admin views reported post in moderation queue', async () => {
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.actions.clickQueuesTab();
          await moderationQueuePage.assertions.verifyPostInQueue(inappropriatePostText);
          await moderationQueuePage.actions.removePost(inappropriatePostText);
        });

        // Phase 4: Content Detail Page Scenario
        await test.step('Content Detail Page: End User 1 creates inappropriate comment and reply', async () => {
          await createContentPageComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText
          );
          await addReplyToComment(
            standardUserFixture,
            publicSiteId,
            pageContent.contentId,
            inappropriatePostText,
            `Reply to ${inappropriatePostText}`
          );
        });

        await test.step('Content Detail Page: End User 2 reports comment and reply', async () => {
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
            inappropriatePostText,
            reportReason,
            new FeedPage(siteManagerFixture.page)
          );

          // Report reply
          const replyText = `Reply to ${inappropriatePostText}`;
          await reportReply(siteManagerFixture, replyText, reportReason, new FeedPage(siteManagerFixture.page));
        });

        await test.step('Content Detail Page: Admin views reported comment and reply in moderation queue', async () => {
          const moderationQueuePage = await appManagerFixture.navigationHelper.navigateToContentModerationQueue();
          await moderationQueuePage.actions.clickQueuesTab();
          await moderationQueuePage.assertions.verifyCommentInQueue(inappropriatePostText);
          await moderationQueuePage.assertions.verifyCommentInQueue(`Reply to ${inappropriatePostText}`);
          await moderationQueuePage.actions.removeComment(`Reply to ${inappropriatePostText}`);
          await moderationQueuePage.actions.dismissComment(inappropriatePostText);
        });
      }
    );
  }
);
