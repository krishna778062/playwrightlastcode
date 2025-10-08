import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { FormattingOptions } from '@/src/modules/chat/components/chatEditorComponent';
import { IncomingAudioVideoCallComponent } from '@/src/modules/chat/components/incomingAudioVideoCallComponent';
import { MessageReplyThreadComponent } from '@/src/modules/chat/components/messageReplyThreadComponent';
import { AudioVideoCallPage } from '@/src/modules/chat/pages/audioVideoCallPage/audioVideoCallPage';
import { ChatPageBase } from '@/src/modules/chat/pages/chatPage/chatPageBase';

export interface IChatActions {
  sendMessage: (message: string, options?: { stepInfo?: string }) => Promise<void>;
  sendFormattedMessage: (
    message: string,
    formattingOptions: FormattingOptions,
    options?: { stepInfo?: string }
  ) => Promise<void>;
  deleteMessage: (message: string, options?: { stepInfo?: string }) => Promise<void>;
  getDataMessageId: (message: string, options?: { stepInfo?: string }) => Promise<string>;
  getMessageItemFromChat: (message: string, options?: { stepInfo?: string }) => Promise<Locator>;
  replyToMessage: (
    messageToReplyTo: string,
    replyMessage: string,
    options?: { stepInfo?: string }
  ) => Promise<MessageReplyThreadComponent>;
  sendAttachment: (attachmentPath: string, options?: { stepInfo?: string; isItValidFile?: boolean }) => Promise<void>;
  addAttachment: (attachmentPath: string, options?: { stepInfo?: string; isItValidFile?: boolean }) => Promise<void>;
  getLastMessageWithAttachment: (
    attachmentType: 'image' | 'file' | 'video',
    options?: { stepInfo?: string; timeout?: number }
  ) => Promise<Locator>;
  openDirectMessageWithUser: (userName: string, options?: { stepInfo?: string }) => Promise<void>;
  openUserDirectMessageItemInInbox: (
    userName: string,
    options?: { stepInfo?: string; timeout?: number }
  ) => Promise<void>;
  openGroupChat: (groupName: string, options?: { stepInfo?: string }) => Promise<void>;
  openUserDirectMessageItemInInboxForUser: (
    userName: string,
    options?: { stepInfo?: string; timeout?: number }
  ) => Promise<void>;
  recordAndAddVideoToTheChat: (
    duration: number,
    options?: { keepAudioOn?: boolean; keepVideoOn?: boolean; addMessageWithVideo?: string; stepInfo?: string }
  ) => Promise<void>;
  recordAndAddAudioToTheChat: (
    duration: number,
    options?: { keepAudioOn?: boolean; keepVideoOn?: boolean; addMessageWithAudio?: string; stepInfo?: string }
  ) => Promise<void>;
  initiateAudioVideoCall: (callType: 'audio' | 'video', options?: { stepInfo?: string }) => Promise<AudioVideoCallPage>;
  acceptIncomingCallInGroupChat: (
    groupName: string,
    callType: 'audio' | 'video',
    options?: { stepInfo?: string }
  ) => Promise<AudioVideoCallPage>;
  sendMessageWithGroupMention: (groupName: string, message: string, options?: { stepInfo?: string }) => Promise<void>;
  sendMessageWithPeopleMention: (userName: string, message: string, options?: { stepInfo?: string }) => Promise<void>;
  openMentionsSection: (options?: { stepInfo?: string }) => Promise<void>;
  clickOnMessageInMentionsSection: (
    groupName: string,
    message: string,
    options?: { stepInfo?: string }
  ) => Promise<void>;
  editAndUpdateMessage: (message: string, editedMessage: string, options?: { stepInfo?: string }) => Promise<void>;
  editAndCancelMessage: (message: string, options?: { stepInfo?: string }) => Promise<void>;
  pinSentMessage: (message: string, options?: { stepInfo?: string }) => Promise<void>;
  unPinMessage: (message: string, options?: { stepInfo?: string }) => Promise<void>;
}

