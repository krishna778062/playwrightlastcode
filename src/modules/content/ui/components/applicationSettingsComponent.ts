import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ApplicationSettingsComponent extends BaseComponent {
  readonly clickOnApplication: Locator;
  readonly pageHeading: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.clickOnApplication = page.getByRole('button', { name: 'Application' });
    this.pageHeading = page.getByRole('heading', { name: 'Application settings' });
  }
}
