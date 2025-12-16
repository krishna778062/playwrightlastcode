import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { multiUserServiceDeskFixture } from '@platforms/fixtures/multiUserServiceDeskFixture';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ServiceDeskHomePage } from '../../../pages/service-desk/serviceDeskHomePage';
import { ServiceDeskManageFeaturesPage } from '../../../pages/service-desk/serviceDeskManageFeaturesPage';
import { ServiceDeskPage } from '../../../pages/service-desk/serviceDeskPage';
import { ServiceDeskSettingsPage } from '../../../pages/service-desk/serviceDeskSettingsPage';
import { ServiceDeskTestData } from '../../test-data/service-desk.test-data';

test.describe('service desk - Application Settings', () => {
  test(
    'verify enabling ServiceDesk checkbox or toggle makes ServiceDesk appear under Manage Features',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-208'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);

      // Navigate to Service Desk settings page
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();

      const originalState = await serviceDeskSettingsPage.getServiceDeskState();

      await serviceDeskSettingsPage.verifyServiceDeskSettingsPageElements();
      await serviceDeskSettingsPage.checkEnableServiceDesk();
      await serviceDeskSettingsPage.verifyRadioButtonOptions();
      await serviceDeskSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.supportTeamsOnly);
      await serviceDeskSettingsPage.saveAndVerify();

      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskIsVisible();

      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.restoreServiceDeskState(originalState);
    }
  );

  multiUserServiceDeskFixture(
    'verify Enable ServiceDesk with Support (for everyone) behavior',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ adminServiceDeskPage, supportTeamPage, endUserPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-212', 'SHSD-214'],
      });

      // Admin user page objects
      const adminSettingsPage = new ServiceDeskSettingsPage(adminServiceDeskPage);
      const adminManageFeaturesPage = new ServiceDeskManageFeaturesPage(adminServiceDeskPage);
      const adminHomePage = new ServiceDeskHomePage(adminServiceDeskPage);

      // Support team member page objects
      const supportManageFeaturesPage = new ServiceDeskManageFeaturesPage(supportTeamPage);
      const supportHomePage = new ServiceDeskHomePage(supportTeamPage);

      // End user page objects
      const endUserHomePage = new ServiceDeskHomePage(endUserPage);

      await adminSettingsPage.navigateToServiceDeskSettings();
      const originalState = await adminSettingsPage.getServiceDeskState();

      await adminSettingsPage.checkEnableServiceDesk();
      await adminSettingsPage.verifyRadioButtonDescriptions();
      await adminSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.everyone);
      await adminSettingsPage.saveAndVerify();

      await adminManageFeaturesPage.navigateToManageFeatures();
      await adminManageFeaturesPage.verifyServiceDeskIsVisible();

      await adminHomePage.navigateToHome();
      await adminHomePage.verifySupportOptionIsVisible();

      await supportManageFeaturesPage.navigateToManageFeatures();
      await supportManageFeaturesPage.verifyServiceDeskIsVisible();

      await supportHomePage.navigateToHome();
      await supportHomePage.verifySupportOptionIsVisible();

      await endUserHomePage.navigateToHome();
      await endUserHomePage.verifySupportOptionIsVisible();

      await adminSettingsPage.navigateToServiceDeskSettings();
      await adminSettingsPage.restoreServiceDeskState(originalState);
    }
  );

  multiUserServiceDeskFixture(
    'verify Enable ServiceDesk (for support teams only) behavior',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ adminServiceDeskPage, supportTeamPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-211'],
      });

      // Admin user page objects
      const adminSettingsPage = new ServiceDeskSettingsPage(adminServiceDeskPage);
      const adminManageFeaturesPage = new ServiceDeskManageFeaturesPage(adminServiceDeskPage);
      const adminHomePage = new ServiceDeskHomePage(adminServiceDeskPage);

      // Support team member page objects
      const supportManageFeaturesPage = new ServiceDeskManageFeaturesPage(supportTeamPage);
      const supportHomePage = new ServiceDeskHomePage(supportTeamPage);

      await adminSettingsPage.navigateToServiceDeskSettings();
      const originalState = await adminSettingsPage.getServiceDeskState();

      await adminSettingsPage.checkEnableServiceDesk();
      await adminSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.supportTeamsOnly);
      await adminSettingsPage.saveAndVerify();

      await adminManageFeaturesPage.navigateToManageFeatures();
      await adminManageFeaturesPage.verifyServiceDeskIsVisible();

      await adminHomePage.navigateToHome();
      await adminHomePage.verifySupportOptionNotVisible();

      await supportManageFeaturesPage.navigateToManageFeatures();
      await supportManageFeaturesPage.verifyServiceDeskIsVisible();

      await supportHomePage.navigateToHome();
      await supportHomePage.verifySupportOptionNotVisible();

      await adminSettingsPage.navigateToServiceDeskSettings();
      await adminSettingsPage.restoreServiceDeskState(originalState);
    }
  );

  test(
    'verify two radio options are visible ONLY when ServiceDesk is enabled',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-210'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);

      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      const originalState = await serviceDeskSettingsPage.getServiceDeskState();

      await serviceDeskSettingsPage.uncheckDisableServiceDesk();
      await serviceDeskSettingsPage.verifyRadioButtonOptionsNotVisible();

      await serviceDeskSettingsPage.checkEnableServiceDesk();
      await serviceDeskSettingsPage.verifyRadioButtonOptions();

      await serviceDeskSettingsPage.restoreServiceDeskState(originalState);
    }
  );

  test(
    'verify when ServiceDesk is NOT enabled the ServiceDesk module does NOT appear in navigation or Manage Features',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-209'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);

      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      const originalState = await serviceDeskSettingsPage.getServiceDeskState();

      await serviceDeskSettingsPage.disableServiceDeskIfEnabled();

      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskNotVisible();

      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.restoreServiceDeskState(originalState);
    }
  );
});

