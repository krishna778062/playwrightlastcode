import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddCoverImageComponent extends BaseComponent {
  readonly tabsOptions: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Locator;

  constructor(page: Page) {
    super(page);
    this.tabsOptions = (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => page.getByRole('tab', { name: tab });
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
}
