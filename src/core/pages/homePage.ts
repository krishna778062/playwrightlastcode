import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { expect, Page, test } from '@playwright/test';
import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { ChatAppPage } from '@chat/pages/chatsPage';

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
