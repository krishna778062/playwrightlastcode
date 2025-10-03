import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture';

import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

/**
 * Message editing test suite using dual user fixture
 * Tests message editing functionality in direct messages
 */
test.describe(
  'Message Editing Tests - Direct Message',
  {
    tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE],
  },
  () => {
    test.only(
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
  }
);
