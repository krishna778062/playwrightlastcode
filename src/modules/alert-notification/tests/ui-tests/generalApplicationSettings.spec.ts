import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { tagTest } from '@core/utils/testDecorator';

import { ApplicationNotificationSettingsPage } from '../../ui/pages/applicationNotificationSettingsPage';

import { appManagerFixture as test } from '@/src/modules/alert-notification/tests/fixtures/fixtures';

test.describe(
  '[Alert Notification] General Application Settings for SMS and Push notification - full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.GENERAL_APPLICATION_SETTINGS],
  },
  () => {
    let applicationNotificationSettingsPage: ApplicationNotificationSettingsPage;

    test.beforeEach(async ({ appManager }) => {
      await appManager.goto(PAGE_ENDPOINTS.APPLICATION_GENERAL_SETTINGS_PAGE);
      applicationNotificationSettingsPage = new ApplicationNotificationSettingsPage(appManager);
      await applicationNotificationSettingsPage.verifyThePageIsLoaded();
    });

    test('tc001 - verify SMS and Push notification settings are displayed under General Application Settings tab', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29350',
      });
      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifySMSNotificatioTextIsDisplayed();

      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifyPushNotificationTextIsDisplayed();

      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifySMSDescriptionTextIsDisplayed();

      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifyPushDescriptionTextIsDisplayed();

      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifySMSCheckboxIsDisplayed();

      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifyPushCheckboxIsDisplayed();
    });

    test('tc002 - verify user is able to toggle SMS notification settings from General Application Settings page', async () => {
      tagTest(test.info(), {
        zephyrTestId: '',
      });
      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.unCheckSMSNotificationsCheckbox();
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifySMSCheckboxIsUnhecked();

      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.checkSMSNotificationsCheckbox();
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifySMSCheckboxIsChecked();
    });

    test('tc003 - verify user is able to toggle Push notification settings from General Application Settings page', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29352',
      });
      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.unCheckPushNotificationsCheckbox();
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifyPushCheckboxIsUnhecked();

      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.checkPushNotificationsCheckbox();
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.applicationNotificationSettingsComponent.verifyPushCheckboxIsChecked();
    });
  }
);
