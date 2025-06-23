import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { CHAT_TEST_DATA } from '@/src/modules/chat/test-data/chat.test-data';
import { Roles } from '@core/constants/roles';
import { MultiUserChatTestHelper } from '@chat/helpers/multiUserChatTestHelper';
import { ChatHelper } from '@chat/helpers/chatHelper';

test.describe(
  'Test chat application with attachment',
  {
    tag: [TestSuite.CHAT_ATTACHMENT],
  },
  () => {
    let multiUserChatTest: MultiUserChatTestHelper;

    test.beforeEach(
      'Setting up the test environment, by creating 1 new user to tenant so to test out attachment in chat',
      async ({ browser }) => {
        multiUserChatTest = new MultiUserChatTestHelper();
        // Step 1: Create all backend test data
        await multiUserChatTest.setup(browser, {
          usersByRole: {
            [Roles.END_USER]: 2,
          },
          password: CHAT_TEST_DATA.CREDENTIALS.DEFAULT_PASSWORD,
        });
        // Step 2: Create a browser context for ONLY the user needed for this test
        await multiUserChatTest.createContextsForUsers([0]);
      }
    );

    test.afterEach(async () => {
      await multiUserChatTest.cleanup();
    });

    test(
      'User is able to send attachment in chat',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        const user1 = multiUserChatTest.getTestData().users[0];
        const user2 = multiUserChatTest.getTestData().users[1];

        // Login user1  and navigate to chats
        const user1ChatsPage = await multiUserChatTest.loginAndNavigateToChatsPage(
          multiUserChatTest.getPageForUser(user1.email),
          user1.email,
          CHAT_TEST_DATA.CREDENTIALS.DEFAULT_PASSWORD
        );

        //now open conversation with user 2
        await ChatHelper.directMessages.openDirectMessageWithUser(user1ChatsPage, user2.fullName, {
          stepInfo: `User 1 opening direct message with ${user2.fullName}`,
        });

        //verify that user 1 can send attachment in chat
        await ChatHelper.common.sendMessage(user1ChatsPage, CHAT_TEST_DATA.MESSAGES.USER1.INITIAL);
      }
    );
  }
);
