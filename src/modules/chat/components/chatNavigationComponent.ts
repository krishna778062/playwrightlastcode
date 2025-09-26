import test, { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ChatNavigationComponent extends BaseComponent {
  readonly seeAllMessagesButton: Locator;
  readonly messageNotificationListItems: Locator;
  readonly notificationBadeCount: Locator;
  constructor(page: Page) {
    super(page);
    this.seeAllMessagesButton = page.getByRole('link', { name: 'See all messages' });
    this.messageNotificationListItems = page.locator("div[class*='MessagingNotificationItem-module-notificationItem']");
    this.notificationBadeCount = page.locator("button[class*='NotificationBadge-count-revamp']");
  }

  /**
   * Verifies the common navigation component is visible
   * @param options - The options for the step
   */
  async isCommonNavigationComponentVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verifying the common navigation component is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.seeAllMessagesButton, {
        assertionMessage:
          'Verify the common navigation component is visible by asserting the presence of see all messages button',
      });
    });
  }

  /**
   * Clicks on the see all messages button
   * should navigate user to the chat page
   * @param options - The options for the step
   */
  async clickOnSeeAllMessagesButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Clicking on see all messages button`, async () => {
      await this.clickOnElement(this.seeAllMessagesButton, {
        stepInfo: 'Click on see all messages button',
      });
    });
  }
}
