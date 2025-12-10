import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { GovernanceScreenPage } from '@content/ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '@content/ui/pages/manageApplicationPage';
import { ManageFeaturesPage } from '@content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { ManageSiteSetUpPage } from '@content/ui/pages/manageSiteSetUpPage';
import { SiteDetailsPage } from '@content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { SitesPage } from '@content/ui/pages/sitesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { ContentPostingPermission } from '@/src/modules/content/constants/contentStatus';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';

test.describe(
  'site Settings',
  {
    tag: [ContentTestSuite.SITE_APP_MANAGER, ContentSuiteTags.ENABLE_DISABLE_CONTENT_SUBMISSIONS],
  },
  () => {
    let manageFeaturesPage: ManageFeaturesPage;
    let manageSiteSetUpPage: ManageSiteSetUpPage;
    let applicationscreen: ApplicationScreenPage;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;
    let sideNavBarComponent: SideNavBarComponent;
    let standardUserSiteDashboardPage, siteDashboardPage: SiteDashboardPage;
    let standardUserSitesPage: SitesPage;
    let siteDetailsPage: SiteDetailsPage;

    test.beforeEach('Setting up the test environment', async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, '');
      applicationscreen = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      sideNavBarComponent = new SideNavBarComponent(appManagerFixture.page);
      standardUserSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      standardUserSitesPage = new SitesPage(appManagerFixture.page, '');
      siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');
    });

    test(
      `to Verify enabling and disabling content submissions manage application governance page`,
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.REGRESSION,
          ContentSuiteTags.ENABLE_DISABLE_CONTENT_SUBMISSIONS,
        ],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To Verify enabling and disabling content submissions manage application governance page',
          zephyrTestId: 'CONT-23553',
          storyId: 'CONT-23553',
        });
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationscreen.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.disableContentSubmissions('Saved changes successfully');
        await sideNavBarComponent.verifyingCreateButtonIsVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        await manageSiteSetUpPage.actions.clickOnSite();
        await siteDetailsPage.actions.ViewSite();
        await siteDashboardPage.assertions.verifyAddContentButtonIsVisible();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        const standardUserSitesPage = new SitesPage(standardUserFixture.page, '');
        const standardUserSideNavBarComponent = new SideNavBarComponent(standardUserFixture.page);
        await standardUserSideNavBarComponent.clickOnSites();
        await standardUserSitesPage.actions.clickOnFollowingTab();
        await standardUserSitesPage.actions.openSiteFromFollowingTab();
        const standardUserSiteDashboardPage = new SiteDashboardPage(standardUserFixture.page, '');
        await standardUserSiteDashboardPage.assertions.verifyAddContentButtonIsNotVisible();
        await standardUserSiteDashboardPage.actions.clickOnDismissButton();
        await standardUserSideNavBarComponent.clickOnSites();
        await standardUserSitesPage.actions.clickOnMemberTab();
        await standardUserSitesPage.actions.openSiteFromMemberTab();
        await standardUserSiteDashboardPage.assertions.verifyAddContentButtonIsNotVisible();
        await standardUserSideNavBarComponent.clickOnSites();
        await standardUserSitesPage.actions.clickOnMySitesTab();
        await standardUserSitesPage.actions.openSiteFromMySitesTab();
        await standardUserSiteDashboardPage.assertions.verifyAddContentButtonIsVisible();
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationscreen.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.enableContentSubmissions('Saved changes successfully');
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        await manageSiteSetUpPage.actions.clickOnSite();
        await siteDetailsPage.actions.ViewSite();
        await siteDashboardPage.assertions.verifyAddContentButtonIsVisible();
        await standardUserSideNavBarComponent.clickOnSites();
        await standardUserSitesPage.actions.clickOnFollowingTab();
        await standardUserSitesPage.actions.openSiteFromFollowingTab();
        await standardUserSiteDashboardPage.assertions.verifyAddContentButtonIsVisible();
        await standardUserSideNavBarComponent.clickOnSites();
        await standardUserSitesPage.actions.clickOnMemberTab();
        await standardUserSitesPage.actions.openSiteFromMemberTab();
        await standardUserSiteDashboardPage.assertions.verifyAddContentButtonIsVisible();
      }
    );

    test(
      'verify user is not able to view Comment option for Contents when Content posts setting is disabled on a site',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-24909'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify user is not able to view Comment option for Contents when Content posts setting is disabled on a site',
          zephyrTestId: 'CONT-24909',
          storyId: 'CONT-24909',
        });

        // Create a page and make a comment on it (as Admin)
        const siteDetails = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public', {
          waitForSearchIndex: false,
        });
        const siteId = siteDetails.siteId;

        const pageContent = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: { waitForSearchIndex: false },
        });
        const contentId = pageContent.contentId;

        // Add a comment to the content via API
        const commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        await appManagerApiFixture.feedManagementHelper.createFeed({
          scope: 'content',
          siteId,
          contentId,
          text: commentText,
          options: { waitForSearchIndex: false },
        });

        // Navigate to site setup page
        const manageSiteSetupPage = new ManageSitePage(appManagerFixture.page, siteId);
        await manageSiteSetupPage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
        await manageSiteSetupPage.clickDashboardAndFeedTab();

        // Disable Content posts
        await manageSiteSetupPage.actions.setContentPostsPermission(ContentPostingPermission.DISABLED);

        const contentPreviewPage = new ContentPreviewPage(standardUserFixture.page, siteId, contentId, 'page');
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page as EndUser' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Verify user is unable to view Comment option (Share your thoughts button)
        await contentPreviewPage.assertions.verifyCommentOptionIsNotVisible();

        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);

        await manageSiteSetupPage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
        await manageSiteSetupPage.clickDashboardAndFeedTab();

        // Disable Content posts
        await manageSiteSetupPage.actions.setContentPostsPermission(ContentPostingPermission.ENABLED);
      }
    );
  }
);
