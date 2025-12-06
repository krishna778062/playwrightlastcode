import { Locator, Page, test } from '@playwright/test';

import { ActivityNotificationPage } from '../pages/activityNotificationPage';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface INotificationComponentActions {
  clickOnNotification: (notificationText: string) => Promise<void>;
  clickOnViewAllNotifications: (options?: { stepInfo?: string }) => Promise<ActivityNotificationPage>;
}

export interface INotificationComponentAssertions {
  verifyNotificationExists: (notificationText: string) => Promise<void>;
}

export class NotificationComponent
  extends BaseComponent
  implements INotificationComponentActions, INotificationComponentAssertions
{
  readonly markAllAsReadButton: Locator;
  readonly getNotificationListItems: Locator;
  readonly viewAllNotificationsButton: Locator;
  readonly notificationViewAllText: (text: string) => Locator;
  /**
   * Constructor for the NotificationComponent
   * @param page - The page to use for the NotificationComponent after click on bell icon from top nav bar
   */
  constructor(page: Page) {
    super(page);
    this.markAllAsReadButton = this.page.getByRole('button', { name: 'Mark all as read' });
    this.getNotificationListItems = this.page.locator('[class*="Notification-body"]');
    this.viewAllNotificationsButton = this.page.getByRole('link', { name: 'View all' });
    this.notificationViewAllText = (text: string) => this.page.getByText(text);
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
  async verifyNotificationExists(notificationText: string): Promise<void> {
    await test.step(`Verifying notification exists: ${notificationText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getNotificationListItems.getByText(notificationText), {
        assertionMessage: `Notification with text "${notificationText}" should be visible`,
      });
    });
  }

  async clickOnViewAllNotifications(options?: { stepInfo?: string }): Promise<ActivityNotificationPage> {
    return await test.step('Clicking on view all notifications', async () => {
      await this.clickOnElement(this.viewAllNotificationsButton.first());
      return new ActivityNotificationPage(this.page);
    });
  }
}
