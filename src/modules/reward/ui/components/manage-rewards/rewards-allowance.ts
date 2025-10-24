import { Locator, Page } from '@playwright/test';
import { RewardsAudienceAllowance } from '@rewards-components/manage-rewards/rewards-audience-allowance';
import { RewardsIndividualAllowance } from '@rewards-components/manage-rewards/rewards-individual-allowance';
import { RewardsManagerAllowance } from '@rewards-components/manage-rewards/rewards-manager-allowance';
import { RewardsUserAllowance } from '@rewards-components/manage-rewards/rewards-user-allowance';

import { BasePage } from '@core/ui/pages/basePage';

export class RewardsAllowance extends BasePage {
  get rewardsUserAllowance(): RewardsUserAllowance {
    return new RewardsUserAllowance(this.page);
  }

  get rewardsManagerAllowance(): RewardsManagerAllowance {
    return new RewardsManagerAllowance(this.page);
  }

  get rewardsAudienceAllowance(): RewardsAudienceAllowance {
    return new RewardsAudienceAllowance(this.page);
  }

  get rewardsIndividualAllowance(): RewardsIndividualAllowance {
    return new RewardsIndividualAllowance(this.page);
  }

  readonly allowanceHeader: Locator;
  private allowanceBackToAllowancePage: Locator;
  private allowancePageHeading: Locator;
  private allowancePageDescriptionLine1: Locator;
  private allowancePageDescriptionLine2: Locator;
  readonly allowanceDeleteButton: Locator;

  private dialogBoxTitle: Locator;
  private dialogBoxConfirmationTextLine1: Locator;
  private dialogBoxConfirmationTextLine2: Locator;
  private dialogRemoveButton: Locator;
  private successToastContainer: Locator;
  private successToastBoxMessage: Locator;
  private successToastBoxIcon: Locator;
  private successToastBoxClose: Locator;
  private deleteUserAllowanceDialogBox: Locator;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;
  //Monthly allowance illustration
  readonly monthlyAllowanceIllustration: Locator;
  readonly monthlyAllowanceIllustrationDescriptionText: Locator;
  readonly monthlyAllowanceIllustrationIndividualRow: Locator;
  readonly monthlyAllowanceIllustrationIndividualColumn: Locator;
  readonly monthlyAllowanceIllustrationAudienceRow: Locator;
  readonly monthlyAllowanceIllustrationAudienceColumn: Locator;

  constructor(page: Page) {
    super(page);

    // Allowance page elements
    this.allowanceHeader = page.locator('[data-testid="allowance-header"]');
    this.allowanceBackToAllowancePage = page.locator('[data-testid="back-to-allowance-page"]');
    this.allowancePageHeading = page.locator('[data-testid="allowance-page-heading"]');
    this.allowancePageDescriptionLine1 = page.locator('[data-testid="allowance-page-description-line1"]');
    this.allowancePageDescriptionLine2 = page.locator('[data-testid="allowance-page-description-line2"]');
    this.allowanceDeleteButton = page.locator('[data-testid="allowance-delete-button"]');

    // Dialog elements
    this.dialogBoxTitle = page.locator('[data-testid="dialog-box-title"]');
    this.dialogBoxConfirmationTextLine1 = page.locator('[data-testid="dialog-box-confirmation-line1"]');
    this.dialogBoxConfirmationTextLine2 = page.locator('[data-testid="dialog-box-confirmation-line2"]');
    this.dialogRemoveButton = page.locator('[data-testid="dialog-remove-button"]');
    this.deleteUserAllowanceDialogBox = page.locator('[data-testid="delete-user-allowance-dialog"]');

    // Toast elements
    this.successToastContainer = page.locator('[data-testid="success-toast-container"]');
    this.successToastBoxMessage = page.locator('[data-testid="success-toast-message"]');
    this.successToastBoxIcon = page.locator('[data-testid="success-toast-icon"]');
    this.successToastBoxClose = page.locator('[data-testid="success-toast-close"]');

    // Action buttons
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
    this.saveButton = page.locator('[data-testid="save-button"]');

    // Monthly allowance illustration
    this.monthlyAllowanceIllustration = page.locator('[data-testid="monthly-allowance-illustration"]');
    this.monthlyAllowanceIllustrationDescriptionText = page.locator('[data-testid="monthly-allowance-description"]');
    this.monthlyAllowanceIllustrationIndividualRow = page.locator('[data-testid="monthly-allowance-individual-row"]');
    this.monthlyAllowanceIllustrationIndividualColumn = page.locator(
      '[data-testid="monthly-allowance-individual-column"]'
    );
    this.monthlyAllowanceIllustrationAudienceRow = page.locator('[data-testid="monthly-allowance-audience-row"]');
    this.monthlyAllowanceIllustrationAudienceColumn = page.locator('[data-testid="monthly-allowance-audience-column"]');
  }

  async visitAllowancePage(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances');
    await this.verifyThePageIsLoaded();
  }

