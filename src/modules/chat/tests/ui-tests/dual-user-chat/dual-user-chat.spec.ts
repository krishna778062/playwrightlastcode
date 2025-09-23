import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture';

import CONSTANT_DATA from '../../../constants/constantData';
import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

/**
 * Example test suite demonstrating how to use the dualUserChatFixture
 * for testing chat functionality with two users simultaneously
 */
test.describe('Direct Message between two static users', { tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE] }, () => {
  test(
    'Messaging: Real time conversation in a group chat',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ multiUserChatTestHelper, chatPages }) => {
      tagTest(test.info(), {
        description: 'Real-time conversation between two users in a group chat',
        zephyrTestId: 'CHAT-2245',
        storyId: 'CHAT-2245',
      });
      // Open the same group chat for both users
      // await dualUserHelpers.openSameGroupChatForBothUsers(CONSTANT_DATA.COMMON_GROUP_NAME);
      await multiUserChatTestHelper.openGroupChatForMultipleUsers(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        CONSTANT_DATA.COMMON_GROUP_NAME,
        [0, 1]
      );

      // User 1 starts the conversation
      const message1 = `Hi there! - ${Date.now()}`;
      // Send message from User 1
      await chatPages.user1ChatPage.actions.sendMessage(message1);
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        message1
      );

      // User 2 responds
      const message2 = `Hello back! - ${Date.now()}`;
      await chatPages.user2ChatPage.actions.sendMessage(message2);
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        message2
      );

      // User 1 continues the conversation
      const message3 = `How are you doing? - ${Date.now()}`;
      await chatPages.user1ChatPage.actions.sendMessage(message3);
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        message3
      );
    }
  );

  test(
    'Messaging: Real time conversation between static user in direct message',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ multiUserChatTestHelper, chatPages }) => {
      tagTest(test.info(), {
        description: 'Direct message between two users with parallel browser context setup',
        zephyrTestId: 'CHAT-2246',
        storyId: 'CHAT-2246',
      });

      // Open direct message conversation between users
      await multiUserChatTestHelper.openDirectMessageBetweenUsers(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        [0, 1]
      );

      // Send direct messages
      const directMessage1 = `Private message from User 1 - ${Date.now()}`;
      await chatPages.user1ChatPage.actions.sendMessage(directMessage1);
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        directMessage1
      );

      const directMessage2 = `Private reply from User 2 - ${Date.now()}`;
      await chatPages.user1ChatPage.actions.sendMessage(directMessage2);
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        directMessage2
      );
    }
  );
});
