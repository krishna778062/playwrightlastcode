import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { VIDEO_FILE_SEARCH_TEST_DATA as testData } from '@/src/modules/global-search/test-data/video-file-search.test-data';

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

    for (const fileType of testData.fileTypes) {
      test.beforeEach(
        'Site and File Setup',
        async ({ appManagerHomePage, intranetFileHelper, siteManagementHelper, appManagerApiClient }) => {
          const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);
          const siteDetails = await siteManagementHelper.createSite({
            category: categoryObj,
            accessType: 'public',
          });

          //extract metadata
          siteId = siteDetails.siteId!;
          siteName = siteDetails.siteName!;

          uploadedFileName = await intranetFileHelper.uploadFile(
            appManagerHomePage as NewUxHomePage,
            siteName,
            siteId,
            `src/modules/global-search/test-data/${fileType.fileName}`
          );

          const fileDetails = await appManagerApiClient
            .getSiteManagementService()
            .getVideoFileIdFromSearch(siteId, uploadedFileName);

          //extract metadata
          fileId = fileDetails.fileId!;
          authorName = fileDetails.authorName!;

          await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
            appManagerApiClient,
            uploadedFileName,
            uploadedFileName,
            'file'
          );
        }
      );

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
  }
);
