import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class OptionMenuComponent extends BaseComponent {
  readonly optionMenuDropdown: Locator;
  readonly ellipsisButton: Locator;
  readonly mustReadButton: Locator;

  constructor(page: Page) {
    super(page);
    this.optionMenuDropdown = page.getByRole('button', { name: 'Category option' });
    this.ellipsisButton = page.locator('button[aria-label="Category option"]').first();
    this.mustReadButton = page.getByRole('button', { name: "Make 'must read'" });
  }

  /**
   * Clicks on the option menu dropdown button
   */
  async clickOnOptionMenuButton(): Promise<void> {
    await this.clickOnElement(this.optionMenuDropdown);
  }

  async verifyMustReadButtonIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.mustReadButton);
  }
}
