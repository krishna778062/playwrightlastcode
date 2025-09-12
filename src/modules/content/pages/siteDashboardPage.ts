import { expect, Page, test } from '@playwright/test';

import { SiteManager } from '../managers/SiteManager';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifySiteNameIs: (siteName: string) => Promise<void>;
  verifyDashboardUrl: (siteId: string) => Promise<void>;
}

export class SiteDashboardPage extends BasePage implements ISiteDashboardAssertions {
  private readonly siteManager: SiteManager;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.getSiteDashboardPage(siteId));
    this.siteManager = new SiteManager(page, siteId);
  }

  /**
   * Gets the site manager for accessing common site functionality
   */
  getSiteManager(): SiteManager {
    return this.siteManager;
  }

  // Assertions
  get assertions(): ISiteDashboardAssertions {
    return this;
  }

  /**
   * Verifies that the site dashboard page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      const addContentButton = this.siteManager.getNavigation().siteHeaderElements.addContentButton;
      await this.verifier.verifyTheElementIsVisible(addContentButton);
    });
  }

  /**
   * Verifies the site name is displayed in the heading
   * @param siteName - The expected site name
   */
  async verifySiteNameIs(siteName: string): Promise<void> {
    await this.siteManager.verifySiteName(siteName);
  }

  /**
   * Verifies that the current URL matches the expected site dashboard URL
   * @param siteId - The site ID to verify in the URL
   */
  async verifyDashboardUrl(siteId: string): Promise<void> {
    await test.step(`Verify dashboard URL matches expected URL for site ID: ${siteId}`, async () => {
      const expectedUrl = PAGE_ENDPOINTS.getSiteDashboardPage(siteId);
      const currentUrl = this.page.url();

      await expect(this.page, `Current URL: ${currentUrl} should match expected URL: ${expectedUrl}`).toHaveURL(
        expectedUrl
      );
    });
  }
}
