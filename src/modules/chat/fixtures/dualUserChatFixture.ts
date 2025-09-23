import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { MultiUserChatTestHelper } from '@modules/chat/helpers/multiUserChatTestHelper';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { ChatAppPage } from '@/src/modules/chat/pages/chatPage/chatPage';

export interface StaticUsers {
  email: string;
  password: string;
  name: string;
}

export interface StaticUsersConfig {
  user1: StaticUsers;
  user2: StaticUsers;
}

// Default users (fallback to environment variables)
export const defaultDualUsers: StaticUsersConfig = {
  user1: {
    email: process.env.END_USER_USERNAME || '',
    password: process.env.END_USER_PASSWORD || '',
    name: process.env.END_USER_PROFILENAME || '',
  },
  user2: {
    email: process.env.END_USER2_USERNAME || '',
    password: process.env.END_USER2_PASSWORD || '',
    name: process.env.END_USER2_PROFILENAME || '',
  },
};

/**
 * Creates a dual user chat test fixture with custom user configurations
 *
 * @param userConfig - Optional custom user configuration. If not provided, uses default users from environment variables
 * @returns Playwright test fixture configured for dual user chat testing
 */
export function createDualUserChatFixture(userConfig?: StaticUsersConfig) {
  const testUsers = userConfig || defaultDualUsers;

  return test.extend<
    {
      // User 1 (End User) fixtures
      user1Context: BrowserContext;
      user1HomePage: NewUxHomePage | OldUxHomePage;
      user1Page: Page;
      user1ChatPage: ChatAppPage;

      // User 2 (End User) fixtures
      user2Context: BrowserContext;
      user2HomePage: NewUxHomePage | OldUxHomePage;
      user2Page: Page;
      user2ChatPage: ChatAppPage;

      // Multi-user test helper
      multiUserChatTestHelper: MultiUserChatTestHelper;

      // Parallel login result
      loggedInHomePages: Array<{ homePage: NewUxHomePage | OldUxHomePage; page: Page }>;

      // Parallel chat page navigation result
      chatPages: { user1ChatPage: ChatAppPage; user2ChatPage: ChatAppPage };
    },
    {
      appManagerApiClient: AppManagerApiClient;
    }
  >({
    appManagerApiClient: [
      async ({}, use, workerInfo) => {
        console.log(`INFO: Setting up app manager client for dual user tests => Worker ${workerInfo.workerIndex}`);
        const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
          type: 'credentials',
          credentials: {
            username: getEnvConfig().appManagerEmail,
            password: getEnvConfig().appManagerPassword,
          },
          baseUrl: getEnvConfig().apiBaseUrl,
        });
        await use(appManagerApiClient);
      },
      { scope: 'worker' },
    ],

    multiUserChatTestHelper: [
      async ({ browser }, use) => {
        console.log(
          `INFO: Setting up MultiUserChatTestHelper for parallel context creation: ${testUsers.user1.name}, ${testUsers.user2.name}`
        );
        const helper = new MultiUserChatTestHelper(browser, true);

        // Create contexts for users in parallel using the helper
        await helper.createContextsForUsers(Object.values(testUsers));

        await use(helper);

        // Cleanup
        await helper.cleanup();
      },
      { scope: 'test' },
    ],

    // Parallel login for both users
    loggedInHomePages: [
      async ({ multiUserChatTestHelper }, use, workerInfo) => {
        console.log(`INFO: Logging in both users in parallel => Worker ${workerInfo.workerIndex}`);

        // Login both users simultaneously using Promise.all
        const loginPromises = Object.values(testUsers).map(async (user, index) => {
          const userContext = multiUserChatTestHelper.getContextForUser(user.email);
          const page = await userContext.context.newPage();

          console.log(`INFO: Starting parallel login for ${user.fullName}`);
          const homePage = await LoginHelper.loginWithPassword(page, {
            email: user.email,
            password: testUsers[index === 0 ? 'user1' : 'user2'].password,
          });

          await homePage.verifyThePageIsLoaded();
          console.log(`SUCCESS: ${user.fullName} logged in successfully`);

          return { homePage, page };
        });

        // Wait for both users to login simultaneously
        const loggedInHomePages = await Promise.all(loginPromises);

        await use(loggedInHomePages);

        // Cleanup pages
        await Promise.all(loggedInHomePages.map(({ page }) => page.close()));
      },
      { scope: 'test' },
    ],

    // User 1 (End User) Setup
    user1Context: [
      async ({ multiUserChatTestHelper }, use, workerInfo) => {
        console.log(`INFO: Getting User 1 context from MultiUserChatTestHelper => Worker ${workerInfo.workerIndex}`);
        const userContext = multiUserChatTestHelper.getContextForUser(testUsers.user1.email);
        await use(userContext.context);
      },
      { scope: 'test' },
    ],

    user1HomePage: [
      async ({ loggedInHomePages }, use, workerInfo) => {
        console.log(`INFO: Getting User 1 HomePage from parallel login => Worker ${workerInfo.workerIndex}`);
        const user1HomePageData = loggedInHomePages[0];
        await use(user1HomePageData.homePage);
      },
      { scope: 'test' },
    ],

    user1Page: [
      async ({ loggedInHomePages }, use) => {
        const user1PageData = loggedInHomePages[0];
        await use(user1PageData.page);
      },
      { scope: 'test' },
    ],

    // Parallel chat page navigation for both users
    chatPages: [
      async ({ user1HomePage, user2HomePage }, use) => {
        console.log(`INFO: Navigating to chat pages in parallel for both users`);

        // Navigate to chat pages simultaneously using Promise.all
        const chatPagePromises = [
          user1HomePage.navigateToChatPageViaTopNavBar(),
          user2HomePage.navigateToChatPageViaTopNavBar(),
        ];

        const [user1ChatPage, user2ChatPage] = await Promise.all(chatPagePromises);
        console.log(`SUCCESS: Both users navigated to chat pages in parallel`);

        await use({ user1ChatPage, user2ChatPage });
      },
      { scope: 'test' },
    ],

    user1ChatPage: [
      async ({ chatPages }, use) => {
        await use(chatPages.user1ChatPage);
      },
      { scope: 'test' },
    ],

    // User 2 (End User) Setup
    user2Context: [
      async ({ multiUserChatTestHelper }, use, workerInfo) => {
        console.log(`INFO: Getting User 2 context from MultiUserChatTestHelper => Worker ${workerInfo.workerIndex}`);
        const userContext = multiUserChatTestHelper.getContextForUser(testUsers.user2.email);
        await use(userContext.context);
      },
      { scope: 'test' },
    ],

    user2HomePage: [
      async ({ loggedInHomePages }, use, workerInfo) => {
        console.log(`INFO: Getting User 2 HomePage from parallel login => Worker ${workerInfo.workerIndex}`);
        const user2HomePageData = loggedInHomePages[1];
        await use(user2HomePageData.homePage);
      },
      { scope: 'test' },
    ],

    user2Page: [
      async ({ loggedInHomePages }, use) => {
        const user2PageData = loggedInHomePages[1];
        await use(user2PageData.page);
      },
      { scope: 'test' },
    ],

    user2ChatPage: [
      async ({ chatPages }, use) => {
        await use(chatPages.user2ChatPage);
      },
      { scope: 'test' },
    ],
  });
}

// Default dual user chat fixture using environment variables
export const dualUserChatFixture = createDualUserChatFixture();

// Export the test object for convenience
export { test };
