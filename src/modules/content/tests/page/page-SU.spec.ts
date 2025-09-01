import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentTestSuite.PAGE_SU,
  {
    tag: [ContentTestSuite.PAGE_SU],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishPage: string;
    let publishedPageId: string;
    let homePage: NewUxHomePage;
    let manualCleanupNeeded = false;

    test.beforeEach(
      'Setting up the test environment for event creation',
      async ({ standardUserHomePage, standardUserPage }) => {
        // Create home page instance and verify it's loaded
        await standardUserHomePage.verifyThePageIsLoaded();

        // Initialize preview page
        contentPreviewPage = new ContentPreviewPage(standardUserPage);

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
      'Verify SU is able to publish a new page created with cover image from home page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE, ContentSuiteTags.PAGE_CREATION],
      },
      async ({ standardUserHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify SU is able to publish a new page created with cover image from home page',
          zephyrTestId: 'CONT-1378',
          storyId: 'CONT-1378',
        });

        pageCreationPage = (await standardUserHomePage.actions.openCreateContentPageForContentType(
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
      }
    );
  }
);
