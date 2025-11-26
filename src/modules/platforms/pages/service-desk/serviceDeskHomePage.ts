import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

/**
 * Service Desk Home Page Object Model
 * Verifies Support option visibility on home page
 */
export class ServiceDeskHomePage extends BasePage {
  private readonly supportOption: Locator;

  constructor(page: Page) {
    super(page, '/home');
    // Support option in navigation
    this.supportOption = page.getByText('Support', { exact: false });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Home page is loaded', async () => {
      await expect(this.page.locator('h1')).toContainText('Home', { timeout: TIMEOUTS.SHORT });
    });
  }

  async navigateToHome(): Promise<void> {
    await test.step('Navigate to Home page', async () => {
      const serviceDeskUrl = process.env.SERVICE_DESK_URL;
      if (!serviceDeskUrl) {
        throw new Error('SERVICE_DESK_URL not configured in environment variables');
      }
      await this.page.goto(`${serviceDeskUrl}/home`, { waitUntil: 'domcontentloaded' });
      await this.verifyThePageIsLoaded();
    });
  }

  async verifySupportOptionNotVisible(): Promise<void> {
    await test.step('Verify Support option is not visible', async () => {
      await expect(this.supportOption).not.toBeVisible();
    });
  }

  async verifySupportOptionIsVisible(): Promise<void> {
    await test.step('Verify Support option is visible', async () => {
      await expect(this.supportOption).toBeVisible();
    });
  }
}
