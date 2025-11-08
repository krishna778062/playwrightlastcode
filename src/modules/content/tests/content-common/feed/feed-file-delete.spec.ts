import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SiteDashboardPage } from '../../../ui/pages/sitePages';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';

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
 * @param testData - Test data configuration
 * @returns Promise with created resources
 */
async function getPrerequisiteData(
  helpers: {
    siteManagementHelper: any;
    contentManagementHelper: any;
  },
  testData: any
) {
  const resources: any = {};

  // Create site only once, even if both createSite and createPage are true
  if (testData.feedType === 'Site Feed') {
    const siteResult = await helpers.siteManagementHelper.getSiteByAccessType('public');
    resources.siteId = siteResult;
  }

  if (testData.feedType === 'Content Feed') {
    const response = await helpers.contentManagementHelper.getContentId();
    resources.contentId = response.contentId;
    resources.siteId = response.siteId;
  }

  return resources;
}

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
    description: "Verify Delete File from File Preview Page doesn't appear on Home Feed",
    storyId: 'CONT-36287',
    ...commonAttachmentConfig,
  },
  {
    feedType: 'Site Feed',
    scope: 'site',
    description: "Verify Delete File from File Preview Page doesn't appear on Site Feed",
    storyId: 'CONT-39351',
    ...commonAttachmentConfig,
  },
  {
    feedType: 'Content Feed',
    scope: 'site',
    description: "Verify Delete File from File Preview Page doesn't appear on Content Feed",
    storyId: 'CONT-39352',
    ...commonAttachmentConfig,
  },
];

// Data-driven test for different feed types
for (const testData of feedTestData) {
  test.describe(
    `@FeedFileDelete - ${testData.feedType} File Deletion Tests`,
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
      let contentPreviewPage: ContentPreviewPage;
      let siteDashboardPage: SiteDashboardPage;
      let feedTestDataGenerated: any;
      let fileId: string;

      test.beforeEach('Setup test environment and data creation', async ({ appManagerFixture }) => {
        // Configure app governance settings and enable timeline comment post(feed)
        /** await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */
        // Initialize feed page
        appManagerFeedPage = new FeedPage(appManagerFixture.page);
        const resources = await getPrerequisiteData(
          {
            siteManagementHelper: appManagerFixture.siteManagementHelper,
            contentManagementHelper: appManagerFixture.contentManagementHelper,
          },
          testData
        );

        // Assign created resources
        if (resources.siteId) {
          siteDetails = {
            siteId: resources.siteId,
            siteName: '',
            categoryId: '',
            categoryName: '',
            access: '',
          };
        }
        if (resources.contentId) {
          siteDetails = {
            siteId: resources.siteId,
            siteName: '',
            categoryId: '',
            categoryName: '',
            access: '',
          };
          pageDetails = {
            contentId: resources.contentId,
            siteId: resources.siteId,
            pageName: '',
            authorName: '',
            contentDescription: '',
          };
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
        feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestDataGenerated);
        createdPostText = feedTestDataGenerated.text;
        createdPostId = feedResponse.result.feedId;
        fileId = feedResponse.result.listOfFiles[0].fileId;

        console.log(`Created feed with attachment via API: ${feedResponse.result.feedId}`);

        // Navigate to feed URL
        if (testData.feedType === 'Content Feed') {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            siteDetails.siteId,
            pageDetails.contentId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        } else if (testData.feedType === 'Site Feed') {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteDetails.siteId);
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.actions.clickOnFeedLink();
        } else if (testData.feedType === 'Home Feed') {
          await appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
        }
        await appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
      });

      test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
        const feedManagementHelper = appManagerFixture.feedManagementHelper;
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
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.assertions.verifyImageButtonIsNotVisible();
        }
      );
    }
  );
}
