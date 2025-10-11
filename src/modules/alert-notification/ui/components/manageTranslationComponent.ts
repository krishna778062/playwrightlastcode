import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class ManageTranslationComponent extends BaseComponent {
  readonly languageDropdown: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.languageDropdown = page.locator('[class*="NewLanguagePicker-module-dropdownMenuButton"]');
  }

  /**
   * Verifies the manage translation component is loaded
   */
  async verifyManageTranslationComponentIsLoaded(): Promise<void> {
    await test.step('Verify manage translation component is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.languageDropdown, {
        assertionMessage: 'Language dropdown should be visible',
      });
    });
  }
}
