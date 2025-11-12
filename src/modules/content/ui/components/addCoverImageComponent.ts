import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddCoverImageComponent extends BaseComponent {
  readonly tabsOptions: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Locator;
  readonly openMediaManagerDialog: Locator;
  readonly intranetMediaManagerModal: Locator;

  constructor(page: Page) {
    super(page);
    this.tabsOptions = (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => page.getByRole('tab', { name: tab });
    this.openMediaManagerDialog = page.getByRole('button', { name: 'Open media manager dialog' });
    this.intranetMediaManagerModal = page
      .getByRole('dialog')
      .filter({ hasText: /Media Manager|Intranet File Manager/i });
  }

  /**
   * Verifies that the specified tab is visible in the cover image modal
   * @param tab - The tab name to verify ('Upload', 'Browse', 'URL', or 'Unsplash')
   */
  async verifyCoverImageModalTabIsVisible(tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash'): Promise<void> {
    await test.step(`Verify ${tab} tab is visible in cover image modal`, async () => {
      const tabLocator = this.tabsOptions(tab);
      await this.verifier.verifyTheElementIsVisible(tabLocator, {
        assertionMessage: `${tab} tab should be visible`,
      });
    });
  }

  /**
   * Opens the Intranet Media Manager modal from the cover image dialog
   */
  async openIntranetMediaManagerModal(): Promise<void> {
    await test.step('Open Intranet Media Manager modal', async () => {
      await this.verifier.verifyTheElementIsVisible(this.openMediaManagerDialog, {
        assertionMessage: 'Media Manager area should be visible',
      });
      await this.clickOnElement(this.openMediaManagerDialog);
      await this.intranetMediaManagerModal.waitFor({ state: 'visible', timeout: 15000 });
      await this.verifier.verifyTheElementIsVisible(this.intranetMediaManagerModal, {
        assertionMessage: 'Intranet Media Manager modal should be visible',
      });
    });
  }
}
