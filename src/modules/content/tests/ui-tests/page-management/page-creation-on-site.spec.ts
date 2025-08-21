import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TEST_DATA } from '../../../test-data/sites-create.test-data';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
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

        // Construct the site dashboard URL
        siteDashboardUrl = `${process.env.FRONTEND_BASE_URL}/site/${createdSite.siteId}/dashboard`;
        console.log(`Constructed site dashboard URL: ${siteDashboardUrl}`);
      }
    );

    test.afterEach(async ({ appManagerApiClient }) => {
      //delete the published page only if the page is published
      if (publishedPageId) {
        console.log('site id to publish page', siteIdToPublishPage);
        console.log('content id to delete', publishedPageId);
        await appManagerApiClient.getContentManagementService().deleteContent(siteIdToPublishPage, publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }

      // Clean up the created site
      if (createdSite?.siteId) {
        console.log(`Cleaning up created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);
        await appManagerApiClient.getSiteManagementService().deactivateSite(createdSite.siteId);
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

        //Navigate to page creation from the site dashboard
        pageCreationPage = new PageCreationPage(appManagerHomePage.page);
        await pageCreationPage.actions.navigateToAddContentModal();
        await pageCreationPage.actions.completeContentCreationFromSiteDashboard(ContentType.PAGE);

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

        //handle the promotion
        await pageCreationPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await pageCreationPage.assertions.verifyContentPublishedSuccessfully(title);
      }
    );
  }
);
