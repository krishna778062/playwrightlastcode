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

// Global registry to track users that need cleanup (backup mechanism)
const pendingCleanupUsers: Array<{
  userId: string;
  email: string;
  apiBaseUrl: string;
}> = [];

// Helper function to deactivate a single user with timeout
async function deactivateUserWithTimeout(
  httpClient: UserManagementService['httpClient'],
  userId: string,
  email: string,
  timeoutMs: number = 15000
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    await httpClient.put(PLATFORM_API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserIdStatus(userId), {
      data: { status: USER_STATUS.INACTIVE },
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log(`✗ Failed to deactivate user ${email}: ${error}`);
    return false;
  }
}

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
      // Declare outside try so cleanup can access even if setup fails partially
      let usersWithChatIds: ChatTestUser[] = [];
      let setupError: Error | null = null;

      try {
        const chatGroupTestDataBuilder = new ChatGroupTestDataBuilder(appManagerApiContext, getEnvConfig().apiBaseUrl);
        const userBuilder = chatGroupTestDataBuilder.getUserBuilder();
        const endUsers = await userBuilder.addUsersToSystem(2, Roles.END_USER, 'Simpplr@2025');
        usersWithChatIds = await Promise.all(
          endUsers.map(async user => ({
            ...user,
            chatUserId: await userManagementService.getChatUserId(user.first_name, user.last_name),
          }))
        );

        // Register users for cleanup tracking
        for (const user of usersWithChatIds) {
          if (user.userId) {
            pendingCleanupUsers.push({
              userId: user.userId,
              email: user.email,
              apiBaseUrl: getEnvConfig().apiBaseUrl,
            });
          }
        }

        await use(usersWithChatIds);
      } catch (error) {
        setupError = error as Error;
        console.log('❌ Setup failed, will attempt cleanup for any created users');
        console.log(`Error: ${setupError.message}`);

        // Try to find any users that were partially created by checking pendingCleanupUsers
        // Also search for users by searching the system if we have partial info
        if (usersWithChatIds.length === 0 && pendingCleanupUsers.length > 0) {
          console.log(`Found ${pendingCleanupUsers.length} users in pending cleanup registry`);
        }

        throw setupError; // Re-throw after cleanup
      } finally {
        // Cleanup: Deactivate users after worker is done
        // This runs even if setup fails partially!
        const usersToCleanup = usersWithChatIds.length > 0 ? usersWithChatIds : [];
        const pendingUsers = pendingCleanupUsers.filter(u => u.apiBaseUrl === getEnvConfig().apiBaseUrl);

        // Combine both sources of users to cleanup
        const allUsersToCleanup = [
          ...usersToCleanup.map(u => ({ userId: u.userId, email: u.email })),
          ...pendingUsers.filter(pu => !usersToCleanup.some(u => u.userId === pu.userId)),
        ];

        if (allUsersToCleanup.length > 0) {
          console.log('╔══════════════════════════════════════════════════════════╗');
          console.log('║  CLEANUP STARTED - Deactivating users                    ║');
          console.log(`║  Users to cleanup: ${allUsersToCleanup.length}                                   ║`);
          console.log(`║  Timestamp: ${new Date().toISOString()}            ║`);
          console.log('╚══════════════════════════════════════════════════════════╝');

          const cleanupResults: Array<{ email: string; success: boolean }> = [];

          // Process all users in parallel with individual timeouts
          await Promise.allSettled(
            allUsersToCleanup.map(async user => {
              if (user.userId) {
                console.log(`🔄 Deactivating user ${user.email} (userId: ${user.userId})`);
                const success = await deactivateUserWithTimeout(
                  userManagementService.httpClient,
                  user.userId,
                  user.email,
                  15000 // 15 second timeout per user
                );

                if (success) {
                  console.log(`✅ Successfully deactivated: ${user.email}`);
                  // Remove from pending cleanup since it succeeded
                  const idx = pendingCleanupUsers.findIndex(u => u.userId === user.userId);
                  if (idx !== -1) pendingCleanupUsers.splice(idx, 1);
                }

                cleanupResults.push({ email: user.email, success });
              }
            })
          );

          // Summary
          const successful = cleanupResults.filter(r => r.success).length;
          const failed = cleanupResults.filter(r => !r.success).length;

          console.log('╔══════════════════════════════════════════════════════════╗');
          console.log('║  CLEANUP COMPLETED                                       ║');
          console.log(`║  ✅ Success: ${successful} | ❌ Failed: ${failed}                            ║`);
          console.log(`║  Timestamp: ${new Date().toISOString()}            ║`);
          console.log('╚══════════════════════════════════════════════════════════╝');

          if (failed > 0) {
            console.log('⚠️  Some users failed to deactivate. They may need manual cleanup.');
            console.log(
              'Failed users:',
              cleanupResults.filter(r => !r.success).map(r => r.email)
            );
          }
        } else {
          console.log('ℹ️  No users to cleanup');
        }
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
