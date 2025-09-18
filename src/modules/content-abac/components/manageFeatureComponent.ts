import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageFeatureComponent extends BaseComponent {
  readonly clickOnSitesCard: Locator;
  readonly manageFeatureHeading: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnSitesCard = page.getByRole('menuitem', { name: 'Sites Sites' });
    this.manageFeatureHeading = page.getByRole('heading', { name: 'Manage features' });
  }
}
