import { Page } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';

/**
 * A Site has many pages.
 * This class is for managing the Site About page.
 */
export class SiteAboutPage extends BasePage {
  verifyThePageIsLoaded(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  constructor(page: Page) {
    super(page);
  }
  // Additional methods related to the Site About can be added here
}
