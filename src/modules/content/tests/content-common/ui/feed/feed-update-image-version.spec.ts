import { ContentType } from '@content/constants/contentType';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

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
    resources.siteId = siteResult.siteId;
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
  fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
  fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
  mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
  filePath: FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname),
};

// Updated image configuration for version update
const updatedImageConfig = {
  filePath: FILE_TEST_DATA.IMAGES.IMAGE3.getPath(__dirname),
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
  test.describe(
    `${testData.feedType} Tests`,
    {
      tag: [ContentTestSuite.FEED_IMAGE_UPDATE_APP_MANAGER],
    },
    () => {
      test.fixme(testData.feedType === 'Content Feed', 'Content feed is not rightly implemented or api error');
      test.fixme(testData.feedType === 'Site Feed', 'Site feed is not rightly implemented or api error');

      let appManagerFeedPage: FeedPage;
      let createdPostText: string;
      let createdPostId: string;
      let siteDetails: SiteDetails;
      let pageDetails: PageDetails;
      let feedResponse: FeedResponse;
      let feedTestDataGenerated: any;
      let originalFileId: string;
      let updatedFileId: string;
      let contentPreviewPage: ContentPreviewPage;
      let siteDashboardPage: SiteDashboardPage;

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
        originalFileId = feedResponse.result.listOfFiles[0].fileId;

        console.log(`Created feed with image via API: ${feedResponse.result.feedId}`);

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
          await siteDashboardPage.clickOnFeedLink();
        } else if (testData.feedType === 'Home Feed') {
          await appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
        }
        await appManagerFeedPage.feedList.waitForPostToBeVisible(createdPostText);
      });

      test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
        const feedManagementHelper = appManagerFixture.feedManagementHelper;
        if (createdPostId) {
          await feedManagementHelper.deleteFeed(createdPostId);
          createdPostId = '';
        }
      });

      test(
        `Verify user can update image version on ${testData.feedType} ${testData.storyId}`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION, `@${testData.storyId}`],
        },
        async ({}) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.storyId,
            storyId: testData.storyId,
          });

          await appManagerFeedPage.feedList.verifyVersionImageIsDisplayed(originalFileId);
          await appManagerFeedPage.feedList.clickInfoIcon(originalFileId);
          await appManagerFeedPage.filePreview.verifyPreviewModalIsOpened();
          await appManagerFeedPage.filePreview.clickOnInfoIconOnImage();
          await appManagerFeedPage.filePreview.clickOnEditVersionButton();
          await appManagerFeedPage.filePreview.verifyVersionNumber('1');
          const responseURL = await appManagerFeedPage.filePreview.uploadImage(updatedImageConfig.filePath);
          if (testData.feedType === 'Home Feed') {
            updatedFileId = responseURL.split('/u/o/')[1].split('?')[0];
          } else {
            updatedFileId = responseURL.split('/u/r/')[1].split('?')[0];
          }

          await appManagerFeedPage.filePreview.clickOnUploadButton(updatedFileId);
          await appManagerFeedPage.feedList.verifyToastMessageIsVisibleWithText(
            FEED_TEST_DATA.TOAST_MESSAGES.ADDED_NEW_VERSION
          );
          await appManagerFeedPage.filePreview.verifyVersionNumber('2');
          await appManagerFeedPage.filePreview.clickOnCloseButton();
          //referesh the page
          await appManagerFeedPage.page.reload();
          await appManagerFeedPage.feedList.waitForPostToBeVisible(createdPostText);
          await appManagerFeedPage.feedList.verifyVersionImageIsDisplayed(updatedFileId);
        }
      );
    }
  );
}

// ==================== SITE IMAGE FALLBACK TESTS ====================

test.describe(
  'feed Site Image Fallback Tests',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let createdFeedId: string;
    let createdFeedText: string;
    let siteId: string;
    const siteName: string = DEFAULT_PUBLIC_SITE_NAME;
    let contentId: string;
    let pageName: string;
    let siteDashboardPage: SiteDashboardPage;
    let siteImageFileId: string;

    test.beforeEach('Setup test environment and data creation', async ({ appManagerFixture }) => {
      // Initialize feed page
      appManagerFeedPage = new FeedPage(appManagerFixture.page);

      // Get or create a public site with site image

      siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);

      // Verify site image exists on site dashboard and get the site image fileId
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
      await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard to verify site image' });

      // Get site details to retrieve the site iconImage fileId for verification
      let siteDetails = await appManagerFixture.siteManagementHelper.getSiteDetails(siteId);
      let siteImageUrl = siteDetails.result?.img;
      if (!siteImageUrl) {
        await siteDashboardPage.actions.uploadSiteImage(FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname));
        await siteDashboardPage.assertions.verifyToastMessage(
          FEED_TEST_DATA.TOAST_MESSAGES.SET_SITE_IMAGE_SUCCESSFULLY
        );
        await siteDashboardPage.page.reload();
        await siteDashboardPage.assertions.verifyThePageIsLoaded();
        siteDetails = await appManagerFixture.siteManagementHelper.getSiteDetails(siteId);
        siteImageUrl = siteDetails.result?.img;
      }
      // Extract fileId from the site image URL
      siteImageFileId = siteImageUrl.split('/').pop() || siteImageUrl;

      // Create a page without images (no cover image)
      const pageResult = await appManagerFixture.contentManagementHelper.createPage({
        siteId: siteId,
        contentInfo: {
          contentType: 'page',
          contentSubType: 'news',
        },
        options: {
          waitForSearchIndex: false,
        },
      });

      contentId = pageResult.contentId;
      pageName = pageResult.pageName;

      const contentPreviewPage = new ContentPreviewPage(
        appManagerFixture.page,
        siteId,
        contentId,
        ContentType.PAGE.toLowerCase()
      );

      await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
      await contentPreviewPage.verifyThePageIsLoaded();
      await contentPreviewPage.actions.clickShareThoughtsButton();

      createdFeedText = FEED_TEST_DATA.POST_TEXT.COMMENT;

      const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
      const feedResponse = await createFeedPostComponent.actions.createAndPost({ text: createdFeedText });
      createdFeedId = feedResponse.postId || '';
    });

    test.afterEach('Cleanup created resources', async ({ appManagerFixture }) => {
      // Cleanup feed post
      if (createdFeedId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdFeedId);
          createdFeedId = '';
        } catch (error) {
          console.warn('Failed to cleanup feed:', error);
        }
      }

      // Cleanup page content
      if (contentId && siteId) {
        try {
          await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
        } catch (error) {
          console.warn('Failed to cleanup page content:', error);
        }
      }
    });

    test(
      'verify App Manager shares content without image and site image is shown in feed CONT-36283',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-36283'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that the site image is rendered in the feed when the shared content has no square or landscape image',
          zephyrTestId: 'CONT-36283',
          storyId: 'CONT-36283',
        });

        // Navigate directly to the feed URL to see the shared content
        const feedDetailPage = new FeedPage(appManagerFixture.page, createdFeedId);
        await feedDetailPage.loadFeedDetailPage({ stepInfo: 'Load feed detail page to verify shared content' });
        await feedDetailPage.verifyFeedDetailPageLoaded();
        await feedDetailPage.assertions.waitForPostToBeVisible(createdFeedText);

        // Verify that the feed card for the shared content is displayed
        await feedDetailPage.actions.reloadFeedDetailPage(createdFeedText);

        // Verify that the site image is rendered as the fallback image in the feed card
        // This verifies that the image shown is the same as the site's iconImage
        await appManagerFeedPage.feedList.verifySiteImageInFeedCard(pageName, siteId, siteImageFileId);
      }
    );
  }
);
