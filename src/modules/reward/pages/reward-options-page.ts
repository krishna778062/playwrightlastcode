import { expect, Locator, Page } from '@playwright/test';
import { rewardsEndpoint } from '@rewards/constants/pageEndpoint';

import { BasePage } from '@core/pages/basePage';

export class RewardOptionsPage extends BasePage {
  readonly rewardsOptionsContainer: Locator;
  readonly rewardsOptionsNotFound: Locator;
  readonly rewardOptionLink: Locator;
  readonly rewardsOptionPageNotFound: Locator;
  readonly rewardsOptionsHeader: Locator;
  readonly searchInput: Locator;
  readonly searchInputClearButton: Locator;
  readonly searchButton: Locator;
  readonly rewardsOptionsShowMoreButton: Locator;

  constructor(page: Page) {
    super(page);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.rewardsOptionsContainer = page.locator('div[class*="Rewards_content"]');
    this.rewardsOptionsNotFound = page.locator('[data-testid="no-results"]');
    this.rewardOptionLink = page.locator('[href="/manage/recognition/rewards/reward-options"] p');
    this.rewardsOptionPageNotFound = page.locator('[data-testid="no-results"]');
    this.rewardsOptionsHeader = this.rewardsOptionsContainer.locator('h2[class*="Typography-module__heading1"]');
    this.searchInput = this.rewardsOptionsContainer.locator('input[aria-label="Search…"]');
    this.searchInputClearButton = this.rewardsOptionsContainer.locator(
      '[class*="SearchField_searchWrapper"] button[aria-label="Clear"]'
    );
    this.searchButton = this.rewardsOptionsContainer.locator('button[aria-label="Search"]');
    this.rewardsOptionsShowMoreButton = this.rewardsOptionsContainer.locator(
      '//button[text()="Show more" and contains(@class,"Button-module__button")]'
    );
  }

  async visit(): Promise<void> {
    await this.page.goto(rewardsEndpoint.rewardsOptionsPage);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      assertionMessage: 'Verify the Reward options search input box is visible',
    });
  }

  async validateVisibilityOfRewardOptionsLink(expectingToBeVisible: boolean): Promise<void> {
    expectingToBeVisible
      ? await expect(this.rewardOptionLink).toBeVisible()
      : await expect(this.rewardOptionLink).toBeHidden();
    expectingToBeVisible
      ? await expect(this.rewardsOptionsNotFound).toBeHidden()
      : await expect(this.rewardOptionLink).toBeVisible();
  }
}
