import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '../../../constants/testSuite';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/site-search.test-data';
import { TestGroupType } from '@core/constants/testType';
import { HomePage } from '@/src/core/pages/homePage';
import { SiteListComponent } from '@/src/modules/global-search/components/siteListComponent';

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

    for (const testData of SITE_SEARCH_TEST_DATA) {
      test(
        `Verify Site Search results for a new ${testData.siteType} site in category "${testData.category}"`,
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
          const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);
          const result = await appManagerApiClient.getSiteManagementService().addNewSite({
            access: testData.siteType,
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
            await globalSearchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(newSiteName);
          await siteResultItem.verifyNameIsDisplayed(newSiteName);
          await siteResultItem.verifyLabelIsDisplayed(testData.label);
          await siteResultItem.verifyThumbnailIsDisplayed();
          await siteResultItem.verifyLockIconVisibility(testData.siteType);
          await siteResultItem.verifyNavigationWithCategoryLink(categoryObj.categoryId);
          await siteResultItem.hoverOverCardAndCopyLink();
          await siteResultItem.verifyCopiedURL(newSiteId);
          await siteResultItem.goBackToPreviousPage();
          await siteResultItem.verifyNavigationWithThumbnailLink(newSiteId);
          await siteResultItem.goBackToPreviousPage();
          await siteResultItem.verifyNavigationWithHomePageLink();
          await siteResultItem.goBackToPreviousPage();
          await siteResultItem.goBackToPreviousPage();
        }
      );
    }
  }
);
