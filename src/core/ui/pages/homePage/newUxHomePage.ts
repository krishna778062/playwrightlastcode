import { expect, Page, test } from '@playwright/test';

import { NewHomePage } from '@core/ui/pages/newHomePage';

/**
 * NewUxHomePage - Wrapper class for the new UX home page.
 * Extends NewHomePage to provide a consistent interface for the new UX experience.
 */
export class NewUxHomePage extends NewHomePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyThePageIsLoaded(options?: { timeout?: number }): Promise<void> {
    await test.step('Verifying the new UX home page is loaded', async () => {
      await expect(this.page.locator('h1'), "Expected to find 'Home' in the page title").toContainText('Home', {
        timeout: options?.timeout ?? 35_000,
      });
    });
  }
}
