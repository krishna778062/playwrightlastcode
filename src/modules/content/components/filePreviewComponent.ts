import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class FilePreviewComponent extends BaseComponent {
  readonly previewModal: Locator;
  readonly showMoreButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.previewModal = this.page.locator('div[class*="imagePreviewContainer"]');
    this.showMoreButton = this.page.locator('i[data-testid="i-more"]');
    this.deleteButton = this.page.locator('div').filter({ hasText: 'Delete' });
    this.confirmDeleteButton = this.page.locator('button').filter({ hasText: 'Delete' });
  }

  /**
   * Verifies that the file preview modal is opened
   */
  async verifyPreviewModalIsOpened(): Promise<void> {
    await test.step('Verify file preview modal is opened', async () => {
      await this.verifier.verifyTheElementIsVisible(this.previewModal, {
        assertionMessage: 'File preview modal should be visible',
      });
    });
  }

  /**
   * Clicks the delete button in the preview
   */
  async clickDeleteButton(): Promise<void> {
    await test.step('Click delete button in preview', async () => {
      await this.clickOnElement(this.deleteButton);
      await this.verifier.verifyTheElementIsVisible(this.confirmDeleteButton, {
        assertionMessage: 'Confirm modal should be visible',
      });
      await this.clickOnElement(this.confirmDeleteButton);
    });
  }

  async clickShowMoreButton(): Promise<void> {
    await test.step('Click show more button in preview', async () => {
      await this.clickOnElement(this.showMoreButton);
    });
  }
}
