import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface IActivityNotificationAssertions {
  verifyNotificationExists: (notificationText: string) => Promise<void>;
}

export class ActivityNotificationPage extends BasePage implements IActivityNotificationAssertions {
  readonly notificationItems: (notificationText: string) => Locator;
  readonly notificationItemsList: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ACTIVITY_NOTIFICATION_PAGE);
    this.notificationItems = (notificationText: string) =>
      page.locator('div.Notification-body').getByText(notificationText, { exact: true });
    this.notificationItemsList = page.locator('div.Notification-body');
  }

  get assertions(): IActivityNotificationAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.notificationItemsList.first(), {
      assertionMessage: 'Notification container should be visible',
    });
  }

  /**
   * Verifies that a specific notification exists by checking all notification elements
   * @param notificationText - The text content of the notification to verify
   */
  async verifyNotificationExists(notificationText: string): Promise<void> {
    await test.step(`Verify notification exists: ${notificationText}`, async () => {
      const notification = this.notificationItems(notificationText).first();
      await this.verifier.verifyTheElementIsVisible(notification, {
        assertionMessage: `Notification with text "${notificationText}" should be visible`,
      });
    });
  }
}
