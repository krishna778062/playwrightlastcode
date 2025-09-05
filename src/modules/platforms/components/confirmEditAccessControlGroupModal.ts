import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';

export class ConfirmEditAccessControlGroupModalComponent extends BaseComponent {
  modalDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.modalDialog = page.locator('[class*="athena"]').filter({ hasText: 'Edit access control group' });
  }

  async verifyModalDialog(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.modalDialog);
  }

  async clickContinueButton(): Promise<void> {
    await this.clickOnElement(this.modalDialog.getByRole('button', { name: 'Continue' }));
  }

  async clickCancelButton(): Promise<void> {
    await this.clickOnElement(this.modalDialog.getByRole('button', { name: 'Cancel' }));
  }

  async clickCloseButton(): Promise<void> {
    await this.clickOnElement(this.modalDialog.getByRole('button', { name: 'Close' }));
  }
}
