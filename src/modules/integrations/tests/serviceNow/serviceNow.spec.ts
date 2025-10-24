import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { expect, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ExternalAppProvider, ExternalAppsPage } from '@/src/modules/integrations/ui/pages/externalAppsPage';
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
      'Verify the Custom Name of the ServiceNow ticket in Tickets Page',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: ['INT-9699', 'INT-9700'],
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new SupportAndTicketingPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        await adminHomeDashboard.verifyServiceNowFieldsVisible();
        await adminHomeDashboard.selectCustomNameAndFillValue('Service NowTest Custom Name');
        const endUserServiceNowTicketsPage = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNowTicketsPage.loadPage();
        await endUserServiceNowTicketsPage.verifyThePageIsLoaded();
        await endUserServiceNowTicketsPage.verifyServiceNowTicketsPageTitle('Service NowTest Custom Name');
        await endUserServiceNowTicketsPage.verifyCustomNameInServiceNowMenu('Service NowTest Custom Name');
        await adminHomeDashboard.selectDefaultName();
        await endUserServiceNowTicketsPage.verifyServiceNowTicketsPageTitle('ServiceNow tickets');
        await endUserServiceNowTicketsPage.verifyCustomNameInServiceNowMenu('ServiceNow tickets');
      }
    );

    multiUserTileFixture(
      'Verify the Custom Name of the ServiceNow ticket in Tickets Page with special characters',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: ['INT-11440', 'INT-11441'],
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new SupportAndTicketingPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        await adminHomeDashboard.verifyServiceNowFieldsVisible();
        await adminHomeDashboard.selectCustomNameAndFillValue('#@&!D@SAD');
        const endUserServiceNowTicketsPage = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNowTicketsPage.loadPage();
        await endUserServiceNowTicketsPage.verifyThePageIsLoaded();
        await endUserServiceNowTicketsPage.verifyServiceNowTicketsPageTitle('#@&!D@SAD');
        await endUserServiceNowTicketsPage.verifyCustomNameInServiceNowMenu('#@&!D@SAD');
        await adminHomeDashboard.selectDefaultName();
        await endUserServiceNowTicketsPage.verifyServiceNowTicketsPageTitle('ServiceNow tickets');
        await endUserServiceNowTicketsPage.verifyCustomNameInServiceNowMenu('ServiceNow tickets');
      }
    );

    multiUserTileFixture(
      'Verify New Ticket button is visible on Service Now Tickets Page and Ticket creation can be cancelled',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: ['INT-9702', 'INT-10615', 'INT-10436', 'INT-10437', 'INT-9970', 'INT-9973'],
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new ServiceNowTicketsPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        await adminHomeDashboard.verifyTicketListIsVisible();
        const endUserServiceNow = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNow.loadPage();
        await endUserServiceNow.verifyThePageIsLoaded();
        await endUserServiceNow.verifyTicketListIsVisible();
        await endUserServiceNow.clickNewTicketButton();
        await endUserServiceNow.verifyNewTicketOptionVisible(true);
        await endUserServiceNow.clickButton('Cancel');
        await endUserServiceNow.verifyNewTicketOptionVisible(false);
      }
    );

    multiUserTileFixture(
      'Verify ServiceNow Create ticket popup should close by clicking on X',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: ['INT-11316'],
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new ServiceNowTicketsPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        await adminHomeDashboard.verifyTicketListIsVisible();
        const endUserServiceNow = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNow.loadPage();
        await endUserServiceNow.verifyThePageIsLoaded();
        await endUserServiceNow.verifyTicketListIsVisible();
        await endUserServiceNow.clickNewTicketButton();
        await endUserServiceNow.verifyNewTicketOptionVisible(true);
        await endUserServiceNow.clickCloseTicketCreationButton();
        await endUserServiceNow.verifyNewTicketOptionVisible(false);
      }
    );

    multiUserTileFixture(
      'Verify Ticket creation can be done successfully',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: ['INT-10415', 'INT-10604', 'INT-10606', 'INT-10607'],
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
      'Verify SNOW Ticket creation without adding mandatory fields value',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-11315',
          storyId: 'INT-28224',
        });

        const adminHomeDashboard = new ServiceNowTicketsPage(adminPage);
        await adminHomeDashboard.loadPage();
        await adminHomeDashboard.verifyThePageIsLoaded();
        const endUserServiceNow = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNow.loadPage();
        await endUserServiceNow.verifyThePageIsLoaded();
        await endUserServiceNow.createNewTicket({
          title: '',
          description: 'Test Description',
        });
        await endUserServiceNow.verifyCreateTicketButtonIsDisabled();
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
        await endUserServiceNowTicketsPage.verifyTicketSortingByDate('desc');
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
        await endUserServiceNowTicketsPage.verifyTicketSortingByDate('asc');
      }
    );

    multiUserTileFixture(
      'Verify ServiceNow tickets Sorting by Status, A-Z',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-9979',
          storyId: 'INT-28224',
        });

        // Test sorting functionality with admin user
        const adminServiceNowTicketsPage = new ServiceNowTicketsPage(adminPage);
        await adminServiceNowTicketsPage.loadPage();
        await adminServiceNowTicketsPage.verifyThePageIsLoaded();

        // Open sort dropdown and select "Status, A-Z"
        await adminServiceNowTicketsPage.sortByStatus('Status, A-Z');

        // Verify tickets are sorted correctly (using unified function)
        await adminServiceNowTicketsPage.verifyTicketSortingByStatus('Status, A-Z');

        // Test sorting functionality with end user
        const endUserServiceNowTicketsPage = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNowTicketsPage.loadPage();
        await endUserServiceNowTicketsPage.verifyThePageIsLoaded();

        // Apply sorting for end user as well (A-Z order)
        await endUserServiceNowTicketsPage.sortByStatus('Status, A-Z');

        // Verify sorting works for end user too (using unified function)
        await endUserServiceNowTicketsPage.verifyTicketSortingByStatus('Status, A-Z');
      }
    );

    multiUserTileFixture(
      'Verify ServiceNow tickets Sorting by Status, Z-A',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-9980',
          storyId: 'INT-28224',
        });

        // Test sorting functionality with admin user
        const adminServiceNowTicketsPage = new ServiceNowTicketsPage(adminPage);
        await adminServiceNowTicketsPage.loadPage();
        await adminServiceNowTicketsPage.verifyThePageIsLoaded();

        // Open sort dropdown and select "Status, Z-A"
        await adminServiceNowTicketsPage.sortByStatus('Status, Z-A');

        // Verify tickets are sorted correctly (using unified function)
        await adminServiceNowTicketsPage.verifyTicketSortingByStatus('Status, Z-A');

        // Test sorting functionality with end user
        const endUserServiceNowTicketsPage = new ServiceNowTicketsPage(endUserPage);
        await endUserServiceNowTicketsPage.loadPage();
        await endUserServiceNowTicketsPage.verifyThePageIsLoaded();

        // Apply sorting for end user as well (Z-A order)
        await endUserServiceNowTicketsPage.sortByStatus('Status, Z-A');

        // Verify sorting works for end user too (using unified function)
        await endUserServiceNowTicketsPage.verifyTicketSortingByStatus('Status, Z-A');
      }
    );
  }
);
