import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';

export class TopNavBarComponent extends BaseComponent {
  readonly profileSettingsButton: Locator;
  readonly messageInboxButton: Locator;
  readonly seeAllMessagesButton: Locator;
  constructor(page: Page) {
    super(page);
    this.profileSettingsButton = this.page.getByLabel('Profile settings');
    this.messageInboxButton = this.page.getByRole('button', { name: 'Messaging' });
    this.seeAllMessagesButton = this.page.getByText('See all messages');
  }

  /**
   * Opens the message inbox
   * @param options - The options for the step
   */
  async openMessageInbox(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo || `Opening message inbox`, async () => {
      await this.clickOnElement(this.messageInboxButton);
    });
  }

  async clickSeeAllMessages(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Clicking 'See all messages'`, async () => {
      await this.clickOnElement(this.seeAllMessagesButton);
    });
  }
}
