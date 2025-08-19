import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS as rewardsEndpoint } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class RewardOptionsPage extends BasePage {
  readonly rewardsOptionsContainer: Locator;
  readonly rewardOptionLink: Locator;
  readonly rewardsOptionPageNotFound: Locator;
  readonly rewardsOptionsHeader: Locator;
  readonly searchElement: Locator;
  readonly searchInput: Locator;
  readonly searchInputClearButton: Locator;
  readonly searchButton: Locator;
  readonly rewardsOptionsShowMoreButton: Locator;
  private rewardsOptionsTableRow: Locator;
  private rewardsOptionsTableNoResults: Locator;
  private rewardOptionsTableContainer: Locator;
  private rewardsOptionsTableHeaders: Locator;
  private rewardsOptionsTableRewardLogo: Locator;
  private rewardsOptionsTableRowActionMenu: Locator;
  private rewardsOptionsTableRowActionButton: Locator;
  private rewardsOptionsTableStatusText: any;
  private rewardsOptionsTableStatusIndicator: any;
  private rewardsOptionsTableRewardName: Locator;
  private rewardsOptionsTableRewardCount: Locator;
  private rewardsOptionsTableRewardCountries: Locator;
  private rewardsOptionsTableRewardCurrencies: Locator;
  private rewardsOptionsTableRewardStatus: Locator;
  private successToastContainer: Locator;
  private successToastBoxMessage: Locator;
  private successToastBoxIcon: Locator;
  private successToastBoxClose: Locator;

  constructor(page: Page) {
    super(page);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.rewardsOptionsContainer = page.locator('div[class*="Rewards_content"]');
    this.rewardOptionLink = page.locator(`a[href="${rewardsEndpoint.rewardsOptionsPage}"] p`);
    this.rewardsOptionPageNotFound = page.getByTestId('no-results');
    this.rewardsOptionsHeader = this.rewardsOptionsContainer.locator('h2[class*="Typography-module__heading1"]');
    this.searchElement = this.rewardsOptionsContainer.locator('form[class*="SearchField_searchWrapper"]');
    this.searchInput = this.searchElement.getByRole('textbox', { name: 'Search…' });
    this.searchInputClearButton = this.searchElement.getByRole('button', { name: 'Clear' });
    this.searchButton = this.searchElement.getByRole('button', { name: 'Search' });

    // Table locators
    this.rewardOptionsTableContainer = this.rewardsOptionsContainer.locator('table[class*="Table-module__table"]');
    this.rewardsOptionsTableHeaders = this.rewardOptionsTableContainer.locator('thead tr th');
    this.rewardsOptionsTableNoResults = this.page.locator('[class*="DataGrid-module__emptyWrapper"] h3');
    // this.rewardsOptionsTableRow = this.page.getByTestId('dataGridRow');
    this.rewardsOptionsTableRow = this.page.locator('[data-testid*="dataGridRow"]');
    this.rewardsOptionsTableRewardLogo = this.rewardsOptionsTableRow.locator('td img');
    this.rewardsOptionsTableRewardName = this.rewardsOptionsTableRow.locator('td:nth-child(1) p');
    this.rewardsOptionsTableRewardCount = this.rewardsOptionsTableRow.locator('td:nth-child(2) p');
    this.rewardsOptionsTableRewardCountries = this.rewardsOptionsTableRow.locator('td:nth-child(3) p');
    this.rewardsOptionsTableRewardCurrencies = this.rewardsOptionsTableRow.locator('td:nth-child(4) p');
    this.rewardsOptionsTableRewardStatus = this.rewardsOptionsTableRow.locator(
      'span[class*="StatusTag-module__statusTag"]'
    );
    this.rewardsOptionsTableStatusIndicator = this.rewardsOptionsTableRewardStatus.locator(
      'span[class*="StatusTag-module__swatch"]'
    );
    this.rewardsOptionsTableStatusText = this.rewardsOptionsTableRewardStatus.locator(
      'span[class*="Typography-module__secondary"]'
    );
    this.rewardsOptionsTableRowActionButton = this.rewardsOptionsTableRow.locator('td button[aria-label="Show more"]');
    this.rewardsOptionsTableRowActionMenu = this.page.locator('[data-state="open"] [role="menuitem"] div');

    this.rewardsOptionsShowMoreButton = this.rewardsOptionsContainer.getByRole('button', { name: 'Show more' });

    // Success Toast message
    this.successToastContainer = page.locator('div.Toastify__toast-body'); // More stable container
    this.successToastBoxMessage = this.successToastContainer.locator('p').first(); // Message
    this.successToastBoxIcon = this.successToastContainer.locator('i[data-testid="i-checkLarge"]'); // Success icon
    this.successToastBoxClose = page.locator('button[aria-label="Dismiss"]'); // Close button
  }

  async visit(): Promise<void> {
    await this.page.goto(rewardsEndpoint.rewardsOptionsPage);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      assertionMessage: 'Verify the Reward options search input box is visible',
    });
  }

  async validateVisibilityOfRewardOptionsLink(expectingToBeVisible: boolean): Promise<void> {
    expectingToBeVisible
      ? await expect(this.rewardOptionLink).toBeVisible()
      : await expect(this.rewardOptionLink).toBeHidden();
  }

  async performSearchAndValidate(query: string, shouldHaveResults: boolean): Promise<void> {
    await test.step(`Enter a ${query} in the Reward search input and check result should be ${shouldHaveResults}`, async () => {
      await this.searchInput.fill(query);
      await expect(this.searchInputClearButton).toBeVisible();
      await this.searchButton.click();
      if (shouldHaveResults) {
        await this.verifier.verifyTheElementIsVisible(this.rewardsOptionsTableRow.last(), {
          assertionMessage: 'Verify the Reward name is visible in the search results',
        });
      } else {
        await this.verifier.verifyTheElementIsVisible(this.rewardsOptionsTableNoResults, {
          assertionMessage: 'Verify the No result for the Reward name is visible in the search results',
        });
      }
    });
  }

  async checkTheCopiedURLOfSearchResultInNewTab(giftCardName: string, visibility: boolean) {
    await test.step('Copy the URL and open in new tab and check the result', async () => {
      await this.performSearchAndValidate(giftCardName, visibility);
      const currentUrl = this.page.url();
      const newPage = await this.page.context().newPage();
      await newPage.goto(currentUrl);
      await expect(newPage.locator('input[aria-label="Search…"]')).toHaveValue('Amazon');
      await expect(this.rewardsOptionsTableRow.last()).toBeVisible();
      await expect(this.rewardsOptionsTableRewardLogo.last()).toBeVisible();
    });
  }

  async validateToastMessage(expectedMessage: string) {
    await test.step(`Validating the success toast message elements and clicking close.`, async () => {
      await this.successToastContainer.waitFor({ state: 'visible', timeout: 30000 });
      await expect(this.successToastContainer).toBeVisible();
      await expect(this.successToastBoxIcon).toBeVisible();
      await expect(this.successToastBoxMessage).toHaveText(expectedMessage);
      // Scroll into view before clicking
      await this.successToastBoxClose.scrollIntoViewIfNeeded();
      await this.successToastBoxClose.click({ force: true });
    });
  }

  async clickOnMenuItem(optionText: 'Activate' | 'Deactivate'): Promise<void> {
    const currentStatus: string = (await this.rewardsOptionsTableStatusText.textContent())?.trim() ?? '';
    if (currentStatus === optionText) {
      console.log(`The gift card is already in the "${optionText}" status, skipping the action.`);
      return;
    }
    await test.step(`Clicking on the "${optionText}" menu item.`, async () => {
      await this.rewardsOptionsTableRowActionButton.last().click();
      const menuItems = this.page.locator('[data-state="open"] [role="menuitem"] div');
      if (!(await menuItems.first().isVisible({ timeout: 5000 }))) {
        await this.rewardsOptionsTableRowActionButton.last().click();
      }
      const option = menuItems.filter({ hasText: optionText }).first();
      await option.click();
      const toastMessage = optionText === 'Activate' ? 'Rewards activated' : 'Rewards deactivated';
      await this.validateToastMessage(toastMessage);
    });
  }

  async setGiftCardState(rewardsOption: any, cardName: string, targetState: 'Active' | 'Inactive'): Promise<void> {
    await rewardsOption.visit();
    await rewardsOption.searchInput.fill(cardName);
    await rewardsOption.searchButton.click();
    await expect(rewardsOption.rewardsOptionsTableRewardName.last()).toBeVisible();

    const actionBtn = rewardsOption.rewardsOptionsTableRowActionButton.last();
    await actionBtn.waitFor({ state: 'visible' });
    await actionBtn.click();

    await rewardsOption.rewardsOptionsTableRowActionMenu.waitFor({ state: 'visible' });

    // Detect the current state by checking menu item
    const menuItemTexts = await rewardsOption.rewardsOptionsTableRowActionMenu.allInnerTexts();

    if (targetState === 'Active' && menuItemTexts.includes('Activate')) {
      await rewardsOption.clickOnMenuItem('Activate');
    } else if (targetState === 'Inactive' && menuItemTexts.includes('Deactivate')) {
      await rewardsOption.clickOnMenuItem('Deactivate');
    } else {
      // Already in the correct state
      await rewardsOption.page.keyboard.press('Escape'); // close menu
    }
  }
}
