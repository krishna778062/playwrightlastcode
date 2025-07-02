import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/siteSearchFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/tests/test-data/site-search.test-data';
import { SiteSearchTestData } from '@/src/modules/global-search/types/site-search.type';
import { TestGroupType } from '@core/constants/testType';
import { HomePage } from '@core/pages/homePage';

// Test data for site search scenarios
const siteSearchTestData: SiteSearchTestData[] = [
  {
    siteType: SITE_SEARCH_TEST_DATA.SITE_TYPES.PUBLIC,
    term: SITE_SEARCH_TEST_DATA.SEARCH_TERMS.SALES,
    category: SITE_SEARCH_TEST_DATA.CATEGORIES.DEPARTMENTS,
  },
  {
    siteType: SITE_SEARCH_TEST_DATA.SITE_TYPES.PRIVATE,
    term: SITE_SEARCH_TEST_DATA.SEARCH_TERMS.FINANCE,
    category: SITE_SEARCH_TEST_DATA.CATEGORIES.DEPARTMENTS,
  },
];

test.describe(
  `Test Global Search - Site Search functionality`,
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.SITE_SEARCH],
  },
  () => {
    for (const data of siteSearchTestData) {
      test(
        `Verify Site Search results for ${data.siteType} site "${data.term}" in category "${data.category}"`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerApiClient, appManagerUserPage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12408',
          });
          const homePage = new HomePage(appManagerUserPage);
          const globalSearchResultPage = await homePage.actions.searchForTerm(data.term, {
            stepInfo: `Searching for site "${data.term}"`,
          });
          await globalSearchResultPage.verifyThePageIsLoaded();
          await globalSearchResultPage.assertions.verifyResultIsDisplayed(data.term, {
            stepInfo: `Verifying site "${data.term}" is displayed in results`,
          });
          // Verify search results

          // Verify site-specific behaviors
          if (data.siteType === SITE_SEARCH_TEST_DATA.SITE_TYPES.PRIVATE) {
            await globalSearchResultPage.assertions.verifyLockIconIsDisplayed(data.term, data.siteType, {
              stepInfo: `Verifying lock icon is displayed for private site "${data.term}"`,
            });
          } else if (data.siteType === SITE_SEARCH_TEST_DATA.SITE_TYPES.PUBLIC) {
            await globalSearchResultPage.assertions.verifyLockIconIsDisplayed(data.term, data.siteType, {
              stepInfo: `Verifying lock icon is NOT displayed for public site "${data.term}"`,
            });
          }
          // Verify site label
          await globalSearchResultPage.assertions.verifySiteLabelIsDisplayed(data.term, {
            stepInfo: `Verifying site label is displayed for "${data.term}"`,
          });
        }
      );
    }
  }
);
