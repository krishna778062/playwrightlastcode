import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { EventCreationPage } from '@content/ui/pages/eventCreationPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';

test.describe(
  ContentTestSuite.EVENT_APP_MANAGER,
  {
    tag: [ContentTestSuite.EVENT_APP_MANAGER],
  },
  () => {
    let eventCreationPage: EventCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishEvent: string;
    let publishedEventId: string;
    let manualCleanupNeeded = false;

    test.beforeEach('Setting up the test environment for event creation', async ({ appManagerFixture }) => {
      // Create home page instance and verify it's loaded
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach(async ({ appManagerFixture }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedEventId && siteIdToPublishEvent) {
        await appManagerFixture.contentManagementHelper.deleteContent(siteIdToPublishEvent, publishedEventId);
        console.log('Manual cleanup completed for event:', publishedEventId);
      } else {
        console.log('No event was published, hence skipping the deletion');
      }
    });

    test(
      'Event Content Add attach file with all the Mandatory fields',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.EVENT_CREATION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Event Content Add attach file with all the Mandatory fields',
          zephyrTestId: 'CONT-10824',
          storyId: 'CONT-10824',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        eventCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.EVENT
        )) as EventCreationPage;
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteIdToPublishEvent,
          publishedEventId,
          ContentType.EVENT
        );

        // Generate event data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const eventCreationOptions = TestDataGenerator.generateEvent(imagePath);

        // Create and publish the event
        const { eventId, siteId } = await eventCreationPage.actions.createAndPublishEvent(eventCreationOptions);

        // Store IDs for cleanup
        publishedEventId = eventId;
        siteIdToPublishEvent = siteId;
        manualCleanupNeeded = true;

        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          eventCreationOptions.title,
          "Created event successfully - it's published"
        );
      }
    );
  }
);
