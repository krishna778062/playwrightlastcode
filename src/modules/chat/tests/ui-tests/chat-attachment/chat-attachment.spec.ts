import { groupChatTestFixture as test } from '@chat/fixtures/groupChatFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { CHAT_TEST_DATA } from '@chat/test-data/chat.test-data';

import { ChatHelper } from '@chat/helpers/chatHelper';
import { ChatAppPage } from '@chat/pages/chatsPage';
import { ChatTestUser } from '@chat/types/chat-test.type';

test.describe(
  'Test chat application with attachment',
  {
    tag: [TestSuite.CHAT_ATTACHMENT],
  },
  () => {
    let user1: ChatTestUser;
    let user2: ChatTestUser;
    let user1ChatPage: ChatAppPage;
    let user2ChatPage: ChatAppPage;
    test.beforeEach(
      'Setting up the test environment, by creating 1 new user to tenant so to test out attachment in chat',
      async ({ endUsersForChat, user1Page, user2Page }) => {
        user1 = endUsersForChat[0];
        user2 = endUsersForChat[1];
        user1ChatPage = new ChatAppPage(user1Page);
        user2ChatPage = new ChatAppPage(user2Page);
        await Promise.all([user1ChatPage.loadPage({ timeout: 40_000 }), user2ChatPage.loadPage({ timeout: 40_000 })]);
      }
    );

    test(
      'User is able to send attachment in chat',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        //now open conversation with user 2
        await ChatHelper.directMessages.openDirectMessageWithUser(user1ChatPage, user2.fullName, {
          stepInfo: `User 1 opening direct message with ${user2.fullName}`,
        });

        //verify that user 1 can send attachment in chat
        await ChatHelper.common.sendMessage(user1ChatPage, CHAT_TEST_DATA.MESSAGES.USER1.INITIAL);
      }
    );
  }
);
