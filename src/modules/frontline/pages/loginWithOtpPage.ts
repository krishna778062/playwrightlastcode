import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { LWO_MESSAGES } from '../constants/lwoConstants';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { OTPUtils } from '@/src/core/utils/smsUtil';

export class LoginWithOtpPage extends BasePage {
  readonly mobileInput: Locator;
  readonly emailInput: Locator;
  readonly optionalHeading: Locator;
  readonly addMobileNumberOrEmailHeading: Locator;
  readonly optionalFroceAddContactMessage: Locator;
  readonly mandatoryFroceAddContactMessage: Locator;
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
    this.optionalFroceAddContactMessage = page.locator(
      "//h1[text()='Add mobile number or email']/following-sibling::h4"
    );
    this.mandatoryFroceAddContactMessage = page.getByRole('heading', {
      name: LWO_MESSAGES.MANDATORY_FORCE_ADD_CONTACT_HEADING,
    });
    this.countryCodeRequiredFor = page.getByText('Country code is required for mobile phone number');
    this.mobileText = page.getByText('Mobile', { exact: true });
    this.emailText = page.getByText('Email ID');

    this.sendOtpToVerifyButton = page.getByRole('button', { name: 'Send OTP to verify' });
    this.skipForNowButton = page.getByRole('button', { name: 'Skip for now' });
    this.dontShowThisAgainButton = page.getByRole('button', { name: 'Don’t show this again' });
    this.backArrowButton = page.getByTestId('i-directionalArrowLeft');
    this.step1Heading = page.getByRole('heading', { name: 'Step 1/2' });
    this.step2Heading = page.getByRole('heading', { name: 'Step 2/2' });
    this.mobileVerificationHeading = page.getByRole('heading', { name: 'Mobile verification' });
    this.emailVerificationHeading = page.getByRole('heading', { name: 'Email verification' });
    this.otpSentToHeading = page.getByRole('heading', { name: 'OTP sent to' });
    this.enterOtpInput = page.getByText('Enter OTP*');
    this.verifyButton = page.getByRole('button', { name: 'Verify' });
    this.resendOtpButton = page.getByRole('button', { name: 'Resend OTP' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Returns a dynamic locator for the "OTP sent to" heading with the specific contact info (email or mobile number)
   * @param contactInfo - The email address or mobile number to search for
   * @returns Locator for the heading containing "OTP sent to [contactInfo]"
   */
  async getOtpSentToHeading(contactInfo: string): Promise<Locator> {
    const escapedContactInfo = contactInfo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match "OTP sent to" followed by the contact info (handles text split across elements)
    const pattern = new RegExp(`OTP.*sent\\s+to.*${escapedContactInfo}`, 'i');
    return this.page.getByRole('heading', { name: pattern });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the page is loaded', async () => {
      await this.page.waitForURL(/login\/force-add-contact/, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAddForceContactPageIsLoadedForOptionalLWO(): Promise<void> {
    await test.step('Verifying add force contact page is loaded for optional LWO', async () => {
      await this.verifier.verifyTheElementIsVisible(this.optionalHeading);
      await this.verifier.verifyTheElementIsVisible(this.addMobileNumberOrEmailHeading);
      await this.verifier.verifyTheElementIsVisible(this.optionalFroceAddContactMessage);
      await this.verifier.verifyElementHasText(
        this.optionalFroceAddContactMessage,
        LWO_MESSAGES.OPTIONAL_FORCE_ADD_CONTACT_HEADING
      );
      await this.verifier.verifyTheElementIsVisible(this.countryCodeRequiredFor);
      await this.verifier.verifyTheElementIsVisible(this.mobileText);
      await this.verifier.verifyTheElementIsVisible(this.emailText);
      await this.verifier.verifyTheElementIsVisible(this.skipForNowButton);
      await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainButton);
    });
  }

  async verifyAddForceContactPageIsLoadedForMandatoryLWO(): Promise<void> {
    await test.step('Verifying add force contact page is loaded for mandatory LWO', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.optionalHeading);
      await this.verifier.verifyTheElementIsVisible(this.addMobileNumberOrEmailHeading);
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFroceAddContactMessage);
      await this.verifier.verifyTheElementIsVisible(this.countryCodeRequiredFor);
      await this.verifier.verifyTheElementIsVisible(this.mobileText);
      await this.verifier.verifyTheElementIsVisible(this.emailText);
      await this.verifier.verifyTheElementIsNotVisible(this.skipForNowButton);
      await this.verifier.verifyTheElementIsNotVisible(this.dontShowThisAgainButton);
    });
  }

