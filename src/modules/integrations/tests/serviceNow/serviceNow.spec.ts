import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { expect, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ExternalAppProvider } from '@/src/modules/integrations/ui/pages/externalAppsPage';
import { ExternalAppsPage } from '@/src/modules/integrations/ui/pages/externalAppsPage';
import { ServiceNowTicketsPage } from '@/src/modules/integrations/ui/pages/serviceNowTicketsPage';
import { SupportAndTicketingPage } from '@/src/modules/integrations/ui/pages/supportAndTicketingPage';

test.describe(
  'service Now Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsSuiteTags.PHOENIX, IntegrationsSuiteTags.SERVICENOW],
  },
  () => {
    multiUserTileFixture(
      'Verify Service Now External Apps Page',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: ['INT-11132', 'INT-11131'],
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new SupportAndTicketingPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        await adminHomeDashboard.verifyServiceNowFieldsVisible();
        const endUserServiceNow = new ExternalAppsPage(endUserPage);
        await endUserServiceNow.navigateToExternalAppsPage();
        await endUserServiceNow.verifyThePageIsLoaded();
        await endUserServiceNow.isIntegrationConnected(ExternalAppProvider.SERVICENOW);
      }
    );

    multiUserTileFixture(
      'Verify New Ticket button is visible on Service Now Tickets Page and Ticket creation can be cancelled',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: ['INT-9702', 'INT-10615'],
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new ServiceNowTicketsPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        const endUserServiceNow = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNow.loadPage();
        await endUserServiceNow.verifyThePageIsLoaded();
        await endUserServiceNow.clickNewTicketButton();
        await endUserServiceNow.verifyNewTicketOptionVisible();
        await endUserServiceNow.clickCancelTicketCreationButton();
      }
    );

    multiUserTileFixture(
      'Verify Ticket creation can be done successfully',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-10415',
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new ServiceNowTicketsPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        const endUserServiceNow = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNow.loadPage();
        await endUserServiceNow.verifyThePageIsLoaded();
        await endUserServiceNow.createNewTicket({
          title: 'Test Ticket',
          description: 'Test Description',
        });
        await endUserServiceNow.verifyTicketCreationSuccess();
      }
    );

    multiUserTileFixture(
      'Verify ServiceNow tickets Sorting by Last updated, newest',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-11445',
          storyId: 'INT-28224',
        });

        // Test sorting functionality with admin user
        const adminServiceNowTicketsPage = new ServiceNowTicketsPage(adminPage);
        await adminServiceNowTicketsPage.loadPage();
        await adminServiceNowTicketsPage.verifyThePageIsLoaded();

        // Open sort dropdown and select "Last updated, newest"
        await adminServiceNowTicketsPage.sortByLastUpdatedNewest();

        // Verify tickets are sorted correctly (using unified function)
        const isSortedCorrectly = await adminServiceNowTicketsPage.verifyTicketSortingByDate('desc');
        expect(isSortedCorrectly).toBeTruthy();

        // Test sorting functionality with end user
        const endUserServiceNowTicketsPage = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNowTicketsPage.loadPage();
        await endUserServiceNowTicketsPage.verifyThePageIsLoaded();

        // Apply sorting for end user as well
        await endUserServiceNowTicketsPage.sortByLastUpdatedNewest();

        // Verify sorting works for end user too (using unified function)
        const isEndUserSortedCorrectly = await endUserServiceNowTicketsPage.verifyTicketSortingByDate('desc');
        expect(isEndUserSortedCorrectly).toBeTruthy();
      }
    );

    multiUserTileFixture(
      'Verify ServiceNow tickets Sorting by Last updated, oldest',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-9976',
          storyId: 'INT-28224',
        });

        // Test sorting functionality with admin user
        const adminServiceNowTicketsPage = new ServiceNowTicketsPage(adminPage);
        await adminServiceNowTicketsPage.loadPage();
        await adminServiceNowTicketsPage.verifyThePageIsLoaded();

        // Open sort dropdown and select "Last updated, oldest"
        await adminServiceNowTicketsPage.sortByLastUpdatedOldest();

        // Verify tickets are sorted correctly (using unified function for ascending order)
        const isSortedCorrectly = await adminServiceNowTicketsPage.verifyTicketSortingByDate('asc');
        expect(isSortedCorrectly).toBeTruthy();

        // Test sorting functionality with end user
        const endUserServiceNowTicketsPage = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNowTicketsPage.loadPage();
        await endUserServiceNowTicketsPage.verifyThePageIsLoaded();

        // Apply sorting for end user as well (oldest first)
        await endUserServiceNowTicketsPage.sortByLastUpdatedOldest();

        // Verify sorting works for end user too (using unified function for ascending order)
        const isEndUserSortedCorrectly = await endUserServiceNowTicketsPage.verifyTicketSortingByDate('asc');
        expect(isEndUserSortedCorrectly).toBeTruthy();
      }
    );
  }
);
