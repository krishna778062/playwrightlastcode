import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ResultListingComponent } from '@/src/modules/global-search/components/resultsListComponent';
import { SiteListComponent } from '@/src/modules/global-search/components/siteListComponent';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/site-search.test-data';

for (const testData of SITE_SEARCH_TEST_DATA) {
  test.describe(
    `Global Search - Site Search`,
    {
      tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.SITE_SEARCH],
    },
    () => {
      let newSiteId: string;
      let newSiteName: string;
      let categoryObj: { categoryId: string; name: string };

      test.beforeAll(
        `Setting up the test environment for site search by creating new site of type ${testData.siteType}`,
        async ({ appManagerApiClient, publicSite, siteManagementHelper }) => {
          if (testData.siteType === SITE_TYPES.PUBLIC) {
            // Use the shared public site for PUBLIC site tests
            newSiteId = publicSite.siteId;
            newSiteName = publicSite.siteName;
            categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);
            console.log(`Using shared site: ${newSiteName} with ID: ${newSiteId}`);
          } else {
            // Create individual sites for PRIVATE/UNLISTED tests using SiteManagementHelper
            categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);

            const createdSiteDetails = await siteManagementHelper.createSite({
              accessType: testData.siteType,
              category: {
                categoryId: categoryObj.categoryId,
                name: categoryObj.name,
              },
              waitForSearchIndex: true,
            });
            newSiteId = createdSiteDetails.siteId;
            newSiteName = createdSiteDetails.siteName;
            console.log(`Created site: ${newSiteName} with ID: ${newSiteId} for both tests using SiteManagementHelper`);
          }
        }
      );

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

      test(
        `Verify Site Search results with sidebar filter for a ${testData.siteType} site in category "${testData.category}"`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19193',
          });

          // First perform the search to get to the results page
          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(newSiteName, {
            stepInfo: `Searching with term "${newSiteName}" to verify site appears in search results`,
          });

          // Verify the site appears in the initial search results
          const siteResult = await globalSearchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(newSiteName);
          const siteResultItem = new SiteListComponent(siteResult.page, siteResult.rootLocator);
          await siteResultItem.verifyNameIsDisplayed(newSiteName);

          // Click on the site filter in the sidebar to filter results by sites only
          await globalSearchResultPage.verifyAndClickSidebarFilter({ filterText: 'sites' });

          // Verify all the same properties are still displayed after filtering
          await siteResultItem.verifyNameIsDisplayed(newSiteName);
          await siteResultItem.verifyLabelIsDisplayed(testData.label);
          await siteResultItem.verifyThumbnailIsDisplayed();
          await siteResultItem.verifySiteIconIsDisplayed();
          await siteResultItem.verifyLockIconVisibility(testData.siteType);

          // Verify navigation to site by clicking on the title link
          await siteResultItem.verifyNavigationToTitleLink(newSiteId, newSiteName, 'Site');
        }
      );

      test(
        `Verify Site Autocomplete functionality for a ${testData.siteType} site"`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19285',
          });

          // Type in search input
          await appManagerHomePage.topNavBarComponent.typeInSearchBarInput(newSiteName, {
            stepInfo: `Typing "${newSiteName}" in search input`,
          });

          // Wait for autocomplete to appear first
          const resultList = new ResultListingComponent(appManagerHomePage.page);
          await resultList.waitForAndVerifyAutocompleteListIsDisplayed();

          // Then get specific autocomplete item
          const siteResult = resultList.getAutocompleteItemByName(newSiteName);
          await siteResult.verifyAutocompleteItemData(newSiteName, testData.label, testData.siteType);

          // Click on the autocomplete item and verify navigation
          await siteResult.verifyAutocompleteNavigationToTitleLink(newSiteId, newSiteName, testData.siteType);
        }
      );
    }
  );
}
