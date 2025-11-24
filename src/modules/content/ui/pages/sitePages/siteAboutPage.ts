import { Page, test } from '@playwright/test';

import { BaseSitePage } from '@content/ui/pages/sitePages/baseSite';

export class SiteAboutPage extends BaseSitePage {
  constructor(page: Page, siteId: string) {
    super(page, siteId);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site about page is loaded', async () => {
      console.log('Site about page is loaded');
    });
  }
}
