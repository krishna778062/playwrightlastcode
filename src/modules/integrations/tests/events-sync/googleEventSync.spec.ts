/* eslint-disable simple-import-sort/imports */
import { faker } from '@faker-js/faker';
import {
  assertCompleteEventConfiguration,
  assertEventRemovedFromCalendar,
  assertEventSyncedToCalendar,
  createAppManagerGoogleCalendarHelper,
  createEndUserGoogleCalendarHelper,
  GOOGLE_CALENDAR_USERS,
} from '@integrations/apis/helpers/googleCalendarHelper';
import { integrationsEventFixture as test } from '@integrations/fixtures/eventSyncFixture';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '../../constants/testTags';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { EventDetailPage, RsvpOption } from '@/src/modules/integrations/ui/pages/eventDetailPage';
import {
  createGoogleEventPayload as createEventPayload,
  GOOGLE_EVENT_CONFIGS as EVENT_CONFIGS,
  EXPECTED_GOOGLE_EVENT_SYNC_CONFIG as EXPECTED_EVENT_SYNC_CONFIG,
} from '@/src/modules/integrations/test-data/calendarEventSync.test-data';
import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';
import { ExternalAppProvider, ExternalAppsPage } from '../../ui/pages/externalAppsPage';
import { CalendarIntegrationHelper } from '../../apis/helpers/integrationHelper';

