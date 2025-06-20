import { test } from '@playwright/test';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { CHAT_TEST_DATA } from '@chat/tests/test-data/chat.test-data';
import { BaseMultiUserChatTest } from '../../../helpers/multiUserChatTestHelper';
import { Roles } from '@core/constants/roles';

test.describe(
  'Test chat application with attachment',
  {
    tag: [TestSuite.CHAT],
  },
  () => {
    test.describe.configure({ timeout: CHAT_TEST_DATA.CONFIG.DEFAULT_TIMEOUT, mode: 'default' });
    let multiUserChatTest: BaseMultiUserChatTest;

    test.beforeEach(
      'Setting up the test environment, by creating 1 new user to tenant so to test out attachment in chat',
      async ({ browser }) => {
        multiUserChatTest = new BaseMultiUserChatTest();
        await multiUserChatTest.setup(browser, {
          usersByRole: {
            [Roles.END_USER]: 1,
          },
          password: CHAT_TEST_DATA.CREDENTIALS.DEFAULT_PASSWORD,
        });
        await multiUserChatTest.createMultiUserContexts();
      }
    );

    test.afterEach(async () => {
      await multiUserChatTest.cleanup();
    });

    test(
      'User is able to send attachment in chat',
      {
        tag: [TestPriority.P0,'@chat-attachment'],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'CONT-5376',
          storyId: 'CONT-5376',
          customTags: ['@chat-attachment'],
        });
        // Get test users
        const user1 = multiUserChatTest.getTestUserByIndex(0);

        // Login both users and navigate to chats
        const [user1ChatsPage] =
          await multiUserChatTest.loginMultipleUsersAndNavigateToChats();

        //Now user 1 opens direct message with user 2
        await user1ChatsPage
          .getInboxSideBarComponent()
          .openDirectMessageWithUser(`${user1.first_name} ${user1.last_name}`, {
            stepInfo: `User 1 opening direct message with ${user1.first_name} ${user1.last_name}`,
          });

        });
      }
    );

