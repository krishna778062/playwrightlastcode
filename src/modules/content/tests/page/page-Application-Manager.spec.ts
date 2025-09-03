import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  ContentTestSuite.PAGE_APP_MANAGER,
  {
    tag: [ContentTestSuite.PAGE_APP_MANAGER],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishPage: string;
    let publishedPageId: string;
    let createdSite: any;
    let siteDashboardPage: SiteDashboardPage;
    let manualCleanupNeeded = false;

    test.beforeEach(
      'Setting up the test environment for page creation by opening page creation page from home page',
      async ({ appManagerHomePage, appManagersPage }) => {
        // Create home page instance and navigate to page creation
        await appManagerHomePage.verifyThePageIsLoaded();
        contentPreviewPage = new ContentPreviewPage(
          appManagersPage,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );
        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
      }
    );

    test.afterEach(async ({ contentManagementHelper }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedPageId && siteIdToPublishPage) {
        await contentManagementHelper.deleteContent(siteIdToPublishPage, publishedPageId);
        console.log('Manual cleanup completed for page:', publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }
    });

    test(
      'Verify admin is able to publish a new page created with cover image from home page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE, ContentSuiteTags.PAGE_CREATION],
      },
      async ({ appManagerHomePage, appManagersPage }) => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image from home page',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });

        pageCreationPage = (await appManagerHomePage.actions.openCreateContentPageForContentType(
          ContentType.PAGE
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );

        // Use the new wrapper method to create and publish the page
        const { pageId, siteId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store IDs for cleanup
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;
        manualCleanupNeeded = true;

        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );

        console.log(`Created page: ${pageCreationOptions.title} with ID: ${pageId} in site: ${siteId}`);
      }
    );
    test(
      'Verify admin is able to publish a new page created with cover image from site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE, ContentSuiteTags.PAGE_CREATION],
      },
      async ({ appManagerApiClient, siteManagementHelper, appManagersPage }) => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image from site dashboard',
          zephyrTestId: 'CONT-39089',
          storyId: 'CONT-39089',
        });
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite({
          category,
          overrides: { access: SITE_TEST_DATA[0].siteType },
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

        // Store the site ID for page publishing
        siteIdToPublishPage = createdSite.siteId;
        // Navigate from site dashboard to page creation
        siteDashboardPage = new SiteDashboardPage(appManagersPage, siteIdToPublishPage);

        //flow
        await siteDashboardPage.loadPage();
        pageCreationPage = await siteDashboardPage.actions.navigateToPageCreationFromSiteDashboard();

        // Generate page data using TestDataGenerator
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          'uncategorized'
        );

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store page ID for cleanup (siteIdToPublishPage is already set above)
        publishedPageId = pageId;

        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );
      }
    );
  }
);
