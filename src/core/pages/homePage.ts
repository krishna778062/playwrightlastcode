import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { expect, Page, test } from '@playwright/test';
import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { ChatAppPage } from '@chat/pages/chatsPage';
import { FooterComponent } from '@core/components/footerComponent';
import { HomeActionHelper } from '@core/helpers/homeActionHelper';
import { HomeAssertionHelper } from '@core/helpers/homeAssertionHelper';

export class HomePage extends BasePage<HomeActionHelper, HomeAssertionHelper> {
  readonly topNavBarComponent: TopNavBarComponent;
  readonly footer: FooterComponent;

  //actions
  readonly homeActionHelper: HomeActionHelper;

  //assertions
  readonly homeAssertionHelper: HomeAssertionHelper;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.footer = new FooterComponent(page, this.page.locator('#site-footer'));
    this.homeActionHelper = new HomeActionHelper(this);
    this.homeAssertionHelper = new HomeAssertionHelper(this);
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
    await expect(this.topNavBarComponent.profileSettingsButton, `expecting messaging button to be visible`).toBeVisible(
      { timeout: TIMEOUTS.MEDIUM }
    );
  }

  async navigateToChatsPage(options?: { stepInfo?: string; timeout?: number }): Promise<ChatAppPage> {
    await test.step(options?.stepInfo || `Navigating to conversations screen`, async () => {
      await this.topNavBarComponent.openMessageInbox();
      await this.topNavBarComponent.clickSeeAllMessages();
      await this.page.waitForURL(/chat\/conversations/, {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
      });
    });
    return new ChatAppPage(this.page);
  }
}
