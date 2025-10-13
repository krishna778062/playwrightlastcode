import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

/**
 * ServiceNowTicketsPage handles ServiceNow ticket creation and management functionality
 * This page is accessed via /servicenow and contains ticket-related operations
 */
export class ServiceNowTicketsPage extends BasePage {
  // Ticket Creation Locators
  readonly newTicketButton: Locator;
  readonly newTicketOption: Locator;
  readonly createTicketButton: Locator;
  readonly ticketCreationPanel: Locator;

  // Ticket Form Locators (only what's used)
  readonly ticketTitleField: Locator;
  readonly ticketDescriptionField: Locator;
  readonly ticketCategoryDropdown: Locator;
  readonly cancelTicketCreationButton: Locator;

  // Sorting Locators (only what's used)
  readonly sortDropdown: Locator;
  readonly sortOptions: (optionText: string) => Locator;
  readonly ticketRows: Locator;

  // Status Messages (only what's used)
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SERVICE_NOW_TICKETS_PAGE);

    // Ticket Creation Elements
    this.newTicketButton = page.locator('//button[contains(text(),"New ticket")]');
    this.newTicketOption = page.locator('//span[contains(text(),"New ticket")]');
    this.createTicketButton = page.locator('//button[contains(text(),"Create ticket")]');
    this.ticketCreationPanel = page.locator('//form[contains(@class,"ServiceNowNewTicketForm")]');
    this.cancelTicketCreationButton = page.locator('//button[contains(text(),"Cancel")]');

    // Ticket Form Elements (only what's used)
    this.ticketTitleField = page.locator('//input[@name="title"]');
    this.ticketDescriptionField = page.locator('//textarea[@name="description"]');
    this.ticketCategoryDropdown = page.locator('//input[@id="category"]');

    // Sorting Elements (only what's used)
    this.sortDropdown = page.locator('[class*="SortDropdown"]');
    this.sortOptions = (optionText: string) => page.locator(`//*[contains(text(),"${optionText}")]`);
    this.ticketRows = page.locator('//tr[contains(@data-testid,"dataGridRow")]');

    // Status Messages (only what's used)
    this.successMessage = page.locator('//div[contains(@class,"success")]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify support and ticketing integrations page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.newTicketButton, {
        timeout: 30_000,
        assertionMessage: 'Verifying Home page is loaded',
      });
    });
  }

  // Ticket Creation Methods
  async clickNewTicketButton(): Promise<void> {
    await test.step('Click New Ticket button', async () => {
      await this.newTicketButton.waitFor({ state: 'visible', timeout: 15000 });
      await this.clickOnElement(this.newTicketButton);
    });
  }

  async verifyNewTicketOptionVisible(): Promise<boolean> {
    return await test.step('Verify New Ticket option is visible', async () => {
      await this.newTicketOption.waitFor({ state: 'visible', timeout: 15000 });
      const isVisible = await this.newTicketOption.isVisible();
      await expect(this.newTicketOption).toBeVisible();
      return isVisible;
    });
  }

  async clickCancelTicketCreationButton(): Promise<void> {
    await test.step('Click Cancel Ticket Creation button', async () => {
      await this.cancelTicketCreationButton.waitFor({ state: 'visible', timeout: 15000 });
      await this.clickOnElement(this.cancelTicketCreationButton);
      await this.newTicketOption.waitFor({ state: 'hidden', timeout: 15000 });
    });
  }

  async createNewTicket(ticketData: { title: string; description: string; category?: string }): Promise<void> {
    await test.step(`Create new ticket: ${ticketData.title}`, async () => {
      await this.clickNewTicketButton();

      // Wait for ticket creation form
      await this.ticketCreationPanel.waitFor({ state: 'visible' });

      // Fill in ticket details
      await this.fillInElement(this.ticketTitleField, ticketData.title);
      await this.fillInElement(this.ticketDescriptionField, ticketData.description);

      // Submit the ticket
      await this.clickOnElement(this.createTicketButton);
    });
  }

  // Utility Methods
  async verifyTicketCreationSuccess(): Promise<void> {
    await test.step('Verify ticket creation was successful', async () => {
      await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
      await expect(this.successMessage).toBeVisible();
    });
  }

  // Sorting Methods
  async clickSortDropdown(): Promise<void> {
    await test.step('Click sort dropdown', async () => {
      // Class-based selector
      const sortElement = this.page.locator('[class*="SortDropdown"]');
      await sortElement.waitFor({ state: 'visible' });
      await this.clickOnElement(sortElement);
    });
  }

  async selectSortOption(optionText: string): Promise<void> {
    await test.step(`Select sort option: ${optionText}`, async () => {
      await this.page.waitForTimeout(1000);
      const option = this.page.locator(`//*[contains(text(),"${optionText}")]`).first();
      await this.clickOnElement(option);
      // Wait for sorting to apply
      await this.page.waitForTimeout(2000);
    });
  }

  async sortByLastUpdatedNewest(): Promise<void> {
    await test.step('Sort tickets by Last Updated, Newest', async () => {
      await this.clickSortDropdown();
      await this.selectSortOption('Last updated, newest');
    });
  }

  async sortByLastUpdatedOldest(): Promise<void> {
    await test.step('Sort tickets by Last Updated, Newest', async () => {
      await this.clickSortDropdown();
      await this.selectSortOption('Last updated, oldest');
    });
  }

  async verifyTicketSortingByDate(sortOrder: 'asc' | 'desc'): Promise<boolean> {
    const orderText = sortOrder === 'asc' ? 'ascending (oldest first)' : 'descending (newest first)';

    return await test.step(`Verify tickets are sorted by date ${orderText}`, async () => {
      // Wait for tickets to load after sorting
      await this.page.waitForTimeout(3000);

      // Get all ticket elements
      const tickets = await this.ticketRows.all();

      if (tickets.length === 0) {
        console.log('No tickets found to verify sorting');
        return true; // No tickets to sort
      }

      // Extract dates from tickets
      const ticketDates: Date[] = [];
      for (const ticket of tickets) {
        // Look for date elements within each ticket
        const dateElements = await ticket.locator('//td[contains(@class,"Cell-module")]').last().all();

        if (dateElements.length > 0) {
          const dateText = await dateElements[0].textContent();
          if (dateText) {
            // Try to parse the date
            const parsedDate = new Date(dateText.trim());
            if (!isNaN(parsedDate.getTime())) {
              ticketDates.push(parsedDate);
            }
          }
        }
      }

      // Verify dates are in the correct order based on sortOrder
      for (let i = 0; i < ticketDates.length - 1; i++) {
        let isCorrectOrder: boolean;
        let expectedOperator: string;

        if (sortOrder === 'desc') {
          // Descending: current date should be >= next date (newer or equal)
          isCorrectOrder = ticketDates[i] >= ticketDates[i + 1];
          expectedOperator = '>=';
        } else {
          // Ascending: current date should be <= next date (older or equal)
          isCorrectOrder = ticketDates[i] <= ticketDates[i + 1];
          expectedOperator = '<=';
        }

        if (!isCorrectOrder) {
          console.log(
            `Sorting verification failed at index ${i}: ${ticketDates[i]} should be ${expectedOperator} ${ticketDates[i + 1]}`
          );
          return false;
        }
      }

      console.log(`Verified ${ticketDates.length} tickets are sorted by date ${orderText}`);
      return true;
    });
  }

  // Backward compatibility methods (delegating to the unified function)
  async verifyTicketsSortedByDateDescending(): Promise<boolean> {
    return this.verifyTicketSortingByDate('desc');
  }

  async verifyTicketsSortedByDateAscending(): Promise<boolean> {
    return this.verifyTicketSortingByDate('asc');
  }
}
