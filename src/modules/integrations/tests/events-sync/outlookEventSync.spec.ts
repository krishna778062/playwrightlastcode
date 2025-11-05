import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { EventSyncDestination } from '@/src/core/types/contentManagement.types';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { getTestSiteByName } from '@/src/modules/integrations/apis/helpers/eventSyncTestHelpers';
import {
  createAppManagerOutlookCalendarHelper,
  createEndUserOutlookCalendarHelper,
  OutlookCalendarHelper,
} from '@/src/modules/integrations/apis/helpers/outlookCalendarHelper';
import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsEventFixture as test } from '@/src/modules/integrations/fixtures/eventSyncFixture';
import {
  createOutlookEventPayload,
  EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG,
  OUTLOOK_EVENT_CONFIGS,
} from '@/src/modules/integrations/test-data/calendarEventSync.test-data';
import { EventDetailPage, RsvpOption } from '@/src/modules/integrations/ui/pages/eventDetailPage';
import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

test.describe(
  'outlook Event Sync Integration Tests',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsFeatureTags.EVENT_SYNC, IntegrationsSuiteTags.PHOENIX],
  },
  () => {
    test(
      'delete Event and Verify Removal from Outlook Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        tagTest(test.info(), {
          description: 'Test event deletion sync to Outlook Calendar',
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

        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.DELETE_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.DELETE_TEST.description,
          location: OUTLOOK_EVENT_CONFIGS.DELETE_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        // Verify initial sync to Outlook Calendar
        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const verificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(verificationResult);

        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Delete event
        await eventDetailPage.actions.deleteEvent();

        // Verify event removal from Outlook Calendar using new helper
        const deletionVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        OutlookCalendarHelper.assertEventRemovedFromCalendar(deletionVerificationResult);
      }
    );

    test(
      'unpublish Event, Verify Removal from Outlook Calendar, then Republish and Verify Sync',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Test event unpublish/republish sync with Outlook Calendar',
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

        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.UNPUBLISH_REPUBLISH.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.UNPUBLISH_REPUBLISH.description,
          location: OUTLOOK_EVENT_CONFIGS.UNPUBLISH_REPUBLISH.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // Verify event is synced to Outlook Calendar for author
        OutlookCalendarHelper.assertEventSyncedToCalendar(authorEventSyncResult);

        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Unpublish event
        await eventDetailPage.actions.unpublishEvent();

        // Verify event is removed from Outlook Calendar after unpublishing
        const unpublishVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        OutlookCalendarHelper.assertEventRemovedFromCalendar(unpublishVerificationResult);

        // Publish event
        await eventDetailPage.actions.publishEvent();

        // Verify event is synced back to Outlook Calendar after republishing
        const republishVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(republishVerificationResult);
      }
    );

    test(
      'edit Event and Verify Updates Sync to Outlook Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Test event edit sync with Outlook Calendar',
          zephyrTestId: 'INT-OUTLOOK-EDIT-001',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);
        const testSite = await getTestSiteByName(appManagerFixture.siteManagementHelper, testSiteName);
        const siteId = testSite.siteId;

        const originalEventTitle = `${OUTLOOK_EVENT_CONFIGS.EDIT_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: originalEventTitle,
          description: OUTLOOK_EVENT_CONFIGS.EDIT_TEST.description,
          location: OUTLOOK_EVENT_CONFIGS.EDIT_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(originalEventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(authorEventSyncResult);

        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(originalEventTitle);

        const updatedEventTitle = `EDITED - ${originalEventTitle}`;
        const updatedEventDescription = 'UPDATED event description after editing';
        const updatedEventLocation = 'UPDATED Test Location';

        await eventDetailPage.actions.editEvent({
          title: updatedEventTitle,
          description: updatedEventDescription,
          location: updatedEventLocation,
        });

        const updateVerificationResult = await appManagerCalendarHelper.verifyEventDetailsWithRetry(updatedEventTitle, {
          title: updatedEventTitle,
          description: updatedEventDescription,
          location: updatedEventLocation,
        });

        expect(
          updateVerificationResult.found && updateVerificationResult.detailsMatched,
          `Event updates for "${updatedEventTitle}" should have been synced to Outlook Calendar after editing.`
        ).toBe(true);
      }
    );

    test(
      'site Deactivation/Reactivation and Outlook Calendar Event Sync Verification',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
          '@siteDeactivationReactivation',
        ],
      },
      async ({ appManagerFixture }) => {
        test.setTimeout(360000);
        tagTest(test.info(), {
          description: 'Test site deactivation/reactivation impact on Outlook Calendar event sync',
          zephyrTestId: 'INT-OUTLOOK-SITE-001',
        });

        const userManagementService = new UserManagementService(
          appManagerFixture.apiContext,
          getEnvConfig().apiBaseUrl
        );
        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await userManagementService.getUserId(appManagerEmail);

        // const category =
        //   await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const dedicatedTestSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          siteName: `Outlook DeactTest${faker.string.alphanumeric({ length: 3 })}`,
        });

        const siteId = dedicatedTestSite.siteId;

        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.SITE_DEACTIVATION.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.SITE_DEACTIVATION.description,
          location: OUTLOOK_EVENT_CONFIGS.SITE_DEACTIVATION.location,
          organizerId,
        });

        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // STEP 1: Deactivate the site
        await appManagerFixture.siteManagementHelper.siteManagementService.deactivateSite(siteId);

        // Verify event removal from Outlook Calendar after site deactivation
        const deactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        OutlookCalendarHelper.assertEventRemovedFromCalendar(deactivationEventSyncResult);

        // STEP 2: Reactivate the site
        await appManagerFixture.siteManagementHelper.siteManagementService.activateSite(siteId);

        // Verify event reappears in Outlook Calendar after site reactivation
        const reactivationEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(reactivationEventSyncResult);
      }
    );

    test(
      'toggle Event Sync Off/On and Verify Outlook Calendar Sync Behavior',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description:
            'Test event sync toggle behavior - disable sync removes event from Outlook Calendar, enable sync restores it',
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

        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.SYNC_TOGGLE.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.SYNC_TOGGLE.description,
          location: OUTLOOK_EVENT_CONFIGS.SYNC_TOGGLE.location,
          organizerId,
        });
        const eventResult = await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        // Verify event is synced to Outlook Calendar for author
        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(authorEventSyncResult);

        const eventDetailPage = new EventDetailPage(appManagerFixture.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        // Disable event sync
        await eventDetailPage.actions.toggleEventSync(false);

        // Verify event is removed from Outlook Calendar after disabling event sync
        const disableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
          expectFound: false,
        });

        OutlookCalendarHelper.assertEventRemovedFromCalendar(disableSyncVerificationResult);

        // Re-enable event sync
        await eventDetailPage.actions.toggleEventSync(true, EventSyncDestination.OUTLOOK_CALENDAR);

        // Verify event is synced back to Outlook Calendar after re-enabling event sync
        const enableSyncVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 12,
        });

        OutlookCalendarHelper.assertEventSyncedToCalendar(enableSyncVerificationResult);
      }
    );

    test(
      'add End User as Site Member after event creation and Verify Event Sync to End User Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
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

        // Create event with Outlook Calendar sync enabled first
        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.END_USER_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.END_USER_SYNC.description,
          location: OUTLOOK_EVENT_CONFIGS.END_USER_SYNC.location,
          organizerId,
        });

        await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        // Verify event sync to app manager calendar
        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(authorEventSyncResult);

        // Get user ID for the end user email
        const endUserId = await userManagementService.getUserId(endUserEmail);

        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        // Verify event sync to end user calendar
        const endUserCalendarHelper = createEndUserOutlookCalendarHelper();
        const endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
        });

        OutlookCalendarHelper.assertEventSyncedToCalendar(endUserEventSyncResult);
      }
    );

    test(
      'add End User as Site Member before event creation, Create Event, Verify Sync, Remove Member, Verify Event Removal',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
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

        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.MEMBER_FIRST_SYNC.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.MEMBER_FIRST_SYNC.description,
          location: OUTLOOK_EVENT_CONFIGS.MEMBER_FIRST_SYNC.location,
          organizerId,
        });

        await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        // Verify event appears in App Manager's calendar
        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const appManagerVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(appManagerVerificationResult);

        // Verify event appears in End User's Outlook Calendar (since they were already a site member)
        const endUserCalendarHelper = createEndUserOutlookCalendarHelper();
        const initialVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
        });

        OutlookCalendarHelper.assertEventSyncedToCalendar(initialVerificationResult);

        // Remove end user from site membership
        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.REMOVE
        );

        // Verify event is removed from End User's Outlook Calendar
        const removalVerificationResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
          expectFound: false,
        });

        OutlookCalendarHelper.assertEventRemovedFromCalendar(removalVerificationResult);

        // Verify event still exists in App Manager's calendar (should not be affected)
        const appManagerVerificationResult2 = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(appManagerVerificationResult2);
      }
    );

    test(
      'change Site from Public to Private and Verify Event Attendees Retention for Members',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName }) => {
        test.setTimeout(360000);
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

        // Add end user as site member (while site is public)
        await appManagerFixture.siteManagementHelper.siteManagementService.makeUserSiteMembership(
          siteId,
          endUserId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        // Create event with Outlook Calendar sync enabled
        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.SITE_ACCESS_CHANGE.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.SITE_ACCESS_CHANGE.description,
          location: OUTLOOK_EVENT_CONFIGS.SITE_ACCESS_CHANGE.location,
          organizerId,
        });

        await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
          siteId,
          eventPayload
        );

        // Verify initial event sync to both calendars
        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(authorEventSyncResult);

        const endUserCalendarHelper = createEndUserOutlookCalendarHelper();
        let endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
        });

        OutlookCalendarHelper.assertEventSyncedToCalendar(endUserEventSyncResult);

        // Change site from public to private
        await appManagerFixture.siteManagementHelper.siteManagementService.updateSiteAccess(siteId, 'private');

        // Verify event still exists in both calendars after site access change
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
        endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(endUserEventSyncResult);
      }
    );

    test(
      'non-Member RSVP to Public Site Event and Verify Outlook Calendar Sync',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR_EVENTS_SYNC,
        ],
      },
      async ({ appManagerFixture, testSiteName, browser }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Test non-member RSVP to public site event and verify event sync to their Outlook Calendar',
          zephyrTestId: 'NT-27128, INT-27127',
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

        // Create event with Outlook Calendar sync enabled (App Manager)
        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.NON_MEMBER_RSVP.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.NON_MEMBER_RSVP.description,
          location: OUTLOOK_EVENT_CONFIGS.NON_MEMBER_RSVP.location,
          organizerId,
        });

        const eventCreationResult =
          await appManagerFixture.contentManagementHelper.contentManagementService.addNewEventContent(
            siteId,
            eventPayload
          );

        // Verify event appears in App Manager's calendar
        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const authorEventSyncResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        OutlookCalendarHelper.assertEventSyncedToCalendar(authorEventSyncResult);

        // Navigate to event as End User (non-member) and RSVP
        const endUserEventDetailPage = new EventDetailPage(endUserHomePage.page, siteId, eventCreationResult.eventId);
        await endUserEventDetailPage.loadPage();
        await endUserEventDetailPage.assertions.verifyThePageIsLoaded();
        await endUserEventDetailPage.assertions.verifyEventTitle(eventTitle);

        // RSVP as "Yes" from end user (non-member)
        await endUserEventDetailPage.actions.clickRsvpOption(RsvpOption.YES);
        await endUserEventDetailPage.assertions.verifyRsvpSelection('yes', 8);

        // Verify event appears in End User's Outlook Calendar after RSVP
        const endUserCalendarHelper = createEndUserOutlookCalendarHelper();
        const endUserEventSyncResult = await endUserCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          maxAttempts: 15,
          retryDelayMs: 13000,
        });

        OutlookCalendarHelper.assertEventSyncedToCalendar(endUserEventSyncResult);

        await endUserContext.close();
      }
    );
  }
);
