import { Browser, test } from '@playwright/test';

import { MultiUserTestHelper } from '@core/helpers/multiUserTestHelper';
import { ChatTestSetupResult } from '@modules/chat/types';

import { ChatAppPage } from '@/src/modules/chat/pages/chatPage/chatPage';

export class MultiUserChatTestHelper extends MultiUserTestHelper {
  public testData!: ChatTestSetupResult;

  constructor(browser: Browser, recordVideo: boolean = false) {
    super(browser, { recordVideo });
  }

  /**
   * Returns the test data object
   * @returns The test data object
   */
  public getTestData(): ChatTestSetupResult {
    return this.testData;
  }

  /**
   * Opens the same group chat for multiple users simultaneously
   * @param chatPages - Array of chat pages for different users
   * @param groupName - Name of the group to open
   * @param userIndices - Array of user indices to identify users in step info (optional)
   */
  async openGroupChatForMultipleUsers(chatPages: ChatAppPage[], groupName: string, userIndices?: number[]) {
    await test.step(`Opening group chat ${groupName} for multiple users simultaneously`, async () => {
      const openChatPromises = chatPages.map((chatPage, index) => {
        const userNumber = userIndices ? userIndices[index] + 1 : index + 1;
        return chatPage.actions.openGroupChat(groupName, {
          stepInfo: `User ${userNumber} opening group chat ${groupName}`,
        });
      });
      await Promise.all(openChatPromises);
    });
  }

  /**
   * Verify a message is present in chat for multiple users
   * @param chatPages - Array of chat pages for different users
   * @param message - Message to verify
   * @param options - Optional parameters
   * @param options.timeout - Timeout for verification
   * @param options.userIndices - Array of user indices to identify users in step info
   */
  async verifyMessageAppearsForAllTheUsersInChatSection(
    chatPages: ChatAppPage[],
    message: string,
    options?: {
      timeout?: number;
      userIndices?: number[];
    }
  ) {
    await test.step(`Verifying message "${message}" for multiple users simultaneously`, async () => {
      const verifyPromises = chatPages.map((chatPage, index) => {
        const userNumber = options?.userIndices ? options.userIndices[index] + 1 : index + 1;
        return chatPage.assertions.verifyMessageIsVisible(message, {
          stepInfo: `Verifying message "${message}" is present for User ${userNumber}`,
          timeout: options?.timeout,
        });
      });
      await Promise.all(verifyPromises);
    });
  }
}
