import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { Roles } from '../../../core/constants/roles';
import { getEnvConfig } from '../../../core/utils/getEnvConfig';
import { PLATFORM_API_ENDPOINTS } from '../../platforms/apis/platformApiEndpoints';
import { UserManagementService } from '../../platforms/apis/services/UserManagementService';
import { MultiUserChatTestHelper } from '../helpers/multiUserChatTestHelper';
import { ChatGroupTestDataBuilder } from '../test-data-builders/ChatGroupTestDataBuilder';
import { ChatTestUser } from '../types/chat-test.type';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { USER_STATUS } from '@/src/core/constants/status';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
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
    user1UINavigationHelper: NavigationHelper;
    user2Page: Page;
    user2UINavigationHelper: NavigationHelper;
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
        console.log('=== Starting user cleanup in endUsersForChat fixture (DM) ===');
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
        console.log('=== User cleanup completed (DM) ===');
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
  user1Page: [
    async ({ loggedInContexts, endUsersForChat }, use) => {
      const user1Context = loggedInContexts[endUsersForChat[0].email];
      const user1Page = await user1Context.newPage();
      await use(user1Page);
      await BrowserFactory.closePageGracefullyForUser(user1Page, endUsersForChat[0].fullName);
    },
    { scope: 'test' },
  ],
  user1UINavigationHelper: [
    async ({ user1Page }, use, _workerInfo) => {
      const user1UINavigationHelper = new NavigationHelper(user1Page);
      await use(user1UINavigationHelper);
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
  user2UINavigationHelper: [
    async ({ user2Page }, use, _workerInfo) => {
      const user2UINavigationHelper = new NavigationHelper(user2Page);
      await use(user2UINavigationHelper);
    },
    { scope: 'test' },
  ],
});
