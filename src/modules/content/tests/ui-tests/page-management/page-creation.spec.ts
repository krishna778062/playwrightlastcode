import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { PageCreationAssertions } from '@/src/modules/content/helpers/pageCreationAssertions';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { HomePage as NewUxHomePage } from '@/src/core/pages/newUx/homePage';
import { HomePage as OldUxHomePage } from '@/src/core/pages/oldUx/homePage';
import { PageCreationActions } from '@/src/modules/content/helpers/pageCreationActions';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';

test.describe(
  '@PageCreation',
  {
    tag: [ContentTestSuite.PAGE_CREATION, ContentTestSuite.COVER_IMAGE],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let pageCreationActions: PageCreationActions;
    let pageCreationAssertions: PageCreationAssertions;
    let publishedPageId: string;
    let siteIdToPublishPage: string;

    test.beforeEach(async ({ adminPage }: { adminPage: Page }) => {
        // Initialize the content creation page based on UX flag
        const HomePage = getEnvConfig().newUxEnabled ? NewUxHomePage : OldUxHomePage;
        const homePage = new HomePage(adminPage);
        pageCreationPage = await homePage.actions.openCreateContentPageForContentType(ContentType.PAGE) as PageCreationPage;
        
        // Initialize actions and assertions
        pageCreationActions = pageCreationPage.actions as PageCreationActions;
        pageCreationAssertions = pageCreationPage.assertions as PageCreationAssertions;
      });

    test.afterEach(async ({appManagerApiClient}) => {
      //delete the published page only if the page is published
      if (publishedPageId) {
        await appManagerApiClient.getContentManagementService().deleteContent(siteIdToPublishPage, publishedPageId);
      }
      else{
        console.log('No page was published, hence skipping the deletion');
      }
    });

    test(
      'Verify admin is able to publish a new page created with cover image',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, "@cover-image"],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });

        const title = `Automated Test Page ${faker.company.name()} - ${faker.commerce.productName()}`;
        const description = `This is an automated test description ${faker.lorem.paragraph()}`;
        
        // Use the new wrapper method to create and publish the page
        const {pageId, siteId} = await pageCreationActions.createAndPublishPage({
          title,
          description,
          category: "uncategorized",
          contentType: PageContentType.NEWS,
          coverImage: {
            fileName: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
            cropOptions: {
              widescreen: false,
              square: false
            }
          }
        });

        //store the page id
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;

        //handle the promotion
        await pageCreationActions.handlePagePromotion({
          skipPromotion: true,
        });

        // Verify content was published successfully via UI
        await pageCreationAssertions.verifyContentPublishedSuccessfully(title);
      }
    );
  }
); 