import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageContentComponent extends BaseComponent {
  readonly clickOnContent: Locator;
  readonly sendFeedback: Locator;
  readonly clickOnViewAll: Locator;
  readonly validationRequiredBarState: Locator;
  readonly openingPanelMenu: Locator;
  readonly clickOnEditButton: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.clickOnContent = page.locator('[aria-label="Select"]').first();
    this.sendFeedback = page.getByRole('button', { name: 'Send feedback' });
    this.clickOnViewAll = page.getByRole('button', { name: 'View all' }).first();
    this.validationRequiredBarState = page.locator('.Stamp').first();
    this.openingPanelMenu = page.locator('[aria-label="Category option"]').first();
    this.clickOnEditButton = page.getByRole('button', { name: 'Edit' });
  }
}
