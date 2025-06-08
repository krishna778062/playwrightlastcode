import { ApiClientFactory } from '@core/apiClients/apiClientFactory';
import { AppManagerApiClient } from '@core/apiClients/appManagerApiClient';
import { TestDataBuilderUsingAPI } from '@/src/core/utils/testDataBuilder';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { Roles } from '@core/constants/roles';
import { Browser, Page, test } from '@playwright/test';
import { BrowserFactory, MultiUserContexts } from '@/src/core/utils/browserFactory';
import { LoginPage } from '@modules/chat/pages/loginPage';
import { ChatAppPage } from '@modules/chat/pages/chatsPage';
import { ChatTestUser, ChatTestSetupConfig, ChatTestSetupResult } from '@modules/chat/types';

export class BaseMultiUserChatTest {
  private static readonly DEFAULT_PASSWORD = 'Simpplr@2025';
  protected appManagerApiClient!: AppManagerApiClient;
  protected groupName!: string;
  protected testUsers!: ChatTestUser[];
  protected testDataBuilder!: TestDataBuilderUsingAPI;
  protected multiUserContexts!: MultiUserContexts;
  protected browserFactory!: BrowserFactory;

  /**
   * Sets up a complete chat test environment
   * @param config Configuration for the chat test setup
   * @returns Setup result containing users, group name, and API clients
   */

  async setup(browser: Browser, config: ChatTestSetupConfig) {
    const setupResult = await BaseMultiUserChatTest.init(config);
    this.appManagerApiClient = setupResult.appManagerApiClient;
    this.testDataBuilder = setupResult.testDataBuilder;
    this.groupName = setupResult.groupName;
    this.testUsers = setupResult.users;
    this.browserFactory = new BrowserFactory(browser);
  }

  getPageForUser(email: string) {
    return this.multiUserContexts[email].page;
  }

  getContextForUser(email: string) {
    return this.multiUserContexts[email];
  }

  getTestUser(email: string) {
    return this.testUsers.find(user => user.email === email);
  }

  getTestUserByIndex(index: number) {
    return this.testUsers[index];
  }

  getTestUserByName(firstName: string, lastName: string) {
    return this.testUsers.find(
      user => user.first_name === firstName && user.last_name === lastName
    );
  }

  getGroupName() {
    return this.groupName;
  }