test.describe(
  'event Sync Integration Tests',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsFeatureTags.EVENT_SYNC, IntegrationsSuiteTags.PHOENIX],
  },
  () => {
    test(
      '2-Way RSVP Sync: Simpplr ↔ Google Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        tagTest(test.info(), {
          description: 'Test 2-way RSVP sync: Simpplr to Google Calendar and Google Calendar to Simpplr UI',
          zephyrTestId: 'INT-14847, INT-27261',
        });
        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.RSVP_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.RSVP_SYNC.description,
          location: EVENT_CONFIGS.RSVP_SYNC.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);
        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);
        await eventDetailPage.assertions.verifyRsvpIndicators();

        await eventDetailPage.actions.clickRsvpOption(RsvpOption.YES);
        await eventDetailPage.assertions.verifyRsvpSelection('yes');

        // Verify event sync to Google Calendar and extract event ID using new helper class
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(authorEventSyncResult);

        const googleEventId = authorEventSyncResult.event?.id;
        if (!googleEventId) {
          throw new Error(`Google Calendar event not found for "${eventTitle}" - cannot perform 2-way RSVP sync test`);
        }

        const testUserEmail = 'howard.nelson@simpplr.dev';
        await appManagerCalendarHelper.rsvpToEvent('primary', googleEventId, testUserEmail, 'declined');

        // Verify RSVP change syncs back to Simpplr UI
        await eventDetailPage.assertions.verifyRsvpSelection('no', 8);
      }
    );

    test(
      'delete Event and Verify Removal from Google Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        tagTest(test.info(), {
          description: 'Test event deletion sync to Google Calendar',
          zephyrTestId: 'INT-27088',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.DELETE_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.DELETE_TEST.description,
          location: EVENT_CONFIGS.DELETE_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );
        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        // Verify initial sync to Google Calendar using new helper
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const verificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(verificationResult);

        const googleEventId =
          verificationResult.found && verificationResult.event ? verificationResult.event.id : undefined;

        if (!googleEventId) {
          throw new Error(`Google Calendar event not found for "${eventTitle}" - cannot perform deletion sync test`);
        }

        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Delete event
        await eventDetailPage.actions.deleteEvent();

        // Verify event removal from Google Calendar using new helper
        const deletionVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(deletionVerificationResult);
      }
    );

    test(
      'unpublish Event, Verify Removal from Google Calendar, then Republish and Verify Sync',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Test event unpublish/republish sync with Google Calendar',
          zephyrTestId: 'INT-27087, INT-27089',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.UNPUBLISH_REPUBLISH.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.UNPUBLISH_REPUBLISH.description,
          location: EVENT_CONFIGS.UNPUBLISH_REPUBLISH.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Unpublish event
        await eventDetailPage.actions.unpublishEvent();

        // Verify event is removed from Google Calendar after unpublishing
        const unpublishVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(unpublishVerificationResult);

        // Re-Publish event
        await eventDetailPage.actions.publishEvent();

        // Verify event is synced back to Google Calendar after republishing
        const republishVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(republishVerificationResult);
      }
    );

    test(
      'edit Event and Verify Updates Sync to Google Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description: 'Test event edit sync with Google Calendar',
          zephyrTestId: 'INT-14362',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Create event with Google Calendar sync enabled
        const originalEventTitle = `${EVENT_CONFIGS.EDIT_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: originalEventTitle,
          description: EVENT_CONFIGS.EDIT_TEST.description,
          location: EVENT_CONFIGS.EDIT_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(originalEventTitle);

        // Verify event is synced to Google Calendar for author
        assertEventSyncedToCalendar(authorEventSyncResult);

        // Navigate to event detail page and edit the event
        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(originalEventTitle);

        // Edit the event with new details
        const updatedEventTitle = `EDITED - ${originalEventTitle}`;
        const updatedEventDescription = 'UPDATED event description after editing';
        const updatedEventLocation = 'UPDATED Test Location';

        // Edit event
        await eventDetailPage.actions.editEvent({
          title: updatedEventTitle,
          description: updatedEventDescription,
          location: updatedEventLocation,
        });

        // Verify event updates are reflected in Google Calendar using helper class
        const updateVerificationResult = await appManagerCalendarHelper.verifyEventDetailsWithRetry(updatedEventTitle, {
          title: updatedEventTitle,
          description: updatedEventDescription,
          location: updatedEventLocation,
        });

        expect(
          updateVerificationResult.found && updateVerificationResult.detailsMatched,
          `Event updates for "${updatedEventTitle}" should have been synced to Google Calendar after editing.`
        ).toBe(true);
      }
    );

    test(
      'site Deactivation/Reactivation and Google Calendar Event Sync Verification',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture }) => {
        test.setTimeout(360000);
        tagTest(test.info(), {
          description: 'Test site deactivation/reactivation impact on Google Calendar event sync',
          zephyrTestId: 'INT-14871, INT-27342, INT-27341',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const dedicatedTestSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          category,
          siteName: `Site Deactivation Test Site ${faker.string.alphanumeric({ length: 6 })}`,
        });

        const siteId = dedicatedTestSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.SITE_DEACTIVATION.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.SITE_DEACTIVATION.description,
          location: EVENT_CONFIGS.SITE_DEACTIVATION.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Verify event is synced to Google Calendar for author
        assertEventSyncedToCalendar(authorEventSyncResult);

        // STEP 1: Deactivate the site
        await appManagerFixture.siteManagementHelper.siteManagementService.deactivateSite(siteId);

        // Verify event removal from Google Calendar after site deactivation
        const deactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(deactivationEventSyncResult);

        // STEP 2: Reactivate the site
        await appManagerFixture.siteManagementHelper.siteManagementService.activateSite(siteId);

        // Verify event reappears in Google Calendar after site reactivation
        const reactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(reactivationEventSyncResult);
      }
    );

    test(
      'toggle Event Sync Off/On and Verify Google Calendar Sync Behavior',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description:
            'Test event sync toggle behavior - disable sync removes event from Google Calendar, enable sync restores it',
          zephyrTestId: 'INT-27246, INT-27245',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.SYNC_TOGGLE.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.SYNC_TOGGLE.description,
          location: EVENT_CONFIGS.SYNC_TOGGLE.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Verify event is synced to Google Calendar for author
        assertEventSyncedToCalendar(authorEventSyncResult);

        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Disable event sync
        await eventDetailPage.actions.toggleEventSync(false);

        const disableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(disableSyncVerificationResult);

        // Re-enable event sync
        await eventDetailPage.actions.toggleEventSync(true);

        const enableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(enableSyncVerificationResult);
      }
    );

    test(
      'add End User as Site Member after event creation and Verify Event Sync to End User Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description:
            'Test event sync to end user calendar when added as site member - verifies invitee sync functionality',
          zephyrTestId: 'INT-27084',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        // Create event with Google Calendar sync enabled first
        const eventTitle = `${EVENT_CONFIGS.END_USER_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.END_USER_SYNC.description,
          location: EVENT_CONFIGS.END_USER_SYNC.location,
          organizerId,
        });

        await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        // Get user ID for the end user email
        const endUserId = await userManagementService.getUserId(endUserEmail);

        // Add end user as site member
        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(authorEventSyncResult);

        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const endUserVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(endUserVerificationResult);
      }
    );

    test(
      'add End User as Site Member before event creation, Create Event, Verify Sync, Remove Member, Verify Event Removal',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description:
            'Test event sync when user is site member before event creation, then verify event removal when user is removed from site',
          zephyrTestId: 'INT-27247',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';
        const endUserId = await userManagementService.getUserId(endUserEmail);

        // Add end user as site member before creating event

        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        const eventTitle = `${EVENT_CONFIGS.MEMBER_FIRST_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.MEMBER_FIRST_SYNC.description,
          location: EVENT_CONFIGS.MEMBER_FIRST_SYNC.location,
          organizerId,
        });

        await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        // Step 3: Verify event appears in App Manager's calendar using new helper
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Step 4: Verify event appears in End User's Google Calendar (since they were already a site member)
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const initialVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(initialVerificationResult);

        // Step 5: Remove end user from site membership
        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.REMOVE
        );

        // Step 6: Verify event is removed from End User's Google Calendar using new helper

        const removalVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(removalVerificationResult);

        // Step 7: Verify event still exists in App Manager's calendar (should not be affected)
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
      }
    );

    test(
      'non-Member RSVP to Public Site Event and Verify Google Calendar Sync',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName, browser }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Test non-member RSVP to public site event and verify event sync to their Google Calendar',
          zephyrTestId: 'NT-27128, INT-27127',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // End user from QA env who will RSVP as non-member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        // Create second browser context for end user
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();

        // Login as end user
        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: endUserEmail,
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();

        // Step 1: Create event with Google Calendar sync enabled (App Manager)
        const eventTitle = `${EVENT_CONFIGS.NON_MEMBER_RSVP.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.NON_MEMBER_RSVP.description,
          location: EVENT_CONFIGS.NON_MEMBER_RSVP.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        // Step 2: Verify event appears in App Manager's calendar using new helper
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Step 3: Navigate to event as End User (non-member) and RSVP

        // Navigate to the event detail page as end user
        const endUserEventDetailPage = new EventDetailPage(endUserHomePage.page, siteId, eventResult.eventId);
        await endUserEventDetailPage.loadPage();
        await endUserEventDetailPage.assertions.verifyThePageIsLoaded();
        await endUserEventDetailPage.assertions.verifyEventTitle(eventTitle);

        // RSVP as "Yes" from end user (non-member)
        await endUserEventDetailPage.actions.clickRsvpOption(RsvpOption.YES);
        await endUserEventDetailPage.assertions.verifyRsvpSelection('yes', 5);

        // Step 4: Verify event appears in End User's Google Calendar after RSVP using new helper

        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const endUserVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(endUserVerificationResult);

        // Step 5: Verify App Manager calendar still has the event
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(authorEventSyncResult);

        await endUserContext.close();
      }
    );

    test(
      'change Site from Public to Private and Verify Event Attendees Retention for Members',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(360000); // 6 minutes timeout for this comprehensive test
        tagTest(test.info(), {
          description:
            'Test that when a site is changed from public to private, all existing attendees of an event remain retained if they are members/followers of the site',
          zephyrTestId: 'INT-27254',
        });

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';
        const endUserId = await appManagerFixture.userManagementService.getUserId(endUserEmail);

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerFixture.userManagementService.getUserId(appManagerEmail);

        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Step 1: Add end user as site member (while site is public)

        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        // Step 2: Create event with Google Calendar sync enabled
        const eventTitle = `${EVENT_CONFIGS.SITE_ACCESS_CHANGE.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.SITE_ACCESS_CHANGE.description,
          location: EVENT_CONFIGS.SITE_ACCESS_CHANGE.location,
          organizerId,
        });

        await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        // Step 3: Verify initial event sync to both calendars using new helpers
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const initialEndUserVerification = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(initialEndUserVerification);

        // Step 5: Change site from public to private
        await appManagerFixture.siteManagementHelper.siteManagementService.updateSiteAccess(siteId, 'private');

        // Step 6: Verify event still exists in both calendars after site access change
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
        const postChangeEndUserVerification = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(postChangeEndUserVerification);
      }
    );

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      'author of the Event disconnects Google Calendar and Verify Event is removed from Google Calendar for both Author and End User and Reconnect Google Calendar and Verify Event is synced back to Google Calendar for both Author and End User',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          '@disconnectGoogleCalendar',
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        tagTest(test.info(), {
          description:
            'Test author of the Event disconnects Google Calendar and Verify Event is removed from Google Calendar for both Author and End User',
          zephyrTestId: 'NT-27146, INT-27086',
        });
        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        // Login as app manager
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Add end user as site member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';
        const endUserId = await userManagementService.getUserId(endUserEmail);
        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        if (!(await externalAppsPage.getConnectionStatus(ExternalAppProvider.GOOGLE_CALENDAR))) {
          await externalAppsPage.connectGoogleAccountIntegration(
            ExternalAppProvider.GOOGLE_CALENDAR,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.password
          );
          await externalAppsPage.verifyThePageIsLoaded();
        }

        const eventTitle = `${EVENT_CONFIGS.RSVP_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.RSVP_SYNC.description,
          location: EVENT_CONFIGS.RSVP_SYNC.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);
        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);
        await eventDetailPage.assertions.verifyRsvpIndicators();

        // Verify event sync to Google Calendar for both Author and End User
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();

        let authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
        let endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(authorEventSyncResult);
        assertEventSyncedToCalendar(endUserEventSyncResult);

        // Disconnect Google Calendar for Author

        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await externalAppsPage.disconnectIntegration(ExternalAppProvider.GOOGLE_CALENDAR);

        // Verify event is removed from Google Calendar for author and end user
        authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
          maxAttempts: 12,
        });
        endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
          maxAttempts: 12,
        });

        assertEventRemovedFromCalendar(authorEventSyncResult);
        assertEventRemovedFromCalendar(endUserEventSyncResult);

        // Reconnect Google Calendar to app manager
        await externalAppsPage.connectGoogleAccountIntegration(
          ExternalAppProvider.GOOGLE_CALENDAR,
          GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
          GOOGLE_CALENDAR_USERS.APP_MANAGER.password
        );
        await externalAppsPage.verifyThePageIsLoaded();

        // Verify event is synced back to Google Calendar for author and end user
        authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });
        endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });

        assertEventSyncedToCalendar(authorEventSyncResult);
        assertEventSyncedToCalendar(endUserEventSyncResult);
      }
    );
  }
);

