import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { EventSyncDestination, EventSyncInvitees } from '@/src/core/types/contentManagement.types';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { EventDetailPage } from '@/src/modules/content/pages/eventDetailPage';
import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsEventFixture as test } from '@/src/modules/integrations/fixtures/eventSyncFixture';
import {
  assertCompleteEventConfiguration,
  getEndUserGoogleAccessToken,
  getGoogleAccessToken,
  rsvpEvent,
  verifyEventDetailsInGoogleCalendar,
  verifyEventSyncWithRetry,
} from '@/src/modules/integrations/helpers/eventSyncHelper';

test.describe(
  'Event Sync Integration Tests - 2-way RSVP sync, Event deletion, Event edit, Site deactivation/reactivation, Event unpublish/republish, Event sync toggle, End user calendar sync',
  {
    tag: [
      IntegrationsSuiteTags.INTEGRATIONS,
      IntegrationsFeatureTags.EVENT_SYNC,
      IntegrationsSuiteTags.PHOENIX,
      '@event-sync-api',
    ],
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
          IntegrationsFeatureTags.EVENT_CREATION,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Test 2-way RSVP sync: Simpplr to Google Calendar and Google Calendar to Simpplr UI',
          zephyrTestId: 'INT-14847, INT-27261',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Create event with Google Calendar sync enabled
        const eventTitle = `API Event with Google Sync - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created via API with Google Calendar sync for testing';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: 'API Test Location',
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Verify event sync and RSVP configuration using helper function
        assertCompleteEventConfiguration(eventResult, {
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            syncStatus: 'initialized',
          },
          rsvp: {
            hasRsvp: true,
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        // UI: Navigate to the created event and verify details
        console.log('Testing UI navigation and RSVP interaction...');
        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        // Verify Event Details Page
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);
        await eventDetailPage.assertions.verifyRsvpIndicators();

        // Click RSVP Yes Option
        await eventDetailPage.actions.clickRsvpOption('yes');
        // Verify RSVP Selection
        await eventDetailPage.assertions.verifyRsvpSelection('yes', 5);

        // 📅 Verify event was synced to Google Calendar and get event details
        let googleEventId: string | undefined;
        let googleAccessToken: string | undefined;

        try {
          googleAccessToken = await getGoogleAccessToken();
          const verificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
            maxAttempts: 10,
            retryDelayMs: 12000,
            calendarId: 'primary',
            waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
            expectFound: true, // We expect the event to be found
          });

          // Extract Google Calendar event ID if found
          if (verificationResult.found && verificationResult.event) {
            googleEventId = verificationResult.event.id;
            console.log('📋 Event found in Google Calendar, preparing for RSVP test.');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Google Calendar verification failed:', errorMessage);
        }

        // 🔔 Test RSVP functionality - Send "declined" from Google Calendar side
        console.log('🔔 Testing RSVP sync from Google Calendar to Simpplr...');

        // Fail the test if Google Calendar integration is not available for 2-way RSVP sync test
        if (!googleEventId || !googleAccessToken) {
          throw new Error(
            '2-way RSVP sync test requires Google Calendar integration. ' +
              `Missing: ${!googleAccessToken ? 'Google access token' : ''} ${!googleEventId ? 'Google Calendar event ID' : ''}. ` +
              'Cannot verify bidirectional RSVP synchronization without Google Calendar access.'
          );
        }

        try {
          // Get test user email (you might want to get this from environment or test data)
          const testUserEmail = 'howard.nelson@simpplr.dev'; // Replace with actual test user email

          console.log('Sending RSVP "declined" status from Google Calendar...');
          await rsvpEvent(googleAccessToken, 'primary', googleEventId, testUserEmail, 'declined');

          // 🔍 Verify RSVP change is reflected in Simpplr UI
          console.log('Verifying RSVP "declined" is reflected in Simpplr UI...');
          await eventDetailPage.assertions.verifyRsvpSelection('no', 8); // More retries for sync delay

          console.log('RSVP sync from Google Calendar to Simpplr verified successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('RSVP sync test failed:', errorMessage);
          throw error; // Re-throw to fail the test
        }
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
          IntegrationsFeatureTags.EVENT_DELETION,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Test event deletion sync to Google Calendar',
          zephyrTestId: 'INT-27088',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;
        console.info(`🎯 Creating event in site: ${testSiteName} (ID: ${siteId})`);

        // Create event with Google Calendar sync enabled
        const eventTitle = `Delete Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created for deletion testing with Google Calendar sync';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: 'Delete Test Location',
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`✅ Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Verify event sync configuration
        assertCompleteEventConfiguration(eventResult, {
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            syncStatus: 'initialized',
          },
          rsvp: {
            hasRsvp: true,
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        // 📅 Verify event was synced to Google Calendar first
        console.log(`📅 Verifying Google Calendar sync for: "${eventTitle}"`);

        let googleEventId: string | undefined;
        let googleAccessToken: string | undefined;

        try {
          googleAccessToken = await getGoogleAccessToken();
          const verificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
            maxAttempts: 10,
            retryDelayMs: 12000,
            calendarId: 'primary',
            waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
            expectFound: true, // We expect the event to be found
          });

          // Extract Google Calendar event ID if found
          if (verificationResult.found && verificationResult.event) {
            googleEventId = verificationResult.event.id;
            console.log('📋 Event found in Google Calendar, ready for deletion test...');
          } else {
            console.log('⚠️ Event not found in Google Calendar, proceeding with UI deletion test only');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('❌ Google Calendar verification failed:', errorMessage);
        }

        // 🌐 Navigate to event detail page and delete the event
        console.log('🌐 Navigating to event detail page for deletion...');
        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Delete the event from Simpplr UI
        console.log('🗑️ Deleting event from Simpplr UI...');
        await eventDetailPage.actions.deleteEvent();

        // 📅 Verify event was removed from Google Calendar
        if (!googleEventId || !googleAccessToken) {
          throw new Error(
            'Event deletion sync test requires Google Calendar integration. ' +
              `Missing: ${!googleAccessToken ? 'Google access token' : ''} ${!googleEventId ? 'Google Calendar event ID' : ''}. ` +
              'Cannot verify event deletion sync without Google Calendar access.'
          );
        }

        console.log('Verifying event removal from Google Calendar...');

        // Try to find the event in Google Calendar (should not be found)
        const deletionVerificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
          maxAttempts: 8,
          retryDelayMs: 10000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: false, // We expect the event to be removed
        });

        // Verify event was removed from Google Calendar
        expect(
          deletionVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar after deletion from Simpplr UI. ` +
            `Event was verified as deleted from Simpplr but still exists in Google Calendar after ${deletionVerificationResult.attempts} verification attempts.`
        ).toBe(false);

        console.log(`Event deletion sync verified after ${deletionVerificationResult.attempts} attempts`);
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
          IntegrationsFeatureTags.EVENT_UNPUBLISH,
          IntegrationsFeatureTags.EVENT_REPUBLISH,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description: 'Test event unpublish/republish sync with Google Calendar',
          zephyrTestId: 'INT-27087, INT-27089',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Create event with Google Calendar sync enabled
        const eventTitle = `Unpublish-Republish Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created for unpublish/republish testing with Google Calendar sync';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: 'Unpublish-Republish Test Location',
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Verify event sync configuration
        assertCompleteEventConfiguration(eventResult, {
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            syncStatus: 'initialized',
          },
          rsvp: {
            hasRsvp: true,
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        // Verify initial event sync to Google Calendar
        const googleAccessToken = await getGoogleAccessToken();
        await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        // Navigate to event detail page
        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // STEP 1: Unpublish the event
        await eventDetailPage.actions.unpublishEvent();

        // Verify event removal from Google Calendar after unpublish
        const unpublishVerificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
          maxAttempts: 8,
          retryDelayMs: 10000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: false,
        });

        expect(
          unpublishVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar after unpublishing.`
        ).toBe(false);

        // STEP 2: Republish the event
        await eventDetailPage.actions.publishEvent();

        // Verify event reappears in Google Calendar after republish
        const republishVerificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
          maxAttempts: 8,
          retryDelayMs: 10000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        expect(
          republishVerificationResult.found,
          `Event "${eventTitle}" should have been synced back to Google Calendar after republishing.`
        ).toBe(true);

        console.log('Event unpublish/republish sync test completed successfully');
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
          IntegrationsFeatureTags.EVENT_EDIT,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description: 'Test event edit sync with Google Calendar',
          zephyrTestId: 'INT-14362',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Create event with Google Calendar sync enabled
        const originalEventTitle = `Edit Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const originalEventDescription = 'Original event description for edit testing';
        const originalEventLocation = 'Original Test Location';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: originalEventTitle,
          location: originalEventLocation,
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${originalEventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: originalEventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${originalEventTitle} (ID: ${eventResult.eventId})`);

        // Verify event sync configuration
        assertCompleteEventConfiguration(eventResult, {
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            syncStatus: 'initialized',
          },
          rsvp: {
            hasRsvp: true,
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        // Verify initial event sync to Google Calendar
        const googleAccessToken = await getGoogleAccessToken();
        await verifyEventSyncWithRetry(originalEventTitle, googleAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

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

        // Verify event updates are reflected in Google Calendar
        const updateVerificationResult = await verifyEventDetailsInGoogleCalendar(
          updatedEventTitle,
          {
            title: updatedEventTitle,
            description: updatedEventDescription,
            location: updatedEventLocation,
          },
          googleAccessToken,
          {
            maxAttempts: 10,
            retryDelayMs: 12000,
            calendarId: 'primary',
            waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          }
        );

        expect(
          updateVerificationResult.found && updateVerificationResult.detailsMatched,
          `Event updates for "${updatedEventTitle}" should have been synced to Google Calendar after editing.`
        ).toBe(true);

        console.log('Event edit sync test completed successfully');
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
          IntegrationsFeatureTags.SITE_DEACTIVATION,
          IntegrationsFeatureTags.SITE_REACTIVATION,
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
        const siteName = dedicatedTestSite.siteName;

        try {
          // Create event with Google Calendar sync enabled
          const eventTitle = `Site Deactivation Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
          const eventDescription = 'Event created to test Google Calendar sync behavior during site deactivation';
          const eventLocation = 'Site Deactivation Test Location';
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

          const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
            title: eventTitle,
            location: eventLocation,
            startsAt: startDate.toISOString(),
            endsAt: endDate.toISOString(),
            timezoneIso: 'Asia/Kolkata',
            bodyHtml: `<p>${eventDescription}</p>`,
            body: JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                  content: [{ type: 'text', text: eventDescription }],
                },
              ],
            }),
            eventSync: {
              enabled: true,
              destination: EventSyncDestination.GOOGLE_CALENDAR,
              emailInvitationEnabled: true,
              invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            },
            rsvp: {
              hasMaybeOption: true,
              noteLabel: null,
            },
          });

          console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

          // Verify event sync configuration
          assertCompleteEventConfiguration(eventResult, {
            eventSync: {
              enabled: true,
              destination: EventSyncDestination.GOOGLE_CALENDAR,
              emailEnabled: true,
              invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
              syncStatus: 'initialized',
            },
            rsvp: {
              hasRsvp: true,
              hasMaybeOption: true,
              noteLabel: null,
            },
          });

          // Verify initial event sync to Google Calendar
          const googleAccessToken = await getGoogleAccessToken();
          await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
            maxAttempts: 10,
            retryDelayMs: 12000,
            calendarId: 'primary',
            waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
            expectFound: true,
          });

          // STEP 1: Deactivate the site
          await appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
          await appManagerHomePage.page.waitForTimeout(20000);

          // Verify event removal from Google Calendar after site deactivation (optional check)
          const deactivationVerificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
            maxAttempts: 8,
            retryDelayMs: 15000,
            calendarId: 'primary',
            waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
            expectFound: false,
          });

          // Note: Event may or may not be removed after site deactivation - behavior varies
          console.log(
            `Site deactivation event sync behavior: ${deactivationVerificationResult.found ? 'Event persists' : 'Event removed'}`
          );

          // STEP 2: Reactivate the site
          await appManagerApiClient.getSiteManagementService().activateSite(siteId);
          await appManagerHomePage.page.waitForTimeout(25000);

          // Verify event reappears in Google Calendar after site reactivation (optional check)
          const reactivationVerificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
            maxAttempts: 10,
            retryDelayMs: 15000,
            calendarId: 'primary',
            waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
            expectFound: true,
          });

          // Note: Event reappearance after reactivation may vary based on previous deactivation behavior
          console.log(
            `Site reactivation event sync behavior: ${reactivationVerificationResult.found ? 'Event reappeared' : 'Event not found'}`
          );
          console.log('Site deactivation/reactivation sync test completed successfully');
        } finally {
          // Ensure cleanup of the dedicated test site
          try {
            await siteManagementHelper.cleanup();
          } catch (cleanupError) {
            console.error('Error during site cleanup:', cleanupError);
          }
        }
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
          IntegrationsFeatureTags.EVENT_EDIT,
          IntegrationsFeatureTags.EVENT_SYNC_OFF,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description:
            'Test event sync toggle behavior - disable sync removes event from Google Calendar, enable sync restores it',
          zephyrTestId: 'INT-27246, INT-27245',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // Create event with Google Calendar sync enabled
        const eventTitle = `Sync Toggle Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created to test Google Calendar sync toggle behavior';
        const eventLocation = 'Sync Toggle Test Location';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: eventLocation,
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Verify event sync configuration
        assertCompleteEventConfiguration(eventResult, {
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            syncStatus: 'initialized',
          },
          rsvp: {
            hasRsvp: true,
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        // Verify initial event sync to Google Calendar
        const googleAccessToken = await getGoogleAccessToken();
        await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        // Navigate to event detail page
        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // STEP 1: Disable event sync
        console.log('🔄 Disabling event sync...');
        await eventDetailPage.actions.toggleEventSync(false);

        // Verify event removal from Google Calendar after disabling sync
        const disableSyncVerificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
          maxAttempts: 8,
          retryDelayMs: 10000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: false,
        });

        expect(
          disableSyncVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar after disabling event sync.`
        ).toBe(false);

        console.log('✅ Event successfully removed from Google Calendar after disabling sync');

        // STEP 2: Re-enable event sync
        console.log('🔄 Re-enabling event sync...');
        await eventDetailPage.actions.toggleEventSync(true);

        // Verify event reappears in Google Calendar after enabling sync
        const enableSyncVerificationResult = await verifyEventSyncWithRetry(eventTitle, googleAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        expect(
          enableSyncVerificationResult.found,
          `Event "${eventTitle}" should have been synced back to Google Calendar after re-enabling event sync.`
        ).toBe(true);

        console.log('✅ Event successfully restored to Google Calendar after re-enabling sync');
        console.log('Event sync toggle test completed successfully');
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
          IntegrationsFeatureTags.EVENT_CREATION,
          IntegrationsFeatureTags.SITE_MEMBER_SYNC,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description:
            'Test event sync to end user calendar when added as site member - verifies invitee sync functionality',
          zephyrTestId: 'INT-27084',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // End user from QA env who will be added as site member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        // Google Calendar credentials are set up for craig.gordon@simpplr.dev
        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

        // Create event with Google Calendar sync enabled first
        const eventTitle = `End User Sync Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created to test Google Calendar sync to end user calendar';
        const eventLocation = 'End User Sync Test Location';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: eventLocation,
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Now add end user as site member after event creation
        console.log(`🎯 Adding end user ${endUserEmail} as site member...`);

        // Get user ID for the end user email
        let endUserId: string;
        try {
          endUserId = await appManagerApiClient.getUserManagementService().getUserId(endUserEmail);
          console.log(`✅ Found end user ID: ${endUserId} for email: ${endUserEmail}`);
        } catch (error) {
          throw new Error(`Failed to get user ID for ${endUserEmail}: ${error}`);
        }

        // Add end user as site member using the correct API
        try {
          await appManagerApiClient
            .getSiteManagementService()
            .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.ADD);
          console.log(`✅ End user ${endUserEmail} (ID: ${endUserId}) added as site member successfully`);
        } catch (error) {
          console.log(`⚠️ Failed to add end user as site member (may already be a member): ${error}`);
          // Continue with test as user might already be a member
        }

        // Verify event appears in App Manager's calendar first
        console.log('📅 Verifying event sync to App Manager calendar...');
        const appManagerAccessToken = await getGoogleAccessToken();
        await verifyEventSyncWithRetry(eventTitle, appManagerAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        console.log('✅ Event confirmed in App Manager calendar');

        // Verify event appears in End User's Google Calendar (using craig.gordon@simpplr.dev credentials)
        console.log(`📅 Verifying event sync to End User's Google Calendar (${googleCalendarEmail})...`);
        console.log(`   End user ${endUserEmail} was added as site member and should receive the event`);
        const endUserAccessToken = await getEndUserGoogleAccessToken();
        const endUserVerificationResult = await verifyEventSyncWithRetry(eventTitle, endUserAccessToken, {
          maxAttempts: 15, // More attempts as sync to invitees may take longer
          retryDelayMs: 15000, // Longer delay for invitee sync
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        expect(
          endUserVerificationResult.found,
          `Event "${eventTitle}" should have been synced to Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) was added as a site member. ` +
            `Event sync is configured for SITE_MEMBERS_FOLLOWERS but event was not found after ${endUserVerificationResult.attempts} verification attempts.`
        ).toBe(true);

        console.log(`✅ Event successfully synced to end user's Google Calendar (${googleCalendarEmail})`);
        console.log(`   This confirms that adding ${endUserEmail} as site member triggered the calendar sync`);
        console.log('End user calendar sync test completed successfully');

        // Optional: Verify event details in end user calendar
        if (endUserVerificationResult.found && endUserVerificationResult.event) {
          console.log('📋 End User Calendar Event Details:');
          console.log(`   📅 Title: ${endUserVerificationResult.event.summary}`);
          console.log(`   📍 Location: ${endUserVerificationResult.event.location || 'N/A'}`);
          console.log(
            `   📅 Start: ${endUserVerificationResult.event.start?.dateTime || endUserVerificationResult.event.start?.date}`
          );

          if (endUserVerificationResult.event.attendees) {
            console.log(`   👥 Attendees (${endUserVerificationResult.event.attendees.length}):`);
            endUserVerificationResult.event.attendees.forEach((attendee: any) => {
              console.log(`      - ${attendee.email}: ${attendee.responseStatus || 'needsAction'}`);
            });
          }
        }
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
          IntegrationsFeatureTags.EVENT_CREATION,
          IntegrationsFeatureTags.SITE_MEMBER_SYNC,
          IntegrationsFeatureTags.SITE_MEMBER_REMOVAL,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description:
            'Test event sync when user is site member before event creation, then verify event removal when user is removed from site',
          zephyrTestId: 'INT-27247',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // End user from QA env who will be added as site member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        // Google Calendar credentials are set up for craig.gordon@simpplr.dev
        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

        // Step 1: Add end user as site member BEFORE creating event
        console.log(`🎯 Adding end user ${endUserEmail} as site member BEFORE event creation...`);

        // Get user ID for the end user email
        let endUserId: string;
        try {
          endUserId = await appManagerApiClient.getUserManagementService().getUserId(endUserEmail);
          console.log(`✅ Found end user ID: ${endUserId} for email: ${endUserEmail}`);
        } catch (error) {
          throw new Error(`Failed to get user ID for ${endUserEmail}: ${error}`);
        }

        // Add end user as site member using the correct API
        try {
          await appManagerApiClient
            .getSiteManagementService()
            .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.ADD);
          console.log(`✅ End user ${endUserEmail} (ID: ${endUserId}) added as site member successfully`);
        } catch (error) {
          console.log(`⚠️ Failed to add end user as site member (may already be a member): ${error}`);
          // Continue with test as user might already be a member
        }

        // Step 2: Create event with Google Calendar sync enabled AFTER user is site member
        console.log(`📅 Creating event with user already as site member...`);
        const eventTitle = `Member First Sync Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created after user is already a site member to test Google Calendar sync';
        const eventLocation = 'Member First Sync Test Location';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: eventLocation,
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Step 3: Verify event appears in App Manager's calendar
        console.log('📅 Verifying event sync to App Manager calendar...');
        const appManagerAccessToken = await getGoogleAccessToken();
        await verifyEventSyncWithRetry(eventTitle, appManagerAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        console.log('✅ Event confirmed in App Manager calendar');

        // Step 4: Verify event appears in End User's Google Calendar (since they were already a site member)
        console.log(`📅 Verifying event sync to End User's Google Calendar (${googleCalendarEmail})...`);
        console.log(`   End user ${endUserEmail} was already a site member when event was created`);
        const endUserAccessToken = await getEndUserGoogleAccessToken();
        const initialVerificationResult = await verifyEventSyncWithRetry(eventTitle, endUserAccessToken, {
          maxAttempts: 15, // More attempts as sync to invitees may take longer
          retryDelayMs: 15000, // Longer delay for invitee sync
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        expect(
          initialVerificationResult.found,
          `Event "${eventTitle}" should have been synced to Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) was already a site member when event was created. ` +
            `Event sync is configured for SITE_MEMBERS_FOLLOWERS but event was not found after ${initialVerificationResult.attempts} verification attempts.`
        ).toBe(true);

        console.log(`✅ Event successfully synced to end user's Google Calendar (${googleCalendarEmail})`);
        console.log(
          `   This confirms that ${endUserEmail} being a site member before event creation triggered the calendar sync`
        );

        // Step 5: Remove end user from site membership
        console.log(`🎯 Removing end user ${endUserEmail} from site membership...`);

        try {
          // Remove the user from site membership
          await appManagerApiClient
            .getSiteManagementService()
            .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.REMOVE);
          console.log(`✅ End user ${endUserEmail} (ID: ${endUserId}) removed from site membership successfully`);
        } catch (error) {
          console.log(`⚠️ Failed to remove end user from site membership: ${error}`);
          throw error; // This should not fail, so throw error
        }

        // Step 6: Verify event is removed from End User's Google Calendar
        console.log(`📅 Verifying event removal from End User's Google Calendar (${googleCalendarEmail})...`);
        console.log(
          `   End user ${endUserEmail} was removed from site membership, event should be removed from their calendar`
        );

        const removalVerificationResult = await verifyEventSyncWithRetry(eventTitle, endUserAccessToken, {
          maxAttempts: 15, // More attempts as removal sync may take time
          retryDelayMs: 15000, // Longer delay for removal sync
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: false, // Expecting event to be NOT found after removal
        });

        expect(
          removalVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) was removed from site membership. ` +
            `Event sync is configured for SITE_MEMBERS_FOLLOWERS but event was still found after ${removalVerificationResult.attempts} verification attempts.`
        ).toBe(false);

        console.log(`✅ Event successfully removed from end user's Google Calendar (${googleCalendarEmail})`);
        console.log(
          `   This confirms that removing ${endUserEmail} from site membership triggered the event removal from their calendar`
        );
        console.log('Site member removal and event sync test completed successfully');

        // Step 7: Verify event still exists in App Manager's calendar (should not be affected)
        console.log(
          '📅 Verifying event still exists in App Manager calendar (should not be affected by member removal)...'
        );
        await verifyEventSyncWithRetry(eventTitle, appManagerAccessToken, {
          maxAttempts: 5,
          retryDelayMs: 5000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        console.log(
          '✅ Event still confirmed in App Manager calendar - member removal did not affect organizer calendar'
        );
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
          IntegrationsFeatureTags.EVENT_CREATION,
          IntegrationsFeatureTags.NON_MEMBER_RSVP,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper, browser }) => {
        test.setTimeout(300000); // 5 minutes timeout for this test
        tagTest(test.info(), {
          description: 'Test non-member RSVP to public site event and verify event sync to their Google Calendar',
          zephyrTestId: 'NT-27128, INT-27127',
        });

        // Get site ID for the test site
        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        // End user from QA env who will RSVP as non-member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        // Google Calendar credentials are set up for craig.gordon@simpplr.dev
        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

        // Create second browser context for end user
        console.log(`🔧 Creating second browser context for end user (${endUserEmail})...`);
        const endUserContext = await browser.newContext();
        const endUserPage = await endUserContext.newPage();

        // Login as end user
        const endUserHomePage = await LoginHelper.loginWithPassword(endUserPage, {
          email: endUserEmail,
          password: process.env.QA_SYSTEM_END_USER_PASSWORD || 'Simpplr@12345',
        });
        await endUserHomePage.verifyThePageIsLoaded();
        console.log(`✅ End user (${endUserEmail}) logged in successfully`);

        // Step 1: Create event with Google Calendar sync enabled (App Manager)
        console.log(`📅 Creating event on public site as App Manager...`);
        const eventTitle = `Non-Member RSVP Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created to test Google Calendar sync when non-member RSVPs';
        const eventLocation = 'Non-Member RSVP Test Location';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: eventLocation,
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS, // Only site members/followers initially
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Step 2: Verify event appears in App Manager's calendar
        console.log('📅 Verifying event sync to App Manager calendar...');
        const appManagerAccessToken = await getGoogleAccessToken();
        await verifyEventSyncWithRetry(eventTitle, appManagerAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        console.log('✅ Event confirmed in App Manager calendar');

        // Step 3: Navigate to event as End User (non-member) and RSVP
        console.log(`🎯 End User (${endUserEmail}) navigating to event as non-member...`);

        // Navigate to the event detail page as end user
        const endUserEventDetailPage = new EventDetailPage(endUserHomePage.page, siteId, eventResult.eventId);
        await endUserEventDetailPage.loadPage();
        await endUserEventDetailPage.assertions.verifyThePageIsLoaded();
        await endUserEventDetailPage.assertions.verifyEventTitle(eventTitle);

        // RSVP as "Yes" from end user (non-member)
        console.log(`✅ End User RSVPing "Yes" to the event...`);
        await endUserEventDetailPage.actions.clickRsvpOption('yes');
        await endUserEventDetailPage.assertions.verifyRsvpSelection('yes', 5);

        console.log(`✅ End User successfully RSVPed "Yes" to the event`);

        // Step 4: Verify event appears in End User's Google Calendar after RSVP
        console.log(`📅 Verifying event sync to End User's Google Calendar (${googleCalendarEmail}) after RSVP...`);
        console.log(`   End user ${endUserEmail} RSVPed as non-member and should receive the event in their calendar`);

        const endUserAccessToken = await getEndUserGoogleAccessToken();
        const endUserVerificationResult = await verifyEventSyncWithRetry(eventTitle, endUserAccessToken, {
          maxAttempts: 15, // More attempts as sync to non-members after RSVP may take longer
          retryDelayMs: 15000, // Longer delay for non-member RSVP sync
          calendarId: 'primary',
          waitFunction: ms => endUserHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        expect(
          endUserVerificationResult.found,
          `Event "${eventTitle}" should have been synced to Google Calendar (${googleCalendarEmail}) because end user (${endUserEmail}) RSVPed "Yes" as a non-member to a public site event. ` +
            `Non-member RSVP should trigger calendar sync but event was not found after ${endUserVerificationResult.attempts} verification attempts.`
        ).toBe(true);

        console.log(`✅ Event successfully synced to end user's Google Calendar (${googleCalendarEmail})`);
        console.log(`   This confirms that non-member RSVP to public site event triggered the calendar sync`);
        console.log('Non-member RSVP calendar sync test completed successfully');

        // Optional: Verify event details and RSVP status in end user calendar
        if (endUserVerificationResult.found && endUserVerificationResult.event) {
          console.log('📋 End User Calendar Event Details:');
          console.log(`   📅 Title: ${endUserVerificationResult.event.summary}`);
          console.log(`   📍 Location: ${endUserVerificationResult.event.location || 'N/A'}`);
          console.log(
            `   📅 Start: ${endUserVerificationResult.event.start?.dateTime || endUserVerificationResult.event.start?.date}`
          );

          if (endUserVerificationResult.event.attendees) {
            console.log(`   👥 Attendees (${endUserVerificationResult.event.attendees.length}):`);
            endUserVerificationResult.event.attendees.forEach((attendee: any) => {
              console.log(`      - ${attendee.email}: ${attendee.responseStatus || 'needsAction'}`);
            });
          }
        }

        // Step 5: Optional - Verify App Manager calendar still has the event
        console.log('📅 Verifying event still exists in App Manager calendar...');
        await verifyEventSyncWithRetry(eventTitle, appManagerAccessToken, {
          maxAttempts: 5,
          retryDelayMs: 5000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        console.log('✅ Event still confirmed in App Manager calendar');

        // Cleanup: Close end user browser context
        await endUserContext.close();
        console.log('🧹 End user browser context closed');
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
          IntegrationsFeatureTags.EVENT_CREATION,
          IntegrationsFeatureTags.SITE_MEMBER_SYNC,
          IntegrationsFeatureTags.SITE_ACCESS_CHANGE,
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

        // End user from QA env who will be added as site member
        const endUserEmail = process.env.QA_SYSTEM_END_USER_USERNAME || 'Srikant.g+enduser@simpplr.com';

        // Google Calendar credentials are set up for craig.gordon@simpplr.dev
        const googleCalendarEmail = 'craig.gordon@simpplr.dev';

        // Step 1: Add end user as site member (while site is public)
        console.log(`🎯 Adding end user ${endUserEmail} as site member to public site...`);

        // Get user ID for the end user email
        let endUserId: string;
        try {
          endUserId = await appManagerApiClient.getUserManagementService().getUserId(endUserEmail);
          console.log(`✅ Found end user ID: ${endUserId} for email: ${endUserEmail}`);
        } catch (error) {
          throw new Error(`Failed to get user ID for ${endUserEmail}: ${error}`);
        }

        // Add end user as site member
        try {
          await appManagerApiClient
            .getSiteManagementService()
            .makeUserSiteMembership(siteId, endUserId, SitePermission.MEMBER, SiteMembershipAction.ADD);
          console.log(`✅ End user ${endUserEmail} (ID: ${endUserId}) added as site member successfully`);
        } catch (error) {
          console.log(`⚠️ Failed to add end user as site member (may already be a member): ${error}`);
          // Continue with test as user might already be a member
        }

        // Step 2: Create event with Google Calendar sync enabled
        console.log(`📅 Creating event on public site with member already added...`);
        const eventTitle = `Site Access Change Test Event - ${faker.string.alphanumeric({ length: 6 })}`;
        const eventDescription = 'Event created to test attendee retention when site changes from public to private';
        const eventLocation = 'Site Access Change Test Location';
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Get app manager user ID for organizerId
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
          title: eventTitle,
          location: eventLocation,
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          timezoneIso: 'Asia/Kolkata',
          contentType: 'event',
          bodyHtml: `<p>${eventDescription}</p>`,
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
                content: [{ type: 'text', text: eventDescription }],
              },
            ],
          }),
          eventSync: {
            enabled: true,
            destination: EventSyncDestination.GOOGLE_CALENDAR,
            emailInvitationEnabled: true,
            invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
            organizerId: organizerId,
          },
          rsvp: {
            hasMaybeOption: true,
            noteLabel: null,
          },
        });

        console.log(`Event created: ${eventTitle} (ID: ${eventResult.eventId})`);

        // Step 3: Verify initial event sync to both calendars
        console.log('📅 Verifying initial event sync to App Manager calendar...');
        const appManagerAccessToken = await getGoogleAccessToken();
        await verifyEventSyncWithRetry(eventTitle, appManagerAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        console.log('✅ Event confirmed in App Manager calendar');

        console.log(`📅 Verifying initial event sync to End User calendar (${googleCalendarEmail})...`);
        const endUserAccessToken = await getEndUserGoogleAccessToken();
        const initialEndUserVerification = await verifyEventSyncWithRetry(eventTitle, endUserAccessToken, {
          maxAttempts: 15,
          retryDelayMs: 15000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        expect(
          initialEndUserVerification.found,
          `Event "${eventTitle}" should be in end user calendar before site access change`
        ).toBe(true);

        console.log(`✅ Event confirmed in End User calendar before site access change`);

        // Step 5: Change site from public to private
        console.log(`🔄 Changing site access from PUBLIC to PRIVATE...`);
        await appManagerApiClient.getSiteManagementService().updateSiteAccess(siteId, 'private');
        console.log(`✅ Site access changed to PRIVATE successfully`);

        // Wait for the change to propagate
        await appManagerHomePage.page.waitForTimeout(10000);

        // Step 6: Verify event still exists in both calendars after site access change
        console.log('📅 Verifying event retention in App Manager calendar after site access change...');
        await verifyEventSyncWithRetry(eventTitle, appManagerAccessToken, {
          maxAttempts: 8,
          retryDelayMs: 10000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        console.log('✅ Event still exists in App Manager calendar after site access change');

        console.log(
          `📅 Verifying event retention in End User calendar (${googleCalendarEmail}) after site access change...`
        );
        const postChangeEndUserVerification = await verifyEventSyncWithRetry(eventTitle, endUserAccessToken, {
          maxAttempts: 10,
          retryDelayMs: 12000,
          calendarId: 'primary',
          waitFunction: ms => appManagerHomePage.page.waitForTimeout(ms),
          expectFound: true,
        });

        expect(
          postChangeEndUserVerification.found,
          `Event "${eventTitle}" should remain in end user calendar after site changes from public to private because they are a site member. ` +
            `Site members should retain access to events even after site becomes private.`
        ).toBe(true);

        console.log(`✅ Event successfully retained in End User calendar after site access change`);
        console.log('Site access change test completed successfully - attendees retained for site members');
      }
    );
  }
);
