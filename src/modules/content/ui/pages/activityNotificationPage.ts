import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IActivityNotificationAssertions {
  verifyNotificationExists: (notificationText: string) => Promise<void>;
}

export class ActivityNotificationPage extends BasePage implements IActivityNotificationAssertions {
  readonly notificationItems: (notificationText: string) => Locator;
  readonly notificationItemsList: Locator;
  readonly notificationByText: (notificationText: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ACTIVITY_NOTIFICATION_PAGE);
    this.notificationItems = (notificationText: string) =>
      page.locator('div.Notification-body').getByText(notificationText, { exact: true });
    this.notificationItemsList = page.locator('div.Notification-body');
    // Target the notification link element within the activity tab that contains the text
    // Use CSS class selector to match elements with both classes (even if they have additional classes like 'is-read')
    // Use hasText for partial matching to handle truncated or formatted text
    this.notificationByText = (notificationText: string) =>
      page
        .locator('#activity-tab')
        .locator('a.Notification.u-inset-focus-visible')
        .filter({ hasText: notificationText })
        .first();
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
   * @param notificationText - The text content of the notification to verify (partial match supported)
   */
  async verifyNotificationExists(notificationText: string): Promise<void> {
    await test.step(`Verify notification exists: ${notificationText}`, async () => {
      const notificationLocator = this.notificationByText(notificationText);
      await this.verifier.verifyTheElementIsVisible(notificationLocator, {
        assertionMessage: `Notification containing text "${notificationText}" should be visible`,
      });
    });
  }
}
