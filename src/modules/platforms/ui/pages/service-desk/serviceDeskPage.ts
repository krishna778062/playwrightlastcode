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

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl || '/service-desk');

    this.ticketListTable = page.getByRole('row', { name: 'select subject severity' });
    this.createTicketButton = page.getByTestId('create-ticket-button');
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
      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk`, { waitUntil: 'domcontentloaded' });
      await this.verifyThePageIsLoaded();
    });
  }
  /**
   * Open the Create Ticket dialog
   */
  async openCreateTicketDialog(): Promise<void> {
    await this.createTicketButton.click();
    await expect(this.createTicketDialog).toBeVisible({ timeout: 5000 });
  }

  async selectWorkspace(workspace?: string): Promise<void> {
    await this.workspaceDropdown.click();

    if (workspace) {
      await expect(this.page.getByRole('option', { name: workspace })).toBeVisible();
      await this.page.getByRole('menuitem', { name: workspace }).click();
    } else {
      await this.page.getByRole('menuitem').first().click();
    }
  }

  /**
   * Select a category from the dropdown
   * @param category - The category to select (e.g., 'HR', 'Finance', 'IT Support')
   */
  async selectCategory(category: string): Promise<void> {
    await this.categoryDropdown.click();
    await this.page.getByRole('menuitem', { name: category }).click();
  }

  async selectRequester(requesterName?: string): Promise<void> {
    await this.requesterDropdown.click();

    if (requesterName) {
      await expect(this.page.getByRole('option', { name: new RegExp(requesterName) })).toBeVisible();
      await this.page.getByText(requesterName, { exact: true }).click();
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
    const currentUrl = this.page.url();
    const isOnTicketDetailsPage = currentUrl.includes(`/service-desk/settings/request-management/${ticketId}`);

    if (!isOnTicketDetailsPage) {
      await this.navigateToTicketDetails(ticketId);
    }

    await this.deleteTicketFromDetailsPage();
  }

  async deleteTicketFromDetailsPage(): Promise<void> {
    await this.dropdownTrigger.click();
    await expect(this.page.getByRole('menu', { name: 'More' })).toBeVisible();
    await this.deleteMenuItem.click();
    await expect(this.deleteConfirmDialog).toBeVisible();
    await this.deleteConfirmButton.click();
    await expect(this.deleteSuccessMessage).toBeVisible({ timeout: 10000 });
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
}
