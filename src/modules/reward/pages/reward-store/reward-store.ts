import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS, PAGE_ENDPOINTS as rewardsEndpoint } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';
import { ManageRewardsPage } from '@modules/reward/pages/manage-rewards/manage-rewards-page';
import { RewardsDialogBox } from '@modules/reward/pages/reward-store/rewards-dialog-box';

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

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
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

  async enableTheRewardStoreAndPeerGiftingIfDisabled() {
    const manageRewardsPage = new ManageRewardsPage(this.page);

    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();

    // Enable rewards if disabled
    const isRewardsEnabled = await manageRewardsPage.verifier.isTheElementVisible(
      manageRewardsPage.enableRewardsButton,
      { timeout: 5000 }
    );
    if (isRewardsEnabled) {
      await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
        stepInfo: 'Enabling rewards if disabled',
      });
      await manageRewardsPage.verifyToastMessage('Rewards enabled');
    }

    await this.visit();
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

  async mockTheAvailablePoints(pointToSpend: number) {
    // Get next month's first day
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
}
