import { test } from '@playwright/test';
import { BaseMultiUserChatTest } from '@chat-helpers/multiUserChatTestHelper';
import { Roles } from '@core/constants/roles';
import { tagTest } from '../../../../../core/utils/testDecorator';
import { TestPriority } from '../../../../../core/constants/testPriority';
import { TestSuite } from '../../../../../core/constants/testSuite';
import { CHAT_TEST_DATA } from '../../test-data/chat.test-data';

test.describe(
  'Test chat application with multiple users',
  {
    tag: [TestSuite.CHAT],
  },
  () => {
    test.describe.configure({ timeout: CHAT_TEST_DATA.CONFIG.DEFAULT_TIMEOUT, mode: 'default' });
    let multiUserChatTest: BaseMultiUserChatTest;

    test.beforeEach(
      'Setting up the test environment, by creating 2 new users to tenant so to test out messaging between them',
      async ({ browser }) => {
        multiUserChatTest = new BaseMultiUserChatTest();
        await multiUserChatTest.setup(browser, {
          usersByRole: {
            [Roles.END_USER]: 2,
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
      'Verify that user 1 can open direct message with user 2 and they both are able to send message to each other',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'CONT-5376',
          storyId: 'CONT-5376',
          customTags: ['@direct-message'],
        });
        // Get test users
        const user1 = multiUserChatTest.getTestUserByIndex(0);
        const user2 = multiUserChatTest.getTestUserByIndex(1);

        // Login both users and navigate to chats
        const [user1ChatsPage, user2ChatsPage] =
          await multiUserChatTest.loginMultipleUsersAndNavigateToChats();

        //Now user 1 opens direct message with user 2
        await user1ChatsPage
          .getInboxSideBarComponent()
          .openDirectMessageWithUser(`${user2.first_name} ${user2.last_name}`, {
            stepInfo: `User 1 opening direct message with ${user2.first_name} ${user2.last_name}`,
          });

        //now user 1 sends message to user 2 in DM window
        await user1ChatsPage
          .getFocusedChatComponent()
          .getChatEditorComponent()
          .sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
            stepInfo: `User 1 sending message to user 2`,
          });

        //verify user 2 is able to see user 1 in his inbox and clicking on it opens the direct message with user 1
        const focusedChatComponentForUser2 = await user2ChatsPage
          .getInboxSideBarComponent()
          .getDirectMessageComponent()
          .openDirectMessageWithUser(`${user1.first_name} ${user1.last_name}`, {
            stepInfo: `User 2 opening direct message with ${user1.first_name} ${user1.last_name}`,
          });

        //verify user 2 is able to see the message from user 1
        await focusedChatComponentForUser2.verifyMessageIsPresentInListOfChatMessages(
          CHAT_TEST_DATA.MESSAGES.USER1.INITIAL,
          {
            stepInfo: `Verifying user 2 is able to see the message from user 1`,
          }
        );

        //now user 2 sends message to user 1 in DM window
        await focusedChatComponentForUser2
          .getChatEditorComponent()
          .sendMessage(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
            stepInfo: `User 2 sending ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} message to user 1`,
          });

        //we will verify that user 1 is able to see the message from user 2 in his DM window
        await user1ChatsPage
          .getFocusedChatComponent()
          .verifyMessageIsPresentInListOfChatMessages(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
            stepInfo: `Verifying user 1 is able to see the message ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} from user 2`,
          });
      }
    );
  }
);
