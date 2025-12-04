import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';
import { LoginPage } from '@core/ui/pages/loginPage';

import { LWO_MESSAGES } from '../constants/lwoConstants';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { OTPUtils } from '@/src/core/utils/smsUtil';

export class LoginWithOtpPage extends BasePage {
  readonly mobileInput: Locator;
  readonly emailInput: Locator;
  readonly optionalHeading: Locator;
  readonly addMobileNumberOrEmailHeading: Locator;
  readonly addMobileNumberHeading: Locator;
  readonly addEmailAddressHeading: Locator;

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
  readonly mobileNumberForceAddContactMessage: Locator;
  readonly emailForceAddContactMessage: Locator;
  readonly dontShowThisAgainModal: Locator;
  readonly dontShowThisAgainModalHeader: Locator;
  readonly dontShowThisAgainModalBody: Locator;
  readonly dontShowThisAgainModalCancelButton: Locator;
  readonly dontShowThisAgainModalConfirmButton: Locator;
  readonly dontShowThisAgainModalCloseButton: Locator;

  // OTP flow specific locators (not in LoginPage)
  readonly useOtpButton: Locator;
  readonly letsGetStartedHeading: Locator;
  readonly emailOption: Locator;
  readonly sendOtpButton: Locator;
  readonly verificationCodeMessage: Locator;
  readonly enterOtpTextbox: Locator;
  readonly verifyOtpButton: Locator;

