import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { CONSTANT_DATA } from '@modules/chat/constants/constantData';
import { chatTestFixture as test } from '@modules/chat/fixtures/chatFixture';

import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

// Constants
const GROUP_NAME = CONSTANT_DATA.GROUP_NAME;

/**
 * Group management and settings test suite
 */
test.describe('group Management - Settings', { tag: [CHAT_SUITE_TAGS.GROUP_CHAT, TestPriority.P2] }, () => {
  test(
    'verify group settings are accessible and radio options are visible',
    { tag: [TestPriority.P2, TestGroupType.SMOKE] },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'App manager navigates to group settings and verifies that group permission options are visible',
        zephyrTestId: 'CHAT-2355',
        storyId: 'CHAT-2355',
      });

      const chatAppPage = await appManagerFixture.navigationHelper.navigateToChatPageViaTopNavBar();
      const inboxSideBar = chatAppPage.getInboxSideBarComponent();

      // Search and select group
      await inboxSideBar.searchAndSelectGroup(GROUP_NAME);

      await expect(chatAppPage.getConversationWindowComponent().getChatEditorComponent().inputTextBox).toBeVisible();

      // Open group settings
      await inboxSideBar.clickMoreOptionsButton();
      await inboxSideBar.clickManageGroupButton();

      // Verify group permissions
      await inboxSideBar.verifyGroupPermissionTextIsVisible();
      await inboxSideBar.verifyOpenRadioButtonIsNotChecked();
      await inboxSideBar.verifyAnnouncementRadioButtonIsChecked();
    }
  );
});

test.describe(
  'group Management - Chat Editor Visibility',
  { tag: [CHAT_SUITE_TAGS.GROUP_CHAT, TestPriority.P2] },
  () => {
    test(
      'verify chat editor input box is hidden when navigating to all-company group',
      { tag: [TestPriority.P2, TestGroupType.SMOKE] },
      async ({ endUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Standard user navigates to group settings and verifies that group permission options are not visible',
          zephyrTestId: 'CHAT-2356',
          storyId: 'CHAT-2356',
        });

        // Navigate to Chat page using the existing endUserFixture
        const chatAppPage = await endUserFixture.navigationHelper.navigateToChatPageViaTopNavBar();
        const inboxSideBar = chatAppPage.getInboxSideBarComponent();

        // Search for all-company group
        await inboxSideBar.searchAndSelectGroup(GROUP_NAME);

        // Verify that the chat editor input textbox is hidden
        await expect(chatAppPage.getConversationWindowComponent().getChatEditorComponent().inputTextBox).toBeHidden();

        // Open group settings
        //await inboxSideBar.clickMoreOptionsButton();
        await inboxSideBar.verifyManageGroupButtonIsHidden();
      }
    );
  }
);
