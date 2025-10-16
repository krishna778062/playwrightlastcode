import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class RewardsPeerGifting extends BasePage {
  readonly peerGiftingHeading: Locator;
  readonly peerGiftingPanel: Locator;
  readonly peerGiftingToggleSwitch: Locator;
  readonly saveButton: Locator;

  // Disable Peer Gifting dialog
  readonly disableDialog: Locator;
  readonly disableDialogTitle: Locator;
  readonly disableDialogConfirmText: Locator;
  readonly disableDialogDescriptionText: Locator;
  readonly disableDialogCancelButton: Locator;
  readonly disableDialogDisableButton: Locator;

  // Enable Peer Gifting dialog
  readonly grantAllowancesDialog: Locator;
  readonly grantAllowancesRadioImmediately: Locator;
  readonly grantAllowancesRadioNextMonth: Locator;
  readonly grantAllowancesConfirmButton: Locator;

  // Disabled rewards Locators
  readonly disableRewardOptionsContainer: Locator;
  readonly disabledRewardPeerGiftingContainer: Locator;
  readonly disabledRewardAddPeerGiftingButton: Locator;
  readonly disabledRewardEditPeerGiftingButton: Locator;
  readonly disabledRewardRewardsBudgetContainer: Locator;
  readonly disabledRewardAddBudgetButton: Locator;
  readonly disabledRewardEditBudgetButton: Locator;
  readonly disabledRewardCurrencyConversionContainer: Locator;

  constructor(page: Page) {
    super(page, '/manage/recognition/rewards/peer-gifting');

    this.peerGiftingHeading = page.locator('h2[class*="Typography-module__heading1"]');
    this.peerGiftingPanel = page.locator('div[class*="PeerGifting_panel"]');
    this.peerGiftingToggleSwitch = this.peerGiftingPanel.locator('button[class*="ToggleInput-module__root"]');
    this.saveButton = page.locator('//button[text()="Save"]');

    // Disable dialog
    this.disableDialog = page.locator('div[role="dialog"][aria-modal="true"]');
    this.disableDialogTitle = this.disableDialog.locator('h2 span:text("Disable peer gifting")');
    this.disableDialogConfirmText = this.disableDialog.locator(
      'p:text("Are you sure you want to disable peer gifting?")'
    );
    this.disableDialogDescriptionText = this.disableDialog.locator(
      'p:text("Users will lose their monthly allowances")'
    );
    this.disableDialogCancelButton = this.disableDialog.locator('button:text("Cancel")');
    this.disableDialogDisableButton = this.disableDialog.locator('button:text("Disable")');

    // Enable dialog
    this.grantAllowancesDialog = page.locator('div[role="dialog"][aria-modal="true"]');
    this.grantAllowancesRadioImmediately = this.grantAllowancesDialog.locator(
      'label[for="peerGifting_grantAllowancesimmediately"] input'
    );
    this.grantAllowancesRadioNextMonth = this.grantAllowancesDialog.locator(
      'label[for="peerGifting_grantAllowancesmonthBeginning"] input'
    );
    this.grantAllowancesConfirmButton = this.grantAllowancesDialog.locator('button:text("Confirm")');
    this.grantAllowancesCancelButton = this.grantAllowancesDialog.locator('button:text("Cancel")');

    // Error messages
    this.addGiftingOptionsAndAllowancesError = page.locator(
      'text="You need to add gifting options and allowances to enable peer gifting"'
    );
    this.addGiftingOptionsError = page.locator('text="You need to add gifting options to enable peer gifting"');
    this.addAllowancesError = page.locator('text="You need to add allowances to enable peer gifting"');
    this.giftingOptionsRequiredError = page.locator('[data-testid="gifting-options-required"]');
    this.allowancesRequiredError = page.locator('[data-testid="allowances-required"]');

    // Panels and status indicators
    this.giftingOptionsPanel = page.locator('[data-testid="gifting-options-panel"]');
    this.allowancePanel = page.locator('[data-testid="allowance-panel"]');
    this.giftingOptionGreenTick = page.locator('[data-testid="gifting-options-green-tick"]');
    this.allowanceGreenTick = page.locator('[data-testid="allowance-green-tick"]');
    this.giftingOptionIcon = page.locator('[data-testid="gifting-options-icon"]');
    this.AllowanceIcon = page.locator('[data-testid="allowance-icon"]');
    this.grantAllowanceBoxDescription = page.locator('[data-testid="grant-allowance-description"]');

    // Disabled rewards locators
    this.disableRewardOptionsContainer = page.locator('div[class*="Panel-module__panel"]').nth(1);
    this.disabledRewardPeerGiftingContainer = this.disableRewardOptionsContainer
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(0);
    this.disabledRewardAddPeerGiftingButton = this.disabledRewardPeerGiftingContainer.locator(
      'a[aria-label="Add peer gifting"]'
    );
    this.disabledRewardEditPeerGiftingButton = this.disabledRewardPeerGiftingContainer.locator(
      'a[aria-label="Edit peer gifting"]'
    );

    this.disabledRewardRewardsBudgetContainer = this.disableRewardOptionsContainer
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1);
    this.disabledRewardAddBudgetButton = this.disabledRewardRewardsBudgetContainer.locator(
      'button[aria-label="Add rewards budget"]'
    );
    this.disabledRewardEditBudgetButton = this.disabledRewardRewardsBudgetContainer.locator(
      'button[aria-label="Edit rewards budget"]'
    );
    this.disabledRewardCurrencyConversionContainer = this.disableRewardOptionsContainer
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.peerGiftingHeading, {
      assertionMessage: 'Verify the Peer Gifting page is loaded',
    });
  }

  async selectThePeerGiftingEnableType(
    frequency: 'Immediately' | 'From the beginning of the next month'
  ): Promise<void> {
    if (frequency === 'Immediately') {
      if (!(await this.grantAllowancesRadioImmediately.isChecked())) {
        await this.grantAllowancesRadioImmediately.click();
      }
    } else if (frequency === 'From the beginning of the next month') {
      if (!(await this.grantAllowancesRadioNextMonth.isChecked())) {
        await this.grantAllowancesRadioNextMonth.click();
      }
    }
  }

  async disableThePeerGifting(): Promise<void> {
    await this.goToUrl('/manage/recognition/rewards/peer-gifting');
    await this.peerGiftingHeading.waitFor({ state: 'visible', timeout: 20000 });
    await this.peerGiftingToggleSwitch.click();
    await this.saveButton.click();
    await expect(this.disableDialog).toBeVisible();
    await expect(this.disableDialogTitle).toHaveText('Disable peer gifting');
    await expect(this.disableDialogConfirmText).toHaveText('Are you sure you want to disable peer gifting?');
    await expect(this.disableDialogDescriptionText).toHaveText(
      'Users will lose their monthly allowances and will no longer be able to gift points via peer recognition.'
    );
    await expect(this.disableDialogCancelButton).toBeVisible();
    await expect(this.disableDialogDisableButton).toBeVisible();
    await this.disableDialogDisableButton.click();
    await this.verifyToastMessageIsVisibleWithText('Saved changes successfully');
  }

  async enableThePeerGifting(): Promise<void> {
    await this.peerGiftingHeading.waitFor({ state: 'visible', timeout: 20000 });
    await this.peerGiftingToggleSwitch.click();
    await this.saveButton.click();
    await this.selectThePeerGiftingEnableType('Immediately');
    await this.grantAllowancesConfirmButton.click();
    await this.verifyToastMessageIsVisibleWithText('Saved changes successfully');
    await this.goToUrl('/manage/recognition/rewards/overview');
  }

  // Additional locators for error messages and panels
  readonly addGiftingOptionsAndAllowancesError: Locator;
  readonly addGiftingOptionsError: Locator;
  readonly addAllowancesError: Locator;
  readonly giftingOptionsRequiredError: Locator;
  readonly allowancesRequiredError: Locator;
  readonly giftingOptionsPanel: Locator;
  readonly allowancePanel: Locator;
  readonly giftingOptionGreenTick: Locator;
  readonly allowanceGreenTick: Locator;
  readonly giftingOptionIcon: Locator;
  readonly AllowanceIcon: Locator;
  readonly grantAllowanceBoxDescription: Locator;
  readonly grantAllowancesCancelButton: Locator;

  /**
   * Mock peer gifting API response
   */
  async mockThePeerGiftingApiResponse(
    peerGiftingEnabled: boolean,
    hasAllowances: boolean,
    hasGiftingOptions: boolean
  ): Promise<void> {
    await this.page.route('**/recognition/admin/rewards/config/peer', async route => {
      const mockResponse = {
        peerGiftingEnabled,
        hasAllowances,
        hasGiftingOptions,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    });
  }

  /**
   * Remove peer gifting API mock
   */
  async removePeerGiftingApiMock(): Promise<void> {
    await this.page.unroute('**/recognition/admin/rewards/config/peer');
  }

  async clickOnDisabledRewardsAddEditPeerGiftingButton() {
    await this.disabledRewardPeerGiftingContainer.waitFor({ state: 'attached', timeout: 15000 });
    if (await this.verifier.verifyTheElementIsVisible(this.disabledRewardAddPeerGiftingButton)) {
      await this.clickOnElement(this.disabledRewardAddPeerGiftingButton);
    } else if (await this.verifier.verifyTheElementIsVisible(this.disabledRewardEditPeerGiftingButton)) {
      await this.clickOnElement(this.disabledRewardEditPeerGiftingButton);
    } else {
      throw new Error('Neither Add Budget nor Edit Peer Gifting button is visible.');
    }
  }
}
