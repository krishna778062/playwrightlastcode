import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@core/utils/dateUtil';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { CONTENT_TEST_DATA } from '../../test-data/content.test-data';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  ContentTestSuite.EVENT + ' - SU Tests',
  {
    tag: [ContentTestSuite.EVENT],
  },
  () => {
    let eventCreationPage: EventCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishEvent: string;
    let publishedEventId: string;
    let manualCleanupNeeded = false;
    let homePage: NewUxHomePage;

    test.beforeEach('Setting up the test environment for event creation', async ({ page, loginAs }) => {
      await loginAs('endUser');

      // Create home page instance
      homePage = new NewUxHomePage(page);
      await homePage.verifyThePageIsLoaded();
    });

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
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'Event Content Add attach file with all the Mandatory fields',
          zephyrTestId: 'CONT-10344',
          storyId: 'CONT-10344',
        });

        eventCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.EVENT
        )) as EventCreationPage;
        contentPreviewPage = new ContentPreviewPage(page);

        // Generate event data using TestDataGenerator
        const eventCreationOptions = TestDataGenerator.generateEvent(
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );

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

        console.log(`Created event: ${eventCreationOptions.title} with ID: ${eventId} in site: ${siteId}`);
      }
    );
  }
);