export interface IChatAssertions {
  verifyUserIsAbleToAddAndDeleteAttachmentInEditor: (
    attachmentPath: string,
    options?: { stepInfo?: string }
  ) => Promise<void>;
  verifyMessageIsVisible: (message: string, options?: { stepInfo?: string; timeout?: number }) => Promise<void>;
  verifyEditedMessageIsVisible: (message: string, options?: { stepInfo?: string; timeout?: number }) => Promise<void>;
  verifyUnsupportedFileHandling: (options?: { stepInfo?: string }) => Promise<void>;
  verifyIncomingCallIsReceivedFromCallerInGroupChat: (
    groupName: string,
    callType: 'audio' | 'video',
    options?: { stepInfo?: string }
  ) => Promise<IncomingAudioVideoCallComponent>;
  verifyTheMessageAppearsDeleted: (messageID: string, options?: { stepInfo?: string }) => Promise<void>;
  verifyMessageIsPresentInMentionsSection: (
    groupName: string,
    message: string,
    senderName: string,
    options?: { stepInfo?: string }
  ) => Promise<void>;
  verifyMessageActionsNotVisible: (message: string, options?: { stepInfo?: string }) => Promise<void>;
  verifyMessageActionsIsVisible: (message: string, options?: { stepInfo?: string }) => Promise<void>;
  verifyEditMessageOptionNotVisible: (message: string, options?: { stepInfo?: string }) => Promise<void>;
  verifyPinnedMessage: (message: string, options?: { stepInfo?: string }) => Promise<void>;
}

export class ChatAppPage extends ChatPageBase implements IChatActions, IChatAssertions {
  get actions(): IChatActions {
    return this as IChatActions;
  }
  get assertions(): IChatAssertions {
    return this as IChatAssertions;
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Sends a message in the focused chat window.
   * @param message - The message to send.
   * @param options - Optional parameters for the step.
   */
  public async sendMessage(message: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Sending message: "${message}"`, async () => {
      await this.getConversationWindowComponent().sendMessage(message, {
        stepInfo: options?.stepInfo ?? `Sending message ${message} in focused chat`,
      });
    });
  }
  /**
   * Sends a formatted message in the focused chat window.
   * @param message - The message to send.
   * @param formattingOptions - The formatting options to apply.
   * @param options - Optional parameters for the step.
   */
  public async sendFormattedMessage(
    message: string,
    formattingOptions: FormattingOptions,
    options?: { stepInfo?: string }
  ): Promise<void> {
    const stepInfo = options?.stepInfo ?? `Sending formatted message: "${message}"`;
    await test.step(stepInfo, async () => {
      await this.getConversationWindowComponent()
        .getChatEditorComponent()
        .sendFormattedMessage(message, formattingOptions, {
          stepInfo: options?.stepInfo ?? `Sending formatted message ${message} in focused chat`,
        });
    });
  }

  /**
   * Sends a message by first writing text, then selecting it and applying formatting.
   * @param message - The message to send.
   * @param formattingOptions - The formatting options to apply.
   * @param options - Optional parameters for the step.
   */
  public async sendMessageWithSelectAndFormat(
    message: string,
    formattingOptions: FormattingOptions,
    options?: { stepInfo?: string }
  ): Promise<void> {
    const stepInfo = options?.stepInfo ?? `Sending message with select-then-format: "${message}"`;
    await test.step(stepInfo, async () => {
      await this.getConversationWindowComponent()
        .getChatEditorComponent()
        .sendMessageWithSelectAndFormat(message, formattingOptions, {
          stepInfo: options?.stepInfo ?? `Writing text first, then selecting and formatting: ${message}`,
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
      return await this.getConversationWindowComponent().replyToMessage(messageToReplyTo, replyMessage, {
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
      const chatEditorComponent = this.getConversationWindowComponent().getChatEditorComponent();
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
      const chatEditorComponent = this.getConversationWindowComponent().getChatEditorComponent();
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
      const messageWithAttachment = await this.getConversationWindowComponent().getLastMessageWithAttachment(
        attachmentType,
        {
          timeout: options?.timeout,
        }
      );
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
      const inboxSideBar = this.getInboxSideBarComponent();
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
      await this.actions.openUserDirectMessageItemInInboxForUser(userName, { timeout: options?.timeout });
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
    return await this.getInboxSideBarComponent().getGroupChatsSection().openGroupChat(groupName, {
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
    const directMessageItem = await this.getInboxSideBarComponent()
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
    const chatEditorComponent = this.getConversationWindowComponent().getChatEditorComponent();
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
    const chatEditorComponent = this.getConversationWindowComponent().getChatEditorComponent();
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
    const user1AudioVideoCallPage = await this.getConversationWindowComponent().startCall(callType, {
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
    const incomingCallComponent = await this.assertions.verifyIncomingCallIsReceivedFromCallerInGroupChat(
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
        const chatEditor = this.getConversationWindowComponent().getChatEditorComponent();
        await chatEditor.inputTextBox.click();
        await chatEditor.inputTextBox.pressSequentially(`@${groupName.slice(0, groupName.length - 1)}`, {
          delay: 300,
        });
        const mentionListComponent = this.getConversationWindowComponent().getMentionListComponent();
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
        await this.getConversationWindowComponent()
          .getChatEditorComponent()
          .inputTextBox.pressSequentially(`@${userName}`, {
            delay: 200,
          });
        await this.getConversationWindowComponent()
          .getMentionListComponent()
          .verifyMentionListIsVisible({ timeout: 20_000 });
        await this.getConversationWindowComponent().getMentionListComponent().selectMentionItem(userName);
        await this.getConversationWindowComponent().getMentionListComponent().verifyMentionListIsNotVisible();
        await this.getConversationWindowComponent().getChatEditorComponent().appendMessage(message);
        await this.getConversationWindowComponent().getChatEditorComponent().clickOnSendMessageButton();
      }
    );
  }

  /**
   * Opens the mentions section
   * @param options - Optional parameters for the step
   */
  async openMentionsSection(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Opening mentions section`, async () => {
      const mentionsSection = this.page.getByTestId('chat.mentions-section');
      await this.clickByInjectingJavaScript(mentionsSection);
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

  /**
   * Gets the message item from the chat
   * @param message - The message to get the message item for
   * @param options - Optional parameters for the step
   * @returns The message item for the given message
   */
  async getMessageItemFromChat(message: string, options?: { stepInfo?: string }): Promise<Locator> {
    return await this.getConversationWindowComponent().getMessageItemFromChat(message, {
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
      const messageItem =
        await this.getConversationWindowComponent().getFocusedMessageCardFromListOfChatMessages(message);
      await messageItem.deleteMessage();
    });
  }

  async unPinMessage(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Deleting message ${message}`, async () => {
      const messageItem =
        await this.getConversationWindowComponent().getFocusedMessageCardFromListOfChatMessages(message);
      await messageItem.unPinMessageFromPinnedMessage();
    });
  }

  async verifyMessageActionsNotVisible(message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Verifying message actions are not visible for message ${message}`,
      async () => {
        const messageItem =
          await this.getConversationWindowComponent().getDeletedOrLastMessageCardFromListOfChatMessages();
        await messageItem.verifyMessageActionsNotVisibleToUser();
      }
    );
  }

  async verifyEditMessageOptionNotVisible(message: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo ?? `Verifying edit message option are not visible for message ${message}`,
      async () => {
        const messageItem =
          await this.getConversationWindowComponent().getDeletedOrLastMessageCardFromListOfChatMessages();
        await messageItem.verifyEditMessageOptionNotVisibleToUser();
      }
    );
  }

  async verifyMessageActionsIsVisible(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Verifying message actions are visible for message ${message}`, async () => {
      const messageItem =
        await this.getConversationWindowComponent().getFocusedMessageCardFromListOfChatMessages(message);
      await messageItem.verifyMessageActionsIsVisibleToUser();
    });
  }

  async editAndUpdateMessage(message: string, editedMessage: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Editing and updating the message ${message}`, async () => {
      const messageItem =
        await this.getConversationWindowComponent().getFocusedMessageCardFromListOfChatMessages(message);
      await messageItem.editAndUpdateMessage(message, editedMessage);
    });
  }

