import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';

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
  readonly ticketDateCells: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SERVICE_NOW_TICKETS_PAGE);

    // Ticket Creation Elements
    this.newTicketButton = page.getByRole('button', { name: /new ticket/i });
    this.newTicketOption = page.locator('//span[contains(text(),"New ticket")]');
    this.createTicketButton = page.getByRole('button', { name: /Create ticket/i });
    this.ticketCreationPanel = page.getByRole('form').or(page.locator('form[class*="ServiceNowNewTicketForm"]'));
    this.cancelTicketCreationButton = page.getByText('Cancel');

    // Ticket Form Elements (only what's used)
    this.ticketTitleField = page.getByRole('textbox', { name: /title/i });
    this.ticketDescriptionField = page.getByRole('textbox', { name: /description/i });
    this.ticketCategoryDropdown = page.getByRole('combobox', { name: /category/i });

    // Sorting Elements (only what's used)
    this.sortDropdown = page.locator('[class*="SortDropdown"]');
    this.sortOptions = (optionText: string) => page.getByText(optionText, { exact: false });
    this.ticketRows = page.getByTestId(/dataGridRow/);
    this.ticketDateCells = page.locator('td[class*="Cell-module"]');
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName }).first();
      await this.clickOnElement(button, { timeout });
    });
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

  async verifyNewTicketOptionVisible(shouldBeVisible: boolean = true): Promise<boolean> {
    const action = shouldBeVisible ? 'visible' : 'hidden';
    const stepName = `Verify New Ticket option is ${action}`;

    return await test.step(stepName, async () => {
      if (shouldBeVisible) {
        await this.newTicketOption.waitFor({ state: 'visible', timeout: 15000 });
        const isVisible = await this.newTicketOption.isVisible();
        await expect(this.newTicketOption).toBeVisible();
        return isVisible;
      } else {
        await this.newTicketOption.waitFor({ state: 'hidden', timeout: 15000 });
        const isHidden = await this.newTicketOption.isHidden();
        await expect(this.newTicketOption).toBeHidden();
        return !isHidden;
      }
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
      await this.clickButton('New ticket');

      // Wait for ticket creation form
      await this.ticketCreationPanel.waitFor({ state: 'visible' });

      // Fill in ticket details
      await this.fillInElement(this.ticketTitleField, ticketData.title);
      await this.fillInElement(this.ticketDescriptionField, ticketData.description);

      // Submit the ticket
      await this.clickButton('Create ticket');
    });
  }

  // Utility Methods
  async verifyTicketCreationSuccess(): Promise<void> {
    await test.step('Verify ticket creation was successful', async () => {
      await this.verifyToastMessageIsVisibleWithText(MESSAGES.SNOW_TICKET_CREATION_MESSAGE);
    });
  }

  // Sorting Methods
  async clickSortDropdown(): Promise<void> {
    await test.step('Click sort dropdown', async () => {
      // Class-based selector
      await this.sortDropdown.waitFor({ state: 'visible' });
      await this.clickOnElement(this.sortDropdown);
    });
  }

  async selectSortOption(optionText: string): Promise<void> {
    await test.step(`Select sort option: ${optionText}`, async () => {
      await this.page.waitForTimeout(1000);
      const option = this.sortOptions(optionText).first();
      await this.clickOnElement(option);
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
        // Look for date elements within each ticket (get last cell of each row)
        const dateElement = ticket.locator('td').last();

        const dateText = await dateElement.textContent();
        if (dateText) {
          // Try to parse the date
          const parsedDate = new Date(dateText.trim());
          if (!isNaN(parsedDate.getTime())) {
            ticketDates.push(parsedDate);
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
