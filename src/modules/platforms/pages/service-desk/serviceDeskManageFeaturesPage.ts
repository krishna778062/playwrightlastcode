import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

/**
 * Service Desk Manage Features Page Object Model
 * Path: /manage-features
 */
export class ServiceDeskManageFeaturesPage extends BasePage {
  private readonly serviceDeskOption: Locator;

  constructor(page: Page) {
    super(page, '/manage-features');
    // More specific locator for Service desk in External applications section
    this.serviceDeskOption = page.getByRole('button', { name: 'Service desk' });
  }

  /**
   * Navigate to Manage Features page
   */
  async navigateToManageFeatures(): Promise<void> {
    await test.step('Navigate to Manage Features', async () => {
      const serviceDeskUrl = process.env.SERVICE_DESK_URL;
      if (!serviceDeskUrl) {
        throw new Error('SERVICE_DESK_URL not configured in environment variables');
      }
      await this.page.goto(`${serviceDeskUrl}/manage-features`, { waitUntil: 'domcontentloaded' });
      // Wait for page content to render
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {
        // Fallback if networkidle times out - page might still be loading but content is visible
      });
    });
  }

  /**
   * Verify Service Desk option is NOT visible
   */
  async verifyServiceDeskNotVisible(): Promise<void> {
    await test.step('Verify Service Desk option is not visible', async () => {
      await expect(this.serviceDeskOption).not.toBeVisible();
    });
  }

  /**
   * Verify Service Desk option IS visible
   */
  async verifyServiceDeskIsVisible(): Promise<void> {
    await test.step('Verify Service Desk option is visible', async () => {
      await expect(this.serviceDeskOption).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Not needed for this test - kept for BasePage compatibility
  }
}
