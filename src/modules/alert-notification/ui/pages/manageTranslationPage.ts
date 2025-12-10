import { Locator, Page, test } from '@playwright/test';

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
}
