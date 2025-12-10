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
  readonly budgetFinancialStartMonthLabel: Locator;
  readonly budgetFinancialStartMonthSelectDropdown: Locator;
  readonly budgetFinancialStartDateLabel: Locator;
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
    this.budgetFinancialStartMonthLabel = this.budgetContainer.locator(
      '[data-testid="field-Start month"] label[for="month"]'
    );
    this.budgetFinancialStartMonthSelectDropdown = this.budgetContainer.locator(
      '[aria-label="Start month"][id="month"]'
    );
    this.budgetFinancialStartDateLabel = this.budgetContainer.locator(
      '[data-testid="field-Start day"] label[for="day"]'
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
    await this.verifier.verifyTheElementIsVisible(this.budgetFinancialStartMonthLabel);
    await this.verifier.verifyTheElementIsVisible(this.budgetFinancialStartDateLabel);
    await this.verifier.verifyTheElementIsVisible(this.budgetFinancialStartMonthSelectDropdown);
    await this.verifier.verifyTheElementIsVisible(this.budgetFinancialStartDateSelectDropdown);
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
        'Edit rewards budget'
      );
    }
    await manageRewardsPage.verifier.verifyElementHasText(
      manageRewardsPage.budgetModal.budgetPanelDescription.nth(1),
      'You will receive notifications when nearing and reaching this budget.'
    );
  }

  private daysBetweenInclusive(start: Date, end: Date): number {
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  private daysBetweenExclusive(date1: Date, date2: Date): number {
    const diffMs = date2.getTime() - date1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Methods for RC-3055 test
  async setFinancialYearStartDate(dateType: 'future' | 'past'): Promise<number[]> {
    const today = new Date();
    let month: number;
    let day: number;

    if (dateType === 'future') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      month = tomorrow.getMonth() + 1;
      day = tomorrow.getDate();
    } else if (dateType === 'past') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      month = yesterday.getMonth() + 1;
      day = yesterday.getDate();
    } else {
      month = today.getMonth();
      day = today.getDate();
    }

    console.log(`Setting financial year start to -> Month: ${month}, Day: ${day}`);
    await this.page.selectOption('select[name="month"]', month.toString());
    await this.page.selectOption('select[name="day"]', day.toString());
    return [month, day];
  }

  async daysUntilSelectedUTC(selectedMonth: number, selectedDay: number): Promise<number> {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonthIndex = selectedMonth - 1; // JS Date monthIndex 0..11
    let candidate = new Date(Date.UTC(utcYear, utcMonthIndex, selectedDay, 0, 0, 0, 0));
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    if (candidate <= todayUTC) {
      candidate = new Date(Date.UTC(utcYear + 1, utcMonthIndex, selectedDay, 0, 0, 0, 0));
    }
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = candidate.getTime() - todayUTC.getTime();
    return Math.round(diffMs / msPerDay);
  }

  private toUTCDate(y: number, m: number, d: number): Date {
    return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  }

  private addMonthsUTC(d: Date, monthsToAdd: number): Date {
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + monthsToAdd;
    const targetYear = Math.floor(m / 12) + y;
    const targetMonth = ((m % 12) + 12) % 12;
    const day = d.getUTCDate();
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    return this.toUTCDate(targetYear, targetMonth, Math.min(day, lastDay));
  }

  async calculateQuarterDates(selectedMonth: number, selectedDay: number) {
    const today = new Date();
    const todayUTC = this.toUTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

    const fyCandidate = (() => {
      let d = this.toUTCDate(todayUTC.getUTCFullYear(), selectedMonth - 1, selectedDay);
      if (d > todayUTC) d = this.toUTCDate(todayUTC.getUTCFullYear() - 1, selectedMonth - 1, selectedDay);
      return d;
    })();

    // quarter starts
    const qStarts = [
      fyCandidate,
      this.addMonthsUTC(fyCandidate, 3),
      this.addMonthsUTC(fyCandidate, 6),
      this.addMonthsUTC(fyCandidate, 9),
    ];

    let qStart = qStarts[0];
    let qEnd = this.addMonthsUTC(qStart, 3);
    for (const qs of qStarts) {
      const qe = this.addMonthsUTC(qs, 3);
      const qeMinusOne = new Date(qe.getTime() - 24 * 60 * 60 * 1000);
      if (todayUTC >= qs && todayUTC <= qeMinusOne) {
        qStart = qs;
        qEnd = qe;
        break;
      }
    }

    const qEndInclusive = new Date(qEnd.getTime() - 24 * 60 * 60 * 1000);
    const totalDays = this.daysBetweenInclusive(qStart, qEndInclusive);
    const remainingDays = this.daysBetweenInclusive(todayUTC, qEndInclusive);

    return { qStart, qEndInclusive, totalDays, remainingDays };
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }

  /**
   * Fill budget amount in the input field
   */
  async fillBudgetAmount(amount: string | number): Promise<void> {
    await this.fillInElement(this.budgetPanelInputBox, String(amount), {
      stepInfo: `Filling budget input with ${amount}`,
    });
    await this.budgetPanelInputBox.blur();
  }

  /**
   * Save the budget modal
   */
  async saveBudget(): Promise<void> {
    await this.clickOnElement(this.budgetPanelSaveButton, {
      stepInfo: 'Clicking on save button',
    });
  }

  /**
   * Fill and save budget with specified frequency and amount
   */
  async fillAndSaveBudget(frequency: 'Annual' | 'Quarterly' | 'Remove', amount?: string | number): Promise<void> {
    await this.selectTheBudgetFrequency(frequency);
    if (amount !== undefined && frequency !== 'Remove') {
      await this.fillBudgetAmount(amount);
    }
    await this.saveBudget();
  }
}
