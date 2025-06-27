import { expect, Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { GroupChatWindowComponent } from '@chat/components/groupChatWindowComponent';

export class DirectMessageSectionInInbox extends BaseComponent {
  readonly directMessageContainer: Locator;
  readonly focusedChatComponentContainer: Locator;
  readonly directMessageItem: Locator;
  constructor(page: Page) {
    super(page);
    this.directMessageContainer = this.page.getByTestId('chat.dm-text');
    this.directMessageItem = this.directMessageContainer.locator("[data-testid*='direct-message-item']");
    this.focusedChatComponentContainer = this.page.locator("[data-variant='chat'][class*='styles_root_']");
  }

  async expandDirectMessageSection(): Promise<void> {}

  async collapseDirectMessageSection(): Promise<void> {}

  async waitUntilUserIsPresentInDirectMessageSection(
    userName: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ): Promise<Locator> {
    let directMessageItemFromUser: Locator;
    await test.step(
      options?.stepInfo ?? `Verifying user ${userName} is present in direct message section`,
      async () => {
        directMessageItemFromUser = this.directMessageItem.filter({ hasText: userName });
        await this.verifier.verifyTheElementIsVisible(directMessageItemFromUser, {
          assertionMessage: `expecting direct message item from user ${userName} to be visible`,
          timeout: options?.timeout ?? TIMEOUTS.MEDIUM,
        });
      }
    );
    return directMessageItemFromUser!;
  }

  async fetchNumberOfNewMessageNotificationsAppearingForDMFromUser(
    userName: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<number> {
    let numberOfNewMessageNotifications: number;
    await test.step(
      options?.stepInfo ?? `Fetching number of new message notifications appearing for DM from user ${userName}`,
      async () => {
        const directMessageItemFromUser = this.directMessageItem.filter({ hasText: userName });
        const numberOfNewMessageNotificationsText = await directMessageItemFromUser.getByLabel('Stamp').textContent();
        numberOfNewMessageNotifications = Number(numberOfNewMessageNotificationsText) ?? 0;
      }
    );
    return numberOfNewMessageNotifications!;
  }

  async getDirectMessageItemForUser(
    userName: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ): Promise<Locator> {
    return await this.waitUntilUserIsPresentInDirectMessageSection(userName, {
      stepInfo: options?.stepInfo,
      timeout: options?.timeout ?? TIMEOUTS.MEDIUM,
    });
  }

  async getLastMessageWithAttachment(
    attachmentType: 'image' | 'file' | 'video',
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    //debug total number of messages with attachment
    const totalMessagesWithAttachment = await this.directMessageItem
      .filter({
        has: this.directMessageItem.getByTestId('messageAttachments'),
      })
      .count();
    console.log(`Total number of messages with attachment: ${totalMessagesWithAttachment}`);

    let messageWithAttachment: Locator;
    return await test.step(options?.stepInfo ?? `Verifying message with attachment is visible`, async () => {
      const listOfMessagesWithAttachment = this.directMessageItem.filter({
        has: this.directMessageItem.getByTestId('messageAttachments'),
      });
      if (attachmentType === 'image') {
        messageWithAttachment = listOfMessagesWithAttachment.filter({
          has: this.directMessageItem.getByTestId('messageImageAttachments'),
        });
      } else if (attachmentType === 'file') {
        messageWithAttachment = listOfMessagesWithAttachment.filter({
          has: this.directMessageItem.getByTestId('filePreviewAttachment'),
        });
      } else if (attachmentType === 'video') {
        messageWithAttachment = listOfMessagesWithAttachment.filter({
          has: this.directMessageItem.getByTestId('messageVideoAttachments'),
        });
      }
      return messageWithAttachment.last;
    });
  }
}
