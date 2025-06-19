import { test } from '@playwright/test';
import { GlobalSearchTestHelper } from '@global-search/helpers/globalSearchTestHelper';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '@global-search/constants/testSuite';
import { SITE_SEARCH_TEST_DATA } from '@global-search/tests/test-data/site-search.test-data';
import { SiteSearchTestData } from '@global-search/types/site-search.type';
import { loadEnvVariables } from '@core/utils/envLoader';
import { Environments } from '@core/constants/environments';
import { TestGroupType } from '@core/constants/testType';

// Load environment variables dynamically based on TEST_ENV
const currentEnv = (process.env.TEST_ENV as Environments) || Environments.TEST;
console.log('Current environment:', currentEnv);

// Load environment variables
loadEnvVariables(currentEnv);

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
  `Test Global Search - Site Search functionality - Environment: ${currentEnv.toUpperCase()}`,
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.SITE_SEARCH],
  },
  () => {
    test.describe.configure({
      timeout: SITE_SEARCH_TEST_DATA.CONFIG.DEFAULT_TIMEOUT,
      mode: 'default',
    });
    let globalSearchTestHelper: GlobalSearchTestHelper;

    test.beforeEach(
      `Setting up the test environment for site search - Environment: ${currentEnv.toUpperCase()}`,
      async ({ browser }) => {
        globalSearchTestHelper = new GlobalSearchTestHelper();
        await globalSearchTestHelper.setup(browser);
        await globalSearchTestHelper.loginAsWorkplaceAdmin();
      }
    );

    test.afterEach(async () => {
      await globalSearchTestHelper.cleanup();
    });

    for (const data of siteSearchTestData) {
      test(
        `Verify Site Search results for ${data.siteType} site "${data.term}" in category "${data.category}" - Environment: ${currentEnv.toUpperCase()}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async () => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12408',
          });

          const globalSearchPage = globalSearchTestHelper.getGlobalSearchPage();
          const globalSearchComponent = globalSearchPage.getGlobalSearchComponent();

          globalSearchPage.verifyThePageIsLoaded();

          // type the search term in search bar
          await globalSearchComponent.InputTermInSearchBar(data.term, {
            stepInfo: `Searching for site "${data.term}"`,
          });

          // clicking on search button
          await globalSearchComponent.clickSearchButton({ stepInfo: 'clicking on search button' });

          // Verify search results
          await globalSearchComponent.verifyResultIsDisplayed(data.term, {
            stepInfo: `Verifying site "${data.term}" is displayed in results`,
          });

          // Verify site-specific behaviors
          if (data.siteType === SITE_SEARCH_TEST_DATA.SITE_TYPES.PRIVATE) {
            await globalSearchComponent.verifyLockIconIsDisplayed(data.term, data.siteType, {
              stepInfo: `Verifying lock icon is displayed for private site "${data.term}"`,
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
