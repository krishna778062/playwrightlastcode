import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture';

import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

/**
 * Emoji message send test suite using dual user fixture
 * Tests sending messages with emojis in direct messages
 */
test.describe(
  'emoji Message Send Tests - Direct Message',
  {
    tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE, TestPriority.P2],
  },
  () => {
    test(
      'send message with first 4 emojis from emoji picker',
      {
        tag: [TestPriority.P2, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'User selects first 4 emojis from emoji picker and sends message',
          zephyrTestId: 'CHAT-2306',
          storyId: 'CHAT-2306',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // When: User 1 sends message with emojis
        let emojiInsideEditor: string | null = '';
        await test.step('User 1 selects and sends 4 emojis', async () => {
          const chatEditor = chatPages.user1ChatPage.getConversationWindowComponent().getChatEditorComponent();

          // Select first 4 emojis from the first row
          await chatEditor.selectEmojisFromPicker(4);

          emojiInsideEditor = await chatEditor.inputTextBox.textContent();

          // Send the message
          await chatEditor.clickOnSendMessageButton();
        });

        // Then: Verify emoji message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          emojiInsideEditor ?? ''
        );
      }
    );

    test(
      'send text message with emojis',
      {
        tag: [TestPriority.P2, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'user types text, adds emojis, and sends message',
          zephyrTestId: 'CHAT-2307',
          storyId: 'CHAT-2307',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // When: User 1 types text and adds emojis
        let messageWithEmojis: string | null = '';
        await test.step('User 1 types text and adds 4 emojis', async () => {
          const chatEditor = chatPages.user1ChatPage.getConversationWindowComponent().getChatEditorComponent();

          // Type a message
          await chatEditor.fillInElement(chatEditor.inputTextBox, 'Hello team! ');

          // Add first 4 emojis
          await chatEditor.selectEmojisFromPicker(4);

          messageWithEmojis = await chatEditor.inputTextBox.textContent();

          // Send the message
          await chatEditor.clickOnSendMessageButton();
        });

        // Then: Verify message with emojis appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          messageWithEmojis ?? ''
        );
      }
    );

    test(
      'send message with emojis from search input',
      {
        tag: [TestPriority.P2, TestGroupType.SMOKE],
      },
      async ({ multiUserChatTestHelper, chatPages }) => {
        tagTest(test.info(), {
          description: 'user searched a emoji, adds emojis, and sends message',
          zephyrTestId: 'CHAT-2308',
          storyId: 'CHAT-2308',
        });

        // Given: Users open direct message conversation
        await test.step('Open direct message conversation between users', async () => {
          await multiUserChatTestHelper.openDirectMessageBetweenUsers(
            [chatPages.user1ChatPage, chatPages.user2ChatPage],
            [0, 1]
          );
        });

        // When: User 1 searches for emoji and sends message
        let searchedEmojiInsideEditor: string | null = '';
        await test.step('User 1 searches for emoji and sends message', async () => {
          const chatEditor = chatPages.user1ChatPage.getConversationWindowComponent().getChatEditorComponent();

          await chatEditor.clickOnElement(chatEditor.emojiButton);
          await chatEditor.verifier.verifyTheElementIsVisible(chatEditor.emojiPickerContainer);

          await chatEditor.clickOnElement(chatEditor.emojiSearchInput);
          await chatEditor.fillInElement(chatEditor.emojiSearchInput, 'cake');

          // Wait for search results and select the first emoji from results
          await chatEditor.verifier.verifyTheElementIsVisible(chatEditor.emojiSearchResults.first());
          await chatEditor.clickOnElement(chatEditor.emojiSearchResults.first());

          searchedEmojiInsideEditor = await chatEditor.inputTextBox.textContent();

          // Send the message
          await chatEditor.clickOnSendMessageButton();
        });

        // Then: Verify emoji message appears for both users
        await multiUserChatTestHelper.verifyMessageAppearsForAllTheUsersInChatSection(
          [chatPages.user1ChatPage, chatPages.user2ChatPage],
          searchedEmojiInsideEditor ?? ''
        );
      }
    );
  }
);
