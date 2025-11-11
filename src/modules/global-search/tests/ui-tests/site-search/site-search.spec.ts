import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/site-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';
import { SiteListComponent } from '@/src/modules/global-search/ui/components/siteListComponent';

for (const testData of SITE_SEARCH_TEST_DATA) {
  test.describe(
    `global Search - Site Search`,
    {
      tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.SITE_SEARCH],
    },
    () => {
      let newSiteId: string;
      let newSiteName: string;
      let categoryObj: { categoryId: string; name: string };

      test.beforeEach(
        `Setting up the test environment for site search by creating new site of type ${testData.siteType}`,
        async ({ publicSite, siteManagementHelper }) => {
          if (testData.siteType === SITE_TYPES.PUBLIC) {
            // Use the shared public site for PUBLIC site tests
            newSiteId = publicSite.siteId;
            newSiteName = publicSite.siteName;
            categoryObj = await siteManagementHelper.siteManagementService.getCategoryId(testData.category);
            console.log(`Using shared site: ${newSiteName} with ID: ${newSiteId}`);
          } else {
            // Create individual sites for PRIVATE/UNLISTED tests using SiteManagementHelper
            categoryObj = await siteManagementHelper.siteManagementService.getCategoryId(testData.category);

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
          tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12305',
          });

          const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(newSiteName, {
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
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19193',
          });

          // First perform the search to get to the results page
          const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(newSiteName, {
            stepInfo: `Searching with term "${newSiteName}" to verify site appears in search results`,
          });

          // Dismiss any survey popup that might appear
          await globalSearchResultPage.dismissSurveyPopupIfPresent();

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
        `Verify Site Autocomplete functionality for a ${testData.siteType} site`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19285',
          });

          // Type in search input
          const topNavBarComponent = appManagerFixture.navigationHelper.topNavBarComponent;
          await topNavBarComponent.typeInSearchBarInput(newSiteName, {
            stepInfo: `Typing "${newSiteName}" in search input`,
          });

          // Wait for autocomplete to appear first
          const resultList = new ResultListingComponent(appManagerFixture.page);
          await resultList.waitForAndVerifyAutocompleteListIsDisplayed(
            topNavBarComponent.globalSearchInputBox,
            newSiteName
          );

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

test.describe(
  `global Search - Site Search - Exact Match`,
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.SITE_SEARCH],
  },
  () => {
    let newSiteId: string;
    let newSiteName: string;

    test.beforeEach(
      `Setting up the test environment for exact match test by using shared public site`,
      async ({ publicSite }) => {
        newSiteId = publicSite.siteId;
        newSiteName = publicSite.siteName;
        console.log(`Using shared site: ${newSiteName} with ID: ${newSiteId} for exact match test`);
      }
    );

    test(
      `verify exact match results UI`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-18434',
        });

        // First perform the search to get to the results page
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(newSiteName, {
          stepInfo: `Searching with term "${newSiteName}" to verify exact match functionality`,
        });

        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        await globalSearchResultPage.verifyExactMatchCheckboxIsVisible();

        await globalSearchResultPage.verifyExactMatchTitleTextIsDisplayed();

        await globalSearchResultPage.verifyExactMatchInfoIconIsVisible();

        await globalSearchResultPage.hoverOverExactMatchInfoIconAndVerifyTooltip(newSiteName);

        await globalSearchResultPage.clickExactMatchCheckbox();

        const siteResult = await globalSearchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(newSiteName);
        const siteResultItem = new SiteListComponent(siteResult.page, siteResult.rootLocator);
        await siteResultItem.verifyNameIsDisplayed(newSiteName);
      }
    );
  }
);
