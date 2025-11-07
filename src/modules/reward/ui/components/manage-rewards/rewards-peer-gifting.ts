import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class RewardsPeerGifting extends BasePage {
  readonly peerGiftingHeading: Locator;
  //Peer Gifting Panel
  readonly peerGiftingPanel: Locator;
  readonly peerGiftingIconCircle: Locator;
  readonly peerGiftingIcon: Locator;
  readonly peerGiftingLabels: Locator;
  readonly peerGiftingPanelHeading: Locator;
  readonly peerGiftingPanelDescription: Locator;
  readonly peerGiftingToggle: Locator;
  readonly peerGiftingToggleSwitch: Locator;
  readonly peerGiftingError: Locator;
  readonly saveButton: Locator;

  //Disable Peer Gifting dialog
  readonly disableDialog: Locator;
  readonly disableDialogTitle: Locator;
  readonly disableDialogCloseButton: Locator;
  readonly disableDialogConfirmText: Locator;
  readonly disableDialogDescriptionText: Locator;
  readonly disableDialogCancelButton: Locator;
  readonly disableDialogDisableButton: Locator;

  // Enable Peer Gifting dialog
  readonly grantAllowancesDialog: Locator;
  readonly grantAllowancesDialogTitle: Locator;
  readonly grantAllowancesDialogCloseButton: Locator;
  readonly grantAllowancesDialogDescription: Locator;
  readonly grantAllowancesRadioImmediately: Locator;
  readonly grantAllowancesRadioNextMonth: Locator;
  readonly grantAllowancesRestoredText: Locator;
  readonly grantAllowancesCancelButton: Locator;
  readonly grantAllowancesConfirmButton: Locator;
  readonly grantAllowanceBoxDescription: Locator;

  //error
  readonly addGiftingOptionsAndAllowancesError: Locator;
  readonly addGiftingOptionsError: Locator;
  readonly addAllowancesError: Locator;
  readonly giftingOptionsRequiredError: Locator;
  readonly allowancesRequiredError: Locator;

  readonly giftingOptionsPanel: Locator;
  readonly giftingOptionsTitle: Locator;
  readonly giftingOptionIcon: Locator;
  readonly giftingOptionGreenTick: Locator;
  readonly allowancePanel: Locator;
  readonly allowanceGreenTick: Locator;
  readonly allowanceTitle: Locator;
  readonly allowanceIcon: Locator;

  constructor(page: Page) {
    super(page, '/manage/recognition/rewards/peer-gifting');
    this.peerGiftingHeading = page.locator('h2[class*="Typography-module__heading1"]');
    this.peerGiftingPanel = page.locator('div[class*="PeerGifting_panel"]');
    this.peerGiftingIconCircle = this.peerGiftingPanel.locator('button[class*="PeerGifting_icon"]');
    this.peerGiftingIcon = this.peerGiftingPanel.locator('[data-testid="i-gift""]');
    this.peerGiftingLabels = this.peerGiftingPanel.locator('[class*="PeerGifting_label"]');
    this.peerGiftingPanelHeading = this.peerGiftingLabels.locator('h3');
    this.peerGiftingPanelDescription = this.peerGiftingLabels.locator('p');
    this.peerGiftingToggle = this.peerGiftingPanel.locator('[class*="PeerGifting_toggle"]');
    this.peerGiftingToggleSwitch = this.peerGiftingToggle.locator('button[class*="ToggleInput-module__root"]');
    this.peerGiftingError = this.peerGiftingPanel.locator('[class*="Typography-module__paragraph"]').last();
    this.saveButton = page.locator('//button[text()="Save"]');
    //Disable Peer Gifting dialog
    this.disableDialog = page.locator('div[role="dialog"][aria-modal="true"]');
    this.disableDialogTitle = this.disableDialog.locator('h2 span:text("Disable peer gifting")');
    this.disableDialogCloseButton = this.disableDialog.locator('button[aria-label="Close"]');
    this.disableDialogConfirmText = this.disableDialog.locator(
      'p:text("Are you sure you want to disable peer gifting?")'
    );
    this.disableDialogDescriptionText = this.disableDialog.locator(
      'p:text("Users will lose their monthly allowances")'
    );
    this.disableDialogCancelButton = this.disableDialog.locator('button:text("Cancel")');
    this.disableDialogDisableButton = this.disableDialog.locator('button:text("Disable")');
    // Enable Peer Gifting dialog
    this.grantAllowancesDialog = page.locator('div[role="dialog"][aria-modal="true"]');
    this.grantAllowancesDialogTitle = this.grantAllowancesDialog.locator('h2 span:text("Grant allowances")');
    this.grantAllowancesDialogCloseButton = this.grantAllowancesDialog.locator('button[aria-label="Close"]');
    this.grantAllowancesDialogDescription = this.grantAllowancesDialog.locator(
      'text=Confirm when allowances should be granted.'
    );
    this.grantAllowancesRadioImmediately = this.grantAllowancesDialog.locator(
      'label[for="peerGifting_grantAllowancesimmediately"] input'
    );
    this.grantAllowancesRadioNextMonth = this.grantAllowancesDialog.locator(
      'label[for="peerGifting_grantAllowancesmonthBeginning"] input'
    );
    this.grantAllowancesRestoredText = this.grantAllowancesDialog.locator(
      'text=Users’ allowance balances for the current month will be restored.'
    );
    this.grantAllowancesCancelButton = this.grantAllowancesDialog.locator('button:text("Cancel")');
    this.grantAllowancesConfirmButton = this.grantAllowancesDialog.locator('button:text("Confirm")');
    this.grantAllowanceBoxDescription = this.grantAllowancesDialog.locator(
      '[data-testid="field-Grant allowances"] + div p'
    );
    //error
    this.addGiftingOptionsAndAllowancesError = page.locator(
      'p:text("You need to add gifting options and allowances to enable peer gifting")'
    );
    this.addGiftingOptionsError = page.locator('p:text("You need to add gifting options to enable peer gifting")');
    this.addAllowancesError = page.locator('p:text("You need to add allowances to enable peer gifting")');
    this.giftingOptionsRequiredError = page.locator(
      'div[class*="PanelActionItem_layout"]:nth-child(1) div[class*="PanelActionItem_tag"] p'
    );
    this.allowancesRequiredError = page.locator(
      'div[class*="PanelActionItem_layout"]:nth-child(3) div[class*="PanelActionItem_tag"] p'
    );

    //Gifting Options and Allowances locators
    this.giftingOptionsPanel = page.locator('div[class*="PanelActionItem_layout"]:nth-child(1)');
    this.giftingOptionGreenTick = this.giftingOptionsPanel.locator('[class*="PanelActionItem_check"]');
    this.giftingOptionsTitle = this.giftingOptionsPanel.locator('h3');
    this.giftingOptionIcon = page.locator('[data-testid="i-giftWithSlider"]');
    this.allowancePanel = page.locator('div[class*="PanelActionItem_layout"]:nth-child(3)');
    this.allowanceGreenTick = this.allowancePanel.locator('[class*="PanelActionItem_check"]');
    this.allowanceTitle = this.allowancePanel.locator('h3');
    this.allowanceIcon = page.locator('[data-testid="i-coinsStacked"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsTitle, {
      assertionMessage: 'Verify the Peer Gifting page is loaded',
    });
  }

  async selectThePeerGiftingEnableType(
    frequency: 'Immediately' | 'From the beginning of the next month'
  ): Promise<void> {
    const radio =
      frequency === 'Immediately' ? this.grantAllowancesRadioImmediately : this.grantAllowancesRadioNextMonth;
    const checked = await radio.isChecked();
    if (!checked) {
      await radio.click();
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

  /**
   * Mock peer gifting API response
   */
  async mockThePeerGiftingApiResponse(peerGifting: boolean, giftingOptions: boolean, allowance: boolean) {
    const now = new Date();
    const baseResponse = {
      optionType: 'POINTS',
      options: giftingOptions
        ? [{ amount: 1 }, { amount: 2 }, { amount: 3 }, { amount: 4 }, { amount: 5 }, { amount: 6 }]
        : [],
      peerGiftingEnabled: peerGifting,
      peerGiftingDisabledAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      isPeerGiftingOptionsConfigured: giftingOptions,
      enabled: true, // Keeping Reward enabled as true
      isUserAllowancesConfigured: allowance,
    };
    await this.page.route('**/recognition/admin/rewards/config/peer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(baseResponse),
      });
    });
  }

  /**
   * Remove peer gifting API mock
   */
  async removePeerGiftingApiMock(): Promise<void> {
    await this.page.unroute('**/recognition/admin/rewards/config/peer');
  }
}
