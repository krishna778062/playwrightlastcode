import { ALERT_NOTIFICATION_MESSAGES } from '@alert-notification-constants/messageRepo';
import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';
import { appManagerFixture as test } from '@alert-notification-fixtures/fixtures';
import { NotificationWorkflow } from '@alert-notification-pages/notificationWorkflow';
import { SubjectCustomLinePage } from '@alert-notification-pages/subjectCustomLinePage';
import { TEMPLATE_TYPES, TEST_EMAILS } from '@alert-notification-test-data/notification-customization.test-data';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  '[Alert Notification] Subject custom line – full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION],
  },
  () => {
    let workflow: NotificationWorkflow;

    test.beforeEach(async ({ appManager }) => {
      const subjectCustomLinePage = new SubjectCustomLinePage(appManager);
      workflow = new NotificationWorkflow(appManager, subjectCustomLinePage);
      await workflow.navigateToNotificationCustomization();
    });

    test(
      'Admin creates Must Read notification with French translation, verifies creation, and deletes customization',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-28326', storyId: 'INT-1' });
        const englishSubject = await workflow.createMustReadWithFrenchTranslation();
        await workflow.saveAndVerifyCreation(englishSubject);
        await workflow.deleteBySubject(englishSubject);
      }
    );

    test(
      'Admin validates Must Read template UI labels, cancel functionality, and input validation rules',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-27666', storyId: 'INT-24252' });
        await workflow.selectTemplate(TEMPLATE_TYPES.MUST_READ);
        await workflow.verifySubjectLineLabels();
        await workflow.testCancelAction();
        await workflow.testValidInput(TEMPLATE_TYPES.MUST_READ);
        await workflow.testEmptyInputValidation(TEMPLATE_TYPES.MUST_READ);
      }
    );

    test(
      'Admin validates Follow template shows same UI behavior as Must Read template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-27667', storyId: 'INT-24252' });
        await workflow.selectTemplate(TEMPLATE_TYPES.FOLLOW);
        await workflow.verifySubjectLineLabels();
        await workflow.testCancelAction();
        await workflow.testValidInput(TEMPLATE_TYPES.FOLLOW);
        await workflow.testEmptyInputValidation(TEMPLATE_TYPES.FOLLOW);
      }
    );

    test(
      'Admin validates Alerts template shows consistent UI behavior with other notification types',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-27665', storyId: 'INT-24252' });
        await workflow.selectTemplate(TEMPLATE_TYPES.ALERTS);
        await workflow.verifySubjectLineLabels();
        await workflow.testCancelAction();
        await workflow.testValidInput(TEMPLATE_TYPES.ALERTS);
        await workflow.testEmptyInputValidation(TEMPLATE_TYPES.ALERTS);
      }
    );

    test(
      'Admin verifies translation fallback behavior when manual translation is disabled for Must Read template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-27660', storyId: 'INT-24252' });
        await workflow.selectTemplate(TEMPLATE_TYPES.MUST_READ);
        await workflow.verifySubjectLineLabels();
        await workflow.testTranslationFallback();
      }
    );

    test(
      'Admin creates custom subject and validates invalid/valid test email behavior',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-27649', storyId: 'IINT-24252' });
        await workflow.selectTemplate(TEMPLATE_TYPES.MUST_READ);
        await workflow.testInvalidEmailFlow();
        await workflow.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR);
        await workflow.testValidEmailFlow();
        await workflow.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.TEST_EMAIL_SENT_SUCCESS);
      }
    );
    test(
      'Admin can send a single test email to multiple recipients separated by commas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), { zephyrTestId: 'INT-27671', storyId: 'INT-24252' });
        await workflow.selectTemplate(TEMPLATE_TYPES.MUST_READ);
        await workflow.testSendYourselfMultipleRecipients(TEST_EMAILS.MULTI_VALID_CSV);
        await workflow.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.TEST_EMAIL_SENT_SUCCESS);
      }
    );
  }
);
