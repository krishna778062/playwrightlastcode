import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export class RewardsAudienceAllowance extends BasePage {
  //Audience allowance
  readonly audienceAllowance: Locator;
  readonly audienceAllowanceIcon: Locator;
  readonly audienceAllowanceGreenTick: Locator;
  readonly audienceAllowanceHeading: Locator;
  readonly audienceAllowanceDescription: Locator;
  readonly addAudienceAllowance: Locator;
  readonly removeAudienceAllowance: Locator;
  readonly editAudienceAllowance: Locator;
  // Page container
  readonly audienceAllowanceContainer: Locator;
  readonly addAudienceButton: Locator;
  readonly addedAudienceRowInContainer: Locator;
  readonly recentlyAddedIndicator: Locator;
  readonly recentlyAddedPointAmountInputBox: Locator;
  readonly recentlyAddedPointUserCount: Locator;

  //allowance header container
  readonly audienceHeaderContainer: Locator;
  readonly audienceAllowanceDescriptionLine1: Locator;
  readonly audienceAllowanceDescriptionLine2: Locator;
  readonly audienceAllowanceHeadingInContainer: Locator;

  // Audience Allowance Text Box
  readonly audienceAllowancePageNeutralBox: Locator;
  readonly audienceAllowanceBoxMessageLine1: Locator;
  readonly audienceAllowanceBoxMessageLine2: Locator;
  readonly audienceAllowanceBoxMessageLine3: Locator;
  readonly audienceAllowancePNote: Locator;
  private removeAddedAudience: Locator;
  private alreadyAddedAudience: Locator;
  private alreadyAddedAudienceInputBox: Locator;
  private errorTitle: Locator;
  private errorSubtitle: Locator;
  private errorReloadButton: Locator;

  constructor(page: Page) {
    super(page);

    // Audience allowance elements
    this.audienceAllowance = page.locator('[data-testid="audience-allowance"]');
    this.audienceAllowanceIcon = page.locator('[data-testid="audience-allowance-icon"]');
    this.audienceAllowanceGreenTick = page.locator('[data-testid="audience-allowance-green-tick"]');
    this.audienceAllowanceHeading = page.locator('[data-testid="audience-allowance-heading"]');
    this.audienceAllowanceDescription = page.locator('[data-testid="audience-allowance-description"]');
    this.addAudienceAllowance = page.locator('[data-testid="add-audience-allowance"]');
    this.removeAudienceAllowance = page.locator('[data-testid="remove-audience-allowance"]');
    this.editAudienceAllowance = page.locator('[data-testid="edit-audience-allowance"]');
    this.audienceAllowanceContainer = page.locator('[data-testid="audience-allowance-container"]');
    this.addAudienceButton = page.locator('[data-testid="add-audience-button"]');
    this.addedAudienceRowInContainer = page.locator('[data-testid="added-audience-row"]');
    this.recentlyAddedIndicator = page.locator('[data-testid="recently-added-indicator"]');
    this.recentlyAddedPointAmountInputBox = page.locator('input[data-testid="recently-added-point-amount"]');
    this.recentlyAddedPointUserCount = page.locator('[data-testid="recently-added-point-user-count"]');

    // Header container
    this.audienceHeaderContainer = page.locator('[data-testid="audience-header-container"]');
    this.audienceAllowanceDescriptionLine1 = page.locator('[data-testid="audience-allowance-description-line1"]');
    this.audienceAllowanceDescriptionLine2 = page.locator('[data-testid="audience-allowance-description-line2"]');
    this.audienceAllowanceHeadingInContainer = page.locator('[data-testid="audience-allowance-heading-in-container"]');

    // Neutral box elements
    this.audienceAllowancePageNeutralBox = page.locator('[data-testid="audience-allowance-neutral-box"]');
    this.audienceAllowanceBoxMessageLine1 = page.locator('[data-testid="audience-allowance-message-line1"]');
    this.audienceAllowanceBoxMessageLine2 = page.locator('[data-testid="audience-allowance-message-line2"]');
    this.audienceAllowanceBoxMessageLine3 = page.locator('[data-testid="audience-allowance-message-line3"]');
    this.audienceAllowancePNote = page.locator('[data-testid="audience-allowance-p-note"]');
    this.removeAddedAudience = page.locator('[data-testid="remove-added-audience"]');
    this.alreadyAddedAudience = page.locator('[data-testid="already-added-audience"]');
    this.alreadyAddedAudienceInputBox = page.locator('input[data-testid="already-added-audience-input"]');
    this.errorTitle = page.locator('[data-testid="error-title"]');
    this.errorSubtitle = page.locator('[data-testid="error-subtitle"]');
    this.errorReloadButton = page.locator('[data-testid="error-reload-button"]');
  }

  async visitAudienceAllowancePage(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyErrorMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.errorTitle);
    await this.verifier.verifyTheElementIsVisible(this.errorSubtitle);
    await this.verifier.verifyTheElementIsVisible(this.errorReloadButton);
  }

  async addOneAudienceInTheAllowance(numbers: number): Promise<void> {
    await this.addAudienceButton.click();
    await this.page.waitForTimeout(1000);

    // Select first available audience
    const audienceOption = this.page.locator('[data-testid="audience-option"]').first();
    await audienceOption.click();

    // Set point amount
    await this.recentlyAddedPointAmountInputBox.clear();
    await this.recentlyAddedPointAmountInputBox.fill(numbers.toString());
    await this.recentlyAddedPointAmountInputBox.blur();
  }

  async getTheCurrentAmountForLatestAddedAudience(): Promise<number> {
    const value = await this.recentlyAddedPointAmountInputBox.inputValue();
    return parseInt(value) || 0;
  }

  async getTheCurrentUserCountForLatestAddedAudience(): Promise<number> {
    const text = await this.recentlyAddedPointUserCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async validateTheAudienceAllowanceElements(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.audienceAllowanceHeading);
    await this.verifier.verifyTheElementIsVisible(this.audienceAllowanceDescription);
    await this.verifier.verifyTheElementIsVisible(this.addAudienceButton);
  }

  async visitToAllowanceWithInterruption(): Promise<void> {
    // Simulate network interruption
    await this.page.route('**/recognition/admin/rewards/**', route => route.abort());
    await this.visitAudienceAllowancePage();
  }

  async clickOnReloadButtonWithoutAnyInterruption(): Promise<void> {
    await this.page.unroute('**/recognition/admin/rewards/**');
    await this.errorReloadButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
