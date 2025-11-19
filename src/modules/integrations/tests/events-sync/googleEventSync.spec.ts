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
import { getTestSiteByName } from '../../apis/helpers/eventSyncTestHelpers';
import { EventSyncDestination } from '@/src/core/types/contentManagement.types';
import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';

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
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          IntegrationsSuiteTags.HEALTH_CHECK,
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          IntegrationsSuiteTags.HEALTH_CHECK,
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
          TestGroupType.SANITY,
          TestGroupType.SMOKE,
          IntegrationsSuiteTags.HEALTH_CHECK,
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
          TestGroupType.SANITY,
          IntegrationsSuiteTags.HEALTH_CHECK,
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          '@siteDeactivationReactivation',
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
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

        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
        const siteId = testSite.siteId;

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
          maxAttempts: 12,
        });

        assertEventRemovedFromCalendar(deactivationEventSyncResult);

        // STEP 2: Reactivate the site
        await appManagerFixture.siteManagementHelper.siteManagementService.activateSite(siteId);

        // Verify event reappears in Google Calendar after site reactivation
        const reactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });

        assertEventSyncedToCalendar(reactivationEventSyncResult);
      }
    );

    test(
      'private Site Deactivation/Reactivation and Google Calendar Event Sync Verification',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          '@siteDeactivationReactivation',
        ],
      },
      async ({ appManagerFixture }) => {
        test.setTimeout(360000);
        tagTest(test.info(), {
          description:
            'Test Private site deactivation/reactivation impact on Google Calendar event sync - Verify published events are restored in Simpplr',
          zephyrTestId: 'INT-GOOGLE-SITE-002',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // Create a private site
        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const privateSite = await appManagerFixture.siteManagementHelper.createPrivateSite({
          category,
          siteName: `Private Event Test Site ${faker.string.alphanumeric({ length: 6 })}`,
        });
        const siteId = privateSite.siteId;

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
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // STEP 1: Deactivate the private site
        await appManagerFixture.siteManagementHelper.siteManagementService.deactivateSite(siteId);

        // Verify event removal from Google Calendar after site deactivation
        const deactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(deactivationEventSyncResult);

        // STEP 2: Reactivate the private site
        await appManagerFixture.siteManagementHelper.siteManagementService.activateSite(siteId);

        // Verify event reappears in Google Calendar after site reactivation
        const reactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(reactivationEventSyncResult);
      }
    );

    test(
      'unlisted Site Deactivation/Reactivation and Google Calendar Event Sync Verification',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          '@siteDeactivationReactivation',
        ],
      },
      async ({ appManagerFixture }) => {
        test.setTimeout(360000);
        tagTest(test.info(), {
          description:
            'Test Unlisted site deactivation/reactivation impact on Google Calendar event sync - Verify published events are restored in Simpplr',
          zephyrTestId: 'INT-GOOGLE-SITE-003',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // Create an unlisted site
        const category =
          await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const unlistedSite = await appManagerFixture.siteManagementHelper.createUnlistedSite({
          category,
          siteName: `Unlisted Event Test Site ${faker.string.alphanumeric({ length: 6 })}`,
        });
        const siteId = unlistedSite.siteId;

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
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // STEP 1: Deactivate the unlisted site
        await appManagerFixture.siteManagementHelper.siteManagementService.deactivateSite(siteId);

        // Verify event removal from Google Calendar after site deactivation
        const deactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(deactivationEventSyncResult);

        // STEP 2: Reactivate the unlisted site
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
          TestGroupType.SANITY,
          IntegrationsSuiteTags.HEALTH_CHECK,
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

        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
        await eventDetailPage.actions.toggleEventSync(false, EventSyncDestination.GOOGLE_CALENDAR);

        const disableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        assertEventRemovedFromCalendar(disableSyncVerificationResult);

        // Re-enable event sync
        await eventDetailPage.actions.toggleEventSync(true, EventSyncDestination.GOOGLE_CALENDAR);

        const enableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(enableSyncVerificationResult);
      }
    );

    test(
      'add End User as Site Member after event creation and Verify Event Sync to End User Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SANITY,
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });

        assertEventSyncedToCalendar(authorEventSyncResult);

        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const endUserVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });

        assertEventSyncedToCalendar(endUserVerificationResult);
      }
    );

    test(
      'add End User as Site Member before event creation, Create Event, Verify Sync, Remove Member, Verify Event Removal',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SANITY,
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName, browser }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Test non-member RSVP to public site event and verify event sync to their Google Calendar',
          zephyrTestId: 'INT-27128, INT-27127',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
          TestGroupType.SANITY,
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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

    test(
      'site Member RSVP from Google Calendar and Verify Sync on Simpplr',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
          IntegrationsSuiteTags.HEALTH_CHECK,
          TestGroupType.SMOKE,
          '@rsvpFromGoogleCalendar',
        ],
      },
      async ({ appManagerFixture, testSiteName, browser }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description:
            'Test site member RSVP to event from Google Calendar and verify RSVP sync on Simpplr event detail page',
          zephyrTestId: 'INT-27133',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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

        // Create event with Google Calendar sync enabled
        const eventTitle = `${EVENT_CONFIGS.MEMBER_FIRST_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.MEMBER_FIRST_SYNC.description,
          location: EVENT_CONFIGS.MEMBER_FIRST_SYNC.location,
          organizerId,
        });

        const eventCreationResult =
          await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
            siteId,
            eventPayload
          );

        assertCompleteEventConfiguration(eventCreationResult, EXPECTED_EVENT_SYNC_CONFIG);

        // Verify event appears in App Manager's calendar
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const appManagerVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(appManagerVerificationResult);

        // Verify event appears in End User's Google Calendar
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
        });

        assertEventSyncedToCalendar(endUserEventSyncResult);

        // RSVP to event from Google Calendar (external calendar)
        if (!endUserEventSyncResult.event?.id) {
          throw new Error(`Event not found in Google Calendar for end user: ${eventTitle}`);
        }

        await endUserCalendarHelper.rsvpToEvent('primary', endUserEventSyncResult.event.id, endUserEmail, 'accepted');

        // Create second browser context for end user
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();

        // Login as end user
        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: endUserEmail,
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();

        // Navigate to event detail page as end user
        const endUserEventDetailPage = new EventDetailPage(endUserHomePage.page, siteId, eventCreationResult.eventId);
        await endUserEventDetailPage.loadPage();
        await endUserEventDetailPage.assertions.verifyThePageIsLoaded();
        await endUserEventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Verify RSVP option selected is YES (synced from Google Calendar) with retry
        await endUserEventDetailPage.assertions.verifyRsvpSelection('yes', 15);

        await endUserContext.close();
      }
    );

    test(
      'change Site from Public to Private and Verify Non-Member Invitees Lose Event from Google Calendar',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName, browser }) => {
        test.setTimeout(360000);
        tagTest(test.info(), {
          zephyrTestId: 'INT-27253',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
        const siteId = testSite.siteId;

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';
        const endUserId = await userManagementService.getUserId(endUserEmail);

        // Step 1: Ensure end user is NOT a site member initially (non-member scenario)
        // Remove them if they are already a member
        try {
          await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
            siteId,
            endUserId,
            SitePermission.MEMBER,
            SiteMembershipAction.REMOVE
          );
        } catch {
          // User might not be a member, which is fine - continue with test
        }

        // Step 2: Create event with Google Calendar sync enabled on public site
        const eventTitle = `${EVENT_CONFIGS.SITE_ACCESS_CHANGE.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.SITE_ACCESS_CHANGE.description,
          location: EVENT_CONFIGS.SITE_ACCESS_CHANGE.location,
          organizerId,
        });

        const eventCreationResult =
          await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
            siteId,
            eventPayload
          );

        assertCompleteEventConfiguration(eventCreationResult, EXPECTED_EVENT_SYNC_CONFIG);

        // Step 3: Verify event appears in App Manager's calendar (organizer/site manager)
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const appManagerVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(appManagerVerificationResult);

        // Step 4: Non-member end user RSVPs to the event (this adds them as an invitee and syncs event to their calendar)
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();

        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: endUserEmail,
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();

        // Navigate to event detail page as non-member end user
        const endUserEventDetailPage = new EventDetailPage(endUserHomePage.page, siteId, eventCreationResult.eventId);
        await endUserEventDetailPage.loadPage();
        await endUserEventDetailPage.assertions.verifyThePageIsLoaded();
        await endUserEventDetailPage.assertions.verifyEventTitle(eventTitle);

        // RSVP as "Yes" from end user (non-member)
        await endUserEventDetailPage.actions.clickRsvpOption(RsvpOption.YES);
        await endUserEventDetailPage.assertions.verifyRsvpSelection('yes', 8);

        await endUserContext.close();

        // Step 5: Verify event appears in End User's Google Calendar after RSVP (as non-member invitee)
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const initialEndUserVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
        });

        assertEventSyncedToCalendar(initialEndUserVerificationResult);

        // Step 6: Change site from public to private
        await appManagerFixture.siteManagementHelper.siteManagementService.updateSiteAccess(siteId, 'private');

        // Step 7: Verify event is removed from non-member end user's Google Calendar
        const removalVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
          expectFound: false,
        });

        assertEventRemovedFromCalendar(removalVerificationResult);

        // Step 8: Verify event still exists in App Manager's calendar (organizer/site manager should retain access)
        const postChangeAppManagerVerification = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        assertEventSyncedToCalendar(postChangeAppManagerVerification);
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
          zephyrTestId: 'INT-27146, INT-27086',
        });
        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );

        // Login as app manager
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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

    test(
      'change Event Author and Verify Author Change in Google Calendar',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description:
            'Test changing event author from end user to app manager and verify author change is reflected in Google Calendar',
          zephyrTestId: ['INT-14361', 'INT-27142', 'INT-7967'],
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
        const siteId = testSite.siteId;

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';
        const endUserPassword = process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345';
        const endUserId = await userManagementService.getUserId(endUserEmail);

        // Step 2: Make End user the owner/manager of the test site
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId: endUserId,
          role: SitePermission.OWNER,
        });

        // Step 3: Create API context for end user and create event as end user
        const endUserApiContext = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
          email: endUserEmail,
          password: endUserPassword,
        });

        const endUserContentManagementHelper = new ContentManagementHelper(
          endUserApiContext,
          getEnvConfig().apiBaseUrl
        );

        const eventTitle = `${EVENT_CONFIGS.MEMBER_FIRST_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.MEMBER_FIRST_SYNC.description,
          location: EVENT_CONFIGS.MEMBER_FIRST_SYNC.location,
          organizerId: endUserId,
        });

        const eventCreationResult = await endUserContentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        assertCompleteEventConfiguration(eventCreationResult, EXPECTED_EVENT_SYNC_CONFIG);

        // Verify event is synced to end user's Google Calendar with end user as author
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const endUserInitialVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
        });

        assertEventSyncedToCalendar(endUserInitialVerificationResult);

        // Verify initial author is end user
        await endUserCalendarHelper.verifyEventDetailsWithRetry(
          eventTitle,
          { author: 'craig.gordon@simpplr.dev' },
          { authorMatchBy: 'email', maxAttempts: 12 }
        );

        // Cleanup end user API context
        await endUserApiContext.dispose();

        // Step 4: App Manager changes author of the event
        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventCreationResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        const appManagerName: string = 'Neha Manas';
        console.log('App manager name:', appManagerName);

        // Change author to app manager
        await eventDetailPage.changeEventAuthor(appManagerName);

        // Wait for author change to sync to Google Calendar
        await appManagerFixture.page.waitForTimeout(5000);
        console.log('Author change to app manager completed');

        // Step 5: Verify author change in Google Calendar
        // Note: After author change, the event organizer in Google Calendar should be the app manager
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();

        await appManagerCalendarHelper.verifyEventDetailsWithRetry(
          eventTitle,
          { author: 'howard.nelson@simpplr.dev' },
          { authorMatchBy: 'email', maxAttempts: 15, retryDelayMs: 13000 }
        );
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
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
