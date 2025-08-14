import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FeaturedSitePage } from '@/src/modules/content/pages/featuredSitePage';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  '@featured-sites',
  {
    tag: [ContentTestSuite.FEATURED_SITES],
  },
  () => {
    let featuredSitePage: FeaturedSitePage;
    let homePage: NewUxHomePage;
    let siteHelper: SiteManagementHelper;
    let createdSite: any;

    test.beforeEach(
      `Setting up the test environment for featured site by creating new site`,
      async ({ page, loginAs, appManagerApiClient }) => {
        // Initialize SiteManagementHelper
        siteHelper = new SiteManagementHelper(appManagerApiClient);

        // Login as app manager using loginAs
        await loginAs('appManager');

        // Get category and create site using helper
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteHelper.createPublicSite(undefined, category, {
          access: SITE_TEST_DATA[0].siteType,
        });

        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

        // Initialize the home page and featured site page
        homePage = new NewUxHomePage(page);
        await homePage.verifyThePageIsLoaded();
        featuredSitePage = new FeaturedSitePage(page);
      }
    );

    test.afterEach(`Tearing down the test environment for featured site`, async () => {
      // Clean up all sites created by the helper
      if (siteHelper) {
        await siteHelper.cleanup();
      }
    });

    test(
      'Verify navigation menu of featured site and add site to featured',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Test featured sites navigation from home dashboard to site dashboard',
          zephyrTestId: 'CONT-20911',
          storyId: 'CONT-20911',
        });

        // Step 1: Navigate to Sites > Featured tab
        await featuredSitePage.actions.navigateToFeaturedSitesTab(homePage);

        // Step 2: Search and add the created site to featured
        await featuredSitePage.actions.addSiteToFeatured(createdSite.siteName);

        // Step 2.1: Verify success toast message appears
        await featuredSitePage.assertions.verifyToastMessage('Added featured site');

        // Step 3: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSite.siteName]);

        // Step 4: Navigate to Home
        await featuredSitePage.actions.navigateToHomePage(homePage, [createdSite.siteName]);

        // Step 5: Navigate to Featured tab
        await featuredSitePage.actions.navigateToFeaturedSitesTab(homePage);

        // Step 6: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSite.siteName]);

        // Step 7: Click on the featured site and verify navigation to site dashboard
        await featuredSitePage.actions.navigateToSiteDashboard(createdSite.siteName);

        // Step 8: Verify user is navigated to the site dashboard
        await featuredSitePage.assertions.verifySiteDashboardLoaded(createdSite.siteName);
      }
    );
  }
);
