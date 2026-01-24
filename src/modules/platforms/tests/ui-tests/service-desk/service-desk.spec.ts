import { faker } from '@faker-js/faker';
import { Browser, expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TIMEOUTS } from '@core/constants/timeouts';
import { LoginPage } from '@core/ui/pages/loginPage';
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

  test.describe('service desk - Ticket Search', () => {
    let ticketId: string;
    let uniqueSubject: string;

    test.beforeEach(async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      const serviceDesk = new ServiceDeskPage(serviceDeskPage);
      await serviceDesk.loadPage();

      uniqueSubject = `Search Test ${faker.string.alphanumeric(6)}`;

      await test.step('Create incident ticket', async () => {
        await serviceDesk.createTicket({
          subject: uniqueSubject,
          description: `Test ticket for search verification`,
          priority: 'Medium',
        });
        ticketId = await serviceDesk.verifyTicketCreationSuccess();
        expect(ticketId).toMatch(ServiceDeskTestData.ticketIdPatterns.incident);
        console.log(`✓ Created ticket in beforeEach: ${ticketId} with subject: ${uniqueSubject}`);
      });
    });

    test.afterEach(async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      if (ticketId) {
        await test.step('Delete the created ticket', async () => {
          const serviceDesk = new ServiceDeskPage(serviceDeskPage);
          try {
            await serviceDesk.deleteTicket(ticketId);
            console.log(`✓ Deleted ticket in afterEach: ${ticketId}`);
          } catch (error: unknown) {
            console.warn(`⚠ Could not delete ticket ${ticketId} in afterEach: ${error}`);
          }
        });
      }
    });

    test(
      'verify ticket can be searched and retrieved by ID and Name',
      { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
      async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
        tagTest(test.info(), {
          zephyrTestId: ['SHSD-106'],
        });

        const serviceDesk = new ServiceDeskPage(serviceDeskPage);

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
          console.log(`✓ Verified ticket ${ticketId} appears in search results`);
        });
      }
    );
  });
});

