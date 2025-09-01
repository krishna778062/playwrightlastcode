import { CHAT_SUITE_TAGS } from '../../../constants/testTags';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';
import { ChatNavigationPage } from '../../../pages/chatNavigationPage/chatNavigationPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Unfurling Links', { tag: [CHAT_SUITE_TAGS.UNFURL_LINK] }, () => {
  let chatNavigationPage: ChatNavigationPage;

  test.beforeEach(async ({ appManagerHomePage }) => {
    chatNavigationPage = new ChatNavigationPage(appManagerHomePage.page);
  });

  test(
    'To verify create new message and create new group button',
    {
      tag: [TestPriority.P2, TestGroupType.SMOKE],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'To verify create new message and create new group button',
        zephyrTestId: 'CHAT-2179',
        storyId: 'CHAT-2179',
      });

      await chatNavigationPage.actions.clickOnTheChatButton();
      await chatNavigationPage.actions.clickOnTheSeeAllMessagesButton();
      await chatNavigationPage.actions.clickOnTheCreateNewButton();
      await chatNavigationPage.assertions.verifyTheCreateNewMessageButton();
      await chatNavigationPage.assertions.verifyTheCreateNewGroupButton();

      // TODO: Add test steps for sending link and verifying unfurl functionality
    }
  );
});
