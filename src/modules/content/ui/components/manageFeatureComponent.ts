import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ManageFeatureComponent extends BaseComponent {
  readonly clickOnContentCard: Locator;
  readonly clickOnSitesCard: Locator;
  readonly manageFeatureHeading: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnContentCard = page.getByRole('button', { name: 'Content', exact: true });
    this.clickOnSitesCard = page.getByRole('menuitem', { name: 'Sites Sites' });
    this.manageFeatureHeading = page.getByRole('heading', { name: 'Manage features' });
  }
}