  async verifyEmailOrMobileVerificationPageIsLoadedForOptionalLWO(verificationType: string): Promise<void> {
    await test.step('Verifying email or mobile verification page is loaded for optional LWO', async () => {
      await this.verifier.verifyTheElementIsVisible(this.backArrowButton);
      if (verificationType === 'email') {
        await this.verifier.verifyTheElementIsVisible(this.emailVerificationHeading);
      } else if (verificationType === 'mobile') {
        await this.verifier.verifyTheElementIsVisible(this.mobileVerificationHeading);
      }
      await this.verifier.verifyTheElementIsVisible(this.enterOtpInput);
      await this.verifier.verifyTheElementIsVisible(this.verifyButton);
      await this.verifier.verifyTheElementIsVisible(this.resendOtpButton);
    });
  }

  async verifyEmailOrMobileVerificationPageIsLoadedForMandatoryLWO(verificationType: string): Promise<void> {
    await test.step('Verifying email or mobile verification page is loaded for mandatory LWO', async () => {
      await this.verifier.verifyTheElementIsVisible(this.backArrowButton);
      if (verificationType === 'email') {
        await this.verifier.verifyTheElementIsVisible(this.emailVerificationHeading);
      } else if (verificationType === 'mobile') {
        await this.verifier.verifyTheElementIsVisible(this.mobileVerificationHeading);
      }
      await this.verifier.verifyTheElementIsVisible(this.enterOtpInput);
      await this.verifier.verifyTheElementIsVisible(this.verifyButton);
      await this.verifier.verifyTheElementIsVisible(this.resendOtpButton);
    });
  }

  async verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalLWO(verificationType: string): Promise<void> {
    await test.step('Verifying both mobile and email verification page is loaded for optional LWO', async () => {
      await this.verifier.verifyTheElementIsVisible(this.backArrowButton);
      if (verificationType === 'mobile') {
        await this.verifier.verifyTheElementIsVisible(this.step1Heading);
        await this.verifier.verifyTheElementIsVisible(this.mobileVerificationHeading);
      } else if (verificationType === 'email') {
        // TODO: verify that error message should not be visible
        await this.verifier.verifyTheElementIsVisible(this.step2Heading);
        await this.verifier.verifyTheElementIsVisible(this.emailVerificationHeading);
      }
      await this.verifier.verifyTheElementIsVisible(this.enterOtpInput);
      await this.verifier.verifyTheElementIsVisible(this.verifyButton);
      await this.verifier.verifyTheElementIsVisible(this.resendOtpButton);
    });
  }

  async verifyForBothMobileAndEmailVerificationPageIsLoadedForMandatoryLWO(verificationType: string): Promise<void> {
    await test.step('Verifying both mobile and email verification page is loaded for mandatory LWO', async () => {
      await this.verifier.verifyTheElementIsVisible(this.backArrowButton);
      if (verificationType === 'mobile') {
        await this.verifier.verifyTheElementIsVisible(this.step1Heading);
        await this.verifier.verifyTheElementIsVisible(this.mobileVerificationHeading);
      } else if (verificationType === 'email') {
        // TODO: verify that error message should not be visible
        await this.verifier.verifyTheElementIsVisible(this.step2Heading);
        await this.verifier.verifyTheElementIsVisible(this.emailVerificationHeading);
      }
      await this.verifier.verifyTheElementIsVisible(this.enterOtpInput);
      await this.verifier.verifyTheElementIsVisible(this.verifyButton);
      await this.verifier.verifyTheElementIsVisible(this.resendOtpButton);
    });
  }

  /**
   * Ensures the user is on the "Force Add Contact" page.
   * If currently on an email or mobile verification screen, navigates back first.
   * Then verifies the form fields are visible and clears their values.
   */
  async checkScreenAndNavigateToForceAddContactPageWithClearFields(): Promise<void> {
    await test.step('Ensure we are on Force Add Contact page and clear form fields', async () => {
      if (await this.verifier.isTheElementVisible(this.enterOtpInput, { timeout: 5000 })) {
        await this.clickOnElement(this.backArrowButton);
        await this.verifier.verifyTheElementIsVisible(this.addMobileNumberOrEmailHeading);
        await this.mobileInput.clear();
        await this.emailInput.clear();
      }
    });
  }

