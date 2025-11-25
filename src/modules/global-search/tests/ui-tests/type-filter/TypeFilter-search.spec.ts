import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import {
  EVENT_SEARCH_TEST_DATA,
  PAGE_SEARCH_TEST_DATA,
} from '@/src/modules/global-search/test-data/content-search.test-data';
import {
  AUTHOR_FILTER_TEST_DATA,
  TYPE_FILTER_TEST_DATA,
} from '@/src/modules/global-search/test-data/filter-names.test-data';
import { INTRANET_FILE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/intranet-file-search.test-data';
import { VIDEO_FILE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/video-file-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';

/**
 * Filter file types to only test Document, Presentation, and Spreadsheet
 */
const typeFilterTestData = INTRANET_FILE_SEARCH_TEST_DATA.fileTypes.filter(
  fileType =>
    fileType.typeFilter === 'Document File' ||
    fileType.typeFilter === 'Presentation' ||
    fileType.typeFilter === 'Spreadsheet'
);

for (const fileType of typeFilterTestData) {
  test.describe(
    'global Search - Intranet File Search Type Filter functionality',
    {
      tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FILE_SEARCH],
    },
    () => {
      let siteId: string;
      let uploadedFileName: string;
      let fileId: string;

      test.beforeEach('Site and File Setup', async ({ appManagerFixture, publicSite }) => {
        const intranetResult = await appManagerFixture.intranetFileHelper.uploadFileViaApi({
          siteId: publicSite.siteId,
          siteName: publicSite.siteName,
          filePath: `src/modules/global-search/test-data/${fileType.originalFileName}`,
          fileName: fileType.fileName,
        });

        uploadedFileName = intranetResult.uploadedFileName;
        fileId = intranetResult.fileId;
        siteId = intranetResult.siteId;
      });

      test(
        `Verify Type filter functionality for ${fileType.typeFilter} (${fileType.type})`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-15493',
          });

          // Search for the file
          const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(uploadedFileName, {
            stepInfo: `Searching with term "${uploadedFileName}" to verify file appears in search results`,
          });

          await globalSearchResultPage.dismissSurveyPopupIfPresent();
          const filterName = TYPE_FILTER_TEST_DATA.filterName;
          const typeFilter = globalSearchResultPage.getTypeFilter(filterName);
          await typeFilter.verifyTypeFilterButtonDisplayed({
            stepInfo: 'Verify Type filter button is displayed',
          });

          await typeFilter.verifyTypeFilterArrowDisplayed({
            stepInfo: 'Verify arrow is displayed beside Type filter',
          });

          await typeFilter.clickTypeFilterButton({
            stepInfo: 'Click on Type filter',
          });

          await typeFilter.verifyTypeFilterTitleDisplayed({
            stepInfo: `Verify "${filterName}" text is displayed`,
          });

          await typeFilter.verifyTypeFilterOptionDisplayed(fileType.typeFilter, {
            stepInfo: `Verify "${fileType.typeFilter}" text is displayed`,
          });

          await typeFilter.verifyTypeFilterRadioButtonDisplayed(fileType.typeFilter, {
            stepInfo: `Verify radio button is displayed beside "${fileType.typeFilter}"`,
          });

          await typeFilter.verifyTypeFilterCountDisplayed(fileType.typeFilter, {
            stepInfo: `Verify count is displayed beside "${fileType.typeFilter}"`,
          });

          await typeFilter.clickTypeFilterOption(fileType.typeFilter, {
            stepInfo: `Click on "${fileType.typeFilter}" radio button`,
          });

          await typeFilter.verifyFileNameIsDisplayedInResults(uploadedFileName, {
            stepInfo: `Verify the file "${uploadedFileName}" appears in the filtered results`,
          });

          await typeFilter.verifyTypeFilterGroupCount('1', {
            stepInfo: 'Verify count displayed in type filter box is "1"',
          });

          await typeFilter.verifyClearButtonDisplayed({
            stepInfo: 'Verify Clear button is displayed',
          });

          await typeFilter.clickClearButton({
            stepInfo: 'Click on Clear button',
          });

          await typeFilter.verifyTypeFilterGroupCountNotVisible({
            stepInfo: 'Verify count is not visible after clearing',
          });
        }
      );
    }
  );
}

