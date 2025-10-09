import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { EventDetailPage } from '@/src/modules/content/pages/eventDetailPage';
import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsEventFixture as test } from '@/src/modules/integrations/fixtures/eventSyncFixture';
import {
  createAppManagerOutlookCalendarHelper,
  OutlookCalendarHelper,
} from '@/src/modules/integrations/helpers/outlookCalendarHelper';
import {
  createOutlookEventPayload,
  EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG,
  OUTLOOK_EVENT_CONFIGS,
} from '@/src/modules/integrations/test-data/outlookEventSync.test-data';

test.describe(
  'Outlook Event Sync Integration Tests',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsFeatureTags.EVENT_SYNC, IntegrationsSuiteTags.PHOENIX],
  },
  () => {
    test(
      'Delete Event and Verify Removal from Outlook Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Test event deletion sync to Outlook Calendar',
          zephyrTestId: 'INT-OUTLOOK-DELETE-001',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.DELETE_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.DELETE_TEST.description,
          location: OUTLOOK_EVENT_CONFIGS.DELETE_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        // Verify initial sync to Outlook Calendar
        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        const verificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        const outlookEventId =
          verificationResult.found && verificationResult.event ? verificationResult.event.id : undefined;

        if (!outlookEventId) {
          throw new Error(`Outlook Calendar event not found for "${eventTitle}" - cannot perform deletion sync test`);
        }

        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
        await eventDetailPage.loadPage();
        await eventDetailPage.assertions.verifyThePageIsLoaded();
        await eventDetailPage.assertions.verifyEventTitle(eventTitle);

        await eventDetailPage.actions.deleteEvent();

        // Verify event removal from Outlook Calendar using new helper
        const deletionVerificationResult = await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        expect(
          deletionVerificationResult.found,
          `Event "${eventTitle}" should have been removed from Outlook Calendar after deletion from Simpplr UI. ` +
            `Event was verified as deleted from Simpplr but still exists in Outlook Calendar after ${deletionVerificationResult.attempts} verification attempts.`
        ).toBe(false);
      }
    );

    test(
      'Edit Event and Verify Updates Sync to Outlook Calendar',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, testSiteName, siteManagementHelper }) => {
        test.setTimeout(300000);
        tagTest(test.info(), {
          description: 'Test event edit sync with Outlook Calendar',
          zephyrTestId: 'INT-OUTLOOK-EDIT-001',
        });

        const sitesResponse = await siteManagementHelper.getListOfSites();
        const testSite = sitesResponse.result.listOfItems.find((site: any) => site.name === testSiteName);

        if (!testSite) {
          throw new Error(`Test site "${testSiteName}" not found`);
        }

        const siteId = testSite.siteId;

        const originalEventTitle = `${OUTLOOK_EVENT_CONFIGS.EDIT_TEST.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createOutlookEventPayload({
          title: originalEventTitle,
          description: OUTLOOK_EVENT_CONFIGS.EDIT_TEST.description,
          location: OUTLOOK_EVENT_CONFIGS.EDIT_TEST.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(originalEventTitle);

        const eventDetailPage = new EventDetailPage(appManagerHomePage.page, siteId, eventResult.eventId);
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
      'Site Deactivation/Reactivation and Outlook Calendar Event Sync Verification',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          IntegrationsFeatureTags.EVENT_SYNC,
          IntegrationsFeatureTags.OUTLOOK_CALENDAR,
        ],
      },
      async ({ appManagerApiClient, appManagerHomePage, siteManagementHelper }) => {
        test.setTimeout(360000);
        tagTest(test.info(), {
          description: 'Test site deactivation/reactivation impact on Outlook Calendar event sync',
          zephyrTestId: 'INT-OUTLOOK-SITE-001',
        });

        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const dedicatedTestSite = await siteManagementHelper.createPublicSite({
          category,
          siteName: `Outlook Site Deactivation Test ${faker.string.alphanumeric({ length: 6 })}`,
        });

        const siteId = dedicatedTestSite.siteId;

        const eventTitle = `${OUTLOOK_EVENT_CONFIGS.SITE_DEACTIVATION.titleSuffix} - ${faker.string.alphanumeric({ length: 6 })}`;

        const appManagerEmail = getEnvConfig().appManagerEmail;
        const organizerId = await appManagerApiClient.getUserManagementService().getUserId(appManagerEmail);

        const eventPayload = createOutlookEventPayload({
          title: eventTitle,
          description: OUTLOOK_EVENT_CONFIGS.SITE_DEACTIVATION.description,
          location: OUTLOOK_EVENT_CONFIGS.SITE_DEACTIVATION.location,
          organizerId,
        });

        const eventResult = await appManagerApiClient
          .getContentManagementService()
          .addNewEventContent(siteId, eventPayload);

        OutlookCalendarHelper.assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        const appManagerCalendarHelper = createAppManagerOutlookCalendarHelper();
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);

        // STEP 1: Deactivate the site
        await appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
        await appManagerHomePage.page.waitForTimeout(20000);

        // Verify event removal from Outlook Calendar after site deactivation
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle, {
          expectFound: false,
        });

        // STEP 2: Reactivate the site
        await appManagerApiClient.getSiteManagementService().activateSite(siteId);
        await appManagerHomePage.page.waitForTimeout(25000);

        // Verify event reappears in Outlook Calendar after site reactivation
        await appManagerCalendarHelper.verifyEventSyncWithRetry(eventTitle);
      }
    );
  }
);
