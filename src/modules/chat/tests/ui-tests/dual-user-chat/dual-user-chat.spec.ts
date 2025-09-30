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

  test(
    "Message Deletion: Verify deletion of user's own message with no time limit",
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ multiUserChatTestHelper, chatPages }) => {
      tagTest(test.info(), {
        description:
          'Verify that user can delete their own message at any time and it shows "This message has been deleted"',
        zephyrTestId: 'CHAT-2400',
        storyId: 'CHAT-2400',
      });

      // Open direct message conversation between users
      await multiUserChatTestHelper.openDirectMessageBetweenUsers(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        [0, 1]
      );

      // User 1 sends a message that will be deleted
      const messageToDelete = `Message to be deleted - ${Date.now()}`;
      await test.step('User 1 sends a message', async () => {
        await chatPages.user1ChatPage.actions.sendMessage(messageToDelete);
      });

      // Verify message appears for both users initially
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        messageToDelete
      );

      // Get the message ID before deletion for verification
      let messageId: string;
      await test.step('Get message ID for verification', async () => {
        messageId = await chatPages.user1ChatPage.actions.getDataMessageId(messageToDelete);
        console.log(`INFO: Message ID obtained: ${messageId}`);
      });

      // User 1 deletes their own message
      await test.step('User 1 deletes their own message', async () => {
        await chatPages.user1ChatPage.actions.deleteMessage(messageToDelete, {
          stepInfo: 'User 1 deleting their own message',
        });
      });

      // Verify message is replaced with deleted message indicator for both users
      await test.step('Verify message shows as deleted for both users', async () => {
        await chatPages.user1ChatPage.verifyTheMessageAppearsDeleted(messageId, {
          stepInfo: 'Verify User 1 sees deleted message indicator',
        });
        await chatPages.user2ChatPage.verifyTheMessageAppearsDeleted(messageId, {
          stepInfo: 'Verify User 2 sees deleted message indicator',
        });
      });

      // Verify original message text no longer appears in chat
      await test.step('Verify original message no longer visible', async () => {
        await chatPages.user1ChatPage
          .getConversationWindowComponent()
          .verifyMessageIsNotPresentInListOfChatMessages(messageToDelete, {
            stepInfo: 'Verify original message not visible for User 1',
            timeout: 10000,
          });
        await chatPages.user2ChatPage
          .getConversationWindowComponent()
          .verifyMessageIsNotPresentInListOfChatMessages(messageToDelete, {
            stepInfo: 'Verify original message not visible for User 2',
            timeout: 10000,
          });
      });

      // Additional verification: Send another message to ensure chat functionality still works
      await test.step('Verify chat functionality continues to work after deletion', async () => {
        const followUpMessage = `Follow-up message after deletion - ${Date.now()}`;
        await chatPages.user2ChatPage.actions.sendMessage(followUpMessage);
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          followUpMessage
        );
      });
    }
  );

  test(
    "Message Deletion: Verify deletion of user's own message in group chat",
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ multiUserChatTestHelper, chatPages }) => {
      tagTest(test.info(), {
        description: 'Verify that user can delete their own message in group chat and both users see the deletion',
        zephyrTestId: 'CHAT-2401',
        storyId: 'CHAT-2401',
      });

      // Open same group chat for both users
      await multiUserChatTestHelper.openGroupChatForMultipleUsers(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        CONSTANT_DATA.COMMON_GROUP_NAME,
        [0, 1]
      );

      // User 1 sends a message that will be deleted
      const messageToDelete = `Group message to be deleted - ${Date.now()}`;
      await test.step('User 1 sends a message in group chat', async () => {
        await chatPages.user1ChatPage.actions.sendMessage(messageToDelete);
      });

      // Verify message appears for both users initially
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        messageToDelete
      );

      // Get the message ID before deletion
      let messageId: string;
      await test.step('Get message ID for verification', async () => {
        messageId = await chatPages.user1ChatPage.actions.getDataMessageId(messageToDelete);
        console.log(`INFO: Group message ID obtained: ${messageId}`);
      });

      // User 1 deletes their own message from group chat
      await test.step('User 1 deletes their own message from group chat', async () => {
        await chatPages.user1ChatPage.actions.deleteMessage(messageToDelete, {
          stepInfo: 'User 1 deleting their own message from group chat',
        });
      });

      // Verify message shows as deleted for both users in group chat
      await test.step('Verify message shows as deleted for both users in group chat', async () => {
        await chatPages.user1ChatPage.verifyTheMessageAppearsDeleted(messageId, {
          stepInfo: 'Verify User 1 sees deleted message indicator in group chat',
        });
        await chatPages.user2ChatPage.verifyTheMessageAppearsDeleted(messageId, {
          stepInfo: 'Verify User 2 sees deleted message indicator in group chat',
        });
      });

      // Verify original message text no longer appears in group chat
      await test.step('Verify original message no longer visible in group chat', async () => {
        await chatPages.user1ChatPage
          .getConversationWindowComponent()
          .verifyMessageIsNotPresentInListOfChatMessages(messageToDelete, {
            stepInfo: 'Verify original group message not visible for User 1',
            timeout: 10000,
          });
        await chatPages.user2ChatPage
          .getConversationWindowComponent()
          .verifyMessageIsNotPresentInListOfChatMessages(messageToDelete, {
            stepInfo: 'Verify original group message not visible for User 2',
            timeout: 10000,
          });
      });

      // Verify group chat functionality continues to work
      await test.step('Verify group chat functionality continues after deletion', async () => {
        const followUpMessage = `Follow-up group message after deletion - ${Date.now()}`;
        await chatPages.user2ChatPage.actions.sendMessage(followUpMessage);
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          followUpMessage
        );
      });
    }
  );
});
