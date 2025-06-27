import { Locator, Page, test } from '@playwright/test';
import { ChatAppPage } from '../pages/chatsPage';

export class CommonChatActionsHelper {
  /**
   * Sends a message in the focused chat window.
   * @param chatPage - The chat page object for the user.
   * @param message - The message to send.
   * @param options - Optional parameters for the step.
   */
  public static async sendMessage(
    chatPage: ChatAppPage,
    message: string,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Sending message: "${message}"`, async () => {
      await chatPage.sendMessage(message);
    });
  }

  /**
   * Sends a reply to a specific message in a thread.
   * @param chatPage - The chat page of the user sending the reply.
   * @param messageToReplyTo - The message to reply to.
   * @param replyMessage - The reply message to send.
   * @param options - Optional parameters for the step.
   */
  public static async replyToMessage(
    chatPage: ChatAppPage,
    messageToReplyTo: string,
    replyMessage: string,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(
      options?.stepInfo || `Sending reply "${replyMessage}" to message "${messageToReplyTo}"`,
      async () => {
        await chatPage.replyToMessage(messageToReplyTo, replyMessage);
      }
    );
  }

  /**
   * Verifies that a specific message is visible in the chat window.
   * @param chatPage - The chat page object for the user.
   * @param message - The message text to verify.
   * @param options - Optional parameters for timeout and step info.
   */
  public static async verifyMessageIsVisible(
    chatPage: ChatAppPage,
    message: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Verifying message "${message}" is visible`, async () => {
      await chatPage.verifyMessageIsVisible(message, { timeout: options?.timeout });
    });
  }

  /**
   * Sends an attachment to the chat
   * @param chatPage - The chat page object for the user.
   * @param attachmentPath - The path to the attachment to send.
   * @param options - Optional parameters for the step.
   */
  public static async sendAttachment(
    chatPage: ChatAppPage,
    attachmentPath: string,
    options?: { stepInfo?: string; isItValidFile?: boolean }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Sending attachment: "${attachmentPath}"`, async () => {
      const isItValidFile = options?.isItValidFile ?? true;
      const chatEditorComponent = chatPage.getFocusedChatComponent().getChatEditorComponent();
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

  public static async addAttachment(
    chatPage: ChatAppPage,
    attachmentPath: string,
    options?: { stepInfo?: string; isItValidFile?: boolean }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Adding attachment: "${attachmentPath}"`, async () => {
      const isItValidFile = options?.isItValidFile ?? true;
      console.log('isItValidFile', isItValidFile);
      await chatPage.getFocusedChatComponent().getChatEditorComponent().addMediaAttachment(attachmentPath, {
        stepInfo: 'Adding media attachment to the chat',
        attachementRequestTimeout: 40_000,
        waitForAttachementRequestToComplete: isItValidFile,
      });
    });
  }

  public static async getLastMessageWithAttachment(
    chatPage: ChatAppPage,
    attachmentType: 'image' | 'file' | 'video',
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<Locator> {
    return await test.step(options?.stepInfo || `Verifying message with attachment is visible`, async () => {
      const messageWithAttachment = await chatPage
        .getFocusedChatComponent()
        .getLastMessageWithAttachment(attachmentType, {
          timeout: options?.timeout,
        });
      return messageWithAttachment;
    });
  }

  public static async verifyUserIsAbleToAddAndDeleteAttachmentInEditor(
    chatPage: ChatAppPage,
    attachmentPath: string,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(
      options?.stepInfo || `Verifying user 1 is able to add and delete attachment in editor`,
      async () => {
        const chatEditorComponent = chatPage.getFocusedChatComponent().getChatEditorComponent();
        await chatEditorComponent.addMediaAttachment(attachmentPath, {
          stepInfo: 'Adding media attachment to the chat',
          attachementRequestTimeout: 40_000,
          waitForAttachementRequestToComplete: true,
        });
        await chatPage.sleep(2000);
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
}
