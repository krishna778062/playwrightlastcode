import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { EventSyncDestination } from '@/src/core/types/contentManagement.types';
import { EventDetailPage } from '@/src/modules/content/pages/eventDetailPage';
import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsEventFixture as test } from '@/src/modules/integrations/fixtures/eventSyncFixture';
import {
  assertCompleteEventConfiguration,
  createCalendarHelper,
} from '@/src/modules/integrations/helpers/calendarHelper';
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

        assertCompleteEventConfiguration(eventResult, EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG);

        // Verify initial sync to Outlook Calendar using generic helper
        const appManagerCalendarHelper = createCalendarHelper(EventSyncDestination.OUTLOOK_CALENDAR, 'APP_MANAGER');
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
  }
);
