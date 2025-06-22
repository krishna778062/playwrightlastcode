import { test } from '@playwright/test';
import { ChatAppPage } from '../pages/chatsPage';

export class DirectMessageActionsHelper {
  /**
   * Opens a direct message conversation with a specified user.
   * @param chatPage - The chat page object for the user.
   * @param userName - The full name of the user to start a conversation with.
   * @param options - Optional parameters for the step.
   */
  public static async openDirectMessageWithUser(
    chatPage: ChatAppPage,
    userName: string,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Opening direct message with user: ${userName}`, async () => {
      const inboxSideBar = chatPage.getInboxSideBarComponent();
      await inboxSideBar.clickCreateNewMessageButton();
      await inboxSideBar.verifyCreateNewMessageFormIsVisible();
      await inboxSideBar.searchAndSelectUser(userName);
      await inboxSideBar.clickStartChatButton();
    });
  }

  /**
   * Clicks on a user's direct message item in the inbox to open the conversation.
   * @param chatPage - The chat page object for the user.
   * @param userName - The full name of the user whose chat to open.
   * @param options - Optional parameters for timeout and step info.
   */
  public static async openUserDirectMessageItemInInbox(
    chatPage: ChatAppPage,
    userName: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Opening direct message for ${userName} from inbox`, async () => {
      await chatPage.openUserDirectMessageItemInInboxForUser(userName, { timeout: options?.timeout });
    });
  }
}
