import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SiteListComponent } from '@/src/modules/global-search/components/siteListComponent';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/site-search.test-data';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

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

      test.beforeEach(
        `Setting up the test environment for site search by creating new site`,
        async ({ appManagerApiClient, siteManagementHelper }) => {
          // Initialize API client with proper authentication and CSRF token
          categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);

          let created;
          // Create site based on type
          if (testData.siteType === SITE_TYPES.PRIVATE) {
            created = await siteManagementHelper.createPrivateSite(undefined, categoryObj);
          } else {
            created = await siteManagementHelper.createPublicSite(undefined, categoryObj);
          }

          newSiteId = created.siteId;
          newSiteName = created.siteName;
          console.log(`Created site: ${newSiteName} with ID: ${newSiteId}`);
        }
      );
      test.afterEach(`Tearing down the test environment for site search`, async ({ siteManagementHelper }) => {
        await siteManagementHelper.cleanup();
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
