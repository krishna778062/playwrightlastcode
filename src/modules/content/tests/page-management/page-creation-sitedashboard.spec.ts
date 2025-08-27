import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/previewPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  `${ContentSuiteTags.PAGE_CREATION} - ${ContentSuiteTags.SITE_DASHBOARD}`,
  {
    tag: [ContentSuiteTags.PAGE_CREATION, ContentSuiteTags.SITE_DASHBOARD],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let siteIdToPublishPage: string;
    let createdSite: any;
    let siteDashboardPage: SiteDashboardPage;
    let contentPreviewPage: ContentPreviewPage;

    test.beforeEach(
      `Setting up the test environment for page creation by creating new site`,
      async ({ appManagerApiClient, siteManagementHelper, appManagersPage }) => {
        // Get category and create site using helper
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
        contentPreviewPage = new ContentPreviewPage(appManagersPage);

        //flow
        await siteDashboardPage.loadPage();
        pageCreationPage = await siteDashboardPage.actions.navigateToPageCreationFromSiteDashboard();
      }
    );

    test(
      'Verify admin is able to publish a new page created with cover image from site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image from site dashboard',
          zephyrTestId: 'CONT-XXXX',
          storyId: 'CONT-XXXX',
        });

        // Generate page data using TestDataGenerator
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          'uncategorized'
        );

        // Use the new wrapper method to create and publish the page
        await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);
        //store the page id (siteIdToPublishPage is already set in beforeEach)
        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();
        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(pageCreationOptions.title);
      }
    );
  }
);
