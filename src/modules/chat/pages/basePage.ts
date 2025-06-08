import { Page, test } from '@playwright/test';
import { PageActions } from '@/src/core/utils/pageActions';
import { TIMEOUTS } from '@core/constants/timeouts';

export abstract class BasePage {
  readonly page: Page;
  readonly pageUrl: string;
  readonly pageActions: PageActions;
  constructor(page: Page, pageUrl?: string) {
    this.page = page;
    this.pageUrl = pageUrl || '';
    this.pageActions = new PageActions(page);
  }

  abstract verifyThePageIsLoaded(): Promise<void>;

  /**
   * Loads the page
   */
  async loadPage(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Loading page ${this.pageUrl}`, async () => {
      if (this.pageUrl !== '') {
        await this.page.goto(this.pageUrl, {
          waitUntil: 'domcontentloaded',
          timeout: options?.timeout || TIMEOUTS.MEDIUM,
        });
      } else {
        throw new Error('Page URL is not set for this page');
      }
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Reloads the page
   */
  async reloadPage() {
    await test.step(`Reloading page ${this.pageUrl}`, async () => {
      await this.page.reload();
    });
  }

  /**
   * Navigates to the page
   * @param givenPageUrl - The page URL to navigate to.
   */
  async navigateToPage(givenPageUrl: string) {
    await test.step(`Navigating to page ${givenPageUrl}`, async () => {
      await this.page.goto(givenPageUrl);
    });
  }
}
