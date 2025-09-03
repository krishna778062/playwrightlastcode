import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export interface INotificationComponentActions {
  clickOnNotification: (notificationText: string) => Promise<void>;
}

export interface INotificationComponentAssertions {}

export class NotificationComponent
  extends BaseComponent
  implements INotificationComponentActions, INotificationComponentAssertions
{
  readonly markAllAsReadButton: Locator;
  readonly getNotificationListItems: Locator;

  /**
   * Constructor for the NotificationComponent
   * @param page - The page to use for the NotificationComponent after click on bell icon from top nav bar
   */
  constructor(page: Page) {
    super(page);
    this.markAllAsReadButton = this.page.getByRole('button', { name: 'Mark all as read' });
    this.getNotificationListItems = this.page.locator('[class*="Notification-body"]');
  }

  get actions(): INotificationComponentActions {
    return this;
  }

  get assertions(): INotificationComponentAssertions {
    return this;
  }

  /**
   * Clicks on a specific notification
   */
  async clickOnNotification(notificationText: string): Promise<void> {
    await test.step(`Clicking on notification: ${notificationText}`, async () => {
      await this.clickOnElement(this.getNotificationListItems.getByText(notificationText));
    });
  }

  /**
   * Marks all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await test.step('Marking all notifications as read', async () => {
      await this.clickOnElement(this.markAllAsReadButton);
    });
  }
}
