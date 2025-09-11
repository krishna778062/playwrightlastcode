import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { CONTENT_TEST_DATA } from '../../test-data/content.test-data';
import { FEED_TEST_DATA } from '../../test-data/feed.test-data';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/pages/feedPage';

interface SiteDetails {
  siteId: string;
  siteName: string;
  categoryId: string;
  categoryName: string;
  access: string;
}

interface PageDetails {
  contentId: string;
  siteId: string;
  pageName: string;
  authorName: string;
  contentDescription: string;
}

interface FeedResponse {
  result: {
    feedId: string;
    listOfFiles: Array<{
      fileId: string;
      provider: string;
      size: number;
      name: string;
      type: string;
    }>;
  };
  feedName: string;
}

test.describe(
  '@FeedFileDelete - Feed File Deletion Tests',
  {
    tag: [ContentTestSuite.FEED_FILE_DELETE_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string;
    let siteDetails: SiteDetails;
    let pageDetails: PageDetails;
    let feedResponse: FeedResponse;

    // Common attachment configuration for all test cases
    const commonAttachmentConfig = {
      hasAttachment: true as const,
      fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileName,
      fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileSize,
      mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT.mimeType,
      filePath: FileUtil.getFilePath(
        __dirname,
        '..',
        '..',
        'test-data',
        'static-files',
        'images',
        FEED_TEST_DATA.DEFAULT_FEED_CONTENT.fileName
      ),
    };

    // Test data for different feed types
    const feedTestData = [
      {
        feedType: 'Home Feed',
        scope: 'public',
        description: "Verify Delete File from File Preview Page doesn't appears on Home Feed",
        storyId: 'CONT-36287',
        ...commonAttachmentConfig,
      },
      {
        feedType: 'Site Feed',
        scope: 'site',
        description: "Verify Delete File from File Preview Page doesn't appears on Site Feed",
        storyId: 'CONT-39351',
        ...commonAttachmentConfig,
      },
      {
        feedType: 'Content Feed',
        scope: 'site',
        description: "Verify Delete File from File Preview Page doesn't appears on Content Feed",
        storyId: 'CONT-39352',
        ...commonAttachmentConfig,
      },
    ];

    // Data-driven test for different feed types
    for (const testData of feedTestData) {
      test.describe(`${testData.feedType} Tests`, () => {
        let feedTestDataGenerated: any;
        let fileId: string;

        test.beforeEach(
          'Setup test environment and data creation',
          async ({ appManagerHomePage, contentManagementHelper, siteManagementHelper, feedManagementHelper }) => {
            // Initialize feed page
            appManagerFeedPage = new FeedPage(appManagerHomePage.page);

            // Create required data based on feed type
            switch (testData.feedType) {
              case 'Site Feed': {
                const siteResult = await siteManagementHelper.createPublicSite({ waitForSearchIndex: false });
                siteDetails = siteResult;
                break;
              }

              case 'Content Feed': {
                const siteResult = await siteManagementHelper.createPublicSite({ waitForSearchIndex: false });

                const pageResult = await contentManagementHelper.createPage({
                  siteId: siteResult.siteId,
                  contentInfo: {
                    contentType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.content,
                    contentSubType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.contentType,
                  },
                  options: {
                    contentDescription: testData.description,
                    waitForSearchIndex: false,
                  },
                });

                siteDetails = siteResult;
                pageDetails = pageResult;
                break;
              }
            }

            // Generate feed data and create feed based on feed type
            switch (testData.feedType) {
              case 'Home Feed': {
                feedTestDataGenerated = TestDataGenerator.generateFeed({
                  scope: 'public',
                  siteId: undefined,
                  withAttachment: testData.hasAttachment,
                  fileName: testData.fileName,
                  fileSize: testData.fileSize,
                  mimeType: testData.mimeType,
                  filePath: testData.filePath,
                  waitForSearchIndex: false,
                });
                break;
              }

              case 'Site Feed': {
                feedTestDataGenerated = TestDataGenerator.generateFeed({
                  scope: 'site',
                  siteId: siteDetails.siteId,
                  withAttachment: testData.hasAttachment,
                  fileName: testData.fileName,
                  fileSize: testData.fileSize,
                  mimeType: testData.mimeType,
                  filePath: testData.filePath,
                  waitForSearchIndex: false,
                });
                break;
              }

              case 'Content Feed': {
                feedTestDataGenerated = TestDataGenerator.generateFeed({
                  scope: 'site',
                  siteId: siteDetails.siteId,
                  contentId: pageDetails.contentId,
                  withAttachment: testData.hasAttachment,
                  fileName: testData.fileName,
                  fileSize: testData.fileSize,
                  mimeType: testData.mimeType,
                  filePath: testData.filePath,
                  waitForSearchIndex: false,
                });
                break;
              }

              default:
                throw new Error(`Unknown feed type: ${testData.feedType}`);
            }

            // Create feed via API
            feedResponse = await feedManagementHelper.createFeed(feedTestDataGenerated);
            createdPostText = feedTestDataGenerated.text;
            createdPostId = feedResponse.result.feedId;
            fileId = feedResponse.result.listOfFiles[0].fileId;

            console.log(`Created feed with attachment via API: ${feedResponse.result.feedId}`);

            // Navigate to feed URL
            await appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
            await appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
          }
        );

        test.afterEach('Cleanup created posts', async ({ feedManagementHelper }) => {
          if (createdPostId) {
            await feedManagementHelper.deleteFeed(createdPostId);
            createdPostId = '';
          }
        });

        test(
          `Verify Delete File from File Preview Page doesn't appears on ${testData.feedType}`,
          {
            tag: [TestPriority.P0, TestGroupType.SMOKE, `@${testData.storyId}`],
          },
          async () => {
            tagTest(test.info(), {
              description: testData.description,
              zephyrTestId: testData.storyId,
              storyId: testData.storyId,
            });

            // Execute file deletion flow
            await appManagerFeedPage.actions.clickInfoIcon(fileId);
            await appManagerFeedPage.actions.verifyPreviewModalIsOpened();
            await appManagerFeedPage.actions.clickShowMoreButton();
            await appManagerFeedPage.actions.clickDeleteButton();
            await appManagerFeedPage.assertions.verifyImageButtonIsNotVisible();
          }
        );
      });
    }
  }
);
