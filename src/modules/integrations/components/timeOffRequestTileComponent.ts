import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { expect, Locator, Page } from '@playwright/test';

import {
  addWorkingDays,
  formatDateForAriaLabel,
  formatDateForDisplay,
  getNextWorkingDay,
  isWeekend,
} from '@core/utils/dateUtil';

export interface TimeOffCategoryConfig {
  unit: 'hours' | 'days';
  amountPerDay: number;
}

export class TimeOffRequestTileComponent extends BaseAppTileComponent {
  readonly startDateButton: Locator;
  readonly endDateButton: Locator;
  readonly timeOffCategoryDropdown: Locator;
  readonly dropdownListbox: Locator;
  readonly commentsTextarea: Locator;
  readonly requestTimeOffButton: Locator;
  readonly editAmountButton: Locator;
  readonly amountInputs: Locator;
  readonly totalAmountInput: Locator;
  readonly totalAmountHeading: Locator;
  readonly dropdownOption: Locator;

  constructor(page: Page) {
    super(page);
    this.startDateButton = page.locator('button[id*="dateRange_startDate"]').first();
    this.endDateButton = page.locator('button[id*="dateRange_endDate"]').first();
    this.timeOffCategoryDropdown = page.locator('[data-testid="field-Time off category"] .css-1bbetpp-control').first();
    this.dropdownListbox = page.locator('[id^="react-select-"][id$="-listbox"]').first();
    this.commentsTextarea = page.locator('#employeeNote');
    this.requestTimeOffButton = page.getByRole('button', { name: 'Request time off' }).first();
    this.editAmountButton = page.getByRole('button', { name: 'Edit amount' });
    this.amountInputs = page.locator('input[name*="days"][name*="amount"]');
    this.totalAmountInput = page.locator('input[aria-label="Amount"]').first();
    this.totalAmountHeading = page.getByRole('heading', { name: /total:/i }).first();
    this.dropdownOption = page.locator('div[role="menuitem"]');
  }

  /**
   * Selects leave dates starting tomorrow for the specified number of working days
   * @param workingDays - Number of working days for the leave
   */
  async selectLeaveDates(workingDays: number): Promise<void> {
    // Create a date at midnight UTC to avoid timezone issues
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const startDate = getNextWorkingDay(today);
    const endDate = addWorkingDays(startDate, workingDays - 1);

    await this.selectDate('start', startDate);
    await this.selectDate('end', endDate);
  }

  /**
   * Selects a date from the date picker
   * @param rangeType - Either 'start' or 'end' to identify which date field
   * @param targetDate - The date to select
   */
  private async selectDate(rangeType: 'start' | 'end', targetDate: Date): Promise<void> {
    const dateButton = rangeType === 'start' ? this.startDateButton : this.endDateButton;
    if (isWeekend(targetDate)) {
      throw new Error(`Cannot select weekend date: ${targetDate.toDateString()}`);
    }
    const expectedText = formatDateForDisplay(targetDate);
    const ariaLabel = formatDateForAriaLabel(targetDate);
    await dateButton.click();
    const dayCell = this.page.getByRole('gridcell', { name: ariaLabel }).first();
    await dayCell.click();
    await expect(dateButton).toContainText(expectedText, { timeout: 10000 });
  }

