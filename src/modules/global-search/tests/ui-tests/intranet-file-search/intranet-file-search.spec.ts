import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { INTRANET_FILE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/intranet-file-search.test-data';
import { IntranetFileListComponent } from '@/src/modules/global-search/components/intranetFileListComponent';

test.describe(
  'Global Search - Intranet File Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.FILE_SEARCH],
  },
  () => {
    const testData = INTRANET_FILE_SEARCH_TEST_DATA;

    for (const fileType of testData.fileTypes) {
      test(
        `Verify search results for a new intranet file of type ${fileType.type}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage, intranetFileHelper, appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12433',
            storyId: 'SEN-12296',
          });

          const randomNum = Math.floor(Math.random() * 1000000 + 1);
          const siteName = `AutomateUI_Test_${randomNum}`;
          const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);

          const { siteId, fileId, fileName, authorName } = await intranetFileHelper.createFile(
            siteName,
            categoryObj,
            fileType.fileName,
            fileType.mimeType,
            fileType.type
          );

          // UI Search for the file
          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(fileName, {
            stepInfo: `Searching with term "${fileName}" and intent is to find the file`,
          });

          //  Get the file result item using IntranetFileListComponent
          await globalSearchResultPage.verifyIntranetFileResultItem({
            name: fileName,
            label: fileType.label,
            author: authorName,
            type: fileType.type,
            siteName,
            siteId,
            fileId,
          });
        }
      );
    }
  }
); 