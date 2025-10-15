import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export class RewardsIndividualAllowance extends BasePage {
  //Individual allowance
  readonly individualAllowance: Locator;
  readonly individualAllowanceIcon: Locator;
  readonly individualAllowanceGreenTick: Locator;
  readonly individualAllowanceHeading: Locator;
  readonly individualAllowanceDescription: Locator;
  readonly addIndividualAllowance: Locator;
  readonly removeIndividualAllowance: Locator;
  readonly editIndividualAllowance: Locator;
  // Page container
  readonly individualAllowanceContainer: Locator;
  readonly addIndividualButton: Locator;
  readonly recentlyAddedPointAmountInputBox: Locator;
  readonly recentlyAddedUsers: Locator;
  readonly recentlyAddedPointAmountInputPlus: Locator;
  readonly recentlyAddedPointAmountInputMinus: Locator;
  readonly recentlyAddedPointAmountRemove: Locator;
  readonly addedIndividualUser: Locator;
  readonly removeAddedIndividualUser: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // individual Allowance Text Box
  readonly individualAllowancePageNeutralBox: Locator;
  readonly individualAllowanceBoxMessageLine1: Locator;
  readonly individualAllowanceBoxMessageLine2: Locator;
  readonly individualAllowancePNote: Locator;
  private addedSpecificIndividualUser: Locator;

  constructor(page: Page) {
    super(page);

    // Individual allowance elements
    this.individualAllowance = page.locator('[data-testid="individual-allowance"]');
    this.individualAllowanceIcon = page.locator('[data-testid="individual-allowance-icon"]');
    this.individualAllowanceGreenTick = page.locator('[data-testid="individual-allowance-green-tick"]');
    this.individualAllowanceHeading = page.locator('[data-testid="individual-allowance-heading"]');
    this.individualAllowanceDescription = page.locator('[data-testid="individual-allowance-description"]');
    this.addIndividualAllowance = page.locator('[data-testid="add-individual-allowance"]');
    this.removeIndividualAllowance = page.locator('[data-testid="remove-individual-allowance"]');
    this.editIndividualAllowance = page.locator('[data-testid="edit-individual-allowance"]');
    this.individualAllowanceContainer = page.locator('[data-testid="individual-allowance-container"]');
    this.addIndividualButton = page.locator('[data-testid="add-individual-button"]');
    this.recentlyAddedPointAmountInputBox = page.locator('input[data-testid="recently-added-point-amount"]');
    this.recentlyAddedUsers = page.locator('[data-testid="recently-added-users"]');
    this.recentlyAddedPointAmountInputPlus = page.locator('[data-testid="recently-added-point-amount-plus"]');
    this.recentlyAddedPointAmountInputMinus = page.locator('[data-testid="recently-added-point-amount-minus"]');
    this.recentlyAddedPointAmountRemove = page.locator('[data-testid="recently-added-point-amount-remove"]');
    this.addedIndividualUser = page.locator('[data-testid="added-individual-user"]');
    this.removeAddedIndividualUser = page.locator('[data-testid="remove-added-individual-user"]');
    this.saveButton = page.locator('[data-testid="individual-allowance-save-button"]');
    this.cancelButton = page.locator('[data-testid="individual-allowance-cancel-button"]');

    // Neutral box elements
    this.individualAllowancePageNeutralBox = page.locator('[data-testid="individual-allowance-neutral-box"]');
    this.individualAllowanceBoxMessageLine1 = page.locator('[data-testid="individual-allowance-message-line1"]');
    this.individualAllowanceBoxMessageLine2 = page.locator('[data-testid="individual-allowance-message-line2"]');
    this.individualAllowancePNote = page.locator('[data-testid="individual-allowance-p-note"]');
    this.addedSpecificIndividualUser = page.locator('[data-testid="added-specific-individual-user"]');
  }

  async visitIndividualAllowance(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances');
    await this.page.waitForLoadState('networkidle');
  }

  async increaseTheAmountBy(number: number): Promise<void> {
    for (let i = 0; i < number; i++) {
      await this.recentlyAddedPointAmountInputPlus.click();
      await this.page.waitForTimeout(100);
    }
  }

  async decreaseTheAmountBy(number: number): Promise<void> {
    for (let i = 0; i < number; i++) {
      await this.recentlyAddedPointAmountInputMinus.click();
      await this.page.waitForTimeout(100);
    }
  }

  async addOneIndividualUserInTheAllowance(numbers: number): Promise<void> {
    await this.addIndividualButton.click();
    await this.page.waitForTimeout(1000);

    // Select first available user
    const userOption = this.page.locator('[data-testid="user-option"]').first();
    await userOption.click();

    // Set point amount
    await this.recentlyAddedPointAmountInputBox.clear();
    await this.recentlyAddedPointAmountInputBox.fill(numbers.toString());
    await this.recentlyAddedPointAmountInputBox.blur();
  }

  async getTheCurrentAmountForLatestAddedUserInIndividualAllowance(): Promise<number> {
    const value = await this.recentlyAddedPointAmountInputBox.inputValue();
    return parseInt(value) || 0;
  }

  async getTheCurrentAmountForUserInIndividualAllowance(userName: string): Promise<number> {
    const userRow = this.page.locator(`[data-testid="individual-user-row"][data-user-name="${userName}"]`);
    const amountInput = userRow.locator('input[data-testid="user-point-amount"]');
    const value = await amountInput.inputValue();
    return parseInt(value) || 0;
  }

  async validateTheIndividualAllowanceElements(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.individualAllowanceHeading);
    await this.verifier.verifyTheElementIsVisible(this.individualAllowanceDescription);
    await this.verifier.verifyTheElementIsVisible(this.addIndividualButton);
  }

  async setTheIndividualAllowanceForAUser(
    userName: string,
    numbers: number,
    deleteTheExistingRecords: boolean
  ): Promise<void> {
    if (deleteTheExistingRecords) {
      const existingUser = this.page.locator(`[data-testid="individual-user-row"][data-user-name="${userName}"]`);
      if (await existingUser.isVisible()) {
        await existingUser.locator('[data-testid="remove-user-button"]').click();
        await this.page.waitForTimeout(500);
      }
    }

    await this.addOneIndividualUserInTheAllowance(numbers);
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
