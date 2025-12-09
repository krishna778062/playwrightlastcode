import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { VIDEO_FILE_SEARCH_TEST_DATA as testData } from '@/src/modules/global-search/test-data/video-file-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { IntranetFileListComponent } from '@/src/modules/global-search/ui/components/intranetFileListComponent';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';
import { VideoListItemComponent } from '@/src/modules/global-search/ui/components/videoListItemComponent';

for (const fileType of testData.fileTypes) {
  test.describe(
    'global Search - Video File Search functionality',
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

      test.beforeEach('Site and File Setup', async ({ appManagerFixture, publicSite }) => {
        // Use the shared public site and upload video file using the new method
        const videoResult = await appManagerFixture.intranetFileHelper.uploadFileToExistingSite({
          siteId: publicSite.siteId,
          siteName: publicSite.siteName,
          filePath: `src/modules/global-search/test-data/${fileType.fileName}`,
          options: { videoFile: true },
        });

        uploadedFileName = videoResult.uploadedFileName;
        fileId = videoResult.fileId;
        authorName = videoResult.authorName;
        siteId = videoResult.siteId;
        siteName = videoResult.siteName;
      });

      test.afterEach('Cleanup uploaded files', async ({ appManagerFixture }) => {
        await appManagerFixture.intranetFileHelper.cleanup();
      });

      test(
        `Verify search results for a new video file of type ${fileType.type}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-15731',
            storyId: 'SEN-12300',
          });

          const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(uploadedFileName, {
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
        `verify Video File Search results with sidebar filter`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19543',
          });
          // Search for the video file
          const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(uploadedFileName, {
            stepInfo: `Searching with term "${uploadedFileName}" to verify video file appears in search results`,
          });

          // Dismiss any survey popup that might appear
          await globalSearchResultPage.dismissSurveyPopupIfPresent();

          // Verify the video file appears in the initial search results
          const fileResult = await globalSearchResultPage.getFileResultItemExactlyMatchingTheSearchTerm(
            uploadedFileName,
            fileType.type
          );
          const fileResultItem = new IntranetFileListComponent(fileResult.page, fileResult.rootLocator);
          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);

          // Click on the file filter in the sidebar to filter results by files only
          await globalSearchResultPage.verifyAndClickSidebarFilter({
            filterText: testData.filterText,
            iconType: fileType.label.toLowerCase(),
          });

          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);

          const originalCount = await globalSearchResultPage.verifyAndClickSiteSubFilter({
            filterText: testData.filterText,
            siteName: siteName,
          });

          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);

          // Click on site subfilter, verify count tracking, and reset functionality
          await globalSearchResultPage.verifySiteSubFilterWithCountTracking({
            filterText: testData.filterText,
            siteName: siteName,
            originalCount: originalCount,
            expectedCountAfterFilter: 1,
          });

          await fileResultItem.verifyNameIsDisplayed(uploadedFileName);
        }
      );
      test(
        `verify Video File Autocomplete functionality`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-19659',
          });

          /** Type in search input */
          await appManagerFixture.navigationHelper.topNavBarComponent.typeInSearchBarInput(uploadedFileName, {
            stepInfo: `Typing "${uploadedFileName}" in search input`,
          });

          const resultList = new ResultListingComponent(appManagerFixture.page);
          await resultList.waitForAndVerifyAutocompleteListIsDisplayed();

          const fileResult = resultList.getAutocompleteItemByName(uploadedFileName);

          await fileResult.verifyAutocompleteItemData(uploadedFileName, fileType.label);

          await fileResult.verifyAutocompleteNavigationToTitleLink(fileId, uploadedFileName, fileType.label);
        }
      );
    }
  );
}

// Separate describe block for caption search test - no beforeEach/afterEach hooks
test.describe(
  'global Search - Video File Search with Captions functionality',
  {
    tag: [
      GlobalSearchSuiteTags.GLOBAL_SEARCH,
      GlobalSearchSuiteTags.FILE_SEARCH,
      GlobalSearchSuiteTags.VIDEO_FILE_SEARCH,
    ],
  },
  () => {
    test(
      'to verify video transcripts search',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-17761',
        });

        const captionSearchData = testData.captionSearch;
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(
          captionSearchData.searchTerm,
          {
            stepInfo: `Searching with term "${captionSearchData.searchTerm}" to find video with captions`,
          }
        );

        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: captionSearchData.filterText,
          iconType: captionSearchData.iconType,
        });

        const fileResult = await globalSearchResultPage.getFileResultItemExactlyMatchingTheSearchTerm(
          captionSearchData.expectedVideoTitle,
          captionSearchData.fileType
        );
        const videoListItem = new VideoListItemComponent(fileResult.page, fileResult.rootLocator);
        await videoListItem.verifyNameIsDisplayed(captionSearchData.expectedVideoTitle);

        await videoListItem.verifyCaptionsTextIsDisplayed(captionSearchData.expectedCaptionsText);
        await videoListItem.verifyCaptionsIconIsDisplayed();
        await videoListItem.clickOnCaptionsIcon();

        await videoListItem.verifyTimestampIsDisplayed(captionSearchData.expectedTimestamp);

        await videoListItem.verifyCaptionTextForTimestamp(captionSearchData.expectedCaptionText);
        await videoListItem.clickTimestamp(captionSearchData.expectedTimestamp);
        await videoListItem.clickVideoPlayButton();
      }
    );
  }
);
