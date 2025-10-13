import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { NotificationFeatures } from '../../ui/components/selectNotificationStep';
import {
  CustomizationNotificationSteps,
  NotificationCustomizationPage,
} from '../../ui/pages/notificationCustomizationPage';
import { SUBJECT_LINES } from '../test-data/notification-customization.test-data';

import { appManagerFixture as test } from '@/src/modules/alert-notification/tests/fixtures/fixtures';

test.describe(
  '[Alert Notification] Subject custom line - full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION],
  },
  () => {
    let notificationCustomizationPage: NotificationCustomizationPage;

    test.beforeEach(async ({ appManagerNavigationHelper }) => {
      const emailNotificationAppSettingsPage =
        await appManagerNavigationHelper.navigateToEmailNotificationSettingsPageViaSideNavBar();
      notificationCustomizationPage = await emailNotificationAppSettingsPage.openNotificationCustomizationTab();
    });

    test('tc001 - verify app manager is able to customize must read with default subject line', async () => {
      await notificationCustomizationPage.clickOnAddCustomizationButton();
      //select must read feature from the add customization step
      await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
      await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
        NotificationFeatures.MUST_READS,
        "A 'must read' requires your attention"
      );
      //click on next button
      await notificationCustomizationPage.clickOnNextButton();

      //now verify user is on the select subject line step
      await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

      //verify the default subject line is selected
      await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();
      //click on next button
      await notificationCustomizationPage.clickOnSaveButton();
    });

    test('tc002 - verify app manager is able to customize must read with custom subject line', async () => {
      const customSubjectLine = SUBJECT_LINES.MUST_READ.ENGLISH_EDITED;
      await notificationCustomizationPage.clickOnAddCustomizationButton();
      //select must read feature from the add customization step
      await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
      await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
        NotificationFeatures.MUST_READS,
        "{{count}} 'must read' requires your attention"
      );
      //click on next button
      await notificationCustomizationPage.clickOnNextButton();

      //now verify user is on the select subject line step
      await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

      //verify the default subject line is selected
      await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();

      //click on custom subject line option
      await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
      //fill in the custom subject line
      await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
      //click on next button
      await notificationCustomizationPage.clickOnNextButton();

      //now verify user is on the manage translations step
      await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

      //click on save button
      await notificationCustomizationPage.clickOnSaveButton();
    });
  }
);
