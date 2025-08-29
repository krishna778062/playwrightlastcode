import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export interface INotificationComponentActions {
  clickOnNotification: (notificationText: string) => Promise<void>;
  markAsRead: (notificationText: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export interface INotificationComponentAssertions {
  verifyNotificationIsVisible: (notificationText: string) => Promise<void>;
}

export class NotificationComponent
  extends BaseComponent
  implements INotificationComponentActions, INotificationComponentAssertions
{
  readonly notificationDropdown: Locator;
  readonly notificationList: Locator;
  readonly markAllAsReadButton: Locator;
  readonly notificationCount: Locator;
  readonly noNotificationsMessage: Locator;
  readonly getNotification: (message: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.notificationDropdown = this.page.locator('[data-testid="notification-dropdown"]');
    this.notificationList = this.page.locator('div.Notification-body div div span');
    this.markAllAsReadButton = this.page.getByRole('button', { name: 'Mark all as read' });
    this.notificationCount = this.page.locator('[data-testid="notification-count"]');
    this.noNotificationsMessage = this.page.getByText('No notifications');
    this.getNotification = (message: string) => page.locator('div.Notification-body span', { hasText: message });
  }

  get actions(): INotificationComponentActions {
    return this;
  }

  get assertions(): INotificationComponentAssertions {
    return this;
  }

  /**
   * Gets a specific notification by text
   */
  getNotificationByText(notificationText: string): Locator {
    return this.notificationList.locator(`text=${notificationText}`);
  }

  /**
   * Gets the mark as read button for a specific notification
   */
  getMarkAsReadButton(notificationText: string): Locator {
    return this.getNotificationByText(notificationText).locator('..').getByRole('button', { name: 'Mark as read' });
  }

  /**
   * Clicks on a specific notification
   */
  async clickOnNotification(notificationText: string): Promise<void> {
    await test.step(`Clicking on notification: ${notificationText}`, async () => {
      await this.clickOnElement(this.getNotificationByText(notificationText));
    });
  }

  /**
   * Marks a specific notification as read
   */
  async markAsRead(notificationText: string): Promise<void> {
    await test.step(`Marking notification as read: ${notificationText}`, async () => {
      await this.clickOnElement(this.getMarkAsReadButton(notificationText));
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

  /**
   * Verifies that a specific notification is visible
   */
  async verifyNotificationIsVisible(notificationText: string): Promise<void> {
    await test.step(`Verifying notification is visible: ${notificationText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getNotificationByText(notificationText), {
        assertionMessage: `Notification "${notificationText}" should be visible`,
      });
    });
  }

  async clickOnNotificationWithText(notificationText: string): Promise<void> {
    await test.step(`Clicking on notification with text: ${notificationText}`, async () => {
      await this.clickOnElement(this.getNotification(notificationText));
    });
  }
}
