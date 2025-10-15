import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class DialogBox extends BasePage {
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogDescription: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogConfirmButton: Locator;
  readonly dialogCloseButton: Locator;

  constructor(page: Page) {
    super(page);

    this.dialog = page.locator('[role="dialog"]');
    this.dialogTitle = this.dialog.locator('[data-testid="dialog-title"]');
    this.dialogDescription = this.dialog.locator('[data-testid="dialog-description"]');
    this.dialogCancelButton = this.dialog.locator('button[data-testid="dialog-cancel"]');
    this.dialogConfirmButton = this.dialog.locator('button[data-testid="dialog-confirm"]');
    this.dialogCloseButton = this.dialog.locator('button[data-testid="dialog-close"]');
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
}
