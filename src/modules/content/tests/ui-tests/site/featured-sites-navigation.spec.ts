import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { EnterpriseSearchHelper } from '@core/helpers/enterpriseSearchHelper';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FeaturedSitePage } from '@/src/modules/content/pages/featuredSitePage';
import { FEATURED_SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  '@featured-sites',
  {
    tag: [ContentTestSuite.FEATURED_SITES],
  },
  () => {
    let featuredSitePage: FeaturedSitePage;
    let homePage: NewUxHomePage;
    let createdSiteId: string = '';
    let createdSiteName: string = '';
    let categoryObj: { categoryId: string; name: string };

    test.beforeEach(
      `Setting up the test environment for featured site by creating new site`,
      async ({ appManagerHomePage, appManagerApiClient }) => {
        // Initialize API client with proper authentication and CSRF token
        const randomNum = Math.floor(Math.random() * 1000000 + 1);
        createdSiteName = `AutomateUI_Test_${randomNum}`;
        categoryObj = await appManagerApiClient
          .getSiteManagementService()
          .getCategoryId(FEATURED_SITE_TEST_DATA[0].category);
        const result = await appManagerApiClient.getSiteManagementService().addNewSite({
          access: FEATURED_SITE_TEST_DATA[0].siteType,
          name: createdSiteName,
          category: {
            categoryId: categoryObj.categoryId,
            name: categoryObj.name,
          },
        });
        createdSiteId = result.siteId;
        console.log(`Created site: ${createdSiteName} with ID: ${createdSiteId}`);

        //wait until the search api starts showing the newly created site in results
        await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
          appManagerApiClient,
          createdSiteName,
          createdSiteName,
          'site'
        );

        // Initialize the home page and featured site page
        homePage = new NewUxHomePage(appManagerHomePage.page);
        featuredSitePage = new FeaturedSitePage(appManagerHomePage.page);
      }
    );

    test.afterEach(`Tearing down the test environment for featured site`, async ({ appManagerApiClient }) => {
      // Clean up site (if it was created)
      if (createdSiteId) {
        try {
          await appManagerApiClient.getSiteManagementService().deactivateSite(createdSiteId);
          console.log(`Successfully deactivated site: ${createdSiteId}`);
        } catch (error) {
          console.warn(`Failed to deactivate site ${createdSiteId}:`, error);
        }
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
        await featuredSitePage.actions.addSiteToFeatured(createdSiteName);

        // Step 2.1: Verify success toast message appears
        await featuredSitePage.assertions.verifyToastMessage('Added featured site');

        // Step 3: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSiteName]);

        // Step 4: Navigate to Home
        await featuredSitePage.actions.navigateToHomePage(homePage, [createdSiteName]);

        // Step 5: Navigate to Featured tab
        await featuredSitePage.actions.navigateToFeaturedSitesTab(homePage);

        // Step 6: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSiteName]);

        // Step 7: Click on the featured site and verify navigation to site dashboard
        await featuredSitePage.actions.navigateToSiteDashboard(createdSiteName);

        // Step 8: Verify user is navigated to the site dashboard
        await featuredSitePage.assertions.verifySiteDashboardLoaded(createdSiteName);
      }
    );
  }
);
