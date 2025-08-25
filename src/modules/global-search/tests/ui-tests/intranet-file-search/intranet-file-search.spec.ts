import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { INTRANET_FILE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/intranet-file-search.test-data';

test.describe(
  'Global Search - Intranet File Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FILE_SEARCH],
  },
  () => {
    const testData = INTRANET_FILE_SEARCH_TEST_DATA;
    let siteId: string;
    let siteName: string;
    let uploadedFileName: string;
    let fileId: string;
    let authorName: string;

    for (const fileType of testData.fileTypes) {
      test.beforeEach(
        `Setting up the test environment for intranet file search by creating site and uploading ${fileType.type} file`,
        async ({ appManagerHomePage, intranetFileHelper, siteManagementHelper, appManagerApiClient }) => {
          // Initialize API client with proper authentication and CSRF token
          const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);
          const createdSiteDetails = await siteManagementHelper.createSite({
            category: categoryObj,
            accessType: 'public',
          });
          siteId = createdSiteDetails.siteId!;
          siteName = createdSiteDetails.siteName!;
          console.log(`Created site: ${siteName} with ID: ${siteId}`);

          // Upload file
          uploadedFileName = await intranetFileHelper.uploadFile(
            appManagerHomePage as NewUxHomePage,
            siteName,
            siteId,
            `src/modules/global-search/test-data/${fileType.fileName}`
          );

          // Get file details
          const fileDetails = await appManagerApiClient
            .getSiteManagementService()
            .getFileIdFromSite(siteId, uploadedFileName);

          fileId = fileDetails.fileId;
          authorName = fileDetails.authorName;
        }
      );

      test(
        `Verify search results for a new intranet file of type ${fileType.type}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage, appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12433',
            storyId: 'SEN-12296',
          });

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
