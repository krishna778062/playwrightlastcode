import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS as rewardsEndpoint } from '@core/constants/pageEndpoints';
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
  }

  /**
   * Navigates to the rewards store page.
   * @returns {Promise<void>}
   */
  async visit(): Promise<void> {
    await test.step('Navigate to the rewards store page via URL', async () => {
      await this.page.goto(rewardsEndpoint.rewardStorePage);
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

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
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
}