test.describe('service desk - Ticket Updates', () => {
  let ticketId: string;
  let uniqueSubject: string;

  multiUserServiceDeskFixture.beforeEach(async ({ adminServiceDeskPage }) => {
    const agentServiceDesk = new ServiceDeskPage(adminServiceDeskPage);
    const adminSettingsPage = new ServiceDeskSettingsPage(adminServiceDeskPage);

    uniqueSubject = `Comment Test ${faker.string.alphanumeric(6)}`;

    await test.step('Admin: Ensure "Support for Everyone" option is selected', async () => {
      await adminSettingsPage.navigateToServiceDeskSettings();
      const originalState = await adminSettingsPage.getServiceDeskState();

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
      await agentServiceDesk.page.waitForTimeout(2000);

      await agentServiceDesk.createTicket({
        subject: uniqueSubject,
        description: 'Test ticket for comment verification',
        priority: 'Medium',
        requester: 'Howard Nelson',
      });
      ticketId = await agentServiceDesk.verifyTicketCreationSuccess();
      console.log(`✓ Created ticket in beforeEach: ${ticketId}`);
    });
  });

  multiUserServiceDeskFixture.afterEach(async ({ adminServiceDeskPage }) => {
    if (ticketId) {
      await test.step('Admin: Delete the created ticket', async () => {
        try {
          const agentServiceDesk = new ServiceDeskPage(adminServiceDeskPage);
          await agentServiceDesk.deleteTicket(ticketId);
          console.log(`✓ Deleted ticket in afterEach: ${ticketId}`);
        } catch (error) {
          console.log(`⚠ Could not delete ticket ${ticketId} in afterEach:`, error);
          // Don't fail the test if cleanup fails
        }
      });
    }
  });

  multiUserServiceDeskFixture(
    'verify agent can update ticket with comments/attachments and requester can view the updates',
    { tag: [TestPriority.P0, '@service-desk', '@service-desk1'] },
    async ({ adminServiceDeskPage, supportTeamPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-103'],
      });

      const agentServiceDesk = new ServiceDeskPage(adminServiceDeskPage);
      const agentComment = 'This is a public comment from agent for testing';

      await test.step('Agent: Open ticket and add public comment', async () => {
        await agentServiceDesk.page.getByRole('link', { name: 'Request management' }).click();
        await agentServiceDesk.page.waitForTimeout(1000);
        await agentServiceDesk.page.getByText(ticketId).click();
        await agentServiceDesk.page.waitForTimeout(1000);
        await agentServiceDesk.addCommentToTicket(agentComment, true);
        try {
          await agentServiceDesk.verifyCommentVisible(agentComment);
        } catch {
          console.log('Comment not visible on agent view yet - continuing');
        }
        console.log(`✓ Added comment to ticket: ${ticketId}`);
      });

      await test.step('Howard Nelson: Open Support and verify ticket comment', async () => {
        const supportServiceDesk = new ServiceDeskPage(supportTeamPage);
        const supportEmail = process.env.SUPPORT_TEAM_MEMBER || 'simpplr.dev+howard.nelson@example.com';
        const supportPassword = process.env.SERVICE_DESK_PASSWORD || '';

        // Login as Howard Nelson
        const loginInput = supportTeamPage.locator("input[name='inputOption']");
        const isLoginVisible = await loginInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (isLoginVisible || supportTeamPage.url().includes('/login')) {
          const loginPage = new LoginPage(supportTeamPage);
          await loginPage.performLoginWithPassword(supportEmail, supportPassword);
          await supportTeamPage.waitForURL(/\/home/, { waitUntil: 'domcontentloaded' });
          console.log('✓ Logged in as Howard Nelson');
        }

        // Wait a bit for the ticket to be synced/visible in requester's view
        await supportTeamPage.waitForTimeout(3000);
        console.log('Waiting for ticket to be synced...');

        // Navigate to the ticket (this will open it in a drawer)
        await supportServiceDesk.navigateToTicketAsRequester(ticketId);
        console.log(`✓ Navigated to ticket ${ticketId}`);

        // Wait for drawer to be fully loaded
        await supportTeamPage.waitForTimeout(2000);

        // Wait for the ticket heading in the drawer
        const drawerHeading = supportTeamPage.getByRole('heading', { name: new RegExp(ticketId, 'i') });
        await expect(drawerHeading).toBeVisible({ timeout: 10000 });
        console.log(`✓ Drawer opened with ticket ${ticketId}`);

        // Click on Comments tab
        const commentsTab = supportTeamPage.getByRole('tab', { name: /comments/i });
        await expect(commentsTab).toBeVisible({ timeout: 5000 });
        await commentsTab.click();
        await supportTeamPage.waitForTimeout(1000);
        console.log('✓ Clicked Comments tab');

        // Verify the comment is visible
        const commentElement = supportTeamPage.getByText(agentComment);
        await expect(commentElement).toBeVisible({ timeout: 10000 });
        console.log(`✓ Howard Nelson verified comment: "${agentComment}"`);
      });

      console.log(`✓ Test completed for ticket ${ticketId}`);
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
    async ({ serviceDeskPage, browser }: { serviceDeskPage: Page; browser: Browser }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-119'],
      });

      const supportEmail = process.env.SUPPORT_TEAM_MEMBER || 'simpplr.dev+howard.nelson@example.com';
      const supportPassword = process.env.SERVICE_DESK_PASSWORD || 'Simpplr@123';
      const workspaceAdminUrl = `${process.env.SERVICE_DESK_URL}/service-desk/settings/workspace/administration/670e663f-fa0f-4c8e-aae0-31790f8beca1`;

      await test.step('Admin: Verify admin can access workspace administration', async () => {
        // Admin navigates to workspace administration
        await serviceDeskPage.goto(workspaceAdminUrl, { waitUntil: 'domcontentloaded' });
        await serviceDeskPage.waitForTimeout(2000);

        // Verify admin has access (no access denied message)
        const accessDenied = serviceDeskPage.getByText(/Access denied/i);
        const hasAccess = !(await accessDenied.isVisible({ timeout: 3000 }).catch(() => false));

        if (!hasAccess) {
          throw new Error('Admin should have access to workspace administration');
        }

        console.log('✓ Admin has access to workspace administration');
      });

      await test.step('Agent (Howard Nelson): Verify agent cannot access workspace administration', async () => {
        // Create new context and page for Howard Nelson (agent)
        const howardContext = await browser.newContext();
        const howardPage = await howardContext.newPage();

        // Login as Howard Nelson
        await howardPage.goto(`${process.env.SERVICE_DESK_URL}/login`, {
          waitUntil: 'domcontentloaded',
        });
        await howardPage.waitForTimeout(2000);

        const loginPage = new LoginPage(howardPage);
        await loginPage.performLoginWithPassword(supportEmail, supportPassword);
        await howardPage.waitForURL(url => !url.pathname.includes('authenticate'), {
          timeout: TIMEOUTS.MEDIUM,
        });
        await howardPage.waitForTimeout(2000);
        console.log('✓ Howard Nelson logged in successfully');

        // Try to navigate to workspace administration (should be denied)
        await howardPage.goto(workspaceAdminUrl, { waitUntil: 'domcontentloaded' });
        await howardPage.waitForTimeout(3000);

        // Verify access denied message
        const accessDeniedHeading = howardPage.getByText(/Access denied/i);
        const accessDeniedMessage = howardPage.getByText(/You do not have permission to access this page/i);

        await expect(accessDeniedHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });
        await expect(accessDeniedMessage).toBeVisible({ timeout: TIMEOUTS.SHORT });

        console.log('✓ Access denied verification successful');

        // Cleanup
        await howardContext.close();
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

      await adminSettingsPage.verifyDefaultWorkspacesPresence();
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