test.describe(
  'global Search - Page Search Type Filter functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    const testData = PAGE_SEARCH_TEST_DATA;
    let siteId: string;
    let contentId: string;
    let pageName: string;

    test.beforeEach('Page Setup', async ({ appManagerFixture, publicSite }) => {
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
      contentId = pageDetails.contentId;
      pageName = pageDetails.pageName;
    });

    test.afterEach('Cleanup page content', async ({ appManagerFixture }) => {
      if (contentId && siteId) {
        await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
      }
    });

    test(
      'verify Type filter functionality for Page',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19822',
        });

        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(pageName, {
          stepInfo: `Searching with term "${pageName}" to verify page appears in search results`,
        });

        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        const filterName = TYPE_FILTER_TEST_DATA.filterName;
        const typeFilter = globalSearchResultPage.getTypeFilter(filterName);

        await typeFilter.verifyTypeFilterButtonDisplayed({
          stepInfo: 'Verify Type filter button is displayed',
        });

        await typeFilter.verifyTypeFilterArrowDisplayed({
          stepInfo: 'Verify arrow is displayed beside Type filter',
        });

        await typeFilter.clickTypeFilterButton({
          stepInfo: 'Click on Type filter',
        });

        await typeFilter.verifyTypeFilterTitleDisplayed({
          stepInfo: `Verify "${filterName}" text is displayed`,
        });

        await typeFilter.verifyTypeFilterOptionDisplayed(testData.typeFilter!, {
          stepInfo: `Verify "${testData.typeFilter}" text is displayed`,
        });

        await typeFilter.verifyTypeFilterRadioButtonDisplayed(testData.typeFilter!, {
          stepInfo: `Verify radio button is displayed beside "${testData.typeFilter}"`,
        });

        await typeFilter.verifyTypeFilterCountDisplayed(testData.typeFilter!, {
          stepInfo: `Verify count is displayed beside "${testData.typeFilter}"`,
        });

        await typeFilter.clickTypeFilterOption(testData.typeFilter!, {
          stepInfo: `Click on "${testData.typeFilter}" radio button`,
        });

        await typeFilter.verifyFileNameIsDisplayedInResults(pageName, {
          stepInfo: `Verify the page "${pageName}" appears in the filtered results`,
        });

        await typeFilter.verifyTypeFilterGroupCount('1', {
          stepInfo: 'Verify count displayed in type filter box is "1"',
        });

        await typeFilter.verifyClearButtonDisplayed({
          stepInfo: 'Verify Clear button is displayed',
        });

        await typeFilter.clickClearButton({
          stepInfo: 'Click on Clear button',
        });

        await typeFilter.verifyTypeFilterGroupCountNotVisible({
          stepInfo: 'Verify count is not visible after clearing',
        });
      }
    );
  }
);

