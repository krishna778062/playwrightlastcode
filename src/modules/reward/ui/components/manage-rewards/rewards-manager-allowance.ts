import { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../../core/ui/pages/basePage';

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

    // Manager allowance elements
    this.managerAllowance = page.locator('[data-testid="manager-allowance"]');
    this.managerAllowanceIcon = page.locator('[data-testid="manager-allowance-icon"]');
    this.managerAllowanceGreenTick = page.locator('[data-testid="manager-allowance-green-tick"]');
    this.managerAllowanceHeading = page.locator('[data-testid="manager-allowance-heading"]');
    this.managerAllowanceDescription = page.locator('[data-testid="manager-allowance-description"]');
    this.addManagerAllowance = page.locator('[data-testid="add-manager-allowance"]');
    this.removeManagerAllowance = page.locator('[data-testid="remove-manager-allowance"]');
    this.editManagerAllowance = page.locator('[data-testid="edit-manager-allowance"]');

    this.fixedCurrencyConversionInfoIcon = page.locator('[data-testid="fixed-currency-conversion-info-icon"]');
    this.variableCurrencyConversionInfoIcon = page.locator('[data-testid="variable-currency-conversion-info-icon"]');

    this.managerAllowanceLabel = page.locator('[data-testid="manager-allowance-label"]');
    this.managerAllowancePageNeutralBox = page.locator('[data-testid="manager-allowance-neutral-box"]');
    this.managerAllowanceBoxMessageLine1 = page.locator('[data-testid="manager-allowance-message-line1"]');
    this.managerAllowanceBoxMessageLine2 = page.locator('[data-testid="manager-allowance-message-line2"]');
    this.managerAllowanceBoxMessageLine3 = page.locator('[data-testid="manager-allowance-message-line3"]');
    this.fixedMonthlyAllowanceRadioButton = page.locator('input[value="fixed"]');
    this.variableMonthlyAllowanceRadioButton = page.locator('input[value="variable"]');
    this.managerAllowancePNote = page.locator('[data-testid="manager-allowance-p-note"]');
    this.fixedMonthlyInput = page.locator('[data-testid="fixed-monthly-input"]');
    this.fixedMonthlyInputBox = page.locator('input[data-testid="fixed-monthly-input-box"]');
    this.fixedMonthlyPointAmountMinusButton = page.locator('[data-testid="fixed-monthly-point-amount-minus"]');
    this.fixedMonthlyPointAmountPlusButton = page.locator('[data-testid="fixed-monthly-point-amount-plus"]');
    this.fixedPointAmountLimitError = page.locator('[data-testid="fixed-point-amount-limit-error"]');
    this.variableMonthlyInput = page.locator('[data-testid="variable-monthly-input"]');
    this.variableMonthlyInputBox = page.locator('input[data-testid="variable-monthly-input-box"]');
    this.variableMonthlyPointAmountMinusButton = page.locator('[data-testid="variable-monthly-point-amount-minus"]');
    this.variableMonthlyPointAmountPlusButton = page.locator('[data-testid="variable-monthly-point-amount-plus"]');
    this.variablePointAmountLimitError = page.locator('[data-testid="variable-point-amount-limit-error"]');
    this.managerAllowancePageVariableNeutralBox = page.locator(
      '[data-testid="manager-allowance-variable-neutral-box"]'
    );
    this.managerAllowanceBoxMessageVariableLine1 = page.locator(
      '[data-testid="manager-allowance-variable-message-line1"]'
    );
    this.managerAllowanceBoxMessageVariableLine2 = page.locator(
      '[data-testid="manager-allowance-variable-message-line2"]'
    );
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
}
