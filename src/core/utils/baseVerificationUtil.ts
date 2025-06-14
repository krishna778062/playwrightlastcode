import { expect, Locator, Page } from '@playwright/test';

export class BaseVerificationUtil {
  constructor(readonly page: Page) {
    this.page = page;
  }

  async verifyTheElementIsVisible(locator: Locator, message?: string): Promise<boolean> {
    try {
      await expect(locator, message ?? `expecting ${locator} to be visible`).toBeVisible();
      return true;
    } catch (error) {
      //if we want we can take screenshot here
      throw new Error(
        message ? `${message}\n${error}` : `Verification failed: Element not visible.\n${error}`
      );
    }
  }

  async verifyTheElementIsNotVisible(locator: Locator, message?: string) {
    try {
      await expect(locator, message ?? `expecting ${locator} to be not visible`).toBeHidden();
    } catch (error) {
      throw new Error(
        message ? `${message}\n${error}` : `Verification failed: Element visible.\n${error}`
      );
    }
  }

  async verifyTheElementIsEnabled(locator: Locator, message?: string) {
    try {
      await expect(locator, message ?? `expecting ${locator} to be enabled`).toBeEnabled();
    } catch (error) {
      throw new Error(
        message ? `${message}\n${error}` : `Verification failed: Element not enabled.\n${error}`
      );
    }
  }

  async verifyCountOfElementsIsEqualTo(locator: Locator, count: number, message?: string) {
    try {
      await expect(
        locator,
        message ?? `expecting ${locator} to have ${count} elements`
      ).toHaveCount(count);
    } catch (error) {
      throw new Error(
        message ? `${message}\n${error}` : `Verification failed: Element count mismatch.\n${error}`
      );
    }
  }
}
