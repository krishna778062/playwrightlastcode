import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class MobilePromotionEmailSMSComponent extends BaseComponent {
  readonly sendMeLinkText: Locator;
  readonly SMSButton: Locator;
  readonly EmailButton: Locator;
  readonly countryCodeInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly emailInput: Locator;
  readonly cancelButton: Locator;
  readonly sendLinkButton: Locator;

  constructor(page: Page) {
    super(page);
    this.sendMeLinkText = page.locator('p:has-text("Send me the download link for the app via")');
    this.SMSButton = page.getByText('SMS');
    this.EmailButton = page.locator('#Email');
    this.countryCodeInput = page.locator('#countryCode');
    this.phoneNumberInput = page.locator('#mobileNumber');
    this.emailInput = page.getByPlaceholder('Email address…');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.sendLinkButton = page.getByRole('button', { name: 'Send link' });
  }

  async verifySendMeLinkTextIsDisplayed(): Promise<void> {
    await test.step('Verify send me link text is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.sendMeLinkText, {
        assertionMessage: 'Verify send me link text is visible',
      });
    });
  }
  async verifySMSButtonIsDisplayed(): Promise<void> {
    await test.step('Verify SMS button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.SMSButton, {
        assertionMessage: 'Verify SMS button is visible',
      });
    });
  }
  async verifyEmailButtonIsDisplayed(): Promise<void> {
    await test.step('Verify email button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.EmailButton, {
        assertionMessage: 'Verify email button is visible',
      });
    });
  }

  async verifySMSRadioButtonIsSelected(): Promise<void> {
    await test.step('Verify default subject line is selected', async () => {
      await expect(this.SMSButton, 'SMS radio button should be checked').toBeChecked();
    });
  }

  async verifyEmailRadioButtonIsSelected(): Promise<void> {
    await test.step('Verify email radio button is selected', async () => {
      await expect(this.EmailButton, 'Email radio button should be checked').toBeChecked();
    });
  }

  async clickOnSMSButton(): Promise<void> {
    await test.step('Click on SMS button', async () => {
      await this.clickOnElement(this.SMSButton, { force: true });
    });
  }
  async clickOnEmailButton(): Promise<void> {
    await test.step('Click on email button', async () => {
      await this.clickOnElement(this.EmailButton, { force: true });
    });
  }
  async verifyCountryCodeInputIsDisplayed(): Promise<void> {
    await test.step('Verify country code input is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.countryCodeInput, {
        assertionMessage: 'Verify country code input is visible',
        timeout: 30000,
      });
    });
  }
  async verifyPhoneNumberInputIsDisplayed(): Promise<void> {
    await test.step('Verify phone number input is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.phoneNumberInput, {
        assertionMessage: 'Verify phone number input is visible',
        timeout: 30000,
      });
    });
  }
  async verifyEmailInputIsDisplayed(): Promise<void> {
    await test.step('Verify email input is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.emailInput, {
        assertionMessage: 'Verify email input is visible',
        timeout: 30000,
      });
    });
  }

  async enterPhoneNumber(phoneNumber: string): Promise<void> {
    await test.step('Enter phone number', async () => {
      await this.fillInElement(this.phoneNumberInput, phoneNumber);
    });
  }
  async enterEmail(email: string): Promise<void> {
    await test.step('Enter email', async () => {
      await this.fillInElement(this.emailInput, email);
    });
  }
}
