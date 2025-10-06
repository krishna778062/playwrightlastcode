import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';
import { test } from '@alert-notification-fixtures/fixtures';
import { NotificationTestWorkflows } from '@alert-notification-helpers/testWorkflows';
import { SubjectCustomLinePage } from '@alert-notification-pages/subjectCustomLinePage';
import { TEST_EMAILS } from '@alert-notification-test-data/notification-customization.test-data';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  '[Alert Notification] Subject custom line – full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION],
  },
  () => {
    let workflows: NotificationTestWorkflows;

    test.beforeEach(async ({ appManager }) => {
      const subjectCustomLinePage = new SubjectCustomLinePage(appManager);
      workflows = new NotificationTestWorkflows(subjectCustomLinePage, appManager);
    });

    test(
      'Admin creates Must Read notification with French translation, verifies creation, and deletes customization',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-1',
          storyId: 'INT-1',
        });

        await workflows.navigateToNotificationCustomization();

        const englishSubject = await workflows.createMustReadWithFrenchTranslation();

        await workflows.saveAndVerifyCreation(englishSubject);
        await workflows.deleteBySubject(englishSubject);
      }
    );

    test(
      'Admin validates Must Read template UI labels, cancel functionality, and input validation rules',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27666',
          storyId: 'INT-2',
        });

        await workflows.navigateToNotificationCustomization();
        await workflows.selectTemplate('mustRead');
        await workflows.verifySubjectLineLabels();
        await workflows.testCancelAction();
        await workflows.testValidInput('mustRead');
        await workflows.testEmptyInputValidation('mustRead');
      }
    );

    test(
      'Admin validates Follow template shows same UI behavior as Must Read template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27667',
          storyId: 'INT-3',
        });

        await workflows.navigateToNotificationCustomization();
        await workflows.selectTemplate('follow');
        await workflows.verifySubjectLineLabels();
        await workflows.testCancelAction();
        await workflows.testValidInput('follow');
        await workflows.testEmptyInputValidation('follow');
      }
    );

    test(
      'Admin validates Alerts template shows consistent UI behavior with other notification types',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27665',
          storyId: 'INT-4',
        });

        await workflows.navigateToNotificationCustomization();
        await workflows.selectTemplate('alerts');
        await workflows.verifySubjectLineLabels();
        await workflows.testCancelAction();
        await workflows.testValidInput('alerts');
        await workflows.testEmptyInputValidation('alerts');
      }
    );

    test(
      'Admin verifies translation fallback behavior when manual translation is disabled for Must Read template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27660',
          storyId: 'INT-5',
        });

        await workflows.navigateToNotificationCustomization();
        await workflows.selectTemplate('mustRead');
        await workflows.verifySubjectLineLabels();
        await workflows.testTranslationFallback();
      }
    );

    test(
      'Admin creates custom subject and validates invalid/valid test email behavior',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27649',
          storyId: 'INT-6',
        });

        await workflows.navigateToNotificationCustomization();
        await workflows.selectTemplate('mustRead');
        await workflows.testSendYourselfFlow();
      }
    );
    test(
      'Admin can send a single test email to multiple recipients separated by commas',
      { tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE] },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-27671', storyId: 'INT-7' });
        await workflows.navigateToNotificationCustomization();
        await workflows.selectTemplate('mustRead');
        await workflows.testSendYourselfMultipleRecipients(TEST_EMAILS.MULTI_VALID_CSV);
      }
    );
  }
);
