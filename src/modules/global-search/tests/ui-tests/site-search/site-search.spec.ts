import { test } from '@playwright/test';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/tests/test-data/site-search.test-data';
import { SiteSearchTestData } from '@/src/modules/global-search/types/site-search.type';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '../../../../../core/helpers/loginHelper';
import { getEnvConfig } from '../../../../../core/utils/getEnvConfig';
import { GlobalSearchBarComponent } from '../../../components/globalSearchBarComponent';
import { SearchResultsComponent } from '../../../components/searchResultsComponent';

// Test data for site search scenarios
const siteSearchTestData: SiteSearchTestData[] = [
  {
    siteType: SITE_SEARCH_TEST_DATA.SITE_TYPES.PUBLIC,
    term: SITE_SEARCH_TEST_DATA.SEARCH_TERMS.SALES,
    category: SITE_SEARCH_TEST_DATA.CATEGORIES.DEPARTMENTS,
    label: SITE_SEARCH_TEST_DATA.LABELS.SITE,
  },
  {
    siteType: SITE_SEARCH_TEST_DATA.SITE_TYPES.PRIVATE,
    term: SITE_SEARCH_TEST_DATA.SEARCH_TERMS.FINANCE,
    category: SITE_SEARCH_TEST_DATA.CATEGORIES.DEPARTMENTS,
    label: SITE_SEARCH_TEST_DATA.LABELS.SITE,
  },
];

test.describe(
  `Test Global Search - Site Search functionality`,
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.SITE_SEARCH],
  },
  () => {
    let globalSearchBarComponent: GlobalSearchBarComponent;
    test.beforeEach(`Setting up the test environment for site search`, async ({ page }) => {
      const homePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await homePage.verifyThePageIsLoaded();
      globalSearchBarComponent = homePage.getGlobalSearchComponent();
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
          await globalSearchBarComponent.inputTermInSearchBar(data.term, {
            stepInfo: `Searching for site "${data.term}"`,
          });

          // clicking on search button
          const globalSearchPage = await globalSearchBarComponent.clickSearchButton({
            stepInfo: 'clicking on search button',
          });

          // Verify search results
          await globalSearchPage.verifyResultIsDisplayed(data.term, {
            stepInfo: `Verifying site "${data.term}" is displayed in results`,
          });

          await globalSearchPage.getSearchResultsComponent().verifyCategoryIsDisplayed(data.term, data.category, {
            stepInfo: `Verifying category "${data.category}" is displayed for "${data.term}"`,
          });

          await globalSearchPage.getSearchResultsComponent().verifySiteLabelIsDisplayed(data.term, data.label, {
            stepInfo: `Verifying "${data.label} label is displayed for "${data.term}"`,
          });

          await globalSearchPage.getSearchResultsComponent().verifyThumbnailIsDisplayed(data.term, {
            stepInfo: `Verifying thumbnail is displayed for "${data.term}" `,
          });

          await globalSearchPage.getSearchResultsComponent().verifySiteIconIsDisplayed(data.term, {
            stepInfo: `Verifying site icon is displayed for "${data.term}" `,
          });

          await globalSearchPage.getSearchResultsComponent().clickOnCategory(data.term, data.category, {
            stepInfo: `Verifying clicking on category and navigated to "${data.category}" `,
          });

          await globalSearchPage.navigateBack({ stepInfo: 'Navigating back to previous page' });

          // Verify site-specific behaviors
          // if (data.siteType === SITE_SEARCH_TEST_DATA.SITE_TYPES.PRIVATE) {
          //   await globalSearchBarComponent.verifyLockIconIsDisplayed(data.term, data.siteType, {
          //     stepInfo: `Verifying lock icon is displayed for private site "${data.term}"`,
          //   });
          // } else if (data.siteType === SITE_SEARCH_TEST_DATA.SITE_TYPES.PUBLIC) {
          //   await globalSearchBarComponent.verifyLockIconIsDisplayed(data.term, data.siteType, {
          //     stepInfo: `Verifying lock icon is NOT displayed for public site "${data.term}"`,
          //   });
          // }

          // // Verify site label
        }
      );
    }
  }
);