  async addMobileNumberOrEmailAndVerify(
    otpUtils: OTPUtils,
    phone: string,
    email: string,
    enterType: string,
    lwoType: 'optional' | 'mandatory'
  ): Promise<void> {
    await test.step('Navigating to login with otp page', async () => {
      await this.page.waitForURL(/login\/force-add-contact/, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });

    let otpEmail = '';
    let otpMobile = '';

    await this.checkScreenAndNavigateToForceAddContactPageWithClearFields();

    switch (enterType) {
      case 'email':
        if (lwoType === 'optional') {
          await this.verifyAddForceContactPageIsLoadedForOptionalLWO();
        } else {
          await this.verifyAddForceContactPageIsLoadedForMandatoryLWO();
        }
        await this.fillInElement(this.emailInput, email);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        // Wait for the verification page to load before verifying elements
        await this.verifier.waitUntilElementIsVisible(this.emailVerificationHeading, {
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.verifier.verifyTheElementIsVisible(await this.getOtpSentToHeading(email), {
          timeout: TIMEOUTS.MEDIUM,
        });

        if (lwoType === 'optional') {
          await this.verifyEmailOrMobileVerificationPageIsLoadedForOptionalLWO('email');
        } else {
          await this.verifyEmailOrMobileVerificationPageIsLoadedForMandatoryLWO('email');
        }
        await this.page.waitForTimeout(8000);
        otpEmail = await otpUtils.getOTPFromEmail(email);
        await this.fillInElement(this.enterOtpInput, otpEmail);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;

      case 'mobile':
        if (lwoType === 'optional') {
          await this.verifyAddForceContactPageIsLoadedForOptionalLWO();
        } else {
          await this.verifyAddForceContactPageIsLoadedForMandatoryLWO();
        }
        await this.fillInElement(this.mobileInput, phone);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        // Wait for the verification page to load before verifying elements
        await this.verifier.waitUntilElementIsVisible(this.mobileVerificationHeading, {
          timeout: TIMEOUTS.MEDIUM,
        });

        await this.verifier.verifyTheElementIsVisible(await this.getOtpSentToHeading(phone), {
          timeout: TIMEOUTS.MEDIUM,
        });

        if (lwoType === 'optional') {
          await this.verifyEmailOrMobileVerificationPageIsLoadedForOptionalLWO('mobile');
        } else {
          await this.verifyEmailOrMobileVerificationPageIsLoadedForMandatoryLWO('mobile');
        }
        await this.page.waitForTimeout(8000);
        otpMobile = await otpUtils.getOTPFromSMS(phone);
        console.log('otpMobile--------------', otpMobile);
        await this.fillInElement(this.enterOtpInput, otpMobile);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;

      case 'both':
        if (lwoType === 'optional') {
          await this.verifyAddForceContactPageIsLoadedForOptionalLWO();
        } else {
          await this.verifyAddForceContactPageIsLoadedForMandatoryLWO();
        }
        await this.fillInElement(this.mobileInput, phone);
        await this.fillInElement(this.emailInput, email);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        // Wait for the verification page to load before verifying elements
        await this.verifier.waitUntilElementIsVisible(this.mobileVerificationHeading, {
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.verifier.verifyTheElementIsVisible(await this.getOtpSentToHeading(phone), {
          timeout: TIMEOUTS.MEDIUM,
        });

        if (lwoType === 'optional') {
          await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalLWO('mobile');
        } else {
          await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForMandatoryLWO('mobile');
        }
        await this.page.waitForTimeout(8000);
        otpMobile = await otpUtils.getOTPFromSMS(phone);
        await this.fillInElement(this.enterOtpInput, otpMobile);
        await this.clickOnElement(this.verifyButton);
        await this.verifier.verifyTheElementIsVisible(await this.getOtpSentToHeading(email), {
          timeout: TIMEOUTS.MEDIUM,
        });
        if (lwoType === 'optional') {
          await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalLWO('email');
        } else {
          await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForMandatoryLWO('email');
        }
        await this.page.waitForTimeout(8000);
        otpEmail = await otpUtils.getOTPFromEmail(email);
        await this.fillInElement(this.enterOtpInput, otpEmail);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;
    }
  }
}
