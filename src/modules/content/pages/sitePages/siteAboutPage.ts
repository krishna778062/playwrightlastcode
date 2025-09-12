import { Page, test } from '@playwright/test';

import { SiteManager } from '../../managers/siteManager';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

/**
 * A Site has many pages.
 * This class is for managing the Site About page.
 */
export class SiteAboutPage extends BasePage {
  private readonly siteManager: SiteManager;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.getSiteAboutPage(siteId));
    this.siteManager = new SiteManager(page, siteId);
  }

  /**
   * Gets the site manager for accessing common site functionality
   */
  getSiteManager(): SiteManager {
    return this.siteManager;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site about page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      // Add specific about page verification logic here
    });
  }
}
