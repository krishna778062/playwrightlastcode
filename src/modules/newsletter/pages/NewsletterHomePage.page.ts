import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS as newsletterEndpoints, PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class NewsletterHomePagePage extends BasePage {
  private readonly searchInput: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_NEWSLETTER_PAGE);
    this.searchInput = this.page.locator('input[id="search"]');
  }

  async loadPage(): Promise<void> {
    await this.page.goto(newsletterEndpoints.MANAGE_NEWSLETTER_PAGE);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      timeout: 20000,
      assertionMessage: ' Newsletter Home page is not loaded properly ',
    });
    return Promise.resolve(undefined);
  }
}
