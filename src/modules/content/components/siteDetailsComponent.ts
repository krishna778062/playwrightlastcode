import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class SiteDetailsComponent extends BaseComponent {
  readonly ViewSite: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.ViewSite = page.getByRole('link', { name: 'View site' });
  }
}
