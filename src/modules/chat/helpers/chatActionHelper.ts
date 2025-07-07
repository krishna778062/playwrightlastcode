import { Locator, test } from '@playwright/test';
import { TIMEOUTS } from '@core/constants/timeouts';
import { ChatAppPage } from '@chat/pages/chatsPage';
import { MessageReplyThreadComponent } from '@chat/components/messageReplyThreadComponent';

/**
 * This class contians all the common actions that can be performed on the chat page.
 * Note: You can also access deeper components directly from the chatPage object.
 * But this class is a wrapper around the chatPage object and provides a more user-friendly interface.
 */
export class ChatActionHelper {
  constructor(private readonly chatPage: ChatAppPage) {
    this.chatPage = chatPage;
  }

  /**
   * Sends a message in the focused chat window.
   * @param message - The message to send.
   * @param options - Optional parameters for the step.
   */
  public async sendMessage(message: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Sending message: "${message}"`, async () => {
      await this.chatPage.getConversationWindowComponent().sendMessage(message, {
        stepInfo: options?.stepInfo ?? `Sending message ${message} in focused chat`,
      });
    });
  }

  /**
   * Sends a reply to a specific message in a thread.
   * @param messageToReplyTo - The message to reply to.
   * @param replyMessage - The reply message to send.
   * @param options - Optional parameters for the step.
   */
  public async replyToMessage(
    messageToReplyTo: string,
    replyMessage: string,
    options?: { stepInfo?: string }
  ): Promise<MessageReplyThreadComponent> {
    return await test.step(options?.stepInfo || `Replying to message: "${messageToReplyTo}"`, async () => {
      return await this.chatPage.getConversationWindowComponent().replyToMessage(messageToReplyTo, replyMessage, {
        stepInfo: options?.stepInfo,
      });
    });
  }

  /**
   * Sends an attachment to the chat
   * @param attachmentPath - The path to the attachment to send.
   * @param options - Optional parameters for the step.
   */
  public async sendAttachment(
    attachmentPath: string,
    options?: { stepInfo?: string; isItValidFile?: boolean }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Sending attachment: "${attachmentPath}"`, async () => {
      const isItValidFile = options?.isItValidFile ?? true;
      const chatEditorComponent = this.chatPage.getConversationWindowComponent().getChatEditorComponent();
      await chatEditorComponent.addMediaAttachment(attachmentPath, {
        stepInfo: 'Adding media attachment to the chat',
        attachementRequestTimeout: 40_000,
        waitForAttachementRequestToComplete: isItValidFile,
      });

      //NOTE: we cant click on send until attachement is loaded and button is enabled so we will give high timeout here
      await chatEditorComponent.clickOnSendMessageButton({
        stepInfo: 'Clicking on send message button',
        timeout: 60_000,
      });
    });
  }

  /**
   * Adds an attachment to the chat
   * @param attachmentPath - The path to the attachment to add
   * @param options - Optional parameters for the step
   */
  public async addAttachment(
    attachmentPath: string,
    options?: { stepInfo?: string; isItValidFile?: boolean }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Adding attachment: "${attachmentPath}"`, async () => {
      const isItValidFile = options?.isItValidFile ?? true;
      const chatEditorComponent = this.chatPage.getConversationWindowComponent().getChatEditorComponent();
      await chatEditorComponent.addMediaAttachment(attachmentPath, {
        stepInfo: 'Adding media attachment to the chat',
        attachementRequestTimeout: 40_000,
        waitForAttachementRequestToComplete: isItValidFile,
      });
    });
  }

  /**
   * Gets the last message with an attachment
   * @param attachmentType - The type of attachment to get the last message for
   * @param options - Optional parameters for the step
   * @returns The last message with an attachment
   */
  public async getLastMessageWithAttachment(
    attachmentType: 'image' | 'file' | 'video',
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<Locator> {
    return await test.step(options?.stepInfo || `Verifying message with attachment is visible`, async () => {
      const messageWithAttachment = await this.chatPage
        .getConversationWindowComponent()
        .getLastMessageWithAttachment(attachmentType, {
          timeout: options?.timeout,
        });
      return messageWithAttachment;
    });
  }

  /**
   * Opens a direct message conversation with a specified user.
   * @param userName - The full name of the user to start a conversation with.
   * @param options - Optional parameters for the step.
   */
  public async openDirectMessageWithUser(userName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Opening direct message with user: ${userName}`, async () => {
      const inboxSideBar = this.chatPage.getInboxSideBarComponent();
      await inboxSideBar.clickCreateNewMessageButton();
      await inboxSideBar.verifyCreateNewMessageFormIsVisible();
      await inboxSideBar.searchAndSelectUser(userName);
      await inboxSideBar.clickStartChatButton();
    });
  }

  /**
   * Opens a direct message conversation with a specified user from the inbox.
   * @param userName - The full name of the user to start a conversation with.
   * @param options - Optional parameters for the step.
   */
  public async openUserDirectMessageItemInInbox(
    userName: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Opening direct message for ${userName} from inbox`, async () => {
      await this.chatPage.actions.openUserDirectMessageItemInInboxForUser(userName, { timeout: options?.timeout });
    });
  }

  /**
   * Opens a group chat
   * @param groupName - The group name to open
   * @param options - Optional parameters for the step
   */
  public async openGroupChat(
    groupName: string,
    options?: {
      stepInfo?: string;
    }
  ) {
    return await this.chatPage.getInboxSideBarComponent().getGroupChatsSection().openGroupChat(groupName, {
      stepInfo: options?.stepInfo,
    });
  }

  /**
   * Opens a direct message item in the inbox for a given user
   * @param userName - The user name to open the direct message item for
   * @param options - Optional parameters for the step
   */
  public async openUserDirectMessageItemInInboxForUser(
    userName: string,
    options?: {
      stepInfo?: string;
      timeout?: number;
    }
  ) {
    const directMessageItem = await this.chatPage
      .getInboxSideBarComponent()
      .getDirectMessageSectionInInbox()
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
    const chatEditorComponent = this.chatPage.getConversationWindowComponent().getChatEditorComponent();
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

  /**
   * Records and adds audio to the chat
   * @param duration - The duration of the audio to record
   * @param options - Optional parameters
   */

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
    const chatEditorComponent = this.chatPage.getConversationWindowComponent().getChatEditorComponent();
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
    const user1AudioVideoCallPage = await this.chatPage.getConversationWindowComponent().startCall(callType, {
      stepInfo: options?.stepInfo ?? `User initiating ${callType} call`,
    });
    await user1AudioVideoCallPage.verifyThePageIsLoaded({
      stepInfo: `Verifying the audio video call page is loaded for user 1`,
    });
    return user1AudioVideoCallPage;
  }

  /**
   * Accepts an incoming call in a group chat
   * @param groupName - The group name to accept the call from
   * @param callType - The type of call to accept
   * @param options - Optional parameters for the step
   */
  async acceptIncomingCallInGroupChat(groupName: string, callType: 'audio' | 'video', options?: { stepInfo?: string }) {
    const incomingCallComponent = await this.chatPage.assertions.verifyIncomingCallIsReceivedFromCallerInGroupChat(
      groupName,
      callType,
      {
        stepInfo:
          options?.stepInfo ??
          `Verifying current user sees notification/popup for incoming ${callType} call from group name ${groupName}`,
      }
    );
    return await incomingCallComponent.acceptIncomingCall({
      stepInfo: options?.stepInfo ?? `User accepting incoming ${callType} call from group name ${groupName}`,
    });
  }

  /**
   * Sends a message with a group mention
   * @param groupName - The group name to mention
   * @param message - The message to send
   * @param options - Optional parameters for the step
   */
  async sendMessageWithGroupMention(groupName: string, message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Sending message ${message} and mention group mention: ${groupName}`,
      async () => {
        const chatEditor = this.chatPage.getConversationWindowComponent().getChatEditorComponent();
        await chatEditor.inputTextBox.click();
        await chatEditor.inputTextBox.pressSequentially(`@${groupName.slice(0, groupName.length - 1)}`, {
          delay: 300,
        });
        const mentionListComponent = this.chatPage.getConversationWindowComponent().getMentionListComponent();
        await mentionListComponent.verifyMentionListIsVisible({ timeout: 20_000 });
        await mentionListComponent.selectMentionItem(groupName);
        await mentionListComponent.verifyMentionListIsNotVisible();

        //now append the message and send it
        await chatEditor.appendMessage(message);
        await chatEditor.clickOnSendMessageButton();
      }
    );
  }

  /**
   * Sends a message with a people mention
   * @param userName - The user name to mention
   * @param message - The message to send
   * @param options - Optional parameters for the step
   */
  async sendMessageWithPeopleMention(userName: string, message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Sending message ${message} and mention userName mention: ${userName}`,
      async () => {
        await this.chatPage
          .getConversationWindowComponent()
          .getChatEditorComponent()
          .inputTextBox.pressSequentially(`@${userName}`, {
            delay: 200,
          });
        await this.chatPage
          .getConversationWindowComponent()
          .getMentionListComponent()
          .verifyMentionListIsVisible({ timeout: 20_000 });
        await this.chatPage.getConversationWindowComponent().getMentionListComponent().selectMentionItem(userName);
        await this.chatPage.getConversationWindowComponent().getMentionListComponent().verifyMentionListIsNotVisible();
        await this.chatPage.getConversationWindowComponent().getChatEditorComponent().appendMessage(message);
        await this.chatPage.getConversationWindowComponent().getChatEditorComponent().clickOnSendMessageButton();
      }
    );
  }

  /**
   * Opens the mentions section
   * @param options - Optional parameters for the step
   */
  async openMentionsSection(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Opening mentions section`, async () => {
      await this.chatPage.page.getByTestId('chat.mentions-section').click();
    });
  }

  /**
   * Clicks on a message in the mentions section
   * @param groupName - The group name to filter the message by
   * @param message - The message to click on
   * @param options - Optional parameters for the step
   */
  async clickOnMessageInMentionsSection(groupName: string, message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Clicking on message ${message} in mentions section for group ${groupName}`,
      async () => {
        const messageItemList = await this.chatPage.page.getByTestId('message-item').all();
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

  /**
   * Gets the message item from the chat
   * @param message - The message to get the message item for
   * @param options - Optional parameters for the step
   * @returns The message item for the given message
   */
  async getMessageItemFromChat(message: string, options?: { stepInfo?: string }): Promise<Locator> {
    return await this.chatPage.getConversationWindowComponent().getMessageItemFromChat(message, {
      stepInfo: options?.stepInfo,
    });
  }

  /**
   * Deletes a message from the chat
   * @param message - The message to delete
   * @param options - Optional parameters for the step
   */
  async deleteMessage(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Deleting message ${message}`, async () => {
      const messageItem = await this.chatPage
        .getConversationWindowComponent()
        .getFocusedMessageCardFromListOfChatMessages(message);
      await messageItem.deleteMessage();
    });
  }

  /**
   * Gets the data message id for a given message
   * @param message - The message to get the data message id for
   * @param options - Optional parameters for the step
   * @returns The data message id for the given message
   */
  async getDataMessageId(message: string, options?: { stepInfo?: string }) {
    return await test.step(options?.stepInfo ?? `Getting data message id for message ${message}`, async () => {
      return await this.chatPage
        .getConversationWindowComponent()
        .getFocusedMessageCardIdFromListOfChatMessages(message);
    });
  }
}
