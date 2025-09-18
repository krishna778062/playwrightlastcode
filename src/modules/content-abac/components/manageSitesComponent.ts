import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageSitesComponent extends BaseComponent {
  readonly addSite: Locator;
  readonly contentTab: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.addSite = page.getByRole('link', { name: 'Add site' });
    this.contentTab = page.locator('a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]');
  }
}
