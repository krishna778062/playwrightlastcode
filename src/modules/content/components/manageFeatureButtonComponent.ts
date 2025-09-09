import test, { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageFeatureButtonComponent extends BaseComponent {
  readonly contentButton: Locator;

  constructor(page: Page) {
    super(page);
    this.contentButton = page.locator("[data-testid='landing-page-item']:has-text('Content')").first();
  }

  async clickContentButton(): Promise<void> {
    await test.step(`Clicking on the content button`, async () => {
      await this.clickOnElement(this.contentButton);
    });
  }
}
