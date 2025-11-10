import { Locator, Page } from '@playwright/test';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';

import { BasePage } from '@core/pages/basePage';

export class RewardsBudgetModal extends BasePage {
  // Budget
  readonly editBudgetButton: Locator;
  readonly addBudgetButton: Locator;
  readonly budgetContainer: Locator;
  readonly budgetPanelHeader: Locator;
  readonly budgetPanelDescription: Locator;
  readonly budgetPanelAnnualRadioLabel: Locator;
  readonly budgetPanelAnnualRadioInputBox: Locator;
  readonly budgetPanelQuarterlyRadioLabel: Locator;
  readonly budgetPanelQuarterlyRadioInputBox: Locator;
  readonly budgetPanelRemoveRadioInputBox: Locator;
  readonly budgetPanelInputBox: Locator;
  readonly budgetInputErrorMessage: Locator;
  readonly budgetFinancialStartMonthSelectDropdown: Locator;
  readonly budgetFinancialStartDateSelectDropdown: Locator;
  readonly budgetBalanceApplicationFullAnnualBudget: Locator;
  readonly budgetBalanceApplicationProRATABudget: Locator;
  readonly budgetBalanceApplicationCustomBudget: Locator;
  readonly budgetBalanceApplicationCustomBudgetInputBox: Locator;
  readonly budgetPanelSaveButton: Locator;
  readonly proRataValue: Locator;

  constructor(page: Page) {
    super(page);

    // Budget modal elements
    this.editBudgetButton = page.getByRole('button', { name: 'Edit budget' });
    this.addBudgetButton = page.getByRole('button', { name: 'Add budget' });
    this.budgetContainer = page.locator('[role="dialog"][data-state="open"]');
    this.budgetPanelHeader = this.budgetContainer.locator('h2[class*="Dialog-module__title"]>span');
    this.budgetPanelDescription = this.budgetContainer.locator('p[class*="Typography-module__paragraph"]');
    this.budgetPanelAnnualRadioLabel = this.budgetContainer.locator('label[for="budgetFrequencyANNUAL"]');
    this.budgetPanelAnnualRadioInputBox = this.budgetPanelAnnualRadioLabel.locator('input[name="budgetFrequency"]');
    this.budgetPanelQuarterlyRadioLabel = this.budgetContainer.locator('label[for="budgetFrequencyQUARTERLY"]');
    this.budgetPanelQuarterlyRadioInputBox = this.budgetPanelQuarterlyRadioLabel.locator(
      'input[name="budgetFrequency"]'
    );
    this.budgetPanelRemoveRadioInputBox = this.budgetContainer.locator('label[for="budgetFrequencyREMOVE"] input');
    this.budgetPanelInputBox = this.budgetContainer.locator('input[id="budgetUsdAmount"]');
    this.budgetPanelSaveButton = this.budgetContainer.locator('button[type="submit"]');
    this.budgetInputErrorMessage = this.budgetContainer.locator('[class^="Field-module__error"] p');
    this.budgetFinancialStartMonthSelectDropdown = this.budgetContainer.locator(
      '[aria-label="Start month"][id="month"]'
    );
    this.budgetFinancialStartDateSelectDropdown = this.budgetContainer.locator('[aria-label="Start day"][id="day"]');
    this.budgetBalanceApplicationFullAnnualBudget = page.locator('input[id="balanceAllocationFULL"]');
    this.budgetBalanceApplicationProRATABudget = page.locator('input[id="balanceAllocationPRORATA"]');
    this.budgetBalanceApplicationCustomBudget = page.locator('input[id="balanceAllocationCUSTOM"]');
    this.budgetBalanceApplicationCustomBudgetInputBox = page.locator('input[id="customAllocationUsdAmount"]');
    this.proRataValue = page.locator('input[id="prorataUsdBudget"]');
  }

  async selectTheBudgetFrequency(frequency: 'Annual' | 'Quarterly' | 'Remove'): Promise<void> {
    if (frequency === 'Annual') {
      if (!(await this.budgetPanelAnnualRadioInputBox.isChecked())) {
        await this.budgetPanelAnnualRadioInputBox.click();
      }
    } else if (frequency === 'Quarterly') {
      if (!(await this.budgetPanelQuarterlyRadioInputBox.isChecked())) {
        await this.budgetPanelQuarterlyRadioInputBox.click();
      }
    } else {
      await this.budgetPanelRemoveRadioInputBox.click();
    }
  }

  async verifyTheBudgetFrequencyRadioButtons(budgetOps: string) {
    const manageRewardsPage = new ManageRewardsOverviewPage(this.page);
    await manageRewardsPage.verifier.verifyTheElementIsVisible(this.budgetPanelAnnualRadioInputBox);
    await manageRewardsPage.verifier.verifyTheElementIsVisible(this.budgetPanelQuarterlyRadioInputBox);
    if (budgetOps === 'Edit budget') {
      await manageRewardsPage.verifier.verifyTheElementIsVisible(this.budgetPanelRemoveRadioInputBox);
    }
  }

  async verifyTheBudgetInputBox() {
    await this.verifier.verifyTheElementIsVisible(this.budgetPanelInputBox);
  }

  async verifyTheFinancialStartDateInputBox() {
    await this.verifier.verifyTheElementIsVisible(this.budgetFinancialStartDateSelectDropdown);
    await this.verifier.verifyTheElementIsVisible(this.budgetFinancialStartMonthSelectDropdown);
  }

  async verifyTheBudgetBalance() {
    await this.verifier.verifyTheElementIsVisible(this.budgetBalanceApplicationFullAnnualBudget);
    await this.verifier.verifyTheElementIsVisible(this.budgetBalanceApplicationProRATABudget);
    await this.verifier.verifyTheElementIsVisible(this.budgetBalanceApplicationCustomBudget);
    await this.budgetBalanceApplicationCustomBudget.click();
    await this.verifier.verifyTheElementIsVisible(this.budgetBalanceApplicationCustomBudgetInputBox);
  }

  async verifyTheElementsInBudgetModalAreVisible(budgetOps: String): Promise<void> {
    const manageRewardsPage = new ManageRewardsOverviewPage(this.page);
    if (budgetOps === 'Add budget') {
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.budgetModal.budgetPanelDescription.nth(0),
        'Add a budget to track and report on rewards spend. You may edit this at any time.'
      );
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'Add a rewards budget'
      );
    } else {
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.budgetModal.budgetPanelDescription.nth(0),
        'Edit the budget to track and report on rewards spend.'
      );
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'Edit a rewards budget'
      );
    }
    await manageRewardsPage.verifier.verifyElementHasText(
      manageRewardsPage.budgetModal.budgetPanelDescription.nth(1),
      'You will receive notifications when nearing and reaching this budget.'
    );
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
