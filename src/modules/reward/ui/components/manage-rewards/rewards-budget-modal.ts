import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class RewardsBudgetModal extends BasePage {
  // Budget
  readonly editBudgetButton: Locator;
  readonly addBudgetButton: Locator;
  readonly budgetContainer: Locator;
  readonly budgetPanelHeader: Locator;
  readonly budgetPanelDescription: Locator;
  readonly budgetPanelAnnualRadioInputBox: Locator;
  readonly budgetPanelQuarterlyRadioInputBox: Locator;
  readonly budgetPanelRemoveRadioInputBox: Locator;
  readonly budgetPanelInputBox: Locator;
  readonly budgetInputErrorMessage: Locator;
  readonly budgetBalanceApplicationFullAnnualBudget: Locator;
  readonly budgetBalanceApplicationProRATABudget: Locator;
  readonly budgetBalanceApplicationCustomBudget: Locator;
  readonly budgetPanelSaveButton: Locator;
  readonly proRataValue: Locator;

  constructor(page: Page) {
    super(page);

    // Budget modal elements
    this.editBudgetButton = page.locator('button[data-testid="edit-budget-button"]');
    this.addBudgetButton = page.locator('button[data-testid="add-budget-button"]');
    this.budgetContainer = page.locator('[data-testid="budget-modal-container"]');
    this.budgetPanelHeader = page.locator('[data-testid="budget-panel-header"]');
    this.budgetPanelDescription = page.locator('[data-testid="budget-panel-description"]');
    this.budgetPanelAnnualRadioInputBox = page.locator('input[value="annual"]');
    this.budgetPanelQuarterlyRadioInputBox = page.locator('input[value="quarterly"]');
    this.budgetPanelRemoveRadioInputBox = page.locator('input[value="remove"]');
    this.budgetPanelInputBox = page.locator('input[data-testid="budget-input"]');
    this.budgetInputErrorMessage = page.locator('[data-testid="budget-input-error"]');
    this.budgetBalanceApplicationFullAnnualBudget = page.locator('input[value="full-annual"]');
    this.budgetBalanceApplicationProRATABudget = page.locator('input[value="pro-rata"]');
    this.budgetBalanceApplicationCustomBudget = page.locator('input[value="custom"]');
    this.budgetPanelSaveButton = page.locator('button[data-testid="budget-save-button"]');
    this.proRataValue = page.locator('[data-testid="pro-rata-value"]');
  }

  async selectTheBudgetFrequency(frequency: 'Annual' | 'Quarterly' | 'Remove'): Promise<void> {
    switch (frequency) {
      case 'Annual':
        await this.budgetPanelAnnualRadioInputBox.click();
        break;
      case 'Quarterly':
        await this.budgetPanelQuarterlyRadioInputBox.click();
        break;
      case 'Remove':
        await this.budgetPanelRemoveRadioInputBox.click();
        break;
    }
  }

  async setFinancialYearStartDate(dateType: 'past' | 'future' | 'present'): Promise<number[]> {
    const now = new Date();
    let targetDate: Date;

    switch (dateType) {
      case 'past':
        targetDate = new Date(now.getFullYear() - 1, 0, 1); // January 1st of last year
        break;
      case 'future':
        targetDate = new Date(now.getFullYear() + 1, 0, 1); // January 1st of next year
        break;
      case 'present':
      default:
        targetDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
    }

    return [targetDate.getMonth(), targetDate.getDate()];
  }

  async daysUntilSelectedUTC(selectedMonth: number, selectedDay: number): Promise<number> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const targetDate = this.toUTCDate(currentYear, selectedMonth, selectedDay);
    const today = this.toUTCDate(currentYear, now.getMonth(), now.getDate());

    if (targetDate < today) {
      const nextYear = currentYear + 1;
      const nextTargetDate = this.toUTCDate(nextYear, selectedMonth, selectedDay);
      return this.daysBetweenInclusive(today, nextTargetDate);
    }

    return this.daysBetweenInclusive(today, targetDate);
  }

  private toUTCDate(y: number, m: number, d: number): Date {
    return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  }

  private addMonthsUTC(d: Date, monthsToAdd: number): Date {
    const result = new Date(d);
    result.setUTCMonth(result.getUTCMonth() + monthsToAdd);
    return result;
  }

  private daysBetweenInclusive(start: Date, end: Date): number {
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  async calculateQuarterDates(selectedMonth: number, selectedDay: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const targetDate = this.toUTCDate(currentYear, selectedMonth, selectedDay);
    const today = this.toUTCDate(currentYear, now.getMonth(), now.getDate());

    let quarterStart: Date;
    let quarterEnd: Date;

    if (targetDate < today) {
      const nextYear = currentYear + 1;
      quarterStart = this.toUTCDate(nextYear, selectedMonth, selectedDay);
      quarterEnd = this.addMonthsUTC(quarterStart, 3);
    } else {
      quarterStart = targetDate;
      quarterEnd = this.addMonthsUTC(quarterStart, 3);
    }

    const totalDays = this.daysBetweenInclusive(quarterStart, quarterEnd);
    const remainingDays = this.daysBetweenInclusive(today, quarterEnd);

    return { totalDays, remainingDays };
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
