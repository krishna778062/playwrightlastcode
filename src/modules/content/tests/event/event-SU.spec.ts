import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { CONTENT_TEST_DATA } from '../../test-data/content.test-data';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';

test.describe(
  ContentTestSuite.EVENT_SU,
  {
    tag: [ContentTestSuite.EVENT_SU],
  },
  () => {
    let eventCreationPage: EventCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishEvent: string;
    let publishedEventId: string;
    let manualCleanupNeeded = false;
    let homePage: NewUxHomePage | OldUxHomePage;

    test.beforeEach(
      'Setting up the test environment for event creation',
      async ({ standardUserHomePage, standardUserPage }) => {
        // Create home page instance and verify it's loaded
        await standardUserHomePage.verifyThePageIsLoaded();

        // Initialize preview page
        contentPreviewPage = new ContentPreviewPage(
          standardUserPage,
          siteIdToPublishEvent,
          publishedEventId,
          ContentType.EVENT
        );

        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
      }
    );

    test.afterEach(async ({ contentManagementHelper }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedEventId && siteIdToPublishEvent) {
        await contentManagementHelper.deleteContent(siteIdToPublishEvent, publishedEventId);
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
      async ({ standardUserHomePage }) => {
        tagTest(test.info(), {
          description: 'Event Content Add attach file with all the Mandatory fields',
          zephyrTestId: 'CONT-18537',
          storyId: 'CONT-18537',
        });

        eventCreationPage = (await standardUserHomePage.actions.openCreateContentPageForContentType(
          ContentType.EVENT
        )) as EventCreationPage;

        // Generate event data using TestDataGenerator
        const eventCreationOptions = TestDataGenerator.generateEvent(
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );

        // Create and publish the event
        const { eventId, siteId } = await eventCreationPage.actions.createAndSubmitEvent(eventCreationOptions);

        // Store IDs for cleanup
        publishedEventId = eventId;
        siteIdToPublishEvent = siteId;
        manualCleanupNeeded = true;

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          eventCreationOptions.title,
          'Submitted page for approval'
        );
      }
    );
  }
);
