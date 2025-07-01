import { expect, test } from '@playwright/test';
import { ChatAppPage } from '../pages/chatsPage';

/**
 * This class contains all the common assertions that can be performed on the chat page.
 */
export class ChatAssertionHelper {
  constructor(private readonly chatPage: ChatAppPage) {
    this.chatPage = chatPage;
  }

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
        const chatEditorComponent = this.chatPage.getConversationWindowComponent().getChatEditorComponent();
        await chatEditorComponent.addMediaAttachment(attachmentPath, {
          stepInfo: 'Adding media attachment to the chat',
          attachementRequestTimeout: 40_000,
          waitForAttachementRequestToComplete: true,
        });
        await this.chatPage.sleep(2000);
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
      return await this.chatPage.getConversationWindowComponent().verifyMessageIsPresentInListOfChatMessages(message, {
        stepInfo: options?.stepInfo,
        timeout: options?.timeout,
      });
    });
  }

  public async verifyUnsupportedFileHandling(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verifying unsupported file handling`, async () => {
      await this.chatPage.getUnsupportedFileMessageDialogBoxComponent().verifyTheUnsupportedFileMessageIsVisible({
        stepInfo: `User 1 Verifying the unsupported file message is visible`,
      });
      //verify user is able to click on ok button to close the unsupported file message
      await this.chatPage
        .getUnsupportedFileMessageDialogBoxComponent()
        .clickOnOkButtonToCloseTheUnsupportedFileMessageDialogBox({
          stepInfo: `User 1 Clicking on ok button to close the unsupported file message`,
        });
      //verify the unsupported file message is not visible
      await this.chatPage.getUnsupportedFileMessageDialogBoxComponent().verifyTheUnsupportedFileMessageIsNotVisible({
        stepInfo: `User 1 Verifying the unsupported file message is not visible`,
      });
      //verify the attachment is not visible
      await this.chatPage.getConversationWindowComponent().getChatEditorComponent().verifyTheAttachmentIsNotVisible({
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
        return await this.chatPage
          .getConversationWindowComponent()
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
      const messageItem = this.chatPage.page.locator(`article[data-message-id='${messageID}']`);
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
          const messageItem = await this.chatPage.page.getByTestId('message-item').all();
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
