import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { FeedManagementHelper } from '@core/helpers/feedManagementHelper';
import { LoginHelper } from '@core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { ChatAppPage } from '@/src/modules/chat/pages/chatPage/chatPage';

export type DualUserType = 'user1' | 'user2';

export interface DualUserCredentials {
  email: string;
  password: string;
  name: string;
}

export interface DualUserConfig {
  user1: DualUserCredentials;
  user2: DualUserCredentials;
}

// Default users (fallback to environment variables)
export const defaultDualUsers: DualUserConfig = {
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
export function createDualUserChatFixture(userConfig?: DualUserConfig) {
  const users = userConfig || defaultDualUsers;

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

      // Dual user helper methods
      dualUserHelpers: {
        openSameGroupChatForBothUsers: (groupName: string) => Promise<void>;
        sendMessageFromUser1: (message: string) => Promise<void>;
        sendMessageFromUser2: (message: string) => Promise<void>;
        verifyMessageVisibleForBothUsers: (message: string, timeout?: number) => Promise<void>;
        openDirectMessageBetweenUsers: () => Promise<void>;
      };

      // Management helpers
      siteManagementHelper: SiteManagementHelper;
      feedManagementHelper: FeedManagementHelper;
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

    // User 1 (End User) Setup
    user1Context: [
      async ({ browser }, use, workerInfo) => {
        console.log(`INFO: Creating User 1 context => Worker ${workerInfo.workerIndex}`);
        const context = await browser.newContext({
          viewport: { width: 1920, height: 1080 },
        });
        await use(context);
        await context?.close();
      },
      { scope: 'test' },
    ],

    user1HomePage: [
      async ({ user1Context }, use, workerInfo) => {
        console.log(`INFO: Logging in User 1 (${users.user1.name}) => Worker ${workerInfo.workerIndex}`);
        const page = await user1Context.newPage();
        const user1HomePage = await LoginHelper.loginWithPassword(page, {
          email: users.user1.email,
          password: users.user1.password,
        });
        await user1HomePage.verifyThePageIsLoaded();
        console.log(`SUCCESS: User 1 (${users.user1.name}) logged in successfully`);
        await use(user1HomePage);
        await page.close();
      },
      { scope: 'test' },
    ],

    user1Page: [
      async ({ user1HomePage }, use) => {
        await use(user1HomePage.page);
      },
      { scope: 'test' },
    ],

    user1ChatPage: [
      async ({ user1HomePage }, use) => {
        console.log(`INFO: Initializing User 1 chat page`);
        const chatPage = await user1HomePage.navigateToChatPageViaTopNavBar();
        await use(chatPage);
      },
      { scope: 'test' },
    ],

    // User 2 (End User) Setup
    user2Context: [
      async ({ browser }, use, workerInfo) => {
        console.log(`INFO: Creating User 2 context => Worker ${workerInfo.workerIndex}`);
        const context = await browser.newContext({
          viewport: { width: 1920, height: 1080 },
        });
        await use(context);
        await context?.close();
      },
      { scope: 'test' },
    ],

    user2HomePage: [
      async ({ user2Context }, use, workerInfo) => {
        console.log(`INFO: Logging in User 2 (${users.user2.name}) => Worker ${workerInfo.workerIndex}`);
        const page = await user2Context.newPage();
        const user2HomePage = await LoginHelper.loginWithPassword(page, {
          email: users.user2.email,
          password: users.user2.password,
        });
        await user2HomePage.verifyThePageIsLoaded();
        console.log(`SUCCESS: User 2 (${users.user2.name}) logged in successfully`);
        await use(user2HomePage);
        await page.close();
      },
      { scope: 'test' },
    ],

    user2Page: [
      async ({ user2HomePage }, use) => {
        await use(user2HomePage.page);
      },
      { scope: 'test' },
    ],

    user2ChatPage: [
      async ({ user2HomePage }, use) => {
        console.log(`INFO: Initializing User 2 chat page`);
        const chatPage = await user2HomePage.navigateToChatPageViaTopNavBar();
        await use(chatPage);
      },
      { scope: 'test' },
    ],

    // Dual User Helper Methods
    dualUserHelpers: [
      async ({ user1ChatPage, user2ChatPage }, use) => {
        const helpers = {
          /**
           * Opens the same group chat for both users simultaneously
           */
          async openSameGroupChatForBothUsers(groupName: string): Promise<void> {
            await test.step(`Opening group chat "${groupName}" for both users simultaneously`, async () => {
              await Promise.all([
                user1ChatPage.actions.openGroupChat(groupName, {
                  stepInfo: `User 1 opening group chat "${groupName}"`,
                }),
                user2ChatPage.actions.openGroupChat(groupName, {
                  stepInfo: `User 2 opening group chat "${groupName}"`,
                }),
              ]);
            });
          },

          /**
           * Sends a message from User 1
           */
          async sendMessageFromUser1(message: string): Promise<void> {
            await test.step(`User 1 sending message: "${message}"`, async () => {
              await user1ChatPage.actions.sendMessage(message);
            });
          },

          /**
           * Sends a message from User 2
           */
          async sendMessageFromUser2(message: string): Promise<void> {
            await test.step(`User 2 sending message: "${message}"`, async () => {
              await user2ChatPage.actions.sendMessage(message);
            });
          },

          /**
           * Verifies that a message is visible for both users
           */
          async verifyMessageVisibleForBothUsers(message: string, timeout: number = 10000): Promise<void> {
            await test.step(`Verifying message "${message}" is visible for both users`, async () => {
              await Promise.all([
                user1ChatPage.assertions.verifyMessageIsVisible(message, {
                  stepInfo: `Verifying message "${message}" is visible for User 1`,
                  timeout,
                }),
                user2ChatPage.assertions.verifyMessageIsVisible(message, {
                  stepInfo: `Verifying message "${message}" is visible for User 2`,
                  timeout,
                }),
              ]);
            });
          },

          /**
           * Opens direct message conversation between the two users
           */
          async openDirectMessageBetweenUsers(): Promise<void> {
            await test.step(`Opening direct message between users`, async () => {
              // User 1 opens chat with User 2
              await user1ChatPage.actions.openDirectMessageWithUser(users.user2.name, {
                stepInfo: `${users.user1.name} opening direct message with ${users.user2.name}`,
              });

              // User 2 opens chat with User 1
              await user2ChatPage.actions.openDirectMessageWithUser(users.user1.name, {
                stepInfo: `${users.user2.name} opening direct message with ${users.user1.name}`,
              });
            });
          },
        };

        await use(helpers);
      },
      { scope: 'test' },
    ],
  });
}

// Default dual user chat fixture using environment variables
export const dualUserChatFixture = createDualUserChatFixture();

// Export the test object for convenience
export { test };
