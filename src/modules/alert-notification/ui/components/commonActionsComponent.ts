import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class CommonActionsComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName });
      await this.clickOnElement(button, { timeout });
    });
  }

  /**
   * Verifies that a toast message with the specified text is visible
   * @param message - The expected toast message text
   */
  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verify toast message: ${message}`, async () => {
      const specificAlert = this.page.getByRole('alert').filter({ hasText: message }).first();
      await this.verifier.verifyTheElementIsVisible(specificAlert, {
        timeout: 15_000,
        assertionMessage: `Toast should contain: ${message}`,
      });
    });
  }

  async verifyInputValue(locator: Locator, expectedValue: string): Promise<void> {
    await test.step(`Verify input value: ${expectedValue}`, async () => {
      const actualValue = await locator.inputValue();
      expect(actualValue).toBe(expectedValue);
    });
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await test.step(`Verify error message: ${expectedMessage}`, async () => {
      const errorMsg = this.page.locator('p[role="alert"]').filter({ hasText: expectedMessage }).first();

      await this.verifier.verifyTheElementIsVisible(errorMsg, {
        timeout: 10_000,
        assertionMessage: `Expected error message to be visible: "${expectedMessage}"`,
      });

      const actualText = await errorMsg.textContent();
      expect(actualText?.trim()).toBe(expectedMessage);
    });
  }

  async clearInputField(locator: Locator): Promise<void> {
    await test.step(`Clear input field`, async () => {
      await locator.clear();
      await locator.fill('');
      const value = await locator.inputValue();
      expect(value).toBe('');
    });
  }

  async pressTab(locator: Locator): Promise<void> {
    await test.step('Press Tab key', async () => {
      await locator.press('Tab');
    });
  }

  async checkCheckbox(locator: Locator): Promise<void> {
    await test.step('Check checkbox', async () => {
      if (!(await locator.isChecked())) {
        await locator.check();
        await expect(locator).toBeChecked();
        console.log('Checkbox was unchecked and is now checked.');
      } else {
        console.log('Checkbox is already checked — no action needed.');
      }
    });
  }

  async uncheckCheckbox(locator: Locator): Promise<void> {
    await test.step('Uncheck checkbox', async () => {
      if (await locator.isChecked()) {
        await locator.uncheck();
        await expect(locator).not.toBeChecked();
        console.log('Checkbox was checked and is now unchecked.');
      } else {
        console.log('Checkbox is already unchecked — no action needed.');
      }
    });
  }

  async verifyCheckboxIsChecked(
    locator: Locator,
    stepDescription: string = 'Verify checkbox is checked',
    assertionMessage: string = 'Checkbox should be checked'
  ): Promise<void> {
    await test.step(stepDescription, async () => {
      await this.verifier.verifyTheElementIsChecked(locator, {
        assertionMessage,
        timeout: 30000,
      });
    });
  }
  async verifyCheckboxIsUnchecked(
    locator: Locator,
    stepDescription: string = 'Verify checkbox is unchecked',
    assertionMessage: string = 'Checkbox should be unchecked'
  ): Promise<void> {
    await test.step(stepDescription, async () => {
      await this.verifier.verifyTheElementIsNotChecked(locator, {
        assertionMessage,
        timeout: 30000,
      });
    });
  }

  async verifyElementIsVisible(
    locator: Locator,
    stepDescription: string = 'Verify element is visible',
    assertionMessage: string = 'Element should be visible'
  ): Promise<void> {
    await test.step(stepDescription, async () => {
      await this.verifier.verifyTheElementIsVisible(locator, {
        assertionMessage,
        timeout: 30000,
      });
    });
  }
  async verifyElementIsNotVisible(
    locator: Locator,
    stepDescription: string = 'Verify element is not visible',
    assertionMessage: string = 'Element should not be visible'
  ): Promise<void> {
    await test.step(stepDescription, async () => {
      await this.verifier.verifyTheElementIsNotVisible(locator, {
        assertionMessage,
        timeout: 30000,
      });
    });
  }
}
