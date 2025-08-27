import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { VIDEO_FILE_SEARCH_TEST_DATA as testData } from '@/src/modules/global-search/test-data/video-file-search.test-data';

for (const fileType of testData.fileTypes) {
  test.describe(
    'Global Search - Video File Search functionality',
    {
      tag: [
        GlobalSearchSuiteTags.GLOBAL_SEARCH,
        GlobalSearchSuiteTags.FILE_SEARCH,
        GlobalSearchSuiteTags.VIDEO_FILE_SEARCH,
      ],
    },
    () => {
      let uploadedFileName: string;
      let fileId: string;
      let authorName: string;
      let siteId: string;
      let siteName: string;

      test.beforeEach('Site and File Setup', async ({ intranetFileHelper }) => {
        const videoResult = await intranetFileHelper.createSiteAndUploadFile({
          category: testData.category,
          accessType: SITE_TYPES.PUBLIC,
          filePath: `src/modules/global-search/test-data/${fileType.fileName}`,
          options: { videoFile: true },
        });
        uploadedFileName = videoResult.uploadedFileName;
        fileId = videoResult.fileId;
        authorName = videoResult.authorName;
        siteId = videoResult.siteId;
        siteName = videoResult.siteName;
      });

      test(
        `Verify search results for a new video file of type ${fileType.type}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-15731',
            storyId: 'SEN-12300',
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
