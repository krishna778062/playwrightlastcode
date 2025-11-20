import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

import { API_ENDPOINTS } from '@/src/core';

export class UpdateSiteCategoryComponent extends BaseComponent {
  readonly ellipses: Locator;
  readonly cancelOption: Locator;
  readonly openingDropdown: Locator;
  readonly clickOnSaveCategoryOption: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.ellipses = page.locator('[aria-label="Category option"]').first();
    this.cancelOption = page.getByRole('button', { name: 'Cancel' });
    this.openingDropdown = page.getByRole('dialog').getByRole('combobox');
    this.clickOnSaveCategoryOption = page.getByRole('button', { name: 'Save' });
  }

  async clickOnCancelOption(): Promise<void> {
    await test.step('Clicking on cancel option', async () => {
      await this.hoverOverElementInJavaScript(this.ellipses);
      await this.clickOnElement(this.cancelOption);
    });
  }

  async updatingCategoryToUncategorized(categoryName: string): Promise<void> {
    await test.step('Updating category to Uncategorized', async () => {
      await this.clickOnElement(this.openingDropdown);
      await this.fillInElement(this.openingDropdown, categoryName);
      await this.page.keyboard.press('Enter');
      await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.clickOnSaveCategoryOption, { delay: 2_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.site.updateCategory) &&
          response.request().method() === 'PUT' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
    });
  }
}
