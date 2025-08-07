import { expect, Locator, Page } from '@playwright/test';

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

  constructor(page: Page) {
    super(page);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.rewardsOptionsContainer = page.locator('div[class*="Rewards_content"]');
    this.rewardOptionLink = page.locator(`a[href="${rewardsEndpoint.rewardsOptionsPage}"] p`);
    this.rewardsOptionPageNotFound = page.getByTestId('no-results');
    this.rewardsOptionsHeader = this.rewardsOptionsContainer.locator('h2[class*="Typography-module__heading1"]');
    this.searchElement = this.rewardsOptionsContainer.locator('form[class*="SearchField_searchWrapper]');
    this.searchInput = this.searchElement.locator('input[aria-label="Search…"]');
    this.searchInputClearButton = this.searchElement.locator('button[aria-label="Clear"]');
    this.searchButton = this.searchElement.locator('button[aria-label="Search"]');
    this.rewardsOptionsShowMoreButton = this.rewardsOptionsContainer.getByRole('button', { name: 'Show more' });
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
}
