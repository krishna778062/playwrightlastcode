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
test.describe('direct Message between two static users', { tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE] }, () => {
  test(
    "message Deletion: Verify deletion of user's own message with no time limit",
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
    "message Deletion: Verify deletion of user's own message in group chat",
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

  test(
    'message Deletion: Verify "Deleted" message cannot be edited or interacted with',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ multiUserChatTestHelper, chatPages }) => {
      tagTest(test.info(), {
        description:
          'Verify that deleted message cannot be edited, reacted to, or replied to in thread - no interactive options should be available',
        zephyrTestId: 'CHAT-2402',
        storyId: 'CHAT-2402',
      });

      // Open direct message conversation between users
      await multiUserChatTestHelper.openDirectMessageBetweenUsers(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        [0, 1]
      );

      // User 1 sends a message that will be deleted and tested for interactions
      const messageToDelete = `Message to test interactions after deletion - ${Date.now()}`;
      await test.step('User 1 sends a message', async () => {
        await chatPages.user1ChatPage.actions.sendMessage(messageToDelete);
      });

      // Verify message appears for both users initially
      await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        messageToDelete
      );

      // Get the message ID and message component before deletion
      let messageId: string;
      await test.step('Get message ID for verification', async () => {
        messageId = await chatPages.user1ChatPage.actions.getDataMessageId(messageToDelete);
        console.log(`INFO: Message ID obtained for interaction testing: ${messageId}`);
      });

      // User 1 deletes their own message
      await test.step('User 1 deletes their own message', async () => {
        await chatPages.user1ChatPage.actions.deleteMessage(messageToDelete, {
          stepInfo: 'User 1 deleting their own message to test interactions',
        });
      });

      // Verify message shows as deleted for both users
      await test.step('Verify message shows as deleted for both users', async () => {
        await chatPages.user1ChatPage.verifyTheMessageAppearsDeleted(messageId, {
          stepInfo: 'Verify User 1 sees deleted message indicator',
        });
        await chatPages.user2ChatPage.verifyTheMessageAppearsDeleted(messageId, {
          stepInfo: 'Verify User 2 sees deleted message indicator',
        });
        await chatPages.user1ChatPage.assertions.verifyMessageActionsNotVisible(messageToDelete, {
          stepInfo: 'Verify User 1 cannot interact with deleted direct message',
        });

        await chatPages.user2ChatPage.assertions.verifyMessageActionsNotVisible(messageToDelete, {
          stepInfo: 'Verify User 2 cannot interact with deleted direct message',
        });
      });

      // Verify direct message chat functionality continues normally
      await test.step('Verify direct message chat functionality continues normally after deletion', async () => {
        const newGroupMessage = `New direct message after deletion test - ${Date.now()}`;
        await chatPages.user2ChatPage.actions.sendMessage(newGroupMessage);

        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          newGroupMessage
        );
        await chatPages.user2ChatPage.assertions.verifyMessageActionsIsVisible(newGroupMessage, {
          stepInfo: 'Verify User 2 can interact with new direct message',
        });
      });
    }
  );

  test(
    'message Deletion: Verify "Deleted" message in group chat cannot be interacted with',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE],
    },
    async ({ multiUserChatTestHelper, chatPages }) => {
      tagTest(test.info(), {
        description: 'Verify that deleted message in group chat cannot be edited, reacted to, or replied to in thread',
        zephyrTestId: 'CHAT-2403',
        storyId: 'CHAT-2403',
      });

      // Open same group chat for both users
      await multiUserChatTestHelper.openGroupChatForMultipleUsers(
        [chatPages.user1ChatPage, chatPages.user2ChatPage],
        CONSTANT_DATA.COMMON_GROUP_NAME,
        [0, 1]
      );

      // User 1 sends a message in group chat that will be deleted and tested
      const messageToDelete = `Group message to test interactions after deletion - ${Date.now()}`;
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
        console.log(`INFO: Group message ID obtained for interaction testing: ${messageId}`);
      });

      // User 1 deletes their own message from group chat
      await test.step('User 1 deletes their own message from group chat', async () => {
        await chatPages.user1ChatPage.actions.deleteMessage(messageToDelete, {
          stepInfo: 'User 1 deleting their own message from group chat to test interactions',
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

        await chatPages.user1ChatPage.assertions.verifyMessageActionsNotVisible(messageToDelete, {
          stepInfo: 'Verify User 1 cannot interact with deleted group message',
        });
        await chatPages.user2ChatPage.assertions.verifyMessageActionsNotVisible(messageToDelete, {
          stepInfo: 'Verify User 2 cannot interact with deleted group message',
        });
      });

      // Verify group chat functionality continues normally
      await test.step('Verify group chat functionality continues normally after deletion', async () => {
        const newGroupMessage = `New group message after deletion test - ${Date.now()}`;
        await chatPages.user2ChatPage.actions.sendMessage(newGroupMessage);

        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          newGroupMessage
        );
        await chatPages.user2ChatPage.assertions.verifyMessageActionsIsVisible(newGroupMessage, {
          stepInfo: 'Verify User 2 can interact with new group message',
        });
      });
    }
  );
});
