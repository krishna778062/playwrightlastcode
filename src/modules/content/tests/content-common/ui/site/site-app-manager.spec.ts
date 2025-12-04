import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { GovernanceScreenPage } from '@content/ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '@content/ui/pages/manageApplicationPage';
import { ManageFeaturesPage } from '@content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { ManageSiteSetUpPage } from '@content/ui/pages/manageSiteSetUpPage';
import { SiteCreationPage as ContentSiteCreationPage, SiteCreationPage } from '@content/ui/pages/siteCreationPage';
import { SiteDetailsPage } from '@content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { SitesPage } from '@content/ui/pages/sitesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
/**
 * This test suite is used to test the site creation functionality with different access types.
 * We will test that App Manager is able to create sites with public, private, and unlisted access types.
 * The test is data-driven to avoid code duplication between different site types.
 */

const SITE_TEST_DATA = [
  {
    siteType: 'public',
    displayName: 'Public Site',
    zephyrTestId: 'CONT-10603',
    storyId: 'CONT-10603',
    description: 'Verify admin can create a public site',
  },
  {
    siteType: 'private',
    displayName: 'Private Site',
    zephyrTestId: 'CONT-10604',
    storyId: 'CONT-10604',
    description: 'Verify admin can create a private site',
  },
  {
    siteType: 'unlisted',
    displayName: 'Unlisted Site',
    zephyrTestId: 'CONT-10605',
    storyId: 'CONT-10605',
    description: 'Verify admin can create an unlisted site',
  },
] as const;

test.describe(
  'site Creation by Application Manager',
  { tag: [ContentTestSuite.SITE_APP_MANAGER, ContentSuiteTags.SITE_CREATION] },
  () => {
    let siteCreationPage: ContentSiteCreationPage;
    let createdSiteId: string;
    let createdSiteName: string;
    let manualCleanupNeeded = false;
    let manageFeaturesPage: ManageFeaturesPage;
    let manageSiteSetUpPage: ManageSiteSetUpPage;
    let manageSitePage: ManageSitePage;
    let applicationscreen: ApplicationScreenPage;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;
    let sideNavBarComponent: SideNavBarComponent;
    let standardUserSiteDashboardPage, siteDashboardPage: SiteDashboardPage;
    let standardUserSitesPage: SitesPage;
    let siteDetailsPage: SiteDetailsPage;
    test.beforeEach('Setting up the test environment for site creation', async ({ appManagerFixture }) => {
      // Create home page instance and verify it's loaded
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, '');
      manageSitePage = new ManageSitePage(appManagerFixture.page);
      applicationscreen = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      sideNavBarComponent = new SideNavBarComponent(appManagerFixture.page);
      standardUserSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      standardUserSitesPage = new SitesPage(appManagerFixture.page, '');
      siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');

      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach('Site Clean up', async ({ appManagerFixture }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && createdSiteId) {
        await appManagerFixture.siteManagementHelper.siteManagementService.deactivateSite(createdSiteId);
        console.log('Manual cleanup completed for site:', createdSiteId);
      } else {
        console.log('No site was created, hence skipping the deletion');
      }

      // Reset variables for next test
      manualCleanupNeeded = false;
      createdSiteId = '';
      createdSiteName = '';
    });

    for (const siteData of SITE_TEST_DATA) {
      test(
        `Verify admin can create a ${siteData.displayName.toLowerCase()}`,
        {
          tag: [
            TestPriority.P0,
            TestGroupType.SMOKE,
            TestGroupType.REGRESSION,
            ContentSuiteTags.SITE_CREATION,
            '@healthcheck',
          ],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            description: siteData.description,
            zephyrTestId: siteData.zephyrTestId,
            storyId: siteData.storyId,
          });

          siteCreationPage = (await appManagerFixture.navigationHelper.openSiteCreationForm(false)) as SiteCreationPage;

          // STEP 2: Generate site data using TestDataGenerator
          const siteCreationOptions = TestDataGenerator.generateSite(siteData.siteType);

          console.log(`INFO: Creating ${siteData.displayName} with options:`, siteCreationOptions);

          // STEP 3: Create and publish the site
          const { siteDashboard, siteId } = await siteCreationPage.actions.addSite(
            siteCreationOptions,
            appManagerFixture.siteManagementHelper
          );

          // Store IDs for cleanup
          createdSiteId = siteId;
          createdSiteName = siteCreationOptions.title || siteCreationOptions.name;
          manualCleanupNeeded = true;

          console.log(`INFO: ${siteData.displayName} created - Site ID: ${siteId}`);

          // STEP 4: Verify we're on the correct site dashboard page
          await siteDashboard.assertions.verifyDashboardUrl(createdSiteId);

          // STEP 5: Verify site name is displayed correctly
          await siteDashboard.verifySiteNameIs(siteCreationOptions.title || siteCreationOptions.name);
        }
      );
    }
    test(
      `to verify the deactivate option in manage site user drop down sites`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.SITE_DEACTIVATION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the deactivate option in manage site user drop down sites',
          zephyrTestId: 'CONT-26176',
          storyId: 'CONT-26176',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, {
          hasPages: true,
        });
        const siteId = siteInfo.siteId;
        const siteName = siteInfo.name;
        await appManagerFixture.siteManagementHelper.siteManagementService.deactivateSite(siteId);

        // Search for the deactivated site in the search bar
        await manageSiteSetUpPage.actions.searchForSite(siteName);
        await manageSitePage.assertions.verifyNoSitesFound(siteName);
        await appManagerFixture.siteManagementHelper.siteManagementService.activateSite(siteId);
      }
    );
    test(
      'in members tab Verify unlisted sites are non-searchable for end user being a non-site member',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-22692'],
      },
      async ({ appManagerApiFixture, standardUserApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'In members tab Verify unlisted sites are non-searchable for end user being a non-site member',
          zephyrTestId: 'CONT-22692',
          storyId: 'CONT-22692',
        });

        // Get list of unlisted sites for app manager
        const appManagerSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          filter: 'unlisted',
          size: 1000,
        });

        // Get list of unlisted sites for standard user
        const standardUserSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          filter: 'unlisted',
          size: 1000,
        });

        // Create a set of site IDs that standard user has access to
        const standardUserSiteIds = new Set(
          standardUserSitesResponse.result.listOfItems.map((site: any) => site.siteId)
        );

        // Find a site that app manager has access to but standard user doesn't
        const appManagerSiteInfo = appManagerSitesResponse.result.listOfItems.find(
          (site: any) => site.isActive === true && !standardUserSiteIds.has(site.siteId)
        );

        if (!appManagerSiteInfo) {
          throw new Error('No unlisted site found where app manager has access but standard user does not have access');
        }

        const appManagerSiteName = appManagerSiteInfo.name;
        console.log(
          `Found site: ${appManagerSiteName} (${appManagerSiteInfo.siteId}) - App manager has access, standard user does not`
        );

        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        const manageFeaturesPageForStandardUser = new ManageFeaturesPage(standardUserFixture.page);
        await manageFeaturesPageForStandardUser.actions.clickOnSitesCard();
        const manageSiteStandardUserSetUpPage = new ManageSiteSetUpPage(standardUserFixture.page, '');
        const manageSitePageForStandardUser = new ManageSitePage(standardUserFixture.page);
        await manageSiteStandardUserSetUpPage.actions.searchForSite(appManagerSiteName);
        await manageSitePageForStandardUser.assertions.verifyNoSitesFound(appManagerSiteName);
      }
    );
  }
);
