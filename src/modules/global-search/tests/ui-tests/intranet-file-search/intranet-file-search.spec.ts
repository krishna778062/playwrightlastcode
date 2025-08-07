import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { INTRANET_FILE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/intranet-file-search.test-data';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';

test.describe(
  'Global Search - Intranet File Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FILE_SEARCH, '@test'],
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

          const { siteId } = await intranetFileHelper.createSite(siteName, categoryObj);
          const uploadedFileName = await intranetFileHelper.uploadFile(
            appManagerHomePage as NewUxHomePage,
            fileType,
            siteName,
            siteId
          );

          const { fileId, authorName } = await appManagerApiClient
            .getSiteManagementService()
            .getFileIdFromSite(siteId, uploadedFileName);

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
