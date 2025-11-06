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
    test(
      'verify that user is able to see and select the weekly view option on events calendar page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR],
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, IntegrationsSuiteTags.WEEKLY_VIEW_CALENDAR],
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
          '@INT-28441',
        ],
      },
      async ({ appManagerFixture }) => {
        test.setTimeout(300000);
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
        // duration is whole week
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const timezone = 'Asia/Kolkata';
        const googleEventPayload = createGoogleEventPayload({
          title: googleEventTitle,
          description: 'Test event for Google Calendar sync verification',
          location: 'Google Test Location',
          organizerId,
          startDate,
          endDate,
          timezone,
        });

        await contentManagementHelper.contentManagementService.addNewEventContent(siteId, googleEventPayload);

        // Create Outlook Test Event with Outlook Calendar sync enabled
        const outlookEventTitle = 'Outlook Test Event';
        const outlookEventPayload = createOutlookEventPayload({
          title: outlookEventTitle,
          description: 'Test event for Outlook Calendar sync verification',
          location: 'Outlook Test Location',
          organizerId,
          startDate,
          endDate,
          timezone,
        });

        await contentManagementHelper.contentManagementService.addNewEventContent(siteId, outlookEventPayload);

        // Navigate to weekly view calendar page
        const calendarPage = new CalendarPage(appManagerFixture.page);
        await calendarPage.actions.navigateToCalendarPage();

        // Select week view
        await calendarPage.actions.selectCalendarView('Week');
        await calendarPage.assertions.verifyTwentyFourHourSlots(true);

        // Verify both Google and Outlook test events are visible
        await calendarPage.assertions.verifyGoogleAndOutlookTestEvents();
      }
    );
  }
);
