import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ChangeLayoutComponent extends BaseComponent {
  readonly includeFeed: Locator;
  readonly doneButton: Locator;
  readonly recommendationFeedButton: Locator;
  readonly recommendedFeedExcludeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.includeFeed = this.page.getByRole('checkbox', { name: 'Checkbox' });
    this.doneButton = this.page.getByRole('dialog').getByRole('button', { name: 'Done' });
    this.recommendationFeedButton = this.page.getByRole('radio', { name: 'Recommended Feed' });
    this.recommendedFeedExcludeButton = this.page.getByRole('radio', { name: 'Recommended' });
  }

  async clickIncludeFeed(): Promise<void> {
    await test.step('Click on include feed checkbox', async () => {
      const isChecked = await this.includeFeed.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.includeFeed);
        await this.recommendationFeedButton.check();
        await this.clickOnElement(this.doneButton);
      } else {
        await this.clickOnElement(this.doneButton);
      }
    });
  }

  async clickExcludeFeed(): Promise<void> {
    await test.step('Click on exclude feed checkbox', async () => {
      const isChecked = await this.includeFeed.isChecked();
      if (isChecked) {
        await this.clickOnElement(this.includeFeed);
        await this.recommendedFeedExcludeButton.check();
        await this.clickOnElement(this.doneButton);
      } else {
        await this.clickOnElement(this.doneButton);
      }
    });
  }
}
