import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  '@featured-sites',
  {
    tag: [ContentTestSuite.FEATURED_SITES],
  },
  () => {
    let createdSite: any;

    test.beforeEach(
      `Setting up the test environment for featured site by creating new site`,
      async ({ appManagerApiClient, siteManagementHelper }) => {
        // Get category and create site using helper
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite({
          category,
          overrides: { access: SITE_TEST_DATA[0].siteType },
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);
      }
    );

    test(
      'Verify user can navigate to featured sites page from side nav bar and add site to featured',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Test featured sites navigation from home dashboard to site dashboard',
          zephyrTestId: 'CONT-20911',
          storyId: 'CONT-20911',
        });

        const featuredSitePage = await appManagerHomePage.clickOnFeaturedSitesTab();

        // Step 1: Search and add the created site to featured
        await featuredSitePage.actions.addSiteToFeatured(createdSite.siteName);

        // Step 2.1: Verify success toast message appears
        await featuredSitePage.assertions.verifyToastMessage('Added featured site');

        // Step 3: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSite.siteName]);

        // Step 4: Reload the page after adding site to featured
        await featuredSitePage.loadPage();

        // Step 5: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSite.siteName]);

        // Step 6: Click on the featured site and verify navigation to site dashboard
        await featuredSitePage.actions.navigateToSiteDashboard(createdSite.siteName);

        // Step 7: Verify user is navigated to the site dashboard
        await featuredSitePage.assertions.verifySiteDashboardLoaded(createdSite.siteName);
      }
    );
  }
);
