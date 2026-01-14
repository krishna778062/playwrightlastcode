import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui';

import { TIMEOUTS } from '@/src/core';

export class EditLabelModal extends BasePage {
  private container: Locator;
  private title: Locator;
  private closeButton: Locator;
  private cancelButton: Locator;
  private saveButton: Locator;
  private customLabel: Locator;
  private customLabelToggleSwitch: Locator;
  private customLabelInputBox: Locator;
  private customLabelForAllLanguageCheckbox: Locator | undefined;
  private manualTranslationDisabledAlert: Locator;
  private resetAllTranslationToAutomatic: Locator;
  private otherLanguageCustomInputBox: Locator;
  private otherLanguageCustomLabel: Locator;
  private manualTranlationToggerSwitch: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.locator('[role="dialog"][data-state="open"]');
    this.title = this.container.locator('[data-testid="edit-form-dialog-title"]');
    this.closeButton = this.container.locator(
      'button[aria-label="Close edit program name & manage translations dialog"]'
    );
    this.cancelButton = this.container.getByRole('button', { name: 'Cancel' });
    this.saveButton = this.container.getByRole('button', { name: 'Save' });

    this.customLabel = this.container.locator('[data-slot="form-label"][for="default-language-name"]');
    this.customLabelToggleSwitch = this.container.locator('[data-testid="default-language-name-switch"]');
    this.customLabelInputBox = this.container.locator('input[data-testid="default-language-name-input"]');
    this.manualTranslationDisabledAlert = this.container.locator('[role="alert"][aria-live="polite"]');

    this.resetAllTranslationToAutomatic = this.container.locator(
      '//button[text()="Reset all translations to automatic"]'
    );

    this.otherLanguageCustomInputBox = this.container.locator('input[name="languageValues"]');
    this.otherLanguageCustomLabel = this.container.locator('label[data-slot="form-label"]');
    this.manualTranlationToggerSwitch = this.container.locator('button[data-testid*="-toggle"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.container, {
      timeout: TIMEOUTS.VERY_SHORT,
      stepInfo: 'Verify Edit Label modal is loaded',
    });
  }

  async getTheTitleOfTheModal(): Promise<string | null> {
    return await this.title.innerText();
  }

  getCloseButton() {
    return this.closeButton;
  }

  getSaveButton() {
    return this.saveButton;
  }

  getCancelButton() {
    return this.cancelButton;
  }

  getCustomLabel() {
    return this.customLabel;
  }

  getCustomLabelToggleSwitch() {
    return this.customLabelToggleSwitch;
  }

  getCustomLabelInputBox() {
    return this.customLabelInputBox;
  }

  getCustomLabelForAllLanguageCheckbox(option: string): Locator {
    this.customLabelForAllLanguageCheckbox = this.container.getByRole('checkbox', {
      name: `Use the ${option} for all languages`,
    });
    return this.customLabelForAllLanguageCheckbox;
  }

  getManualTranslationDisabledAlert() {
    return this.manualTranslationDisabledAlert;
  }

  getResetAllTranslationToAutomatic(): Locator {
    return this.resetAllTranslationToAutomatic;
  }

  getOtherLanguageCustomInputBox(index?: number) {
    return index === undefined ? this.otherLanguageCustomInputBox : this.otherLanguageCustomInputBox.nth(index);
  }

  getOtherLanguageCustomLabel(index?: number) {
    return index === undefined ? this.otherLanguageCustomLabel : this.otherLanguageCustomLabel.nth(index);
  }

  getManualTranslationToggleSwitch(index?: number) {
    return index === undefined ? this.manualTranlationToggerSwitch : this.manualTranlationToggerSwitch.nth(index);
  }
}
