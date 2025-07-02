import { test, expect } from '@playwright/test';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { SITE_SEARCH_TEST_DATA } from '@/src/modules/global-search/tests/test-data/site-search.test-data';
import { SiteSearchTestData } from '@/src/modules/global-search/types/site-search.type';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '../../../../../core/helpers/loginHelper';
import { getEnvConfig } from '../../../../../core/utils/getEnvConfig';
import { GlobalSearchBarComponent } from '../../../components/globalSearchBarComponent';
import { BaseApiClient } from '../../../../../core/api/clients/baseApiClient';
import { AdminApiClient } from '../../../../../core/api/clients/adminApiClient';

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
    let globalSearchBarComponent: GlobalSearchBarComponent;
    let apiClient: BaseApiClient;
    let newSiteId: string;

    test.beforeEach(`Setting up the test environment for site search`, async ({ page, request }) => {
      const homePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });

      // Initialize API client with proper authentication and CSRF token
      try {
        const apiContext = await BaseApiClient.createFromCookies(page);
        apiClient = new AdminApiClient(apiContext, getEnvConfig().apiBaseUrl);
      } catch (error) {
        console.error('Failed to initialize API client:', error);
        throw error;
      }

      await homePage.verifyThePageIsLoaded();
      globalSearchBarComponent = homePage.getGlobalSearchComponent();
    });

    test.afterEach(async ({ page }) => {
      if (apiClient && newSiteId) {
        await apiClient.deactivateSite(newSiteId);
      }
    });

    for (const data of siteSearchTestData) {
      test(
        `Verify Site Search results for a new ${data.siteType} site in category "${data.category}"`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({}) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12305',
          });

          const result = await apiClient.createSite(data.siteType, data.category);
          const newSiteName = result.siteName;
          newSiteId = result.siteId;
          console.log(`Created site: ${newSiteName} with ID: ${result.siteId}`);

          // type the search term in search bar
          await globalSearchBarComponent.inputTermInSearchBar(newSiteName, {
            stepInfo: `Searching for site "${newSiteName}"`,
          });

          // clicking on search button
          const globalSearchPage = await globalSearchBarComponent.clickSearchButton({
            stepInfo: 'clicking on search button',
          });

          // Verify search results
          await globalSearchPage.verifyResultIsDisplayed(newSiteName, {
            stepInfo: `Verifying site "${newSiteName}" is displayed in results`,
          });
          // Verify search results

          await globalSearchPage.getSearchResultsComponent().verifyCategoryIsDisplayed(newSiteName, data.category, {
            stepInfo: `Verifying category "${data.category}" is displayed for "${newSiteName}"`,
          });

          await globalSearchPage.getSearchResultsComponent().verifySiteLabelIsDisplayed(newSiteName, data.label, {
            stepInfo: `Verifying "${data.label}" label is displayed for "${newSiteName}"`,
          });

          await globalSearchPage.getSearchResultsComponent().verifyFallBackIconIsDisplayed(newSiteName, {
            stepInfo: `Verifying thumbnail is displayed for "${newSiteName}"`,
          });

          await globalSearchPage.getSearchResultsComponent().verifySiteIconIsDisplayed(newSiteName, {
            stepInfo: `Verifying site icon is displayed for "${newSiteName}"`,
          });

          await globalSearchPage.getSearchResultsComponent().verifyLockIconIsDisplayed(newSiteName, data.siteType, {
            stepInfo: `Verifying lock icon for "${newSiteName}" based on site type "${data.siteType}"`,
          });

          // 1. Mouse over on the site name result
          await globalSearchPage.getSearchResultsComponent().mouseOverOnResult(newSiteName, {
            stepInfo: `Mouse over on result for "${newSiteName}"`,
          });

          // 2. Verify the copy button is visible
          await globalSearchPage.getSearchResultsComponent().verifyCopyLinkButtonIsDisplayed(newSiteName, {
            stepInfo: `Verifying copy link button is visible for "${newSiteName}"`,
          });

          // 3. Click the copy button
          await globalSearchPage.getSearchResultsComponent().clickCopyLinkButton(newSiteName, {
            stepInfo: `Clicking copy link button for "${newSiteName}"`,
          });

          // 4. Verify the 'Copied' text appears
          await globalSearchPage.getSearchResultsComponent().verifyCopiedTextIsDisplayed(newSiteName, {
            stepInfo: `Verifying 'Copied' text is displayed for "${newSiteName}"`,
          });

          // // 5. verify copied url navigation
          // await globalSearchPage.getSearchResultsComponent().verifyCopiedUrlNavigation(newSiteName, {
          //   stepInfo: `Verifying copied URL for "${newSiteName}" navigates to correct page`,
          // });

          // await globalSearchPage.navigateBack({ stepInfo: 'Navigating back to previous page' });

          //6. verifying category page navigation
          await globalSearchPage.getSearchResultsComponent().clickOnCategory(newSiteName, data.category, {
            stepInfo: `Verifying clicking on category and navigated to "${data.category}"`,
          });

          await globalSearchPage.goBackToPreviousPage({ stepInfo: 'Navigating back to previous page' });

          // Step: Click on the site name and verify navigation
          await globalSearchPage.getSearchResultsComponent().clickOnSiteAndVerifyNavigation(newSiteName, {
            stepInfo: `Clicking on site "${newSiteName}" and verifying navigation`,
          });

          await globalSearchPage.goBackToPreviousPage({ stepInfo: 'Navigating back to previous page' });

          // Step: Click on the thumbnail and verify navigation
          await globalSearchPage.getSearchResultsComponent().clickOnThumbnailAndVerifyNavigation(newSiteName, {
            stepInfo: `Clicking on thumbnail for "${newSiteName}" and verifying navigation`,
          });
        }
      );
    }
  }
);
