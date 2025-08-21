import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class SiteDashboardPage extends BasePage {
  readonly addContentButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addContentButton = page.locator("button[title='Add content']");
  }

  /**
   * Verifies the site dashboard page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.verifier.verifyTheElementIsVisible(this.addContentButton);
    });
  }

  /**
   * Clicks on the add content button
   */
  async clickOnAddContent(): Promise<void> {
    await test.step('Click on add content button', async () => {
      await this.clickOnElement(this.addContentButton);
    });
  }
}
