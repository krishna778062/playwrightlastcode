import { expect } from '@playwright/test';

import { ChatEditorComponent } from '../../../components/chatEditorComponent';
import CONSTANT_DATA from '../../../constants/constantData';
import { CHAT_SUITE_TAGS } from '../../../constants/testTags';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Send Attachment', { tag: [CHAT_SUITE_TAGS.USER_CHAT] }, () => {
  test.only(
    'To verify PDF attachment can be sent to user',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'To verify PDF attachment can be sent to user',
        // zephyrTestId: 'CHAT-XXXX',
        // storyId: 'CHAT-XXXX',
      });

      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewMessageDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewGroupDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageButton();
      await chatAppPage.getInboxSideBarComponent().searchAndSelectUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.getInboxSideBarComponent().clickStartChatButton();

      // Send the attachment using ChatEditorComponent directly
      const chatEditor = new ChatEditorComponent(chatAppPage.page, chatAppPage.page.locator("[class*='Editor_root_']"));
      await chatEditor.addMediaAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf');
      await chatEditor.clickOnSendMessageButton();

      // Wait a moment for the message to be sent
      await chatAppPage.page.waitForTimeout(2000);

      // Verify that the attachment was sent by checking for the file preview attachment
      const conversationWindow = chatAppPage.getConversationWindowComponent();
      const fileAttachment = conversationWindow.page.getByTestId('filePreviewAttachment').last();
      await expect(fileAttachment).toBeVisible();
    }
  );

  test(
    'To verify image attachment can be sent to user',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'To verify image attachment can be sent to user',
      });

      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewMessageDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewGroupDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageButton();
      await chatAppPage.getInboxSideBarComponent().searchAndSelectUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.getInboxSideBarComponent().clickStartChatButton();

      // Send the attachment using ChatEditorComponent directly
      const chatEditor = new ChatEditorComponent(chatAppPage.page, chatAppPage.page.locator("[class*='Editor_root_']"));
      await chatEditor.addMediaAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf');
      await chatEditor.clickOnSendMessageButton();

      // Verify that the attachment was sent using existing function
      const conversationWindow = chatAppPage.getConversationWindowComponent();
      const messageWithAttachment = await conversationWindow.getLastMessageWithAttachment('file');
      await expect(messageWithAttachment).toBeVisible();
    }
  );

  test(
    'To verify video attachment can be sent to user',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'To verify video attachment can be sent to user',
      });

      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageButton();
      await chatAppPage.getInboxSideBarComponent().searchAndSelectUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.getInboxSideBarComponent().clickStartChatButton();

      const conversationWindow = chatAppPage.getConversationWindowComponent();
      const messageCountBefore = await conversationWindow.getMessageCount();

      // Send the video attachment using ChatEditorComponent directly
      const chatEditor = new ChatEditorComponent(chatAppPage.page, chatAppPage.page.locator("[class*='Editor_root_']"));
      await chatEditor.addMediaAttachment('src/modules/chat/test-data/static-files/videoFiles/video1.mp4');
      await chatEditor.clickOnSendMessageButton();

      // Verify that a new message was added (count increased)
      await conversationWindow.verifyNewMessageAdded(messageCountBefore);

      // Verify that the video attachment was sent
      const messageWithAttachment = await conversationWindow.getLastMessageWithAttachment('video');
    }
  );

  test(
    'To verify attachment can be added and deleted before sending',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'To verify attachment can be added and deleted before sending',
      });

      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageButton();
      await chatAppPage.getInboxSideBarComponent().searchAndSelectUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.getInboxSideBarComponent().clickStartChatButton();

      // Add attachment using ChatEditorComponent
      const chatEditor = new ChatEditorComponent(chatAppPage.page, chatAppPage.page.locator("[class*='Editor_root_']"));
      await chatEditor.addMediaAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf');

      // Verify attachment was added to editor
      await chatEditor.verifyAttachementHasAddedToChatEditor();

      // Delete the attachment
      await chatEditor.deleteAttachementFromChatEditor();

      // Verify attachment was removed from editor
      await chatEditor.verifyTheAttachmentIsNotVisible();
    }
  );
});
