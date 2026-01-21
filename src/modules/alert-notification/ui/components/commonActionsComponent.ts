import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

/**
 * CommonActionsComponent - Contains reusable methods for all alert-notification modules
 * Use this component in: MobilePromotion, NotificationCustomization, DND/ManagePreferences
 */
export class CommonActionsComponent extends BaseComponent {
  readonly profileNotificationSettingsButton: Locator;
  readonly mySettingsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.profileNotificationSettingsButton = this.page.getByLabel('Profile settings');
    this.mySettingsButton = this.page.getByText('My settings', { exact: true });
  }

  // ==================== BUTTON ACTIONS ====================

  /**
   * Clicks a button by its name/label
   * @param buttonName - The accessible name of the button
   * @param step - Optional custom step name for reporting
   * @param timeout - Timeout for the click action (default: 30s)
   */
  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName });
      await this.clickOnElement(button, { timeout });
      if (await button.isEnabled()) {
        await this.clickOnElement(button, { timeout });
      } else {
        console.log(`${buttonName} button is disabled, skipping click`);
      }
    });
  }

  /**
   * Clicks a tab by its name
   * @param tabName - The accessible name of the tab
   * @param step - Optional custom step name for reporting
   */
  async clickTab(tabName: string, step?: string): Promise<void> {
    const stepName = step || `Click ${tabName} tab`;
    await test.step(stepName, async () => {
      const tab = this.page.getByRole('tab', { name: tabName });
      await this.clickOnElement(tab);
    });
  }

  /**
   * Clicks a link by its name/label
   * @param linkName - The accessible name of the link
   * @param step - Optional custom step name for reporting
   */
  async clickLink(linkName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${linkName} link`;
    await test.step(stepName, async () => {
      const link = this.page.getByRole('link', { name: linkName });
      await this.clickOnElement(link, { timeout });
    });
  }

  /**
   * Verifies a link is visible
   * @param linkName - The accessible name of the link
   */
  async verifyLinkIsVisible(linkName: string): Promise<void> {
    await test.step(`Verify ${linkName} link is visible`, async () => {
      const link = this.page.getByRole('link', { name: linkName });
      await this.verifier.verifyTheElementIsVisible(link, {
        assertionMessage: `Link "${linkName}" should be visible`,
      });
    });
  }

  /**
   * Verifies a heading is visible
   * @param headingText - The text of the heading
   */
  async verifyHeadingIsVisible(headingText: string): Promise<void> {
    await test.step(`Verify heading "${headingText}" is visible`, async () => {
      const heading = this.page.getByRole('heading', { name: headingText });
      await this.verifier.verifyTheElementIsVisible(heading, {
        assertionMessage: `Heading "${headingText}" should be visible`,
      });
    });
  }

  /**
   * Verifies button state (visible, enabled, disabled)
   * @param buttonName - The name of the button
   * @param verificationType - Type of verification (visible, enabled, disabled)
   * @param step - Optional custom step name
   */
  async verifyButton(
    buttonName: string,
    verificationType: 'visible' | 'enabled' | 'disabled',
    step?: string
  ): Promise<void> {
    const stepName = step || `Verify ${buttonName} button is ${verificationType}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName }).first();
      switch (verificationType) {
        case 'visible':
          await this.verifier.verifyTheElementIsVisible(button);
          break;
        case 'enabled':
          await this.verifier.verifyTheElementIsEnabled(button);
          break;
        case 'disabled':
          await this.verifier.verifyTheElementIsDisabled(button);
          break;
      }
    });
  }

  // ==================== TOAST/ALERT MESSAGES ====================

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

  /**
   * Verifies that a toast message is NOT visible
   * @param message - The toast message text that should not be visible
   */
  async verifyToastMessageNotShown(message: string): Promise<void> {
    await test.step(`Verify toast message is NOT shown: ${message}`, async () => {
      await this.page.waitForTimeout(1_000);
      const alertCount = await this.page.getByRole('alert').filter({ hasText: message }).count();
      if (alertCount > 0) {
        throw new Error(`Toast should NOT contain: ${message}, but it was found`);
      }
    });
  }

  // ==================== ERROR MESSAGES ====================

  /**
   * Verifies an error message (role="alert") is displayed
   * @param expectedMessage - The expected error message text
   */
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

  /**
   * Verifies inline validation error message is displayed
   * @param errorMessage - The expected error message
   */
  async verifyInlineErrorMessage(errorMessage: string): Promise<void> {
    await test.step(`Verify inline error message: ${errorMessage}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByText(errorMessage), {
        assertionMessage: `Inline error message should be visible: ${errorMessage}`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verifies an error message is NOT visible
   * @param errorMessage - The error message that should not be visible
   */
  async verifyErrorMessageNotVisible(errorMessage: string): Promise<void> {
    await test.step(`Verify error message is NOT visible: ${errorMessage}`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.page.getByText(errorMessage), {
        assertionMessage: `Error message should NOT be visible: ${errorMessage}`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  // ==================== INPUT FIELD ACTIONS ====================

  /**
   * Verifies the value of an input field
   * @param locator - The locator for the input field
   * @param expectedValue - The expected value
   */
  async verifyInputValue(locator: Locator, expectedValue: string): Promise<void> {
    await test.step(`Verify input value: ${expectedValue}`, async () => {
      const actualValue = await locator.inputValue();
      expect(actualValue).toBe(expectedValue);
    });
  }

  /**
   * Clears an input field and verifies it's empty
   * @param locator - The locator for the input field
   */
  async clearInputField(locator: Locator): Promise<void> {
    await test.step(`Clear input field`, async () => {
      await locator.clear();
      await locator.fill('');
      const value = await locator.inputValue();
      expect(value).toBe('');
    });
  }

  /**
   * Fills an input field with text
   * @param locator - The locator for the input field
   * @param text - The text to fill
   */
  async fillInputField(locator: Locator, text: string): Promise<void> {
    await test.step(`Fill input field with: ${text.substring(0, 50)}...`, async () => {
      await this.fillInElement(locator, text);
    });
  }

  // ==================== KEYBOARD ACTIONS ====================

  /**
   * Presses Tab key on an element
   * @param locator - The locator for the element
   */
  async pressTab(locator: Locator): Promise<void> {
    await test.step('Press Tab key', async () => {
      await locator.press('Tab');
    });
  }

  /**
   * Presses keyboard key on page
   * @param key - The key to press (e.g., 'Tab', 'Enter', 'Escape')
   */
  async pressKey(key: string): Promise<void> {
    await test.step(`Press ${key} key`, async () => {
      await this.page.keyboard.press(key);
    });
  }

  // ==================== TEXT VERIFICATION ====================

  /**
   * Verifies that text is visible on the page
   * @param text - The text to verify
   * @param options - Optional configuration (exact match, timeout, etc.)
   */
  async verifyTextIsVisible(
    text: string,
    options?: {
      exact?: boolean;
      timeout?: number;
      assertionMessage?: string;
    }
  ): Promise<void> {
    const { exact = true, timeout = 10_000, assertionMessage } = options || {};
    await test.step(`Verify text "${text}" is visible`, async () => {
      const textElement = this.page.getByText(text, { exact });
      await this.verifier.verifyTheElementIsVisible(textElement, {
        timeout,
        assertionMessage: assertionMessage || `Text "${text}" should be visible`,
      });
    });
  }

  // ==================== NAVIGATION/UTILITY ACTIONS ====================

  /**
   * Reloads the current page
   */
  async reloadPage(): Promise<void> {
    await test.step('Refresh the current page', async () => {
      await this.page.reload();
    });
  }

  /**
   * Navigates to the Profile Notification Settings page
   */
  async navigateToProfileNotificationSettingsPage(): Promise<void> {
    await this.clickOnElement(this.profileNotificationSettingsButton, {
      stepInfo: 'Click on Profile Notification Settings button',
    });
    await this.clickOnElement(this.mySettingsButton, {
      stepInfo: 'Click on My Settings button',
    });
  }
  /**
   * Verifies that text is NOT visible on the page
   * @param text - The text that should not be visible
   */
  async verifyTextIsNotVisible(text: string): Promise<void> {
    await test.step(`Verify text "${text}" is NOT visible`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.page.getByText(text), {
        assertionMessage: `Text "${text}" should NOT be visible`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }
}
