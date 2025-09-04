import { Page } from '@playwright/test';

/**
 * A Site has many pages.
 * This class is for managing the Site Manage Site page.
 */
export class SiteManageSitePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  // Additional methods related to the Site Manage Site can be added here
}
