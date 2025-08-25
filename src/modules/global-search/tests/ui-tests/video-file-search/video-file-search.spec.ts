import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { VIDEO_FILE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/video-file-search.test-data';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';

test.describe(
  'Global Search - Video File Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FILE_SEARCH, '@video'],
  },
  () => {
    const testData = VIDEO_FILE_SEARCH_TEST_DATA;

    for (const fileType of testData.fileTypes) {
      test(
        `Verify search results for a new video file of type ${fileType.type}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage, intranetFileHelper, siteManagementHelper, appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12433',
            storyId: 'SEN-12296',
          });
          const { siteId, siteName } = await siteManagementHelper.createSiteWithCategoryName(testData.category);
          const uploadedFileName = await intranetFileHelper.uploadFile(
            appManagerHomePage as NewUxHomePage,
            siteName,
            siteId,
            `src/modules/global-search/test-data/${fileType.fileName}`
          );

          const { fileId, authorName } = await appManagerApiClient
            .getSiteManagementService()
            .getVideoFileIdFromSearch(siteId, uploadedFileName);

          await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
            appManagerApiClient,
            uploadedFileName,
            uploadedFileName,
            'file'
          );

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
  }
);
