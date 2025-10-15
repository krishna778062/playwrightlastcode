import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export class RewardsUserAllowance extends BasePage {
  readonly userAllowance: Locator;
  readonly userAllowanceIcon: Locator;
  readonly userAllowanceGreenTick: Locator;
  readonly userAllowanceHeading: Locator;
  readonly userAllowanceDescription: Locator;
  readonly addUserAllowance: Locator;
  readonly removeUserAllowance: Locator;
  readonly editUserAllowance: Locator;
  readonly userAllowanceBoxMessageLine1: Locator;
  readonly userAllowanceBoxMessageLine2: Locator;
  readonly userAllowancePageNeutralBox: Locator;
  readonly currencyConversionInfoIcon: Locator;
  readonly pointAmountInputBox: Locator;
  readonly pointAmountMinusButton: Locator;
  readonly pointAmountPlusButton: Locator;
  readonly pointAmountLimitError: Locator;
  readonly pageContainer: Locator;

  constructor(page: Page) {
    super(page);

    // User allowance elements
    this.userAllowance = page.locator('[data-testid="user-allowance"]');
    this.userAllowanceIcon = page.locator('[data-testid="user-allowance-icon"]');
    this.userAllowanceGreenTick = page.locator('[data-testid="user-allowance-green-tick"]');
    this.userAllowanceHeading = page.locator('[data-testid="user-allowance-heading"]');
    this.userAllowanceDescription = page.locator('[data-testid="user-allowance-description"]');
    this.addUserAllowance = page.locator('[data-testid="add-user-allowance"]');
    this.removeUserAllowance = page.locator('[data-testid="remove-user-allowance"]');
    this.editUserAllowance = page.locator('[data-testid="edit-user-allowance"]');
    this.userAllowanceBoxMessageLine1 = page.locator('[data-testid="user-allowance-message-line1"]');
    this.userAllowanceBoxMessageLine2 = page.locator('[data-testid="user-allowance-message-line2"]');
    this.userAllowancePageNeutralBox = page.locator('[data-testid="user-allowance-neutral-box"]');
    this.currencyConversionInfoIcon = page.locator('[data-testid="currency-conversion-info-icon"]');
    this.pointAmountInputBox = page.locator('input[data-testid="point-amount-input"]');
    this.pointAmountMinusButton = page.locator('[data-testid="point-amount-minus"]');
    this.pointAmountPlusButton = page.locator('[data-testid="point-amount-plus"]');
    this.pointAmountLimitError = page.locator('[data-testid="point-amount-limit-error"]');
    this.pageContainer = page.locator('[data-testid="user-allowance-page-container"]');
  }

  async visitUserAllowancePage(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances');
    await this.page.waitForLoadState('networkidle');
  }

  async increaseTheAmountBy(number: number): Promise<void> {
    for (let i = 0; i < number; i++) {
      await this.pointAmountPlusButton.click();
      await this.page.waitForTimeout(100);
    }
  }

  async decreaseTheAmountBy(number: number): Promise<void> {
    for (let i = 0; i < number; i++) {
      await this.pointAmountMinusButton.click();
      await this.page.waitForTimeout(100);
    }
  }

  async enterThePointAmount(number: number): Promise<void> {
    await this.pointAmountInputBox.clear();
    await this.pointAmountInputBox.fill(number.toString());
    await this.pointAmountInputBox.blur();
  }

  async getTheCurrentAmountInInputBox(): Promise<number> {
    const value = await this.pointAmountInputBox.inputValue();
    return parseInt(value) || 0;
  }

  async validateTheUsersAllowanceElements(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.userAllowanceHeading);
    await this.verifier.verifyTheElementIsVisible(this.userAllowanceDescription);
    await this.verifier.verifyTheElementIsVisible(this.pointAmountInputBox);
    await this.verifier.verifyTheElementIsVisible(this.pointAmountMinusButton);
    await this.verifier.verifyTheElementIsVisible(this.pointAmountPlusButton);
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
