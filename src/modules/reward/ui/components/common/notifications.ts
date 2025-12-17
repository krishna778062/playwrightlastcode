import { Locator, Page } from '@playwright/test';
import Error from 'es-errors';

import { BasePage } from '@core/pages/basePage';

export class Notifications extends BasePage {
  readonly siteHeader: Locator;
  readonly notificationButton: Locator;
  readonly viewAllNotificationsButton: Locator;
  readonly notificationListItem: Locator;

  /**
   * This is a notifications class that contains locators and methods for notifications.
   * @param page - The page object from Playwright
   */
  constructor(page: Page) {
    super(page);
    this.siteHeader = page.locator('[id="site-header"]');
    this.notificationButton = this.page.locator('[class="UserNavigation"] button[aria-label="Notifications"]');
    this.viewAllNotificationsButton = this.page.locator('a[href="/notifications/activity"]');
    this.notificationListItem = this.page.locator('div[id="activity-tab"] > ul > li div[class*="type--primary"]');
  }

  async navigateToNotifications(): Promise<void> {
    await this.notificationButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.clickOnElement(this.notificationButton, { stepInfo: 'Clicking on notification button', force: true });
  }

  async clickOnViewAllNotifications(): Promise<void> {
    await this.viewAllNotificationsButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.clickOnElement(this.viewAllNotificationsButton, {
      stepInfo: 'Clicking on view all notifications',
      force: true,
    });
  }

  async navigateToRecentActivityNotifications(): Promise<void> {
    await this.page.goto('/notifications/activity');
    await this.verifyThePageIsLoaded();
  }

  async getNotificationText(index: number = 0): Promise<string> {
    if (typeof index !== 'number' || isNaN(index)) {
      throw new Error(`Invalid argument: index must be a number. Received: ${index}`);
    }
    await this.notificationListItem.nth(index).waitFor({ state: 'visible', timeout: 25000 });
    const notification = this.notificationListItem.nth(index);
    await notification.waitFor({ state: 'attached', timeout: 15000 });
    return (await notification.textContent()) || '';
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
