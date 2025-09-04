import { Page } from '@playwright/test';

export class SiteDashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  // Additional methods related to the Site Dashboard can be added here
}
