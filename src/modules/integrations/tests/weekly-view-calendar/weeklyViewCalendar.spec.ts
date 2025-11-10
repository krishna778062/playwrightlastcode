import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import {
  createGoogleEventPayload,
  createOutlookEventPayload,
} from '@/src/modules/integrations/test-data/calendarEventSync.test-data';
import { CalendarPage } from '@/src/modules/integrations/ui/pages/eventCalendarPage';
import { EventDetailPage, RsvpOption } from '@/src/modules/integrations/ui/pages/eventDetailPage';
import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

test.describe(
  'weekly view calendar',
  {
    tag: [
      IntegrationsSuiteTags.INTEGRATIONS,
      IntegrationsSuiteTags.PHOENIX,
      IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR,
    ],
  },
  () => {
    test.afterEach(async ({ appManagerFixture }) => {
      const calendarPage = new CalendarPage(appManagerFixture.page);
      await calendarPage.actions.navigateToCalendarPage();
      await calendarPage.actions.selectCalendarView('Week');
      await calendarPage.actions.resetFiltersForEvents();
    });

    test(
      'verify that user is able to see and select the weekly view option on events calendar page',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
          IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR,
          IntegrationsSuiteTags.HEALTH_CHECK,
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify that weekly view calendar page content is displayed correctly',
          zephyrTestId: ['INT-28422', 'INT-28424'],
        });

        const calendarPage = new CalendarPage(appManagerFixture.page);

        // Navigate to weekly view calendar page
        await calendarPage.actions.navigateToCalendarPage();

        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);
        await calendarPage.assertions.verifyThePageIsLoaded();

        // select month view
        await calendarPage.actions.selectCalendarView('Month');
        await calendarPage.assertions.verifyTwentyFourHourSlots(false);
      }
    );

    test(
      'verify that user is able to toggle between past and future week events',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
          IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR,
          IntegrationsSuiteTags.HEALTH_CHECK,
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28423',
        });

        const calendarPage = new CalendarPage(appManagerFixture.page);

        // Navigate to weekly view calendar page
        await calendarPage.actions.navigateToCalendarPage();

        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);
        // await calendarPage.assertions.verifyThePageIsLoaded();

        await calendarPage.actions.pressRightAndLeftArrowButtons(4, 0);
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(false);

        await calendarPage.actions.pressRightAndLeftArrowButtons(0, 4);
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(true);
      }
    );

    test(
      'verify that all the created events are visible on the respective dates under weekly view',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
          IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR,
          IntegrationsSuiteTags.HEALTH_CHECK,
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28441',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const contentManagementHelper = new ContentManagementHelper(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // Create a test site for the events
        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const testSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          category,
          siteName: `Calendar Test Site ${Date.now()}`,
        });

        const siteId = testSite.siteId;

        // Create Google Test Event with Google Calendar sync enabled
        const googleEventTitle = 'Google Test Event';

        const googleEventPayload = createGoogleEventPayload({
          title: googleEventTitle,
          description: 'Test event for Google Calendar sync verification',
          location: 'Google Test Location',
          organizerId,
        });

        await contentManagementHelper.contentManagementService.addNewEventContent(siteId, googleEventPayload);

        // Create Outlook Test Event with Outlook Calendar sync enabled
        const outlookEventTitle = 'Outlook Test Event';
        const outlookEventPayload = createOutlookEventPayload({
          title: outlookEventTitle,
          description: 'Test event for Outlook Calendar sync verification',
          location: 'Outlook Test Location',
          organizerId,
        });

        await contentManagementHelper.contentManagementService.addNewEventContent(siteId, outlookEventPayload);

        // Navigate to weekly view calendar page
        const calendarPage = new CalendarPage(appManagerFixture.page);
        await calendarPage.actions.navigateToCalendarPage();

        // Select week view
        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);

        // Verify both Google and Outlook test events are visible
        await calendarPage.assertions.verifyGoogleAndOutlookTestEvents(true, true);
      }
    );

    test(
      'verify that user is able use all the filters under weekly view',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28462',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const contentManagementHelper = new ContentManagementHelper(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // Create a test site for the events
        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const testSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          category,
          siteName: `Calendar RSVP Test Site ${Date.now()}`,
        });

        const siteId = testSite.siteId;

        // Create Google Test Event with Google Calendar sync enabled
        const googleEventTitle = 'Google Test Event';

        const googleEventPayload = createGoogleEventPayload({
          title: googleEventTitle,
          description: 'Test event for Google Calendar RSVP verification',
          location: 'Google Test Location',
          organizerId,
        });

        const googleEventResult = await contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          googleEventPayload
        );

        // Create Outlook Test Event with Outlook Calendar sync enabled
        const outlookEventTitle = 'Outlook Test Event';
        const outlookEventPayload = createOutlookEventPayload({
          title: outlookEventTitle,
          description: 'Test event for Outlook Calendar RSVP verification',
          location: 'Outlook Test Location',
          organizerId,
        });

        const outlookEventResult = await contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          outlookEventPayload
        );

        // Navigate to Google event detail page and RSVP as Yes
        const googleEventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, googleEventResult.eventId);
        await googleEventDetailPage.loadPage();
        await googleEventDetailPage.assertions.verifyThePageIsLoaded();
        await googleEventDetailPage.assertions.verifyEventTitle(googleEventTitle);
        await googleEventDetailPage.actions.clickRsvpOption(RsvpOption.YES);
        await googleEventDetailPage.assertions.verifyRsvpSelection('yes');

        // Navigate to Outlook event detail page and RSVP as No
        const outlookEventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, outlookEventResult.eventId);
        await outlookEventDetailPage.loadPage();
        await outlookEventDetailPage.assertions.verifyThePageIsLoaded();
        await outlookEventDetailPage.assertions.verifyEventTitle(outlookEventTitle);
        await outlookEventDetailPage.actions.clickRsvpOption(RsvpOption.NO);
        await outlookEventDetailPage.assertions.verifyRsvpSelection('no');

        // Navigate to weekly view calendar page
        const calendarPage = new CalendarPage(appManagerFixture.page);
        await calendarPage.actions.navigateToCalendarPage();

        // Select week view
        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);

        // click on Yes No Filters
        await calendarPage.actions.selectFiltersForEvents('Yes');
        await calendarPage.assertions.verifyGoogleAndOutlookTestEvents(true, false);

        await calendarPage.actions.navigateToCalendarPage();
        await calendarPage.actions.selectCalendarView('Week');

        // reset filters
        await calendarPage.actions.resetFiltersForEvents();

        await calendarPage.actions.selectFiltersForEvents('No');
        await calendarPage.assertions.verifyGoogleAndOutlookTestEvents(false, true);
      }
    );

    test(
      'verify that user is able to see events based on selected or connected calendar type',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
          IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR,
          IntegrationsSuiteTags.HEALTH_CHECK,
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28463',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const contentManagementHelper = new ContentManagementHelper(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // Create a test site for the events
        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const testSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          category,
          siteName: `Calendar View Test Site ${Date.now()}`,
        });

        const siteId = testSite.siteId;

        // Create Google Test Event with Google Calendar sync enabled
        const googleEventTitle = 'Google Test Event';

        const googleEventPayload = createGoogleEventPayload({
          title: googleEventTitle,
          description: 'Test event for Google Calendar view verification',
          location: 'Google Test Location',
          organizerId,
        });

        await contentManagementHelper.contentManagementService.addNewEventContent(siteId, googleEventPayload);

        // Create Outlook Test Event with Outlook Calendar sync enabled
        const outlookEventTitle = 'Outlook Test Event';
        const outlookEventPayload = createOutlookEventPayload({
          title: outlookEventTitle,
          description: 'Test event for Outlook Calendar view verification',
          location: 'Outlook Test Location',
          organizerId,
        });

        await contentManagementHelper.contentManagementService.addNewEventContent(siteId, outlookEventPayload);

        // Navigate to weekly view calendar page
        const calendarPage = new CalendarPage(appManagerFixture.page);
        await calendarPage.actions.navigateToCalendarPage();

        // Select week view
        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);

        // View Google calendar - should show only Google event, not Outlook
        await calendarPage.actions.calendarToView('Google');
        await calendarPage.assertions.verifyGoogleAndOutlookTestEvents(true, false);
      }
    );

    test(
      'verify that clicking on Today button navigates back to todays date in weekly calendar view',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28972',
        });

        const calendarPage = new CalendarPage(appManagerFixture.page);

        // Navigate to weekly view calendar page
        await calendarPage.actions.navigateToCalendarPage();

        // Select week view
        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);
        await calendarPage.assertions.verifyThePageIsLoaded();

        // Verify today's date is visible initially
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(true);

        // Move forward 4 weeks - today's date should not be visible
        await calendarPage.actions.pressRightAndLeftArrowButtons(4, 0);
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(false);

        // Click Today button - should navigate back to today's date
        await calendarPage.actions.clickTodayButton();
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(true);

        // Move backward 4 weeks - today's date should not be visible
        await calendarPage.actions.pressRightAndLeftArrowButtons(0, 4);
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(false);

        // Click Today button again - should navigate back to today's date
        await calendarPage.actions.clickTodayButton();
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(true);
      }
    );

    test(
      'verify that user is able to select between colour choices and apply colour related settings',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
          IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR,
          IntegrationsSuiteTags.HEALTH_CHECK,
        ],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28464',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const contentManagementHelper = new ContentManagementHelper(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // Create a test site for the events
        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const testSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          category,
          siteName: `Calendar View Test Site ${Date.now()}`,
        });

        const siteId = testSite.siteId;

        // Create Google Test Event with Google Calendar sync enabled
        const googleEventTitle = 'Google Test Event';

        const googleEventPayload = createGoogleEventPayload({
          title: googleEventTitle,
          description: 'Test event for Google Calendar view verification',
          location: 'Google Test Location',
          organizerId,
        });

        const googleEventResult = await contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          googleEventPayload
        );

        // RSVP as Yes
        const googleEventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, googleEventResult.eventId);
        await googleEventDetailPage.loadPage();
        await googleEventDetailPage.assertions.verifyThePageIsLoaded();
        await googleEventDetailPage.assertions.verifyEventTitle(googleEventTitle);
        await googleEventDetailPage.actions.clickRsvpOption(RsvpOption.YES);
        await googleEventDetailPage.assertions.verifyRsvpSelection('yes');

        // Navigate to weekly view calendar page
        const calendarPage = new CalendarPage(appManagerFixture.page);
        await calendarPage.actions.navigateToCalendarPage();

        // Select week view
        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);

        await calendarPage.actions.calendarToView('Google');

        // Apply RSVP Yes filter
        await calendarPage.actions.selectFiltersForEvents('Yes');

        let ariaLabel = await calendarPage.actions.selectGoogleEventColor('2');
        await calendarPage.assertions.verifyGoogleEventColor(ariaLabel);

        ariaLabel = await calendarPage.actions.selectGoogleEventColor('1');
        await calendarPage.assertions.verifyGoogleEventColor(ariaLabel);
      }
    );

    test(
      'create multiple Google Calendar events at the same time for today',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY, IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR],
      },
      async ({ appManagerFixture }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Create multiple Google Calendar events with same time slot for today',
          zephyrTestId: ['INT-28461'],
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const contentManagementHelper = new ContentManagementHelper(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // Create a test site for the events
        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const testSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          category,
          siteName: `Calendar Test Site ${Date.now()}`,
        });

        const siteId = testSite.siteId;

        // Set up times for today's date - 11:00 PM to 11:45 PM
        const startTime = new Date();
        startTime.setHours(23, 0, 0, 0); // Start at 11:00 PM today

        const endTime = new Date(startTime);
        endTime.setHours(23, 45, 0, 0); // End at 11:45 PM

        const timezone = 'Asia/Kolkata';

        // Create 3 Google Calendar events at the same time
        const numberOfEvents = 3;
        const eventPromises = [];

        for (let i = 1; i <= numberOfEvents; i++) {
          const eventTitle = `Google Event ${i} - Same Time Slot`;
          const googleEventPayload = {
            ...createGoogleEventPayload({
              title: eventTitle,
              description: `Test event ${i} for same time slot verification`,
              location: `Location ${i}`,
              organizerId,
              startDate: startTime,
              endDate: endTime,
              timezone,
            }),
            isAllDay: false,
            startsAt: startTime.toISOString(),
            endsAt: endTime.toISOString(),
          };

          eventPromises.push(
            contentManagementHelper.contentManagementService.addNewEventContent(siteId, googleEventPayload)
          );
        }

        // Create all events in parallel
        await Promise.all(eventPromises);

        // Wait for events to sync to Google Calendar
        await appManagerFixture.page.waitForTimeout(10000);

        // Then navigate to weekly view calendar page
        const calendarPage = new CalendarPage(appManagerFixture.page);
        await calendarPage.actions.navigateToCalendarPage();

        // Select week view
        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);

        // Verify today's date is visible
        await calendarPage.assertions.verifyVisibilityOfTodaysDate(true);

        // Verify +more events button is visible for overlapping events
        await calendarPage.assertions.verifyMoreEventsButtonIsVisible();
      }
    );
  }
);
