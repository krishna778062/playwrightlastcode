import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

test.describe(
  'feed Site Image Fallback Tests',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let createdFeedId: string;
    let siteId: string;
    const siteName: string = 'All Employees';
    let contentId: string;
    let pageName: string;
    let siteDashboardPage: SiteDashboardPage;
    let siteImageFileId: string;

    test.beforeEach('Setup test environment and data creation', async ({ appManagerFixture }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

      // Initialize feed page
      appManagerFeedPage = new FeedPage(appManagerFixture.page);

      // Get or create a public site with site image

      siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);

      // Verify site image exists on site dashboard and get the site image fileId
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
      await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard to verify site image' });

      // Get site details to retrieve the site iconImage fileId for verification
      const siteDetails = await appManagerFixture.siteManagementHelper.siteManagementService.getSiteDetails(siteId);
      const siteImageUrl = siteDetails.result?.img;
      if (!siteImageUrl) {
        throw new Error(`Site ${siteName} (${siteId}) does not have an iconImage. Cannot verify site image fallback.`);
      }
      // Extract fileId from the site image URL
      siteImageFileId = siteImageUrl.split('/').pop() || siteImageUrl;

      console.log(`Site image URL: ${siteImageUrl}`);
      console.log(`Site image fileId: ${siteImageFileId}`);

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

      // Share the content to Home Feed via API
      const feedResponse = await appManagerFixture.feedManagementHelper.createFeed({
        scope: 'content',
        siteId: siteId,
        contentId: contentId,
        options: {
          waitForSearchIndex: false,
        },
      });

      createdFeedId = feedResponse.result.feedId;
      console.log(`Created feed for content ${contentId} with feed ID: ${createdFeedId}`);
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
      'verify App Manager shares content without image and site image is shown in feed',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-36283'],
      },
      async ({ appManagerFixture: _appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that the site image is rendered in the feed when the shared content has no square or landscape image',
          zephyrTestId: 'CONT-36283',
          storyId: 'CONT-36283',
        });

        // Navigate directly to the feed URL to see the shared content
        await appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdFeedId));

        // Verify that the feed card for the shared content is displayed

        // Verify that the site image is rendered as the fallback image in the feed card
        // This verifies that the image shown is the same as the site's iconImage
        await appManagerFeedPage.assertions.verifySiteImageInFeedCard(pageName, siteId, siteImageFileId);
      }
    );
  }
);
