import { FormattingOptions } from '../../../components/chatEditorComponent';
import CONSTANT_DATA from '../../../constants/constantData';
import { chatTestFixture as test } from '../../../fixtures/chatFixture';
import { formattedMessageTestData } from '../../../test-data/formatted-message-test-data';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Send Formatted Message', { tag: [TestPriority.P2] }, () => {
  for (const data of formattedMessageTestData) {
    test.only(`Scenario: ${data.testName}`, async ({ appManagerHomePage }) => {
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

      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

      // Send formatted message using chatAppPage method
      await chatAppPage.sendFormattedMessage(messageText, formattingOptions);
    });
  }
});
