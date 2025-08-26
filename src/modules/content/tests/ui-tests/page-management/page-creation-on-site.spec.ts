import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/previewPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  ContentSuiteTags.PAGE_CREATION_ON_SITE,
  {
    tag: [ContentSuiteTags.PAGE_CREATION_ON_SITE],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let publishedPageId: string;
    let siteIdToPublishPage: string;
    let createdSite: any;

    test.beforeEach(
      `Setting up the test environment for page creation by creating new site`,
      async ({ appManagerApiClient, siteManagementHelper }) => {
        // Get category and create site using helper
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite(undefined, category, {
          access: SITE_TEST_DATA[0].siteType,
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

        // Store the site ID for page publishing
        siteIdToPublishPage = createdSite.siteId;
      }
    );

    test(
      'Verify admin is able to publish a new page created with cover image from site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE],
      },
      async ({ appManagerHomePage }) => {
        // Test metadata constant
        const testMetadata = {
          description: 'Verify admin is able to publish a new page created with cover image',
          zephyrTestId: 'CONT-XXXX',
          storyId: 'CONT-XXXX',
        };

        tagTest(test.info(), testMetadata);

        // Navigate from site dashboard to page creation
        const siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, siteIdToPublishPage);
        await siteDashboardPage.loadPage();
        pageCreationPage = (await siteDashboardPage.actions.navigateToPageCreationFromSiteDashboard(
          ContentType.PAGE
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          'uncategorized'
        );

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        //store the page id (siteIdToPublishPage is already set in beforeEach)
        publishedPageId = pageId;

        // Initialize preview page and handle the promotion
        const contentPreviewPage = new ContentPreviewPage(appManagerHomePage.page);
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(pageCreationOptions.title);
      }
    );
  }
);