  /**
   * Selects a time off category from the dropdown
   * @param category - The category to select (e.g., 'Vacation', 'Sick', 'Personal')
   */
  async selectTimeOffCategory(category: string): Promise<void> {
    await this.timeOffCategoryDropdown.click();
    await this.dropdownListbox.waitFor({ state: 'visible', timeout: 5000 });
    const option = this.dropdownOption.filter({ hasText: category }).first();
    await option.click();
    await this.dropdownListbox.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Enters comments in the comments textarea
   * @param comments - The comments to enter
   */
  async enterComments(comments: string): Promise<void> {
    await this.commentsTextarea.fill(comments);
  }

  /**
   * Clicks the "Request time off" button to submit the form
   */
  async submitTimeOffRequest(): Promise<void> {
    await this.requestTimeOffButton.click();
  }

  /**
   * Verifies that the form displays the correct total days
   * @param expectedTotalDays - The expected total days
   */
  async verifyTotalDays(expectedTotalDays: number): Promise<void> {
    const inputCount = await this.totalAmountInput.count();
    const inputVisible = inputCount > 0 && (await this.totalAmountInput.isVisible());
    if (inputVisible) {
      await expect(this.totalAmountInput).toHaveValue(`${expectedTotalDays} days`);
    } else {
      await expect(this.totalAmountHeading).toContainText(`Total: ${expectedTotalDays} days`);
    }
  }

  /**
   * Verifies all required form fields are present and in correct state
   */
  async verifyRequiredFields(): Promise<void> {
    // allow either the single-character ellipsis (U+2026) or three dots, case-insensitive
    const selectDateRegex = /select\s*date(?:\u2026|\.{3})?/i;
    const selectRegex = /select(?:\u2026|\.{3})?/i;
    await expect(this.startDateButton).toBeVisible();
    await expect(this.startDateButton).toContainText(selectDateRegex);
    await expect(this.endDateButton).toBeVisible();
    await expect(this.endDateButton).toContainText(selectDateRegex);
    await expect(this.timeOffCategoryDropdown).toBeVisible();
    await expect(this.timeOffCategoryDropdown).toContainText(selectRegex);
    await expect(this.requestTimeOffButton).toBeVisible();
    await expect(this.requestTimeOffButton).toContainText(/request time off/i);
  }

  /**
   * Verifies a message is displayed on the tile
   * @param message - The message text to verify
   */
  async verifyMessageOnTile(message: string): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible();
  }

  /**
   * Verifies a button with specified text is visible
   * @param buttonText - The text of the button to verify
   */
  async verifyButton(buttonText: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: buttonText })).toBeVisible();
  }

  /**
   * Verifies leave category fields are present and functional
   * @param tileTitle - The title of the tile to verify
   */
  async verifyLeaveCategoryFields(tileTitle: string): Promise<void> {
    void tileTitle;
    await this.verifyRequiredFields();
  }

  /**
   * Verifies individual day amounts and the total calculation
   * @param workingDays - Number of working days selected
   * @param expectedTotal - Expected total amount (days or hours)
   * @param categoryConfig - Time off category configuration from test case
   * @param shouldClickEdit - Whether to click edit button (default: true, set to false when switching categories)
   */
  async verifyAmountValues(
    workingDays: number,
    expectedTotal: number,
    categoryConfig: TimeOffCategoryConfig,
    shouldClickEdit: boolean = true
  ): Promise<void> {
    const unit = categoryConfig.unit;
    // Verify total amount display (support either input with aria-label or heading)
    const inputCount = await this.totalAmountInput.count();
    const inputVisible = inputCount > 0 && (await this.totalAmountInput.isVisible());
    if (inputVisible) {
      await expect(this.totalAmountInput).toHaveValue(`${expectedTotal} ${unit}`);
    } else {
      await expect(this.totalAmountHeading).toContainText(`Total: ${expectedTotal} ${unit}`);
    }
    // Verify individual day amounts if requested
    if (shouldClickEdit && (await this.editAmountButton.isVisible())) {
      await this.editAmountButton.click();
      const today = new Date();
      const startDate = getNextWorkingDay(today);
      const endDate = addWorkingDays(startDate, workingDays - 1);
      const expectedAmounts = this.generateExpectedDayAmounts(startDate, endDate, categoryConfig);
      const inputCount = await this.amountInputs.count();
      for (let i = 0; i < Math.min(expectedAmounts.length, inputCount); i++) {
        await expect(this.amountInputs.nth(i)).toHaveValue(expectedAmounts[i].toString());
      }
    }
  }

  /**
   * Generates expected day amounts array considering weekends
   * @param startDate - Start date of the leave period
   * @param endDate - End date of the leave period
   * @param categoryConfig - Time off category configuration from test case
   * @returns Array of expected amounts (based on category config for working days, 0 for weekends)
   */
  private generateExpectedDayAmounts(startDate: Date, endDate: Date, categoryConfig: TimeOffCategoryConfig): number[] {
    const amounts: number[] = [];
    const currentDate = new Date(startDate);
    const workingDayAmount = categoryConfig.amountPerDay;
    while (currentDate <= endDate) {
      amounts.push(isWeekend(currentDate) ? 0 : workingDayAmount);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return amounts;
  }
}
