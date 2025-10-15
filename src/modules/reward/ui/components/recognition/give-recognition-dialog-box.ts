import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class GiveRecognitionDialogBox extends BasePage {
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogDescription: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogConfirmButton: Locator;
  readonly dialogCloseButton: Locator;
  readonly recipientInput: Locator;
  readonly pointsInput: Locator;
  readonly messageInput: Locator;

  constructor(page: Page) {
    super(page);

    this.dialog = page.locator('[role="dialog"]');
    this.dialogTitle = this.dialog.locator('[data-testid="give-recognition-dialog-title"]');
    this.dialogDescription = this.dialog.locator('[data-testid="give-recognition-dialog-description"]');
    this.dialogCancelButton = this.dialog.locator('button[data-testid="give-recognition-cancel"]');
    this.dialogConfirmButton = this.dialog.locator('button[data-testid="give-recognition-confirm"]');
    this.dialogCloseButton = this.dialog.locator('button[data-testid="give-recognition-close"]');
    this.recipientInput = this.dialog.locator('input[data-testid="recipient-input"]');
    this.pointsInput = this.dialog.locator('input[data-testid="points-input"]');
    this.messageInput = this.dialog.locator('textarea[data-testid="message-input"]');
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

  async enterRecipient(recipient: string): Promise<void> {
    await this.recipientInput.fill(recipient);
  }

  async enterPoints(points: number): Promise<void> {
    await this.pointsInput.fill(points.toString());
  }

  async enterMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
  }
}
