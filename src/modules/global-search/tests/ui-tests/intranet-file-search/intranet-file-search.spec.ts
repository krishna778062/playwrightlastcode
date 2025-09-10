import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

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
      const _testData = INTRANET_FILE_SEARCH_TEST_DATA;
      let siteId: string;
      let siteName: string;
      let uploadedFileName: string;
      let fileId: string;
      let authorName: string;

      test.beforeEach('Site and File Setup', async ({ intranetFileHelper, publicSite }) => {
        // Use the shared public site and upload file using the new method
        const intranetResult = await intranetFileHelper.uploadFileToExistingSite({
          siteId: publicSite.siteId,
          siteName: publicSite.siteName,
          filePath: `src/modules/global-search/test-data/${fileType.fileName}`,
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
          tag: [TestPriority.P0, TestGroupType.SMOKE],
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
    }
  );
}
