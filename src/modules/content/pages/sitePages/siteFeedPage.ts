import { Page, test } from '@playwright/test';

import { BaseSitePage } from '@/src/modules/content/pages/sitePages/baseSite';

/**
 * A Site has many pages.
 * This class is for managing the Site Feed page.
 */
export class SiteFeedPage extends BaseSitePage {
  constructor(page: Page, siteId: string) {
    super(page, siteId);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site feed page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
    });
  }
}
