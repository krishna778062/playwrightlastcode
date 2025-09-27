import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class SiteDashboardComponent extends BaseComponent {
  readonly verfiyFeedSection: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.verfiyFeedSection = page.locator('[id="defaultToastContainer"]').first();
  }
}
