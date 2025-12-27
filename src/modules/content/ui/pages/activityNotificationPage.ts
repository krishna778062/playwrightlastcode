import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class ActivityNotificationPage extends BasePage {
  readonly notificationItems: (notificationText: string) => Locator;
  readonly notificationItemsList: Locator;
  readonly notificationByText: (notificationText: string) => Locator;
  readonly notificationByMention: (notificationText: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ACTIVITY_NOTIFICATION_PAGE);
    this.notificationItems = (notificationText: string) =>
      page.locator('div.Notification-body').getByText(notificationText, { exact: true });
    this.notificationItemsList = page.locator('div.Notification-body');
    this.notificationByText = (notificationText: string) =>
      this.page.locator('a div').filter({ hasText: notificationText });
    this.notificationByMention = (notificationText: string) =>
      this.page.getByRole('link', { name: `Notification: MENTIONS_ME_IN_POST - ${notificationText}` });
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.notificationItemsList.first(), {
      assertionMessage: 'Notification container should be visible',
    });
  }

  /**
   * Clicks on a specific notification to navigate to the related content
   * @param notificationText - The text content of the notification to click
   */
  async clickOnNotificationForMention(expectedNotificationMessage: string): Promise<void> {
    await test.step(`Clicking on notification for mention: ${expectedNotificationMessage}`, async () => {
      // Find the anchor tag that contains the notification text and click it
      // notificationByText finds 'a div' elements, so we get the parent 'a' tag
      const notificationLink = this.notificationByMention(expectedNotificationMessage).first();
      await this.clickOnElement(notificationLink);
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
   * @param notificationText - The text content of the notification to verify
   */
  async verifyNotificationExists(notificationText: string): Promise<void> {
    await test.step(`Verify notification exists: ${notificationText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.notificationByText(notificationText).nth(1), {
        assertionMessage: `Notification with text "${notificationText}" should be visible`,
      });
    });
  }

  async verifyNotificationExistsForMention(expectedNotificationMessage: string): Promise<void> {
    await test.step(`Verify notification exists for mention: ${expectedNotificationMessage}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.notificationByMention(expectedNotificationMessage).first(), {
        assertionMessage: `Notification with text "${expectedNotificationMessage}" should be visible`,
      });
    });
  }
}
