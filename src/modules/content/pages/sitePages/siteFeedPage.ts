import { Page } from '@playwright/test';

/**
 * A Site has many pages.
 * This class is for managing the  Site Feed page.
 */
export class SiteFeedPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  // Additional methods related to the Site Feed can be added here
}
