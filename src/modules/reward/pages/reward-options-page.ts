import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class RewardOptionsPage extends BasePage {
  readonly rewardsOptionsContainer: Locator;
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

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      assertionMessage: 'Verify the Reward options search input box is visible',
    });
  }

  async getTheRewardsOptionsValueFromTheEvaluationCall(targetKey: string): Promise<boolean> {
    const apiUrlPattern = /\/api\/1\.0\/client\/env\/.*\/target\/.*\/evaluations\?cluster=2/;
    const [response] = await Promise.all([
      this.page.waitForResponse(resp => apiUrlPattern.test(resp.url()) && resp.status() === 200),
      this.page.goto('/manage/recognition/rewards/reward-options'), // Replace with the actual triggering action
    ]);
    const json = await response.json();
    const match = json.find((item: any) => item.flag === targetKey);
    return match?.kind === 'boolean' ? String(match.value === 'true') : String(match?.value ?? '');
  }
}
