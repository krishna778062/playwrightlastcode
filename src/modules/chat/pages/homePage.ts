import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from './basePage';
import { expect, Page } from '@playwright/test';
import { TopNavBarComponent } from './components/topNavBarComponent';
import { TIMEOUTS } from '@core/constants/timeouts';

export class HomePage extends BasePage {
  readonly topNavBarComponent: TopNavBarComponent;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
  }

  getTopNavBarComponent(): TopNavBarComponent {
    return this.topNavBarComponent;
  }
  /**
   * Verifies the home page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(
      this.topNavBarComponent.profileSettingsButton,
      `expecting messaging button to be visible`
    ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  }
}
