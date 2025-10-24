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
  readonly skipForNowButton: Locator;
  readonly dontShowThisAgainButton: Locator;
  readonly backArrowButton: Locator;
  readonly step1Heading: Locator;
  readonly step2Heading: Locator;
  readonly mobileVerificationHeading: Locator;
  readonly emailVerificationHeading: Locator;
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
    this.skipForNowButton = page.getByRole('button', { name: 'Skip for now' });
    this.dontShowThisAgainButton = page.getByRole('button', { name: 'Don’t show this again' });
    this.backArrowButton = page.getByTestId('i-directionalArrowLeft');
    this.step1Heading = page.getByRole('heading', { name: 'Step 1/' });
    this.step2Heading = page.getByRole('heading', { name: 'Step 2/' });
    this.mobileVerificationHeading = page.getByRole('heading', { name: 'Mobile verification' });
    this.emailVerificationHeading = page.getByRole('heading', { name: 'Email verification' });
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

  async verifyAddForceContactPageIsLoadedForOptionalLWO(): Promise<void> {
    await test.step('Verifying add force contact page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.optionalHeading);
      await this.verifier.verifyTheElementIsVisible(this.addMobileNumberOrEmailHeading);
      await this.verifier.verifyTheElementIsVisible(this.weRecommendAddingPhoneHeading);
      await this.verifier.verifyTheElementIsVisible(this.countryCodeRequiredFor);
      await this.verifier.verifyTheElementIsVisible(this.mobileText);
      await this.verifier.verifyTheElementIsVisible(this.emailText);
      await this.verifier.verifyTheElementIsVisible(this.skipForNowButton);
      await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainButton);
    });
  }

  async verifyEmailOrMobileVerificationPageIsLoadedForOptionalLWO(verificationType: string): Promise<void> {
    await test.step('Verifying add force contact page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.backArrowButton);
      if (verificationType === 'email') {
        await this.verifier.verifyTheElementIsVisible(this.emailVerificationHeading);
      } else if (verificationType === 'mobile') {
        await this.verifier.verifyTheElementIsVisible(this.mobileVerificationHeading);
      }
      await this.verifier.verifyTheElementIsVisible(this.otpSentToHeading);
      await this.verifier.verifyTheElementIsVisible(this.enterOtpInput);
      await this.verifier.verifyTheElementIsVisible(this.verifyButton);
      await this.verifier.verifyTheElementIsVisible(this.resendOtpButton);
    });
  }

  async verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalLWO(verificationType: string): Promise<void> {
    await test.step('Verifying add force contact page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.backArrowButton);
      if (verificationType === 'mobile') {
        await this.verifier.verifyTheElementIsVisible(this.step1Heading);
        await this.verifier.verifyTheElementIsVisible(this.mobileVerificationHeading);
      } else if (verificationType === 'email') {
        // TODO: verify that error message should not be visible
        await this.verifier.verifyTheElementIsVisible(this.step2Heading);
        await this.verifier.verifyTheElementIsVisible(this.emailVerificationHeading);
      }
      await this.verifier.verifyTheElementIsVisible(this.otpSentToHeading);
      await this.verifier.verifyTheElementIsVisible(this.enterOtpInput);
      await this.verifier.verifyTheElementIsVisible(this.verifyButton);
      await this.verifier.verifyTheElementIsVisible(this.resendOtpButton);
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

    let otpEmail = '';
    let otpMobile = '';

    switch (enterType) {
      case 'email':
        await this.verifyAddForceContactPageIsLoadedForOptionalLWO();
        await this.fillInElement(this.emailInput, email);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        await this.verifyEmailOrMobileVerificationPageIsLoadedForOptionalLWO('email');
        await this.page.waitForTimeout(8000);
        otpEmail = await otpUtils.getOTPFromEmail(email);
        await this.fillInElement(this.enterOtpInput, otpEmail);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;

      case 'mobile':
        await this.verifyAddForceContactPageIsLoadedForOptionalLWO();
        await this.fillInElement(this.mobileInput, phone);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        await this.verifyEmailOrMobileVerificationPageIsLoadedForOptionalLWO('mobile');
        await this.page.waitForTimeout(8000);
        otpMobile = await otpUtils.getOTPFromSMS(phone);
        await this.fillInElement(this.enterOtpInput, otpMobile);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;

      case 'both':
        await this.verifyAddForceContactPageIsLoadedForOptionalLWO();
        await this.fillInElement(this.mobileInput, phone);
        await this.fillInElement(this.emailInput, email);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalLWO('mobile');
        await this.page.waitForTimeout(8000);
        otpMobile = await otpUtils.getOTPFromSMS(phone);
        await this.fillInElement(this.enterOtpInput, otpMobile);
        await this.clickOnElement(this.verifyButton);
        await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalLWO('email');
        await this.page.waitForTimeout(8000);
        otpEmail = await otpUtils.getOTPFromEmail(email);
        await this.fillInElement(this.enterOtpInput, otpEmail);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;
    }
  }
}
