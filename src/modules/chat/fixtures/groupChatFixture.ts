import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { MultiUserChatTestHelper } from '../helpers/multiUserChatTestHelper';
import { ChatGroupTestDataBuilder } from '../test-data-builders/ChatGroupTestDataBuilder';
import { ChatTestUser } from '../types/chat-test.type';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { Roles } from '@/src/core/constants/roles';
import { USER_STATUS } from '@/src/core/constants/status';
import { BrowserFactory } from '@/src/core/utils/browserFactory';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { PLATFORM_API_ENDPOINTS } from '@/src/modules/platforms/apis/platformApiEndpoints';
import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

/**
 * This fixture should be used for tests that are related to group chats
 * It includes
 * 1. Creating appManagerApiClient
 * 2. Creating endUsersForChat
 * 3. Creating loggedInContexts
 * 4. Creating new group with endUsersForChat
 * 5. Creating user1Page using loggedInContexts
 * 6. Creating user2Page using loggedInContexts
 */
export const groupChatTestFixture = test.extend<
  {
    groupName: string;
    user1Page: Page;
    user2Page: Page;
  },
  {
    appManagerApiContext: APIRequestContext;
    userManagementService: UserManagementService;
    endUsersForChat: ChatTestUser[];
    loggedInContexts: { [key: string]: BrowserContext };
  }
>({
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  userManagementService: [
    async ({ appManagerApiContext }, use) => {
      const userManagementService = new UserManagementService(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(userManagementService);
    },
    { scope: 'worker' },
  ],
  endUsersForChat: [
    async ({ appManagerApiContext, userManagementService }, use) => {
      const chatGroupTestDataBuilder = new ChatGroupTestDataBuilder(appManagerApiContext, getEnvConfig().apiBaseUrl);
      const userBuilder = chatGroupTestDataBuilder.getUserBuilder();
      const endUsers = await userBuilder.addUsersToSystem(2, Roles.END_USER, 'Simpplr@2025');
      const usersWithChatIds: ChatTestUser[] = await Promise.all(
        endUsers.map(async user => ({
          ...user,
          chatUserId: await userManagementService.getChatUserId(user.first_name, user.last_name),
        }))
      );

      try {
        await use(usersWithChatIds);
      } finally {
        // Cleanup: Deactivate users after worker is done
        // Note: We call API directly without test.step() since we're in fixture teardown
        // Using finally ensures this ALWAYS runs, even if tests fail
        console.log('=== Starting user cleanup in endUsersForChat fixture ===');
        for (const user of usersWithChatIds) {
          if (user.userId) {
            try {
              console.log(`Deactivating user ${user.email} with userId: ${user.userId}`);
              await userManagementService.httpClient.put(
                PLATFORM_API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserIdStatus(user.userId),
                {
                  data: {
                    status: USER_STATUS.INACTIVE,
                  },
                }
              );
              console.log(`✓ Successfully deactivated user ${user.email}`);
            } catch (error) {
              console.log(`✗ Failed to deactivate user ${user.email}: ${error}`);
            }
          }
        }
        console.log('=== User cleanup completed ===');
      }
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
  groupName: [
    async ({ appManagerApiContext, endUsersForChat }, use) => {
      const chatGroupTestDataBuilder = new ChatGroupTestDataBuilder(appManagerApiContext, getEnvConfig().apiBaseUrl);
      const groupName = TestDataGenerator.generateGroupName();
      const chatTestUserIds = endUsersForChat.map(user => user.chatUserId);
      const group = await chatGroupTestDataBuilder.createChatGroup(groupName, chatTestUserIds, {
        conversationType: 'GROUP',
      });
      await use(group);
    },
    { scope: 'test' },
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
