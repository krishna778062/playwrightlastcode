import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class DialogBox extends BasePage {
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogDescription: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogConfirmButton: Locator;
  readonly dialogCloseButton: Locator;

  // Additional properties for compatibility with tests
  readonly container: Locator;
  readonly title: Locator;
  readonly descriptionText: Locator;
  readonly inputBox: Locator;
  readonly inputBoxError: Locator;
  readonly confirmButton: Locator;
  readonly skipButton: Locator;

  constructor(page: Page) {
    super(page);

    this.dialog = page.locator('[role="dialog"]');
    this.dialogTitle = this.dialog.locator('[data-testid="dialog-title"]');
    this.dialogDescription = this.dialog.locator('[data-testid="dialog-description"]');
    this.dialogCancelButton = this.dialog.locator('button[data-testid="dialog-cancel"]');
    this.dialogConfirmButton = this.dialog.locator('button[data-testid="dialog-confirm"]');
    this.dialogCloseButton = this.dialog.locator('button[data-testid="dialog-close"]');

    // Additional locators for compatibility
    this.container = this.dialog;
    this.title = this.dialogTitle;
    this.descriptionText = this.dialogDescription;
    this.inputBox = this.dialog.locator('input[type="text"]');
    this.inputBoxError = this.dialog.locator('[data-testid="input-error"]');
    this.confirmButton = this.dialogConfirmButton;
    this.skipButton = this.dialog.locator('button[data-testid="skip-button"]');
  }

  async clickCancel(): Promise<void> {
    await this.dialogCancelButton.click();
  }

  async clickConfirm(): Promise<void> {
    await this.dialogConfirmButton.click();
  }

  async clickClose(): Promise<void> {
    await this.dialogCloseButton.click();
  }

  async verifyDialogIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.dialog);
  }

  async verifyDialogTitle(expectedTitle: string): Promise<void> {
    await this.verifier.verifyElementHasText(this.dialogTitle, expectedTitle);
  }

  async verifyDialogDescription(expectedDescription: string): Promise<void> {
    await this.verifier.verifyElementHasText(this.dialogDescription, expectedDescription);
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
