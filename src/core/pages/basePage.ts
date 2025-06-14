import { Page, test } from '@playwright/test';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '../utils/baseActionUtil';
import { BaseVerificationUtil } from '../utils/baseVerificationUtil';

export abstract class BasePage extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;
  readonly pageUrl: string;
  constructor(page: Page, pageUrl?: string) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);
    this.pageUrl = pageUrl || '';
  }

  /**
   * @description
   * Every page should have a method to verify that the page is loaded
   * It could be custom and can be defined as per page boundaries
   * @example
   * To say login page is loaded, I can verify that the login button is visible
   * To say home page is loaded, I can verify that the home page title is visible
   */
  abstract verifyThePageIsLoaded(): Promise<void>;

  /**
   * @description
   * Loads the page
   * @param options - The options to pass to the loadPage method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @param options.timeout - The timeout to pass to the page.goto method
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
   * @param options - The options to pass to the reloadPage method
   * @param options.stepInfo - The step info to pass to the test.step method
   */
  async reloadPage() {
    await test.step(`Reloading page ${this.pageUrl}`, async () => {
      await this.navigateTo(this.pageUrl);
    });
  }

  /**
   * Navigates to the page
   * @param givenPageUrl - The page URL to navigate to.
   */
  async navigateToPage(givenPageUrl: string) {
    await test.step(`Navigating to page ${givenPageUrl}`, async () => {
      await this.navigateTo(givenPageUrl);
    });
  }
}
