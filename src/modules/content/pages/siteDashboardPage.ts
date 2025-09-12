import { expect, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BaseSitePage } from './sitePages/baseSitePage';

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifySiteNameIs: (siteName: string, successMessage: string) => Promise<void>;
  verifyDashboardUrl: (siteId: string) => Promise<void>;
}

export class SiteDashboardPage extends BaseSitePage implements ISiteDashboardAssertions {
  constructor(page: Page, siteId: string) {
    super(page, siteId);
  }

  // Assertions
  get assertions(): ISiteDashboardAssertions {
    return this;
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
