import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AddSiteScreenComponent extends BaseComponent {
  readonly addSiteHeading: Locator;
  readonly browseButton: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.addSiteHeading = page.getByRole('heading', { name: 'Add site' });
    this.browseButton = page.getByRole('button', { name: 'Browse' });
  }
}
