import { Page, test } from '@playwright/test';

import { SiteManager } from '../../managers/SiteManager';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

/**
 * A Site has many pages.
 * This class is for managing the Site Content page.
 */
export class SiteContentPage extends BasePage {
  private readonly siteManager: SiteManager;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.getSiteContentPage(siteId));
    this.siteManager = new SiteManager(page, siteId);
  }

  /**
   * Gets the site manager for accessing common site functionality
   */
  getSiteManager(): SiteManager {
    return this.siteManager;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site content page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      // Add specific content page verification logic here
    });
  }
}
