import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ManageFeatureComponent extends BaseComponent {
  readonly contentCard: Locator;
  readonly sitesCard: Locator;
  readonly manageFeatureHeading: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.contentCard = this.page.locator('#page-content').getByRole('link', { name: 'Content', exact: true });
    this.sitesCard = this.page.locator('#page-content').getByRole('link', { name: 'Sites', exact: true });
    this.manageFeatureHeading = page.getByRole('heading', { name: 'Manage features' });
  }
}
