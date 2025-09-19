import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { expect, Locator, Page, test } from '@playwright/test';

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
  readonly commentsTextarea: Locator;
  readonly requestTimeOffButton: Locator;
  readonly editAmountButton: Locator;
  readonly amountInputs: Locator;
  readonly totalAmountInput: Locator;
  readonly totalAmountHeading: Locator;
  readonly dropdownOption: Locator;
  readonly calendarGrid: Locator;
  readonly dayPickerCell: Locator;
  readonly tileContainer: Locator;
  readonly tileContent: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly genericButton: Locator;
  readonly dropdownSelector: Locator;
  readonly dayPickerCellByAriaLabel: Locator;
  readonly requestTypeDropdown: Locator;
  readonly requestTypeInput: Locator;
  readonly requestTypeMenu: Locator;
  readonly requestTypeOption: Locator;
  readonly requestTimeOffBtn: Locator;
  readonly commentNoteTextarea: Locator;

  constructor(page: Page) {
    super(page);
    this.startDateButton = page.locator('button[id*="dateRange_startDate"]').first();
    this.endDateButton = page.locator('button[id*="dateRange_endDate"]').first();
    this.timeOffCategoryDropdown = page.getByTestId('field-Time off category').locator('.css-1bbetpp-control').first();
    this.commentsTextarea = page.locator('#employeeNote');
    this.requestTimeOffButton = page.getByRole('button', { name: 'Request time off' }).first();
    this.editAmountButton = page.getByRole('button', { name: 'Edit amount' });
    this.amountInputs = page.locator('input[name*="days"][name*="amount"]');
    this.totalAmountInput = page.locator('input[aria-label="Amount"]').first();
    this.totalAmountHeading = page.getByRole('heading', { name: /total:/i }).first();
    this.dropdownOption = page.locator('div[role="menuitem"]');
    this.calendarGrid = page.getByRole('grid');
    this.dayPickerCell = page.locator('.DayPicker-Day[aria-label]');
    this.tileContainer = page.locator('aside.Tile').first();
    this.tileContent = this.tileContainer.locator('div, span, p').first();
    this.monthSelect = page.locator('select[aria-label="Select month"]').first();
    this.yearSelect = page.locator('select[aria-label="Select year"]').first();
    this.genericButton = page.getByRole('button');
    this.dropdownSelector = page.locator('[role="listbox"], [id^="react-select-"][id$="-listbox"]');
    this.dayPickerCellByAriaLabel = page.locator('.DayPicker-Day');
    this.requestTypeDropdown = page.locator('.css-b62m3t-container');
    this.requestTypeInput = page.locator('input[role="combobox"][aria-label="Request type"]');
    this.requestTypeMenu = page.locator('.Menu-module__menu__3PjCm, [role="listbox"]');
    this.requestTypeOption = page.locator('[role="menuitem"]');

    this.requestTimeOffBtn = page.locator('button[type="button"]').filter({ hasText: 'Request time off' }).first();
    this.commentNoteTextarea = page.locator('textarea[name="commentNote"]');
  }

  /**
   * Gets a day cell locator by aria-label
   * @param ariaLabel - The aria-label value to match
   * @returns Locator for the specific day cell
   */
  getDayCellByAriaLabel(ariaLabel: string): Locator {
    const dayNumber = ariaLabel.split(' ')[2];
    return this.dayPickerCellByAriaLabel.filter({ hasText: dayNumber }).first();
  }

  /**
   * Selects leave dates starting tomorrow for the specified number of working days
   * @param workingDays - Number of working days for the leave
   */
  async selectLeaveDates(workingDays: number): Promise<void> {
    await test.step(`Select leave dates for ${workingDays} working days`, async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDate = getNextWorkingDay(today);
      const endDate = addWorkingDays(startDate, workingDays - 1);
      await this.selectDate('start', startDate);
      await this.selectDate('end', endDate);
    });
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
    const validDate = new Date(targetDate.getTime());
    const expectedText = formatDateForDisplay(validDate);
    const ariaLabel = formatDateForAriaLabel(validDate);

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await dateButton.click();
        await this.calendarGrid.waitFor({ state: 'visible', timeout: 10000 });
        await this.navigateToCorrectMonthYear(validDate);
        await this.calendarGrid.waitFor({ state: 'visible' });
        const dayCell = this.getDayCellByAriaLabel(ariaLabel);
        await dayCell.click();
        return; // Success, exit the retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw new Error(`Failed to select date ${expectedText} after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Navigates to the correct month and year in the calendar
   * @param targetDate - The target date to navigate to
   */
  private async navigateToCorrectMonthYear(targetDate: Date): Promise<void> {
    const targetMonth = targetDate.getUTCMonth();
    const targetYear = targetDate.getUTCFullYear();

    // Select the correct month
    if (await this.monthSelect.isVisible()) {
      await this.monthSelect.selectOption({ index: targetMonth });
    }

    // Select the correct year
    if (await this.yearSelect.isVisible()) {
      await this.yearSelect.selectOption({ value: targetYear.toString() });
    }
  }

  /**
   * Selects a time off category from the dropdown
   * @param category - The category to select (e.g., 'Vacation', 'Sick', 'Personal')
   */
  async selectTimeOffCategory(category: string): Promise<void> {
    await test.step(`Select time off category '${category}'`, async () => {
      await this.timeOffCategoryDropdown.click();
      await this.dropdownSelector.waitFor({ state: 'visible', timeout: 10000 });
      const option = this.dropdownOption.filter({ hasText: category }).first();
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      await this.dropdownSelector.waitFor({ state: 'hidden', timeout: 5000 });
    });
  }

  /**
   * Enters comments in the comments textarea
   * @param comments - The comments to enter
   */
  async enterComments(comments: string): Promise<void> {
    await test.step(`Enter comments: '${comments}'`, async () => {
      await this.commentsTextarea.fill(comments);
    });
  }

  /**
   * Enters comment note in the Comment note textarea
   * @param commentNote - The comment note to enter
   */
  async enterCommentNote(commentNote: string): Promise<void> {
    await test.step(`Enter comment note: '${commentNote}'`, async () => {
      await this.commentNoteTextarea.fill(commentNote);
    });
  }

  /**
   * Clicks the "Request time off" button to submit the form
   */
  async submitTimeOffRequest(): Promise<void> {
    await test.step('Submit time off request', async () => {
      await this.requestTimeOffButton.click();
    });
  }

  /**
   * Verifies that the form displays the correct total days
   * @param expectedTotalDays - The expected total days
   */
  async verifyTotalDays(expectedTotalDays: number): Promise<void> {
    await test.step(`Verify total days is ${expectedTotalDays}`, async () => {
      const inputCount = await this.totalAmountInput.count();
      const inputVisible = inputCount > 0 && (await this.totalAmountInput.isVisible());
      if (inputVisible) {
        await expect(this.totalAmountInput).toHaveValue(`${expectedTotalDays} days`);
      } else {
        await expect(this.totalAmountHeading).toContainText(`Total: ${expectedTotalDays} days`);
      }
    });
  }

  /**
   * Verifies all required form fields are present and in correct state
   */
  async verifyRequiredFields(): Promise<void> {
    await test.step('Verify all required form fields are present and in correct state', async () => {
      // allow either the single-character ellipsis (U+2026) or three dots, case-insensitive
      const selectDateRegex = /select\s*date(?:\u2026|\.{3})?/i;
      const selectRegex = /select(?:\u2026|\.{3})?/i;
      await expect(this.startDateButton).toBeVisible({ timeout: 15000 });
      await expect(this.startDateButton).toContainText(selectDateRegex);
      await expect(this.endDateButton).toBeVisible({ timeout: 15000 });
      await expect(this.endDateButton).toContainText(selectDateRegex);
      await expect(this.timeOffCategoryDropdown).toBeVisible();
      await expect(this.timeOffCategoryDropdown).toContainText(selectRegex);
      await expect(this.requestTimeOffButton).toBeVisible();
      await expect(this.requestTimeOffButton).toContainText(/request time off/i);
    });
  }

  /**
   * Verifies a message is displayed on the tile
   * @param message - The message text to verify
   */
  async verifyMessageOnTile(message: string): Promise<void> {
    await test.step(`Verify message '${message}' is displayed on tile`, async () => {
      await expect(this.page.getByText(message).first()).toBeVisible();
    });
  }

  /**
   * Verifies a button with specified text is visible
   * @param buttonText - The text of the button to verify
   */
  async verifyButton(buttonText: string): Promise<void> {
    await test.step(`Verify button '${buttonText}' is visible`, async () => {
      await expect(this.genericButton.filter({ hasText: buttonText }).first()).toBeVisible();
    });
  }

  /**
   * Verifies Apply for Time Off tile form fields are present and functional
   * @param tileTitle - The title of the tile to verify
   */
  async verifyApplyForTimeOffFields(tileTitle: string): Promise<void> {
    await test.step(`Verify Apply for Time Off tile '${tileTitle}' form fields`, async () => {
      await this.verifyRequiredFields();
    });
  }

  /**
   * Verifies Display Time Off Balance tile content (no form fields expected)
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDisplayTimeOffBalanceFields(tileTitle: string): Promise<void> {
    await test.step(`Verify Display Time Off Balance tile '${tileTitle}' content`, async () => {
      await this.verifyDisplayBalanceTileContent();
    });
  }

  /**
   * Verifies Display Time Off Balance tile content (no form fields expected)
   */
  private async verifyDisplayBalanceTileContent(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.tileContainer).toBeVisible({ timeout: 10000 });
    await expect(this.tileContent).toBeVisible({ timeout: 5000 });
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
    await test.step(`Verify amount values: ${expectedTotal} ${categoryConfig.unit} for ${workingDays} working days`, async () => {
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
    });
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

  /**
   * Clicks the "Request time off" button
   * @param buttonText - The button text to click (optional, defaults to "Request time off")
   * @param options - Optional step information
   */
  async clickRequestButton(buttonText?: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Click ${buttonText || 'Request time off'} button`, async () => {
      await this.clickOnElement(this.requestTimeOffBtn);
    });
  }

  /**
   * Selects a value from any dropdown field
   * @param fieldType - The type of field ('Request type', 'Duration', 'Comment Type')
   * @param value - The value to select
   * @param options - Optional step information
   */
  async selectRequestType(fieldType: string, value: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Select ${fieldType}: ${value}`, async () => {
      // More robust input locator with multiple strategies
      const input = this.page
        .locator(
          `input[aria-label="${fieldType}"], input[aria-label*="${fieldType}"], input[placeholder*="${fieldType}"]`
        )
        .first();
      await input.click();
      await this.page.waitForTimeout(500);

      // Better menu locator with fallbacks
      const menu = this.page.locator('.Menu-module__menu__3PjCm, [role="listbox"], .css-fnh3vc-menu').first();
      await menu.waitFor({ state: 'visible', timeout: 5000 });

      // More specific option locator
      const option = this.page
        .locator('[role="menuitem"], .MenuItem-module__item__qso52')
        .filter({ hasText: value })
        .first();
      await option.click();
    });
  }

  /**
   * Verifies the "Request time off" button is enabled and ready for interaction
   * @param options - Optional step information
   */
  async verifyRequestTimeOffButtonIsEnabled(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Request time off button is enabled', async () => {
      await this.verifier.verifyTheElementIsVisible(this.requestTimeOffButton);
      await expect(this.requestTimeOffButton).toBeEnabled();
      await expect(this.requestTimeOffButton).toContainText(/request time off/i);
    });
  }

  /**
   * Verifies the "Request time off" button is disabled
   * @param options - Optional step information
   */
  async verifyRequestTimeOffButtonIsDisabled(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Request time off button is disabled', async () => {
      await this.verifier.verifyTheElementIsVisible(this.requestTimeOffButton);
      await expect(this.requestTimeOffButton).toBeDisabled();
      await expect(this.requestTimeOffButton).toContainText(/request time off/i);
    });
  }
}