  constructor(page: Page) {
    super(page);
    this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
    this.emailInput = page.getByRole('textbox', { name: 'Email ID' });
    this.optionalHeading = page.getByRole('heading', { name: 'Optional' });
    this.addMobileNumberOrEmailHeading = page.getByRole('heading', { name: 'Add mobile number or email' });
    this.addMobileNumberHeading = page.getByRole('heading', { name: 'Add mobile number' });
    this.mobileNumberForceAddContactMessage = page.getByText(LWO_MESSAGES.MOBILE_NUMBER_FORCE_ADD_CONTACT_MESSAGE);
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
    this.addEmailAddressHeading = page.getByRole('heading', { name: 'Add email address' });
    this.emailForceAddContactMessage = page.getByText(LWO_MESSAGES.EMAIL_NUMBER_FORCE_ADD_CONTACT_MESSAGE);
    this.dontShowThisAgainModal = page
      .getByRole('dialog')
      .filter({ hasText: LWO_MESSAGES.DONT_SHOW_THIS_AGAIN_MODAL_HEADER });
    this.dontShowThisAgainModalHeader = this.dontShowThisAgainModal.getByRole('heading', {
      name: LWO_MESSAGES.DONT_SHOW_THIS_AGAIN_MODAL_HEADER,
    });
    this.dontShowThisAgainModalBody = this.dontShowThisAgainModal.getByText(
      LWO_MESSAGES.DONT_SHOW_THIS_AGAIN_MODAL_BODY
    );
    this.dontShowThisAgainModalCancelButton = this.dontShowThisAgainModal.getByRole('button', { name: 'Cancel' });
    this.dontShowThisAgainModalConfirmButton = this.dontShowThisAgainModal.getByRole('button', { name: 'Confirm' });
    this.dontShowThisAgainModalCloseButton = this.dontShowThisAgainModal.getByRole('button', { name: 'Close' });
    this.useOtpButton = page.getByRole('button', { name: 'Use OTP' });
    this.letsGetStartedHeading = page.getByRole('heading', { name: "Let's get started..." });
    this.emailOption = page.getByText('Email');
    this.sendOtpButton = page.getByRole('button', { name: 'Send OTP' });
    this.verificationCodeMessage = page.getByText('A verification code has been sent to your email');
    this.enterOtpTextbox = page.getByRole('textbox', { name: 'Enter OTP' });
    this.verifyOtpButton = page.getByRole('button', { name: 'Verify OTP' });
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

  async verifyAddForceContactPageIsLoadedForOptionalorMandatoryLWO(lwoType: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.addMobileNumberOrEmailHeading);
    if (lwoType === 'optional') {
      await test.step('Verifying add force contact page is loaded for optional LWO', async () => {
        await this.verifier.verifyTheElementIsVisible(this.optionalHeading);
        await this.verifier.verifyTheElementIsVisible(this.optionalFroceAddContactMessage);
        await this.verifier.verifyElementHasText(
          this.optionalFroceAddContactMessage,
          LWO_MESSAGES.OPTIONAL_FORCE_ADD_CONTACT_HEADING
        );
        await this.verifier.verifyTheElementIsVisible(this.skipForNowButton);
        await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainButton);
      });
    } else if (lwoType === 'mandatory') {
      await test.step('Verifying add force contact page is loaded for mandatory LWO', async () => {
        await this.verifier.verifyTheElementIsNotVisible(this.optionalHeading);
        await this.verifier.verifyTheElementIsVisible(this.mandatoryFroceAddContactMessage);
        await this.verifier.verifyTheElementIsNotVisible(this.skipForNowButton);
        await this.verifier.verifyTheElementIsNotVisible(this.dontShowThisAgainButton);
      });
    }
    await this.verifier.verifyTheElementIsVisible(this.countryCodeRequiredFor);
    await this.verifier.verifyTheElementIsVisible(this.mobileText);
    await this.verifier.verifyTheElementIsVisible(this.emailText);
  }

  async verifyEmailOrMobileVerificationPageIsLoadedForOptionalOrMandatoryLWO(verificationType: string): Promise<void> {
    await test.step('Verifying email or mobile verification page is loaded for optional or mandatory LWO', async () => {
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

  async verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalOrMandatoryLWO(
    verificationType: string
  ): Promise<void> {
    await test.step('Verifying both mobile and email verification page is loaded for optional or mandatory LWO', async () => {
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
        await this.verifyAddForceContactPageIsLoadedForOptionalorMandatoryLWO(lwoType);
        await this.fillInElement(this.emailInput, email);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        // Wait for the verification page to load before verifying elements
        await this.verifier.waitUntilElementIsVisible(this.emailVerificationHeading, {
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.verifier.verifyTheElementIsVisible(await this.getOtpSentToHeading(email), {
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.verifyEmailOrMobileVerificationPageIsLoadedForOptionalOrMandatoryLWO(enterType);
        await this.page.waitForTimeout(8000);
        otpEmail = await otpUtils.getOTPFromEmail(email);
        await this.fillInElement(this.enterOtpInput, otpEmail);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;

      case 'mobile':
        await this.verifyAddForceContactPageIsLoadedForOptionalorMandatoryLWO(lwoType);
        await this.fillInElement(this.mobileInput, phone);
        await this.clickOnElement(this.sendOtpToVerifyButton);
        // Wait for the verification page to load before verifying elements
        await this.verifier.waitUntilElementIsVisible(this.mobileVerificationHeading, {
          timeout: TIMEOUTS.MEDIUM,
        });

        await this.verifier.verifyTheElementIsVisible(await this.getOtpSentToHeading(phone), {
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.verifyEmailOrMobileVerificationPageIsLoadedForOptionalOrMandatoryLWO(enterType);
        await this.page.waitForTimeout(8000);
        otpMobile = await otpUtils.getOTPFromSMS(phone);
        console.log('otpMobile--------------', otpMobile);
        await this.fillInElement(this.enterOtpInput, otpMobile);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;

      case 'both':
        await this.verifyAddForceContactPageIsLoadedForOptionalorMandatoryLWO(lwoType);
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

        await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalOrMandatoryLWO('mobile');
        await this.page.waitForTimeout(8000);
        otpMobile = await otpUtils.getOTPFromSMS(phone);
        await this.fillInElement(this.enterOtpInput, otpMobile);
        await this.clickOnElement(this.verifyButton);
        await this.verifier.verifyTheElementIsVisible(await this.getOtpSentToHeading(email), {
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.verifyForBothMobileAndEmailVerificationPageIsLoadedForOptionalOrMandatoryLWO('email');
        await this.page.waitForTimeout(8000);
        otpEmail = await otpUtils.getOTPFromEmail(email);
        await this.fillInElement(this.enterOtpInput, otpEmail);
        await this.clickOnElement(this.verifyButton);
        await this.clickOnElement(this.continueButton);
        break;
    }
  }

  async verifyForceAddContactPageForIdentifierTypeMobileOrEmail(verificationType: string): Promise<void> {
    await test.step(`Verifying add force contact page is loaded for ${verificationType} LWO when login identifiers are email and employee number`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.optionalHeading);
      if (verificationType === 'mobile') {
        await this.verifier.verifyTheElementIsVisible(this.addMobileNumberHeading);
        await this.verifier.verifyTheElementIsVisible(this.mobileNumberForceAddContactMessage);
        await this.verifier.verifyTheElementIsVisible(this.countryCodeRequiredFor);
        await this.verifier.verifyTheElementIsVisible(this.mobileText);
      } else if (verificationType === 'email') {
        await this.verifier.verifyTheElementIsVisible(this.addEmailAddressHeading);
        await this.verifier.verifyTheElementIsVisible(this.emailForceAddContactMessage);
        await this.verifier.verifyTheElementIsVisible(this.emailText);
      }
      await this.verifier.verifyTheElementIsVisible(this.skipForNowButton);
      await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainButton);
    });
  }

  async addEmailOrMobileBasedOnIdentifiers(
    otpUtils: OTPUtils,
    identifier: string,
    identifierType: 'email' | 'mobile'
  ): Promise<void> {
    await test.step('Navigating to force add contact page', async () => {
      await this.page.waitForURL(/login\/force-add-contact/, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });

    let otpValue = '';

    await this.checkScreenAndNavigateToForceAddContactPageWithClearFields();

    await this.verifyForceAddContactPageForIdentifierTypeMobileOrEmail(identifierType);

    if (identifierType === 'mobile') {
      await this.fillInElement(this.mobileInput, identifier);
    } else {
      await this.fillInElement(this.emailInput, identifier);
    }

    await this.clickOnElement(this.sendOtpToVerifyButton);

    // Verify correct verification page based on type & LWO type
    await this.verifyEmailOrMobileVerificationPageIsLoadedForOptionalOrMandatoryLWO(identifierType);

    // Get and enter OTP
    await this.page.waitForTimeout(8000);
    otpValue =
      identifierType === 'mobile'
        ? await otpUtils.getOTPFromSMS(identifier)
        : await otpUtils.getOTPFromEmail(identifier);

    console.log(`${identifierType} OTP →`, otpValue);

    await this.fillInElement(this.enterOtpInput, otpValue);
    await this.clickOnElement(this.verifyButton);
    await this.clickOnElement(this.continueButton);
  }

  async skipVerificationPage(): Promise<void> {
    await test.step('Skipping verification page', async () => {
      await this.page.waitForURL(/login\/force-add-contact/, {
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.checkScreenAndNavigateToForceAddContactPageWithClearFields();
      await this.clickOnElement(this.skipForNowButton);
    });
  }

  async clickDontShowThisAgainButton(): Promise<void> {
    await test.step(`Clicking Don't show this again on verification page`, async () => {
      await this.page.waitForURL(/login\/force-add-contact/, {
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.checkScreenAndNavigateToForceAddContactPageWithClearFields();

      await this.clickOnElement(this.dontShowThisAgainButton);
      await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainModal);
      await this.verifier.verifyElementHasText(
        this.dontShowThisAgainModalHeader,
        LWO_MESSAGES.DONT_SHOW_THIS_AGAIN_MODAL_HEADER
      );

      // Verify modal body text
      await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainModalBody);
      await this.verifier.verifyElementHasText(
        this.dontShowThisAgainModalBody,
        LWO_MESSAGES.DONT_SHOW_THIS_AGAIN_MODAL_BODY
      );
      // Verify modal buttons
      await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainModalCancelButton);
      await this.verifier.verifyTheElementIsVisible(this.dontShowThisAgainModalConfirmButton);

      // Click Confirm button
      await this.clickOnElement(this.dontShowThisAgainModalConfirmButton);
    });
  }

  private async verifyLoginPageElements(loginPage: LoginPage): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(loginPage.usernameInput);
    await this.verifier.verifyTheElementIsVisible(loginPage.continueButton);
  }

  private async verifyAuthenticatePage(options?: { timeout?: number }): Promise<void> {
    await this.page.waitForURL(/authenticate/, {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
    });
    await this.verifier.verifyTheElementIsVisible(this.useOtpButton, {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
    });
  }

  private async verifyLetsGetStartedHeading(options?: { timeout?: number }): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.letsGetStartedHeading, {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
    });
  }

  private async verifyOtpSentConfirmation(options?: { timeout?: number }): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.verificationCodeMessage, {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
    });
    await this.verifier.verifyElementHasText(
      this.verificationCodeMessage,
      'A verification code has been sent to your email',
      {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
      }
    );
    await this.verifier.verifyTheElementIsVisible(this.otpSentToHeading, {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
    });
    await this.verifier.verifyTheElementIsVisible(this.enterOtpTextbox, {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
    });
  }

  private async verifyVerifyOtpButton(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.verifyOtpButton);
  }

  async performLoginWithOtp(
    loginPage: LoginPage,
    email: string,
    otpUtils: OTPUtils,
    otpEmail: string,
    options?: { timeout?: number }
  ): Promise<void> {
    await test.step(`Logging in with email ${email} using OTP`, async () => {
      // Navigate to login page and enter email in username input field
      await this.verifyLoginPageElements(loginPage);
      await this.fillInElement(loginPage.usernameInput, email);
      await this.clickOnElement(loginPage.continueButton);

      // Wait for authenticate page and validate Use OTP button is visible
      await this.verifyAuthenticatePage(options);

      // Click Use OTP button to navigate to lets get started page
      await this.clickOnElement(this.useOtpButton);
      await this.verifyLetsGetStartedHeading(options);

      // Click Email option and validate send OTP button is visible
      await this.verifier.verifyTheElementIsVisible(this.emailOption);
      await this.clickOnElement(this.emailOption);
      await this.verifier.verifyTheElementIsVisible(this.sendOtpButton, {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
      });

      // Click Send OTP and validate verification messages and OTP input field is visible
      await this.clickOnElement(this.sendOtpButton);
      await this.verifyOtpSentConfirmation(options);

      // Get and enter OTP in enter OTP textbox
      await this.page.waitForTimeout(8000); // Wait for OTP to be sent
      const otpValue = await otpUtils.getOTPFromEmail(otpEmail);
      console.log(`Email OTP → ${otpValue}`);
      await this.fillInElement(this.enterOtpTextbox, otpValue);
      await this.verifyVerifyOtpButton();

      // Click Verify OTP button to verify OTP
      await this.clickOnElement(this.verifyOtpButton);
    });
  }
}
