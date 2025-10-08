import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { IntranetFileListComponent } from '@/src/modules/global-search/components/intranetFileListComponent';
import { ResultListingComponent } from '@/src/modules/global-search/components/resultsListComponent';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { INTRANET_FILE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/intranet-file-search.test-data';

for (const fileType of INTRANET_FILE_SEARCH_TEST_DATA.fileTypes) {
  test.describe(
    'Global Search - Intranet File Search functionality',
    {
      tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FILE_SEARCH],
    },
    () => {
      let siteId: string;
      let siteName: string;
      let uploadedFileName: string;
      let fileId: string;
      let authorName: string;

      test.beforeEach('Site and File Setup', async ({ intranetFileHelper, publicSite }) => {
        // Use API-based upload method (faster and more reliable)
        const intranetResult = await intranetFileHelper.uploadFileViaApi({
          siteId: publicSite.siteId,
          siteName: publicSite.siteName,
          filePath: `src/modules/global-search/test-data/${fileType.originalFileName}`,
          fileName: fileType.fileName,
        });

        uploadedFileName = intranetResult.uploadedFileName;
        fileId = intranetResult.fileId;
        authorName = intranetResult.authorName;
        siteId = intranetResult.siteId;
        siteName = intranetResult.siteName;
      });

      test(
        `Verify search results for a new intranet file of type ${fileType.type}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12433',
            storyId: 'SEN-12296',
          });

          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(uploadedFileName, {
            stepInfo: `Searching with term "${uploadedFileName}" and intent is to find the file`,
          });

          await globalSearchResultPage.verifyFileResultItemDataPoints({
            name: uploadedFileName,
            label: fileType.label,
            author: authorName,
            type: fileType.type,
            siteName,
            siteId,
            fileId,
          });
        }
      );

      test(
        `Verify Intranet File Search results with sidebar filter for ${fileType.type}`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19283',
          });

          // Search for the file
          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(uploadedFileName, {
            stepInfo: `Searching with term "${uploadedFileName}" to verify file appears in search results`,
          });

          // Dismiss any survey popup that might appear
          await globalSearchResultPage.dismissSurveyPopupIfPresent();

          // Verify the file appears in the initial search results
          const fileResult = await globalSearchResultPage.getFileResultItemExactlyMatchingTheSearchTerm(
            uploadedFileName,
            fileType.type
          );
          const fileResultItem = new IntranetFileListComponent(fileResult.page, fileResult.rootLocator);
          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);

          // Click on the file filter in the sidebar to filter results by files only
          await globalSearchResultPage.verifyAndClickSidebarFilter({
            filterText: 'Files',
            iconType: 'file',
          });

          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);

          const originalCount = await globalSearchResultPage.verifyAndClickSiteSubFilter({
            filterText: 'Files',
            siteName: siteName,
          });

          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);

          // Click on site subfilter, verify count tracking, and reset functionality
          await globalSearchResultPage.verifySiteSubFilterWithCountTracking({
            filterText: 'Files',
            siteName: siteName,
            originalCount: originalCount,
            expectedCountAfterFilter: 1,
          });
          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);
        }
      );

      test(
        `Verify Intranet File Autocomplete functionality for ${fileType.type}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19290',
          });

          // Type in search input
          await appManagerHomePage.topNavBarComponent.typeInSearchBarInput(uploadedFileName, {
            stepInfo: `Typing "${uploadedFileName}" in search input`,
          });

          const resultList = new ResultListingComponent(appManagerHomePage.page);
          await resultList.waitForAndVerifyAutocompleteListIsDisplayed();

          const fileResult = resultList.getAutocompleteItemByName(uploadedFileName);

          await fileResult.verifyAutocompleteItemData(uploadedFileName, fileType.label);

          await fileResult.verifyAutocompleteNavigationToTitleLink(fileId, uploadedFileName, fileType.label);
        }
      );
    }
  );
}
