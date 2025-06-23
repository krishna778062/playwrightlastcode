import { test } from '@playwright/test';
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
}
