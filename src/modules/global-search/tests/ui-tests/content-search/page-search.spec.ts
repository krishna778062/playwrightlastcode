import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/core/constants/contentTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { PAGE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { ContentListComponent } from '@/src/modules/global-search/ui/components/contentListComponent';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';

test.describe(
  'global Search - Page Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    const testData = PAGE_SEARCH_TEST_DATA;
    let siteId: string;
    let siteName: string;
    let contentId: string;
    let pageName: string;
    let authorName: string;

    test.beforeEach(
      `Setting up the test environment for page search by creating page content in common public site`,
      async ({ appManagerFixture, publicSite }) => {
        const pageDetails = await appManagerFixture.contentManagementHelper.createPage({
          siteId: publicSite.siteId,
          contentInfo: {
            contentType: testData.content,
            contentSubType: testData.contentType!,
          },
          options: {
            contentDescription: testData.description,
          },
        });

        siteId = publicSite.siteId;
        siteName = publicSite.siteName;
        contentId = pageDetails.contentId;
        pageName = pageDetails.pageName;
        authorName = pageDetails.authorName;
        console.log(`Created page "${pageName}" in site "${siteName}" with ID: ${siteId}`);
      }
    );

    test.afterEach(
      `Cleaning up the test environment by deleting the created page content`,
      async ({ appManagerFixture }) => {
        if (contentId) {
          await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
          console.log(`Deleted page "${pageName}" with ID: ${contentId}`);
        }
      }
    );

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12432',
          storyId: 'SEN-12295',
        });

        // 4. UI Search for the page
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(pageName, {
          stepInfo: `Searching with term "${pageName}" and intent is to find the content`,
        });

        // 5. Verify the page result item's data points
        await globalSearchResultPage.verifyContentResultItemDataPoints(ContentType.Page, {
          name: pageName,
          label: testData.label,
          description: testData.description,
          author: authorName,
          contentType: 'Page',
          contentId,
          siteId,
          siteName,
        });
      }
    );

    test(
      `verify Page Search results with sidebar filter`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19194',
        });

        // Search for the page
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(pageName, {
          stepInfo: `Searching with term "${pageName}" to verify page appears in search results`,
        });

        // Dismiss any survey popup that might appear
        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        // Verify the page appears in the initial search results
        const pageResult = await globalSearchResultPage.getPageResultItemExactlyMatchingTheSearchTerm(pageName);
        const pageResultItem = new ContentListComponent(pageResult.page, pageResult.rootLocator);
        await pageResultItem.verifyNameIsDisplayed(pageName);

        // Click on the page filter in the sidebar to filter results by pages only
        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: 'Content',
          iconType: 'page',
        });

        await pageResultItem.verifyNameIsDisplayed(pageName);

        const originalCount = await globalSearchResultPage.verifyAndClickSiteSubFilter({
          filterText: 'Content',
          siteName: siteName,
        });

        await pageResultItem.verifyNameIsDisplayed(pageName);

        // Click on site subfilter, verify count tracking, and reset functionality
        await globalSearchResultPage.verifySiteSubFilterWithCountTracking({
          filterText: 'Content',
          siteName: siteName,
          originalCount: originalCount,
          expectedCountAfterFilter: 1,
        });
        await pageResultItem.verifyNameIsDisplayed(pageName);
      }
    );

    test(
      `verify Page Autocomplete functionality`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19286',
        });

        const topNavBarComponent = appManagerFixture.navigationHelper.topNavBarComponent;
        await topNavBarComponent.typeInSearchBarInput(pageName, {
          stepInfo: `Typing "${pageName}" in search input`,
        });

        // Wait for autocomplete to appear first
        const resultList = new ResultListingComponent(appManagerFixture.page);
        await resultList.waitForAndVerifyAutocompleteListIsDisplayed();
        const pageResult = resultList.getAutocompleteItemByName(pageName);

        await pageResult.verifyAutocompleteItemData(pageName, ContentType.Page);
        await pageResult.verifyAutocompleteNavigationToTitleLink(contentId, pageName, ContentType.Page);
      }
    );
  }
);
