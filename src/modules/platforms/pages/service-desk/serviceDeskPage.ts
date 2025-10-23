import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

/**
 * Service Desk Page Object Model
 *
 * Handles all interactions with the Service Desk/Ticketing system
 * including ticket creation, viewing, updating, and management.
 */
export class ServiceDeskPage extends BasePage {
  // Ticket List Elements
  private readonly ticketListTable: Locator;
  private readonly createTicketButton: Locator;

  // Create Ticket Dialog Elements
  private readonly createTicketDialog: Locator;
  private readonly workspaceDropdown: Locator;
  private readonly categoryDropdown: Locator;
  private readonly requesterDropdown: Locator;
  private readonly subjectInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly priorityDropdown: Locator;
  private readonly attachmentButton: Locator;
  private readonly createButton: Locator;
  private readonly cancelButton: Locator;

  // Success/Error Message Elements
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;
  private readonly ticketIdDisplay: Locator;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl || '/service-desk');

    // Initialize locators
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
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Success/Error messages
    this.successMessage = page.getByText(/incident created successfully/i);
    this.errorMessage = page.getByText(/Error/i);
    this.ticketIdDisplay = page.getByText(/INC-\d+/);
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
      const serviceDeskUrl = process.env.SERVICE_DESK_URL;
      if (!serviceDeskUrl) {
        throw new Error('Service Desk URL not configured');
      }
      await this.page.goto(`${serviceDeskUrl}/service-desk`);
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

  /**
   * Select a workspace from the dropdown
   * Selects the first available option if no workspace is provided
   * @param workspace - Optional: The workspace name to select. If not provided, selects first option
   */
  async selectWorkspace(workspace?: string): Promise<void> {
    await this.workspaceDropdown.click();

    if (workspace) {
      // Select specific workspace by name
      await expect(this.page.getByRole('option', { name: workspace })).toBeVisible();
      await this.page.getByRole('menuitem', { name: workspace }).click();
    } else {
      // Select the first available menuitem (not option, to avoid disabled placeholders)
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

  /**
   * Select a requester from the dropdown
   * Selects the first available option if no name is provided
   * @param requesterName - Optional: The name of the requester to select. If not provided, selects first option
   */
  async selectRequester(requesterName?: string): Promise<void> {
    await this.requesterDropdown.click();

    if (requesterName) {
      // Select specific requester by name
      await expect(this.page.getByRole('option', { name: new RegExp(requesterName) })).toBeVisible();
      await this.page.getByText(requesterName, { exact: true }).click();
    } else {
      // Click first visible option in the requester listbox (not time picker)
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

  /**
   * Upload an attachment to the ticket
   * @param filePath - Path to the file to upload
   */
  async uploadAttachment(filePath: string): Promise<void> {
    await this.attachmentButton.click();
    await this.attachmentButton.setInputFiles(filePath);
  }

  /**
   * Submit the ticket creation form
   */
  async submitTicket(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * Cancel ticket creation
   */
  async cancelTicketCreation(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Create a complete ticket with all details
   * @param ticketData - Object containing all ticket information
   */
  async createTicket(ticketData: {
    workspace?: string;
    category?: string;
    requester?: string;
    subject: string;
    description: string;
    priority: string;
    attachmentPath?: string;
  }): Promise<void> {
    await this.openCreateTicketDialog();

    await this.selectWorkspace(ticketData.workspace);

    // Only select category if provided (workspace selection may auto-populate this)
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

  /**
   * Verify ticket creation success
   * @returns Promise<string> - The generated ticket ID
   */
  async verifyTicketCreationSuccess(): Promise<string> {
    // Wait for success message
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });

    // Get the most recent incident ID (first in list after creation)
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

  /**
   * Verify validation error messages
   * @param expectedErrors - Array of expected error messages
   */
  async verifyValidationErrors(expectedErrors: string[]): Promise<void> {
    for (const error of expectedErrors) {
      await expect(this.page.getByText(error)).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Check if create ticket dialog is open
   */
  async isCreateTicketDialogOpen(): Promise<boolean> {
    return await this.createTicketDialog.isVisible();
  }

  /**
   * Wait for ticket list to load
   */
  async waitForTicketListToLoad(): Promise<void> {
    await expect(this.ticketListTable).toBeVisible({ timeout: 15000 });
  }

  /**
   * Delete a ticket by ID
   * @param ticketId - The ticket ID to delete (e.g., 'INC-1')
   */
  async deleteTicket(ticketId: string): Promise<void> {
    // Click on the ticket link to open it
    await this.page.getByRole('link', { name: new RegExp(ticketId) }).click();

    // Wait for ticket details page URL
    await this.page.waitForURL(/\/service-desk\/settings\/request-management\/INC-/, { timeout: 10000 });

    // Click the more options dropdown
    await this.page.getByTestId('dropdown-trigger').click();
    await expect(this.page.getByRole('menu', { name: 'More' })).toBeVisible();

    // Click delete option
    await this.page.getByText('Delete').click();
    await expect(this.page.getByRole('dialog', { name: 'Are you sure you want to' })).toBeVisible();

    // Confirm deletion
    await this.page.getByRole('button', { name: 'Delete' }).click();

    // Wait for success message
    await expect(this.page.getByText('Ticket deleted successfully.')).toBeVisible({ timeout: 10000 });
  }
}
