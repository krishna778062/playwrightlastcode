import { expect, Locator, Page } from '@playwright/test';
import { rewardsEndpoint } from '@rewards/constants/pageEndpoint';

import { BasePage } from '@core/pages/basePage';

export class ManageRewardsPage extends BasePage {
  readonly manageRewardsPageContainer: Locator;
  readonly manageRewardsPageNotFound: Locator;
  readonly rewardsOverviewDescriptionText: Locator;

  constructor(page: Page) {
    super(page);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.manageRewardsPageContainer = this.page.locator('div[class*="TypographyBody-module"]');
    this.manageRewardsPageNotFound = this.page.locator('[data-testid="no-results"]');
    this.rewardsOverviewDescriptionText = this.manageRewardsPageContainer.locator('p');
  }

  async visit(): Promise<void> {
    await this.page.goto(rewardsEndpoint.manageRewardsPage);
  }

  async hasManageRecognitionPermission(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return (window as any).Simpplr?.CurrentUser?.permissions?.includes('recognition_admin_tool');
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.rewardsOverviewDescriptionText.last()).toBeVisible();
    await this.verifier.verifyTheElementIsVisible(this.rewardsOverviewDescriptionText.last(), {
      assertionMessage: 'Verify the rewards overview description text is visible',
    });
  }

  async verifyPageIsNotFound(): Promise<void> {
    await expect(this.manageRewardsPageNotFound).toBeVisible();
  }
}
