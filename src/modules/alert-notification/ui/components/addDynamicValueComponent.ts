import { Locator, Page, test } from '@playwright/test';

import { DYNAMIC_VALUE_TEXT } from '../../tests/test-data/notification-customization.test-data';

import { BaseActionUtil, BaseVerificationUtil } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class AddDynamicValueComponent {
  readonly page: Page;
  readonly verifier: BaseVerificationUtil;
  readonly action: BaseActionUtil;

  // Dynamic value component locators
  readonly dynamicValuesPicker: Locator;
  readonly alertMessageOption: Locator;
  readonly customSubjectTextarea: Locator;
  readonly dropdownTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.verifier = new BaseVerificationUtil(page);
    this.action = new BaseActionUtil(page);

    // Initialize locators
    this.dynamicValuesPicker = page.locator('div[id*="react-select"][id*="listbox"]');
    this.alertMessageOption = this.dynamicValuesPicker.getByText(DYNAMIC_VALUE_TEXT.ALERT_MESSAGE_OPTION);
    this.customSubjectTextarea = page.locator('#customSubjectTextarea');
    this.dropdownTrigger = page.locator('.css-o8z36p');
  }

  /**
   * Opens the dynamic values picker and verifies it's visible
   */
  async openDynamicValuesPicker(): Promise<void> {
    await test.step('Open dynamic values picker', async () => {
      // Click the dropdown container to open it
      await this.action.clickOnElement(this.dropdownTrigger, { stepInfo: 'Click dropdown trigger to open picker' });

      // Wait for and verify the picker is visible (this also waits for the dropdown to open and render)
      await this.verifier.verifyTheElementIsVisible(this.dynamicValuesPicker, {
        assertionMessage: 'Dynamic values picker should be visible',
        timeout: TIMEOUTS.SHORT,
      });

      // Verify the picker contains the expected options
      await this.verifier.verifyTheElementIsVisible(this.alertMessageOption, {
        assertionMessage: 'Alert Message option should be visible in picker',
        timeout: TIMEOUTS.VERY_SHORT,
      });
    });
  }

  /**
   * Clicks on the alert message option
   */
  async clickAlertMessageOption(): Promise<void> {
    await test.step('Click alert message option', async () => {
      await this.action.clickOnElement(this.alertMessageOption, { stepInfo: 'Click Alert Message option' });
    });
  }

  /**
   * Verifies that the custom subject textarea contains the expected token
   * @param expectedToken - The expected token (e.g., "{{message}}")
   */
  async verifyCustomSubjectContainsToken(expectedToken: string): Promise<void> {
    await test.step(`Verify custom subject contains token: ${expectedToken}`, async () => {
      const textareaValue = await this.customSubjectTextarea.inputValue();
      if (!textareaValue.includes(expectedToken)) {
        throw new Error(`Expected token "${expectedToken}" not found in textarea. Current value: "${textareaValue}"`);
      }
    });
  }

  /**
   * Verifies that the custom subject textarea contains multiple instances of the token
   * @param expectedToken - The expected token (e.g., "{{message}}")
   * @param expectedCount - The expected number of occurrences
   */
  async verifyCustomSubjectContainsTokenCount(expectedToken: string, expectedCount: number): Promise<void> {
    await test.step(`Verify custom subject contains ${expectedCount} instances of token: ${expectedToken}`, async () => {
      const textareaValue = await this.customSubjectTextarea.inputValue();
      const actualCount = (textareaValue.match(new RegExp(expectedToken.replace(/[{}]/g, '\\$&'), 'g')) || []).length;
      if (actualCount !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} instances of "${expectedToken}", but found ${actualCount}. Current value: "${textareaValue}"`
        );
      }
    });
  }
}
