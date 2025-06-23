import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { expect, Page, test } from '@playwright/test';
import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { ChatAppPage } from '@chat/pages/chatsPage';
import { FooterComponent } from '@core/components/footerComponent';
import { GlobalSearchBarComponent } from '../../modules/global-search/components/globalSearchBarComponent';

export class HomePage extends BasePage {
  readonly topNavBarComponent: TopNavBarComponent;
  readonly footer: FooterComponent;
  readonly globalSearchComponent: GlobalSearchBarComponent;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.footer = new FooterComponent(page, this.page.locator('#site-footer'));
    this.globalSearchComponent = new GlobalSearchBarComponent(page);
  }

  getTopNavBarComponent(): TopNavBarComponent {
    return this.topNavBarComponent;
  }

  getFooterComponent(): FooterComponent {
    return this.footer;
  }

  getGlobalSearchComponent(): GlobalSearchBarComponent {
    return this.globalSearchComponent;
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
