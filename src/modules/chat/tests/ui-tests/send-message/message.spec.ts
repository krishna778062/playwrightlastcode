import CONSTANT_DATA from '../../../constants/constantData';
import { CHAT_SUITE_TAGS } from '../../../constants/testTags';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Send Message', { tag: [CHAT_SUITE_TAGS.USER_CHAT] }, () => {
  test.only(
    'To verify normal message can be sent to user',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'To verify normal message can be sent to user',
        // zephyrTestId: 'CHAT-2179',
        // storyId: 'CHAT-2179',
      });
      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewMessageDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewGroupDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageButton();
      await chatAppPage.getInboxSideBarComponent().searchAndSelectUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.getInboxSideBarComponent().clickStartChatButton();
      await chatAppPage.sendMessage(CONSTANT_DATA.USER_SAMPLE_MESSAGE);
      await chatAppPage.getConversationWindowComponent().getMessageItemFromChat(CONSTANT_DATA.USER_SAMPLE_MESSAGE);
    }
  );

  test(
    'To verify long message (25+ characters) can be sent to user',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'To verify long message can be sent to user',
      });
      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageButton();
      await chatAppPage.getInboxSideBarComponent().searchAndSelectUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.getInboxSideBarComponent().clickStartChatButton();
      await chatAppPage.sendMessage(CONSTANT_DATA.LONG_MESSAGE);
      await chatAppPage.getConversationWindowComponent().getMessageItemFromChat(CONSTANT_DATA.LONG_MESSAGE);
    }
  );
});