  async editAndCancelMessage(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Editing and canceling the message ${message}`, async () => {
      const messageItem =
        await this.getConversationWindowComponent().getDeletedOrLastMessageCardFromListOfChatMessages();
      await messageItem.editAndCancelMessage();
    });
  }

  async pinSentMessage(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Pinning the sent message ${message}`, async () => {
      const messageItem =
        await this.getConversationWindowComponent().getDeletedOrLastMessageCardFromListOfChatMessages();
      await messageItem.pinSentMessage();
    });
  }

  async verifyPinnedMessage(message: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Pinning the sent message ${message}`, async () => {
      const messageItem =
        await this.getConversationWindowComponent().getDeletedOrLastMessageCardFromListOfChatMessages();
      await messageItem.verifyPinnedMessageIsVisible(message);
    });
  }

  /**
   * Gets the data message id for a given message
   * @param message - The message to get the data message id for
   * @param options - Optional parameters for the step
   * @returns The data message id for the given message
   */
  async getDataMessageId(message: string, options?: { stepInfo?: string }): Promise<string> {
    return await test.step(options?.stepInfo ?? `Getting data message id for message ${message}`, async () => {
      const messageId =
        await this.getConversationWindowComponent().getFocusedMessageCardIdFromListOfChatMessages(message);
      if (!messageId) {
        throw new Error(`Message ${message} not found in chat`);
      }
      return messageId;
    });
  }

  //assertions
  /**
   * Verifies that the user is able to add and delete an attachment in the chat editor.
   * @param attachmentPath - The path to the attachment to add and delete.
   * @param options - Optional parameters for the step.
   */
  public async verifyUserIsAbleToAddAndDeleteAttachmentInEditor(
    attachmentPath: string,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(
      options?.stepInfo || `Verifying user 1 is able to add and delete attachment in editor`,
      async () => {
        const chatEditorComponent = this.getConversationWindowComponent().getChatEditorComponent();
        await chatEditorComponent.addMediaAttachment(attachmentPath, {
          stepInfo: 'Adding media attachment to the chat',
          attachementRequestTimeout: 40_000,
          waitForAttachementRequestToComplete: true,
        });
        await this.sleep(2000);
        //VERIFY delete attachment button is visible and clickin on it will remove the attachement from the message
        await chatEditorComponent.verifyAttachementHasAddedToChatEditor({
          stepInfo: 'Verifying attachment is visible in editor',
        });

        //now user will delete the attachment
        await chatEditorComponent.deleteAttachementFromChatEditor(0, {
          stepInfo: 'Deleting the attachment',
        });

        //verify the attachment is not visible
        await chatEditorComponent.verifyTheAttachmentIsNotVisible({
          stepInfo: 'Verifying the attachment is not visible',
        });
      }
    );
  }

  /**
   * Verifies that a specific message is visible in the chat window.
   * @param chatPage - The chat page object for the user.
   * @param message - The message text to verify.
   * @param options - Optional parameters for timeout and step info.
   */
  public async verifyMessageIsVisible(
    message: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Verifying message "${message}" is visible`, async () => {
      return await this.getConversationWindowComponent().verifyMessageIsPresentInListOfChatMessages(message, {
        stepInfo: options?.stepInfo,
        timeout: options?.timeout,
      });
    });
  }

  public async verifyEditedMessageIsVisible(
    message: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Verifying message "${message}" is visible`, async () => {
      return await this.getConversationWindowComponent().verifyEditedMessageIsPresentInListOfChatMessages(message, {
        stepInfo: options?.stepInfo,
        timeout: options?.timeout,
      });
    });
  }

  public async verifyFormattedMessageIsVisible(
    message: string,
    formattingOptions: FormattingOptions,

    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Verifying message "${message}" is visible`, async () => {
      return await this.getConversationWindowComponent().verifyFormattedMessageIsPresentInListOfChatMessages(
        message,
        formattingOptions,
        {
          stepInfo: options?.stepInfo,
          timeout: options?.timeout,
        }
      );
    });
  }

  public async verifyUnsupportedFileHandling(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verifying unsupported file handling`, async () => {
      await this.getUnsupportedFileMessageDialogBoxComponent().verifyTheUnsupportedFileMessageIsVisible({
        stepInfo: `User 1 Verifying the unsupported file message is visible`,
      });
      //verify user is able to click on ok button to close the unsupported file message
      await this.getUnsupportedFileMessageDialogBoxComponent().clickOnOkButtonToCloseTheUnsupportedFileMessageDialogBox(
        {
          stepInfo: `User 1 Clicking on ok button to close the unsupported file message`,
        }
      );
      //verify the unsupported file message is not visible
      await this.getUnsupportedFileMessageDialogBoxComponent().verifyTheUnsupportedFileMessageIsNotVisible({
        stepInfo: `User 1 Verifying the unsupported file message is not visible`,
      });
      //verify the attachment is not visible
      await this.getConversationWindowComponent().getChatEditorComponent().verifyTheAttachmentIsNotVisible({
        stepInfo: `User 1 Verifying the attachment is not visible on the message editor now`,
        timeout: 10_000,
      });
    });
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
        return await this.getConversationWindowComponent()
          .getIncomingAudioVideoCallComponent()
          .verifyIncomingCallIsReceivedFromCaller(groupName, callType, {
            isGroupChat: true,
            stepInfo: `Verifying current user sees notification/popup for incoming ${callType} call from group name ${groupName}`,
          });
      }
    );
  }

  async verifyTheMessageAppearsDeleted(messageID: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Verifying the message appears deleted`, async () => {
      const messageItem = this.page.locator(`article[data-message-id='${messageID}']`);
      await expect(messageItem, `expecting message item to be deleted`).toBeVisible();
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
}
