import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
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
  async clickOnRemoveFromHomeCarouselButton(carouselItemId: string): Promise<void> {
    await test.step('Click on remove from home carousel button and wait for API call', async () => {
      const deleteResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.removeFromHomeCarouselButton),
        response =>
          response.url().includes(API_ENDPOINTS.content.deleteHomeCarouselItem(carouselItemId)) &&
          response.request().method() === 'DELETE' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      await deleteResponse.finished();
    });
  }

  async clickOnRemoveFromSiteCarouselButton(siteId: string, carouselItemId: string): Promise<void> {
    await test.step('Click on remove from site carousel button and wait for API call', async () => {
      const deleteResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.removeFromSiteCarouselButton),
        response =>
          response.url().includes(API_ENDPOINTS.site.deleteCarouselItem(siteId, carouselItemId)) &&
          response.url().includes('/carousel/items/') &&
          response.request().method() === 'DELETE' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      await deleteResponse.finished();
    });
  }
  async verifyMustReadButtonIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.mustReadButton);
  }
}
