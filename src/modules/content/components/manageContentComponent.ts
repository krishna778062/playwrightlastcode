import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageContentComponent extends BaseComponent {
  readonly clickOnContent: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.clickOnContent = page.locator('[aria-label="Select"]').first();
  }
}