test.describe('service desk - Create Ticket', () => {
  test(
    'verify whether user is able to raise a new ticket with mandatory details, and the system generates a unique ticket ID with acknowledgment',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-101', 'SHSD-102', 'SHSD-113', 'SHSD-115'],
      });

      const serviceDesk = new ServiceDeskPage(serviceDeskPage);
      await serviceDesk.loadPage();

      const initialTicketCount = await serviceDesk.getTicketCountFromAPI();

      const imageFiles = ServiceDeskTestData.getImageFilePaths(__dirname).all;
      const ticketData = ServiceDeskTestData.sampleTickets.hrTicket;

      await serviceDesk.createTicket({
        ...ticketData,
        subject: `${ticketData.subject} ${faker.string.alphanumeric(8)}`,
        description: `${ticketData.description} ${faker.lorem.sentence()}`,
        attachmentPath: imageFiles,
      });

      const ticketId = await serviceDesk.verifyTicketCreationSuccess();
      expect(ticketId).toMatch(ServiceDeskTestData.ticketIdPatterns.general);

      await serviceDesk.verifyTicketCountAndSLA(initialTicketCount);

      await test.step('Assign ticket to agent', async () => {
        await serviceDesk.assignTicketToAgent(ticketId);
      });

      await serviceDesk.navigateToTicketDetails(ticketId);
      await serviceDesk.verifyAttachedImages(ServiceDeskTestData.imageFileNames);
      await serviceDesk.deleteTicketFromDetailsPage();
    }
  );
});

test.describe('service desk - Global Settings Access Control', () => {
  multiUserServiceDeskFixture(
    'verify global settings is accessible only to app manager and account admin not to agents or endusers',
    { tag: [TestPriority.P1, '@service-desk'] },
    async ({ adminServiceDeskPage, supportTeamPage, endUserPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-98'],
      });

      await test.step('Step 1: Verify Admin (App Manager) can access Global Settings', async () => {
        const adminSettingsPage = new ServiceDeskSettingsPage(adminServiceDeskPage);
        await adminSettingsPage.navigateToGlobalSettings();
        await adminSettingsPage.verifyGlobalSettingsAccessible();
      });

      await test.step('Step 2: Verify Support Team Member cannot access Global Settings', async () => {
        const supportSettingsPage = new ServiceDeskSettingsPage(supportTeamPage);
        await supportSettingsPage.verifyGlobalSettingsNotAccessible({ skipUINavigation: true });
      });

      await test.step('Step 3: Verify End User cannot access Global Settings', async () => {
        const endUserSettingsPage = new ServiceDeskSettingsPage(endUserPage);
        await endUserSettingsPage.verifyGlobalSettingsNotAccessible({ skipUINavigation: true });
      });
    }
  );
});

test.describe('service desk - Ticket Access Control', () => {
  multiUserServiceDeskFixture(
    'verify whether unauthorized users are restricted from viewing or editing tickets',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ endUserPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-112'],
      });

      await test.step('Verify End User cannot access ticket viewing or editing', async () => {
        const endUserServiceDeskPage = new ServiceDeskPage(endUserPage);
        await endUserServiceDeskPage.verifyTicketAccessRestricted();
      });
    }
  );
});

test.describe('service desk - Workspace Settings', () => {
  test(
    'verify presence of three different default workspaces and the settings of those',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-267'],
      });

      const adminSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);

      await adminSettingsPage.navigateToRequestManagement();

      await test.step('Verify Finance workspace and its settings', async () => {
        await adminSettingsPage.verifyWorkspaceSettings(
          ServiceDeskTestData.workspaces.finance,
          ServiceDeskTestData.workspaceSettings.serviceCatalogs.finance
        );
      });

      await test.step('Verify HR workspace and its settings', async () => {
        await adminSettingsPage.switchWorkspace(ServiceDeskTestData.workspaces.hr);
        await adminSettingsPage.verifyWorkspaceSettings(
          ServiceDeskTestData.workspaces.hr,
          ServiceDeskTestData.workspaceSettings.serviceCatalogs.hr
        );
      });

      await test.step('Verify IT workspace and its settings', async () => {
        await adminSettingsPage.switchWorkspace(ServiceDeskTestData.workspaces.it);
        await adminSettingsPage.verifyWorkspaceSettings(
          ServiceDeskTestData.workspaces.it,
          ServiceDeskTestData.workspaceSettings.serviceCatalogs.it
        );
      });
    }
  );
});
