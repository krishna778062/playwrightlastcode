import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class ActivityNotificationPage extends BasePage {
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
    this.notificationByMention = (notificationText: string) =>
      this.page.getByRole('link', { name: `Notification: MENTIONS_ME_IN_POST - ${notificationText}` });
      this.page.locator("a[class*='Notification']").filter({ hasText: notificationText });
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.notificationItemsList.first(), {
      assertionMessage: 'Notification container should be visible',
    });
  }

  async clickOnNotification(expectedNotificationMessage: string): Promise<void> {
    await test.step(`Clicking on notification: ${expectedNotificationMessage}`, async () => {
      const notificationLink = this.notificationByText(expectedNotificationMessage).nth(1);
      await this.clickOnElement(notificationLink);
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

  async verifyNotificationDoesNotExist(notificationText: string): Promise<void> {
    await test.step(`Verify notification does NOT exist: ${notificationText}`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.notificationByText(notificationText).first(), {
        assertionMessage: `Notification with text "${notificationText}" should NOT be visible`,
      });
    });
  }
}
