import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export class RewardsManagerAllowance extends BasePage {
  //Manager allowance
  readonly managerAllowance: Locator;
  readonly managerAllowanceIcon: Locator;
  readonly managerAllowanceGreenTick: Locator;
  readonly managerAllowanceHeading: Locator;
  readonly managerAllowanceDescription: Locator;
  readonly addManagerAllowance: Locator;
  readonly removeManagerAllowance: Locator;
  readonly editManagerAllowance: Locator;

  readonly fixedCurrencyConversionInfoIcon: Locator;
  readonly fixedVariableCurrencyConversionInfoIcon: Locator;

  readonly managerAllowancePageContainer: Locator;
  readonly headerTitle: Locator;
  readonly headerDescription1: Locator;
  readonly headerDescription2: Locator;
  readonly managerAllowanceLabel: Locator;
  private managerAllowancePageNeutralBox: Locator;
  readonly managerAllowanceBoxMessageLine1: Locator;
  readonly managerAllowanceBoxMessageLine2: Locator;
  readonly managerAllowanceBoxMessageLine3: Locator;
  readonly fixedMonthlyAllowanceRadioButton: Locator;
  readonly variableMonthlyAllowanceRadioButton: Locator;
  readonly managerAllowancePNote: Locator;
  private fixedMonthlyContainer: Locator;
  private fixedMonthlyLabel: Locator;
  private fixedMonthlyInputBox: Locator;
  readonly fixedMonthlyPointAmountMinusButton: Locator;
  readonly fixedMonthlyPointAmountPlusButton: Locator;
  readonly fixedPointAmountLimitError: Locator;
  private variableMonthlyContainer: Locator;
  private variableMonthlyLabel: Locator;
  private variableMonthlyInputBox: Locator;
  readonly variableMonthlyPointAmountMinusButton: Locator;
  readonly variableMonthlyPointAmountPlusButton: Locator;
  readonly variablePointAmountLimitError: Locator;
  readonly managerAllowancePageVariableNeutralBox: Locator;
  readonly managerAllowanceBoxMessageVariableLine1: Locator;
  readonly managerAllowanceBoxMessageVariableLine2: Locator;
  readonly headerContainer: Locator;

  constructor(page: Page) {
    super(page);
    //Manager Allowance
    this.managerAllowance = page.locator('div[class*="PanelActionItem_layout"]').nth(1);
    this.managerAllowanceIcon = this.managerAllowance.locator('i[data-testid="i-orgchartUser"]');
    this.managerAllowanceGreenTick = this.managerAllowance.locator('div[class*="PanelActionItem_check"]');
    this.managerAllowanceHeading = this.managerAllowance.getByRole('heading', { name: 'Manager allowances' });
    this.managerAllowanceDescription = this.managerAllowance.getByText(
      'Add monthly allowances for simpplifiers managers'
    );
    // Action buttons
    this.addManagerAllowance = this.managerAllowance.locator('button[aria-label="Add manager allowances"]');
    this.removeManagerAllowance = this.managerAllowance.locator('button[aria-label="Remove manager allowances"]');
    this.editManagerAllowance = this.managerAllowance.locator('button[aria-label="Edit manager allowances"]');

    // Manager Allowance page
    this.managerAllowancePageContainer = page.locator('[data-testid="pageContainer-page"]');
    this.headerContainer = this.managerAllowancePageContainer.locator('header');
    this.headerTitle = this.headerContainer.locator('h1').nth(0);
    this.headerDescription1 = this.headerContainer.locator('p').nth(0);
    this.headerDescription2 = this.headerContainer.locator('p').nth(1);
    this.managerAllowanceLabel = page.locator('[for="allowanceType"]');
    this.managerAllowancePageNeutralBox = page
      .locator('[class*="ManagerAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(0);
    this.managerAllowanceBoxMessageLine1 = this.managerAllowancePageNeutralBox.locator('p:nth-child(1)');
    this.managerAllowanceBoxMessageLine2 = this.managerAllowancePageNeutralBox.locator('p:nth-child(2)');
    this.managerAllowanceBoxMessageLine3 = this.managerAllowancePageNeutralBox.locator('p:nth-child(3)');
    this.fixedMonthlyAllowanceRadioButton = page.locator('label[for="allowanceTypeFIXED"] input');
    this.variableMonthlyAllowanceRadioButton = page.locator('label[for="allowanceTypePER_DIRECT_REPORT"] input');
    this.managerAllowancePNote = page.locator('[class*="Field-module__note"]');

    //fixed monthly allowance elements
    this.fixedMonthlyContainer = page.locator('[class^="Allowances_numberInput-"]').first();
    this.fixedMonthlyLabel = this.fixedMonthlyContainer.locator('label');
    this.fixedMonthlyInputBox = this.fixedMonthlyContainer.locator('input');
    this.fixedMonthlyPointAmountMinusButton = this.fixedMonthlyContainer.locator('[aria-label="Minus"]');
    this.fixedCurrencyConversionInfoIcon = page
      .locator('[class*="Allowances_numberInput"] button[aria-label="Currency conversion information"]')
      .nth(0);
    this.fixedMonthlyPointAmountPlusButton = this.fixedMonthlyContainer.locator('[aria-label="Plus"]');
    this.fixedVariableCurrencyConversionInfoIcon = page
      .locator('[class*="Allowances_numberInput"] button[aria-label="Currency conversion information"]')
      .nth(1);

    this.managerAllowancePageVariableNeutralBox = page
      .locator('[class*="ManagerAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(1);
    this.managerAllowanceBoxMessageVariableLine1 =
      this.managerAllowancePageVariableNeutralBox.locator('p:nth-child(1)');
    this.managerAllowanceBoxMessageVariableLine2 =
      this.managerAllowancePageVariableNeutralBox.locator('p:nth-child(2)');
    this.fixedPointAmountLimitError = page.locator('[class*="Allowances_numberInput"] p[role="alert"]').nth(0);

    this.variableMonthlyContainer = page.locator('[class^="Allowances_numberInput-"]').last();
    this.variableMonthlyLabel = this.variableMonthlyContainer.locator('label');
    this.variableMonthlyInputBox = this.variableMonthlyContainer.locator('input');
    this.variableMonthlyPointAmountMinusButton = this.variableMonthlyContainer.locator('[aria-label="Minus"]');
    this.variableMonthlyPointAmountPlusButton = this.variableMonthlyContainer.locator('[aria-label="Plus"]');
    this.variablePointAmountLimitError = this.variableMonthlyContainer.locator('p[role="alert"]');
  }

  async visitManagerAllowance(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances');
    await this.page.waitForLoadState('networkidle');
  }

  async increaseTheFXMonthlyAmountBy(number: number): Promise<void> {
    for (let i = 0; i < number; i++) {
      await this.fixedMonthlyPointAmountPlusButton.click();
      await this.page.waitForTimeout(100);
    }
  }

  async decreaseTheFXMonthlyAmountBy(number: number): Promise<void> {
    for (let i = 0; i < number; i++) {
      await this.fixedMonthlyPointAmountMinusButton.click();
      await this.page.waitForTimeout(100);
    }
  }

  async enterThePointAmount(number: number): Promise<void> {
    await this.fixedMonthlyInputBox.clear();
    await this.fixedMonthlyInputBox.fill(number.toString());
    await this.fixedMonthlyInputBox.blur();
  }

  async getTheCurrentAmountInFixedInputBox(): Promise<number> {
    const value = await this.fixedMonthlyInputBox.inputValue();
    return parseInt(value) || 0;
  }

  async getTheCurrentAmountInVariableInputBox(): Promise<number> {
    const value = await this.variableMonthlyInputBox.inputValue();
    return parseInt(value) || 0;
  }

  async validateTheManagerAllowanceElements(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.headerTitle);
    await this.verifier.verifyTheElementIsVisible(this.headerDescription1);
    await this.verifier.verifyTheElementIsVisible(this.headerDescription2);
    await this.verifier.verifyTheElementIsVisible(this.fixedMonthlyAllowanceRadioButton);
    await this.verifier.verifyTheElementIsVisible(this.variableMonthlyAllowanceRadioButton);
    await this.verifier.verifyTheElementIsVisible(this.fixedMonthlyInputBox);
    await this.verifier.verifyTheElementIsVisible(this.variableMonthlyInputBox);
  }

  async addTheVariableAmount(number: number): Promise<void> {
    await this.variableMonthlyInputBox.clear();
    await this.variableMonthlyInputBox.fill(number.toString());
    await this.variableMonthlyInputBox.blur();
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
