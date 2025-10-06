import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageSitesComponent extends BaseComponent {
  readonly addSite: Locator;
  readonly contentTab: Locator;
  readonly selectSite: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.addSite = page.getByRole('link', { name: 'Add site' });
    this.contentTab = page.getByTestId('content-tab');
    this.selectSite = page.getByRole('cell', { name: 'Name' });
  }
}