// eslint-disable-next-line playwright/no-skipped-test
test.describe.skip(
  'google Calendar App Level Disconnect Tests',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsFeatureTags.EVENT_SYNC, IntegrationsSuiteTags.PHOENIX],
  },
  () => {
    let calendarIntegrationHelper: CalendarIntegrationHelper;
    let externalAppsPage: ExternalAppsPage;
    let isGoogleCalendarDisconnected = false;
    let browser: any;
    let appManagerFixture: any;

    test.afterEach(async () => {
      if (isGoogleCalendarDisconnected) {
        console.log(
          'Inside afterEach for isGoogleCalendarDisconnected ---> google Calendar App Level Disconnect Tests '
        );
        // Re-enable Google Calendar at app level
        await calendarIntegrationHelper.updateCalendarIntegrationConfig({
          googleCalendarEnabled: true,
          outlookEnabled: true,
        });

        // Reconnect Google Calendar at user level for author
        externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();

        const isAuthorConnected = await externalAppsPage.getConnectionStatus(ExternalAppProvider.GOOGLE_CALENDAR);
        if (!isAuthorConnected) {
          await externalAppsPage.connectGoogleAccountIntegration(
            ExternalAppProvider.GOOGLE_CALENDAR,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.password
          );
        }

        // Reconnect Google Calendar at user level for end user
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();
        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com',
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();

        const endUserExternalAppsPage = new ExternalAppsPage(endUserPage);
        await endUserExternalAppsPage.navigateToExternalAppsPage();
        await endUserExternalAppsPage.verifyThePageIsLoaded();

        const isEndUserConnected = await endUserExternalAppsPage.getConnectionStatus(
          ExternalAppProvider.GOOGLE_CALENDAR
        );
        if (!isEndUserConnected) {
          await endUserExternalAppsPage.connectGoogleAccountIntegration(
            ExternalAppProvider.GOOGLE_CALENDAR,
            GOOGLE_CALENDAR_USERS.END_USER.email,
            GOOGLE_CALENDAR_USERS.END_USER.password
          );
        }

        await endUserContext.close();
      }
    });

    test(
      'disconnects Google Calendar from App Level and Verify Event is removed from Google Calendar for both Author and End User',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          '@disconnectGoogleCalendar',
        ],
      },
      async ({ appManagerFixture: fixture, testSiteName, browser: testBrowser }) => {
        test.setTimeout(360000); // 6 minutes timeout
        appManagerFixture = fixture;
        browser = testBrowser;

        tagTest(test.info(), {
          zephyrTestId: 'INT-27332',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        console.log(
          ' disconnects Google Calendar from App Level and Verify Event is removed from Google Calendar for both Author and End User '
        );

        // Login as app manager
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Add end user as site member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';
        const endUserId = await userManagementService.getUserId(endUserEmail);
        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        if (!(await externalAppsPage.getConnectionStatus(ExternalAppProvider.GOOGLE_CALENDAR))) {
          console.log('Connecting Google Calendar for app manager');
          await externalAppsPage.connectGoogleAccountIntegration(
            ExternalAppProvider.GOOGLE_CALENDAR,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.password
          );
          await externalAppsPage.verifyThePageIsLoaded();
        }

        const eventTitle = `${EVENT_CONFIGS.RSVP_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.RSVP_SYNC.description,
          location: EVENT_CONFIGS.RSVP_SYNC.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);
        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);
        await eventDetailPage.assertions.verifyRsvpIndicators();

        // Verify event sync to Google Calendar for both Author and End User
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();

        let authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
        let endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(authorEventSyncResult);
        assertEventSyncedToCalendar(endUserEventSyncResult);

        // Disconnect Google Calendar from app level
        calendarIntegrationHelper = new CalendarIntegrationHelper(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        await calendarIntegrationHelper.updateCalendarIntegrationConfig({
          googleCalendarEnabled: false,
          outlookEnabled: true,
        });

        isGoogleCalendarDisconnected = true;

        // Verify event is removed from Google Calendar for author and end user
        authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
          maxAttempts: 12,
        });
        endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
          maxAttempts: 12,
        });

        assertEventRemovedFromCalendar(authorEventSyncResult);
        assertEventRemovedFromCalendar(endUserEventSyncResult);

        // Reconnect Google Calendar to app manager
        await calendarIntegrationHelper.updateCalendarIntegrationConfig({
          googleCalendarEnabled: true,
          outlookEnabled: true,
        });

        // Reconnect Google Calendar from user level for author
        externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await externalAppsPage.connectGoogleAccountIntegration(
          ExternalAppProvider.GOOGLE_CALENDAR,
          GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
          GOOGLE_CALENDAR_USERS.APP_MANAGER.password
        );
        await externalAppsPage.verifyThePageIsLoaded();

        // login as end user
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();
        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: endUserEmail,
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();

        // navigate to end user external apps page
        const endUserExternalAppsPage = new ExternalAppsPage(endUserPage);
        await endUserExternalAppsPage.navigateToExternalAppsPage();
        await endUserExternalAppsPage.verifyThePageIsLoaded();

        // connect Google Calendar for user level for end user
        await endUserExternalAppsPage.connectGoogleAccountIntegration(
          ExternalAppProvider.GOOGLE_CALENDAR,
          GOOGLE_CALENDAR_USERS.END_USER.email,
          GOOGLE_CALENDAR_USERS.END_USER.password
        );
        await endUserExternalAppsPage.verifyThePageIsLoaded();

        isGoogleCalendarDisconnected = false; // Successfully reconnected

        // Verify event is synced back to Google Calendar for author and end user
        authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });
        endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });

        assertEventSyncedToCalendar(authorEventSyncResult);
        assertEventSyncedToCalendar(endUserEventSyncResult);
      }
    );
  }
);

// eslint-disable-next-line playwright/no-skipped-test
test.describe.skip(
  'google Calendar Domain Removal Tests',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsFeatureTags.EVENT_SYNC, IntegrationsSuiteTags.PHOENIX],
  },
  () => {
    let calendarIntegrationHelper: CalendarIntegrationHelper;
    let externalAppsPage: ExternalAppsPage;
    let isGoogleCalendarDomainRemoved = false;
    let browser: any;
    let appManagerFixture: any;

    test.afterEach(async () => {
      if (isGoogleCalendarDomainRemoved) {
        console.log('Inside afterEach for isGoogleCalendarDomainRemoved ---> google Calendar Domain Removal Tests ');
        // add Google Calendar domain to app level
        await calendarIntegrationHelper.addIntegrationDomain('simpplr.dev');

        // Reconnect Google Calendar at user level for author
        externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();

        const isAuthorConnected = await externalAppsPage.getConnectionStatus(ExternalAppProvider.GOOGLE_CALENDAR);
        if (!isAuthorConnected) {
          await externalAppsPage.connectGoogleAccountIntegration(
            ExternalAppProvider.GOOGLE_CALENDAR,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.password
          );
        }

        // Reconnect Google Calendar at user level for end user
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();
        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com',
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();

        const endUserExternalAppsPage = new ExternalAppsPage(endUserPage);
        await endUserExternalAppsPage.navigateToExternalAppsPage();
        await endUserExternalAppsPage.verifyThePageIsLoaded();

        const isEndUserConnected = await endUserExternalAppsPage.getConnectionStatus(
          ExternalAppProvider.GOOGLE_CALENDAR
        );
        if (!isEndUserConnected) {
          await endUserExternalAppsPage.connectGoogleAccountIntegration(
            ExternalAppProvider.GOOGLE_CALENDAR,
            GOOGLE_CALENDAR_USERS.END_USER.email,
            GOOGLE_CALENDAR_USERS.END_USER.password
          );
        }

        await endUserContext.close();
      }
    });

    test(
      'removes Google Calendar domain and Verify Event is removed from Google Calendar for both Author and End User',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          '@disconnectGoogleCalendar',
        ],
      },
      async ({ appManagerFixture: fixture, testSiteName, browser: testBrowser }) => {
        test.setTimeout(360000); // 6 minutes timeout
        appManagerFixture = fixture;
        browser = testBrowser;

        tagTest(test.info(), {
          zephyrTestId: 'INT-27338, INT-27339',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        console.log(
          ' removes Google Calendar domain and Verify Event is removed from Google Calendar for both Author and End User '
        );
        // Login as app manager
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Add end user as site member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';
        const endUserId = await userManagementService.getUserId(endUserEmail);
        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        if (!(await externalAppsPage.getConnectionStatus(ExternalAppProvider.GOOGLE_CALENDAR))) {
          console.log('Connecting Google Calendar for app manager');
          await externalAppsPage.connectGoogleAccountIntegration(
            ExternalAppProvider.GOOGLE_CALENDAR,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
            GOOGLE_CALENDAR_USERS.APP_MANAGER.password
          );
          await externalAppsPage.verifyThePageIsLoaded();
        }

        const eventTitle = `${EVENT_CONFIGS.RSVP_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.RSVP_SYNC.description,
          location: EVENT_CONFIGS.RSVP_SYNC.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);
        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);
        await eventDetailPage.assertions.verifyRsvpIndicators();

        // Verify event sync to Google Calendar for both Author and End User
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();

        let authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
        let endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(authorEventSyncResult);
        assertEventSyncedToCalendar(endUserEventSyncResult);

        // remove Google Calendar domain from app level
        calendarIntegrationHelper = new CalendarIntegrationHelper(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        await calendarIntegrationHelper.removeIntegrationDomain('simpplr.dev');
        isGoogleCalendarDomainRemoved = true;

        // Verify event is removed from Google Calendar for author and end user
        authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
          maxAttempts: 12,
        });
        endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
          maxAttempts: 12,
        });

        assertEventRemovedFromCalendar(authorEventSyncResult);
        assertEventRemovedFromCalendar(endUserEventSyncResult);

        // add Google Calendar domain to app manager
        await calendarIntegrationHelper.addIntegrationDomain('simpplr.dev');
        isGoogleCalendarDomainRemoved = false;

        // Reconnect Google Calendar from user level for author
        externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await externalAppsPage.connectGoogleAccountIntegration(
          ExternalAppProvider.GOOGLE_CALENDAR,
          GOOGLE_CALENDAR_USERS.APP_MANAGER.email,
          GOOGLE_CALENDAR_USERS.APP_MANAGER.password
        );
        await externalAppsPage.verifyThePageIsLoaded();

        // login as end user
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();
        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: endUserEmail,
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();

        // navigate to end user external apps page
        const endUserExternalAppsPage = new ExternalAppsPage(endUserPage);
        await endUserExternalAppsPage.navigateToExternalAppsPage();
        await endUserExternalAppsPage.verifyThePageIsLoaded();

        // connect Google Calendar for user level for end user
        await endUserExternalAppsPage.connectGoogleAccountIntegration(
          ExternalAppProvider.GOOGLE_CALENDAR,
          GOOGLE_CALENDAR_USERS.END_USER.email,
          GOOGLE_CALENDAR_USERS.END_USER.password
        );
        await endUserExternalAppsPage.verifyThePageIsLoaded();

        isGoogleCalendarDomainRemoved = false; // Successfully reconnected

        // Verify event is synced back to Google Calendar for author and end user
        authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });
        endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });

        assertEventSyncedToCalendar(authorEventSyncResult);
        assertEventSyncedToCalendar(endUserEventSyncResult);
      }
    );
  }
);
