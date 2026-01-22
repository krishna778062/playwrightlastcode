import { expect, Locator, Page } from '@playwright/test';

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
  readonly crossButton: Locator;
  readonly homeFeedOption: Locator;
  readonly siteFeedOption: Locator;

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
    this.crossButton = this.dialogContainer.getByRole('button', { name: 'Close' });
    this.homeFeedOption = this.dialogContainer.locator('#feedNamehome');
    this.siteFeedOption = this.dialogContainer.locator('#feedNamesite');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.dialogContainer);
  }
  /**
   * Validate visibility of share-on-feed options (e.g., Home Feed, Site Feed) in a dialog.
   * Falls back to a label lookup if a known id is not mapped.
   */
  async checkShareOnFeedOptionVisibility(feedName: string, shouldBeVisible: boolean): Promise<void> {
    const feedOption = this.getShareOnFeedOption(feedName);
    if (shouldBeVisible) {
      await expect(feedOption, `${feedName} option should be visible`).toBeVisible();
    } else {
      await expect(feedOption, `${feedName} option should be hidden`).toBeHidden();
    }
  }

  /**
   * Returns locator for a given feed option; extend mappings if new feeds are added.
   */
  private getShareOnFeedOption(feedName: string): Locator {
    const normalized = feedName.toLowerCase();
    if (normalized.includes('home')) {
      return this.homeFeedOption;
    }
    if (normalized.includes('site')) {
      return this.siteFeedOption;
    }
    return this.dialogContainer.getByLabel(feedName);
  }
}
