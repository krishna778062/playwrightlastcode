import { Locator, Page, test } from '@playwright/test';
import Error from 'es-errors';

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
  // order history page elements
  readonly orderHistoryContainer: Locator;
  readonly orderHistoryPanel: Locator;
  readonly orderHistoryPanelRewardLogo: Locator;
  readonly orderHistoryPanelRewardName: Locator;
  readonly orderHistoryPanelRewardPrimaryEmail: Locator;
  readonly orderHistoryPanelRewardResendButton: Locator;
  readonly resentRewardDialog: Locator;
  readonly resentRewardDialogBoxHeading: Locator;
  readonly resentRewardDialogBoxDescription: Locator;
  readonly resentRewardDialogBoxEmailLabel: Locator;
  readonly resentRewardDialogBoxEmailInput: Locator;
  readonly resentRewardInvalidEmailError: Locator;
  readonly resentRewardDialogBoxConfirmEmailLabel: Locator;
  readonly resentRewardDialogBoxConfirmEmailInput: Locator;
  readonly resentRewardDoNotMatchEmailError: Locator;
  readonly resentRewardDialogBoxCancel: Locator;
  readonly resentRewardDialogBoxResend: Locator;
  readonly disabledResendButton: Locator;
  readonly resendOrderTooltip: Locator;
  readonly giftCardItems: Locator;
  readonly giftCardNames: Locator;
  readonly giftCardImages: Locator;
  readonly giftCardLabel: Locator;
  readonly giftCardPointAmount: Locator;

  /**
   * This method returns a locator for the redeem button of a specific gift card.
   * @returns {Locator} - The locator for the redeem button
   * @param name
   */
  cards(name: string): Locator {
    return this.page.getByRole('button', { name: `Redeem ${name}` });
  }

  /**
   * This is a rewards store class that contains locators and methods for the rewards store page.
   */
  constructor(page: Page) {
    super(page);
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
    this.giftCardItems = page.locator('[class*="UI_listItem"]');
    this.giftCardNames = this.giftCardItems.locator('[class*="UI_brandName"]');
    this.giftCardImages = this.giftCardItems.locator('[class*="UI_image--"]');
    this.giftCardLabel = this.giftCardItems.locator('[class*="Distribute-module__apart"] p').nth(0);
    this.giftCardPointAmount = this.giftCardItems.locator('[class*="Distribute-module__apart"] p').nth(1);
    // order history page
    this.orderHistoryContainer = page.locator('[class*="OrderHistory_container"]');
    this.orderHistoryPanel = this.orderHistoryContainer.locator('[class*="Panel-module__panel"]');
    this.orderHistoryPanelRewardLogo = this.orderHistoryPanel.locator('img[class^="OrderHistory_brandImage"]');
    this.orderHistoryPanelRewardName = this.orderHistoryPanel.locator('div h2:nth-child(1)');
    this.orderHistoryPanelRewardPrimaryEmail = this.orderHistoryPanel.locator('div div[class*="OrderHistory_email"]');
    this.orderHistoryPanelRewardResendButton = this.orderHistoryPanel.locator('button');
    //resent dialog box
    this.resentRewardDialog = page.locator('[role="dialog"]');
    this.resentRewardDialogBoxHeading = this.resentRewardDialog.locator('h2 span');
    this.resentRewardDialogBoxDescription = this.resentRewardDialog.locator('p[class*="Typography-module__paragraph"]');
    this.resentRewardDialogBoxEmailLabel = this.resentRewardDialog.getByText('Email address*');
    this.resentRewardDialogBoxEmailInput = this.resentRewardDialog.getByRole('textbox', { name: 'Email address*' });
    this.resentRewardInvalidEmailError = this.resentRewardDialog.getByText('This is not a valid email');
    this.resentRewardDialogBoxConfirmEmailLabel = this.resentRewardDialog.getByText('Confirm email*');
    this.resentRewardDialogBoxConfirmEmailInput = this.resentRewardDialog.getByRole('textbox', {
      name: 'Confirm email*',
    });
    this.resentRewardDoNotMatchEmailError = this.resentRewardDialog.getByText('Emails do not match');
    this.resentRewardDialogBoxCancel = this.resentRewardDialog.getByRole('button', { name: 'Cancel' });
    this.resentRewardDialogBoxResend = this.resentRewardDialog.locator('button[type="submit"]');
    this.disabledResendButton = page.locator('[class*="OrderHistory_buttonContainer"] button');
    this.resendOrderTooltip = page.locator('[role="tooltip"]');
  }

  /**
   * Navigates to the rewards store page.
   * @returns {Promise<void>}
   */
  async visit(): Promise<void> {
    await test.step('Navigate to the rewards store page via URL', async () => {
      await this.page.goto('/rewards-store/gift-cards');
    });
  }

  /**
   * Navigates to the Order history in rewards store page.
   * @returns {Promise<void>}
   */
  async visitTheOrderHistory(): Promise<void> {
    await test.step('Navigate to the Order history page in rewards store page via URL', async () => {
      await this.page.goto('/rewards-store/order-history');
    });
  }

  async selectDropdownByLabel(locator: Locator, optionTextLabel: string) {
    await locator.waitFor({ state: 'visible' });
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
    const countrySelected = selectedOption?.trim();
    if (countrySelected !== countryName) {
      throw new Error(`Failed to select country: ${countryName}`);
    }
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
