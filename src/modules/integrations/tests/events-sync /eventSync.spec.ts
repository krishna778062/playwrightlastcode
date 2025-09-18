import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { EventSyncDestination, EventSyncInvitees } from '@/src/core/types/contentManagement.types';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { EventDetailPage, RsvpOption } from '@/src/modules/content/pages/eventDetailPage';
import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsEventFixture as test } from '@/src/modules/integrations/fixtures/eventSyncFixture';
import {
  assertCompleteEventConfiguration,
  createAppManagerGoogleCalendarHelper,
  createEndUserGoogleCalendarHelper,
  GoogleCalendarHelper,
} from '@/src/modules/integrations/helpers/googleCalendarHelper';
import {
  createEventPayload,
  EVENT_CONFIGS,
  EXPECTED_EVENT_SYNC_CONFIG,
} from '@/src/modules/integrations/test-data/eventSync.test-data';

test.describe(
  'Event Sync Integration Tests',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsFeatureTags.EVENT_SYNC, IntegrationsSuiteTags.PHOENIX],
  },
  () => {
    test(
      'Test 2-Way RSVP Sync: Simpplr ↔ Google Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Test 2-way RSVP sync: Simpplr to Google Calendar and Google Calendar to Simpplr UI',
          zephyrTestId: 'INT-14847, INT-27261',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.RSVP_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.RSVP_SYNC.description,
          location: EVENT_CONFIGS.RSVP_SYNC.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);
        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);
        await eventDetailPage.assertions.verifyRsvpIndicators();

        await eventDetailPage.actions.clickRsvpOption(RsvpOption.YES);
        await eventDetailPage.assertions.verifyRsvpSelection('yes');

        // Verify event sync to Google Calendar and extract event ID using new helper class
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const verificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const googleEventId =
          verificationResult.found && verificationResult.event ? verificationResult.event.id : undefined;

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
      'Delete Event and Verify Removal from Google Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Test event deletion sync to Google Calendar',
          zephyrTestId: 'INT-27088',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.DELETE_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.DELETE_TEST.description,
          location: EVENT_CONFIGS.DELETE_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);
        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        // Verify initial sync to Google Calendar using new helper
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        const verificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const googleEventId =
          verificationResult.found && verificationResult.event ? verificationResult.event.id : undefined;

        if (!googleEventId) {
          throw new Error(`Google Calendar event not found for "${eventTitle}" - cannot perform deletion sync test`);
        }

        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        await eventDetailPage.actions.deleteEvent();

        // Verify event removal from Google Calendar using new helper
        const deletionVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        expect(
          deletionVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar after deletion from Simpplr UI. ` +
            `Event was verified as deleted from Simpplr but still exists in Google Calendar after ${deletionVerificationResult.attempts} verification attempts.`
        ).toBe(false);
      }
    );

    test(
      'Unpublish Event, Verify Removal from Google Calendar, then Republish and Verify Sync',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description: 'Test event unpublish/republish sync with Google Calendar',
          zephyrTestId: 'INT-27087, INT-27089',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.UNPUBLISH_REPUBLISH.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.UNPUBLISH_REPUBLISH.description,
          location: EVENT_CONFIGS.UNPUBLISH_REPUBLISH.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        await eventDetailPage.actions.unpublishEvent();

        const unpublishVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        expect(
          unpublishVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar after unpublishing.`
        ).toBe(false);

        await eventDetailPage.actions.publishEvent();

        const republishVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        expect(
          republishVerificationResult.found,
          `Event "${eventTitle}" should have been synced back to Google Calendar after republishing.`
        ).toBe(true);
      }
    );

    test(
      'Edit Event and Verify Updates Sync to Google Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description: 'Test event edit sync with Google Calendar',
          zephyrTestId: 'INT-14362',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Create event with Google Calendar sync enabled
        const originalEventTitle = `${EVENT_CONFIGS.EDIT_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: originalEventTitle,
          description: EVENT_CONFIGS.EDIT_TEST.description,
          location: EVENT_CONFIGS.EDIT_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(originalEventTitle);

        // Navigate to event detail page and edit the event
        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(originalEventTitle);

        // Edit the event with new details
        const updatedEventTitle = `EDITED - ${originalEventTitle}`;
        const updatedEventDescription = 'UPDATED event description after editing';
        const updatedEventLocation = 'UPDATED Test Location';

        await eventDetailPage.actions.editEvent({
          title: updatedEventTitle,
          description: updatedEventDescription,
          location: updatedEventLocation,
        });

        // Verify event updates are reflected in Google Calendar using new helper
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
      'Site Deactivation/Reactivation and Google Calendar Event Sync Verification',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, siteManagementHelper }) => {
        test.setTimeout(360000); // 6 minutes timeout for this comprehensive test
        tagTest(test.info(), {
          description: 'Test site deactivation/reactivation impact on Google Calendar event sync',
          zephyrTestId: 'INT-14871, INT-27342, INT-27341',
        });

        // Create a dedicated test site
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const dedicatedTestSite = await siteManagementHelper.createPublicSite({
          category,
          siteName: `Site Deactivation Test Site ${faker.string.alphanumeric({ length: 6 })}`,
        });

        const siteId = dedicatedTestSite.siteId;

        // Create event with Google Calendar sync enabled
        const eventTitle = `${EVENT_CONFIGS.SITE_DEACTIVATION.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.SITE_DEACTIVATION.description,
          location: EVENT_CONFIGS.SITE_DEACTIVATION.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        // Verify event sync configuration
        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        // Verify initial event sync to Google Calendar using new helper
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // STEP 1: Deactivate the site
        await appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
        await appManagerHomePage.page.waitForTimeout(20000);

        // Verify event removal from Google Calendar after site deactivation (optional check)
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        // STEP 2: Reactivate the site
        await appManagerApiClient.getSiteManagementService().activateSite(siteId);
        await appManagerHomePage.page.waitForTimeout(25000);

        // Verify event reappears in Google Calendar after site reactivation (optional check)
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
      }
    );

    test(
      'Toggle Event Sync Off/On and Verify Google Calendar Sync Behavior',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description:
            'Test event sync toggle behavior - disable sync removes event from Google Calendar, enable sync restores it',
          zephyrTestId: 'INT-27246, INT-27245',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${EVENT_CONFIGS.SYNC_TOGGLE.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.SYNC_TOGGLE.description,
          location: EVENT_CONFIGS.SYNC_TOGGLE.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        assertCompleteEventConfiguration(eventResult, EXPECTED_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Navigate to event detail page
        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        await eventDetailPage.actions.toggleEventSync(false);

        const disableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        expect(
          disableSyncVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar after disabling event sync.`
        ).toBe(false);

        await eventDetailPage.actions.toggleEventSync(true);

        const enableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        expect(
          enableSyncVerificationResult.found,
          `Event "${eventTitle}" should have been synced back to Google Calendar after re-enabling event sync.`
        ).toBe(true);
      }
    );

    test(
      'Add End User as Site Member after event creation and Verify Event Sync to End User Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description:
            'Test event sync to end user calendar when added as site member - verifies invitee sync functionality',
          zephyrTestId: 'INT-27084',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

        // Create event with Google Calendar sync enabled first
        const eventTitle = `${EVENT_CONFIGS.END_USER_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.END_USER_SYNC.description,
          location: EVENT_CONFIGS.END_USER_SYNC.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        // Now add end user as site member after event creation

        // Get user ID for the end user email
        const endUserId = await appManagerApiClient.getUserManagementService().getUserId(endUserEmail);

        // Add end user as site member using the correct API
        await appManagerApiClient
          .getSiteManagementService()
          .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.ADD);
        // Use new helper classes for better encapsulation
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const endUserVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        expect(
          endUserVerificationResult.found,
          `Event "${eventTitle}" should have been synced to Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) was added as a site member. ` +
            `Event sync is configured for SITE_MEMBERS_FOLLOWERS but event was not found after ${endUserVerificationResult.attempts} verification attempts.`
        ).toBe(true);
      }
    );

    test(
      'Add End User as Site Member before event creation, Create Event, Verify Sync, Remove Member, Verify Event Removal',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description:
            'Test event sync when user is site member before event creation, then verify event removal when user is removed from site',
          zephyrTestId: 'INT-27247',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

        // Add end user as site member before creating event
        const endUserId = await appManagerApiClient.getUserManagementService().getUserId(endUserEmail);

        await appManagerApiClient
          .getSiteManagementService()
          .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.ADD);
        const eventTitle = `${EVENT_CONFIGS.MEMBER_FIRST_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.MEMBER_FIRST_SYNC.description,
          location: EVENT_CONFIGS.MEMBER_FIRST_SYNC.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        // Step 3: Verify event appears in App Manager's calendar using new helper
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Step 4: Verify event appears in End User's Google Calendar (since they were already a site member)
        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const initialVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        expect(
          initialVerificationResult.found,
          `Event "${eventTitle}" should have been synced to Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) was already a site member when event was created. ` +
            `Event sync is configured for SITE_MEMBERS_FOLLOWERS but event was not found after ${initialVerificationResult.attempts} verification attempts.`
        ).toBe(true);

        // Step 5: Remove end user from site membership
        await appManagerApiClient
          .getSiteManagementService()
          .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.REMOVE);

        // Step 6: Verify event is removed from End User's Google Calendar using new helper

        const removalVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        expect(
          removalVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) was removed from site membership. ` +
            `Event sync is configured for SITE_MEMBERS_FOLLOWERS but event was still found after ${removalVerificationResult.attempts} verification attempts.`
        ).toBe(false);

        // Step 7: Verify event still exists in App Manager's calendar (should not be affected)
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
      }
    );

    test(
      'Non-Member RSVP to Public Site Event and Verify Google Calendar Sync',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper, browser }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description: 'Test non-member RSVP to public site event and verify event sync to their Google Calendar',
          zephyrTestId: 'NT-27128, INT-27127',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // End user from QA env who will RSVP as non-member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

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

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.NON_MEMBER_RSVP.description,
          location: EVENT_CONFIGS.NON_MEMBER_RSVP.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

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

        expect(
          endUserVerificationResult.found,
          `Event "${eventTitle}" should have been synced to Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) RSVPed "Yes" as a non-member to a public site event. ` +
            `Non-member RSVP should trigger calendar sync but event was not found after ${endUserVerificationResult.attempts} verification attempts.`
        ).toBe(true);

        // Step 5: Optional - Verify App Manager calendar still has the event
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Cleanup: Close end user browser context
        await endUserContext.close();
      }
    );

    test(
      'Change Site from Public to Private and Verify Event Attendees Retention for Members',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.GOOGLE_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(360000); // 6 minutes timeout for this comprehensive test
        tagTest(test.info(), {
          description:
            'Test that when a site is changed from public to private, all existing attendees of an event remain retained if they are members/followers of the site',
          zephyrTestId: 'INT-27254',
        });

        // Get site ID for the test site (initially public)
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

        // Step 1: Add end user as site member (while site is public)

        // Get user ID for the end user email
        const endUserId = await appManagerApiClient.getUserManagementService().getUserId(endUserEmail);

        // Add end user as site member
        await appManagerApiClient
          .getSiteManagementService()
          .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.ADD);

        // Step 2: Create event with Google Calendar sync enabled
        const eventTitle = `${EVENT_CONFIGS.SITE_ACCESS_CHANGE.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createEventPayload({
          title: eventTitle,
          description: EVENT_CONFIGS.SITE_ACCESS_CHANGE.description,
          location: EVENT_CONFIGS.SITE_ACCESS_CHANGE.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        // Step 3: Verify initial event sync to both calendars using new helpers
        const appManagerCalendarHelper = createAppManagerGoogleCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const endUserCalendarHelper = createEndUserGoogleCalendarHelper();
        const initialEndUserVerification = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        expect(
          initialEndUserVerification.found,
          `Event "${eventTitle}" should be in end user calendar before site access change`
        ).toBe(true);

        // Step 5: Change site from public to private
        await appManagerApiClient.getSiteManagementService().updateSiteAccess(siteId, 'private');

        // Wait for the change to propagate
        await appManagerHomePage.page.waitForTimeout(10000);

        // Step 6: Verify event still exists in both calendars after site access change
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
        const postChangeEndUserVerification = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        expect(
          postChangeEndUserVerification.found,
          `Event "${eventTitle}" should remain in end user calendar after site changes from public to private because they are a site member. ` +
            `Site members should retain access to events even after site becomes private.`
        ).toBe(true);
      }
    );
  }
);
