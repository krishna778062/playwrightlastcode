import { expect } from '@playwright/test';

import { FormattingOptions } from '../../../components/chatEditorComponent';
import CONSTANT_DATA from '../../../constants/constantData';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';
import { formattedMessageTestData, selectThenFormatTestData } from '../../../test-data/formatted-message-test-data';

//import { LinkTestDataGenerator } from '../../../test-data/linkTestDataGenerator';
import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Verifying invalid link msg in the editor', { tag: [TestPriority.P2] }, () => {
  test(`(invalid link msg visible in the editor)`, async ({ appManagerHomePage }) => {
    const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
    await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

    await chatAppPage.conversationWindow.getChatEditorComponent().linkButton.click();

    // Fill the "Text" and "Link" fields
    await expect(chatAppPage.conversationWindow.getChatEditorComponent().linkTextfield).toBeVisible();
    await chatAppPage.conversationWindow.getChatEditorComponent().linkTextBox.fill('hello');

    await expect(chatAppPage.conversationWindow.getChatEditorComponent().linkUrlfield).toBeVisible();
    await chatAppPage.conversationWindow.getChatEditorComponent().linkUrlBox.fill('shivam');

    await chatAppPage.conversationWindow.getChatEditorComponent().insertButton.click({ force: true });

    // Assert the "Please enter a valid link" error message
    await chatAppPage.conversationWindow.getChatEditorComponent().verifyInsertLinkErrorMessages('link');
  });

  test(`(invalid link msg with random text visible in the editor)`, async ({ appManagerHomePage }) => {
    const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
    await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

    await chatAppPage.conversationWindow.getChatEditorComponent().linkButton.click();

    // Fill the "Text" and "Link" fields with random text
    // await chatAppPage.conversationWindow.getChatEditorComponent().linkTextBox.fill(linkData.displayText);
    await chatAppPage.conversationWindow
      .getChatEditorComponent()
      .linkTextBox.fill(TestDataGenerator.generateRandomString());

    console.log('random string', TestDataGenerator.generateRandomString());
    console.log('link data', TestDataGenerator.generateRandomText());
    await chatAppPage.conversationWindow
      .getChatEditorComponent()
      .linkUrlBox.fill(TestDataGenerator.generateRandomText());
    await chatAppPage.conversationWindow.getChatEditorComponent().insertButton.click({ force: true });

    // Assert the "Please enter a valid link" error message
    await chatAppPage.conversationWindow.getChatEditorComponent().verifyInsertLinkErrorMessages('link');
  });
});

test.describe('Verifying empty text msg in the editor', { tag: [TestPriority.P2] }, () => {
  test(`(Empty text box validation message visible in the editor)`, async ({ appManagerHomePage }) => {
    const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
    await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

    await chatAppPage.conversationWindow.getChatEditorComponent().linkButton.click();
    await chatAppPage.conversationWindow
      .getChatEditorComponent()
      .linkUrlBox.fill(TestDataGenerator.generateRandomText());
    await chatAppPage.conversationWindow.getChatEditorComponent().insertButton.click({ force: true });

    // Assert the "Please enter a valid link" error message
    await chatAppPage.conversationWindow.getChatEditorComponent().verifyInsertLinkErrorMessages('text');
  });
});

test.describe('Verifying valid link insertion in the editor', { tag: [TestPriority.P2] }, () => {
  test(`(valid link with proper URL format inserted in the editor)`, async ({ appManagerHomePage }) => {
    const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
    await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

    await chatAppPage.conversationWindow.getChatEditorComponent().linkButton.click();

    // Fill the "Text" and "Link" fields with valid data

    const linkText = TestDataGenerator.generateRandomText();
    await chatAppPage.conversationWindow.getChatEditorComponent().linkTextBox.fill(linkText);

    await expect(chatAppPage.conversationWindow.getChatEditorComponent().linkUrlBox).toHaveAttribute(
      'placeholder',
      'https://www.example.org'
    );

    await chatAppPage.conversationWindow
      .getChatEditorComponent()
      .linkUrlBox.fill(TestDataGenerator.generateValidLinkPair());

    // verifying visibility of insert button and clicking on it
    await expect(chatAppPage.conversationWindow.getChatEditorComponent().insertButton).toBeVisible();
    await chatAppPage.conversationWindow.getChatEditorComponent().insertButton.click();

    // Verify the link text appears in the chat editor input field
    await chatAppPage.conversationWindow
      .getChatEditorComponent()
      .verifier.verifyElementContainsText(
        chatAppPage.conversationWindow.getChatEditorComponent().inputTextBox,
        linkText,
        {
          assertionMessage: 'Link text should appear in the chat editor input field',
        }
      );

    await chatAppPage.conversationWindow.getChatEditorComponent().sendMessageButton.click();
  });
});
