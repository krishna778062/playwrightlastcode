import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { expect, Page } from '@playwright/test';
import { TopNavBarComponent } from '@chat/components/topNavBarComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { FooterComponent } from '@platforms/component/FooterComponent';

export class HomePage extends BasePage {
  
  readonly footer: FooterComponent;

  readonly topNavBarComponent: TopNavBarComponent;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.footer = new FooterComponent(page,this.page.locator('#site-footer'));
  }

  getTopNavBarComponent(): TopNavBarComponent {
    return this.topNavBarComponent;
  }
  getFooterComponent(): FooterComponent {
    return this.footer;
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

