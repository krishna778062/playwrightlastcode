import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@/src/core/pages/basePage';
import { Locator, Page, expect, test } from '@playwright/test';
import { ChatInboxSideBarComponent } from '@chat/components/chatInboxSideBarComponent';
import { GroupChatWindowComponent } from '@chat/components/groupChatWindowComponent';
import { MessageReplyThreadComponent } from '../components/messageReplyThreadComponent';
import { CHAT_TEST_DATA } from '../test-data/chat.test-data';

export class ChatAppPage extends BasePage {
  protected readonly chatAppContainer: Locator;
  protected readonly inboxSideBarContainer: Locator;
  protected readonly groupChatWindowContainer: Locator;
  //components
  protected readonly inboxSideBarComponent: ChatInboxSideBarComponent;
  protected readonly focusedChatComponent: GroupChatWindowComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CHATS_PAGE);
    this.chatAppContainer = this.page.locator("[class='data-chat-app-wrapper']");
    this.inboxSideBarContainer = this.chatAppContainer.locator("[data-variant='sidebar'][class*='styles_root_']");
    this.groupChatWindowContainer = this.chatAppContainer.locator("[data-variant='chat'][class*='styles_root_']");
    //components initalisation
    this.inboxSideBarComponent = new ChatInboxSideBarComponent(page, this.inboxSideBarContainer);
    this.focusedChatComponent = new GroupChatWindowComponent(page, this.groupChatWindowContainer);
  }

  public getInboxSideBarComponent(): ChatInboxSideBarComponent {
    return this.inboxSideBarComponent;
  }

  public getFocusedChatComponent(): GroupChatWindowComponent {
    return this.focusedChatComponent;
  }

  /**
   * Sends a message in the focused chat window
   * @param message - The message to send
   * @param options - Optional parameters
   */
  async sendMessageInFocusedChat(
    message: string,
    options?: {
      stepInfo?: string;
    }
  ) {
    return await this.getFocusedChatComponent().sendMessage(message, {
      stepInfo: options?.stepInfo ?? `Sending message ${message} in focused chat`,
    });
  }

  /**
   * Opens a direct message with a user and sends a message
   * @param userName - The name of the user to send the message to
   * @param message - The message to send
   * @param options - Optional parameters
   */
  async sendMessage(
    message: string,
    options?: {
      stepInfo?: string;
    }
  ) {
    await this.sendMessageInFocusedChat(message, {
      stepInfo: options?.stepInfo ?? `Sending message: ${message}`,
    });
  }

  public async verifyMessageIsVisible(
    message: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    return await this.getFocusedChatComponent().verifyMessageIsPresentInListOfChatMessages(message, {
      stepInfo: options?.stepInfo,
      timeout: options?.timeout,
    });
  }

  public async replyToMessage(
    messageToReplyTo: string,
    replyMessage: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<MessageReplyThreadComponent> {
    return await this.getFocusedChatComponent().replyToMessage(messageToReplyTo, replyMessage, {
      stepInfo: options?.stepInfo,
    });
  }

  public async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.getInboxSideBarComponent().inboxHeader, `expecting inbox header to be visible`).toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  public async openGroupChat(
    groupName: string,
    options?: {
      stepInfo?: string;
    }
  ) {
    return await this.getInboxSideBarComponent().getGroupChatsSection().openGroupChat(groupName, {
      stepInfo: options?.stepInfo,
    });
  }

  public async openUserDirectMessageItemInInboxForUser(
    userName: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    const directMessageItem = await this.getInboxSideBarComponent()
      .getDirectMessageComponent()
      .getDirectMessageItemForUser(userName, {
        stepInfo:
          options?.stepInfo ?? `Verifying user ${userName} direct message item is visible in current user's inbox`,
        timeout: options?.timeout ?? TIMEOUTS.MEDIUM,
      });
    await test.step(`Clicking on user ${userName} direct message item to open his chat`, async () => {
      await directMessageItem.click();
    });
  }

  /**
   * Records a video and adds it to the chat
   * @param duration - The duration of the video to record
   * @param options - Optional parameters
   */
  public async recordAndAddVideoToTheChat(
    duration: number,
    options?: {
      keepAudioOn?: boolean;
      keepVideoOn?: boolean;
      addMessageWithVideo?: string;
      stepInfo?: string;
    }
  ) {
    const chatEditorComponent = this.getFocusedChatComponent().getChatEditorComponent();
    const recordVideoPromptComponent = await chatEditorComponent.clickOnRecordVideoOption({
      stepInfo: options?.stepInfo ?? `User clicking on record video option`,
    });
    await recordVideoPromptComponent.recordAndAddTheVideoToTheChat(duration, {
      keepAudioOn: options?.keepAudioOn ?? true,
      keepVideoOn: options?.keepVideoOn ?? true,
    });
    await chatEditorComponent.verifyTheVideoIsVisibleAsAttachementInTheChatEditor({
      stepInfo: `Verifying the video is visible as attachement in the chat editor for user 1`,
    });

    // Send message with video
    await chatEditorComponent.sendMessage(options?.addMessageWithVideo ?? '', {
      stepInfo: `sending message with video attachement`,
    });
  }

  public async recordAndAddAudioToTheChat(
    duration: number = 2_000,
    options?: {
      keepAudioOn?: boolean;
      keepVideoOn?: boolean;
      addMessageWithAudio?: string;
      stepInfo?: string;
    }
  ) {
    // User 1 records and adds audio
    const chatEditorComponent = this.getFocusedChatComponent().getChatEditorComponent();
    const recordAudioPromptComponent = await chatEditorComponent.clickOnRecordAudioOption({
      stepInfo: `User clicking on record audio option`,
    });
    await recordAudioPromptComponent.recordAudioAndAddItToTheChat(duration, {
      stepInfo: `User recording audio for ${duration} milliseconds and adding it to the chat`,
    });

    // Verify audio is visible in chat editor
    await chatEditorComponent.verifyTheAudioIsVisibleAsAttachementInTheChatEditor({
      stepInfo: `Verifying the audio is visible as attachement in the chat editor for user 1`,
    });

    // Send message with audio
    await chatEditorComponent.sendMessage(options?.addMessageWithAudio ?? '', {
      stepInfo: `sending message with audio attachement`,
    });
  }

  /**
   * Initiates an audio or video call
   * @param callType - The type of call to initiate
   * @param options - Optional parameters
   */
  async initiateAudioVideoCall(callType: 'audio' | 'video', options?: { stepInfo?: string }) {
    const user1AudioVideoCallPage = await this.getFocusedChatComponent().startCall(callType, {
      stepInfo: options?.stepInfo ?? `User initiating ${callType} call`,
    });
    await user1AudioVideoCallPage.verifyThePageIsLoaded({
      stepInfo: `Verifying the audio video call page is loaded for user 1`,
    });
    return user1AudioVideoCallPage;
  }

  /**
   * Accepts an incoming call in a group chat
   * @param groupName - The name of the group chat
   * @param callType - The type of call to accept
   * @param options - Optional parameters
   */
  async verifyIncomingCallIsReceivedFromCallerInGroupChat(
    groupName: string,
    callType: 'audio' | 'video',
    options?: { stepInfo?: string }
  ) {
    return await test.step(
      options?.stepInfo ??
        `Verifying current user sees notification/popup for incoming ${callType} call from group name ${groupName}`,
      async () => {
        return await this.getFocusedChatComponent()
          .getIncomingAudioVideoCallComponent()
          .verifyIncomingCallIsReceivedFromCaller(groupName, callType, {
            isGroupChat: true,
            stepInfo: `Verifying current user sees notification/popup for incoming ${callType} call from group name ${groupName}`,
          });
      }
    );
  }

  async acceptIncomingCallInGroupChat(groupName: string, callType: 'audio' | 'video', options?: { stepInfo?: string }) {
    const incomingCallComponent = await this.verifyIncomingCallIsReceivedFromCallerInGroupChat(groupName, callType, {
      stepInfo:
        options?.stepInfo ??
        `Verifying current user sees notification/popup for incoming ${callType} call from group name ${groupName}`,
    });
    return await incomingCallComponent.acceptIncomingCall({
      stepInfo: options?.stepInfo ?? `User accepting incoming ${callType} call from group name ${groupName}`,
    });
  }

  async sendMessageWithGroupMention(groupName: string, message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Sending message ${message} and mention group mention: ${groupName}`,
      async () => {
        await this.getFocusedChatComponent()
          .getChatEditorComponent()
          .inputTextBox.pressSequentially(`@${groupName.slice(0, groupName.length - 1)}`, {
            delay: 200,
          });
        await this.getFocusedChatComponent().getMentionListComponent().verifyMentionListIsVisible({ timeout: 20_000 });
        await this.getFocusedChatComponent().getMentionListComponent().selectMentionItem(groupName);
        await this.getFocusedChatComponent().getMentionListComponent().verifyMentionListIsNotVisible();
        await this.getFocusedChatComponent().getChatEditorComponent().appendMessage(message);
        await this.getFocusedChatComponent().getChatEditorComponent().clickOnSendMessageButton();
      }
    );
  }

  async sendMessageWithPeopleMention(userName: string, message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Sending message ${message} and mention userName mention: ${userName}`,
      async () => {
        await this.getFocusedChatComponent().getChatEditorComponent().inputTextBox.pressSequentially(`@${userName}`, {
          delay: 200,
        });
        await this.getFocusedChatComponent().getMentionListComponent().verifyMentionListIsVisible({ timeout: 20_000 });
        await this.getFocusedChatComponent().getMentionListComponent().selectMentionItem(userName);
        await this.getFocusedChatComponent().getMentionListComponent().verifyMentionListIsNotVisible();
        await this.getFocusedChatComponent().getChatEditorComponent().appendMessage(message);
        await this.getFocusedChatComponent().getChatEditorComponent().clickOnSendMessageButton();
      }
    );
  }

  async openMentionsSection(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Opening mentions section`, async () => {
      await this.page.getByTestId('chat.mentions-section').click();
    });
  }

  async verifyMessageIsPresentInMentionsSection(
    groupName: string,
    message: string,
    senderName: string,
    options?: { stepInfo?: string }
  ) {
    await test.step(
      options?.stepInfo ?? `Verifying message ${message} is present in mentions section for group ${groupName}`,
      async () => {
        await expect(async () => {
          let isMessageFound = false;
          const messageItem = await this.page.getByTestId('message-item').all();
          for (const eachMessageItem of messageItem) {
            const messageBody = await eachMessageItem.locator('section').locator('p').textContent();
            const groupName = await eachMessageItem.locator('h4').textContent();
            console.log(`messageBody: ${messageBody}, groupName: ${groupName}`);
            console.log(`expected message: ${message}`);
            console.log(`expected groupName: ${groupName}`);
            if (messageBody?.includes(message) && groupName?.includes(groupName)) {
              isMessageFound = true;
              break;
            }
          }
          expect(
            isMessageFound,
            `Expecting message ${message} is present in mentions section for group ${groupName}`
          ).toBe(true);
        }, `Polling - Expect loop`).toPass({
          timeout: 8_000,
        });
      }
    );
  }

  async clickOnMessageInMentionsSection(groupName: string, message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Clicking on message ${message} in mentions section for group ${groupName}`,
      async () => {
        const messageItemList = await this.page.getByTestId('message-item').all();
        for (const messageItem of messageItemList) {
          const messageBody = await messageItem.locator('section').locator('p').textContent();
          const groupName = await messageItem.locator('h4').textContent();
          if (messageBody?.includes(message) && groupName?.includes(groupName)) {
            await messageItem.click();
            return;
          }
        }
        throw new Error(`Message ${message} not found in mentions section for group ${groupName}`);
      }
    );
  }

  async getMessageItemFromChat(message: string, options?: { stepInfo?: string }): Promise<Locator> {
    return await this.getFocusedChatComponent().getMessageItemFromChat(message, {
      stepInfo: options?.stepInfo,
    });
  }

  async deleteMessage(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Deleting message ${message}`, async () => {
      const messageItem = await this.getFocusedChatComponent().getFocusedMessageObjectFromListOfChatMessages(message);
      await messageItem.deleteMessageFromMessageActionsMenu();
    });
  }
}
