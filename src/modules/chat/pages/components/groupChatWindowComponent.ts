import { BaseComponent } from './baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import { ChatEditorComponent } from './chatEditorComponent';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { FocusedMessageComponent } from './focusedMessageComponent';
import { AudioVideoCallPage } from '../audioVideoCallPage';
import { IncomingAudioVideoCallComponent } from './incomingAudioVideoCallComponent';

export class GroupChatWindowComponent extends BaseComponent {
  readonly focusedChatHeader: Locator;
  readonly listChatMessagesComponent: Locator;
  readonly groupChatWindowContainer: Locator;
  readonly chatEditorComponent: ChatEditorComponent;
  readonly audioCallButton: Locator;
  readonly videoCallButton: Locator;

  constructor(page: Page, groupChatWindowContainer: Locator) {
    super(page);
    this.groupChatWindowContainer = groupChatWindowContainer;
    this.focusedChatHeader = this.groupChatWindowContainer.locator('[class*="ChatHeader_header"]');
    this.listChatMessagesComponent = this.groupChatWindowContainer.locator(
      "article[data-variant='chat']"
    );
    this.chatEditorComponent = new ChatEditorComponent(
      page,
      this.groupChatWindowContainer.locator("[class*='Editor_root_']")
    );
    this.audioCallButton = this.groupChatWindowContainer
      .locator("button[aria-label*='Start a call']")
      .nth(0);
    this.videoCallButton = this.groupChatWindowContainer
      .locator("button[aria-label*='Start a call']")
      .nth(1);
  }

  /**
   * Gets the chat editor component
   * @returns The chat editor component
   */
  getChatEditorComponent(): ChatEditorComponent {
    return this.chatEditorComponent;
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
          expect(
            messageFoundInList,
            `expecting message: ${message} to be present in the list of chat messages`
          ).toBe(true);
        }).toPass({ timeout: options?.timeout ?? TIMEOUTS.MEDIUM });
      }
    );
  }

  async getFocusedMessageObjectFromListOfChatMessages(
    messageText: string
  ): Promise<FocusedMessageComponent> {
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
      expect(
        messageComponent,
        `Message: ${messageText} not found in the list of chat messages`
      ).toBeDefined();
    });
    return messageComponent!;
  }

  async verifyMessageIsNotPresentInListOfChatMessages(
    message: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    await test.step(
      options?.stepInfo ??
        `Verifying message: ${message} is not present in the list of chat messages`,
      async () => {
        await expect(async () => {
          const listOfMessages = await this.listChatMessagesComponent.all();
          for (const eachMessage of listOfMessages) {
            const fetchedMessageText = await eachMessage
              .locator('section')
              .locator('p')
              .textContent();
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
      const audioVideoCallPagePromise = this.page
        .context()
        .waitForEvent('page', { timeout: 30_000 });
      const button = callType === 'audio' ? this.audioCallButton : this.videoCallButton;
      await button.click();
      audioVideoCallPage = await audioVideoCallPagePromise;
    });
    return new AudioVideoCallPage(audioVideoCallPage!);
  }
}
