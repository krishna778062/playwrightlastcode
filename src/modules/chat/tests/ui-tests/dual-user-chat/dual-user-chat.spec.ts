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
    async ({ dualUserHelpers }) => {
      tagTest(test.info(), {
        description: 'Real-time conversation between two users in a group chat',
        zephyrTestId: 'CHAT-2245',
        storyId: 'CHAT-2245',
      });
      // Open the same group chat for both users
      await dualUserHelpers.openSameGroupChatForBothUsers(CONSTANT_DATA.COMMON_GROUP_NAME);

      // User 1 starts the conversation
      const message1 = `Hi there! - ${Date.now()}`;
      await dualUserHelpers.sendMessageFromUser1(message1);
      await dualUserHelpers.verifyMessageVisibleForBothUsers(message1);

      // User 2 responds
      const message2 = `Hello back! - ${Date.now()}`;
      await dualUserHelpers.sendMessageFromUser2(message2);
      await dualUserHelpers.verifyMessageVisibleForBothUsers(message2);

      // User 1 continues the conversation
      const message3 = `How are you doing? - ${Date.now()}`;
      await dualUserHelpers.sendMessageFromUser1(message3);
      await dualUserHelpers.verifyMessageVisibleForBothUsers(message3);
    }
  );

  test(
    'Messaging: Real time conversation between static user in direct message',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ dualUserHelpers, loggedInHomePages, chatPages }) => {
      tagTest(test.info(), {
        description: 'Direct message between two users with parallel browser context setup',
        zephyrTestId: 'CHAT-2246',
        storyId: 'CHAT-2246',
      });

      // Verify that both users have been logged in in parallel
      console.log(
        `INFO: Both users logged in parallel - User1: ${loggedInHomePages[0].homePage.constructor.name}, User2: ${loggedInHomePages[1].homePage.constructor.name}`
      );
      console.log(`INFO: Both chat pages created in parallel - Total pages: ${Object.keys(chatPages).length}`);

      // Open direct message conversation between users
      await dualUserHelpers.openDirectMessageBetweenUsers();

      // Send direct messages
      const directMessage1 = `Private message from User 1 - ${Date.now()}`;
      await dualUserHelpers.sendMessageFromUser1(directMessage1);
      await dualUserHelpers.verifyMessageVisibleForBothUsers(directMessage1);

      const directMessage2 = `Private reply from User 2 - ${Date.now()}`;
      await dualUserHelpers.sendMessageFromUser2(directMessage2);
      await dualUserHelpers.verifyMessageVisibleForBothUsers(directMessage2);
    }
  );
});
