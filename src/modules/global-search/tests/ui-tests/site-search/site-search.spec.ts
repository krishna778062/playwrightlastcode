import { test } from '@playwright/test';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/tests/test-data/site-search.test-data';
import { SiteSearchTestData } from '@/src/modules/global-search/types/site-search.type';
import { GlobalSearchTestHelper } from '@/src/modules/global-search/helpers/globalSearchTestHelper';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '../../../../../core/helpers/loginHelper';
import { getEnvConfig } from '../../../../../core/utils/getEnvConfig';
import { GlobalSearchBarComponent } from '../../../components/globalSearchBarComponent';

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
    let globalSearchComponent: GlobalSearchBarComponent;
    test.beforeEach(`Setting up the test environment for site search`, async ({ page }) => {
      const homePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await homePage.verifyThePageIsLoaded();
      globalSearchComponent = homePage.getGlobalSearchComponent();
    });

    test.afterEach(async () => {
      // await globalSearchTestHelper.cleanup();
    });

    for (const data of siteSearchTestData) {
      test(
        `Verify Site Search results for ${data.siteType} site "${data.term}" in category "${data.category}"`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async () => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12408',
          });

          // type the search term in search bar
          await globalSearchComponent.inputTermInSearchBar(data.term, {
            stepInfo: `Searching for site "${data.term}"`,
          });

          // clicking on search button
          const globalSearchPage = await globalSearchComponent.clickSearchButton({
            stepInfo: 'clicking on search button',
          });

          // Verify search results
          await globalSearchPage.verifyResultIsDisplayed(data.term, {
            stepInfo: `Verifying site "${data.term}" is displayed in results`,
          });

          // Verify site-specific behaviors
          if (data.siteType === SITE_SEARCH_TEST_DATA.SITE_TYPES.PRIVATE) {
            await globalSearchComponent.verifyLockIconIsDisplayed(data.term, data.siteType, {
              stepInfo: `Verifying lock icon is displayed for private site "${data.term}"`,
            });
          } else if (data.siteType === SITE_SEARCH_TEST_DATA.SITE_TYPES.PUBLIC) {
            await globalSearchComponent.verifyLockIconIsDisplayed(data.term, data.siteType, {
              stepInfo: `Verifying lock icon is NOT displayed for public site "${data.term}"`,
            });
          }

          // Verify site label
          await globalSearchComponent.verifySiteLabelIsDisplayed(data.term, {
            stepInfo: `Verifying site label is displayed for "${data.term}"`,
          });
        }
      );
    }
  }
);
