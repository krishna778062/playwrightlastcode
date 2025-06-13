import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { ChatAppPage } from '@chat/pages/chatsPage';

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
      await this.messageInboxButton.click();
    });
  }

  /**
   * Navigates to the chats page
   * @param options - The options for the step
   * @returns The chats page
   */
  async navigateToChatsPage(options?: {
    stepInfo?: string;
    timeout?: number;
  }): Promise<ChatAppPage> {
    await test.step(options?.stepInfo || `Navigating to conversations screen`, async () => {
      await this.openMessageInbox();
      await this.seeAllMessagesButton.click();
      await this.page.waitForURL(/chat\/conversations/, {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
      });
    });
    return new ChatAppPage(this.page);
  }
}
