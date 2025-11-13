import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class MediaManagerComponent extends BaseComponent {
  readonly crossIcon: Locator;
  readonly firstImage: Locator;
  readonly attachButton: Locator;
  readonly intranetMediaManagerModal: Locator;
  readonly coverImageModalOptions: Locator;
  constructor(page: Page) {
    super(page);
    this.crossIcon = page.getByRole('button', { name: 'Clear search' });
    this.firstImage = page.locator('[type="radio"]').first();
    this.attachButton = page.getByRole('button', { name: 'Attach' });
    this.intranetMediaManagerModal = page
      .getByRole('dialog')
      .filter({ hasText: /Media Manager|Intranet File Manager/i });
    this.coverImageModalOptions = page.getByRole('dialog').filter({ hasText: /Upload|Browse|URL|Unsplash/i });
  }

  async clickOnCrossIcon(): Promise<void> {
    await test.step('Click on cross icon', async () => {
      await this.clickOnElement(this.crossIcon);
    });
  }

  async selectFirstImage(): Promise<void> {
    await test.step('Select first image', async () => {
      await this.verifier.verifyTheElementIsVisible(this.firstImage, {
        assertionMessage: 'First image should be visible',
      });
      await this.clickOnElement(this.firstImage);
    });
  }
  async clickOnAttachButton(): Promise<void> {
    await test.step('Click on attach button', async () => {
      await this.clickOnElement(this.attachButton);
    });
  }

  async waitForModalsToClose(): Promise<void> {
    await test.step('Wait for modals to close', async () => {
      const isMediaManagerVisible = await this.intranetMediaManagerModal.isVisible().catch(() => false);
      const isCoverImageModalVisible = await this.coverImageModalOptions.isVisible().catch(() => false);

      if (isMediaManagerVisible) {
        await this.intranetMediaManagerModal.waitFor({ state: 'hidden', timeout: 5000 });
      }
      if (isCoverImageModalVisible) {
        await this.coverImageModalOptions.waitFor({ state: 'hidden', timeout: 5000 });
      }
    });
  }
}
