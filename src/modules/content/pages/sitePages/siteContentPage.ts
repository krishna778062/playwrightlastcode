import { Page } from '@playwright/test';

/**
 * A Site has many pages.
 * This class is for managing the Site Content page.
 */
export class SiteContentPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  // Additional methods related to the Site Content can be added here
}
