import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class BaseVerificationUtil {
  constructor(readonly page: Page) {
    this.page = page;
  }

  /**
   * Verifies that the element is visible
   * @param locator - The locator to verify
   * @param message - The message to display if the verification fails
   * @returns True if the element is visible, false otherwise
   */
  async verifyTheElementIsVisible(
    locator: Locator,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ): Promise<boolean> {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to be visible`).toBeVisible({
        timeout: options?.timeout || TIMEOUTS.VERY_VERY_LONG,
      });
      return true;
    } catch (error) {
      //if we want we can take screenshot here
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element not visible.\n${error}`
      );
    }
  }

  async isTheElementVisible(
    locator: Locator,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ): Promise<boolean> {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to be visible`).toBeVisible({
        timeout: options?.timeout || TIMEOUTS.VERY_VERY_LONG,
      });
      return true;
    } catch {
      //if we want we can take screenshot here
      return false;
    }
  }

  /**
   * Verifies that the element is not visible
   * @param locator - The locator to verify
   * @param options - The options to pass to the verification
   */
  async verifyTheElementIsNotVisible(
    locator: Locator,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to be not visible`).toBeHidden({
        timeout: options?.timeout || TIMEOUTS.VERY_VERY_LONG,
      });
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element visible.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element is enabled
   * @param locator - The locator to verify
   * @param options - The options to pass to the verification
   */
  async verifyTheElementIsEnabled(
    locator: Locator,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to be enabled`).toBeEnabled();
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element not enabled.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element is enabled
   * @param locator - The locator to verify
   * @param options - The options to pass to the verification
   */
  async verifyTheElementIsChecked(
    locator: Locator,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to be checked`).toBeChecked();
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element not checked.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element is not checked
   * @param locator - The locator to verify
   * @param options - The options to pass to the verification
   */
  async verifyTheElementIsNotChecked(
    locator: Locator,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to be not checked`).not.toBeChecked();
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element is checked.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element is disabled
   * @param locator - The locator to verify
   * @param options - The options to pass to the verification
   */
  async verifyTheElementIsDisabled(
    locator: Locator,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to be disabled`).toBeDisabled();
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element not disabled.\n${error}`
      );
    }
  }

  /**
   * Verifies that the count of elements is equal to the expected count
   * @param locator - The locator to verify
   * @param expectedCount - The expected count of elements
   * @param options - The options to pass to the verification
   */
  async verifyCountOfElementsIsEqualTo(
    locator: Locator,
    expectedCount: number,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(
        locator,
        options?.assertionMessage ?? `expecting ${locator} to have ${expectedCount} elements`
      ).toHaveCount(expectedCount);
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element count mismatch.\n${error}`
      );
    }
  }

  /**
   * Verifies that the count of elements is greater than the minimum count
   * Uses expect polling to enable auto-waiting for the condition to be met
   * @param locator - The locator to verify
   * @param minCount - The minimum count threshold
   * @param options - The options to pass to the verification
   */
  async verifyCountOfElementsIsGreaterThan(
    locator: Locator,
    minCount: number,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(async () => {
        const actualCount = await locator.count();
        expect(
          actualCount,
          options?.assertionMessage ??
            `expecting ${locator} to have more than ${minCount} elements, but found ${actualCount}`
        ).toBeGreaterThan(minCount);
      }).toPass({
        timeout: options?.timeout || 8_000,
      });
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element count not greater than ${minCount}.\n${error}`
      );
    }
  }

  /**
   * Verifies that the count of elements is greater than or equal to the minimum count
   * Uses expect polling to enable auto-waiting for the condition to be met
   * @param locator - The locator to verify
   * @param minCount - The minimum count threshold
   * @param options - The options to pass to the verification
   */
  async verifyCountOfElementsIsGreaterThanOrEqualTo(
    locator: Locator,
    minCount: number,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(async () => {
        const actualCount = await locator.count();
        expect(
          actualCount,
          options?.assertionMessage ??
            `expecting ${locator} to have at least ${minCount} elements, but found ${actualCount}`
        ).toBeGreaterThanOrEqual(minCount);
      }).toPass({
        timeout: options?.timeout || 8_000,
      });
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element count not greater than or equal to ${minCount}.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element contains text
   * @param locator - The locator to verify
   * @param text - The text to verify
   * @param options - The options to pass to the verification
   */
  async verifyElementContainsText(
    locator: Locator,
    text: string,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to contain text ${text}`).toContainText(
        text
      );
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element does not contain text.\n${error}`
      );
    }
  }

  /**
   * Verifies that an input element's value matches the expected text.
   * @param locator - The Playwright Locator for the input element
   * @param text - The expected value of the input
   * @param options - Optional configuration
   *   - timeout: Time to wait for the assertion
   *   - assertionMessage: Custom error message
   */
  async verifyTextOfInputElement(
    locator: Locator,
    text: string,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await this.verifyTheElementIsVisible(locator);
      const inputValue = await locator.inputValue({ timeout: options?.timeout });
      expect(
        inputValue,
        options?.assertionMessage ?? `Expected input value to be '${text}', but got '${inputValue}'`
      ).toBe(text);
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Input element value does not match.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element has text
   * @param locator - The locator to verify
   * @param text - The text to verify
   * @param options - The options to pass to the verification
   */
  async verifyElementHasText(
    locator: Locator,
    text: string | RegExp,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to have text ${text}`).toHaveText(text, {
        timeout: options?.timeout || 8_000,
      });
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element does not have text.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element has the expected attribute value
   * @param locator - The locator to verify
   * @param attributeName - The attribute name to verify
   * @param expectedValue - The expected attribute value
   * @param options - The options to pass to the verification
   */
  async verifyElementHasAttribute(
    locator: Locator,
    attributeName: string,
    expectedValue: string,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(
        locator,
        options?.assertionMessage ??
          `expecting ${locator} to have attribute ${attributeName} with value ${expectedValue}`
      ).toHaveAttribute(attributeName, expectedValue, {
        timeout: options?.timeout || 8_000,
      });
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element does not have expected attribute value.\n${error}`
      );
    }
  }

  /**
   * Waits for the element to be visible
   * @param locator - The locator to wait for
   * @param options - The options to pass to the verification
   */
  async waitUntilElementIsVisible(
    locator: Locator,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ) {
    try {
      await test.step(options?.stepInfo || `Waiting for element to be visible`, async () => {
        await locator.waitFor({
          state: 'visible',
          timeout: options?.timeout || 8_000,
        });
      });
    } catch (error) {
      throw new Error(
        options?.stepInfo ? `${options.stepInfo}\n${error}` : `Waiting for element to be visible failed.\n${error}`
      );
    }
  }

  async verifyElementVisibilityByOpacity(
    locator: Locator,
    options?: {
      timeout?: number;
      stepInfo?: string;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to have opacity 1`).toHaveCSS(
        'opacity',
        '1'
      );
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element not visible.\n${error}`
      );
    }
  }

  /**
   * Waits for the element to be hidden
   * @param locator - The locator to wait for
   * @param options - The options to pass to the verification
   */
  async waitUntilElementIsHidden(
    locator: Locator,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ) {
    try {
      await locator.waitFor({
        state: 'hidden',
        timeout: options?.timeout || 8_000,
      });
    } catch (error) {
      throw new Error(
        options?.stepInfo ? `${options.stepInfo}\n${error}` : `Waiting for element to be hidden failed.\n${error}`
      );
    }
  }

  /**
   * Waits for the element count to be equal to the expected count
   * @param locator - The locator to wait for
   * @param expectedCount - The expected count of elements
   * @param options - The options to pass to the verification
   */
  async waitUntilElementCountIsEqualTo(
    locator: Locator,
    expectedCount: number,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ) {
    await expect(locator, options?.stepInfo ?? `expecting ${locator} to have ${expectedCount} elements`).toHaveCount(
      expectedCount,
      {
        timeout: options?.timeout || 8_000,
      }
    );
  }

  /**
   * Waits for the element count to be greater than the minimum count
   * Uses expect polling to enable auto-waiting for the condition to be met
   * @param locator - The locator to wait for
   * @param minCount - The minimum count threshold
   * @param options - The options to pass to the verification
   */
  async waitUntilElementCountIsGreaterThan(
    locator: Locator,
    minCount: number,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ) {
    await expect(async () => {
      const actualCount = await locator.count();
      expect(
        actualCount,
        options?.stepInfo ?? `expecting ${locator} to have more than ${minCount} elements, but found ${actualCount}`
      ).toBeGreaterThan(minCount);
    }).toPass({
      timeout: options?.timeout || 8_000,
    });
  }

  /**
   * Waits for the element count to be greater than or equal to the minimum count
   * Uses expect polling to enable auto-waiting for the condition to be met
   * @param locator - The locator to wait for
   * @param minCount - The minimum count threshold
   * @param options - The options to pass to the verification
   */
  async waitUntilElementCountIsGreaterThanOrEqualTo(
    locator: Locator,
    minCount: number,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ) {
    await expect(async () => {
      const actualCount = await locator.count();
      expect(
        actualCount,
        options?.stepInfo ?? `expecting ${locator} to have at least ${minCount} elements, but found ${actualCount}`
      ).toBeGreaterThanOrEqual(minCount);
    }).toPass({
      timeout: options?.timeout || 8_000,
    });
  }

  /**
   * Waits for the page to navigate to the expected URL
   * @param url - The URL to wait for
   * @param options - The options to pass to the verification
   */
  async waitUntilPageHasNavigatedTo(
    url: string | RegExp,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ) {
    try {
      await test.step(options?.stepInfo || `Waiting for page to navigate to ${url}`, async () => {
        await this.page.waitForURL(url, {
          timeout: options?.timeout || 10_000,
        });
      });
    } catch (error) {
      throw new Error(
        options?.stepInfo ? `${options.stepInfo}\n${error}` : `Waiting for page to navigate to ${url} failed.\n${error}`
      );
    }
  }

  /**
   * Verifies that the element is in the viewport
   * @param locator - The locator to verify
   * @param options - The options to pass to the verification
   */
  async verifyElementIsInViewport(
    locator: Locator,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ) {
    try {
      await expect(locator, options?.stepInfo ?? `expecting ${locator} to be in viewport`).toBeInViewport({
        timeout: options?.timeout || 8_000,
      });
    } catch (error) {
      throw new Error(
        options?.stepInfo ? `${options.stepInfo}\n${error}` : `Verification failed: Element not in viewport.\n${error}`
      );
    }
  }

  /**
   * Verifies that the checkbox is checked
   * @param locator - The locator to verify
   * @param options - The options to pass to the verification
   */
  async verifyCheckboxIsChecked(
    locator: Locator,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ): Promise<boolean> {
    return await test.step(options?.stepInfo || `Verify that the checkbox is checked`, async () => {
      return await locator.isChecked({
        timeout: options?.timeout || 8_000,
      });
    });
  }

  async verifyElementHasClass(
    locator: Locator,
    className: string | RegExp,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(locator, options?.assertionMessage ?? `expecting ${locator} to have class ${className}`).toHaveClass(
        className,
        {
          timeout: options?.timeout || 8_000,
        }
      );
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element does not have expected class.\n${error}`
      );
    }
  }

  async verifyElementDoesNotHaveClass(
    locator: Locator,
    className: string | RegExp,
    options?: {
      timeout?: number;
      assertionMessage?: string;
    }
  ) {
    try {
      await expect(
        locator,
        options?.assertionMessage ?? `expecting ${locator} to not have class ${className}`
      ).not.toHaveClass(className, {
        timeout: options?.timeout || 8_000,
      });
    } catch (error) {
      throw new Error(
        options?.assertionMessage
          ? `${options.assertionMessage}\n${error}`
          : `Verification failed: Element has unexpected class.\n${error}`
      );
    }
  }
}
