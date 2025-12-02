import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class OptionMenuComponent extends BaseComponent {
  readonly optionMenuDropdown: Locator;
  readonly ellipsisButton: Locator;
  readonly mustReadButton: Locator;
  readonly removeFromHomeCarouselButton: Locator;
  readonly removeFromSiteCarouselButton: Locator;

  constructor(page: Page) {
    super(page);
    this.optionMenuDropdown = page.getByRole('button', { name: 'Category option' });
    this.ellipsisButton = page.locator('button[aria-label="Category option"]').first();
    this.mustReadButton = page.getByRole('button', { name: "Make 'must read'" });
    this.removeFromHomeCarouselButton = page.getByRole('button', { name: 'Remove from home carousel' });
    this.removeFromSiteCarouselButton = page.getByRole('button', { name: 'Remove from site carousel' });
  }

  /**
   * Clicks on the option menu dropdown button
   */
  async clickOnOptionMenuButton(): Promise<void> {
    await this.clickOnElement(this.optionMenuDropdown);
  }
  async clickOnRemoveFromHomeCarouselButton(): Promise<void> {
    await this.clickOnElement(this.removeFromHomeCarouselButton);
  }
  async clickOnRemoveFromSiteCarouselButton(): Promise<void> {
    await this.clickOnElement(this.removeFromSiteCarouselButton);
  }
}
