import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ServiceDeskHomePage } from '../../../pages/service-desk/serviceDeskHomePage';
import { ServiceDeskManageFeaturesPage } from '../../../pages/service-desk/serviceDeskManageFeaturesPage';
import { ServiceDeskPage } from '../../../pages/service-desk/serviceDeskPage';
import { ServiceDeskSettingsPage } from '../../../pages/service-desk/serviceDeskSettingsPage';
import { ServiceDeskTestData } from '../../test-data/service-desk.test-data';

test.describe('service desk - Application Settings', () => {
  test(
    'verify enabling ServiceDesk checkbox or toggle makes ServiceDesk appear under Manage Features',
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-208'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);

      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.verifyServiceDeskSettingsPageElements();
      await serviceDeskSettingsPage.checkEnableServiceDesk();
      await serviceDeskSettingsPage.verifyRadioButtonOptions();
      await serviceDeskSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.supportTeamsOnly);
      await serviceDeskSettingsPage.saveAndVerify();
      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskIsVisible();
    }
  );

  test(
    'verify Enable ServiceDesk with Support (for everyone) behavior',
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-212'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);
      const homePage = new ServiceDeskHomePage(serviceDeskPage);

      // Admin user (lakshmi): Enable Service Desk with "everyone"
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.checkEnableServiceDesk();
      await serviceDeskSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.everyone);
      await serviceDeskSettingsPage.saveAndVerify();
      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskIsVisible();
      await homePage.navigateToHome();
      await homePage.verifySupportOptionIsVisible();

      // Logout admin
      await serviceDeskSettingsPage.logout();

      // Login as support team member
      const supportTeamMemberEmail = process.env.SUPPORT_TEAM_MEMBER!;
      const password = process.env.SERVICE_DESK_PASSWORD!;
      await serviceDeskSettingsPage.loginAs(supportTeamMemberEmail, password);

      // Support team member: Verify Service Desk visible, Support IS visible
      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskIsVisible();
      await homePage.navigateToHome();
      await homePage.verifySupportOptionIsVisible();

      // Logout support team member
      await serviceDeskSettingsPage.logout();

      // Login as end user
      const endUserEmail = process.env.END_USER!;
      await serviceDeskSettingsPage.loginAs(endUserEmail, password);

      // End user: Verify Support IS visible
      await homePage.navigateToHome();
      await homePage.verifySupportOptionIsVisible();
    }
  );

  test(
    'verify Enable ServiceDesk (for support teams only) behavior',
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-211'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);
      const homePage = new ServiceDeskHomePage(serviceDeskPage);

      // Admin user (lakshmi): Enable Service Desk with "support teams only"
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.checkEnableServiceDesk();
      await serviceDeskSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.supportTeamsOnly);
      await serviceDeskSettingsPage.saveAndVerify();
      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskIsVisible();
      await homePage.navigateToHome();
      await homePage.verifySupportOptionNotVisible();

      // Logout admin
      await serviceDeskSettingsPage.logout();

      // Login as support team member
      const supportTeamMemberEmail = process.env.SUPPORT_TEAM_MEMBER!;
      const password = process.env.SERVICE_DESK_PASSWORD!;
      await serviceDeskSettingsPage.loginAs(supportTeamMemberEmail, password);

      // Support team member: Verify Service Desk visible, Support NOT visible
      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskIsVisible();
      await homePage.navigateToHome();
      await homePage.verifySupportOptionNotVisible();
    }
  );

  test(
    'verify two radio options are visible ONLY when ServiceDesk is enabled',
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-210'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);

      await serviceDeskSettingsPage.navigateToServiceDeskSettings();

      // When disabled → verify absence of radio options
      await serviceDeskSettingsPage.uncheckDisableServiceDesk();
      await serviceDeskSettingsPage.verifyRadioButtonOptionsNotVisible();

      // When enabled → verify presence of radio options
      await serviceDeskSettingsPage.checkEnableServiceDesk();
      await serviceDeskSettingsPage.verifyRadioButtonOptions();
    }
  );

  test(
    'verify when ServiceDesk is NOT enabled the ServiceDesk module does NOT appear in navigation or Manage Features',
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-209'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);

      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.disableServiceDeskIfEnabled();
      await manageFeaturesPage.navigateToManageFeatures();
      await manageFeaturesPage.verifyServiceDeskNotVisible();
    }
  );
});

test.describe('service desk - Create Ticket', () => {
  test(
    'verify whether user is able to raise a new ticket with mandatory details, and the system generates a unique ticket ID with acknowledgment',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-101'],
      });

      const serviceDesk = new ServiceDeskPage(serviceDeskPage);
      // Navigate to Service Desk page after login
      await serviceDesk.loadPage();
      // Create ticket using test data with dynamic values
      const ticketData = ServiceDeskTestData.sampleTickets.hrTicket;
      await serviceDesk.createTicket({
        ...ticketData,
        subject: `${ticketData.subject} ${faker.string.alphanumeric(8)}`,
        description: `${ticketData.description} ${faker.lorem.sentence()}`,
      });

      // Verify ticket creation success and get ticket ID
      const ticketId = await serviceDesk.verifyTicketCreationSuccess();

      // Verify ticket ID format matches expected pattern
      expect(ticketId).toMatch(ServiceDeskTestData.ticketIdPatterns.general);

      // Log ticket ID for reference
      console.log(`Created ticket with ID: ${ticketId}`);

      // Cleanup: Delete the created ticket
      await serviceDesk.deleteTicket(ticketId);
      console.log(`Cleaned up ticket: ${ticketId}`);
    }
  );
});
