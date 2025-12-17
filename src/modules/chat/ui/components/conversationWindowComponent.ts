import { expect, Locator, Page, test } from '@playwright/test';

import { ChatEditorComponent, FormattingOptions } from '@chat/ui/components/chatEditorComponent';
import { IncomingAudioVideoCallComponent } from '@chat/ui/components/incomingAudioVideoCallComponent';

import { ChatMentionsListSection } from './chatMentionsListSection';
import { MessageReplyThreadComponent } from './messageReplyThreadComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { BaseVerificationUtil } from '@/src/core/utils/baseVerificationUtil';
import { MessageCardComponent } from '@/src/modules/chat/ui/components/messageCardComponent';
import { AudioVideoCallPage } from '@/src/modules/chat/ui/pages/audioVideoCallPage/audioVideoCallPage';

export class ConversationWindowComponent extends BaseComponent {
  //elements
  readonly focusedChatHeader: Locator;
  readonly listChatMessagesComponent: Locator;
  readonly groupChatWindowContainer: Locator;
  readonly audioCallButton: Locator;
  readonly videoCallButton: Locator;
  readonly listChatMessagesComponentWithAttachment: Locator;
  readonly mentionListComponent: ChatMentionsListSection;

  //components
  readonly chatEditorComponent: ChatEditorComponent;

  constructor(page: Page, groupChatWindowContainer: Locator) {
    super(page);
    this.groupChatWindowContainer = groupChatWindowContainer;
    this.focusedChatHeader = this.groupChatWindowContainer.locator('[class*="ChatHeader_header"]');
    this.listChatMessagesComponent = this.groupChatWindowContainer.locator("article[data-variant='chat']");
    this.listChatMessagesComponentWithAttachment = this.listChatMessagesComponent.filter({
      has: this.page.getByTestId('messageAttachments'),
    });
    this.chatEditorComponent = new ChatEditorComponent(
      page,
      this.groupChatWindowContainer.locator("[class*='Editor_root_']")
    );
    this.audioCallButton = this.groupChatWindowContainer.locator("button[aria-label*='Start a call']").nth(0);
    this.videoCallButton = this.groupChatWindowContainer.locator("button[aria-label*='Start a call']").nth(1);
    this.mentionListComponent = new ChatMentionsListSection(page);
  }

  /**
   * Gets the chat editor component
   * @returns The chat editor component
   */
  getChatEditorComponent(): ChatEditorComponent {
    return this.chatEditorComponent;
  }

  getMentionListComponent(): ChatMentionsListSection {
    return this.mentionListComponent;
  }

  /**
   * Determines the active formatting type from formatting options
   * @param formattingOptions - The formatting options to check
   * @returns The active formatting type or null if none
   */
  private getActiveFormattingType(formattingOptions: FormattingOptions): string | null {
    if (formattingOptions.usesBold) return 'bold';
    if (formattingOptions.usesItalic) return 'italic';
    if (formattingOptions.usesUnderline) return 'underline';
    if (formattingOptions.usesStrikethrough) return 'strikethrough';
    if (formattingOptions.usesBold && formattingOptions.usesItalic) return 'bold-italic';
    if (formattingOptions.usesBulletList) return 'bullet points ';
    if (formattingOptions.usesOrderList) return 'ordered list';
    if (
      formattingOptions.usesBold &&
      formattingOptions.usesItalic &&
      formattingOptions.usesUnderline &&
      formattingOptions.usesStrikethrough
    )
      return 'allformats';
    return null;
  }

  /**
   * Sends a message in the chat
   * @param message - The message to send
   * @param options - Optional parameters
   */
  async sendMessage(
    message: string,
    options?: {
      stepInfo?: string;
    }
  ) {
    return await this.getChatEditorComponent().sendMessage(message, {
      stepInfo: options?.stepInfo,
    });
  }

  getIncomingAudioVideoCallComponent(): IncomingAudioVideoCallComponent {
    return new IncomingAudioVideoCallComponent(this.page);
  }

  /**
   * Verifies the message is present in the list of chat messages
   * @param message - The message to verify
   */
  async verifyMessageIsPresentInListOfChatMessages(
    message: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    await test.step(
      options?.stepInfo ?? `Verifying message: ${message} is present in the list of chat messages`,
      async () => {
        await expect(async () => {
          let messageFoundInList: boolean = false;
          const lastMessage = this.listChatMessagesComponent.last();
          //fetch message
          const messageText = await lastMessage.locator('section').locator('p').textContent();
          if (messageText === message) {
            messageFoundInList = true;
          }

          expect(messageFoundInList, `expecting message: ${message} to be present in the list of chat messages`).toBe(
            true
          );
        }).toPass({ timeout: options?.timeout ?? TIMEOUTS.MEDIUM });
      }
    );
  }

