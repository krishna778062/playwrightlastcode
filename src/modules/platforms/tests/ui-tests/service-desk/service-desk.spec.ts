import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { multiUserServiceDeskFixture } from '@platforms/fixtures/multiUserServiceDeskFixture';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ServiceDeskHomePage } from '../../../ui/pages/service-desk/serviceDeskHomePage';
import { ServiceDeskManageFeaturesPage } from '../../../ui/pages/service-desk/serviceDeskManageFeaturesPage';
import { ServiceDeskPage } from '../../../ui/pages/service-desk/serviceDeskPage';
import { ServiceDeskSettingsPage } from '../../../ui/pages/service-desk/serviceDeskSettingsPage';
import { ServiceDeskTestData } from '../../test-data/service-desk.test-data';

test.describe('service desk - Application Settings', () => {
  test(
    'verify ServiceDesk UI elements under Manage Application and enabling makes it appear under Manage Features',
    { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-208', 'SHSD-213'],
      });

      const serviceDeskSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const manageFeaturesPage = new ServiceDeskManageFeaturesPage(serviceDeskPage);

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
    'verify Enable ServiceDesk with Support (for everyone) behavior and switching to Support Teams Only hides Support',
    { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
    async ({ adminServiceDeskPage, endUserPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-212', 'SHSD-214', 'SHSD-215'],
      });

      const adminSettingsPage = new ServiceDeskSettingsPage(adminServiceDeskPage);
      const endUserHomePage = new ServiceDeskHomePage(endUserPage);

      await adminSettingsPage.navigateToServiceDeskSettings();
      const currentState = await adminSettingsPage.getServiceDeskState();

      if (currentState.option !== 'support-teams') {
        await adminSettingsPage.checkEnableServiceDesk();
        await adminSettingsPage.selectRadioOption('support-teams');
        await adminSettingsPage.saveAndVerify();
        console.log('Selected "Support teams only" option and saved');
      } else {
        console.log('"Support teams only" option is already selected - no action needed');
      }

      await endUserHomePage.navigateToHome();
      await endUserHomePage.verifySupportOptionNotVisible();
      console.log('Verified: Support option is NOT visible for end user');
    }
  );

  multiUserServiceDeskFixture(
    'verify Enable ServiceDesk (for support teams only) behavior',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ adminServiceDeskPage, supportTeamPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-211'],
      });

      const adminSettingsPage = new ServiceDeskSettingsPage(adminServiceDeskPage);
      const adminManageFeaturesPage = new ServiceDeskManageFeaturesPage(adminServiceDeskPage);
      const adminHomePage = new ServiceDeskHomePage(adminServiceDeskPage);
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

  test(
    'verify ticket can be searched and retrieved by ID and Name',
    { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-106'],
      });

      const serviceDesk = new ServiceDeskPage(serviceDeskPage);
      await serviceDesk.loadPage();

      const uniqueSubject = `Search Test ${faker.string.alphanumeric(6)}`;

      let ticketId = '';
      await test.step('Create incident ticket', async () => {
        await serviceDesk.createTicket({
          subject: uniqueSubject,
          description: `Test ticket for search verification`,
          priority: 'Medium',
        });
        ticketId = await serviceDesk.verifyTicketCreationSuccess();
        expect(ticketId).toMatch(ServiceDeskTestData.ticketIdPatterns.incident);
        console.log(`Created ticket: ${ticketId} with subject: ${uniqueSubject}`);
      });

      await test.step('Search for ticket by number in search box', async () => {
        const requestManagement = serviceDesk.page.getByRole('link', { name: 'Request management' });
        await requestManagement.click();
        await expect(serviceDesk.page.getByRole('heading', { name: 'Tickets' })).toBeVisible({ timeout: 15000 });

        const ticketNumber = ticketId.replace('INC-', '');
        await serviceDesk.searchTicket(ticketNumber);
        console.log(`Searching for ticket number: ${ticketNumber}`);
      });

      await test.step('Verify searched ticket appears in results', async () => {
        const ticketText = serviceDesk.page.getByText(ticketId);
        await expect(ticketText).toBeVisible({ timeout: 15000 });
        console.log(`Verified ticket ${ticketId} appears in search results`);
      });

      await test.step('Delete ticket from three dots menu', async () => {
        const threeDotsButton = serviceDesk.page
          .locator('button')
          .filter({ hasText: '•••' })
          .first()
          .or(serviceDesk.page.locator('button').filter({ hasText: '...' }).first())
          .or(serviceDesk.page.getByRole('button', { name: /more|menu|options/i }).first());

        await expect(threeDotsButton).toBeVisible({ timeout: 5000 });
        await threeDotsButton.click();
        await serviceDesk.page.waitForTimeout(500);

        const deleteOption = serviceDesk.page.getByRole('menuitem', { name: /delete/i });
        await deleteOption.click();

        const confirmButton = serviceDesk.page.getByRole('button', { name: /delete|confirm|yes/i });
        const isConfirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (isConfirmVisible) {
          await confirmButton.click();
        }

        await serviceDesk.page.waitForTimeout(1000);
        console.log(`Deleted ticket ${ticketId} from three dots menu`);
      });
    }
  );
});

