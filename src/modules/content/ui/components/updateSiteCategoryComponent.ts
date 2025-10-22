import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class UpdateSiteCategoryComponent extends BaseComponent {
  readonly ellipses: Locator;
  readonly cancelOption: Locator;
  readonly openingDropdown: Locator;
  readonly clickOnSaveCategoryOption: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.ellipses = page.locator('[aria-label="Category option"]').first();
    this.cancelOption = page.getByRole('button', { name: 'Cancel' });
    this.openingDropdown = page.locator('#react-select-3-input');
    this.clickOnSaveCategoryOption = page.locator('button:has-text("Save")');
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
      await this.clickOnElement(this.clickOnSaveCategoryOption);
    });
  }
}