test.describe(
  'global Search - Event Search Type Filter functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    const testData = EVENT_SEARCH_TEST_DATA;
    let siteId: string;
    let contentId: string;
    let eventName: string;

    test.beforeEach('Event Setup', async ({ appManagerFixture, publicSite }) => {
      const eventDetails = await appManagerFixture.contentManagementHelper.createEvent({
        siteId: publicSite.siteId,
        contentInfo: {
          contentType: testData.content,
        },
        options: {
          contentDescription: testData.description,
        },
      });

      siteId = publicSite.siteId;
      contentId = eventDetails.contentId;
      eventName = eventDetails.eventName;
    });

    test.afterEach(
      `Cleaning up the test environment by deleting the created event content`,
      async ({ appManagerFixture }) => {
        try {
          if (contentId) {
            await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
          }
        } catch (error) {
          console.warn('After hook cleanup failed, but test will not fail:', error);
        }
      }
    );

    test(
      'verify Type filter functionality for Event',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19823',
        });

        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(eventName, {
          stepInfo: `Searching with term "${eventName}" to verify event appears in search results`,
        });

        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        const filterName = TYPE_FILTER_TEST_DATA.filterName;
        const typeFilter = globalSearchResultPage.getTypeFilter(filterName);

        await typeFilter.verifyTypeFilterButtonDisplayed({
          stepInfo: 'Verify Type filter button is displayed',
        });

        await typeFilter.verifyTypeFilterArrowDisplayed({
          stepInfo: 'Verify arrow is displayed beside Type filter',
        });

        await typeFilter.clickTypeFilterButton({
          stepInfo: 'Click on Type filter',
        });

        await typeFilter.verifyTypeFilterTitleDisplayed({
          stepInfo: `Verify "${filterName}" text is displayed`,
        });

        await typeFilter.verifyTypeFilterOptionDisplayed(testData.label, {
          stepInfo: `Verify "${testData.label}" text is displayed`,
        });

        await typeFilter.verifyTypeFilterRadioButtonDisplayed(testData.label, {
          stepInfo: `Verify radio button is displayed beside "${testData.label}"`,
        });

        await typeFilter.verifyTypeFilterCountDisplayed(testData.label, {
          stepInfo: `Verify count is displayed beside "${testData.label}"`,
        });

        await typeFilter.clickTypeFilterOption(testData.label, {
          stepInfo: `Click on "${testData.label}" radio button`,
        });

        await typeFilter.verifyFileNameIsDisplayedInResults(eventName, {
          stepInfo: `Verify the event "${eventName}" appears in the filtered results`,
        });

        await typeFilter.verifyTypeFilterGroupCount('1', {
          stepInfo: 'Verify count displayed in type filter box is "1"',
        });

        await typeFilter.verifyClearButtonDisplayed({
          stepInfo: 'Verify Clear button is displayed',
        });

        await typeFilter.clickClearButton({
          stepInfo: 'Click on Clear button',
        });

        await typeFilter.verifyTypeFilterGroupCountNotVisible({
          stepInfo: 'Verify count is not visible after clearing',
        });
      }
    );
  }
);

test.describe(
  'global Search - Video Search Type Filter functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FILE_SEARCH],
  },
  () => {
    const testData = VIDEO_FILE_SEARCH_TEST_DATA;
    const videoFileType = testData.fileTypes[0];
    let siteId: string;
    let uploadedFileName: string;
    let fileId: string;

    test.beforeEach('Video Setup', async ({ appManagerFixture, publicSite }) => {
      const videoResult = await appManagerFixture.intranetFileHelper.uploadFileToExistingSite({
        siteId: publicSite.siteId,
        siteName: publicSite.siteName,
        filePath: `src/modules/global-search/test-data/${videoFileType.fileName}`,
        options: { videoFile: true },
      });

      uploadedFileName = videoResult.uploadedFileName;
      fileId = videoResult.fileId;
      siteId = videoResult.siteId;
    });

    test.afterEach('Cleanup uploaded video file', async ({ appManagerFixture }) => {
      if (fileId && siteId) {
        await appManagerFixture.intranetFileHelper.deleteFileViaApi(fileId, siteId);
      }
    });

    test(
      'verify Type filter functionality for Video',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19824',
        });

        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(uploadedFileName, {
          stepInfo: `Searching with term "${uploadedFileName}" to verify video appears in search results`,
        });

        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        const filterName = TYPE_FILTER_TEST_DATA.filterName;
        const typeFilter = globalSearchResultPage.getTypeFilter(filterName);

        await typeFilter.verifyTypeFilterButtonDisplayed({
          stepInfo: 'Verify Type filter button is displayed',
        });

        await typeFilter.verifyTypeFilterArrowDisplayed({
          stepInfo: 'Verify arrow is displayed beside Type filter',
        });

        await typeFilter.clickTypeFilterButton({
          stepInfo: 'Click on Type filter',
        });

        await typeFilter.verifyTypeFilterTitleDisplayed({
          stepInfo: `Verify "${filterName}" text is displayed`,
        });

        await typeFilter.verifyTypeFilterOptionDisplayed(videoFileType.label, {
          stepInfo: `Verify "${videoFileType.label}" text is displayed`,
        });

        await typeFilter.verifyTypeFilterRadioButtonDisplayed(videoFileType.label, {
          stepInfo: `Verify radio button is displayed beside "${videoFileType.label}"`,
        });

        await typeFilter.verifyTypeFilterCountDisplayed(videoFileType.label, {
          stepInfo: `Verify count is displayed beside "${videoFileType.label}"`,
        });

        await typeFilter.clickTypeFilterOption(videoFileType.label, {
          stepInfo: `Click on "${videoFileType.label}" radio button`,
        });

        await typeFilter.verifyFileNameIsDisplayedInResults(uploadedFileName, {
          stepInfo: `Verify the video "${uploadedFileName}" appears in the filtered results`,
        });

        await typeFilter.verifyTypeFilterGroupCount('1', {
          stepInfo: 'Verify count displayed in type filter box is "1"',
        });

        await typeFilter.verifyClearButtonDisplayed({
          stepInfo: 'Verify Clear button is displayed',
        });

        await typeFilter.clickClearButton({
          stepInfo: 'Click on Clear button',
        });

        await typeFilter.verifyTypeFilterGroupCountNotVisible({
          stepInfo: 'Verify count is not visible after clearing',
        });
      }
    );
  }
);

