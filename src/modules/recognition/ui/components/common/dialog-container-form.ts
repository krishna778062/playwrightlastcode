import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class DialogContainerForm extends BasePage {
  readonly dialogContainer: Locator;
  readonly dialogAwardTextBox: Locator;
  readonly dialogAwardDescTextBox: Locator;
  readonly dialogAddBadgeButton: Locator;
  readonly dialogUploadBadgeInput: Locator;
  readonly dialogAddButton: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogUpdateButton: Locator;
  readonly dialogDeactivateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dialogContainer = page.locator('[role="dialog"]');
    this.dialogAwardTextBox = this.dialogContainer.locator('#awardName');
    this.dialogAwardDescTextBox = this.dialogContainer.locator('#description');
    this.dialogAddBadgeButton = this.dialogContainer.getByLabel('Upload', { exact: true });
    this.dialogUploadBadgeInput = this.dialogContainer.locator('input[type="file"]');
    this.dialogAddButton = this.dialogContainer.getByRole('button', { name: 'Add' });
    this.dialogCancelButton = this.dialogContainer.getByRole('button', { name: 'Cancel' });
    this.dialogUpdateButton = this.dialogContainer.getByRole('button', { name: 'Update' });
    this.dialogDeactivateButton = this.dialogContainer.getByRole('button', { name: 'Deactivate' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.dialogContainer);
  }
}
