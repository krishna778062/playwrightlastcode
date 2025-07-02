import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/tests/test-data/site-search.test-data';
import { SiteSearchTestData } from '@/src/modules/global-search/types/site-search.type';
import { TestGroupType } from '@core/constants/testType';
import { HomePage } from '@/src/core/pages/homePage';

// Test data for site search scenarios
const siteSearchTestData: SiteSearchTestData[] = [
  {
    siteType: SITE_SEARCH_TEST_DATA.SITE_TYPES.PUBLIC,
    category: SITE_SEARCH_TEST_DATA.CATEGORIES.CATEGORYNAME,
    label: SITE_SEARCH_TEST_DATA.LABELS.SITE,
  },
  {
    siteType: SITE_SEARCH_TEST_DATA.SITE_TYPES.PRIVATE,
    category: SITE_SEARCH_TEST_DATA.CATEGORIES.CATEGORYNAME,
    label: SITE_SEARCH_TEST_DATA.LABELS.SITE,
  },
];

test.describe(
  `Test Global Search - Site Search functionality`,
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.SITE_SEARCH],
  },
  () => {
    let newSiteId: string;
    let homePage: HomePage;
    test.beforeEach(
      `Setting up the test environment for site search`,
      async ({ appManagerUserPage, appManagerApiClient }) => {
        // Initialize API client with proper authentication and CSRF token
        homePage = new HomePage(appManagerUserPage);
        await homePage.verifyThePageIsLoaded();
      }
    );
    test.afterEach(`Tearing down the test environment for site search`, async ({ appManagerApiClient }) => {
      await appManagerApiClient.getSiteManagementService().deactivateSite(newSiteId);
    });

    for (const data of siteSearchTestData) {
      test(
        `Verify Site Search results for a new ${data.siteType} site in category "${data.category}"`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12305',
          });
          const randomNum = Math.floor(Math.random() * 1000000 + 1);
          const newSiteName = `AutomateUI_Test_${randomNum}`;
          const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(data.category);
          const result = await appManagerApiClient.getSiteManagementService().addNewSite({
            name: newSiteName,
            category: {
              categoryId: categoryObj.categoryId,
              name: categoryObj.name,
            },
          });
          newSiteId = result.siteId;
          console.log(`Created site: ${newSiteName} with ID: ${newSiteId}`);

          const globalSearchResultPage = await homePage.actions.searchForTerm(newSiteName, {
            stepInfo: `Searching with term "${newSiteName} and intent is to find the site"`,
          });

          //get the site result item
          const siteResultItem =
            await globalSearchResultPage.actions.getSiteResultItemExactlyMatchingTheSearchTerm(newSiteName);

          await globalSearchResultPage.assertions.verifySiteResultItemDataPoints(siteResultItem, {
            siteName: newSiteName,
            siteType: data.siteType,
            category: data.category,
            label: data.label,
            description: '',
          });

          await globalSearchResultPage.assertions.verifyAllNavigationLinksAreWorkingInSiteResultItem(
            siteResultItem,
            newSiteId
          );
        }
      );
    }
  }
);