test.describe(
  'global Search - Author Filter functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    const testData = PAGE_SEARCH_TEST_DATA;
    let siteId: string;
    let contentId: string;
    let pageName: string;
    let authorName: string;

    test.beforeEach('Page Setup', async ({ appManagerFixture, publicSite }) => {
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
      contentId = pageDetails.contentId;
      pageName = pageDetails.pageName;
      authorName = pageDetails.authorName;
    });

    test.afterEach('Cleanup page content', async ({ appManagerFixture }) => {
      if (contentId && siteId) {
        await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
      }
    });

    test(
      'verify Author filter functionality',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19825',
        });

        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(pageName, {
          stepInfo: `Searching with term "${pageName}" to verify page appears in search results`,
        });

        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        // AUTHOR_FILTER_TEST_DATA.filterName returns 'Author' string from filter-names.test-data.ts
        const filterName = AUTHOR_FILTER_TEST_DATA.filterName; // This is 'Author'
        const authorFilter = globalSearchResultPage.getTypeFilter(filterName); // Passes 'Author' to getTypeFilter

        await authorFilter.verifyTypeFilterButtonDisplayed({
          stepInfo: 'Verify Author filter button is displayed',
        });

        await authorFilter.verifyTypeFilterArrowDisplayed({
          stepInfo: 'Verify arrow is displayed beside Author filter',
        });

        await authorFilter.clickTypeFilterButton({
          stepInfo: 'Click on Author filter',
        });

        await authorFilter.verifyTypeFilterTitleDisplayed({
          stepInfo: `Verify "${filterName}" text is displayed`,
        });

        await authorFilter.verifyTypeFilterOptionDisplayed(authorName, {
          stepInfo: `Verify "${authorName}" text is displayed`,
        });

        await authorFilter.verifyTypeFilterRadioButtonDisplayed(authorName, {
          stepInfo: `Verify radio button is displayed beside "${authorName}"`,
        });

        await authorFilter.verifyTypeFilterCountDisplayed(authorName, {
          stepInfo: `Verify count is displayed beside "${authorName}"`,
        });

        await authorFilter.clickTypeFilterOption(authorName, {
          stepInfo: `Click on "${authorName}" radio button`,
        });

        await authorFilter.verifyFileNameIsDisplayedInResults(pageName, {
          stepInfo: `Verify the page "${pageName}" appears in the filtered results`,
        });

        await authorFilter.verifyTypeFilterGroupCount('1', {
          stepInfo: 'Verify count displayed in author filter box is "1"',
        });

        await authorFilter.verifyClearButtonDisplayed({
          stepInfo: 'Verify Clear button is displayed',
        });

        await authorFilter.clickClearButton({
          stepInfo: 'Click on Clear button',
        });

        await authorFilter.verifyTypeFilterGroupCountNotVisible({
          stepInfo: 'Verify count is not visible after clearing',
        });
      }
    );
  }
);
