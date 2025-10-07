import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class RewardsDialogBox extends BasePage {
  readonly container: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly description: Locator;
  readonly descriptionTextShowMoreButton: Locator;
  readonly pointsAvailable: Locator;
  readonly selectRewardValueLabel: Locator;
  readonly selectRewardValueDropdown: Locator;
  readonly checkoutButton: Locator;
  readonly termsText: Locator;
  readonly termsAndConditionCheckbox: Locator;
  readonly emailInputBox: Locator;
  readonly confirmEmailInputBox: Locator;
  readonly confirmOrder: Locator;
  readonly successOrderLogo: Locator;
  readonly successOrderHeading: Locator;
  readonly successOrderDescription: Locator;
  readonly successOrderCloseButton: Locator;
  readonly emailInputBoxLabel: Locator;
  readonly confirmOrderCloseButton: Locator;
  readonly confirmOrderBackButton: Locator;
  readonly confirmOrderCancelButton: Locator;
  readonly InvalidEmailError: Locator;
  readonly DoNotMatchEmailError: Locator;
  readonly somethingWentWrongTitle: Locator;
  readonly somethingWentWrongDescription1: Locator;
  readonly somethingWentWrongDescription2: Locator;
  readonly somethingWentWrongCloseButton: Locator;
  readonly rewardBalanceError: Locator;
  readonly rewardAmountInputBox: Locator;
  readonly rewardAmountOptionsLimitAndAvailableContainer: Locator;
  readonly rewardAmountsLimits: Locator;
  readonly rewardAmountsAvailablePoints: Locator;
  readonly redemptionZeroPointErrorDialogBox: Locator;
  readonly zeroBalanceError: Locator;

  constructor(page: Page) {
    super(page);
    // Locators for the rewards dialog box
    this.container = page.getByRole('dialog');
    this.title = this.container.getByRole('heading').first();
    this.closeButton = this.container.getByRole('button', { name: 'Close' });
    this.description = this.container.locator('[data-testid="truncate-text-block"] p').first();
    this.descriptionTextShowMoreButton = this.container.locator('[data-testid="truncate-text-block"] + div button');
    this.pointsAvailable = this.container.getByText('points available');
    this.selectRewardValueLabel = this.container.getByText('Select your reward value');
    this.selectRewardValueDropdown = this.container.getByTestId('SelectInput');
    this.checkoutButton = this.container.getByRole('button', { name: 'Checkout' });
    this.termsText = this.container.getByText('terms');
    this.termsAndConditionCheckbox = this.container.locator('[id="confirmation_termsAndConditions"]');
    this.emailInputBox = this.container.getByRole('textbox', { name: 'Email address' });
    this.confirmEmailInputBox = this.container.getByRole('textbox', { name: 'Confirm email' });
    this.emailInputBoxLabel = this.container.locator('[data-testid="field-Email address"]').locator('label');
    this.confirmOrder = this.container.getByRole('button', { name: 'Confirm order' });
    this.confirmOrderCloseButton = this.container.locator('[aria-label="Close"]');
    this.confirmOrderBackButton = this.container.locator('[aria-label="Back"]');
    this.confirmOrderCancelButton = this.container.getByRole('button', { name: 'Cancel' });
    this.successOrderLogo = this.container.locator('div[class^="RedemptionDialog_successIllustration"]');
    this.successOrderHeading = this.container.getByRole('heading', { level: 4 });
    this.successOrderDescription = this.container.locator('p[class*="Typography-module__paragraph"]');
    this.successOrderCloseButton = this.container.getByText('Close');
    this.InvalidEmailError = this.container.getByText('This is not a valid email');
    this.DoNotMatchEmailError = this.container.getByText('Emails do not match');
    this.somethingWentWrongTitle = this.container.getByText('Something went wrong');
    this.somethingWentWrongDescription1 = this.container.getByText(
      'There was an error processing your order. Please try again later.'
    );
    this.somethingWentWrongDescription2 = this.container.getByText('You have not been charged any points.');
    this.somethingWentWrongCloseButton = this.container.getByRole('button', { name: 'Close' });
    this.rewardBalanceError = this.container.locator(
      'div[class*="RedemptionDialog_field"] div[class^="Field-module__error"] > p'
    );
    this.rewardAmountInputBox = this.container.locator('input[id="reward_points"]');
    this.rewardAmountOptionsLimitAndAvailableContainer = this.container.locator(
      'div[class*="RedemptionDialog_customPanel"]'
    );
    this.rewardAmountsLimits = this.rewardAmountOptionsLimitAndAvailableContainer.locator('p:nth-child(1)');
    this.rewardAmountsAvailablePoints = this.rewardAmountOptionsLimitAndAvailableContainer.locator('p:nth-child(2)');

    // 0 point error dialog box
    this.redemptionZeroPointErrorDialogBox = page.locator('div[class*="RedemptionDialog_errorPanel"]');
    this.zeroBalanceError = this.redemptionZeroPointErrorDialogBox.locator('p').last();
  }

  /**
   * This method returns a locator for the logo element.
   * @param logoName - The name of the logo to be located
   * @returns - A Locator for the logo element
   */
  logo(logoName: string): Locator {
    return this.container.getByRole('img', { name: logoName });
  }

  /**
   * It'll click the <- Arrow button in the "Confirm your order" dialog box
   */
  async clickOnBackArrowButton() {
    await this.clickOnElement(this.confirmOrderBackButton, {
      stepInfo: 'Clicking on back arrow button',
    });
  }

  /**
   * It'll click the Close button (X) in the "Confirm your order" dialog box
   */
  async clickOnCloseButton() {
    await this.clickOnElement(this.confirmOrderCloseButton, {
      stepInfo: 'Clicking on close button',
    });
  }

  /**
   * It'll click the Cancel button in the "Confirm your order" dialog box
   */
  async clickOnCancelButton() {
    await this.clickOnElement(this.confirmOrderCancelButton, {
      stepInfo: 'Clicking on cancel button',
    });
  }

  /**
   * It'll check the Terms and condition checkbox
   */
  async checkTheTermsAndConditionCheckbox() {
    await this.clickOnElement(this.termsAndConditionCheckbox, {
      stepInfo: 'Checking terms and condition checkbox',
    });
  }

  /**
   * Enter Invalid email in the email address box of the Confirm your order -> "Email address" input box
   */
  async enterTheInvalidEmailInEmailAddressInputBox() {
    await this.fillInElement(this.emailInputBox, 'sonu.kumar@simpplr.com@REWARDS', {
      stepInfo: 'Entering invalid email',
    });
    await this.clickOnElement(this.emailInputBoxLabel, {
      stepInfo: 'Clicking on email input label',
    });
  }

  /**
   * Enter Invalid email in the email address box of the Confirm your order -> "Email address" input box
   */
  async enterTheDifferentEmailInConfirmEmailAddressInputBox() {
    await this.fillInElement(this.confirmEmailInputBox, 'sonu.kumar@simpplr.com', {
      stepInfo: 'Entering different email in confirm email',
    });
    await this.clickOnElement(this.emailInputBoxLabel, {
      stepInfo: 'Clicking on email input label',
    });
  }

  /**
   * Enter the Primary email (user email address)
   * in the Confirm email address box of the Confirm your order -> "Confirm email" input
   */
  async enterTheConfirmEmail() {
    const inputValue = await this.emailInputBox.inputValue();
    await this.fillInElement(this.confirmEmailInputBox, inputValue, {
      stepInfo: 'Entering confirm email',
    });
  }

  /**
   * Click on the Checkout button on Gift card dialog box
   */
  async clickOnTheCheckoutButton() {
    await this.clickOnElement(this.checkoutButton, {
      stepInfo: 'Clicking on checkout button',
    });
  }

  /**
   * Validate the Order Success dialog box
   * 1. Logo
   * 2. Heading
   * 3. Description
   * 4. Close button
   * 5. And Click on the Close button To close the Success Dialog box.
   */
  async closeTheSuccessDialogBox() {
    await this.clickOnElement(this.successOrderCloseButton.last(), {
      stepInfo: 'Closing success dialog box',
    });
  }

  async clickOnConfirmOrder() {
    await this.verifier.verifyTheElementIsEnabled(this.confirmOrder);
    // Wait for the API to complete after clicking the button
    const [response] = await Promise.all([
      this.page.waitForResponse(
        response => response.url().includes('/redemption/rewards/redeem') && response.status() === 200
      ),
      this.clickOnElement(this.confirmOrder, {
        stepInfo: 'Clicking on confirm order button',
      }),
    ]);
    // Optionally assert the response
    expect(response.ok()).toBeTruthy();
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
