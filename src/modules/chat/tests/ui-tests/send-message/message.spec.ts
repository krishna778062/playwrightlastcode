import CONSTANT_DATA from '@chat/constants/constantData';
import { CHAT_SUITE_TAGS } from '@chat/constants/testTags';
import { chatTestFixture as test } from '@chat/fixtures/chatFixture';
import { messageTestData } from '@chat/test-data/message-test-data';

import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Send Message', { tag: [TestPriority.P2, CHAT_SUITE_TAGS.USER_CHAT] }, () => {
  for (const data of messageTestData) {
    test(`Scenario: ${data.testName}`, async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: data.description,
        zephyrTestId: data.testId || 'CHAT-2179',
        storyId: data.storyId || 'CHAT-2179',
      });

      // Generate dynamic message
      const message = typeof data.message === 'function' ? data.message() : data.message;
      const chatAppPage = await appManagerFixture.navigationHelper.navigateToChatPageViaTopNavBar();
      await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);
      await chatAppPage.sendMessage(message);

      // Verify that the message is present in the list of chat messages
      await chatAppPage.verifyMessageIsVisible(message);
    });
  }
});
