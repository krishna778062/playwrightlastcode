import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS, PAGE_ENDPOINTS as rewardsEndpoint } from '@core/constants/pageEndpoints';
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
  readonly rewardsOptionsTableRow: Locator;
  readonly rewardsOptionsTableNoResults: Locator;
  readonly rewardOptionsTableContainer: Locator;
  readonly rewardsOptionsTableHeaders: Locator;
  readonly rewardsOptionsTableRewardLogo: Locator;
  readonly rewardsOptionsTableRowActionMenu: Locator;
  readonly rewardsOptionsTableRowActionButton: Locator;
  readonly rewardsOptionsTableStatusText: any;
  readonly rewardsOptionsTableStatusIndicator: any;
  readonly rewardsOptionsTableRewardName: Locator;
  readonly rewardsOptionsTableRewardCount: Locator;
  readonly rewardsOptionsTableRewardCountries: Locator;
  readonly rewardsOptionsTableRewardCurrencies: Locator;
  readonly rewardsOptionsTableRewardStatus: Locator;
  readonly successToastContainer: Locator;
  readonly successToastBoxMessage: Locator;
  readonly successToastBoxIcon: Locator;
  readonly successToastBoxClose: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.REWARDS_OPTIONS_PAGE);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.rewardsOptionsContainer = page.locator('div[class*="Rewards_content"]');
    this.rewardOptionLink = page.locator(`a[href="${rewardsEndpoint.REWARDS_OPTIONS_PAGE}"] p`);
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
    this.successToastBoxClose = page.getByRole('button', { name: 'Dismiss' }); // Close button
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

  /**
   * Performs a search and validates the results.
   * @param query - The query to search for.
   * @param shouldHaveResults - Whether the results should be visible.
   */
  async performSearchAndValidate(query: string, shouldHaveResults: boolean): Promise<void> {
    await test.step(`Enter a ${query} in the Reward search input and check result should be ${shouldHaveResults}`, async () => {
      await this.fillInElement(this.searchInput, query, {
        stepInfo: 'Filling the search input',
      });
      await this.verifier.verifyTheElementIsVisible(this.searchInputClearButton, {
        assertionMessage: 'Verify the search input clear button is visible',
      });
      await this.clickOnElement(this.searchButton, {
        stepInfo: 'Clicking on the search button',
      });
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

  /**
   * Checks the copied URL of the search result in a new tab.
   * @param giftCardName - The name of the gift card to search for.
   * @param visibility - Whether the gift card should be visible.
   */
  async checkTheCopiedURLOfSearchResultInNewTab(giftCardName: string, visibility: boolean) {
    await test.step('Copy the URL and open in new tab and check the result', async () => {
      await this.performSearchAndValidate(giftCardName, visibility);
      const currentUrl = this.page.url();
      const newPage = await this.page.context().newPage();
      await newPage.goto(currentUrl);
      await this.verifier.verifyTheElementIsVisible(newPage.locator('input[aria-label="Search…"]'), {
        assertionMessage: 'Verify the search input is visible in the new tab',
      });
      await this.verifier.verifyTheElementIsVisible(this.rewardsOptionsTableRow.last(), {
        assertionMessage: 'Verify the Reward name is visible in the search results in the new tab',
      });
      await this.verifier.verifyTheElementIsVisible(this.rewardsOptionsTableRewardLogo.last(), {
        assertionMessage: 'Verify the Reward logo is visible in the search results in the new tab',
      });
    });
  }

  async validateToastMessage(expectedMessage: string) {
    await test.step(`Validating the success toast message elements and clicking close.`, async () => {
      await this.successToastContainer.waitFor({ state: 'visible', timeout: 30000 });
      await this.verifier.verifyTheElementIsVisible(this.successToastContainer, {
        assertionMessage: 'Verify success toast container is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.successToastBoxIcon, {
        assertionMessage: 'Verify success toast icon is visible',
      });
      await this.verifier.verifyElementContainsText(this.successToastBoxMessage, expectedMessage);
      // Scroll into view before clicking
      await this.clickOnElement(this.successToastBoxClose, {
        stepInfo: 'Clicking on the success toast close button',
      });
    });
  }

  /**
   * Clicks on the menu item for the given option text.
   * @param optionText - The text of the menu item to click.
   */
  async clickOnMenuItem(optionText: 'Activate' | 'Deactivate'): Promise<void> {
    /**
     * We first check the current status of the gift card and if it is already in the target state, we skip the action.
     * If it is not in the target state, we click on the action button and check if the menu item is visible.
     * If the menu item is not visible, we click on the action button again.
     * If the menu item is visible, we click on the menu item.
     */
    const currentStatus: string = (await this.rewardsOptionsTableStatusText.textContent())?.trim() ?? '';
    if (currentStatus === optionText) {
      console.log(`The gift card is already in the "${optionText}" status, skipping the action.`);
      return;
    }
    await test.step(`Clicking on the "${optionText}" menu item.`, async () => {
      await this.clickOnElement(this.rewardsOptionsTableRowActionButton.last(), {
        stepInfo: 'Clicking on the action button',
      });
      const menuItems = this.page.locator('[data-state="open"] [role="menuitem"] div');
      try {
        await expect(menuItems.first(), `expecting menu item to be visible`).toBeVisible({ timeout: 2_000 });
      } catch (error) {
        console.log('Retry click: Menu item is not visible, clicking on the action button again');
        await this.clickOnElement(this.rewardsOptionsTableRowActionButton.last(), {
          stepInfo: 'Clicking on the action button again as the menu item is not visible',
        });
      }

      const option = menuItems.filter({ hasText: optionText }).first();
      await this.clickOnElement(option, { stepInfo: 'Clicking on the menu item' });
      const toastMessage = optionText === 'Activate' ? 'Rewards activated' : 'Rewards deactivated';
      await this.validateToastMessage(toastMessage);
    });
  }

  async setGiftCardState(rewardsOption: any, cardName: string, targetState: 'Active' | 'Inactive'): Promise<void> {
    await rewardsOption.loadPage();
    await rewardsOption.searchInput.fill(cardName);
    await rewardsOption.searchButton.click();
    await expect(
      rewardsOption.rewardsOptionsTableRewardName.last(),
      `expecting the gift card to be visible in the search results for ${cardName}`
    ).toBeVisible();

    const actionBtn = rewardsOption.rewardsOptionsTableRowActionButton.last();
    await this.clickOnElement(actionBtn, { stepInfo: 'Clicking on action button' });
    await this.verifier.verifyTheElementIsVisible(rewardsOption.rewardsOptionsTableRowActionMenu, {
      assertionMessage: 'Verify the action menu is visible',
    });
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

  /**
   * Validates column sorting functionality
   * @param columnName - The name of the column to test sorting
   * @param isSortable - Whether the column should be sortable
   */
  async validateColumnSorting(columnName: string, isSortable: boolean): Promise<void> {
    const columnHeader = this.rewardsOptionsTableHeaders.getByText(columnName);
    const columnIndex = await columnHeader.evaluate(el => Array.from(el.parentElement!.children).indexOf(el) + 1);
    const columnCells = this.page.locator(`tbody tr td:nth-child(${columnIndex})`);
    const originalValues = await columnCells.allTextContents();

    await this.clickOnElement(columnHeader, {
      stepInfo: `Clicking on ${columnName} column header`,
    });
    await this.rewardsOptionsTableRow.last().waitFor({ state: 'visible', timeout: 5000 });
    const afterClickValues = await columnCells.allTextContents();

    if (isSortable) {
      expect(afterClickValues).not.toEqual(originalValues);
    } else {
      expect(afterClickValues).toEqual(originalValues);
    }
  }

  /**
   * Sets the rewards options feature flag
   * @param enabled - Whether to enable or disable the feature flag
   */
  async setTheRewardsOptionsFeatureFlag(enabled: boolean): Promise<void> {
    await this.page.route('**/api/1.0/client/env/**/target/**/evaluations?cluster=2', async route => {
      const response = await route.fetch();
      const body = await response.json();

      const updatedBody = body.map((item: any) => {
        if (item.flag === 'rewards_options') {
          return {
            ...item,
            value: enabled.toString(),
            identifier: enabled.toString(),
          };
        }
        return item;
      });

      await route.fulfill({
        response,
        body: JSON.stringify(updatedBody),
        headers: {
          ...response.headers(),
          'content-type': 'application/json',
        },
      });
    });
    await this.page.reload();
  }

  /**
   * Validates the show more button functionality
   */
  async validateShowMoreButton(): Promise<{ totalRewards: number; displayedRewards: number }> {
    let latestApiResponse: any = null;

    // Listen for API responses for brands search
    this.page.on('response', async response => {
      if (response.url().includes('/recognition/admin/rewards/store/brands/search?') && response.status() === 200) {
        latestApiResponse = await response.json();
      }
    });

    // Trigger initial visit & search to get the first API response
    await this.loadPage();
    await this.searchInput.fill('Amazon');
    await this.clickOnElement(this.searchButton, {
      stepInfo: 'Clicking on search button',
    });
    await this.rewardsOptionsTableRow.last().waitFor({ state: 'visible', timeout: 5000 });

    const totalRewards = latestApiResponse.total;
    let displayedRewards = await this.rewardsOptionsTableRow.count();

    // If total ≤ 10, Show More should NOT exist
    if (totalRewards <= 10) {
      await expect(this.page.locator('text=Show more')).toHaveCount(0);
      expect(displayedRewards).toBe(totalRewards);
      return { totalRewards, displayedRewards };
    }

    // If total > 10, Show More should be visible
    const showMoreButton = this.page.locator('text=Show more');
    await expect(showMoreButton).toBeVisible();

    while (displayedRewards < totalRewards) {
      const [apiResponse] = await Promise.all([
        this.page.waitForResponse(
          response =>
            response.url().includes('/recognition/admin/rewards/store/brands/search?') && response.status() === 200
        ),
        showMoreButton.scrollIntoViewIfNeeded().then(() => showMoreButton.click()),
      ]);
      await this.rewardsOptionsTableRow.last().waitFor({ state: 'attached', timeout: 5000 });
      const newDisplayedRewards = await this.rewardsOptionsTableRow.count();
      expect(newDisplayedRewards).toBeGreaterThan(displayedRewards);
      displayedRewards = newDisplayedRewards;
      if (displayedRewards < totalRewards) {
        await expect(showMoreButton).toBeVisible(); // Should still be visible
      }
    }

    await expect(showMoreButton).toHaveCount(0);
    expect(displayedRewards).toBe(totalRewards);
    return { totalRewards, displayedRewards };
  }
}
