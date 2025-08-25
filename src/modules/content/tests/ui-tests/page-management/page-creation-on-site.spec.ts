import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';
import { getSiteDashboardUrl } from '@core/utils/urlUtils';

import { PreviewPage } from '../../../pages/previewPage';
import { SITE_TEST_DATA } from '../../../test-data/sites-create.test-data';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

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
    let siteDashboardUrl: string;

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

        // Construct the site dashboard URL using utility method
        siteDashboardUrl = getSiteDashboardUrl(createdSite.siteId);
        console.log(`Constructed site dashboard URL: ${siteDashboardUrl}`);
      }
    );

    test.afterEach(async ({ contentCleanup }) => {
      // Delete the published page only if the page is published
      if (publishedPageId) {
        await contentCleanup.cleanupContent(siteIdToPublishPage, publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }
    });

    test(
      'Verify admin is able to publish a new page created with cover image from site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image',
          zephyrTestId: 'CONT-XXXX',
          storyId: 'CONT-XXXX',
        });

        // Navigate to the constructed site dashboard URL
        await appManagerHomePage.page.goto(siteDashboardUrl);

        // Navigate from site dashboard to page creation
        const siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page);
        await siteDashboardPage.actions.navigateToPageCreationFromSiteDashboard(ContentType.PAGE);

        // Initialize page creation page (we're now on the actual page creation page)
        pageCreationPage = new PageCreationPage(appManagerHomePage.page);

        const title = `Automated Test Page ${faker.company.name()} - ${faker.commerce.productName()}`;
        const description = `This is an automated test description ${faker.lorem.paragraph()}`;

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage({
          title,
          description,
          category: 'uncategorized',
          contentType: PageContentType.NEWS,
          coverImage: {
            fileName: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
            cropOptions: {
              widescreen: false,
              square: false,
            },
          },
        });

        //store the page id (siteIdToPublishPage is already set in beforeEach)
        publishedPageId = pageId;

        // Initialize preview page and handle the promotion
        const previewPage = new PreviewPage(appManagerHomePage.page);
        await previewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await previewPage.assertions.verifyContentPublishedSuccessfully(title);
      }
    );
  }
);
