import { Page, test } from '@playwright/test';

import { BaseSitePage } from '@content/ui/pages/sitePages/baseSite';

/**
 * A Site has many pages.
 * This class is for managing the Site Questions page.
 */
export class SiteQuestionsPage extends BaseSitePage {
  constructor(page: Page, siteId: string) {
    super(page, siteId);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site questions page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
    });
  }
}
