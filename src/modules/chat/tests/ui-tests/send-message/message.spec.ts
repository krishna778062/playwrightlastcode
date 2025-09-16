import { ChatEditorComponent } from '../../../components/chatEditorComponent';
import CONSTANT_DATA from '../../../constants/constantData';
import { CHAT_SUITE_TAGS } from '../../../constants/testTags';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';
import { MessageTestData, messageTestData } from '../../../test-data/message-test-data';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Send Message', { tag: [TestPriority.P2, CHAT_SUITE_TAGS.USER_CHAT] }, () => {
  messageTestData.forEach(data => {
    test(`Scenario: ${data.testName}`, async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: data.description,
        zephyrTestId: data.testId || 'CHAT-2179',
        storyId: data.storyId || 'CHAT-2179',
      });

      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewMessageDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewGroupDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageButton();
      await chatAppPage.getInboxSideBarComponent().searchAndSelectUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.getInboxSideBarComponent().clickStartChatButton();

      // Get conversation window
      const conversationWindow = chatAppPage.getConversationWindowComponent();

      // Send message using ChatEditorComponent
      const chatEditor = new ChatEditorComponent(chatAppPage.page, chatAppPage.page.locator("[class*='Editor_root_']"));
      await chatEditor.sendMessage(data.message);

      // Verify that the message is present in the list of chat messages
      await conversationWindow.verifyMessageIsPresentInListOfChatMessages(data.expectedResult);
    });
  });
});
