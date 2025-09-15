import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { ContentPreviewPage } from '@content/pages/contentPreviewPage';
import { EventCreationPage } from '@content/pages/eventCreationPage';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  `Event Creation by Standard user  and Approval/Rejection by Application Manager`,
  {
    tag: [ContentTestSuite.EVENT_STANDARD_USER, ContentSuiteTags.EVENT_CREATION],
  },
  () => {
    let eventCreationPage: EventCreationPage;
    let contentPreviewPageStandardUser: ContentPreviewPage;
    let contentPreviewPageAppManager: ContentPreviewPage;
    let publishedEventId: string;
    let siteIdToPublishEvent: string;
    let manualCleanupNeeded = false;

    test.beforeEach(
      'Setting up the test environment for event creation',
      async ({ standardUserHomePage, standardUserPage }) => {
        // Create home page instance and verify it's loaded
        await standardUserHomePage.verifyThePageIsLoaded();

        // Initialize preview page
        contentPreviewPageStandardUser = new ContentPreviewPage(
          standardUserPage,
          siteIdToPublishEvent,
          publishedEventId,
          ContentType.EVENT
        );

        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
      }
    );

    test.afterEach(async ({ appManagerApiClient }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedEventId && siteIdToPublishEvent) {
        await appManagerApiClient.getContentManagementService().deleteContent(siteIdToPublishEvent, publishedEventId);
        console.log('Manual cleanup completed for event:', publishedEventId);
      } else {
        console.log('No event was published, hence skipping the deletion');
      }
    });

    // Test data for approve/reject scenarios
    const EVENT_APPROVAL_TEST_DATA = [
      {
        action: 'Approve & publish',
        displayName: 'Approved by Application Manager',
        zephyrTestId: 'CONT-18537',
        storyId: 'CONT-39210',
        description:
          'Event Content Add attach file with all the Mandatory fields by Standard user and approved by Application Manager',
        actionSuccessMessage: 'Event approved and published',
        finalNotificationMessage: 'Application Manager1 approved',
      },
      {
        action: 'Reject',
        displayName: 'Rejected by Application Manager',
        zephyrTestId: 'CONT-10273',
        storyId: 'CONT-10273',
        description:
          'Event Content Add attach file with all the Mandatory fields by Standard user and rejected by Application Manager',
        actionSuccessMessage: 'Event rejected',
        finalNotificationMessage: 'Application Manager1 rejected',
      },
    ] as const;

    for (const testData of EVENT_APPROVAL_TEST_DATA) {
      test(
        `Event Content Add attach file with all the Mandatory fields by Standard user and ${testData.displayName}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.EVENT_CREATION],
        },
        async ({ standardUserHomePage, appManagerHomePage, siteManagementHelper }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.zephyrTestId,
            storyId: testData.storyId,
          });

          // Initialize preview page for app manager
          contentPreviewPageAppManager = new ContentPreviewPage(
            appManagerHomePage.page,
            siteIdToPublishEvent,
            publishedEventId,
            ContentType.EVENT
          );

          // Navigate to event creation by standard user
          eventCreationPage = (await standardUserHomePage.actions.openCreateContentPageForContentType(
            ContentType.EVENT,
            siteManagementHelper
          )) as EventCreationPage;

          // Generate event data using TestDataGenerator
          const eventCreationOptions = TestDataGenerator.generateEvent(
            CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
          );

          // Create and submit the event
          const { eventId, siteId, peopleId, peopleName } =
            await eventCreationPage.actions.createAndSubmitEvent(eventCreationOptions);

          // Store IDs for cleanup
          publishedEventId = eventId;
          siteIdToPublishEvent = siteId;
          manualCleanupNeeded = true;

          // Verify content was submitted successfully
          await contentPreviewPageStandardUser.assertions.verifyContentPublishedSuccessfully(
            eventCreationOptions.title,
            'Submitted event for approval'
          );

          await contentPreviewPageStandardUser.assertions.verifyContentStatus('Pending');

          // Handle notification and perform action (approve/reject)
          const notificationComponentAppManager = await appManagerHomePage.actions.clickOnBellIcon({
            stepInfo: 'Application Manager clicking on bell icon to view notifications',
          });
          const notificationMessage =
            peopleName + ' submitted a event for approval "' + eventCreationOptions.title + '"';
          await notificationComponentAppManager.actions.clickOnNotification(notificationMessage);

          // Perform approve or reject action
          await contentPreviewPageAppManager.actions.clickOnApproveOrRejectButton(testData.action);
          if (testData.action === 'Reject') {
            await contentPreviewPageAppManager.actions.enterRejectReason('Test reason');
          }
          await contentPreviewPageAppManager.assertions.verifyContentPublishedSuccessfully(
            eventCreationOptions.title,
            testData.actionSuccessMessage
          );

          const notificationMessageStandardUser = await standardUserHomePage.actions.clickOnBellIcon({
            stepInfo: 'Standard user clicking on bell icon to view notifications',
          });
          const finalNotificationMessage = testData.finalNotificationMessage + ' "' + eventCreationOptions.title + '"';
          await notificationMessageStandardUser.actions.clickOnNotification(finalNotificationMessage);

          if (testData.action === 'Approve & publish') {
            await contentPreviewPageStandardUser.assertions.verifyContentIsInPublishedStatus();
          } else {
            await contentPreviewPageStandardUser.assertions.verifyContentStatus('Rejected');
            await contentPreviewPageStandardUser.assertions.verifyContentHasSubmitForApprovalButton();
          }
        }
      );
    }
  }
);
