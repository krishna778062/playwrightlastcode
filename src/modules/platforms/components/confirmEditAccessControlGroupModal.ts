import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class ConfirmEditAccessControlGroupModalComponent extends BaseComponent {
  modalDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.modalDialog = page.locator('[class*="athena"]').filter({ hasText: 'Edit access control group' });
  }

  /**
   * Verifies that the confirm edit access control group modal is visible
   */
  async verifyModalDialog(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.modalDialog);
  }

  /**
   * Clicks the continue button on the confirm edit access control group modal
   */
  async clickContinueButton(): Promise<void> {
    await this.clickOnElement(this.modalDialog.getByRole('button', { name: 'Continue' }));
  }

  /**
   * Clicks the cancel button on the confirm edit access control group modal
   */
  async clickCancelButton(): Promise<void> {
    await this.clickOnElement(this.modalDialog.getByRole('button', { name: 'Cancel' }));
  }

  /**
   * Clicks the close button on the confirm edit access control group modal
   */
  async clickCloseButton(): Promise<void> {
    await this.clickOnElement(this.modalDialog.getByRole('button', { name: 'Close' }));
  }
}
