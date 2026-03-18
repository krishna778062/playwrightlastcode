import { ALERT_NOTIFICATION_MESSAGES } from '@alert-notification-constants/messageRepo';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { AlertNotificationMySettingsNotificationsPage, DndPage } from '../../../ui/pages/dndPage';
import { appManagerFixture as test } from '../../fixtures/fixtures';
import { DND_PAGE_TEXT } from '../../test-data/dnd-manage-preferences.test-data';

test.describe('[Alert Notification] DND - Cross-app behaviour', () => {
  let dndPage: DndPage;

  test.beforeEach(async ({ appManager }) => {
    dndPage = new DndPage(appManager);
    await dndPage.navigateToPageUsingDefaultsTab();
  });

  test(
    'tc001 - Verify DND tab is hidden at profile level when DND is disabled',
    {
      tag: [TestPriority.P0, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        storyId: 'INT-31316',
      });

      // And I am on Application settings → Defaults (handled in beforeEach)
      // When I open the Do not disturb tab
      await dndPage.clickOnDNDTab(DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB);

      // And the "Do not disturb outside work hours" All organization toggle is OFF
      await dndPage.setAllOrganizationToggle(false);
      await dndPage.verifyAllOrganizationToggleIsOnOrOff('off');

      // When I navigate to People → My profile → Notifications
      const mySettingsNotificationsPage = new AlertNotificationMySettingsNotificationsPage(dndPage.page);
      await mySettingsNotificationsPage.navigateToCurrentUserNotificationSettings();

      // Then the "Do not disturb" tab should NOT be displayed at profile level
      await mySettingsNotificationsPage.verifyDoNotDisturbTabIsNotVisible();
    }
  );

  test(
    'tc002 - Verify DND Feature Flag notifications_time_window  On and Off functionality',
    {
      tag: [TestPriority.P0, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        storyId: 'INT-23572',
      });

      // Given I am logged in as an App Manager (handled in beforeEach)
      // And I am on Application settings → Defaults (handled in beforeEach)
      // When I open the Do not disturb tab
      await dndPage.clickOnDNDTab(DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB);

      // And I enable the "Do not disturb outside work hours" toggle
      await dndPage.setAllOrganizationToggle(true);
      await dndPage.verifyAllOrganizationToggleIsOnOrOff('on');

      // And the "Select source" section with Manual option should be visible
      await dndPage.verifySelectSourceSection();

      // And I select "Manual" as the source
      await dndPage.selectSourceOption('Manual');

      // And the "Work days" and "Work hours" sections are visible
      await dndPage.verifyWorkDaysSectionAndOptions();
      await dndPage.verifyWorkHoursSection();

      // And I fill work days (Monday–Friday) and work hours (09:00–19:00)
      await dndPage.fillDndWorkDaysAndHours(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '09:00', '19:00');

      // And the "Save" button should be enabled
      await dndPage.verifyButton(DND_PAGE_TEXT.SAVE_BUTTON, 'enabled');

      // And I save the Do Not Disturb configuration successfully
      await dndPage.clickButton(DND_PAGE_TEXT.SAVE_BUTTON);
      await dndPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.DND_SAVED_SUCCESSFULLY);

      // Then I navigate to People → My profile → Notifications
      const mySettingsNotificationsPage = new AlertNotificationMySettingsNotificationsPage(dndPage.page);
      await mySettingsNotificationsPage.navigateToCurrentUserNotificationSettings();

      // And the "Do not disturb" tab should be displayed at profile level
      await mySettingsNotificationsPage.verifyDoNotDisturbTabIsVisible();

      // When I navigate back to Application settings → Do not disturb
      await dndPage.navigateToDndPage();

      // And I disable DND and save
      await dndPage.disableAllOrganizationDndAndSave();
    }
  );

  test(
    'tc003 - Verify DND page elements are displayed correctly when navigating from Defaults menu',
    {
      tag: [TestPriority.P1, TestGroupType.SANITY],
    },
    async () => {
      tagTest(test.info(), {
        storyId: 'INT-29353',
      });

      // Given: user is on Application Settings → Manage application → Defaults (Email notifications)
      // (handled in beforeEach)

      // When: user views the left-side menu under Defaults
      // Then: Do not disturb tab is visible
      await dndPage.verifyDoNotDisturbTabIsVisible();

      // When: user clicks the Do not disturb tab
      await dndPage.clickOnDNDTab(DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB);

      // Then: DND page shows heading, descriptions, Manage preferences link, All organization, Audience
      await dndPage.verifyDndPageAllTextElementsAfterDNDTabClick();
    }
  );

  test(
    'tc004 - Verify All organization toggle and source configuration UI on Do not disturb page',
    {
      tag: [TestPriority.P0, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        storyId: 'INT-29372',
      });

      // When: user clicks on the "Do not disturb" tab
      await dndPage.verifyDoNotDisturbTabIsVisible();
      await dndPage.clickOnDNDTab(DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB);

      // Then: DND page shows heading, descriptions, link, All organization, Audience
      await dndPage.verifyDndPageAllTextElementsAfterDNDTabClick();

      // Remember original All organization toggle state for potential future cleanup
      const _originalAllOrgState = await dndPage.checkAllOrganizationToggleEnabled();

      // When the user enables the "All organization" toggle
      await dndPage.setAllOrganizationToggle(true);

      // Then the "All organization" toggle should be turned ON
      await dndPage.verifyAllOrganizationToggleIsOnOrOff('on');

      // And the "Save" button should be enabled
      await dndPage.verifyButton(DND_PAGE_TEXT.SAVE_BUTTON, 'enabled');

      // And the "Select source" section with Manual option should be visible
      await dndPage.verifySelectSourceSectionIsVisible();

      // When the user selects "Manual" as the source
      await dndPage.selectSourceOptionAs('Manual');

      // Then the "Work days" section and all day options should be displayed
      await dndPage.verifyWorkDaysSectionAndOptionsAreVisible();

      // And the "Work hours" section, fields and helper text should be displayed
      await dndPage.verifyWorkHoursSection();

      // And the "User editable" checkbox and helper text should be displayed
      await dndPage.verifyUserEditableOption();
    }
  );

  test(
    'tc005 - Verify DND settings are synchronized when the override is disabled',
    {
      tag: [TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        storyId: 'INT-23576',
      });

      // Given: Login as Admin (handled in beforeEach)
      // And: Navigate to Manage Application → Defaults tab (handled in beforeEach)
      // When: user opens the Do not disturb tab
      await dndPage.clickOnDNDTab(DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB);

      // And: the "Allow override by users" (User editable) option is disabled
      await dndPage.setAllOrganizationToggle(true);
      await dndPage.verifyAllOrganizationToggleIsOnOrOff('on');
      await dndPage.selectSourceOption('Manual');
      await dndPage.setUserEditable(false);

      // When: user configures Working Days (Monday–Friday) and work hours (09:00–18:00)
      await dndPage.fillDndWorkDaysAndHours(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '09:00', '18:00');

      // And: clicks Save
      await dndPage.verifyButton(DND_PAGE_TEXT.SAVE_BUTTON, 'enabled');
      await dndPage.clickButton(DND_PAGE_TEXT.SAVE_BUTTON);

      // Then: application-level DND settings should be saved successfully
      await dndPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.DND_SAVED_SUCCESSFULLY);

      // When: user navigates to profile DND settings
      const mySettingsNotificationsPage = new AlertNotificationMySettingsNotificationsPage(dndPage.page);
      await mySettingsNotificationsPage.navigateToProfileDndPage();

      // Then: the same DND settings should reflect (Monday–Friday, 9:00 AM, 6:00 PM)
      await mySettingsNotificationsPage.verifyProfileDndWorkDaysDisplay([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ]);
      await mySettingsNotificationsPage.verifyProfileDndWorkHoursDisplay('9:00 AM', '6:00 PM');

      // And: all fields should be read-only (user cannot make changes)
      await mySettingsNotificationsPage.verifyProfileDndFieldsAreReadOnly();

      // Cleanup: disable DND at app level so subsequent tests start from a known state
      await dndPage.navigateToDndPage();
      await dndPage.disableAllOrganizationDndAndSave();
    }
  );

  test(
    'tc006 - Verify user can not change DND settings at profile level if override option is disabled from application level',
    {
      tag: [TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        storyId: 'INT-23576',
      });

      // Given: Login as Admin (handled in beforeEach)
      // And: Navigate to Manage Application → Defaults tab (handled in beforeEach)
      // When: user opens the Do not disturb tab
      await dndPage.clickOnDNDTab(DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB);

      // And: the "Override" (User editable) option is disabled in application-level DND settings
      await dndPage.setAllOrganizationToggle(true);
      await dndPage.verifyAllOrganizationToggleIsOnOrOff('on');
      await dndPage.selectSourceOption('Manual');
      await dndPage.setUserEditable(false);

      // And: application-level DND settings are configured with Working Days Monday–Friday, Start 9:00 AM, End 6:00 PM
      await dndPage.fillDndWorkDaysAndHours(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '09:00', '18:00');

      // And: Click on Save button
      await dndPage.verifyButton(DND_PAGE_TEXT.SAVE_BUTTON, 'enabled');
      await dndPage.clickButton(DND_PAGE_TEXT.SAVE_BUTTON);
      await dndPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.DND_SAVED_SUCCESSFULLY);

      // When: the user navigates to their profile DND settings
      const mySettingsNotificationsPage = new AlertNotificationMySettingsNotificationsPage(dndPage.page);
      await mySettingsNotificationsPage.navigateToProfileDndPage();

      // Then: Working Days should display as Monday to Friday
      await mySettingsNotificationsPage.verifyProfileDndWorkDaysDisplay([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ]);

      // And: Start Time should display as 9:00 AM, End Time as 6:00 PM
      await mySettingsNotificationsPage.verifyProfileDndWorkHoursDisplay('9:00 AM', '6:00 PM');

      // And: DND fields (Working Days, Start Time, End Time) should be read-only
      await mySettingsNotificationsPage.verifyProfileDndFieldsAreReadOnly();

      // And: the user should see a tooltip: "Only app managers can change workdays & work hours"
      await mySettingsNotificationsPage.verifyProfileDndReadOnlyTooltip();

      // When: the user attempts to edit the DND settings at the profile level
      // Then: the system should not allow any changes to be saved (fields are disabled; Save is disabled)
      await mySettingsNotificationsPage.verifyProfileDndFieldsAreReadOnly();

      // Cleanup: disable DND at app level so subsequent tests start from a known state
      await dndPage.navigateToDndPage();
      await dndPage.disableAllOrganizationDndAndSave();
    }
  );
});
