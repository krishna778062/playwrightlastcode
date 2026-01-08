import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ManageApplicationPage } from '@/src/modules/platforms/ui/pages/manageApplication/manageApplication';

test.describe(
  'Zeus General Setup in Manage Application',
  {
    tag: ['@setupManageApplication', '@regression', '@zeus', '@sanity', '@Platform_Services', '@Zulu', '@zeussmoke'],
  },
  () => {
    test(
      'Verify working of Help and Feedback emails under General in Setup in Manage Application',
      {
        tag: [TestPriority.P0],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-5513'],
          description: 'Verify working of Help and Feedback emails under General in Setup in Manage Application',
        });

        const manageApplicationPage = new ManageApplicationPage(zuluAppManagerPage);
        await manageApplicationPage.verifyHelpAndFeedbackEmailsWorking();
      }
    );

    test(
      'Verify the working of additional checkbox in Help and Feedback',
      {
        tag: [TestPriority.P0],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-23212'],
          description: 'Verify the working of additional checkbox in Help and Feedback',
        });

        const manageApplicationPage = new ManageApplicationPage(zuluAppManagerPage);
        await manageApplicationPage.verifyAdditionalCheckboxInHelpAndFeedbackWorking();
      }
    );
  }
);
