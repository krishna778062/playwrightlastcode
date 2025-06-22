import { test } from '@playwright/test';
import { Roles } from '@core/constants/roles';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { CHAT_TEST_DATA } from '@chat/tests/test-data/chat.test-data';
import { MultiUserChatTestHelper } from '../../../helpers/multiUserChatTestHelper';
import { TestGroupType } from '../../../../../core/constants/testType';
import { ChatTestUser } from '../../../types';
import { ChatHelper } from '@chat/helpers/chatHelper';

test.describe('Direct Message between multiple users', { tag: ['@direct-message'] }, () => {
  let multiUserChatTest: MultiUserChatTestHelper;
  let user1: ChatTestUser;
  let user2: ChatTestUser;

  test.beforeEach(
    'Setting up the test environment, by creating 2 new users to tenant so to test out messaging between them',
    async ({ browser }) => {
      multiUserChatTest = new MultiUserChatTestHelper();
      // Step 1: Create all backend test data
      await multiUserChatTest.setup(browser, {
        usersByRole: {
          [Roles.END_USER]: 2,
        },
        password: CHAT_TEST_DATA.CREDENTIALS.DEFAULT_PASSWORD,
        recordVideo: true,
      });
      // Step 2: Create browser contexts for ONLY the users needed for this test
      await multiUserChatTest.createContextsForUsers([0, 1]);
      user1 = multiUserChatTest.testData.users[0];
      user2 = multiUserChatTest.testData.users[1];
    }
  );

  test.afterEach(async () => {
    await multiUserChatTest.cleanup();
  });

  test(
    'Verify that user 1 can open direct message with user 2 and they both are able to send message to each other',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'CONT-5376',
      });
      const [user1ChatsPage, user2ChatsPage] = await multiUserChatTest.loginMultipleUsersAndNavigateToChats();
      //user 1 creates new chat with user 2
      await ChatHelper.directMessages.openDirectMessageWithUser(user1ChatsPage, user2.fullName, {
        stepInfo: `User 1 opening direct message with ${user2.fullName}`,
      });

      //now user 1 sends message to user 2
      await ChatHelper.common.sendMessage(user1ChatsPage, CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `User 1 sending message to user 2`,
      });

      //verify user 2 sees the message appearing in his inbox
      await ChatHelper.directMessages.openUserDirectMessageItemInInbox(user2ChatsPage, user1.fullName, {
        stepInfo: `Verifying user 2 is able to see user 1 in his inbox`,
        timeout: 40_000,
      });

      await ChatHelper.common.sendMessage(user2ChatsPage, CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
        stepInfo: `User 2 sending message ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} to user 1`,
      });

      //verify user 1 is able to see the message from user 2
      await ChatHelper.common.verifyMessageIsVisible(user1ChatsPage, CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
        stepInfo: `Verifying user 1 is able to see the message ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} from user 2`,
      });

      //now user 1 sends message to user 2 in DM window
      await ChatHelper.common.sendMessage(user1ChatsPage, CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `User 1 sending message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL} to user 2`,
      });

      //we will verify that user 2 is able to see the message from user 1 in his DM window
      await ChatHelper.common.verifyMessageIsVisible(user2ChatsPage, CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `Verifying user 2 is able to see the message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL} from user 1`,
      });
    }
  );
});
