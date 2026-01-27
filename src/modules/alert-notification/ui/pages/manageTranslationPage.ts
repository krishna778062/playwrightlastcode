import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class ManageTranslationPage extends BaseComponent {
  readonly sendTestButton: Locator;
  readonly differentEmailAddressRadio: Locator;
  readonly emailAddressInput: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.sendTestButton = page.getByRole('button', { name: 'Send test' });
    this.differentEmailAddressRadio = page.getByRole('radio', { name: 'Different email address' });
    this.emailAddressInput = page.getByRole('textbox', { name: 'Enter your email address here' });
  }

  /**
   * Selects the different email address option
   */
  async selectDifferentEmailAddress(): Promise<void> {
    await test.step('Select different email address option', async () => {
      await this.clickOnElement(this.differentEmailAddressRadio);
    });
  }

  /**
   * Fills the email address input
   * @param email - The email address to fill
   */
  async fillEmailAddress(email: string): Promise<void> {
    await test.step(`Fill email address: ${email}`, async () => {
      await this.fillInElement(this.emailAddressInput, email);
    });
  }

  /**
   * Clicks the send test button
   */
  async clickSendTestButton(): Promise<void> {
    await test.step('Click send test button', async () => {
      await this.clickOnElement(this.sendTestButton);
    });
  }

  /**
   * Verifies that "Different email address" option is selected
   */
  async verifyDifferentEmailAddressIsSelected(): Promise<void> {
    await test.step('Verify different email address option is selected', async () => {
      await expect(this.differentEmailAddressRadio, 'Different email address should be checked').toBeChecked();
    });
  }

  /**
   * Verifies that "Different email address" option is NOT selected
   */
  async verifyDifferentEmailAddressIsNotSelected(): Promise<void> {
    await test.step('Verify different email address option is not selected', async () => {
      await expect(this.differentEmailAddressRadio, 'Different email address should not be checked').not.toBeChecked();
    });
  }

  /**
   * Verifies that the email address input is empty
   */
  async verifyEmailAddressInputIsEmpty(): Promise<void> {
    await test.step('Verify email address input is empty', async () => {
      const inputValue = await this.emailAddressInput.inputValue();
      if (inputValue !== '') {
        throw new Error(`Expected email address input to be empty, but found "${inputValue}"`);
      }
    });
  }

  /**
   * Verifies that the email address input contains the expected value
   * @param expectedEmail - The expected email address value
   */
  async verifyEmailAddressInputValue(expectedEmail: string): Promise<void> {
    await test.step(`Verify email address input contains: ${expectedEmail}`, async () => {
      const inputValue = await this.emailAddressInput.inputValue();
      if (inputValue !== expectedEmail) {
        throw new Error(`Expected email addresses to remain "${expectedEmail}", but found "${inputValue}"`);
      }
    });
  }
}
