import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { EventCreationPage } from '@content/ui/pages/eventCreationPage';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SiteFeedPage } from '@content/ui/pages/sitePages/siteFeedPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { getPastDate, getUpcomingDate } from '@/src/modules/content/utils/dateHelper';

test.describe(
  `event Creation by Standard user  and Approval/Rejection by Application Manager`,
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

    test.beforeEach('Setting up the test environment for event creation', async ({ standardUserFixture }) => {
      // Create home page instance and verify it's loaded
      await standardUserFixture.homePage.verifyThePageIsLoaded();

      // Initialize preview page
      contentPreviewPageStandardUser = new ContentPreviewPage(
        standardUserFixture.page,
        siteIdToPublishEvent,
        publishedEventId,
        ContentType.EVENT
      );

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
        notificationMessage: ' approved',
      },
      {
        action: 'Reject',
        displayName: 'Rejected by Application Manager',
        zephyrTestId: 'CONT-10273',
        storyId: 'CONT-10273',
        description:
          'Event Content Add attach file with all the Mandatory fields by Standard user and rejected by Application Manager',
        actionSuccessMessage: 'Event rejected',
        notificationMessage: ' rejected',
      },
    ] as const;

    for (const testData of EVENT_APPROVAL_TEST_DATA) {
      test(
        `Event Content Add attach file with all the Mandatory fields by Standard user and ${testData.displayName}`,
        {
          tag: [
            TestPriority.P0,
            TestGroupType.SMOKE,
            TestGroupType.REGRESSION,
            ContentSuiteTags.EVENT_CREATION,
            `@${testData.storyId}`,
          ],
        },
        async ({ appManagerFixture, standardUserFixture, appManagerApiFixture }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.zephyrTestId,
            storyId: testData.storyId,
          });

          // Initialize preview page for app manager
          contentPreviewPageAppManager = new ContentPreviewPage(
            appManagerFixture.page,
            siteIdToPublishEvent,
            publishedEventId,
            ContentType.EVENT
          );
          await standardUserFixture.homePage.verifyThePageIsLoaded();

          const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.endUser.email
          );
          const site = await appManagerFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
            [endUserInfo.userId],
            SITE_TYPES.PUBLIC
          );
          // Navigate to event creation by standard user
          eventCreationPage = (await standardUserFixture.navigationHelper.openCreateContentPageForContentType(
            ContentType.EVENT,
            { siteName: site.siteName }
          )) as EventCreationPage;

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

          await appManagerFixture.page.reload();
          // Handle notification and perform action (approve/reject)
          const notificationComponentAppManager = await appManagerFixture.navigationHelper.clickOnBellIcon({
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

          await standardUserFixture.page.reload();
          const notificationMessageStandardUser = await standardUserFixture.navigationHelper.clickOnBellIcon({
            stepInfo: 'Standard user clicking on bell icon to view notifications',
          });
          const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.appManager.email
          );
          const finalNotificationMessage =
            appManagerInfo.fullName + testData.notificationMessage + ' "' + eventCreationOptions.title + '"';
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

    test(
      'verify past events do not appear and upcoming events appear in Upcoming Events Smart Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19572'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify, past events should not appear in the Upcoming Events Smart Feed block on Home and Site Feed, while present (upcoming) events should appear',
          zephyrTestId: 'CONT-19572',
          storyId: 'CONT-19572',
        });

        // Search existing site "All Employees"
        const allEmployeesSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(
          FEED_TEST_DATA.EVENT_SMART_FEED.SITE_NAME
        );

        // Add a new event with location GGN and past date
        eventCreationPage = (await standardUserFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.EVENT,
          { siteName: FEED_TEST_DATA.EVENT_SMART_FEED.SITE_NAME }
        )) as EventCreationPage;

        const pastEventTitle = `Past Event ${Date.now()}`;
        const pastEventOptions = TestDataGenerator.generateEvent(undefined, getPastDate(7), getPastDate(6), {
          title: pastEventTitle,
          description: 'Test past event description',
          location: FEED_TEST_DATA.EVENT_SMART_FEED.EVENT_LOCATION,
        });

        // Publish the event
        const { eventId: pastEventId, siteId: pastEventSiteId } =
          await eventCreationPage.actions.createAndPublishEvent(pastEventOptions);

        // Store for cleanup
        publishedEventId = pastEventId;
        siteIdToPublishEvent = pastEventSiteId;
        manualCleanupNeeded = true;

        // Check Home - Global Feed: past event should not appear in Upcoming Events
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const homeFeedPage = new FeedPage(standardUserFixture.page);
        await homeFeedPage.verifyThePageIsLoaded();
        await homeFeedPage.assertions.verifyEventNotInUpcomingEventsBlock(pastEventTitle);

        // Check Site Feed: past event should not appear in Upcoming Events
        const siteFeedPage = new SiteFeedPage(standardUserFixture.page, allEmployeesSiteId);
        await siteFeedPage.navigateToTab(SitePageTab.FeedTab);
        await siteFeedPage.verifyThePageIsLoaded();
        const siteFeedPageForValidation = new FeedPage(standardUserFixture.page);
        await siteFeedPageForValidation.assertions.verifyEventNotInUpcomingEventsBlock(pastEventTitle);

        await standardUserFixture.navigationHelper.clickOnGlobalFeed();

        // Create another event with a present date (valid upcoming event)
        eventCreationPage = (await standardUserFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.EVENT,
          { siteName: FEED_TEST_DATA.EVENT_SMART_FEED.SITE_NAME }
        )) as EventCreationPage;

        const upcomingEventTitle = `Upcoming Event ${Date.now()}`;
        const upcomingEventOptions = TestDataGenerator.generateEvent(
          undefined,
          getUpcomingDate(1),
          getUpcomingDate(2),
          {
            title: upcomingEventTitle,
            description: 'Test upcoming event description',
            location: FEED_TEST_DATA.EVENT_SMART_FEED.EVENT_LOCATION,
          }
        );

        // Publish the event
        const { eventId: upcomingEventId, siteId: upcomingEventSiteId } =
          await eventCreationPage.actions.createAndPublishEvent(upcomingEventOptions);

        // Update cleanup to handle both events (cleanup the last one)
        publishedEventId = upcomingEventId;
        siteIdToPublishEvent = upcomingEventSiteId;

        // Check Home - Global Feed: upcoming event should appear
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.reloadPage();
        await homeFeedPage.assertions.verifyEventInUpcomingEventsBlock(upcomingEventTitle);

        // Check Site Feed: upcoming event should appear
        await siteFeedPage.navigateToTab(SitePageTab.FeedTab);
        await siteFeedPage.verifyThePageIsLoaded();
        await siteFeedPageForValidation.assertions.verifyEventInUpcomingEventsBlock(upcomingEventTitle);

        // Delete both events
        if (pastEventId && pastEventSiteId) {
          try {
            await appManagerFixture.contentManagementHelper.deleteContent(pastEventSiteId, pastEventId);
            console.log(`Deleted past event: ${pastEventId}`);
          } catch (error) {
            console.warn(`Failed to delete past event ${pastEventId}:`, error);
          }
        }
      }
    );
  }
);
