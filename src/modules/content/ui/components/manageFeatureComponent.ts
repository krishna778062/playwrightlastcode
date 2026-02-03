import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ManageFeatureComponent extends BaseComponent {
  readonly contentCard: Locator;
  readonly sitesCard: Locator;
  readonly manageFeatureHeading: Locator;
  readonly insideSiteCard: Locator;
  readonly socialCampaignCard: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.contentCard = this.page.locator('#page-content').getByRole('link', { name: 'Content', exact: true });
    this.sitesCard = this.page.getByRole('menuitem', { name: 'Sites' });
    this.manageFeatureHeading = page.getByRole('heading', { name: 'Manage features' });
    this.insideSiteCard = this.page.locator('#page-content').getByRole('link', { name: 'Sites' });
    this.socialCampaignCard = this.page.locator('#page-content').getByRole('link', { name: 'Social campaigns' });
  }
}
