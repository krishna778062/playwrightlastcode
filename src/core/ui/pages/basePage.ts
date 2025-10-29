import { expect, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export abstract class BasePage extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;
  readonly pageUrl: string;
  constructor(page: Page, pageUrl?: string) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);
    this.pageUrl = pageUrl || '';
  }

  // Convenience method for direct Playwright expect access
  get expect() {
    return expect;
  }

  get url() {
    if (this.pageUrl === '') {
      console.log('Page URL is not set for this page, returning current page URL');
      return this.page.url();
    }
    return this.pageUrl;
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
   * @param options - The options to pass to the visitPage method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @param options.timeout - The timeout to pass to the page.goto method
   */
  async loadPage(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Loading page ${this.pageUrl}`, async () => {
      if (this.pageUrl !== '') {
        await this.goToUrl(this.pageUrl);
      } else {
        throw new Error('Page URL is not set for this page');
      }
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * @description
   * Reloads the page
   * @param options - The options to pass to the visitPage method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @param options.timeout - The timeout to pass to the page.goto method
   */
  async reloadPage(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Reloading page`, async () => {
      await this.page.reload();
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * @description
   * Checks for Page not found error
   */
  async verifyPageNotFoundVisibility(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Verify the page - Page not found`, async () => {
      await expect(this.page.locator('h1', { hasText: 'Page not found' })).toBeVisible({
        timeout: options?.timeout || TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * @description
   * Checks for Access Denied error page
   */
  async verifyAccessDeniedPageVisibility(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Verify the page - Access Denied`, async () => {
      await this.expect(this.page.locator('h1', { hasText: 'Access denied' })).toBeVisible();
      await this.expect(
        this.page
          .locator('[class*="no-results"] div')
          .filter({ hasText: 'You are not authorized to access this resource, please contact your administrator.' })
      ).toBeVisible();
    });
  }
}
