import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import { ChatEditorComponent } from '@chat/components/chatEditorComponent';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { FocusedMessageComponent } from '@chat/components/focusedMessageComponent';
import { AudioVideoCallPage } from '@chat/pages/audioVideoCallPage';
import { IncomingAudioVideoCallComponent } from '@chat/components/incomingAudioVideoCallComponent';
import { MessageReplyThreadComponent } from './messageReplyThreadComponent';
import { ChatMentionsListSection } from './chatMentionsListSection';

export class GroupChatWindowComponent extends BaseComponent {
  readonly focusedChatHeader: Locator;
  readonly listChatMessagesComponent: Locator;
  readonly groupChatWindowContainer: Locator;
  readonly chatEditorComponent: ChatEditorComponent;
  readonly audioCallButton: Locator;
  readonly videoCallButton: Locator;
  readonly mentionListComponent: ChatMentionsListSection;
  readonly listChatMessagesComponentWithAttachment: Locator;

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
          for (const eachMessage of await this.listChatMessagesComponent.all()) {
            //fetch message
            const messageText = await eachMessage.locator('section').locator('p').textContent();
            if (messageText === message) {
              messageFoundInList = true;
              break;
            }
          }
          expect(messageFoundInList, `expecting message: ${message} to be present in the list of chat messages`).toBe(
            true
          );
        }).toPass({ timeout: options?.timeout ?? TIMEOUTS.MEDIUM });
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
    for (const eachMessage of await this.listChatMessagesComponent.all()) {
      //fetch message
      const messageText = await eachMessage.locator('section').locator('p').textContent();
      if (messageText === message) {
        return eachMessage;
      }
    }
    throw new Error(`Message: ${message} not found in the list of chat messages`);
  }

  async getFocusedMessageObjectFromListOfChatMessages(messageText: string): Promise<FocusedMessageComponent> {
    let messageComponent: FocusedMessageComponent | undefined;
    await test.step(`Getting focused message object from list of chat messages`, async () => {
      const listOfMessages = await this.listChatMessagesComponent.all();
      for (const eachMessage of listOfMessages) {
        const fetchedMessageText = await eachMessage.locator('section').locator('p').textContent();
        if (fetchedMessageText === messageText) {
          messageComponent = new FocusedMessageComponent(this.page, eachMessage);
          break;
        }
      }
      expect(messageComponent, `Message: ${messageText} not found in the list of chat messages`).toBeDefined();
    });
    return messageComponent!;
  }

  async getFocusedMessageIdFromListOfChatMessages(messageText: string): Promise<FocusedMessageComponent> {
    let messageId: string;
    await test.step(`Getting focused message data-message-id from list of chat messages`, async () => {
      const listOfMessages = await this.listChatMessagesComponent.all();
      for (const eachMessage of listOfMessages) {
        const fetchedMessageText = await eachMessage.locator('section').locator('p').textContent();
        if (fetchedMessageText === messageText) {
          console.log(`eachMessage: ${eachMessage.toString()}`);
          messageId = await eachMessage.getAttribute('data-message-id');
          break;
        }
      }
      expect(messageId, `Message: ${messageId} to not be undefined`).not.toBeUndefined();
    });
    return messageId!;
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
          const listOfMessages = await this.listChatMessagesComponent.all();
          for (const eachMessage of listOfMessages) {
            const fetchedMessageText = await eachMessage.locator('section').locator('p').textContent();
            expect(
              fetchedMessageText,
              `expecting message: ${message} to be not present in the list of chat messages`
            ).not.toBe(message);
          }
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
        const message = await this.getFocusedMessageObjectFromListOfChatMessages(messageToReplyTo);
        replyThreadComponent = await message.openReplyThread();
        await replyThreadComponent.sendMessage(replyMessage);
        return replyThreadComponent;
      }
    );
  }
}