  async verifyMessageWithEmojieReactionIsPresentInListOfChatMessages(
    message: string,
    emojiCount: number,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    await test.step(
      options?.stepInfo ?? `Verifying message: ${message} is present in the list of chat messages`,
      async () => {
        await expect(async () => {
          let messageFoundInList: boolean = false;
          const lastMessage = this.listChatMessagesComponent.last();
          //fetch message
          const messageText = await lastMessage.locator('section').locator('p').textContent();
          if (messageText === message) {
            messageFoundInList = true;
          }
          const count = await lastMessage
            .locator("//div[contains(@class,'Base_reactionsLayout')]")
            .locator('button')
            .count();
          console.log(`emoji count: ${count}`);
          expect(count, `expecting emoji count: ${emojiCount} to be present in the list of chat messages`).toBe(
            emojiCount
          );

          expect(messageFoundInList, `expecting message: ${message} to be present in the list of chat messages`).toBe(
            true
          );
        }).toPass({ timeout: options?.timeout ?? TIMEOUTS.MEDIUM });
      }
    );
  }

  async verifyEditedMessageIsPresentInListOfChatMessages(
    message: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    await test.step(
      options?.stepInfo ?? `Verifying message: ${message} is present in the list of chat messages`,
      async () => {
        await expect(async () => {
          let messageFoundInList: boolean = false;
          const lastMessage = this.listChatMessagesComponent.last();
          //fetch message
          const messageText = await lastMessage.locator('section').locator('p').textContent();
          if (messageText && messageText.includes(message + '  (edited')) {
            messageFoundInList = true;
          }

          expect(messageFoundInList, `expecting message: ${message} to be present in the list of chat messages`).toBe(
            true
          );
        }).toPass({ timeout: options?.timeout ?? TIMEOUTS.MEDIUM });
      }
    );
  }

  async verifyFormattedMessageIsPresentInListOfChatMessages(
    message: string,
    formattingOptions: FormattingOptions,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    await test.step(
      options?.stepInfo ?? `Verifying formatted message: ${message} is present in the list of chat messages`,
      async () => {
        // Get the last (most recent) chat message
        const lastMessageStrip = this.listChatMessagesComponent.last();
        const verificationUtil = new BaseVerificationUtil(this.page);
        let expectedLoc: Locator | undefined;

        // Check for different formatting types in the last message only
        const formattingType = this.getActiveFormattingType(formattingOptions);
        switch (formattingType) {
          case 'bold':
            expectedLoc = lastMessageStrip.locator('section p strong');

            break;
          case 'italic':
            expectedLoc = lastMessageStrip.locator('section p em');

            break;
          case 'underline':
            expectedLoc = lastMessageStrip.locator('section p u');

            break;
          case 'strikethrough':
            expectedLoc = lastMessageStrip.locator('section p s');

            break;

          case 'bold-italic':
            expectedLoc = lastMessageStrip.locator('section p em strong');

            break;

          case 'allformats':
            expectedLoc = lastMessageStrip.locator('section p em s strong u');

            break;
          case 'bullet points ':
            expectedLoc = lastMessageStrip.locator('section ul.custom-bullet-list li');

            break;
          case 'ordered list':
            expectedLoc = lastMessageStrip.locator('section ol.custom-ordered-list li');

            break;
        }
        // Verify exact text match
        if (expectedLoc) {
          await verificationUtil.verifyElementHasText(expectedLoc, message, {
            timeout: 10000,
            assertionMessage: 'Message text should match exactly',
          });
        }
      }
    );
  }

  async getLastMessageWithAttachment(
    attachmentType: 'image' | 'file' | 'video',
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    //debug total number of messages with attachment
    const totalMessagesWithAttachment = await this.listChatMessagesComponent
      .filter({
        has: this.page.getByTestId('messageAttachments'),
      })
      .count();
    console.log(`Total number of messages with attachment: ${totalMessagesWithAttachment}`);

    let messageWithAttachment: Locator;
    return await test.step(options?.stepInfo ?? `Verifying message with attachment is visible`, async () => {
      const listOfMessagesWithAttachment = this.listChatMessagesComponent.filter({
        has: this.page.getByTestId('messageAttachments'),
      });
      if (attachmentType === 'image') {
        messageWithAttachment = listOfMessagesWithAttachment.filter({
          has: this.page.getByTestId('messageImageAttachments'),
        });
      } else if (attachmentType === 'file') {
        messageWithAttachment = listOfMessagesWithAttachment.filter({
          has: this.page.getByTestId('filePreviewAttachment'),
        });
      } else if (attachmentType === 'video') {
        messageWithAttachment = listOfMessagesWithAttachment.filter({
          has: this.page.getByTestId('messageVideoAttachments'),
        });
      }
      return messageWithAttachment;
    });
  }

