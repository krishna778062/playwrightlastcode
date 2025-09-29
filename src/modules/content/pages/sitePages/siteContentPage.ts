import { Page, test } from '@playwright/test';

import { BaseSitePage } from '@/src/modules/content/pages/sitePages/baseSite';

/**
 * A Site has many pages.
 * This class is for managing the Site Content page.
 */
export class SiteContentPage extends BaseSitePage {
  constructor(page: Page, siteId: string) {
    super(page, siteId);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site content page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      // Add specific content page verification logic here
    });
  }
}
