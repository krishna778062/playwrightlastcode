import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { GovernanceScreenPage } from '@content/ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '@content/ui/pages/manageApplicationPage';
import { ManageFeaturesPage } from '@content/ui/pages/manageFeaturesPage';
import { ManageSiteSetUpPage } from '@content/ui/pages/manageSiteSetUpPage';
import { SiteDetailsPage } from '@content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { SitesPage } from '@content/ui/pages/sitesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
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
  }
);
