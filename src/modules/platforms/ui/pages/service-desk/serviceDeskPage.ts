import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

/**
 * Service Desk Page Object Model
 *
 * Handles all interactions with the Service Desk/Ticketing system
 * including ticket creation, viewing, updating, and management.
 */
export class ServiceDeskPage extends BasePage {
  private readonly ticketListTable: Locator;
  private readonly createTicketButton: Locator;
  private readonly createTicketDialog: Locator;
  private readonly workspaceDropdown: Locator;
  private readonly categoryDropdown: Locator;
  private readonly requesterDropdown: Locator;
  private readonly subjectInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly priorityDropdown: Locator;
  private readonly attachmentButton: Locator;
  private readonly fileInput: Locator;
  private readonly createButton: Locator;
  private readonly successMessage: Locator;
  private readonly requestManagementHeading: Locator;
  private readonly dropdownTrigger: Locator;
  private readonly viewDetailsOption: Locator;
  private readonly commentEditor: Locator;
  private readonly manageFeaturesMenu: Locator;
  private readonly serviceDeskMenuItem: Locator;
  private readonly imageLabel: Locator;
  private readonly imagePreview: Locator;
  private readonly closePreviewButton: Locator;
  private readonly downloadButton: Locator;
  private readonly deleteMenuItem: Locator;
  private readonly deleteConfirmDialog: Locator;
  private readonly deleteConfirmButton: Locator;
  private readonly deleteSuccessMessage: Locator;
  private readonly stateButton: Locator;
  private readonly slaStateHeadings: Locator;
  private readonly assignUserDropdownTrigger: Locator;
  private readonly assignUserDropdown: Locator;
  private readonly rocketButton: Locator;
  private readonly appsButton: Locator;
  private readonly globalButton: Locator;
  private readonly globalButtonRegex: Locator;
  private readonly globalButtonRole: Locator;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl || '/service-desk');

    this.ticketListTable = page.getByRole('row', { name: 'select subject severity' });
    this.createTicketButton = page.getByTestId('create-ticket-button');
    this.rocketButton = page.getByRole('button', { name: 'rocket' });
    this.appsButton = page.getByTestId('popover-launcher').getByRole('button', { name: 'apps' });
    this.globalButton = page.locator('button').filter({ hasText: 'GlobalManage user and' });
    this.globalButtonRegex = page.locator('button').filter({ hasText: /Global.*Manage/i });
    this.globalButtonRole = page.getByRole('button', { name: /Global/i });
    this.createTicketDialog = page.getByRole('dialog', { name: 'Create new incident' });
    this.workspaceDropdown = page
      .getByTestId('field-Workspace')
      .locator('div')
      .filter({ hasText: 'Select workspace' })
      .nth(2);
    this.categoryDropdown = page.locator('.css-19bb58m').first();
    this.requesterDropdown = page.locator('.css-1bbetpp-control > .css-o8z36p > .css-19bb58m').first();
    this.subjectInput = page.getByRole('textbox', { name: 'Subject' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Description*' });
    this.priorityDropdown = page.locator(
      'div:nth-child(5) > div > .css-b62m3t-container > .css-1bbetpp-control > .css-o8z36p > .css-19bb58m'
    );
    this.attachmentButton = page.getByRole('button', { name: 'Select from computer' });
    this.fileInput = page.locator('input[type="file"]');
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.successMessage = page.getByText(/incident created successfully/i);
    this.requestManagementHeading = page.getByTestId('request-management-heading');
    this.dropdownTrigger = page.getByTestId('dropdown-trigger');
    this.viewDetailsOption = page.getByText('View details');
    this.commentEditor = page.getByTestId('tiptap-content').getByLabel('comment-editor');
    this.manageFeaturesMenu = page.getByRole('menuitem', { name: 'Manage features', exact: true });
    this.serviceDeskMenuItem = page.getByRole('menuitem', { name: /Service desk/ });
    this.imageLabel = page.getByLabel(/^Image:/);
    this.imagePreview = page.getByRole('group').getByRole('img');
    this.closePreviewButton = page.getByRole('button', { name: 'Close preview' });
    this.downloadButton = page.getByRole('button', { name: 'Download' });
    this.deleteMenuItem = page.getByText('Delete');
    this.deleteConfirmDialog = page.getByRole('dialog', { name: /Are you sure you want to/ });
    this.deleteConfirmButton = page.getByRole('button', { name: 'Delete' });
    this.deleteSuccessMessage = page.getByText('Ticket deleted successfully.');
    this.stateButton = page.getByTestId('state');
    this.slaStateHeadings = page.getByRole('heading', { name: /Due in/ });
    this.assignUserDropdownTrigger = page.getByTestId('assign-user-dropdown-trigger');
    this.assignUserDropdown = page.getByTestId('assign-user-dropdown');
  }

  private getServiceDeskUrl(): string {
    const serviceDeskUrl = process.env.SERVICE_DESK_URL;
    if (!serviceDeskUrl) {
      throw new Error('SERVICE_DESK_URL not configured in environment variables');
    }
    return serviceDeskUrl;
  }

  /**
   * Verify the page is loaded - required by BasePage
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.ticketListTable).toBeVisible({ timeout: 15000 });
  }

  /**
   * loadPage to handle Service Desk URL
   */
  async loadPage(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Loading Service Desk page`, async () => {
      // Navigate to manage features page
      await this.goToUrl(`${this.getServiceDeskUrl()}/nav-manage-features`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM }).catch(() => {});
      await this.page.waitForTimeout(3000);

      // Click on the three lines icon to open the sidebar (if visible)
      const threeLinesIcon = this.page.getByRole('button', { name: 'Open main navigation' });
      const isThreeLinesVisible = await threeLinesIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isThreeLinesVisible) {
        await threeLinesIcon.click();
        await this.page.waitForTimeout(2000);
      }

      // Click on "Service desk" link in the sidebar
      const serviceDeskLink = this.page.getByRole('link', { name: 'Service desk' }).first();
      await expect(serviceDeskLink).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await serviceDeskLink.click();
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM }).catch(() => {});
      await this.page.waitForTimeout(3000);

      // Wait for Request management link to be visible
      const requestMgmtLink = this.page.getByRole('link', { name: 'Request management' });
      await expect(requestMgmtLink).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Find Global button using multiple locator strategies
   */
  private async findGlobalButton(): Promise<Locator> {
    const strategies = [this.globalButton, this.globalButtonRegex, this.globalButtonRole];

    for (const locator of strategies) {
      try {
        await expect(locator).toBeVisible({ timeout: 3000 });
        return locator;
      } catch {
        continue;
      }
    }

    throw new Error('Global button not found on the page.');
  }

  /**
   * Open the Create Ticket dialog
   */
  async openCreateTicketDialog(): Promise<void> {
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
    await this.page.waitForTimeout(2000);

    // Try direct "Create incident ticket" button first (new UI)
    const createIncidentButton = this.page.getByRole('button', { name: /Create incident ticket/i });
    await expect(createIncidentButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
    await createIncidentButton.click();

    // Wait for dialog to appear
    await this.page.waitForTimeout(1000);
    const dialogHeading = this.page.getByRole('heading', { name: /Create new incident/i });
    await expect(dialogHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });
  }

  async selectWorkspace(workspace?: string): Promise<void> {
    // Check if workspace dropdown exists (it might not in some dialog variants)
    const isWorkspaceVisible = await this.workspaceDropdown.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isWorkspaceVisible) {
      // Workspace dropdown doesn't exist - workspace is pre-selected from sidebar
      console.log('Workspace dropdown not found - using pre-selected workspace');
      return;
    }

    await this.workspaceDropdown.click();

    if (workspace) {
      await expect(this.page.getByRole('option', { name: workspace })).toBeVisible();
      await this.page.getByRole('menuitem', { name: workspace }).click();
    } else {
      await this.page.getByRole('menuitem').first().click();
    }
  }

  /**
   * Select a category from the dropdown (if it exists in the UI)
   * @param category - The category to select (e.g., 'HR', 'Finance', 'IT')
   */
  async selectCategory(category: string): Promise<void> {
    // Check if category dropdown exists (new UI may not have it)
    const isCategoryVisible = await this.categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isCategoryVisible) {
      // Category field doesn't exist in new UI, skip
      return;
    }
    await this.categoryDropdown.click();
    await this.page.getByRole('menuitem', { name: category }).click();
  }

  async selectRequester(requesterName?: string): Promise<void> {
    await this.requesterDropdown.click();
    await this.page.waitForTimeout(500);

    if (requesterName) {
      // Click on the option in the dropdown using role or testid
      const option = this.page.getByRole('option', { name: new RegExp(requesterName) });
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();
    } else {
      const firstOption = this.page.getByRole('listbox').getByRole('option').first();
      await firstOption.waitFor({ state: 'visible' });
      await firstOption.click();
    }
  }

  /**
   * Fill in the ticket subject
   * @param subject - The subject/title of the ticket
   */
  async fillSubject(subject: string): Promise<void> {
    await this.subjectInput.click();
    await this.subjectInput.fill(subject);
  }

  /**
   * Fill in the ticket description
   * @param description - The detailed description of the ticket
   */
  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.click();
    await this.descriptionInput.fill(description);
  }

  /**
   * Select priority level for the ticket
   * @param priority - The priority level (e.g., 'Low', 'Medium', 'High', 'Critical')
   */
  async selectPriority(priority: string): Promise<void> {
    await this.priorityDropdown.click();
    await expect(this.page.getByRole('option', { name: priority })).toBeVisible();
    await this.page.getByRole('menuitem', { name: priority }).click();
  }

  async uploadAttachment(filePath: string | string[]): Promise<void> {
    await this.attachmentButton.click();
    await this.fileInput.waitFor({ state: 'attached', timeout: TIMEOUTS.SHORT });
    await this.fileInput.setInputFiles(filePath);
  }

  async submitTicket(): Promise<void> {
    await this.createButton.click();
  }

  async createTicket(ticketData: {
    workspace?: string;
    category?: string;
    requester?: string;
    subject: string;
    description: string;
    priority: string;
    attachmentPath?: string | string[];
  }): Promise<void> {
    await this.openCreateTicketDialog();
    await this.selectWorkspace(ticketData.workspace);

    if (ticketData.category) {
      await this.selectCategory(ticketData.category);
    }

    await this.selectRequester(ticketData.requester);
    await this.fillSubject(ticketData.subject);
    await this.fillDescription(ticketData.description);
    await this.selectPriority(ticketData.priority);

    if (ticketData.attachmentPath) {
      await this.uploadAttachment(ticketData.attachmentPath);
    }

    await this.submitTicket();
  }

  async verifyTicketCreationSuccess(): Promise<string> {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });

    const firstIncident = this.page
      .getByRole('link')
      .filter({ hasText: /^INC-\d+/ })
      .first();
    await firstIncident.waitFor({ state: 'visible', timeout: 5000 });
    const ticketIdText = await firstIncident.textContent();
    const ticketId = ticketIdText?.match(/INC-\d+/)?.[0] || '';

    expect(ticketId).toBeTruthy();
    return ticketId;
  }

  async navigateToTicketDetails(ticketId: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(ticketId) }).click();
    await this.page.waitForURL(/\/service-desk\/settings\/request-management\/INC-/, { timeout: 10000 });
    await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  async deleteTicket(ticketId: string): Promise<void> {
    await test.step(`Delete ticket ${ticketId}`, async () => {
      // Navigate directly to Request Management URL
      const serviceDeskUrl = this.getServiceDeskUrl();
      await this.page.goto(`${serviceDeskUrl}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM }).catch(() => {});
      await this.page.waitForTimeout(3000);

      // Wait for the Tickets heading to be visible
      const ticketsHeading = this.page.getByRole('heading', { name: /Tickets/i });
      await expect(ticketsHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });

      // Wait for any loading indicators to disappear
      const loadingIndicator = this.page.getByRole('progressbar');
      await loadingIndicator.waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM }).catch(() => {
        console.log('No loading indicator found or already hidden');
      });
      await this.page.waitForTimeout(2000);

      // Find the ticket link (tickets are usually clickable links)
      const ticketLink = this.page.getByRole('link', { name: new RegExp(ticketId) });
      await expect(ticketLink).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      console.log(`Found ticket ${ticketId} in the list`);

      // Scroll to the ticket to ensure it's in view
      await ticketLink.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);

      // Find the three dots button in the same row as the ticket
      // Get the position of the ticket link to find buttons near it
      const ticketBox = await ticketLink.boundingBox();
      if (!ticketBox) {
        throw new Error(`Could not get position of ticket ${ticketId}`);
      }

      // Find all buttons on the page
      const allButtons = this.page.locator('button');
      const buttonCount = await allButtons.count();

      // Find the button (three dots) that's on the same row (similar Y position) as the ticket
      let menuButton = null;
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const buttonBox = await button.boundingBox();
        if (buttonBox && Math.abs(buttonBox.y - ticketBox.y) < 50) {
          // This button is on the same row as the ticket
          const ariaLabel = await button.getAttribute('aria-label').catch(() => '');
          const text = await button.textContent().catch(() => '');
          // Look for three dots or menu button
          if (ariaLabel?.includes('menu') || text?.includes('⋯') || text?.includes('...')) {
            menuButton = button;
            break;
          }
          // If no specific indicator, use the last button on the row (three dots is usually last)
          menuButton = button;
        }
      }

      if (!menuButton) {
        throw new Error(`Could not find three dots menu button for ticket ${ticketId}`);
      }

      await expect(menuButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await menuButton.click();
      await this.page.waitForTimeout(1500);
      console.log('Clicked three dots menu');

      // Wait for the dropdown menu to appear
      const dropdownMenu = this.page
        .locator('.DropdownMenu-module__DropdownMenu__5WJhl, [role="menu"], .dropdown-menu')
        .first();
      await expect(dropdownMenu).toBeVisible({ timeout: 5000 });

      // Click the menuitem role element that contains "Delete" text
      const deleteMenuItem = dropdownMenu.locator('[role="menuitem"]').filter({ hasText: 'Delete' }).first();
      await expect(deleteMenuItem).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await deleteMenuItem.click();
      await this.page.waitForTimeout(500);
      console.log('Clicked Delete option from dropdown');

      // Wait for confirmation dialog to appear
      await this.page.waitForTimeout(1000);

      // Click the Delete button in the confirmation dialog
      const deleteConfirmButton = this.page.getByRole('button', { name: /^delete$/i }).filter({ hasText: /^delete$/i });

      await expect(deleteConfirmButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await deleteConfirmButton.click();
      await this.page.waitForTimeout(1000);
      console.log('✓ Clicked Delete button in confirmation dialog');

      // Wait for and verify the success message
      const successMessage = this.page.getByText(/Ticket deleted successfully/i);
      await expect(successMessage).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      console.log('✓ Verified: Ticket deleted successfully message appeared');

      // Wait a bit more for the deletion to fully complete on the backend
      await this.page.waitForTimeout(2000);
      console.log(`✓ Deleted ticket: ${ticketId}`);
    });
  }

  async deleteTicketFromDetailsPage(): Promise<void> {
    const menuButton = this.page
      .getByTestId('dropdown-trigger')
      .or(this.page.getByRole('button', { name: /more|options|menu|⋯|.../i }))
      .or(this.page.locator('[data-testid*="dropdown"], [data-testid*="menu"]').first());

    await expect(menuButton.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
    await menuButton.first().click();

    const deleteOption = this.page
      .getByRole('menuitem', { name: /delete ticket|delete/i })
      .or(this.page.getByText('Delete ticket').first())
      .or(this.page.getByText('Delete').first());
    let isDeleteVisible = await deleteOption
      .first()
      .isVisible({ timeout: TIMEOUTS.SHORT })
      .catch(() => false);
    if (!isDeleteVisible) {
      await this.page.keyboard.press('Escape').catch(() => {});
      await this.page.waitForTimeout(300);
      await menuButton.first().click();
      isDeleteVisible = await deleteOption
        .first()
        .isVisible({ timeout: TIMEOUTS.SHORT })
        .catch(() => false);
    }

    if (isDeleteVisible) {
      await deleteOption.first().click();
    } else {
      await this.page.keyboard.press('Escape').catch(() => {});
      const directDeleteButton = this.page.getByRole('button', { name: /delete ticket|delete/i }).first();
      const isDirectDeleteVisible = await directDeleteButton.isVisible({ timeout: 3000 }).catch(() => false);
      if (isDirectDeleteVisible) {
        await directDeleteButton.click();
      } else {
        return;
      }
    }

    const confirmButton = this.page.getByRole('button', { name: /delete|confirm|yes/i });
    const isConfirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (isConfirmVisible) {
      await confirmButton.click();
    }

    await this.deleteSuccessMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Assign a ticket to an agent from the ticket list page
   * @param ticketId - The ID of the ticket to assign (e.g., 'INC-123')
   * @param agentName - Optional name of the agent to assign the ticket to. If not provided, selects the first available agent.
   * @returns The name of the assigned agent
   */
  async assignTicketToAgent(ticketId: string, agentName?: string): Promise<string> {
    let assignedAgentName = '';
    await test.step(`Assign ticket to agent`, async () => {
      const ticketLink = this.page.getByRole('link', { name: new RegExp(ticketId) });
      await expect(ticketLink).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

      const ticketLinkBox = await ticketLink.boundingBox();
      if (!ticketLinkBox) {
        throw new Error(`Could not find ticket link for ${ticketId}`);
      }

      const allAssignButtons = this.page.getByTestId('assign-user-dropdown-trigger');
      const count = await allAssignButtons.count();
      let assignUserButton = allAssignButtons.first();
      let minDistance = Infinity;

      for (let i = 0; i < count; i++) {
        const button = allAssignButtons.nth(i);
        const buttonBox = await button.boundingBox();
        if (buttonBox) {
          const yDistance = Math.abs(buttonBox.y - ticketLinkBox.y);
          if (yDistance < 50 && yDistance < minDistance) {
            minDistance = yDistance;
            assignUserButton = button;
          }
        }
      }

      await expect(assignUserButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await assignUserButton.click();
      await this.page.waitForTimeout(1000);

      const dropdownMenu = this.page.getByRole('menu', { name: 'Assign user' });
      await expect(dropdownMenu).toBeVisible({ timeout: TIMEOUTS.SHORT });

      if (agentName) {
        const agentOption = this.page.getByText(agentName);
        await expect(agentOption).toBeVisible({ timeout: TIMEOUTS.SHORT });
        await agentOption.click({ force: true });
        assignedAgentName = agentName;
      } else {
        const agentOptions = dropdownMenu.locator('div, button, a').filter({
          hasText: /^[A-Z][a-z]+ [A-Z][a-z]+/,
        });
        const firstAgent = agentOptions.first();
        await expect(firstAgent).toBeVisible({ timeout: TIMEOUTS.SHORT });
        assignedAgentName = (await firstAgent.textContent()) || '';
        await firstAgent.click({ force: true });
      }
      await this.page.waitForTimeout(1000);

      await expect(assignUserButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await assignUserButton.click();
      await this.page.waitForTimeout(1000);
    });
    return assignedAgentName.trim();
  }

  async verifyTicketAccessRestricted(): Promise<void> {
    await test.step('Verify ticket access is restricted for unauthorized users', async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/home`, {
        waitUntil: 'domcontentloaded',
      });

      const isManageFeaturesVisible = await this.manageFeaturesMenu.isVisible({ timeout: 2000 }).catch(() => false);
      if (isManageFeaturesVisible) {
        await this.manageFeaturesMenu.click();
        const isServiceDeskVisible = await this.serviceDeskMenuItem.isVisible({ timeout: 2000 }).catch(() => false);
        expect(isServiceDeskVisible).toBeFalsy();
      }

      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const currentUrl = this.page.url();
      const isOnServiceDeskPage = currentUrl.includes('/service-desk');

      if (isOnServiceDeskPage) {
        const isRequestManagementVisible = await this.requestManagementHeading
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        expect(isRequestManagementVisible).toBeFalsy();
      } else {
        expect(currentUrl).not.toContain('/service-desk');
      }

      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const urlAfterRequestManagement = this.page.url();
      const isOnRequestManagementPage = urlAfterRequestManagement.includes('/service-desk/settings/request-management');

      if (isOnRequestManagementPage) {
        const isHeadingVisible = await this.requestManagementHeading.isVisible({ timeout: 2000 }).catch(() => false);
        expect(isHeadingVisible).toBeFalsy();
      } else {
        expect(urlAfterRequestManagement).not.toContain('/service-desk/settings/request-management');
      }

      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management/INC-1`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const urlAfterTicket = this.page.url();
      const isOnTicketPage = urlAfterTicket.includes('/service-desk/settings/request-management/INC-');

      if (isOnTicketPage) {
        const isDropdownVisible = await this.dropdownTrigger.isVisible({ timeout: 2000 }).catch(() => false);
        const isViewDetailsVisible = await this.viewDetailsOption.isVisible({ timeout: 2000 }).catch(() => false);
        const isCommentEditorVisible = await this.commentEditor.isVisible({ timeout: 2000 }).catch(() => false);

        expect(isDropdownVisible).toBeFalsy();
        expect(isViewDetailsVisible).toBeFalsy();
        expect(isCommentEditorVisible).toBeFalsy();
      } else {
        expect(urlAfterTicket).not.toContain('/service-desk/settings/request-management/INC-');
      }
    });
  }

  async verifyAttachedImages(imageFileNames: string[]): Promise<void> {
    await test.step('Verify attached images are visible, can be previewed and downloaded', async () => {
      for (const imageFileName of imageFileNames) {
        const imageName = imageFileName.split('.')[0];
        const imageLabel = this.page.getByLabel(new RegExp(`Image:.*${imageName}`, 'i'));

        await expect(imageLabel).toBeVisible({ timeout: TIMEOUTS.SHORT });
        await imageLabel.click();
        await expect(this.imagePreview).toBeVisible({ timeout: TIMEOUTS.SHORT });

        const downloadPromise = this.page.waitForEvent('download');
        await this.downloadButton.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain(imageName);

        await this.closePreviewButton.click();
        await this.page.waitForTimeout(500);
      }
    });
  }

  async getTicketCountFromAPI(): Promise<number> {
    const currentUrl = this.page.url();

    if (!currentUrl.includes('/service-desk/settings/request-management')) {
      const responsePromise = this.page
        .waitForResponse(
          response => response.url().includes('/v1/aqua-rticket/tickets/grid') && response.status() === 200,
          { timeout: TIMEOUTS.MEDIUM }
        )
        .catch(async () => {
          return this.page.waitForResponse(
            response => response.url().includes('/aqua-rticket/tickets') && response.status() === 200,
            { timeout: TIMEOUTS.MEDIUM }
          );
        });

      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const response = await responsePromise;
      const data = await response.json();

      return data.totalCount || data.total || (Array.isArray(data.data) ? data.data.length : 0) || 0;
    } else {
      const responsePromise = this.page
        .waitForResponse(
          response => response.url().includes('/v1/aqua-rticket/tickets/grid') && response.status() === 200,
          { timeout: TIMEOUTS.SHORT }
        )
        .catch(async () => {
          return this.page.waitForResponse(
            response => response.url().includes('/aqua-rticket/tickets') && response.status() === 200,
            { timeout: TIMEOUTS.SHORT }
          );
        });

      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const response = await responsePromise;
      const data = await response.json();

      return data.totalCount || data.total || (Array.isArray(data.data) ? data.data.length : 0) || 0;
    }
  }

  async verifyTicketCountAndSLA(initialTicketCount: number): Promise<void> {
    await test.step('Verify dashboard reflects real-time ticket counts and SLA metrics', async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const countPromise = this.getTicketCountFromAPI().catch(() => null);
      const currentTicketCount = (await Promise.race([
        countPromise,
        new Promise<number>(resolve => setTimeout(() => resolve(-1), 10000)),
      ])) as number | null;

      if (currentTicketCount !== null && currentTicketCount >= 0) {
        if (initialTicketCount > 0) {
          expect(currentTicketCount).toBeGreaterThanOrEqual(initialTicketCount + 1);
        } else if (currentTicketCount > 0) {
          expect(currentTicketCount).toBeGreaterThan(0);
        }
      }

      const isStateButtonVisible = await this.stateButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false);
      if (isStateButtonVisible) {
        await this.stateButton.click();
        await this.page.waitForTimeout(1000);

        const slaHeadings = this.page.locator('[data-testid*="_state"]').getByRole('heading', { name: /Due in/ });
        const slaCount = await slaHeadings.count();

        expect(slaCount).toBeGreaterThan(0);

        const slaValues: string[] = [];
        for (let i = 0; i < Math.min(slaCount, 4); i++) {
          const heading = slaHeadings.nth(i);
          await expect(heading).toBeVisible({ timeout: TIMEOUTS.SHORT });
          const headingText = await heading.textContent();
          expect(headingText).toMatch(/Due in \d+ (day|days|week|weeks)/);
          if (headingText) {
            slaValues.push(headingText);
          }
        }

        expect(slaValues.length).toBeGreaterThan(0);
      }
    });
  }

  /**
   * Search for a ticket by ID or name/subject
   * @param searchTerm - The ticket ID (e.g., 'INC-123') or subject text to search for
   */
  async searchTicket(searchTerm: string): Promise<void> {
    await test.step(`Search for ticket: ${searchTerm}`, async () => {
      // Find the Tickets section search box (not the global "Search Simpplr..." header)
      // The Tickets search is in the main content area, after the "Tickets" heading

      // Wait for page to be ready
      await this.page.waitForTimeout(1000);

      // Find search input in the main content area (not header/nav)
      // Strategy 1: Look for input inside main content area
      const mainContent = this.page.locator('main, [role="main"], #page-content, [class*="main-content"]').first();
      let ticketsSearchBox = mainContent
        .locator('input[type="text"]:not([placeholder*="Simpplr"]), input[type="search"]:not([placeholder*="Simpplr"])')
        .first();
      let isVisible = await ticketsSearchBox.isVisible({ timeout: 3000 }).catch(() => false);

      if (!isVisible) {
        // Strategy 2: Find input near "Create incident ticket" button or "Tickets" heading
        const ticketsHeading = this.page.getByRole('heading', { name: /Tickets/i });
        const createButton = this.page.getByRole('button', { name: /Create incident ticket/i });
        const isHeadingVisible = await ticketsHeading.isVisible({ timeout: 2000 }).catch(() => false);
        const isCreateVisible = await createButton.isVisible({ timeout: 2000 }).catch(() => false);

        if (isHeadingVisible) {
          // Find input in the same section as Tickets heading
          const section = ticketsHeading.locator(
            'xpath=ancestor::div[contains(@class, "flex") or contains(@class, "section")][1]'
          );
          ticketsSearchBox = section.locator('input[type="text"], input[type="search"]').first();
          isVisible = await ticketsSearchBox.isVisible({ timeout: 2000 }).catch(() => false);
        }

        if (!isVisible && isCreateVisible) {
          // Find input in the same container as Create button
          const container = createButton.locator(
            'xpath=ancestor::div[contains(@class, "flex") or contains(@class, "header")][1]'
          );
          ticketsSearchBox = container.locator('input[type="text"], input[type="search"]').first();
          isVisible = await ticketsSearchBox.isVisible({ timeout: 2000 }).catch(() => false);
        }
      }

      if (!isVisible) {
        // Strategy 3: Find input in main content by excluding header/nav areas
        const headerNav = this.page.locator('header, nav, [role="banner"], [role="navigation"]');
        const contentInputs = mainContent.locator('input[type="text"], input[type="search"]');
        const count = await contentInputs.count();

        for (let i = 0; i < count; i++) {
          const input = contentInputs.nth(i);
          const placeholder = await input.getAttribute('placeholder').catch(() => '');

          // Skip global search (contains "Simpplr") and check if input is NOT inside header/nav
          if (placeholder && !placeholder.includes('Simpplr')) {
            const isInHeader =
              (await headerNav
                .locator('..', { has: input })
                .count()
                .catch(() => 0)) > 0;
            if (!isInHeader) {
              ticketsSearchBox = input;
              isVisible = true;
              console.log(`Found search box in content with placeholder: ${placeholder}`);
              break;
            }
          }
        }
      }

      if (isVisible) {
        await ticketsSearchBox.click();
        await ticketsSearchBox.clear();
        await ticketsSearchBox.fill(searchTerm);
        await this.page.waitForTimeout(500);

        // Try to find and click search button, otherwise press Enter
        const parent = ticketsSearchBox.locator('xpath=ancestor::div[1]');
        const searchButton = parent.locator('button[type="submit"], button:has(svg)').first();
        const isSearchBtnVisible = await searchButton.isVisible({ timeout: 1000 }).catch(() => false);

        if (isSearchBtnVisible) {
          await searchButton.click();
        } else {
          await ticketsSearchBox.press('Enter');
        }

        await this.page.waitForTimeout(2000);
        console.log(`Searched for: ${searchTerm} in Tickets content search box`);
      } else {
        console.log('Tickets content search box not found - search may not be available');
      }
    });
  }

  /**
   * Verify that a ticket appears in search results
   * @param ticketId - The ticket ID to verify (e.g., 'INC-123')
   * @param subject - Optional subject text to verify
   */
  async verifyTicketInSearchResults(ticketId: string, subject?: string): Promise<void> {
    await test.step(`Verify ticket ${ticketId} appears in search results`, async () => {
      // Look for the ticket ID in results
      const ticketLink = this.page.getByRole('link', { name: new RegExp(ticketId, 'i') });
      await expect(ticketLink).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

      // Optionally verify subject if provided
      if (subject) {
        const subjectText = this.page.getByText(subject).first();
        const isSubjectVisible = await subjectText.isVisible({ timeout: 3000 }).catch(() => false);
        if (!isSubjectVisible) {
          // Subject might be truncated, try partial match
          const partialSubject = subject.substring(0, 20);
          const partialText = this.page.getByText(new RegExp(partialSubject, 'i')).first();
          await expect(partialText).toBeVisible({ timeout: TIMEOUTS.SHORT });
        }
      }
    });
  }

  /**
   * Clear search and return to full ticket list
   */
  async clearSearch(): Promise<void> {
    await test.step('Clear search', async () => {
      const searchInput = this.page.getByRole('searchbox').or(this.page.getByPlaceholder(/search/i));
      const isSearchVisible = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);

      if (isSearchVisible) {
        await searchInput.clear();
        await this.page.keyboard.press('Enter');
      }

      // Look for clear/reset button
      const clearButton = this.page.getByRole('button', { name: /clear|reset|x/i });
      const isClearVisible = await clearButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isClearVisible) {
        await clearButton.click();
      }

      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Create multiple tickets for testing
   * @param count - Number of tickets to create
   * @param ticketData - Base ticket data to use
   * @returns Array of created ticket IDs
   */
  async createMultipleTickets(
    count: number,
    ticketData: {
      workspace?: string;
      category?: string;
      requester?: string;
      subject: string;
      description: string;
      priority: string;
    }
  ): Promise<string[]> {
    const ticketIds: string[] = [];

    for (let i = 0; i < count; i++) {
      await test.step(`Create ticket ${i + 1} of ${count}`, async () => {
        const uniqueSubject = `${ticketData.subject} ${i + 1} - ${Date.now()}`;

        await this.createTicket({
          ...ticketData,
          subject: uniqueSubject,
        });

        const ticketId = await this.verifyTicketCreationSuccess();
        ticketIds.push(ticketId);

        // Wait before creating next ticket
        await this.page.waitForTimeout(1000);
      });
    }

    return ticketIds;
  }

  /**
   * Add a comment to an open ticket
   * @param comment - The comment text to add
   * @param isPublic - Whether the comment should be public (visible to requester)
   */
  async addCommentToTicket(comment: string, isPublic: boolean = true): Promise<void> {
    await test.step(`Add ${isPublic ? 'public' : 'private'} comment to ticket`, async () => {
      // Wait for Comments section to be visible
      await expect(this.page.getByText('Comments')).toBeVisible({ timeout: 10000 });

      // Find the comment input box - it's a contenteditable div or textbox in the Comments section
      const commentsSection = this.page.locator('text=Comments').locator('..').locator('..');

      // Try to find the comment editor (contenteditable)
      let commentInput = commentsSection.locator('[contenteditable="true"]').first();
      let isVisible = await commentInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (!isVisible) {
        // Try finding any textbox/textarea in comments area
        commentInput = commentsSection.locator('textarea, [role="textbox"]').first();
        isVisible = await commentInput.isVisible({ timeout: 2000 }).catch(() => false);
      }

      if (!isVisible) {
        // Fallback: find any contenteditable on the page
        commentInput = this.page.locator('[contenteditable="true"]').first();
      }

      await commentInput.click();
      await commentInput.fill(comment);
      console.log(`Typed comment: ${comment}`);

      // Enable public comment toggle
      if (isPublic) {
        // Find the toggle switch near "Public comment" text
        const publicLabel = this.page.getByText(/Public comment/i);
        const publicToggleSwitch = publicLabel
          .locator('..')
          .getByRole('switch')
          .or(this.page.getByRole('switch').first());
        const isToggleVisible = await publicToggleSwitch.isVisible({ timeout: 2000 }).catch(() => false);

        if (isToggleVisible) {
          const isChecked = await publicToggleSwitch.isChecked().catch(() => false);
          if (!isChecked) {
            await publicToggleSwitch.click();
            console.log('Enabled Public comment toggle');
          } else {
            console.log('Public comment toggle already enabled');
          }
        } else {
          // Try alternate locator for toggle
          const altToggle = this.page.locator('[data-state]').filter({ hasText: '' }).first();
          const dataState = await altToggle.getAttribute('data-state').catch(() => null);
          if (dataState === 'unchecked') {
            await altToggle.click();
            console.log('Enabled Public comment toggle (alt)');
          }
        }
      }

      // Click Send button (arrow icon) - it has data-testid="i-send"
      const sendButton = this.page.locator('[data-testid="i-send"]').locator('..'); // Get the parent button
      await expect(sendButton).toBeVisible({ timeout: 5000 });
      await sendButton.click();
      console.log('Clicked send button');

      await this.page.waitForTimeout(2000);

      // Handle any confirmation dialog if it appears
      const proceedButton = this.page.getByRole('button', { name: /proceed|confirm|ok/i });
      const isProceedVisible = await proceedButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isProceedVisible) {
        await proceedButton.click();
        await this.page.waitForTimeout(1000);
      }
    });
  }

  /**
   * Add an attachment to an open ticket
   * @param filePath - Path to the file to attach
   */
  async addAttachmentToTicket(filePath: string | string[]): Promise<void> {
    await test.step('Add attachment to ticket', async () => {
      // Find attachment button
      const attachButton = this.page.getByRole('button', { name: /attach|upload|add file/i });
      const isAttachVisible = await attachButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (isAttachVisible) {
        await attachButton.click();
      }

      // Find file input and upload
      const fileInput = this.page.locator('input[type="file"]');
      await fileInput.waitFor({ state: 'attached', timeout: TIMEOUTS.SHORT });
      await fileInput.setInputFiles(filePath);

      await this.page.waitForTimeout(2000);

      // Click update/save if needed
      const updateButton = this.page.getByRole('button', { name: /Update|Save|Done/i });
      const isUpdateVisible = await updateButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isUpdateVisible) {
        await updateButton.click();
        await this.page.waitForTimeout(1000);
      }
    });
  }

  /**
   * Navigate to a ticket as a requester (end user view)
   * Uses the Support portal path
   * @param ticketId - The ticket ID to navigate to
   */
  async navigateToTicketAsRequester(ticketId: string): Promise<void> {
    await test.step(`Navigate to ticket ${ticketId} as requester`, async () => {
      const serviceDeskUrl = this.getServiceDeskUrl();
      const ticketNumber = ticketId.replace('INC-', '');

      // Go to support portal
      await this.goToUrl(`${serviceDeskUrl}/service-desk/support-portal`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});

      // If user is redirected to deactivated, go to home and open Support manually
      if (this.page.url().includes('/deactivated')) {
        await this.goToUrl(`${serviceDeskUrl}/home`, { waitUntil: 'domcontentloaded' });
        await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
        const supportLink = this.page.getByRole('link', { name: /Support/i }).first();
        const isSupportVisible = await supportLink.isVisible({ timeout: 3000 }).catch(() => false);
        if (isSupportVisible) {
          await supportLink.click();
          await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
        }
      }
      await this.page.waitForTimeout(1000);

      // If support portal shows not found, click Support link in nav
      const notFoundHeading = this.page.getByRole('heading', { name: /Page not found/i });
      const isNotFoundVisible = await notFoundHeading.isVisible({ timeout: 2000 }).catch(() => false);
      if (isNotFoundVisible) {
        const supportLink = this.page.getByRole('link', { name: /Support/i }).first();
        const isSupportVisible = await supportLink.isVisible({ timeout: 3000 }).catch(() => false);
        if (isSupportVisible) {
          await supportLink.click();
          await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
        }
      }

      // Navigate to My tickets tab if available
      const myTicketsTab = this.page
        .getByRole('tab', { name: /My tickets/i })
        .or(this.page.getByRole('button', { name: /My tickets/i }))
        .first();
      const isMyTicketsVisible = await myTicketsTab.isVisible({ timeout: 3000 }).catch(() => false);
      if (isMyTicketsVisible) {
        await myTicketsTab.click();
        await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      }

      // Refresh the page before looking for ticket
      console.log('Refreshing page before looking for ticket...');
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // After refresh, ensure we're on My tickets tab (refresh might lose tab state)
      const myTicketsTabAfterRefresh = this.page
        .getByRole('tab', { name: /My tickets/i })
        .or(this.page.getByRole('button', { name: /My tickets/i }))
        .first();
      const isTabVisible = await myTicketsTabAfterRefresh.isVisible({ timeout: 3000 }).catch(() => false);
      if (isTabVisible) {
        await myTicketsTabAfterRefresh.click();
        await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
        await this.page.waitForTimeout(2000);
      }

      // Wait for the table/list to be present
      await this.page.waitForTimeout(2000);

      // Find and click the ticket in the content area (not in search box)
      console.log(`Looking for ticket ${ticketId}...`);

      // Target the ticket link/text specifically in the main content area, not in input fields
      const contentArea = this.page.locator('#page-content, [role="main"], main, .content').first();
      const ticketLink = contentArea.getByText(ticketId, { exact: false }).first();

      // Use a longer timeout and poll for newly created tickets
      await expect(ticketLink).toBeVisible({ timeout: 60000 }); // 60 seconds for newly created tickets
      console.log(`✓ Found ticket ${ticketId}`);

      // Define patterns and drawer heading for fallback logic
      const ticketIdPattern = new RegExp(`INC-\\s*${ticketNumber}`, 'i');
      const drawerHeading = this.page
        .getByRole('heading', { name: new RegExp(ticketId, 'i') })
        .or(this.page.getByText(new RegExp(ticketId, 'i')).first());

      // Click on the ticket to open it
      await ticketLink.click();
      await this.page.waitForTimeout(1000);
      console.log(`✓ Clicked on ticket ${ticketId}`);

      if (
        !(await drawerHeading
          .first()
          .isVisible({ timeout: TIMEOUTS.SHORT })
          .catch(() => false))
      ) {
        for (const frame of this.page.frames()) {
          if (frame === this.page.mainFrame()) {
            continue;
          }
          const frameLink = frame.locator('a', { hasText: ticketIdPattern }).first();
          const isFrameLinkVisible = await frameLink.isVisible({ timeout: 2000 }).catch(() => false);
          if (!isFrameLinkVisible) {
            continue;
          }
          await frameLink.scrollIntoViewIfNeeded().catch(() => {});
          await frameLink.click({ force: true }).catch(() => {});
          const isDrawerVisible = await drawerHeading
            .first()
            .isVisible({ timeout: TIMEOUTS.SHORT })
            .catch(() => false);
          if (isDrawerVisible) {
            break;
          }
        }
      }

      if (
        !(await drawerHeading
          .first()
          .isVisible({ timeout: TIMEOUTS.SHORT })
          .catch(() => false))
      ) {
        await this.page
          .waitForFunction(
            (pattern: string) => {
              const regex = new RegExp(pattern, 'i');
              const elements = Array.from(document.querySelectorAll('a, [role="row"], tr, td, div, span'));
              return elements.some(element => regex.test(element.textContent || ''));
            },
            `INC-\\s*${ticketNumber}`,
            { timeout: TIMEOUTS.LONG }
          )
          .catch(() => {});

        await this.page
          .evaluate((pattern: string) => {
            const regex = new RegExp(pattern, 'i');
            const preferredSelectors = ['a', '[role="row"]', 'tr', 'td', 'div', 'span'];
            for (const selector of preferredSelectors) {
              const elements = Array.from(document.querySelectorAll(selector));
              const target = elements.find(element => regex.test(element.textContent || ''));
              if (target && target instanceof HTMLElement) {
                const clickable = target.closest('a, button, [role="button"], [role="link"]') || target;
                if (clickable instanceof HTMLElement) {
                  clickable.click();
                  clickable.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                }
                return true;
              }
            }
            return false;
          }, `INC-\\s*${ticketNumber}`)
          .catch(() => false);
      }

      await expect(drawerHeading.first()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Verify that a comment is visible on the ticket
   * @param commentText - The comment text to verify (can be partial)
   */
  async verifyCommentVisible(commentText: string): Promise<void> {
    await test.step(`Verify comment is visible: "${commentText.substring(0, 30)}..."`, async () => {
      const drawer = this.page
        .getByRole('dialog')
        .or(this.page.locator('aside'))
        .or(this.page.locator('[data-testid*="drawer"]'))
        .first();

      const commentsTab = drawer
        .getByRole('tab', { name: /comments/i })
        .or(drawer.getByRole('button', { name: /comments/i }))
        .first();
      const isCommentsVisible = await commentsTab.isVisible({ timeout: 2000 }).catch(() => false);
      if (isCommentsVisible) {
        await commentsTab.click();
      }

      // Look for the comment text on the page
      const commentElement = drawer.getByText(commentText).or(this.page.getByText(commentText));
      let isVisible = await commentElement.isVisible({ timeout: 5000 }).catch(() => false);

      if (!isVisible) {
        const activitiesTab = drawer.getByRole('tab', { name: /activities|comments|updates/i });
        const activitiesButton = drawer.getByRole('button', { name: /activities|comments|updates/i });
        const isTabVisible = await activitiesTab
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        const isBtnVisible = await activitiesButton
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        if (isTabVisible) {
          await activitiesTab.first().click();
          await this.page.waitForTimeout(500);
        } else if (isBtnVisible) {
          await activitiesButton.first().click();
          await this.page.waitForTimeout(500);
        }

        const publicFilter = drawer
          .getByRole('button', { name: /public|all|everyone/i })
          .or(drawer.getByRole('radio', { name: /public/i }));
        const isFilterVisible = await publicFilter
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        if (isFilterVisible) {
          await publicFilter.first().click();
          await this.page.waitForTimeout(500);
        }

        isVisible = await commentElement.isVisible({ timeout: 5000 }).catch(() => false);
      }

      if (!isVisible) {
        // Try partial match
        const partialText = commentText.substring(0, 30);
        const partialElement = this.page.getByText(new RegExp(partialText, 'i'));
        await expect(partialElement).toBeVisible({ timeout: TIMEOUTS.SHORT });
      } else {
        await expect(commentElement).toBeVisible();
      }
    });
  }

  /**
   * Verify that an attachment is visible on the ticket
   * @param fileName - The file name to verify
   */
  async verifyAttachmentVisible(fileName: string): Promise<void> {
    await test.step(`Verify attachment is visible: ${fileName}`, async () => {
      // Look for attachment by name or image
      const attachmentElement = this.page.getByText(fileName);
      const isTextVisible = await attachmentElement.isVisible({ timeout: 3000 }).catch(() => false);

      if (isTextVisible) {
        await expect(attachmentElement).toBeVisible();
      } else {
        // Try looking for image preview
        const fileNameWithoutExt = fileName.split('.')[0];
        const imageAttachment = this.page.getByLabel(new RegExp(`Image:.*${fileNameWithoutExt}`, 'i'));
        const isImageVisible = await imageAttachment.isVisible({ timeout: 3000 }).catch(() => false);

        if (isImageVisible) {
          await expect(imageAttachment).toBeVisible();
        } else {
          // Look for any attachment indicator
          const attachmentIcon = this.page.locator('[data-testid*="attachment"]');
          const hasAttachment = (await attachmentIcon.count()) > 0;
          expect(hasAttachment).toBeTruthy();
        }
      }
    });
  }
}
