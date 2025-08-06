import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';

import { ApiClientFactory } from '../../../core/api/factories/apiClientFactory';
import { Roles } from '../../../core/constants/roles';
import { getEnvConfig } from '../../../core/utils/getEnvConfig';
import { MultiUserChatTestHelper } from '../helpers/multiUserChatTestHelper';
import { ChatGroupTestDataBuilder } from '../test-data-builders/ChatGroupTestDataBuilder';
import { ChatTestUser } from '../types/chat-test.type';

import { BrowserFactory } from '@/src/core/utils/browserFactory';

/**
 * This fixture should be used for tests that are related to direct messages
 * between 2 users
 * It includes
 * 1. Creating appManagerApiClient
 * 2. Creating endUsersForChat
 * 3. Creating loggedInContexts
 * 4. Creating user1Page
 * 5. Creating user2Page
 */
export const dmTestFixture = test.extend<
  {
    user1Page: Page;
    user2Page: Page;
  },
  {
    appManagerApiClient: AppManagerApiClient;
    endUsersForChat: ChatTestUser[];
    loggedInContexts: { [key: string]: BrowserContext };
  }
>({
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`INFO: Setting up app manager client for worker => `, workerInfo.workerIndex);
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
  endUsersForChat: [
    async ({ appManagerApiClient }, use) => {
      const chatGroupTestDataBuilder = new ChatGroupTestDataBuilder(appManagerApiClient);
      const userBuilder = chatGroupTestDataBuilder.getUserBuilder();
      const endUsers = await userBuilder.addUsersToSystem(2, Roles.END_USER, 'Simpplr@2025');
      const usersWithChatIds: ChatTestUser[] = await Promise.all(
        endUsers.map(async user => ({
          ...user,
          chatUserId: await appManagerApiClient
            .getUserManagementService()
            .getChatUserId(user.first_name, user.last_name),
        }))
      );
      await use(usersWithChatIds);
    },
    { scope: 'worker' },
  ],
  loggedInContexts: [
    async ({ endUsersForChat, browser }, use) => {
      const multiUserChatTestHelper = new MultiUserChatTestHelper(browser, true);
      await multiUserChatTestHelper.createContextsForUsers(endUsersForChat);
      const loggedInContexts = await multiUserChatTestHelper.createLoggedInContextsForUsers(endUsersForChat);
      await use(loggedInContexts);
      await multiUserChatTestHelper.cleanup();
    },
    { scope: 'worker' },
  ],
  user1Page: [
    async ({ loggedInContexts, endUsersForChat }, use) => {
      const user1Context = loggedInContexts[endUsersForChat[0].email];
      const user1Page = await user1Context.newPage();
      await use(user1Page);
      await BrowserFactory.closePageGracefullyForUser(user1Page, endUsersForChat[0].fullName);
    },
    { scope: 'test' },
  ],
  user2Page: [
    async ({ loggedInContexts, endUsersForChat }, use) => {
      const user2Context = loggedInContexts[endUsersForChat[1].email];
      const user2Page = await user2Context.newPage();
      await use(user2Page);
      await BrowserFactory.closePageGracefullyForUser(user2Page, endUsersForChat[1].fullName);
    },
    { scope: 'test' },
  ],
});
