import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture';

import CONSTANT_DATA from '../../../constants/constantData';
import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

/**
 * Message pinning test suite using dual user fixture
 * Tests message pinning functionality in direct messages and group chats
 */
test.describe(
  'message Pinning Tests - Direct Message',
  {
    tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE],
  },
  () => {
    test(
      'message Pinning: Verify user can pin and view their sent message in direct chat',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'Verify that user can pin their sent message in direct chat and view pinned messages',
          zephyrTestId: 'CHAT-2900',
          storyId: 'CHAT-2900',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // When: User 1 sends a message to be pinned
        const messageToPinDirect = `Message to pin in direct chat - ${Date.now()}`;
        await test.step('User 1 sends a message that will be pinned', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(messageToPinDirect);
        });

        // Verify message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          messageToPinDirect
        );

        // Then: User 1 pins their message
        await test.step('User 1 pins their message in direct chat', async () => {
          await chatPages.user1ChatPage.actions.pinSentMessage(messageToPinDirect);
        });

        // Verify both users can see the pinned message
        await test.step('Verify both users can see the pinned message', async () => {
          await chatPages.user1ChatPage.assertions.verifyPinnedMessage(messageToPinDirect);
          await chatPages.user2ChatPage.assertions.verifyPinnedMessage(messageToPinDirect);
        });

        // User 1 unpin their own message
        await test.step('User 1 unpin their own message', async () => {
          await chatPages.user1ChatPage.actions.unPinMessage(messageToPinDirect, {
            stepInfo: 'User 1 unpin their own message',
          });
        });
      }
    );

    test(
      'message Pinning: Verify user can pin messages sent by other users in direct chat',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'Verify that users can pin messages sent by other users in direct chat conversation',
          zephyrTestId: 'CHAT-2901',
          storyId: 'CHAT-2901',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // User 1 sends a message
        const user1Message = `User 1 message to be pinned by User 2 - ${Date.now()}`;
        await test.step('User 1 sends a message', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(user1Message);
        });

        // Verify message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          user1Message
        );

        // User 2 pins User 1's message
        await test.step("User 2 pins User 1's message", async () => {
          await chatPages.user2ChatPage.actions.pinSentMessage(user1Message);
        });

        // Verify message is pinned for both users
        await test.step('Verify message is pinned for both users', async () => {
          // Both users should see the pinned message indicator
          await chatPages.user1ChatPage.assertions.verifyPinnedMessage(user1Message);
          await chatPages.user2ChatPage.assertions.verifyPinnedMessage(user1Message);
        });

        // User 2 unpin User 1's message
        await test.step("User 2 unpin User 1's message", async () => {
          await chatPages.user2ChatPage.actions.unPinMessage(user1Message, {
            stepInfo: "User 2 unpin User 1's message",
          });
        });
      }
    );
  }
);

/**
 * Message pinning test suite for group chats
 * Tests message pinning functionality in group conversations
 */
test.describe(
  'message Pinning Tests - Group Chat',
  {
    tag: [CHAT_SUITE_TAGS.GROUP_CHAT],
  },
  () => {
    test(
      'message Pinning: Verify user can pin and view their sent message in group chat',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'Verify that user can pin their sent message in group chat and both users can see it',
          zephyrTestId: 'CHAT-3000',
          storyId: 'CHAT-3000',
        });

        // Given: Users open the same group chat
        await test.step('Users open common group chat', async () => {
          await multiUserChatTestHelper.openGroupChatForMultipleUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            CONSTANT_DATA.COMMON_GROUP_NAME,
            [0, 1]
          );
        });

        // When: User 1 sends a message to the group that will be pinned
        const messageToPinGroup = `Group message to pin - ${Date.now()}`;
        await test.step('User 1 sends a message to group chat that will be pinned', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(messageToPinGroup);
        });

        // Verify message appears for both users in group chat
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          messageToPinGroup
        );

        // Then: User 1 pins their group message
        await test.step('User 1 pins their message in group chat', async () => {
          await chatPages.user1ChatPage.actions.pinSentMessage(messageToPinGroup);
        });

        // Verify message is pinned in group chat for both users
        await test.step('Verify message is pinned in group chat for both users', async () => {
          // Both users should see the pinned message indicator in group chat
          await chatPages.user1ChatPage.assertions.verifyPinnedMessage(messageToPinGroup);
          await chatPages.user2ChatPage.assertions.verifyPinnedMessage(messageToPinGroup);
        });

        // User 1 unpin their own message
        await test.step('User 1 unpin their own message', async () => {
          await chatPages.user1ChatPage.actions.unPinMessage(messageToPinGroup, {
            stepInfo: 'User 1 unpin their own message',
          });
        });
      }
    );
  }
);
