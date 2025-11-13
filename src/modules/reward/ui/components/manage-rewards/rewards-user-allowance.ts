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
    super(page, '/manage/recognition/rewards/peer-gifting/allowances/user');

    this.userAllowance = page.locator('div[class*="PanelActionItem_layout"]').first();
    this.userAllowanceIcon = this.userAllowance.locator('i[data-testid="i-addUserMulti"]');
    this.userAllowanceGreenTick = this.userAllowance.locator('div[class*="PanelActionItem_check"]');
    this.userAllowanceHeading = this.userAllowance.getByRole('heading', { name: 'Users allowance' });
    this.userAllowanceDescription = this.userAllowance.getByText('Add a monthly allowance for');
    // Action buttons
    this.addUserAllowance = this.userAllowance.getByRole('link', { name: 'Add users allowance' });
    this.removeUserAllowance = this.userAllowance.getByRole('button', { name: 'Remove users allowance' });
    this.editUserAllowance = this.userAllowance.getByRole('link', { name: 'Edit users allowance' });

    // User allowance page
    this.pageContainer = this.page.locator('div[data-testid="pageContainer-page"]');
    this.userAllowancePageNeutralBox = page.locator(
      '[class*="UserAllowances_flexCenter"] div[class*="Panel-module__panel"]'
    );
    this.userAllowanceBoxMessageLine1 = this.userAllowancePageNeutralBox.locator('p:nth-child(1)');
    this.userAllowanceBoxMessageLine2 = this.userAllowancePageNeutralBox.locator('p:nth-child(2)');
    this.currencyConversionInfoIcon = page.locator('button[aria-label="Currency conversion information"]');
    this.pointAmountInputBox = page.locator('#pointAmount');
    this.pointAmountMinusButton = page.locator('[aria-label="Minus"]');
    this.pointAmountPlusButton = page.locator('[aria-label="Plus"]');
    this.pointAmountLimitError = page.locator('div[class*="Field-module__error"] p');
  }

  async visitToUserAllowanceSetupPage(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances/user');
    await this.verifier.waitUntilElementIsVisible(this.pointAmountInputBox);
  }

  async increaseTheUserAmountBy(amount: number): Promise<void> {
    await this.pointAmountInputBox.clear();
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.pointAmountPlusButton, {
        stepInfo: `Increasing amount by 1 (${i + 1}/${amount})`,
      });
    }
  }

  async decreaseTheUserAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.pointAmountMinusButton, {
        stepInfo: `Decreasing amount by 1 (${i + 1}/${amount})`,
      });
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

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.userAllowanceBoxMessageLine2);
  }
}
