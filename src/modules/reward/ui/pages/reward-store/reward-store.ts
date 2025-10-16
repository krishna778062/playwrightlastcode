import { expect, Locator, Page, test } from '@playwright/test';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardsDialogBox } from '@rewards-pages/reward-store/rewards-dialog-box';
import fs from 'fs';
import path from 'path';

import { PAGE_ENDPOINTS, PAGE_ENDPOINTS as rewardsEndpoint } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class RewardsStore extends BasePage {
  readonly rewardStorePageNotFound: Locator;
  readonly header: Locator;
  readonly pointsBalanceContainer: Locator;
  readonly pointToSpend: Locator;
  readonly pointToSpendText: Locator;
  readonly pendingPoints: Locator;
  readonly pointsBalanceIcon: Locator;
  readonly giftCardsTab: Locator;
  readonly prepaidCardsTab: Locator;
  readonly charityDonationsTab: Locator;
  readonly orderHistoryTab: Locator;
  readonly searchField: Locator;
  readonly searchButton: Locator;
  readonly rewardCategory: Locator;
  readonly rewardCountry: Locator;
  readonly firstTimeCountrySelectDropdown: Locator;
  readonly orderHistorySearchField: Locator;
  readonly noRewardsFoundHeading: Locator;
  readonly noRewardsFoundText: Locator;
  readonly giftCardCount: Locator;
  readonly resetButton: Locator;
  readonly legalTermText: Locator;
  readonly giftCardItems: Locator;
  readonly giftCardNames: Locator;
  readonly giftCardImages: Locator;
  readonly giftCardLabel: Locator;
  readonly giftCardPointAmount: Locator;
  readonly orderHistoryPanel: Locator;
  readonly orderHistoryPanelRewardName: Locator;
  readonly orderHistoryPanelRewardImage: Locator;
  readonly orderHistoryPanelRewardResendButton: Locator;
  readonly orderHistoryPanelRewardPrimaryEmail: Locator;
  readonly disabledResendButton: Locator;
  readonly resendOrderTooltip: Locator;
  readonly resentRewardDialog: Locator;
  readonly resentRewardDialogBoxEmailInput: Locator;
  readonly resentRewardDialogBoxConfirmEmailInput: Locator;
  readonly resentRewardDialogBoxEmailLabel: Locator;
  readonly resentRewardDialogBoxConfirmEmailLabel: Locator;
  readonly resentRewardDialogBoxDescription: Locator;
  readonly resentRewardDialogBoxHeading: Locator;
  readonly resentRewardDialogBoxCancel: Locator;
  readonly resentRewardDialogBoxResend: Locator;
  readonly resentRewardInvalidEmailError: Locator;
  readonly resentRewardDoNotMatchEmailError: Locator;
  readonly rewardsDialogBox: RewardsDialogBox;

  /**
   * This is a rewards store class that contains locators and methods for the rewards store page.
   */
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.REWARD_STORE_PAGE);
    // Locators for the rewards store page
    this.rewardStorePageNotFound = page.locator('[data-testid="no-results"]');
    this.header = page.getByRole('heading', { name: 'Rewards store' });
    this.pointsBalanceContainer = page.locator('[class*="PageHeader_container"] > div[class*="PageHeader_container"]');
    this.pointsBalanceIcon = this.pointsBalanceContainer.locator('div[class^="PageHeader_icon"]');
    this.pointToSpend = this.pointsBalanceContainer.locator('[class*="PageHeader_details"] p').nth(0);
    this.pointToSpendText = this.pointsBalanceContainer.locator('[class*="PageHeader_details"] p').nth(1);
    this.pendingPoints = this.pointsBalanceContainer.locator('[class*="PageHeader_details"] p').nth(2);
    this.giftCardsTab = page.getByRole('tab', { name: 'Gift cards' });
    this.prepaidCardsTab = page.getByRole('tab', { name: 'Prepaid cards' });
    this.charityDonationsTab = page.getByRole('tab', { name: 'Charity donations' });
    this.orderHistoryTab = page.getByRole('tab', { name: 'Order history' });
    this.searchField = page.locator('#q');
    this.searchButton = page.locator('[class^="UI_searchBar"] button[aria-label="Search"]');
    this.rewardCategory = page.locator('#categoryId');
    this.rewardCountry = page.locator('#countryCode');
    this.firstTimeCountrySelectDropdown = page.locator(
      '//div[text()="Select country…"]//following-sibling::div//input'
    );
    this.orderHistorySearchField = page.getByRole('textbox', { name: 'orders…' });
    this.noRewardsFoundHeading = page.getByRole('heading', { name: 'No rewards found' });
    this.noRewardsFoundText = page.getByText('Sorry, we couldn’t find any');
    this.giftCardCount = page.locator('[class*="UI_gridContainer"] > div > p');
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.legalTermText = page.locator('div[class*="Typography-module__secondary"]');
    // Gift card
    this.giftCardItems = page.locator('[class*="UI_listItem"][aria-label*="Redeem"]');
    this.giftCardNames = this.giftCardItems.locator('[class*="UI_brandName"]');
    this.giftCardImages = this.giftCardItems.locator('[class*="UI_image--"]');
    this.giftCardLabel = this.giftCardItems.locator('[class*="Distribute-module__apart"] p').nth(0);
    this.giftCardPointAmount = this.giftCardItems.locator('[class*="Distribute-module__apart"] p').nth(1);

    // Order history locators
    this.orderHistoryPanel = page.locator('[class*="OrderHistory_container"] ul li');
    this.orderHistoryPanelRewardName = this.orderHistoryPanel.locator(
      '[class*="OrderHistory_brandImage"]+div h2:nth-child(1)'
    );
    this.orderHistoryPanelRewardImage = this.orderHistoryPanel.locator('[class*="OrderHistory_brandImage"]');
    this.orderHistoryPanelRewardResendButton = this.orderHistoryPanel.locator(
      '[class*="OrderHistory_buttonContainer"] button'
    );
    this.orderHistoryPanelRewardPrimaryEmail = this.orderHistoryPanel.locator('div div[class*="OrderHistory_email"]');
    this.disabledResendButton = this.orderHistoryPanelRewardResendButton.filter({ hasText: 'Resend' });
    this.resendOrderTooltip = page.locator('[role="tooltip"]');
    this.resentRewardDialog = page.locator('[role="dialog"]');
    this.resentRewardDialogBoxEmailInput = this.resentRewardDialog.locator('[id="email"]');
    this.resentRewardDialogBoxConfirmEmailInput = this.resentRewardDialog.locator('[id="confirmEmail"]');
    this.resentRewardDialogBoxEmailLabel = this.resentRewardDialog.locator('label[for*="email"]');
    this.resentRewardDialogBoxConfirmEmailLabel = this.resentRewardDialog.locator('label[for*="confirm"]');
    this.resentRewardDialogBoxDescription = this.resentRewardDialog.locator('p[class*="Typography-module__paragraph"]');
    this.resentRewardDialogBoxHeading = this.resentRewardDialog.locator('h2[class*="Typography-module__heading"]');
    this.resentRewardDialogBoxCancel = this.resentRewardDialog.getByRole('button', { name: 'Cancel' });
    this.resentRewardDialogBoxResend = this.resentRewardDialog.getByRole('button', { name: 'Resend' });
    this.resentRewardInvalidEmailError = this.resentRewardDialog
      .locator('[class*="Field-module__error"]')
      .filter({ hasText: 'This is not a valid email address' });
    this.resentRewardDoNotMatchEmailError = this.resentRewardDialog
      .locator('[class*="Field-module__error"]')
      .filter({ hasText: 'Emails do not match' });

    // Dialog box
    this.rewardsDialogBox = new RewardsDialogBox(page);
  }

  /**
   * Navigates to the rewards store page.
   * @returns {Promise<void>}
   */
  async visit(): Promise<void> {
    await test.step('Navigate to the rewards store page via URL', async () => {
      await this.page.goto(rewardsEndpoint.REWARD_STORE_PAGE);
    });
  }

  async selectDropdownByLabel(locator: Locator, optionTextLabel: string) {
    await locator.selectOption(optionTextLabel);
  }

  async searchForGiftCard(searchTerm: string) {
    await this.searchField.waitFor({ state: 'visible', timeout: 15000 });
    await this.searchField.fill(''); // clear any previous input
    await this.searchField.fill(searchTerm);
    await this.searchButton.click({ force: true });
  }

  async selectCountry(countryName: string) {
    await this.selectDropdownByLabel(this.rewardCountry, countryName);
    await this.giftCardNames.last().waitFor({ state: 'visible', timeout: 20000 });
    const selectedOption = await this.rewardCountry.locator('option:checked').textContent();
    console.log('selected country:', selectedOption);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.giftCardNames.last(), {
      timeout: 30000,
      assertionMessage: 'Gift card page is loaded.',
    });
  }

  async verifyGiftCardVisibility(giftCardName: string, visibility: 'Active' | 'Inactive') {
    if (visibility === 'Active') {
      await this.verifyGiftCardVisible(giftCardName);
    } else {
      await this.verifyGiftCardNotVisible();
    }
  }

  async verifyGiftCardNotVisible() {
    await this.verifier.verifyTheElementIsVisible(this.noRewardsFoundHeading, {
      assertionMessage: 'Verify the Gift card is not visible in the search results',
    });
  }

  async verifyGiftCardVisible(giftCardName: string) {
    await this.verifier.verifyTheElementIsVisible(this.giftCardNames.first(), {
      assertionMessage: 'Verify the Reward name is visible in the search results',
    });
    await expect(this.giftCardNames.first()).toContainText(giftCardName);
  }

  async clickOnTheNthGiftCard(n: number) {
    await this.verifier.verifyTheElementIsVisible(this.giftCardItems.last(), {
      assertionMessage: ' Verify the gift card items are visible in the search results',
    });
    await this.giftCardItems.nth(n - 1).click();
  }

  async visitTheOrderHistory() {
    await this.clickOnElement(this.orderHistoryTab, {
      stepInfo: 'Clicking on order history tab',
    });
  }

  /**
   * Enable rewards and peer gifting if disabled,
   * This method checks the current state via API and enables both features if needed
   */
  async enableTheRewardStoreAndPeerGiftingIfDisabled() {
    const rewardStore = new RewardsStore(this.page);
    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        res =>
          res.url().includes('/recognition/v1/tenant/config') &&
          res.status() === 200 &&
          res.request().resourceType() === 'xhr' &&
          res.request().method() === 'GET'
      ),
      rewardStore.visit(), // action that triggers API
    ]);
    console.log('Status:', apiResponse.status(), 'URL:', apiResponse.url());
    const body = await apiResponse.json();
    console.log(`/recognition/v1/tenant/config Response is:\n${JSON.stringify(body, null, 2)}`);
    const isRewardEnabled = body.rewardConfig?.enabled;
    const isPeerGiftingDisabled = body.rewardConfig?.peerGiftingEnabled;
    console.log(
      `${test.info().title}: Rewards Enabled: ${isRewardEnabled}, Peer Gifting Enabled: ${isPeerGiftingDisabled}`
    );
    if (!isPeerGiftingDisabled || !isRewardEnabled) {
      const manageRecognitionPage = new ManageRewardsOverviewPage(this.page);
      await manageRecognitionPage.loadPage();
      await manageRecognitionPage.checkTheRewardsIsEnabled(isRewardEnabled, isPeerGiftingDisabled);
      await rewardStore.visit();
    }
  }

  async selectAndRedeemGiftCard(giftCardName: string) {
    await this.searchForGiftCard(giftCardName);
    await this.clickOnTheNthGiftCard(1);
    await this.rewardsDialogBox.clickOnTheCheckoutButton();
    await this.rewardsDialogBox.enterTheConfirmEmail();
    await this.rewardsDialogBox.checkTheTermsAndConditionCheckbox();
    await this.verifier.verifyTheElementIsEnabled(this.rewardsDialogBox.confirmOrder);
    await this.rewardsDialogBox.clickOnConfirmOrder();
  }

  /**
   * Checkout gift card for interruption testing
   */
  async checkOutTheGiftCardForInterruption(giftCardName: string): Promise<void> {
    await this.searchForGiftCard(giftCardName);
    await this.clickOnTheNthGiftCard(1);
    await this.rewardsDialogBox.clickOnTheCheckoutButton();
    await this.rewardsDialogBox.enterTheConfirmEmail();
    await this.rewardsDialogBox.checkTheTermsAndConditionCheckbox();
    await Promise.all([
      this.page.route('**/recognition/redemption/rewards/redeem', async route => {
        await route.abort(); // Simulates network interruption
      }),
      this.rewardsDialogBox.confirmOrder.click(),
    ]);
  }

  async validateSuccessMessage(heading: string, descriptions: string[]) {
    await this.verifier.verifyTheElementIsVisible(this.rewardsDialogBox.successOrderLogo);
    await this.verifier.verifyElementHasText(this.rewardsDialogBox.successOrderHeading, heading);
    if (descriptions.length === 1) {
      await this.verifier.verifyElementHasText(this.rewardsDialogBox.successOrderDescription, descriptions[0]);
    } else {
      await this.verifier.verifyElementHasText(this.rewardsDialogBox.successOrderDescription.first(), descriptions[0]);
      await this.verifier.verifyElementHasText(this.rewardsDialogBox.successOrderDescription.last(), descriptions[1]);
    }
    await this.rewardsDialogBox.closeTheSuccessDialogBox();
  }

  async redeemAndValidate({
    tab,
    giftCard,
    successMessage,
    additionalMessages = [],
  }: {
    tab: any;
    giftCard: string;
    successMessage: string;
    additionalMessages?: string[];
  }) {
    if (tab) {
      await this.clickOnElement(tab, {
        stepInfo: `Clicking on ${tab} tab`,
      });
    }
    await this.selectAndRedeemGiftCard(giftCard);
    await this.validateSuccessMessage(successMessage, additionalMessages);
    await this.visitTheOrderHistory();
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanel.first(), {
      timeout: 10000,
      assertionMessage: ' Verify the order history panel is visible',
    });
    await this.verifier.verifyElementContainsText(this.orderHistoryPanelRewardName.first(), giftCard, {
      timeout: 10000,
      assertionMessage: ' Verify the reward name in the order history panel',
    });
    await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanelRewardImage.first());
    await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanelRewardResendButton.first());
  }

  /**
   * Redeem gift card and validate with detailed order history verification
   */
  async redeemAndValidateWithOrderHistory({
    tab,
    giftCard,
    successMessage,
    additionalMessages = [],
  }: {
    tab: any;
    giftCard: string;
    successMessage: string;
    additionalMessages?: string[];
  }) {
    if (tab) {
      await this.clickOnElement(tab, {
        stepInfo: `Clicking on ${tab} tab`,
      });
    }
    await this.selectAndRedeemGiftCard(giftCard);
    await this.validateSuccessMessage(successMessage, additionalMessages);
    await this.validateOrderHistoryForGiftCard(giftCard);
  }

  /**
   * Validate order history for a specific gift card
   */
  async validateOrderHistoryForGiftCard(giftCard: string) {
    await this.visitTheOrderHistory();
    await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanel.first());
    await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanel.first().locator(`img[alt^="${giftCard}"]`));
    await this.verifier.verifyElementContainsText(this.orderHistoryPanelRewardName.first(), giftCard);
    await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanelRewardResendButton.first());
  }

  async mockTheAvailablePoints(pointToSpend: number) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const refreshingAt = nextMonth.toISOString();

    await this.page.route('**/recognition/rewards/users/**/wallet', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            gifting: {
              pendingIn: 0,
              available: 0,
              refreshingAt: refreshingAt,
            },
            redeemable: {
              pendingIn: 0,
              available: Number(pointToSpend),
            },
            redeemed: {
              pendingIn: 0,
              available: 0,
            },
          },
        }),
      })
    );
    await this.page.reload();
  }

  async verifyErrorScenario(giftCardName: string, mockPoints: number, inputAmount: number, expectedError: string) {
    await this.mockTheAvailablePoints(mockPoints);
    await this.searchForGiftCard(giftCardName);
    await this.clickOnTheNthGiftCard(1);
    await this.verifier.verifyTheElementIsVisible(this.rewardsDialogBox.container);
    await this.verifier.verifyElementContainsText(this.rewardsDialogBox.title, giftCardName);
    await this.fillInElement(this.rewardsDialogBox.rewardAmountInputBox, String(inputAmount), {
      stepInfo: 'Filling reward amount input box',
    });
    await this.rewardsDialogBox.rewardAmountInputBox.blur();
    await this.verifier.verifyTheElementIsVisible(this.rewardsDialogBox.rewardBalanceError);
    await this.verifier.verifyElementHasText(this.rewardsDialogBox.rewardBalanceError, expectedError);
    await this.clickOnElement(this.rewardsDialogBox.closeButton, {
      stepInfo: 'Clicking on close button',
    });
  }

  async verifyInsufficientFundsError(giftCardName: string, mockPoints: number) {
    await this.mockTheAvailablePoints(mockPoints);
    await this.searchForGiftCard(giftCardName);
    await this.clickOnTheNthGiftCard(1);
    await this.verifier.verifyTheElementIsVisible(this.rewardsDialogBox.container);
    await this.verifier.verifyElementContainsText(this.rewardsDialogBox.title, giftCardName);
    const availableAmountText = await this.rewardsDialogBox.rewardAmountsAvailablePoints.textContent();
    const availablePoints = availableAmountText
      ? Number(availableAmountText.match(/\d{1,3}(?:,\d{3})*|\d+/)?.[0]?.replace(/,/g, '') || '0')
      : 0;
    await this.fillInElement(this.rewardsDialogBox.rewardAmountInputBox, String(availablePoints + 5), {
      stepInfo: 'Filling reward amount input box',
    });
    await this.rewardsDialogBox.rewardAmountInputBox.blur();
    await this.verifier.verifyTheElementIsVisible(this.rewardsDialogBox.rewardBalanceError);
    await this.verifier.verifyElementHasText(this.rewardsDialogBox.rewardBalanceError, 'Insufficient funds.');
    await this.clickOnElement(this.rewardsDialogBox.closeButton, {
      stepInfo: 'Clicking on close button',
    });
  }

  async mockTheOrderAPIResponse() {
    await this.page.route('**/recognition/redemption/orders*', async route => {
      const fixture = await fs.promises.readFile(path.join(__dirname, '..', '..', 'fixtures', 'orders.json'), 'utf8');
      const data = JSON.parse(fixture);
      data.results[0].createdAt = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString();
      data.results[0].canResend = false;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
  }

  /**
   * Step 5: Validate the tooltip text for orders older than 90 days
   */
  async validateTheOrderResendForMoreThan90Days() {
    await this.verifier.verifyTheElementIsVisible(this.disabledResendButton.first(), {
      assertionMessage: ' Verify the disabled resend button is visible ',
    });
    await this.disabledResendButton.first().hover({ force: true });
    await this.resendOrderTooltip.waitFor({ state: 'visible', timeout: 5000 });
    await this.verifier.verifyTheElementIsVisible(this.resendOrderTooltip);
    await this.verifier.verifyElementHasText(
      this.resendOrderTooltip,
      'Rewards can only be resent within 90 days of your order date'
    );
  }

  async validateTheOrderHistoryElements() {
    await this.verifier.verifyTheElementIsVisible(this.orderHistorySearchField);
    const counts = await this.orderHistoryPanel.count();
    expect(counts).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < counts; i++) {
      await this.orderHistoryPanelRewardName.nth(i).scrollIntoViewIfNeeded();
      await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanelRewardName.nth(i));
      await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanelRewardImage.nth(i));
      await this.verifier.verifyTheElementIsVisible(this.orderHistoryPanelRewardResendButton.nth(i));
    }
  }

  async clickOnTheResendButton(number: number) {
    await this.orderHistoryPanelRewardResendButton.nth(number - 1).waitFor({ state: 'visible', timeout: 10000 });
    await this.clickOnElement(this.orderHistoryPanelRewardResendButton.nth(number - 1), {
      stepInfo: `Clicking on the ${number} indexed Resend order button`,
    });
  }

  async validateTheResendDialogElements() {
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialog);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxResend);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxDescription);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxEmailLabel);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxConfirmEmailLabel);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxEmailInput);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxConfirmEmailInput);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxCancel);
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxResend);
    await this.verifier.verifyTheElementIsDisabled(this.resentRewardDialogBoxResend);
  }

  async clickOnTheCancelButtonInResendReward() {
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDialogBoxCancel);
    await this.verifier.verifyTheElementIsEnabled(this.resentRewardDialogBoxCancel);
    await this.clickOnElement(this.resentRewardDialogBoxCancel, {
      stepInfo: 'Clicking on cancel button in resend reward dialog',
    });
    await this.verifier.verifyTheElementIsNotVisible(this.resentRewardDialog);
  }

  async enterAllTheDetailsAndClickOnResend(email: string) {
    const inputValue = await this.resentRewardDialogBoxEmailInput.inputValue();

    // Enter invalid email and validate error
    await this.fillInElement(this.resentRewardDialogBoxEmailInput, `${inputValue}@REWARDS`, {
      stepInfo: 'Entering invalid email',
    });
    await this.resentRewardDialogBoxConfirmEmailInput.click({ force: true });
    await this.verifier.verifyElementHasText(this.resentRewardInvalidEmailError, 'This is not a valid email address');
    await this.verifier.verifyTheElementIsDisabled(this.resentRewardDialogBoxResend);

    // Enter different email in confirm field and validate error
    await this.fillInElement(this.resentRewardDialogBoxConfirmEmailInput, 'sonu.kumar@simpplr.com', {
      stepInfo: 'Entering different email in confirm field',
    });
    await this.resentRewardDialogBoxEmailInput.click({ force: true });
    await this.verifier.verifyTheElementIsVisible(this.resentRewardDoNotMatchEmailError);
    await this.verifier.verifyElementHasText(this.resentRewardDoNotMatchEmailError, 'Emails do not match');
    await this.verifier.verifyTheElementIsDisabled(this.resentRewardDialogBoxResend);

    // Enter valid email and enable resend button
    if (email === 'primary') {
      await this.fillInElement(this.resentRewardDialogBoxEmailInput, inputValue, {
        stepInfo: 'Entering primary email',
      });
      await this.resentRewardDialogBoxEmailInput.blur();
      await this.fillInElement(this.resentRewardDialogBoxConfirmEmailInput, inputValue, {
        stepInfo: 'Confirming primary email',
      });
      await this.resentRewardDialogBoxConfirmEmailInput.blur();
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email format: ${email}`);
      }
      await this.fillInElement(this.resentRewardDialogBoxEmailInput, email, {
        stepInfo: 'Entering custom email',
      });
      await this.fillInElement(this.resentRewardDialogBoxConfirmEmailInput, email, {
        stepInfo: 'Confirming custom email',
      });
      await this.resentRewardDialogBoxConfirmEmailInput.blur();
    }
    await this.verifier.verifyTheElementIsEnabled(this.resentRewardDialogBoxResend);
    await this.clickOnElement(this.resentRewardDialogBoxResend, {
      stepInfo: 'Clicking on resend button',
    });
  }

  async validateTheResentConfirmation() {
    await this.verifyToastMessageIsVisibleWithText('Reward sent successfully');
  }

  /**
   * Login as standard user and navigate to rewards store
   */
  async loginAsStandardUserAndNavigateToRewardsStore(): Promise<void> {
    const { LoginHelper } = await import('@core/helpers/loginHelper');
    await LoginHelper.logoutByNavigatingToLogoutPage(this.page);
    await LoginHelper.loginWithPassword(this.page, {
      email: process.env.STANDARD_USER_USERNAME!,
      password: process.env.STANDARD_USER_PASSWORD!,
    });
    await this.loadPage();
    await this.verifier.verifyTheElementIsVisible(this.header);
    await this.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
  }

  /**
   * Select country and redeem gift card
   */
  async selectCountryAndRedeemGiftCard(countryName: string, giftCardName: string): Promise<void> {
    await this.selectCountry(countryName);
    await this.selectAndRedeemGiftCard(giftCardName);
    await this.validateSuccessMessage('Your reward has been sent', [
      'Please check your email inbox for your reward details',
    ]);
  }

  /**
   * Navigate to user profile and validate view orders functionality
   */
  async navigateToUserProfileAndValidateViewOrders(userProfilePage: any): Promise<void> {
    await userProfilePage.navigateToCurrentUserProfile();
    await userProfilePage.validateTheViewOrderButton();
    await userProfilePage.clickOnTheViewOrders();
    await this.verifier.verifyTheElementIsVisible(this.header);
    await this.verifier.waitUntilPageHasNavigatedTo('/rewards-store/order-history');
    await this.validateTheOrderHistoryElements();
  }

  /**
   * Redeem gift card with failure scenario
   */
  async redeemGiftCardWithFailure(countryName: string, giftCardName: string): Promise<void> {
    await this.selectCountry(countryName);
    await this.checkOutTheGiftCardForInterruption(giftCardName);
  }

  /**
   * Validate redemption failure dialog
   */
  async validateRedemptionFailure(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rewardsDialogBox.container);
    await this.verifier.verifyElementHasText(this.rewardsDialogBox.somethingWentWrongTitle, 'Something went wrong');
    await this.verifier.verifyElementHasText(
      this.rewardsDialogBox.somethingWentWrongDescription1,
      'There was an error processing your order. Please try again later.'
    );
    await this.verifier.verifyElementHasText(
      this.rewardsDialogBox.somethingWentWrongDescription2,
      'You have not been charged any points.'
    );
    await this.verifier.verifyTheElementIsVisible(this.rewardsDialogBox.somethingWentWrongCloseButton.last());
    await this.clickOnElement(this.rewardsDialogBox.somethingWentWrongCloseButton.last());
    await this.verifier.verifyTheElementIsNotVisible(this.rewardsDialogBox.container);
  }

  /**
   * Mock API for element checks
   */
  async mockTheAPIForElementChecks() {
    await this.page.route('**/recognition/rewards/users/**/wallet', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            gifting: {
              pendingIn: 0,
              available: 0,
              refreshingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            redeemable: {
              pendingIn: 100,
              available: 10000,
            },
            redeemed: {
              pendingIn: 0,
              available: 0,
            },
          },
        }),
      })
    );
    await this.page.reload();
  }

  /**
   * Get all API gift list
   */
  async getAllTheAPIGiftList(): Promise<string[]> {
    // Wait for the API response and navigate to the page
    const [response] = await Promise.all([
      this.page.waitForResponse(
        res => res.url().includes('/recognition/redemption/rewards/search') && res.status() === 200,
        { timeout: 15000 }
      ),
      this.visit(), // navigation
      this.verifyThePageIsLoaded(),
    ]);
    const data = await response.json();
    return data?.results?.map((item: any) => item?.brand?.brandName).filter((name: any) => name) || [];
  }

  /**
   * Get filtered API gift list - waits for search API response after search is performed
   */
  async getFilteredAPIGiftList(searchTerm: string): Promise<string[]> {
    // Wait for the search API response that should be triggered by the search action
    const response = await this.page.waitForResponse(
      res =>
        res.url().includes('/recognition/redemption/rewards/search') &&
        res.url().includes(`q=${searchTerm}`) &&
        res.status() === 200,
      { timeout: 15000 }
    );
    const data = await response.json();
    return data?.results?.map((item: any) => item?.brand?.brandName).filter((name: any) => name) || [];
  }

  /**
   * Validate all gift cards are in ascending order
   */
  async getAllTheGitCardAndValidateAllAreInAscendingOrder(apiGiftList: string[]) {
    await this.giftCardNames.last().waitFor();
    const count = await this.giftCardNames.count();
    const UIGiftList: string[] = [];

    for (let i = 0; i < count; i++) {
      const name = await this.giftCardNames.nth(i).textContent();
      if (name) {
        UIGiftList.push(name.trim());
      }
    }
    const trimmedUIGiftList = UIGiftList.map(name => name.trim());
    const trimmedAPIGiftList = apiGiftList.filter(name => name).map(name => name.trim());
    expect(trimmedUIGiftList).toEqual(trimmedAPIGiftList);
  }

  /**
   * Validate image rounded corners
   */
  async validateTheImageRoundedCorners() {
    const count = await this.giftCardImages.count();
    for (let i = 0; i < count; i++) {
      const image = this.giftCardImages.nth(i);
      await this.verifier.verifyTheElementIsVisible(image);
      // Check if the image has rounded corners by verifying CSS properties
      const borderRadius = await image.evaluate(el => {
        const computedStyle = window.getComputedStyle(el);
        return computedStyle.borderRadius;
      });
      expect(borderRadius).toBeTruthy();
    }
  }

  /**
   * Get all categories from the dropdown
   */
  async getAllCategories(): Promise<string[]> {
    await this.rewardCategory.waitFor({ state: 'visible' });
    const options = await this.rewardCategory.locator('option').all();
    const categories: string[] = [];

    for (const option of options) {
      const text = await option.textContent();
      if (text) {
        categories.push(text.trim());
      }
    }

    return categories;
  }

  /**
   * Get all countries from the dropdown
   */
  async getAllCountries(): Promise<string[]> {
    await this.rewardCountry.waitFor({ state: 'visible' });
    const options = await this.rewardCountry.locator('option').all();
    const countries: string[] = [];

    for (const option of options) {
      const text = await option.textContent();
      if (text) {
        countries.push(text.trim());
      }
    }

    return countries;
  }

  /**
   * Get cards locator by name
   */
  cards(name: string): Locator {
    return this.page.getByRole('button', { name: `Redeem ${name}` });
  }

  /**
   * Mock the reward API for new user
   */
  async mockTheRewardAPIForNewUser() {
    await this.page.route('**/recognition/rewards/users/me/preferences/redemption', async (route, request) => {
      const res = await this.page.request.fetch(request);
      const body = await res.json();
      body.result.countryCode = '';
      await route.fulfill({
        status: res.status(),
        contentType: res.headers()['content-type'] || 'application/json',
        body: JSON.stringify(body),
      });
    });
    await this.page.reload();
  }
}
