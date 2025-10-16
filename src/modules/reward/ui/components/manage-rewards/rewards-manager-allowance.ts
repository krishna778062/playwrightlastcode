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
  readonly variableCurrencyConversionInfoIcon: Locator;

  readonly managerAllowanceLabel: Locator;
  private managerAllowancePageNeutralBox: Locator;
  readonly managerAllowanceBoxMessageLine1: Locator;
  readonly managerAllowanceBoxMessageLine2: Locator;
  readonly managerAllowanceBoxMessageLine3: Locator;
  readonly fixedMonthlyAllowanceRadioButton: Locator;
  readonly variableMonthlyAllowanceRadioButton: Locator;
  readonly managerAllowancePNote: Locator;
  private fixedMonthlyInput: Locator;
  private fixedMonthlyInputBox: Locator;
  readonly fixedMonthlyPointAmountMinusButton: Locator;
  readonly fixedMonthlyPointAmountPlusButton: Locator;
  readonly fixedPointAmountLimitError: Locator;
  private variableMonthlyInput: Locator;
  private variableMonthlyInputBox: Locator;
  readonly variableMonthlyPointAmountMinusButton: Locator;
  readonly variableMonthlyPointAmountPlusButton: Locator;
  readonly variablePointAmountLimitError: Locator;
  readonly managerAllowancePageVariableNeutralBox: Locator;
  private managerAllowanceBoxMessageVariableLine1: Locator;
  private managerAllowanceBoxMessageVariableLine2: Locator;

  constructor(page: Page) {
    super(page);
    //Manager Allowance
    this.managerAllowance = page.locator('div[class*="PanelActionItem_layout"]').nth(1);
    this.managerAllowanceIcon = this.managerAllowance.locator('i[data-testid="i-orgchartUser"]');
    this.managerAllowanceGreenTick = this.managerAllowance.locator('div[class*="PanelActionItem_check"]');
    this.managerAllowanceHeading = this.managerAllowance.getByRole('heading', { name: 'Manager allowances' });
    this.managerAllowanceDescription = this.managerAllowance.getByText('Add monthly allowances for people managers');
    // Action buttons
    this.addManagerAllowance = this.managerAllowance.locator('button[aria-label="Add manager allowances"]');
    this.removeManagerAllowance = this.managerAllowance.locator('button[aria-label="Remove manager allowances"]');
    this.editManagerAllowance = this.managerAllowance.locator('button[aria-label="Edit manager allowances"]');

    // Manager Allowance page
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
    this.fixedMonthlyInput = page.locator('[class*="NumberInput-module"]');
    this.fixedMonthlyInputBox = this.fixedMonthlyInput.locator('input');
    this.fixedMonthlyPointAmountMinusButton = this.fixedMonthlyInput.locator('[aria-label="Minus"]');
    this.fixedMonthlyPointAmountPlusButton = this.fixedMonthlyInput.locator('[aria-label="Plus"]');

    this.fixedCurrencyConversionInfoIcon = page
      .locator('[class*="Allowances_numberInput"] button[aria-label="Currency conversion information"]')
      .nth(0);
    this.variableCurrencyConversionInfoIcon = page
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
    this.variablePointAmountLimitError = page.locator('[class*="Allowances_numberInput"] p[role="alert"]').nth(1);

    this.variableMonthlyInput = page.locator('[class*="NumberInput-module"]');
    this.variableMonthlyInputBox = this.variableMonthlyInput.locator('input').nth(1);
    this.variableMonthlyPointAmountMinusButton = this.variableMonthlyInput.locator('[aria-label="Minus"]').nth(1);
    this.variableMonthlyPointAmountPlusButton = this.variableMonthlyInput.locator('[aria-label="Plus"]').nth(1);
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
    await this.verifier.verifyTheElementIsVisible(this.managerAllowanceHeading);
    await this.verifier.verifyTheElementIsVisible(this.managerAllowanceDescription);
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
