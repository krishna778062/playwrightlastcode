import CONSTANT_DATA from '@chat/constants/constantData';
import { chatTestFixture as test } from '@chat/fixtures/chatFixture';
import { formattedMessageTestData } from '@chat/test-data/formatted-message-test-data';
import { FormattingOptions } from '@chat/ui/components/chatEditorComponent';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('Select format then send message', { tag: [TestPriority.P2] }, () => {
  for (const data of formattedMessageTestData) {
    test(`Scenario: ${data.testName}`, async ({ appManagerFixture }) => {
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
        usesBulletList: data.usesBulletList,
        usesOrderList: data.usesOrderList,
      };

      const chatAppPage = await appManagerFixture.navigationHelper.navigateToChatPageViaTopNavBar();
      await chatAppPage.actions.openDirectMessageWithUser(CONSTANT_DATA.USER_NAME_1);

      // Send formatted message using chatAppPage method
      await chatAppPage.sendFormattedMessage(messageText, formattingOptions);

      await chatAppPage.verifyFormattedMessageIsVisible(messageText, formattingOptions);
    });
  }
});
