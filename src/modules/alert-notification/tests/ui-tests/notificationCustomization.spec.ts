import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { ALERT_NOTIFICATION_MESSAGES } from '../../constants/messageRepo';
import { NotificationFeatures } from '../../ui/components/selectNotificationStep';
import {
  CustomizationNotificationSteps,
  NotificationCustomizationPage,
} from '../../ui/pages/notificationCustomizationPage';
import { NotificationTestDataGenerator } from '../test-data/notification-customization.test-data';

import { tagTest } from '@/src/core/utils/testDecorator';
import { appManagerFixture as test } from '@/src/modules/alert-notification/tests/fixtures/fixtures';

test.describe(
  '[Alert Notification] Subject custom line - full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION],
  },
  () => {
    let notificationCustomizationPage: NotificationCustomizationPage;

    test.beforeEach(async ({ appManager }) => {
      // Navigate directly to notification customization page using endpoint
      await appManager.goto(PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
      notificationCustomizationPage = new NotificationCustomizationPage(appManager);
      await notificationCustomizationPage.verifyThePageIsLoaded();
    });

    test(
      'tc001 - verify app manager is able to customize must read with default subject line',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-1',
          storyId: 'INT-123',
        });
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          "A 'must read' requires your attention"
        );
        //click on next button
        await notificationCustomizationPage.clickButton('Next');

        //now verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify the default subject line is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();
        //click on save button
        await notificationCustomizationPage.clickButton('Save');
      }
    );

    test(
      'tc002 - verify app manager is able to customize must read with custom subject line',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          "{{count}} 'must read' requires your attention"
        );
        //click on next button
        await notificationCustomizationPage.clickButton('Next');

        //now verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify the default subject line is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();

        //click on custom subject line option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //click on next button
        await notificationCustomizationPage.clickButton('Next');

        //now verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        //click on save button
        await notificationCustomizationPage.clickButton('Save');
        //verify toast message
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);
        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu();
        //verify delete toast message
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );

    test(
      'tc003 - verify cancel action and validation on subject line customization',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async () => {
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          "A 'must read' requires your attention"
        );
        //click on next button
        await notificationCustomizationPage.clickButton('Next');

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.clickButton('Cancel');
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          "{{count}} 'must read' requires your attention"
        );
        await notificationCustomizationPage.clickButton('Next');

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //Test validation - select custom subject line and clear it
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        //clear the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();

        //verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );

    test(
      'tc004 - verify custom subject line creation and delivery for Follow template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select follow feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.FOLLOWS,
          'started following you'
        );
        //click on next button
        await notificationCustomizationPage.clickButton('Next');

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.clickButton('Cancel');
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.FOLLOWS,
          'started following you'
        );
        await notificationCustomizationPage.clickButton('Next');

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //Test validation - select custom subject line and clear it
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        //clear the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();

        //verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );

    test(
      'tc005 - verify custom subject line creation and delivery for Alerts template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select alerts feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          'New Alert - {{message}}'
        );
        //click on next button
        await notificationCustomizationPage.clickButton('Next');

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.clickButton('Cancel');
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          'New Alert - {{message}}'
        );
        await notificationCustomizationPage.clickButton('Next');

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //Test validation - select custom subject line and clear it
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        //clear the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();

        //verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );
  }
);
