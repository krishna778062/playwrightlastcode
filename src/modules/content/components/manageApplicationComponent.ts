import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageApplicationComponent extends BaseComponent {
  readonly clickingOnGovernance: Locator;
  readonly manageApplicationHeading: Locator;
  readonly clickingOnPrivileges: Locator;
  readonly clickingOnDefaults: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.clickingOnGovernance = page.getByRole('tab', { name: 'Governance' });
    this.manageApplicationHeading = page.getByRole('heading', { name: 'Manage application' });
    this.clickingOnPrivileges = page.getByRole('tab', { name: 'Privileges' });
    this.clickingOnDefaults = page.getByRole('tab', { name: 'Defaults' });
  }
}