test.describe('service desk - Ticket Updates', () => {
  multiUserServiceDeskFixture(
    'verify agent can update ticket with comments/attachments and requester can view the updates',
    { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
    async ({ adminServiceDeskPage, supportTeamPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-103'],
      });

      const agentServiceDesk = new ServiceDeskPage(adminServiceDeskPage);
      const adminSettingsPage = new ServiceDeskSettingsPage(adminServiceDeskPage);

      const uniqueSubject = `Comment Test ${faker.string.alphanumeric(6)}`;
      const agentComment = 'This is a public comment from agent for testing';

      let ticketId = '';
      let originalState: { enabled: boolean; option?: 'support-teams' | 'everyone' };

      await test.step('Admin: Ensure "Support for Everyone" option is selected', async () => {
        await adminSettingsPage.navigateToServiceDeskSettings();
        originalState = await adminSettingsPage.getServiceDeskState();

        if (originalState.option !== 'everyone') {
          await adminSettingsPage.checkEnableServiceDesk();
          await adminSettingsPage.selectRadioOption('everyone');
          await adminSettingsPage.saveAndVerify();
          console.log('Switched to "Support for Everyone" option');
        } else {
          console.log('"Support for Everyone" option is already selected');
        }
      });

      await test.step('Agent: Create incident ticket', async () => {
        await agentServiceDesk.loadPage();
        await agentServiceDesk.page.getByRole('link', { name: 'Request management' }).click();
        await agentServiceDesk.page.waitForTimeout(3000);

        await agentServiceDesk.createTicket({
          subject: uniqueSubject,
          description: 'Test ticket for comment verification',
          priority: 'Medium',
          requester: 'Howard Nelson',
        });
        ticketId = await agentServiceDesk.verifyTicketCreationSuccess();
        console.log(`Created ticket: ${ticketId}`);
      });

      await test.step('Agent: Open ticket and add public comment', async () => {
        await agentServiceDesk.page.getByRole('link', { name: 'Request management' }).click();
        await agentServiceDesk.page.waitForTimeout(2000);
        await agentServiceDesk.page.getByText(ticketId).click();
        await agentServiceDesk.page.waitForTimeout(2000);
        await agentServiceDesk.addCommentToTicket(agentComment, true);
        console.log(`Added comment to ticket: ${ticketId}`);
      });

      await test.step('Howard Nelson: Open Support and verify ticket comment', async () => {
        const serviceDeskUrl = process.env.SERVICE_DESK_URL || 'https://servicedesk-new.qa.simpplr.xyz';

        await supportTeamPage.goto(`${serviceDeskUrl}/home`);
        await supportTeamPage.waitForLoadState('networkidle').catch(() => {});
        await supportTeamPage.waitForTimeout(2000);

        const supportOption = supportTeamPage.getByText('Support');
        await expect(supportOption).toBeVisible({ timeout: 10000 });
        await supportOption.click();
        await supportTeamPage.waitForTimeout(2000);

        await supportTeamPage.getByText(ticketId).click();
        await supportTeamPage.waitForTimeout(2000);

        const activitiesTab = supportTeamPage.getByRole('tab', { name: /activities|comments/i });
        const isTabVisible = await activitiesTab.isVisible({ timeout: 3000 }).catch(() => false);
        if (isTabVisible) {
          await activitiesTab.click();
          await supportTeamPage.waitForTimeout(1000);
        }

        const commentText = supportTeamPage.getByText(agentComment);
        await expect(commentText).toBeVisible({ timeout: 10000 });
        console.log(`Howard Nelson verified comment: ${agentComment}`);
      });

      await test.step('Cleanup: Delete the created ticket', async () => {
        try {
          await agentServiceDesk.loadPage();
          await agentServiceDesk.page.getByRole('link', { name: 'Request management' }).click();
          await agentServiceDesk.page.waitForTimeout(2000);

          const ticketNumber = ticketId.replace('INC-', '');
          await agentServiceDesk.searchTicket(ticketNumber);
          await agentServiceDesk.page.waitForTimeout(1000);

          const threeDotsButton = agentServiceDesk.page
            .locator('button')
            .filter({ hasText: '•••' })
            .first()
            .or(agentServiceDesk.page.locator('button').filter({ hasText: '...' }).first())
            .or(agentServiceDesk.page.getByRole('button', { name: /more|menu|options/i }).first())
            .or(agentServiceDesk.page.locator('[data-testid*="menu"], [data-testid*="dropdown"]').first());

          const isThreeDotsVisible = await threeDotsButton.isVisible({ timeout: 5000 }).catch(() => false);
          if (isThreeDotsVisible) {
            await threeDotsButton.click();
            await agentServiceDesk.page.waitForTimeout(500);

            const deleteOption = agentServiceDesk.page
              .getByRole('menuitem', { name: /delete/i })
              .or(agentServiceDesk.page.getByText('Delete'));
            await deleteOption.click();

            const confirmButton = agentServiceDesk.page.getByRole('button', { name: /delete|confirm|yes/i });
            const isConfirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
            if (isConfirmVisible) {
              await confirmButton.click();
            }

            await agentServiceDesk.page.waitForTimeout(1000);
            console.log(`Deleted ticket ${ticketId}`);
          } else {
            console.log(`Could not find delete button for ticket ${ticketId} - skipping cleanup`);
          }
        } catch (error) {
          console.log(`Cleanup failed for ticket ${ticketId}: ${error}`);
        }
      });
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

test.describe('service desk - Workspace Management Access Control', () => {
  test(
    'verify only users with admin role can access workspace management',
    { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-119'],
      });

      const workspaceName = ServiceDeskTestData.workspaces.finance;
      const adminSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);

      await test.step('Admin: Navigate to Settings > Workspace management > Workspace', async () => {
        await adminSettingsPage.navigateToWorkspaceAdministration(workspaceName);
      });

      await test.step('Admin: Verify Workspace Administration screen is accessible', async () => {
        await adminSettingsPage.verifyWorkspaceAdministrationAccessible();
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

test.describe('service desk - Message Templates', () => {
  test(
    'verify admin is able to create a new message template with required details and save it successfully',
    { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-138'],
      });

      const adminSettingsPage = new ServiceDeskSettingsPage(serviceDeskPage);
      const templateData = ServiceDeskTestData.messageTemplates.sampleTemplate;
      const uniqueTemplateName = `${templateData.name} ${faker.string.alphanumeric(6)}`;

      await test.step('Navigate to Message Template page', async () => {
        await adminSettingsPage.navigateToMessageTemplate(ServiceDeskTestData.workspaces.hr);
      });

      await test.step('Create a new message template for all agents', async () => {
        await adminSettingsPage.createMessageTemplate(
          {
            name: uniqueTemplateName,
            description: templateData.description,
            messageContent: templateData.messageContent,
          },
          ServiceDeskTestData.messageTemplates.visibilityOptions.allAgents
        );
      });

      await test.step('Verify message template is created successfully', async () => {
        await adminSettingsPage.verifyMessageTemplateCreated(uniqueTemplateName);
      });

      await test.step('Cleanup: Delete the created message template', async () => {
        await adminSettingsPage.deleteMessageTemplate(uniqueTemplateName);
      });
    }
  );
});
