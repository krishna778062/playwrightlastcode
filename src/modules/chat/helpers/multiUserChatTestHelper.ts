import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { Browser, Page, test } from '@playwright/test';
import { ChatAppPage } from '@modules/chat/pages/chatsPage';
import { ChatTestUser, ChatTestSetupConfig, ChatTestSetupResult } from '@modules/chat/types';
import { ChatGroupTestDataBuilder } from '@chat/test-data-builders/ChatGroupTestDataBuilder';
import { Roles } from '@core/constants/roles';
import { MultiUserTestHelper } from '@core/helpers/multiUserTestHelper';
import { LoginHelper } from '@core/helpers/loginHelper';
import { TIMEOUTS } from '@core/constants/timeouts';
import { getEnvConfig } from '@core/utils/getEnvConfig';

export class MultiUserChatTestHelper extends MultiUserTestHelper {
  private static readonly DEFAULT_PASSWORD = 'Simpplr@2025';

  public testData!: ChatTestSetupResult;

  constructor(browser: Browser, recordVideo: boolean = false) {
    super(browser, { recordVideo });
  }

  /**
   * Sets up a complete chat test environment
   * @param config Configuration for the chat test setup
   */
  async setup(config: ChatTestSetupConfig) {
    // 1. Create app manager client and test data builder
    const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
      type: 'credentials',
      credentials: {
        username: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      },
      baseUrl: getEnvConfig().apiBaseUrl,
    });

    const chatGroupTestDataBuilder = new ChatGroupTestDataBuilder(appManagerApiClient);
    const userBuilder = chatGroupTestDataBuilder.getUserBuilder();

    // 2. Create users as per config
    for (const [role, count] of Object.entries(config.usersByRole)) {
      const users = await userBuilder.addUsersToSystem(count, role as Roles, config.password);
      this.testUsers.push(...users);
    }
    // 3. Get chat user IDs for all users
    const usersWithChatIds: ChatTestUser[] = await Promise.all(
      this.testUsers.map(async user => ({
        ...user,
        chatUserId: await appManagerApiClient.getUserManagementService().getChatUserId(user.first_name, user.last_name),
      }))
    );

    // 4. Create group
    const groupName = config.groupName || TestDataGenerator.generateGroupName();
    if (config.createGroup !== false) {
      await appManagerApiClient.getChatService().createChatGroup(
        groupName,
        usersWithChatIds.map(user => user.chatUserId),
        {
          conversationType: 'GROUP',
        }
      );
    }

    // 5. Store all relevant data
    this.testData = {
      users: usersWithChatIds,
      groupName,
      appManagerApiClient,
      testDataBuilder: chatGroupTestDataBuilder,
    };
  }

  /**
   * Returns the test data object
   * @returns The test data object
   */
  public getTestData(): ChatTestSetupResult {
    return this.testData;
  }

  /**
   * Login a user and navigate to chats page
   * @param page - The page to login to
   * @param email - The email of the user to login
   * @param password - The password of the user to login
   * @returns The chats page
   */
  async loginAndNavigateToChatsPage(
    page: Page,
    email: string,
    password: string,
    options?: { stepInfo?: string; timeout?: number }
  ) {
    const homePage = await LoginHelper.loginWithPassword(page, { email, password });
    await homePage.navigateToChatsPage({
      stepInfo: options?.stepInfo || `Navigating to chats page for user ${email}`,
      timeout: options?.timeout || TIMEOUTS.LONG,
    });
    return new ChatAppPage(page);
  }

  /**
   * Login multiple users and navigate to chats page
   * @param userIndices - The indices of the users to login
   * @returns The chats pages for the users
   */
  async loginMultipleUsersAndNavigateToChats(userIndices: number[] = [0, 1]) {
    let listOfChatAppPages: ChatAppPage[] | undefined;

    await test.step(`Simultaneously logging in and navigating to chats for users  ${userIndices.join(', ')}`, async () => {
      const loginPromises = userIndices.map(async index => {
        const user = this.testData.users[index];
        const page = this.getPageForUser(user.email);
        return this.loginAndNavigateToChatsPage(page, user.email, MultiUserChatTestHelper.DEFAULT_PASSWORD, {
          stepInfo: `Logging in and navigating to chats for user ${user.email}`,
        });
      });
      listOfChatAppPages = await Promise.all(loginPromises);
    });

    if (listOfChatAppPages === undefined) {
      throw new Error('Failed to login and navigate to chats for users');
    }
    return listOfChatAppPages;
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
        return chatPage.openGroupChat(groupName, {
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
        return chatPage.verifyMessageIsVisible(message, {
          stepInfo: `Verifying message "${message}" is present for User ${userNumber}`,
          timeout: options?.timeout,
        });
      });
      await Promise.all(verifyPromises);
    });
  }

  /**
   * Creates browser contexts for a specific set of users
   * @param userIndices Array of indices for the users who need a browser context
   */

  public async createContextsForUsersBasedOnIndex(userIndices: number[]) {
    const usersToCreateContextsFor = userIndices.map(index => this.testData.users[index]);
    await this.createContextsForUsers(usersToCreateContextsFor);
  }
}
