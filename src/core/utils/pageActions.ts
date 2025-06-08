import { Locator, Page, test } from '@playwright/test';
import { TIMEOUTS } from '@core/constants/timeouts';

export enum ElementState {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  ATTACHED = 'attached',
  DETACHED = 'detached',
}

export class PageActions {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for an element to be in a specific state
   * @param selectorOrLocator - The selector or locator to wait for
   * @param options - The options for the wait
   * @param options.expectedState - The expected state of the element
   * @param options.timeout - The timeout for the wait
   */
  async waitForElementToBe(
    selectorOrLocator: string | Locator,
    options: {
      expectedState: ElementState;
      timeout?: number;
    }
  ) {
    const { expectedState, timeout } = options;
    const timeoutInMs = timeout ? timeout : TIMEOUTS.DEFAULT;
    await test.step(`Waiting for ${selectorOrLocator} to be ${expectedState}`, async () => {
      if (typeof selectorOrLocator === 'string') {
        await this.page.waitForSelector(selectorOrLocator, {
          state: expectedState,
          timeout: timeoutInMs,
        });
      } else {
        await selectorOrLocator.waitFor({ state: expectedState, timeout: timeoutInMs });
      }
    });
  }

  /**
   * Checks if an element is visible
   * @param locator - The locator to check
   * @param options - The options for the check
   * @param options.timeout - The timeout for the check
   * @param options.expectedState - The expected state of the element
   * @returns True if the element is visible, false otherwise
   */
  async isElementVisible(
    locator: Locator,
    options: { timeout?: number; expectedState: ElementState }
  ): Promise<boolean> {
    const { timeout, expectedState } = options;
    const timeoutInMs = timeout ? timeout : TIMEOUTS.MEDIUM;
    let isVisible = false;
    await test.step(`Checking if ${locator} is visible`, async () => {
      try {
        await locator.waitFor({ state: expectedState, timeout: timeoutInMs });
        isVisible = true;
      } catch (error) {
        isVisible = false;
      }
    });
    return isVisible;
  }
}
