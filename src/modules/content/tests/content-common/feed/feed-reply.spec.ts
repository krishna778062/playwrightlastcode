import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SiteDashboardPage } from '../../../ui/pages/sitePages';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
// import { SiteDashboardPage } from '@/src/modules/content/ui/pages/siteDashboardPage';

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
    const siteResult = await helpers.siteManagementHelper.getSiteWithAccessType({ accessType: 'public' });
    resources.siteId = siteResult;
  }

  if (testData.feedType === 'Content Feed') {
    const response = await helpers.contentManagementHelper.getContentId();
    resources.contentId = response.contentId;
    resources.siteId = response.siteId;
  }

  return resources;
}

// Common feed configuration for all test cases
const commonFeedConfig = {
  hasAttachment: false as const,
  waitForSearchIndex: false,
};

// Test data for different feed types
const feedTestData = [
  {
    feedType: 'Home Feed',
    scope: 'public',
    description: 'Verify user can add reply to Home Feed post',
    storyId: 'CONT-39688',
    ...commonFeedConfig,
  },
  {
    feedType: 'Site Feed',
    scope: 'site',
    description: 'Verify user can add reply to Site Feed post',
    storyId: 'CONT-39687',
    ...commonFeedConfig,
  },
  {
    feedType: 'Content Feed',
    scope: 'site',
    description: 'Verify user can add reply to Content Feed post',
    storyId: 'CONT-26347',
    ...commonFeedConfig,
  },
];

// Data-driven test for different feed types
for (const testData of feedTestData) {
  test.describe(
    `${testData.feedType} Tests`,
    {
      tag: [ContentTestSuite.FEED_REPLY_APP_MANAGER],
    },
    () => {
      let appManagerFeedPage: FeedPage;
      let createdPostText: string;
      let createdPostId: string;
      let siteId: string;
      let contentId: string;
      let feedResponse: FeedResponse;
      let siteDashboardPage: SiteDashboardPage;
      let feedTestDataGenerated: any;
      let replyText: string;
      let contentPreviewPage: ContentPreviewPage;

      test.beforeEach(
        'Setup test environment and data creation',
        async ({ appManagerHomePage, contentManagementHelper, siteManagementHelper, feedManagementHelper }) => {
          // Configure app governance settings and enable timeline comment post(feed)
          await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });
          // Initialize feed page
          appManagerFeedPage = new FeedPage(appManagerHomePage.page);
          const resources = await getPrerequisiteData({ siteManagementHelper, contentManagementHelper }, testData);

          // Assign created resources
          if (resources.siteId) {
            siteId = resources.siteId;
          }
          if (resources.contentId) {
            siteId = resources.siteId;
            contentId = resources.contentId;
          }

          console.log('spec siteId: ', siteId);
          console.log('spec contentId: ', contentId);

          // Generate feed data based on feed type
          switch (testData.feedType) {
            case 'Home Feed': {
              feedTestDataGenerated = TestDataGenerator.generateFeed({
                scope: 'public',
                siteId: undefined,
                withAttachment: testData.hasAttachment,
                waitForSearchIndex: testData.waitForSearchIndex,
              });
              break;
            }

            case 'Site Feed': {
              feedTestDataGenerated = TestDataGenerator.generateFeed({
                scope: 'site',
                siteId: siteId,
                withAttachment: testData.hasAttachment,
                waitForSearchIndex: testData.waitForSearchIndex,
              });
              break;
            }

            case 'Content Feed': {
              feedTestDataGenerated = TestDataGenerator.generateFeed({
                scope: 'site',
                siteId: siteId,
                contentId: contentId,
                withAttachment: testData.hasAttachment,
                waitForSearchIndex: testData.waitForSearchIndex,
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
          // Generate reply text
          replyText = TestDataGenerator.generateRandomText('Reply to feed post', 3, true);
          console.log(`Created feed via API: ${feedResponse.result.feedId}`);

          // Navigate to feed URL
          if (testData.feedType === 'Content Feed') {
            contentPreviewPage = new ContentPreviewPage(
              appManagerHomePage.page,
              siteId,
              contentId,
              ContentType.PAGE.toLowerCase()
            );
            await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          } else if (testData.feedType === 'Site Feed') {
            siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, siteId);
            await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
            await siteDashboardPage.actions.clickOnFeedLink();
          } else if (testData.feedType === 'Home Feed') {
            await appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
          }
          //await appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText);
        }
      );

      test.afterEach('Cleanup created posts', async ({ feedManagementHelper }) => {
        if (createdPostId) {
          await feedManagementHelper.deleteFeed(createdPostId);
          createdPostId = '';
        }
      });

      test(
        `Verify user can add reply to ${testData.feedType} post`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION, `@${testData.storyId}`],
        },
        async ({ appManagerHomePage, feedManagementHelper }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.storyId,
            storyId: testData.storyId,
          });

          // Add reply to the feed post
          await appManagerFeedPage.actions.addReplyToPost(replyText);

          // Verify reply is associated with the correct post
          await appManagerFeedPage.assertions.verifyReplyIsVisible(replyText);

          // Click reply show more button
          await appManagerFeedPage.actions.clickReplyShowMoreButton();

          // Click delete button
          await appManagerFeedPage.actions.clickOnDeleteReplyButton();

          // Verify delete button is visible
          await appManagerFeedPage.assertions.verifyReplyIsNotVisible(replyText);
        }
      );
    }
  );
}
