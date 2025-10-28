import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';
import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture';

import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

import { MessageEmojis } from '@/src/core/constants/messageEmojis';

/**
 * Emoji reaction test suite using dual user fixture
 * Tests adding emoji reactions to messages in direct messages
 */
test.describe(
  'emoji Reaction Tests - Direct Message',
  {
    tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE, TestPriority.P2],
  },
  () => {
    test(
      'send message and then send emojis as a reaction',
      {
        tag: [TestPriority.P2, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'User sends a message and selects 3 emojis as reactions from emoji picker',
          zephyrTestId: 'CHAT-2309',
          storyId: 'CHAT-2309',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // When: User 1 sends a message
        const testMessage = TestDataGenerator.generateRandomText('Test message for emoji reaction', 1);
        await test.step('User 1 sends a message', async () => {
          await chatPages.user1ChatPage.actions.sendMessage(testMessage);
        });

        // Verify message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          testMessage
        );

        // Then: User 1 adds 4 emoji reactions from the enum to the message
        await test.step('User 1 adds 4 emoji reactions from the enum to the message', async () => {
          const latestMessage = await chatPages.user1ChatPage
            .getConversationWindowComponent()
            .getFocusedMessageCardFromListOfChatMessages(testMessage);

          // Loop through first 4 emojis in the MessageEmojis enum and add them as reactions
          for (const emojiKey of Object.keys(MessageEmojis).slice(0, 4)) {
            const emojiValue = MessageEmojis[emojiKey as keyof typeof MessageEmojis];

            await chatPages.user1ChatPage.page.waitForTimeout(1000);
            await latestMessage.reactOnMessage(emojiValue);
          }
        });

        // Verify the message with reactions is still visible
        await test.step('Verify message with reactions is visible for both users', async () => {
          await chatPages.user1ChatPage.page.waitForTimeout(1000);
          await chatPages.user1ChatPage
            .getConversationWindowComponent()
            .verifyMessageIsPresentInListOfChatMessages(testMessage);
          await chatPages.user2ChatPage
            .getConversationWindowComponent()
            .verifyMessageIsPresentInListOfChatMessages(testMessage);
          await chatPages.user2ChatPage
            .getConversationWindowComponent()
            .verifyMessageWithEmojieReactionIsPresentInListOfChatMessages(testMessage, 5);
        });
      }
    );
  }
);
