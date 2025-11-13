import { ContentType } from '@content/constants/contentType';
import { PageContentType } from '@content/constants/pageContentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@content/test-data/sites-create.test-data';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { PageCreationPage } from '@content/ui/pages/pageCreationPage';
import { PROJECT_ROOT } from '@core/constants/paths';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { FileUtil } from '@core/utils/fileUtil';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { NewHomePage } from '@/src/core';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
test.describe(
  `page Creation by Application Manager`,
  {
    tag: [ContentTestSuite.PAGE_APP_MANAGER, ContentSuiteTags.PAGE_CREATION],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishPage: string;
    let publishedPageId: string;
    let createdSite: any;
    let siteDashboardPage: SiteDashboardPage;
    let manualCleanupNeeded = false;
    let homePage: NewHomePage;

    test.beforeEach(
      'Setting up the test environment for page creation by opening page creation page from home page',
      async ({ appManagerFixture }) => {
        // Create home page instance and navigate to page creation
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );

        // Initialize additional page objects for the moved test cases
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
        homePage = new NewHomePage(appManagerFixture.page);

        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
      }
    );

    test.afterEach(async ({ appManagerFixture }) => {
      const contentManagementHelper = appManagerFixture.contentManagementHelper;
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedPageId && siteIdToPublishPage) {
        await contentManagementHelper.deleteContent(siteIdToPublishPage, publishedPageId);
        console.log('Manual cleanup completed for page:', publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }
    });

    test(
      'verify admin is able to publish a new page created with cover image from home page',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentFeatureTags.COVER_IMAGE,
          ContentSuiteTags.PAGE_CREATION,
          '@CONT-11635',
          '@healthcheck',
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image from home page',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        pageCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          PROJECT_ROOT,
          'src',
          'modules',
          'content',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath);

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
      'verify admin is able to publish a new page created with cover image from site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE, ContentSuiteTags.PAGE_CREATION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image from site dashboard',
          zephyrTestId: 'CONT-39089',
          storyId: 'CONT-39089',
        });
        const category = await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId(
          SITE_TEST_DATA[0].category
        );
        createdSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          category,
          overrides: { access: SITE_TEST_DATA[0].siteType },
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

        // Store the site ID for page publishing
        siteIdToPublishPage = createdSite.siteId;
        // Navigate from site dashboard to page creation
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteIdToPublishPage);

        //flow
        await siteDashboardPage.loadPage();
        pageCreationPage = await siteDashboardPage.navigateToPageCreation();

        // Generate page data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          PROJECT_ROOT,
          'src',
          'modules',
          'content',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath, 'uncategorized');

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store page ID for cleanup (siteIdToPublishPage is already set above)
        publishedPageId = pageId;

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );

        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();
      }
    );
  }
);