  async saveAmount(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async validateAllowanceAddAndEditPageHeader(
    headingText: string,
    headingDescriptionLine1: string,
    headingDescriptionLine2: string
  ): Promise<void> {
    await this.verifier.verifyElementHasText(this.allowancePageHeading, headingText);
    await this.verifier.verifyElementHasText(this.allowancePageDescriptionLine1, headingDescriptionLine1);
    await this.verifier.verifyElementHasText(this.allowancePageDescriptionLine2, headingDescriptionLine2);
  }

  async removeTheExistingAllowance(allowanceType: 'user' | 'audience' | 'manager' | 'individual'): Promise<void> {
    let removeButton: Locator;

    switch (allowanceType) {
      case 'user':
        removeButton = this.rewardsUserAllowance.removeUserAllowance;
        break;
      case 'audience':
        removeButton = this.rewardsAudienceAllowance.removeAudienceAllowance;
        break;
      case 'manager':
        removeButton = this.rewardsManagerAllowance.removeManagerAllowance;
        break;
      case 'individual':
        removeButton = this.rewardsIndividualAllowance.removeIndividualAllowance;
        break;
    }

    await removeButton.click();
    await this.page.waitForTimeout(1000);

    // Handle confirmation dialog
    const dialogBox = this.page.locator('[role="dialog"]');
    await this.verifier.verifyTheElementIsVisible(dialogBox);
    await this.dialogRemoveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async validateToastMessage(expectedMessage: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.successToastContainer);
    await this.verifier.verifyElementHasText(this.successToastBoxMessage, expectedMessage);
    await this.page.waitForTimeout(2000);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.rewardsUserAllowance.userAllowanceHeading, {
      timeout: 15000,
    });
  }

  /**
   * Build the response payload object (pure function — useful for unit testing / generating all combinations).
   * - userAllowance/managerAllowance/audienceAllowance/individualAllowance: boolean | null | undefined
   *   - truthy => include that type in results
   *   - falsy (false / null / undefined) => exclude
   */
  async buildAllowanceResponse(
    userAllowance?: boolean,
    managerAllowance?: boolean,
    audienceAllowance?: boolean,
    individualAllowance?: boolean
  ) {
    // push in a consistent order (matches your "all" example ordering if all true)
    const results: Array<{ type: string }> = [];

    if (individualAllowance) results.push({ type: 'INDIVIDUAL' });
    if (audienceAllowance) results.push({ type: 'AUDIENCE' });
    if (userAllowance) results.push({ type: 'USER' });
    if (managerAllowance) results.push({ type: 'MANAGER' });

    if (results.length === 0) {
      return { results: [] }; // matches your "if all null" example (no total)
    }

    return { results, total: results.length };
  }

  /**
   * Playwright route-based mock.
   *
   * Usage:
   *   await this.mockTheAllowances(true, false, false, null);
   *
   * Parameters:
   *  - userAllowance, managerAllowance, audienceAllowance, individualAllowance:
   *      boolean | null | undefined
   */
  async mockTheAllowances(
    userAllowance?: boolean,
    managerAllowance?: boolean,
    audienceAllowance?: boolean,
    individualAllowance?: boolean
  ) {
    // prepare the payload once (so we can JSON.stringify it inside route.fulfill)
    const payload = await this.buildAllowanceResponse(
      userAllowance,
      managerAllowance,
      audienceAllowance,
      individualAllowance
    );
    await this.page.route('**/recognition/admin/rewards/allowances/monthly', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });

    // reload to trigger the request that will be served by the mocked route
    await this.page.reload();
    await this.verifyThePageIsLoaded();
  }

  async mockTheRewardAPI(key: string, value: any) {
    console.log(`Mocking API with key: ${key}, value: ${value}`);

    // Mock the main tenant config API that contains reward configuration
    await this.page.route('**/recognition/v1/tenant/config', async route => {
      const mockResponse = {
        rewardConfig: {
          enabled: true,
          peerGiftingEnabled: true,
          hasAllowances: true,
          hasGiftingOptions: true,
          [key]: value,
          // Add distribution status if the key is isDistributingAllowance
          ...(key === 'isDistributingAllowance' && { isDistributingAllowance: value }),
        },
        // Add other expected properties
        tenantId: 'test-tenant',
        features: {
          rewards: true,
          peerGifting: true,
        },
      };

      console.log('Mocking /recognition/v1/tenant/config with:', JSON.stringify(mockResponse, null, 2));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    });

    // Also mock the admin rewards config endpoint
    await this.page.route('**/recognition/admin/rewards/config', async route => {
      const mockResponse = {
        enabled: true,
        peerGiftingEnabled: true,
        hasAllowances: true,
        hasGiftingOptions: true,
        [key]: value,
        // Add distribution status if the key is isDistributingAllowance
        ...(key === 'isDistributingAllowance' && { isDistributingAllowance: value }),
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    });

    // Mock the peer gifting config endpoint
    await this.page.route('**/recognition/admin/rewards/config/peer', async route => {
      const mockResponse = {
        peerGiftingEnabled: true,
        hasAllowances: true,
        hasGiftingOptions: true,
        [key]: value,
        // Add distribution status if the key is isDistributingAllowance
        ...(key === 'isDistributingAllowance' && { isDistributingAllowance: value }),
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    });
  }

  /**
   * Remove all API mocks
   */
  async removeRewardAPIMocks(): Promise<void> {
    await this.page.unroute('**/recognition/v1/tenant/config');
    await this.page.unroute('**/recognition/admin/rewards/config');
    await this.page.unroute('**/recognition/admin/rewards/config/peer');
  }
}
