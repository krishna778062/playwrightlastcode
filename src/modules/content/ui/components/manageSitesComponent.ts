import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ManageSitesComponent extends BaseComponent {
  readonly clickOnSite: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnSite = page.getByRole('cell', { name: 'Name' });
  }
}
