import { CHAT_SUITE_TAGS } from '../../../constants/testTags';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Create new message button visibility', { tag: [CHAT_SUITE_TAGS.DIRECT_MESSAGE] }, () => {
  test(
    'To verify create new message and create new group button',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'To verify create new message and create new group button',
        zephyrTestId: 'CHAT-2179',
        storyId: 'CHAT-2179',
      });
      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.getInboxSideBarComponent().clickOnCreateNewMessageIcon();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewMessageDropDownOptionIsVisible();
      await chatAppPage.getInboxSideBarComponent().verifyCreateNewGroupDropDownOptionIsVisible();
    }
  );
});
