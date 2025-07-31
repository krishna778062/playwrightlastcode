import { CHAT_SUITE_TAGS } from '@chat/constants/testTags';
import { dmTestFixture as test } from '@chat/fixtures/dmFixture';
import { CHAT_TEST_DATA } from '@chat/test-data/chat.test-data';
import { ChatTestUser } from '@chat/types/chat-test.type';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ChatAppPage } from '@/src/modules/chat/pages/chatPage/chatPage';

test.describe.only('Direct Message between multiple users', { tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE] }, () => {
  let user1: ChatTestUser;
  let user2: ChatTestUser;
  let user1ChatPage: ChatAppPage;
  let user2ChatPage: ChatAppPage;
  test.beforeEach(
    'Setting up the test environment, by creating 2 new users to tenant so to test out messaging between them',
    async ({ endUsersForChat, user1Page, user2Page }) => {
      user1 = endUsersForChat[0];
      user2 = endUsersForChat[1];
      user1ChatPage = new ChatAppPage(user1Page);
      user2ChatPage = new ChatAppPage(user2Page);
      await Promise.all([user1ChatPage.loadPage({ timeout: 40_000 }), user2ChatPage.loadPage({ timeout: 40_000 })]);
    }
  );

  test(
    'Verify that user 1 can open direct message with user 2 and they both are able to send message to each other',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'CONT-5376',
      });
      //user 1 creates new chat with user 2
      await user1ChatPage.actions.openDirectMessageWithUser(user2.fullName, {
        stepInfo: `User 1 opening direct message with ${user2.fullName}`,
      });

      //now user 1 sends message to user 2
      await user1ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `User 1 sending message to user 2`,
      });

      //verify user 2 sees the message appearing in his inbox
      await user2ChatPage.actions.openUserDirectMessageItemInInbox(user1.fullName, {
        stepInfo: `Verifying user 2 is able to see user 1 in his inbox and opening the direct message with user 1`,
        timeout: 40_000,
      });

      await user2ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
        stepInfo: `User 2 sending message ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} to user 1`,
      });

      //verify user 1 is able to see the message from user 2
      await user1ChatPage.assertions.verifyMessageIsVisible(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL, {
        stepInfo: `Verifying user 1 is able to see the message ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL} from user 2`,
      });

      //now user 1 sends message to user 2 in DM window
      await user1ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `User 1 sending message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL} to user 2`,
      });

      //we will verify that user 2 is able to see the message from user 1 in his DM window
      await user2ChatPage.assertions.verifyMessageIsVisible(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
        stepInfo: `Verifying user 2 is able to see the message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL} from user 1`,
      });
    }
  );
});
