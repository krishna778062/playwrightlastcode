import { Page } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

/**
 * Helper class for common page operations in Data Engineering tests
 */
export class PageHelper {
  /**
   * Waits for the loading dots indicator to disappear from the page
   * This is commonly used after navigation or data refresh operations
   *
   * @param page - Playwright page object
   * @param timeout - Optional timeout in milliseconds (defaults to TIMEOUTS.LONG)
   *
   * @example
   * await PageHelper.waitForLoadingToComplete(page);
   */
  static async waitForLoadingToComplete(page: Page, timeout: number = TIMEOUTS.LONG): Promise<void> {
    await page.waitForSelector("//div[@class='LoadingDots']", {
      state: 'detached',
      timeout,
    });
  }
}
