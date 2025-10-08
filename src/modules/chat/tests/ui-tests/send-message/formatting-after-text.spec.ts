import CONSTANT_DATA from '@chat/constants/constantData';
import { chatTestFixture as test } from '@chat/fixtures/chatFixture';
import { selectThenFormatTestData } from '@chat/test-data/formatted-message-test-data';
import { FormattingOptions } from '@chat/ui/components/chatEditorComponent';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Typing text message then select format and send it', { tag: [TestPriority.P2] }, () => {
  // New test cases for select-then-format workflow
  for (const data of selectThenFormatTestData) {
    test(`Scenario: ${data.testName} (select then format)`, async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: data.testId,
        storyId: data.storyId,
        description: data.description,
        priority: TestPriority.P2,
        type: TestGroupType.SMOKE,
      });

      // Resolve the message (handle both string and function types)
      const messageText = typeof data.message === 'function' ? data.message() : data.message;

      // Prepare formatting options based on test data
      const formattingOptions: FormattingOptions = {
        usesBold: data.usesBold,
        usesItalic: data.usesItalic,
        usesUnderline: data.usesUnderline,
        usesStrikethrough: data.usesStrikethrough,
      };

      const chatAppPage = await appManagerFixture.navigationHelper.navigateToChatPageViaTopNavBar();
      await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

      // Send message using the new select-then-format approach
      await chatAppPage.sendMessageWithSelectAndFormat(messageText, formattingOptions);

      await chatAppPage.verifyFormattedMessageIsVisible(messageText, formattingOptions);
    });
  }
});
