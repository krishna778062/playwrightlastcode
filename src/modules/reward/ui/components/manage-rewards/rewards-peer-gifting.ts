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
}
