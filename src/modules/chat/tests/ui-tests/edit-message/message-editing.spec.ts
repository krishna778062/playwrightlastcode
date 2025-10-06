import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture';

import CONSTANT_DATA from '../../../constants/constantData';
import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

/**
 * Message editing test suite using dual user fixture
 * Tests message editing functionality in direct messages and group chats
 */
test.describe(
  'Message Editing Tests - Direct Message',
  {
    tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE],
  },
  () => {
    test(
      'Message Editing: Verify user can edit and update their sent message in direct chat',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages, user1Page }) => {
        tagTest(test.info(), {
          description:
            'Verify that user can edit their sent message, update it, and cancel edit operation in direct message conversation',
          zephyrTestId: 'CHAT-2700',
          storyId: 'CHAT-2700',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // When: User 1 sends a message to be edited
        const originalMessage = `Hi there! - ${Date.now()}`;
        await test.step('User 1 sends a message that will be edited', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(originalMessage);
        });

        // Verify message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          originalMessage
        );

        const editedMessage = `${originalMessage} edited`;

        // Then: User 1 edits their message
        await chatPages.user1ChatPage.actions.editAndUpdateMessage(originalMessage, editedMessage);

        // Verify the message was updated for both users
        await test.step('Verify edited message appears for both users', async () => {
          await multiUserChatTestHelper.verifyEditedMessageAppearsForAllTheUsersInChatSection(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            editedMessage
          );

          // Verify original message is no longer visible
          await chatPages.user1ChatPage
            .getConversationWindowComponent()
            .verifyMessageIsNotPresentInListOfChatMessages(originalMessage, {
              stepInfo: 'Verify original message is replaced by edited version',
              timeout: 10000,
            });
        });

        // Test edit cancellation functionality
        await test.step('Test edit cancellation functionality', async () => {
          // Get the updated message item
          await chatPages.user1ChatPage.actions.editAndCancelMessage(editedMessage);

          // Verify message remains unchanged after cancellation
          await multiUserChatTestHelper.verifyEditedMessageAppearsForAllTheUsersInChatSection(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            editedMessage
          );
        });
      }
    );

    test(
      "Message Editing: Verify access control in direct chat - users cannot edit others' messages",
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'Verify that users cannot edit messages sent by other users in direct chat',
          zephyrTestId: 'CHAT-2802',
          storyId: 'CHAT-2802',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // User 1 sends a message in direct chat
        const user1DirectMessage = `User 1 direct message - ${Date.now()}`;
        await test.step('User 1 sends a message in direct chat', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(user1DirectMessage);
        });

        // Verify message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          user1DirectMessage
        );

        // Verify User 1 can edit their own direct message
        await test.step('Verify User 1 can edit their own direct message', async () => {
          await chatPages.user1ChatPage.actions.editAndCancelMessage(user1DirectMessage);
        });

        // Verify User 2 cannot edit User 1's direct message
        await test.step("Verify User 2 cannot edit User 1's direct message", async () => {
          await chatPages.user2ChatPage.assertions.verifyEditMessageOptionNotVisible(user1DirectMessage, {
            stepInfo: "Verify User 2 cannot edit User 1's direct message",
          });
        });
      }
    );
  }
);

/**
 * Message editing test suite for group chats
 * Tests message editing functionality in group conversations
 */
test.describe(
  'Message Editing Tests - Group Chat',
  {
    tag: [CHAT_SUITE_TAGS.GROUP_CHAT],
  },
  () => {
    test(
      'Message Editing: Verify user can edit and update their sent message in group chat',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description:
            'Verify that user can edit their sent message in a group chat and both users can see the updated message',
          zephyrTestId: 'CHAT-2800',
          storyId: 'CHAT-2800',
        });

        // Given: Users open the same group chat
        await test.step('Users open common group chat', async () => {
          await multiUserChatTestHelper.openGroupChatForMultipleUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            CONSTANT_DATA.COMMON_GROUP_NAME,
            [0, 1]
          );
        });

        // When: User 1 sends a message to the group that will be edited
        const originalGroupMessage = `Group message to edit - ${Date.now()}`;
        await test.step('User 1 sends a message to group chat that will be edited', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(originalGroupMessage);
        });

        // Verify message appears for both users in group chat
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          originalGroupMessage
        );

        const editedGroupMessage = `${originalGroupMessage} edited in group chat`;

        // Then: User 1 edits their group message
        await test.step('User 1 edits their message in group chat', async () => {
          await chatPages.user1ChatPage.actions.editAndUpdateMessage(originalGroupMessage, editedGroupMessage);
        });

        // Verify the edited message appears for both users in group chat
        await test.step('Verify edited message appears for both users in group chat', async () => {
          await multiUserChatTestHelper.verifyEditedMessageAppearsForAllTheUsersInChatSection(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            editedGroupMessage
          );

          // Verify original message is no longer visible in group chat
          await chatPages.user1ChatPage
            .getConversationWindowComponent()
            .verifyMessageIsNotPresentInListOfChatMessages(originalGroupMessage, {
              stepInfo: 'Verify original group message is replaced by edited version',
              timeout: 10000,
            });
        });

        // Additional verification: Test that other user can see the edited message
        await test.step('Verify User 2 can see the edited message from User 1', async () => {
          await chatPages.user2ChatPage.assertions.verifyEditedMessageIsVisible(editedGroupMessage, {
            stepInfo: "Verify User 2 can see User 1's edited message in group chat",
          });

          // Verify original message is not visible for User 2 either
          await chatPages.user2ChatPage
            .getConversationWindowComponent()
            .verifyMessageIsNotPresentInListOfChatMessages(originalGroupMessage, {
              stepInfo: 'Verify User 2 does not see original message after edit',
              timeout: 10000,
            });
        });
      }
    );

    test(
      "Message Editing: Verify access control in group chat - users cannot edit others' messages",
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'Verify that users cannot edit messages sent by other users in group chat',
          zephyrTestId: 'CHAT-2802',
          storyId: 'CHAT-2802',
        });

        // Given: Users open the same group chat
        await test.step('Users open common group chat', async () => {
          await multiUserChatTestHelper.openGroupChatForMultipleUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            CONSTANT_DATA.COMMON_GROUP_NAME,
            [0, 1]
          );
        });

        // User 1 sends a message in group chat
        const user1GroupMessage = `User 1 group message - ${Date.now()}`;
        await test.step('User 1 sends a message in group chat', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(user1GroupMessage);
        });

        // Verify message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          user1GroupMessage
        );

        // Verify User 1 can edit their own group message
        await test.step('Verify User 1 can edit their own group message', async () => {
          await chatPages.user1ChatPage.actions.editAndCancelMessage(user1GroupMessage);
        });

        // Verify User 2 cannot edit User 1's group message
        await test.step("Verify User 2 cannot edit User 1's group message", async () => {
          await chatPages.user2ChatPage.assertions.verifyEditMessageOptionNotVisible(user1GroupMessage, {
            stepInfo: "Verify User 2 cannot edit User 1's group message",
          });
        });
      }
    );
  }
);
