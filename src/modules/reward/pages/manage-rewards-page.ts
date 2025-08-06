import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class ManageRewardsPage extends BasePage {
  readonly manageRewardsPageContainer: Locator;
  readonly rewardsOverviewDescriptionText: Locator;

  constructor(page: Page) {
    super(page);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.manageRewardsPageContainer = this.page.locator('div[class*="TypographyBody-module"]');
    this.rewardsOverviewDescriptionText = this.manageRewardsPageContainer.locator('p');
  }

  async visit(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/overview');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.rewardsOverviewDescriptionText.last()).toBeVisible();
    await this.verifier.verifyTheElementIsVisible(this.rewardsOverviewDescriptionText.last(), {
      assertionMessage: 'Verify the rewards overview description text is visible',
    });
  }

  async getTheKeyValueFromTheRewardsCall(targetKey: string): Promise<string | null> {
    const apiUrlPattern = /\/recognition\/admin\/rewards/;
    const [response] = await Promise.all([
      this.page.waitForResponse((resp: any) => apiUrlPattern.test(resp.url()) && resp.status() === 200),
      this.page.reload(), // Trigger the request by reloading
    ]);
    const json = await response.json();
    if (targetKey in json) {
      console.log(`Key "${targetKey}" found in the response:`, json[targetKey]);
      return String(json[targetKey]);
    }
    console.log(`Key "${targetKey}" not found in the response.`);
    return null; // Key not found
  }
}
