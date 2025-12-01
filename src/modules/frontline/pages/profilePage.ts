import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';
import { OTPUtils } from '@core/utils/smsUtil';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class ProfilePage extends BasePage {
  readonly contactEditButton: Locator;
  readonly mobileInput: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;
  readonly verificationHeading: Locator;
  readonly mobileVerificationHeading: Locator;
  readonly otpSentToMobileHeading: Locator;
  readonly enterOtpInput: Locator;
  readonly verifyButton: Locator;
  readonly accountVerifiedMessage: Locator;
  readonly dataSavedMessage: Locator;
  readonly continueButton: Locator;
  readonly otpVerifiedSuccessToast: Locator;
  readonly mobileNumberDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.contactEditButton = page.getByLabel('Edit contact');
    this.mobileInput = page.locator('input[name="mobile"]').or(page.locator('#mobile'));
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.successMessage = page.getByText('Saved changes successfully');
    this.verificationHeading = page.getByRole('heading', { name: 'You need to verify your' });
    this.mobileVerificationHeading = page.getByRole('heading', { name: 'Mobile verification' });
    this.otpSentToMobileHeading = page.getByRole('heading', { name: 'OTP has been sent to mobile' });
    this.enterOtpInput = page.getByRole('textbox', { name: 'Enter OTP*' });
    this.verifyButton = page.getByRole('button', { name: 'Verify' });
    this.accountVerifiedMessage = page.getByText('Your account has been verified');
    this.dataSavedMessage = page.getByText('Your data has been saved to');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.otpVerifiedSuccessToast = page.getByText('OTP verified successfully');
    this.mobileNumberDisplay = page.locator('a[href^="tel:"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify profile page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contactEditButton, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Profile page should be visible with contact edit button',
      });
    });
  }

  async clickContactEditButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on contact edit button', async () => {
      await this.clickOnElement(this.contactEditButton, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async fillMobileNumberOnProfilePage(phoneNumber: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Filling mobile number: ${phoneNumber}`, async () => {
      await this.mobileInput.fill(phoneNumber);
    });
  }

  async clickSaveButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on save button', async () => {
      await this.clickOnElement(this.saveButton, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifySuccessMessage(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying success message is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.successMessage, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Success message "Saved changes successfully" should be visible',
      });
    });
  }

  async addMobileNumberFromContactEdit(phoneNumber: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Adding mobile number from contact edit', async () => {
      await this.clickContactEditButton();
      await this.fillMobileNumberOnProfilePage(phoneNumber);
      await this.clickSaveButton();
      await this.verifySuccessMessage();
    });
  }

  async verifyMobileVerificationScreen(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying mobile verification screen is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.verificationHeading, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Verification heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.mobileVerificationHeading, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Mobile verification heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.otpSentToMobileHeading, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'OTP sent to mobile heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.enterOtpInput, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Enter OTP input should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.verifyButton, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Verify button should be visible',
      });
    });
  }

  async verifyOtpVerifiedSuccessToast(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying OTP verified successfully toast message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.otpVerifiedSuccessToast, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Toast message "OTP verified successfully" should be visible',
      });
    });
  }

  async verifyAccountVerificationAndContinue(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying account verification messages and clicking continue', async () => {
      await this.verifier.verifyTheElementIsVisible(this.accountVerifiedMessage, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Account verified message should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.dataSavedMessage, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Data saved message should be visible',
      });

      await this.clickOnElement(this.continueButton, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyMobileNumberIsDisplayed(phoneNumber: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying mobile number is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mobileNumberDisplay, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Mobile number display should be visible',
      });

      const displayedText = await this.mobileNumberDisplay.textContent();

      const expectedDigits = phoneNumber.replace(/\D/g, '');
      const displayedDigits = displayedText?.replace(/\D/g, '') || '';

      if (expectedDigits !== displayedDigits) {
        throw new Error(
          `Mobile number mismatch. Expected: ${phoneNumber} (digits: ${expectedDigits}), but found: ${displayedText} (digits: ${displayedDigits})`
        );
      }
    });
  }

  async enterOtpAndVerify(otpUtils: OTPUtils, phoneNumber: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Entering OTP and verifying', async () => {
      await this.page.waitForTimeout(8000);
      const otpValue = await otpUtils.getOTPFromSMS(phoneNumber);
      console.log(`Mobile OTP → ${otpValue}`);

      await this.enterOtpInput.fill(otpValue);
      await this.clickOnElement(this.verifyButton, {
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifyOtpVerifiedSuccessToast();
      await this.verifyAccountVerificationAndContinue();
    });
  }

  async addMobileNumberAndVerifyWithOtp(
    phoneNumber: string,
    otpUtils: OTPUtils,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(options?.stepInfo || 'Adding mobile number and verifying with OTP', async () => {
      await this.clickContactEditButton();
      await this.fillMobileNumberOnProfilePage(phoneNumber);
      await this.clickSaveButton();
      await this.verifyMobileVerificationScreen();
      await this.enterOtpAndVerify(otpUtils, phoneNumber);
      await this.verifyMobileNumberIsDisplayed(phoneNumber);
    });
  }
}
