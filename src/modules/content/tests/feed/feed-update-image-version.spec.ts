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

// ==================== HELPER FUNCTIONS ====================

/**
 * Creates required resources based on feed type (API only - no page objects needed)
 * @param helpers - Required helper instances
 * @param options - Configuration for what to create
 * @returns Promise with created resources
 */
async function createSiteAndContentByOptions(
  helpers: {
    siteManagementHelper: any;
    contentManagementHelper: any;
  },
  options: {
    createSite?: boolean;
    createPage?: boolean;
  }
) {
  const resources: any = {};

  if (options.createSite) {
    const siteResult = await helpers.siteManagementHelper.createPublicSite({ waitForSearchIndex: false });
    resources.siteDetails = siteResult;
  }

  if (options.createPage) {
    const siteResult = await helpers.siteManagementHelper.createPublicSite({ waitForSearchIndex: false });
    const pageResult = await helpers.contentManagementHelper.createPage({
      siteId: siteResult.siteId,
      contentInfo: {
        contentType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.content,
        contentSubType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.contentType,
      },
      options: {
        contentDescription: 'Auto-generated content for feed test',
        waitForSearchIndex: false,
      },
    });
    resources.siteDetails = siteResult;
    resources.pageDetails = pageResult;
  }

  return resources;
}

test.describe(
  '@FeedImageUpdate - Feed Image Version Update Tests',
  {
    tag: [ContentTestSuite.FEED_IMAGE_UPDATE_APP_MANAGER],
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
      fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
      fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
      mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
      filePath: FileUtil.getFilePath(
        __dirname,
        '..',
        '..',
        'test-data',
        'static-files',
        'images',
        FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName
      ),
    };

    // Updated image configuration for version update
    const updatedImageConfig = {
      filePath: FileUtil.getFilePath(
        __dirname,
        '..',
        '..',
        'test-data',
        'static-files',
        'images',
        FEED_TEST_DATA.UPDATED_FEED_CONTENT.fileName
      ),
    };

    // Test data for different feed types
    const feedTestData = [
      {
        feedType: 'Home Feed',
        scope: 'public',
        description: 'Verify user can update image version in Home Feed',
        storyId: 'CONT-36286',
        ...commonAttachmentConfig,
      },
      {
        feedType: 'Site Feed',
        scope: 'site',
        description: 'Verify user can update image version in Site Feed',
        storyId: 'CONT-39628',
        ...commonAttachmentConfig,
      },
      {
        feedType: 'Content Feed',
        scope: 'site',
        description: 'Verify user can update image version in Content Feed',
        storyId: 'CONT-39629',
        ...commonAttachmentConfig,
      },
    ];

    // Data-driven test for different feed types
    for (const testData of feedTestData) {
      test.describe(`${testData.feedType} Tests`, () => {
        let feedTestDataGenerated: any;
        let originalFileId: string;
        let updatedFileId: string;

        test.beforeEach(
          'Setup test environment and data creation',
          async ({ appManagerHomePage, contentManagementHelper, siteManagementHelper, feedManagementHelper }) => {
            // Configure app governance settings and enable timeline comment post(feed)
            await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });
            // Initialize feed page
            appManagerFeedPage = new FeedPage(appManagerHomePage.page);

            // Create site and content resources based on feed type
            const needsSite = testData.feedType === 'Site Feed' || testData.feedType === 'Content Feed';
            const needsPage = testData.feedType === 'Content Feed';

            const resources = await createSiteAndContentByOptions(
              { siteManagementHelper, contentManagementHelper },
              {
                createSite: needsSite,
                createPage: needsPage,
              }
            );

            // Assign created resources
            if (resources.siteDetails) {
              siteDetails = resources.siteDetails;
            }
            if (resources.pageDetails) {
              pageDetails = resources.pageDetails;
            }

            // Generate feed data based on feed type
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
            originalFileId = feedResponse.result.listOfFiles[0].fileId;

            console.log(`Created feed with image via API: ${feedResponse.result.feedId}`);

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
          `Verify user can update image version on ${testData.feedType}`,
          {
            tag: [TestPriority.P1, TestGroupType.REGRESSION, `@${testData.storyId}`],
          },
          async ({ feedManagementHelper }) => {
            tagTest(test.info(), {
              description: testData.description,
              zephyrTestId: testData.storyId,
              storyId: testData.storyId,
            });

            await appManagerFeedPage.assertions.verifyVersionImageIsDisplayed(originalFileId);
            await appManagerFeedPage.actions.clickInfoIcon(originalFileId);
            await appManagerFeedPage.actions.verifyPreviewModalIsOpened();
            await appManagerFeedPage.actions.clickOnInfoIconOnImage();
            await appManagerFeedPage.actions.clickOnEditVersionButton();
            await appManagerFeedPage.assertions.verifyVersionNumber('1');
            const responseURL = await appManagerFeedPage.actions.uploadImage(updatedImageConfig.filePath);
            if (testData.feedType === 'Home Feed') {
              updatedFileId = responseURL.split('/u/o/')[1].split('?')[0];
            } else {
              updatedFileId = responseURL.split('/u/r/')[1].split('?')[0];
            }

            await appManagerFeedPage.actions.clickOnUploadButton(updatedFileId);
            await appManagerFeedPage.assertions.verifyToastMessage('Added new version successfully');
            await appManagerFeedPage.assertions.verifyVersionNumber('2');
            await appManagerFeedPage.actions.clickOnCloseButton();
            //referesh the page
            await appManagerFeedPage.page.reload();
            await appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
            await appManagerFeedPage.actions.verifyVersionImageIsDisplayed(updatedFileId);
          }
        );
      });
    }
  }
);