  /**
   * Login a user and navigate to chats page
   * @param page - The page to login to
   * @param email - The email of the user to login
   * @param password - The password of the user to login
   * @returns The chats page
   */
  async loginAndNavigateToChats(
    page: Page,
    email: string,
    password: string,
    options?: { stepInfo?: string; timeout?: number }
  ) {
    const loginPage = new LoginPage(page);
    await loginPage.loadPage({
      stepInfo: options?.stepInfo || `Loading login page for user ${email}`,
      timeout: options?.timeout,
    });
    const homePage = await loginPage.login(email, password, {
      stepInfo: options?.stepInfo || `Logging in for user ${email}`,
      timeout: options?.timeout,
    });
    await homePage.getTopNavBarComponent().navigateToChatsPage({
      stepInfo: options?.stepInfo || `Navigating to chats page for user ${email}`,
      timeout: options?.timeout,
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
        const user = this.getTestUserByIndex(index);
        const page = this.getPageForUser(user.email);
        return this.loginAndNavigateToChats(
          page,
          user.email,
          BaseMultiUserChatTest.DEFAULT_PASSWORD,
          {
            stepInfo: `Logging in and navigating to chats for user ${user.email}`,
          }
        );
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
  async openGroupChatForMultipleUsers(
    chatPages: ChatAppPage[],
    groupName: string,
    userIndices?: number[]
  ) {
    await test.step(`Opening group chat ${groupName} for multiple users simultaneously`, async () => {
      const openChatPromises = chatPages.map((chatPage, index) => {
        const userNumber = userIndices ? userIndices[index] + 1 : index + 1;
        return chatPage
          .getInboxSideBarComponent()
          .getGroupChatsSection()
          .openGroupChat(groupName, {
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
        return chatPage
          .getFocusedChatComponent()
          .verifyMessageIsPresentInListOfChatMessages(message, {
            stepInfo: `Verifying message "${message}" is present for User ${userNumber}`,
            timeout: options?.timeout,
          });
      });
      await Promise.all(verifyPromises);
    });
  }

  /**
   * Send a reply message in a thread
   * @param chatPage - The chat page of the user sending the reply
   * @param messageToReplyTo - The message to reply to
   * @param replyMessage - The reply message to send
   * @param options - Optional parameters
   * @param options.userNumber - User number for step info (defaults to 1)
   * @returns The reply thread component
   */
  async sendReplyMessageInThread(
    chatPage: ChatAppPage,
    messageToReplyTo: string,
    replyMessage: string,
    options?: {
      userNumber?: number;
    }
  ) {
    const userNumber = options?.userNumber || 1;
    return await test.step(`User ${userNumber} replying to message "${messageToReplyTo}"`, async () => {
      const message = await chatPage
        .getFocusedChatComponent()
        .getFocusedMessageObjectFromListOfChatMessages(messageToReplyTo);
      const replyThreadComponent = await message.openReplyThread();
      await replyThreadComponent.getChatEditorComponent().sendMessage(replyMessage, {
        stepInfo: `User ${userNumber} sending reply: "${replyMessage}"`,
      });
      return replyThreadComponent;
    });
  }

  /**
   * Cleanup the test environment
   */
  async cleanup() {
    await this.browserFactory?.cleanupContexts(this.multiUserContexts);
  }

  /**
   * Create multi user contexts
   */
  async createMultiUserContexts() {
    this.multiUserContexts = await this.browserFactory.createMultiUserContexts(
      this.testUsers.map(user => user.email)
    );
  }

  /**
   * Initialize the test environment
   * @param config - The configuration for the test environment
   * @returns The setup result containing users, group name, and API clients
   */
  static async init(config: ChatTestSetupConfig): Promise<ChatTestSetupResult> {
    // Create app manager client
    const appManagerApiClient = await this.createAppManagerClient();
    const testDataBuilder = new TestDataBuilderUsingAPI(appManagerApiClient);

    // Create users based on roles
    const users: ChatTestUser[] = [];
    for (const [role, count] of Object.entries(config.usersByRole)) {
      const newUsers = await this.addAndActivateUsers(
        testDataBuilder,
        role as Roles,
        count,
        config.password
      );
      users.push(...newUsers);
    }

    // Get chat user IDs for all users
    const usersWithChatIds = await this.addChatUserIds(appManagerApiClient, users);

    // Create group and add users to it
    const groupName = config.groupName || TestDataGenerator.generateGroupName();
    await appManagerApiClient.getChatService().createChatGroup(
      groupName,
      usersWithChatIds.map(user => user.chatUserId!)
    );

    return {
      users: usersWithChatIds,
      groupName,
      appManagerApiClient,
      testDataBuilder,
    };
  }

  private static async createAppManagerClient(): Promise<AppManagerApiClient> {
    return await ApiClientFactory.createClient(AppManagerApiClient, {
      type: 'credentials',
      credentials: {
        username: process.env.APP_MANAGER_USERNAME!,
        password: process.env.APP_MANAGER_PASSWORD!,
      },
      baseUrl: process.env.API_BASE_URL!,
    });
  }

  public static async addAndActivateUsers(
    testDataBuilder: TestDataBuilderUsingAPI,
    role: Roles,
    count: number,
    password: string = this.DEFAULT_PASSWORD
  ): Promise<ChatTestUser[]> {
    let listOfChatTestUsers: ChatTestUser[] | undefined;

    await test.step(`Adding and activating ${count} users for role ${role}`, async () => {
      const userPromises: Promise<ChatTestUser>[] = [];
      for (let i = 0; i < count; i++) {
        const newUser = testDataBuilder.addAndActivateUser(
          TestDataGenerator.generateUser(),
          role,
          password
        ) as Promise<ChatTestUser>;
        userPromises.push(newUser);
      }
      listOfChatTestUsers = await Promise.all(userPromises);
    });

    if (listOfChatTestUsers === undefined) {
      throw new Error('Failed to add and activate users');
    }
    return listOfChatTestUsers;
  }

  private static async addChatUserIds(
    appManagerApiClient: AppManagerApiClient,
    users: ChatTestUser[]
  ): Promise<ChatTestUser[]> {
    const chatUserIdPromises = users.map(async user => {
      const chatUserId = await appManagerApiClient
        .getUserManagementService()
        .getChatUserId(user.first_name, user.last_name);
      return { ...user, chatUserId };
    });
    return await Promise.all(chatUserIdPromises);
  }
}
