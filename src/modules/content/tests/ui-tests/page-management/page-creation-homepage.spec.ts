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
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentSuiteTags.PAGE_CREATION,
  {
    tag: [ContentSuiteTags.PAGE_CREATION],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    test.beforeEach(
      'Setting up the test environment for page creation by creating new site',
      async ({ appManagerHomePage }) => {
        // Create home page instance and navigate to page creation
        await appManagerHomePage.verifyThePageIsLoaded();
        pageCreationPage = (await appManagerHomePage.actions.openCreateContentPageForContentType(
          ContentType.PAGE
        )) as PageCreationPage;
      }
    );

    test(
      'Verify admin is able to publish a new page created with cover image from home page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });

        // Generate page data using TestDataGenerator
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );

        // Use the new wrapper method to create and publish the page
        await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Initialize preview page and handle the promotion
        const contentPreviewPage = new ContentPreviewPage(pageCreationPage.page);
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(pageCreationOptions.title);
      }
    );
  }
);
