import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { EnterpriseSearchHelper } from '@core/helpers/enterpriseSearchHelper';
import { tagTest } from '@core/utils/testDecorator';

import { SiteListComponent } from '@/src/modules/global-search/components/siteListComponent';
import { SEARCH_RESULT_ITEM } from '@/src/modules/global-search/constants/siteTypes';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/site-search.test-data';

for (const testData of SITE_SEARCH_TEST_DATA) {
  test.describe(
    `Global Search - Site Search`,
    {
      tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.SITE_SEARCH],
    },
    () => {
      let newSiteId: string;
      let newSiteName: string;
      let categoryObj: { categoryId: string; name: string };

      test.beforeEach(
        `Setting up the test environment for site search by creating new site`,
        async ({ appManagerApiClient }) => {
          // Initialize API client with proper authentication and CSRF token
          const randomNum = Math.floor(Math.random() * 1000000 + 1);
          newSiteName = `AutomateUI_Test_${randomNum}`;
          categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);
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
          //wait until the search api starts showing the newly created site in results
          await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
            appManagerApiClient,
            newSiteName,
            newSiteName,
            SEARCH_RESULT_ITEM.SITE
          );
        }
      );
      test.afterEach(`Tearing down the test environment for site search`, async ({ appManagerApiClient }) => {
        // Clean up site (if it was created)
        if (newSiteId) {
          try {
            await appManagerApiClient.getSiteManagementService().deactivateSite(newSiteId);
            console.log(`Successfully deactivated site: ${newSiteId}`);
          } catch (error) {
            console.warn(`Failed to deactivate site ${newSiteId}:`, error);
          }
        }
      });

      test(
        `Verify Site Search results for a new ${testData.siteType} site in category "${testData.category}"`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12305',
          });

          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(newSiteName, {
            stepInfo: `Searching with term "${newSiteName} and intent is to find the site"`,
          });

          //get the site result item
          const siteResult = await globalSearchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(newSiteName);
          const siteResultItem = new SiteListComponent(siteResult.page, siteResult.rootLocator);

          //verifying site results
          await siteResultItem.verifyNameIsDisplayed(newSiteName);
          await siteResultItem.verifyLabelIsDisplayed(testData.label);
          await siteResultItem.verifyThumbnailIsDisplayed();
          await siteResultItem.verifySiteIconIsDisplayed();
          await siteResultItem.verifyLockIconVisibility(testData.siteType);
          await siteResultItem.verifyNavigationWithCategoryLink(categoryObj.categoryId);
          await siteResultItem.goBackToPreviousPage();
          await siteResultItem.hoverOverCardAndCopyLink();
          await siteResultItem.verifyCopiedURL(newSiteId);
          await siteResultItem.goBackToPreviousPage();
          await siteResultItem.verifyNavigationWithThumbnailLink(newSiteId);
          await siteResultItem.goBackToPreviousPage();
          await siteResultItem.verifyNavigationWithHomePageLink();
          await siteResultItem.goBackToPreviousPage();
        }
      );
    }
  );
}
