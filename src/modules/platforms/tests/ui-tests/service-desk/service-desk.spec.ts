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
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-208'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);

      // Navigate to Service Desk settings page
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();

      // Save original state for cleanup
      const originalState = await serviceDeskSettingsPage.getServiceDeskState();
      console.log(`Original Service Desk state: ${JSON.stringify(originalState)}`);

      // Verify all elements on Service Desk settings page are visible
      await serviceDeskSettingsPage.verifyServiceDeskSettingsPageElements();

      // Enable Service Desk checkbox
      await serviceDeskSettingsPage.checkEnableServiceDesk();

      // Verify radio button options are displayed when Service Desk is enabled
      await serviceDeskSettingsPage.verifyRadioButtonOptions();

      // Select "support teams only" radio option
      await serviceDeskSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.supportTeamsOnly);

      // Save changes and verify success toast
      await serviceDeskSettingsPage.saveAndVerify();
      console.log('Service Desk enabled successfully with support teams only option');

      // Navigate to Manage Features page
      await manageFeaturesPage.navigateToManageFeatures();

      // Verify Service Desk option is visible in Manage Features
      await manageFeaturesPage.verifyServiceDeskIsVisible();
      console.log('Service Desk option verified in Manage Features');

      // Cleanup: Restore original Service Desk state
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.restoreServiceDeskState(originalState);
      console.log('Restored original Service Desk state');
    }
  );

  multiUserServiceDeskFixture(
    'verify Enable ServiceDesk with Support (for everyone) behavior',
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
    async ({ adminServiceDeskPage, supportTeamPage, endUserPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-212'],
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

      // Navigate to Service Desk settings page (as admin)
      await adminSettingsPage.navigateToServiceDeskSettings();

      // Save original state for cleanup
      const originalState = await adminSettingsPage.getServiceDeskState();
      console.log(`Original Service Desk state: ${JSON.stringify(originalState)}`);

      // Enable Service Desk checkbox (as admin)
      await adminSettingsPage.checkEnableServiceDesk();

      // Select "everyone" radio option (as admin)
      await adminSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.everyone);

      // Save changes and verify success toast (as admin)
      await adminSettingsPage.saveAndVerify();
      console.log('Service Desk enabled with everyone option');

      // Navigate to Manage Features page (as admin)
      await adminManageFeaturesPage.navigateToManageFeatures();

      // Verify Service Desk option is visible in Manage Features (as admin)
      await adminManageFeaturesPage.verifyServiceDeskIsVisible();
      console.log('Admin: Service Desk option verified in Manage Features');

      // Navigate to Home page (as admin)
      await adminHomePage.navigateToHome();

      // Verify Support option IS visible on Home page for admin
      await adminHomePage.verifySupportOptionIsVisible();
      console.log('Admin: Support option verified as visible on Home page');

      // Navigate to Manage Features page (as support team member)
      await supportManageFeaturesPage.navigateToManageFeatures();

      // Verify Service Desk option is visible in Manage Features (as support team member)
      await supportManageFeaturesPage.verifyServiceDeskIsVisible();
      console.log('Support Team: Service Desk option verified in Manage Features');

      // Navigate to Home page (as support team member)
      await supportHomePage.navigateToHome();

      // Verify Support option IS visible on Home page for support team member
      await supportHomePage.verifySupportOptionIsVisible();
      console.log('Support Team: Support option verified as visible on Home page');

      // Navigate to Home page (as end user)
      await endUserHomePage.navigateToHome();

      // Verify Support option IS visible on Home page for end user
      await endUserHomePage.verifySupportOptionIsVisible();
      console.log('End User: Support option verified as visible on Home page');

      // Cleanup: Restore original Service Desk state (as admin)
      await adminSettingsPage.navigateToServiceDeskSettings();
      await adminSettingsPage.restoreServiceDeskState(originalState);
      console.log('Restored original Service Desk state');
    }
  );

  multiUserServiceDeskFixture(
    'verify Enable ServiceDesk (for support teams only) behavior',
    { tag: [TestPriority.P0, '@service-desk', '@settings'] },
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

      // Navigate to Service Desk settings page (as admin)
      await adminSettingsPage.navigateToServiceDeskSettings();

      // Save original state for cleanup
      const originalState = await adminSettingsPage.getServiceDeskState();
      console.log(`Original Service Desk state: ${JSON.stringify(originalState)}`);

      // Enable Service Desk checkbox (as admin)
      await adminSettingsPage.checkEnableServiceDesk();

      // Select "support teams only" radio option (as admin)
      await adminSettingsPage.selectRadioOption(ServiceDeskTestData.settingsPage.radioOptions.supportTeamsOnly);

      // Save changes and verify success toast (as admin)
      await adminSettingsPage.saveAndVerify();
      console.log('Service Desk enabled with support teams only option');

      // Navigate to Manage Features page (as admin)
      await adminManageFeaturesPage.navigateToManageFeatures();

      // Verify Service Desk option is visible in Manage Features (as admin)
      await adminManageFeaturesPage.verifyServiceDeskIsVisible();
      console.log('Admin: Service Desk option verified in Manage Features');

      // Navigate to Home page (as admin)
      await adminHomePage.navigateToHome();

      // Verify Support option is NOT visible on Home page for admin
      await adminHomePage.verifySupportOptionNotVisible();
      console.log('Admin: Support option verified as not visible on Home page');

      // Navigate to Manage Features page (as support team member)
      await supportManageFeaturesPage.navigateToManageFeatures();

      // Verify Service Desk option is visible in Manage Features (as support team member)
      await supportManageFeaturesPage.verifyServiceDeskIsVisible();
      console.log('Support Team: Service Desk option verified in Manage Features');

      // Navigate to Home page (as support team member)
      await supportHomePage.navigateToHome();

      // Verify Support option is NOT visible on Home page for support team member
      await supportHomePage.verifySupportOptionNotVisible();
      console.log('Support Team: Support option verified as not visible on Home page');

      // Cleanup: Restore original Service Desk state (as admin)
      await adminSettingsPage.navigateToServiceDeskSettings();
      await adminSettingsPage.restoreServiceDeskState(originalState);
      console.log('Restored original Service Desk state');
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

      // Navigate to Service Desk settings page
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();

      // Save original state for cleanup
      const originalState = await serviceDeskSettingsPage.getServiceDeskState();
      console.log(`Original Service Desk state: ${JSON.stringify(originalState)}`);

      // Disable Service Desk checkbox
      await serviceDeskSettingsPage.uncheckDisableServiceDesk();
      console.log('Service Desk checkbox disabled');

      // Verify radio button options are NOT visible when Service Desk is disabled
      await serviceDeskSettingsPage.verifyRadioButtonOptionsNotVisible();
      console.log('Radio button options verified as not visible when disabled');

      // Enable Service Desk checkbox
      await serviceDeskSettingsPage.checkEnableServiceDesk();
      console.log('Service Desk checkbox enabled');

      // Verify radio button options ARE visible when Service Desk is enabled
      await serviceDeskSettingsPage.verifyRadioButtonOptions();
      console.log('Radio button options verified as visible when enabled');

      // Cleanup: Restore original Service Desk state
      await serviceDeskSettingsPage.restoreServiceDeskState(originalState);
      console.log('Restored original Service Desk state');
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

      // Navigate to Service Desk settings page
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();

      // Save original state for cleanup
      const originalState = await serviceDeskSettingsPage.getServiceDeskState();
      console.log(`Original Service Desk state: ${JSON.stringify(originalState)}`);

      // Disable Service Desk if it's currently enabled
      await serviceDeskSettingsPage.disableServiceDeskIfEnabled();
      console.log('Service Desk disabled successfully');

      // Navigate to Manage Features page
      await manageFeaturesPage.navigateToManageFeatures();

      // Verify Service Desk option is NOT visible in Manage Features
      await manageFeaturesPage.verifyServiceDeskNotVisible();
      console.log('Service Desk option verified as not visible in Manage Features');

      // Cleanup: Restore original Service Desk state
      await serviceDeskSettingsPage.navigateToServiceDeskSettings();
      await serviceDeskSettingsPage.restoreServiceDeskState(originalState);
      console.log('Restored original Service Desk state');
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
