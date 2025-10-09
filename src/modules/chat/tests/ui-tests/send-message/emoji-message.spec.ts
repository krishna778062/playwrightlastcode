import { expect } from '@playwright/test';

import CONSTANT_DATA from '../../../constants/constantData';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Verifying emoji message in the editor', { tag: [TestPriority.P2] }, () => {
  test('Send message with first 4 emojis from emoji picker', async ({ appManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'User selects first 4 emojis from emoji picker and sends message',
      priority: TestPriority.P2,
      type: TestGroupType.SMOKE,
      zephyrTestId: 'CHAT-2306',
      storyId: 'CHAT-2306',
    });

    const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
    await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

    const chatEditor = chatAppPage.conversationWindow.getChatEditorComponent();

    // Select first 4 emojis from the first row
    await chatEditor.selectEmojisFromPicker(4);

    const emojiInsideEditor = await chatEditor.inputTextBox.textContent();

    // Send the message
    await chatEditor.clickOnSendMessageButton();

    // verify the message
    await chatAppPage.assertions.verifyEmojiMessageisVisible(emojiInsideEditor ?? '');
  });

  test('Send text message with emojis', async ({ appManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'User types text, adds emojis, and sends message',
      priority: TestPriority.P2,
      type: TestGroupType.SMOKE,
      zephyrTestId: 'CHAT-2307',
      storyId: 'CHAT-2307',
    });

    const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
    await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

    const chatEditor = chatAppPage.conversationWindow.getChatEditorComponent();

    // Type a message
    await chatEditor.fillInElement(chatEditor.inputTextBox, 'Hello team! ');

    // Add first 2 emojis
    await chatEditor.selectEmojisFromPicker(4);

    const emojiwithextinsideEditor = await chatEditor.inputTextBox.textContent();

    // Send the message
    await chatEditor.clickOnSendMessageButton();

    // verify the message
    await chatAppPage.assertions.verifyEmojiMessageisVisible(emojiwithextinsideEditor ?? '');
  });

  test('Send message with emojis from search input', async ({ appManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'User searched a emoji, adds emojis, and sends message',
      priority: TestPriority.P2,
      type: TestGroupType.SMOKE,
      zephyrTestId: 'CHAT-2308',
      storyId: 'CHAT-2308',
    });

    const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
    await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

    const chatEditor = chatAppPage.conversationWindow.getChatEditorComponent();

    await chatEditor.clickOnElement(chatEditor.emojiButton);
    await chatEditor.verifier.verifyTheElementIsVisible(chatEditor.emojiPickerContainer);

    await chatEditor.clickOnElement(chatEditor.emojiSearchInput);
    await chatEditor.fillInElement(chatEditor.emojiSearchInput, 'cake');

    // Wait for search results and select the first emoji from results
    await chatEditor.verifier.verifyTheElementIsVisible(chatEditor.emojiSearchResults.first());
    await chatEditor.clickOnElement(chatEditor.emojiSearchResults.first());

    const searchedEmojiInsideEditor = await chatEditor.inputTextBox.textContent();

    // Send the message
    await chatEditor.clickOnSendMessageButton();

    // verify the message
    await chatAppPage.assertions.verifyEmojiMessageisVisible(searchedEmojiInsideEditor ?? '');
  });
});
