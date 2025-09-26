import { Browser, test } from '@playwright/test';

import { ChatAppPage } from '@chat/ui/pages/chatPage/chatPage';
import { MultiUserTestHelper } from '@core/helpers/multiUserTestHelper';
import { ChatTestSetupResult } from '@modules/chat/types';

import { defaultDualUsers } from '../fixtures/dualUserChatFixture';

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
   * Opens a direct message between two users (assumes two users only).
   * @param chatPages - Array of ChatAppPage for the users (length 2)
   * @param userIndices - Array of user indices to identify users in step info (length 2)
   */
  async openDirectMessageBetweenUsers(chatPages: ChatAppPage[], userIndices: number[]) {
    if (chatPages.length !== 2 || userIndices.length !== 2) {
      throw new Error('openDirectMessageBetweenUsers expects exactly two users.');
    }
    await test.step(`Opening direct message between User ${userIndices[0] + 1} and User ${userIndices[1] + 1}`, async () => {
      // User 1 opens DM with User 2
      await chatPages[0].actions.openDirectMessageWithUser(defaultDualUsers.user2.fullName, {
        stepInfo: `User ${userIndices[0] + 1} opening direct message with User ${userIndices[1] + 1}`,
      });
      // User 2 opens DM with User 1
      await chatPages[1].actions.openDirectMessageWithUser(defaultDualUsers.user1.fullName, {
        stepInfo: `User ${userIndices[1] + 1} opening direct message with User ${userIndices[0] + 1}`,
      });
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
