import { expect, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

/**
 * OldUxHomePage - Page class for the old/legacy UX home page.
 * Provides a consistent interface for the old UX experience.
 */
export class OldUxHomePage extends BasePage {
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
  }

  async verifyThePageIsLoaded(options?: { timeout?: number }): Promise<void> {
    await test.step('Verifying the old UX home page is loaded', async () => {
      await expect(this.page.locator('h1'), "Expected to find 'Home' in the page title").toContainText('Home', {
        timeout: options?.timeout ?? 35_000,
      });
    });
  }
}