  async getMessageItemFromChat(message: string, options?: { stepInfo?: string }): Promise<Locator> {
    await this.verifyMessageIsPresentInListOfChatMessages(message);
    const lastMessage = this.listChatMessagesComponent.last();
    //fetch message
    const messageText = await lastMessage.locator('section').locator('p').textContent();

    if (messageText === message) {
      return lastMessage;
    }
    throw new Error(`Message: ${message} not found in the list of chat messages`);
  }

  async getFocusedMessageCardFromListOfChatMessages(messageText: string): Promise<MessageCardComponent> {
    let messageComponent: MessageCardComponent | undefined;
    await test.step(`Getting focused message object from list of chat messages`, async () => {
      const lastMessage = this.listChatMessagesComponent.last();
      const fetchedMessageText = await lastMessage.locator('section').locator('p').textContent();
      if (fetchedMessageText === messageText) {
        messageComponent = new MessageCardComponent(this.page, lastMessage);
      }
      expect(messageComponent, `Message: ${messageText} not found in the list of chat messages`).toBeDefined();
    });
    return messageComponent!;
  }

  async getDeletedOrLastMessageCardFromListOfChatMessages(): Promise<MessageCardComponent> {
    let messageComponent: MessageCardComponent | undefined;
    await test.step(`Getting focused message object from list of chat messages`, async () => {
      const lastMessage = this.listChatMessagesComponent.last();
      messageComponent = new MessageCardComponent(this.page, lastMessage);
    });
    return messageComponent!;
  }

  async getFocusedMessageCardIdFromListOfChatMessages(messageText: string): Promise<string | null> {
    let messageId: string | null;
    return await test.step(`Getting focused message data-message-id from list of chat messages`, async () => {
      const lastMessage = this.listChatMessagesComponent.last();
      const fetchedMessageText = await lastMessage.locator('section').locator('p').textContent();
      if (fetchedMessageText === messageText) {
        console.log(`eachMessage: ${lastMessage.toString()}`);
        messageId = await lastMessage.getAttribute('data-message-id');
      }

      return messageId;
    });
  }

  async verifySentEmojiMessageVisible(messageText: string) {
    await test.step(`Getting focused message object from list of chat messages`, async () => {
      const lastMessage = this.listChatMessagesComponent.last();
      const fetchedMessageText = await lastMessage.locator('section').locator('p').textContent();

      await this.verifier.verifyElementHasText(lastMessage.locator('section').locator('p'), messageText, {
        timeout: 10000,
        assertionMessage: 'Message text should match exactly',
      });
    });
  }

  async verifyMessageIsNotPresentInListOfChatMessages(
    message: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    await test.step(
      options?.stepInfo ?? `Verifying message: ${message} is not present in the list of chat messages`,
      async () => {
        await expect(async () => {
          const lastMessage = this.listChatMessagesComponent.last();
          const fetchedMessageText = await lastMessage.locator('p').textContent();
          expect(
            fetchedMessageText,
            `expecting message: ${message} to be not present in the list of chat messages`
          ).not.toBe(message);
        }).toPass({ timeout: options?.timeout ?? TIMEOUTS.MEDIUM });
      }
    );
  }

  /**
   * Starts a call
   * @param callType - The type of call to start
   * @param options - The options for the call
   * @returns The audio video call page
   */
  async startCall(
    callType: 'audio' | 'video',
    options?: {
      stepInfo?: string;
    }
  ): Promise<AudioVideoCallPage> {
    let audioVideoCallPage: Page;
    await test.step(options?.stepInfo ?? `Starting ${callType} call`, async () => {
      /**
       * When starting a call, the user will be redirected to the call page
       * We need to wait for the user to be redirected to the call page
       * and we will return the call page
       */
      const button = callType === 'audio' ? this.audioCallButton : this.videoCallButton;
      audioVideoCallPage = await this.clickAndWaitForNewPageToOpen(() => this.clickOnElement(button), {
        timeout: 30_000,
        stepInfo: 'Clicking on call button should redirect to call page',
      });
    });
    return new AudioVideoCallPage(audioVideoCallPage!);
  }

  async replyToMessage(
    messageToReplyTo: string,
    replyMessage: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<MessageReplyThreadComponent> {
    let replyThreadComponent: MessageReplyThreadComponent;
    return await test.step(
      options?.stepInfo ?? `Replying to message "${messageToReplyTo}" with "${replyMessage}"`,
      async () => {
        const message = await this.getFocusedMessageCardFromListOfChatMessages(messageToReplyTo);
        replyThreadComponent = await message.openReplyThread();
        await replyThreadComponent.sendMessage(replyMessage);
        return replyThreadComponent;
      }
    );
  }
}
