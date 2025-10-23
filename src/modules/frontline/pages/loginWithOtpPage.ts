import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { OTPUtils } from '@/src/core/utils/smsUtil';

export class LoginWithOtpPage extends BasePage {
  readonly mobileInput: Locator;
  readonly emailInput: Locator;
  readonly optionalHeading: Locator;
  readonly addMobileNumberOrEmailHeading: Locator;
  readonly weRecommendAddingPhoneHeading: Locator;
  readonly countryCodeRequiredFor: Locator;
  readonly mobileText: Locator;
  readonly emailText: Locator;
  readonly sendOtpToVerifyButton: Locator;
  readonly step1Heading: Locator;
  readonly mobileVerificationHeading: Locator;
  readonly otpSentToHeading: Locator;
  readonly enterOtpInput: Locator;
  readonly verifyButton: Locator;
  readonly resendOtpButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
    this.emailInput = page.getByRole('textbox', { name: 'Email ID' });
    this.optionalHeading = page.getByRole('heading', { name: 'Optional' });
    this.addMobileNumberOrEmailHeading = page.getByRole('heading', { name: 'Add mobile number or email' });
    this.weRecommendAddingPhoneHeading = page.getByRole('heading', { name: 'We recommend adding a phone' });
    this.countryCodeRequiredFor = page.getByText('Country code is required for');
    this.mobileText = page.getByText('Mobile', { exact: true });
    this.emailText = page.getByText('Email ID');

    this.sendOtpToVerifyButton = page.getByRole('button', { name: 'Send OTP to verify' });
    this.step1Heading = page.getByRole('heading', { name: 'Step 1/' });
    this.mobileVerificationHeading = page.getByRole('heading', { name: 'Mobile verification' });
    this.otpSentToHeading = page.getByRole('heading', { name: 'OTP sent to' });
    this.enterOtpInput = page.getByText('Enter OTP*');
    this.verifyButton = page.getByRole('button', { name: 'Verify' });
    this.resendOtpButton = page.getByRole('button', { name: 'Resend OTP' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the page is loaded', async () => {
      await this.page.waitForURL(/login\/force-add-contact/, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
  async addMobileNumberOrEmailAndVerify(
    otpUtils: OTPUtils,
    phone: string,
    email: string,
    enterType: string
  ): Promise<void> {
    await test.step('Navigating to login with otp page', async () => {
      await this.page.waitForURL(/login\/force-add-contact/, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });
    await this.page.waitForTimeout(3000);

    switch (enterType) {
      case 'email':
        await this.fillInElement(this.emailInput, email);
        await this.verifier.verifyTheElementIsVisible(this.optionalHeading);
        await this.verifier.verifyTheElementIsVisible(this.addMobileNumberOrEmailHeading);
        await this.verifier.verifyTheElementIsVisible(this.weRecommendAddingPhoneHeading);
        await this.verifier.verifyTheElementIsVisible(this.countryCodeRequiredFor);
        await this.verifier.verifyTheElementIsVisible(this.mobileText);
        await this.verifier.verifyTheElementIsVisible(this.emailText);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        await this.page.waitForTimeout(5000);
        const otpEmail = await otpUtils.getOTPFromEmail(email);
        console.log('otpEmail------', otpEmail);
        await this.enterOtpInput.fill(otpEmail);
        await this.clickOnElement(this.verifyButton);
        await this.page.waitForTimeout(5000);
        await this.clickOnElement(this.continueButton);

        break;

      case 'mobile':
        await this.fillInElement(this.mobileInput, phone);
        await this.verifier.verifyTheElementIsVisible(this.optionalHeading);
        await this.verifier.verifyTheElementIsVisible(this.addMobileNumberOrEmailHeading);
        await this.verifier.verifyTheElementIsVisible(this.weRecommendAddingPhoneHeading);
        await this.verifier.verifyTheElementIsVisible(this.countryCodeRequiredFor);
        await this.verifier.verifyTheElementIsVisible(this.mobileText);
        await this.verifier.verifyTheElementIsVisible(this.emailText);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        await this.page.waitForTimeout(5000);
        const otpMobile = await otpUtils.getOTPFromSMS(phone);
        console.log('otpMobile------', otpMobile);
        await this.enterOtpInput.fill(otpMobile);
        await this.clickOnElement(this.verifyButton);
        await this.page.waitForTimeout(5000);
        await this.clickOnElement(this.continueButton);

        break;
    }
  }
}
