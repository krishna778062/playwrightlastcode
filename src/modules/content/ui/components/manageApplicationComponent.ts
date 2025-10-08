import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ManageApplicationComponent extends BaseComponent {
  readonly clickingOnGovernance: Locator;
  readonly manageApplicationHeading: Locator;
  readonly clickingOnPrivileges: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.clickingOnGovernance = page.getByRole('tab', { name: 'Governance' });
    this.manageApplicationHeading = page.getByRole('heading', { name: 'Manage application' });
    this.clickingOnPrivileges = page.getByRole('tab', { name: 'Privileges' });
  }
}
