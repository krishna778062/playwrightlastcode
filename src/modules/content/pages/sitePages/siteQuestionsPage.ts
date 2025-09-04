import { Page } from '@playwright/test';

/**
 * A Site has many pages.
 * This class is for managing the Site Questions page.
 */
export class SiteQuestionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  // Additional methods related to the Site Questions can be added here
}
