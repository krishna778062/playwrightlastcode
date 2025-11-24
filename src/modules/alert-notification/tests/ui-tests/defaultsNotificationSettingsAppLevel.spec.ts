import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { DEFAULT_SETTINGS_MESSAGES } from '../../constants/descriptionTextRepo';
import { ApplicationNotificationSettingsPage } from '../../ui/pages/applicationNotificationSettingsPage';

import { tagTest } from '@/src/core/utils/testDecorator';
import { appManagerFixture as test } from '@/src/modules/alert-notification/tests/fixtures/fixtures';

test.describe(
  '[Alert Notification] Defaults Notification Settings at Application Level - full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.DEFAULTS_NOTIFICATION_SETTINGS],
  },
  () => {
    let applicationNotificationSettingsPage: ApplicationNotificationSettingsPage;

    test.beforeEach(async ({ appManager }) => {
      await appManager.goto(PAGE_ENDPOINTS.APPLICATION_GENERAL_SETTINGS_PAGE);
      applicationNotificationSettingsPage = new ApplicationNotificationSettingsPage(appManager);
      await applicationNotificationSettingsPage.verifyThePageIsLoaded();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.navigateToDefaultsNotificationSettingsPage();
    });

    test('tc001 - verify all the notifications tabs under Defaults application settings page', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29388',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyTabIsDisplayed('Email');

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyTabIsDisplayed('Browser');

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyTabIsDisplayed('SMS');

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyTabIsDisplayed('Mobile');

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyTabIsDisplayed(
        'Notification customization'
      );

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyTabIsDisplayed(
        'Summaries & digests'
      );

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyTabIsDisplayed(
        'Do not disturb'
      );
    });

    test('tc002 - Verify notification settings Email Tab at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17590',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyNotificationTabHeadingIsDisplayed(
        'Email notifications'
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        DEFAULT_SETTINGS_MESSAGES.EMAIL_NOTIFICATION_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyUseRecommendedButtonIsVisible();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'All',
        'Org communications',
        'Profile & expertise',
        'Feed',
        'Sites',
        'Content',
        'Events',
        'Site management',
        'App management',
      ]);
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyNotificationTabHeadingIsDisplayed(
        'Email notification frequency'
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        DEFAULT_SETTINGS_MESSAGES.EMAIL_NOTIFICATION_FREQUENCY_DESCRIPTION
      );

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyImmediateEmailOptionIsVisible();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifySummarizedDailyEmailOptionIsVisible();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        'Email' + DEFAULT_SETTINGS_MESSAGES.APPLIED_TO_NEW_USERS_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyOverwriteButtonIsVisible();
    });

    test('tc003 - Verify notification settings Browser Tab at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17589',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('Browser');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyNotificationTabHeadingIsDisplayed(
        'Browser notifications'
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        DEFAULT_SETTINGS_MESSAGES.BROWSER_NOTIFICATION_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyUseRecommendedButtonIsVisible();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'All',
        'Org communications',
        'Profile & expertise',
        'Feed',
        'Sites',
        'Content',
        'Events',
        'Site management',
      ]);
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        'Browser' + DEFAULT_SETTINGS_MESSAGES.APPLIED_TO_NEW_USERS_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyOverwriteButtonIsVisible();
    });

    test('tc004 - Verify notification settings mobile Tab at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17598',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('Mobile');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyNotificationTabHeadingIsDisplayed(
        'Mobile notifications'
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        DEFAULT_SETTINGS_MESSAGES.MOBILE_NOTIFICATION_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyUseRecommendedButtonIsVisible();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'All',
        'Org communications',
        'Profile & expertise',
        'Feed',
        'Sites',
        'Content',
        'Events',
        'Site management',
      ]);
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        'Mobile app' + DEFAULT_SETTINGS_MESSAGES.APPLIED_TO_NEW_USERS_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyOverwriteButtonIsVisible();
    });

    test('tc005 - Verify notification settings SMS Tab at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17597',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('SMS');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyNotificationTabHeadingIsDisplayed(
        'SMS notifications'
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        DEFAULT_SETTINGS_MESSAGES.SMS_NOTIFICATION_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyUseRecommendedButtonIsVisible();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'All',
        'Org communications',
        'Content',
      ]);
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyDescriptionTextIsDisplayed(
        'SMS' + DEFAULT_SETTINGS_MESSAGES.APPLIED_TO_NEW_USERS_DESCRIPTION
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyOverwriteButtonIsVisible();
    });

    test('tc006 - Verify org communication notification settings at application level for all types of notifications', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29389',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Org communications']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandOrgCommunicationSection();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'Must reads',
        'Alerts',
      ]);

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('Browser');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandOrgCommunicationSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'Must reads',
        'Alerts',
      ]);

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('Mobile');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandOrgCommunicationSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'Must reads',
        'Alerts',
      ]);

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('SMS');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandOrgCommunicationSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleTextsAreVisible([
        'Must reads',
        'Alerts',
      ]);
    });

    test('tc007 - Verify functionality of Use Recommended button in Email section at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22148',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreUnchecked(
        ['Profile & expertise', 'Feed', 'Sites', 'Content', 'Events', 'Site management']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnUseRecommendedButton();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Org communications', 'Profile & expertise', 'Feed', 'Sites', 'Content', 'Events', 'Site management']
      );
    });

    test('tc008 - Verify functionality of Use Recommended button in browser section at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22191',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('Browser');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreUnchecked(
        ['Org communications', 'Profile & expertise', 'Feed', 'Sites', 'Content', 'Events', 'Site management']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnUseRecommendedButton();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Org communications', 'Feed', 'Sites', 'Content', 'Events', 'Site management']
      );
    });

    test('tc009 - Verify functionality of Use Recommended button in mobile section at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-21767',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('Mobile');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreUnchecked(
        ['Org communications', 'Profile & expertise', 'Feed', 'Sites', 'Content', 'Events', 'Site management']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnUseRecommendedButton();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Org communications', 'Feed', 'Sites', 'Content', 'Events', 'Site management']
      );
    });

    test('tc010 - Verify functionality of Use Recommended button in SMS section at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17586',
      });
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('SMS');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreUnchecked(
        ['All', 'Org communications', 'Content']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnUseRecommendedButton();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['All', 'Org communications', 'Content']
      );
    });

    test('tc011 -Verify the functionality of All checkbox in Email Tab by checking or unchecking at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22144',
      });

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.checkMultipleCheckboxes([
        'Profile & expertise',
        'Content',
      ]);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Profile & expertise', 'Content']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandProfileExpertiseSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Follows']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandContentSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Content notifications', 'Comments on my content', 'Likes or shares on my content']
      );
    });

    test('tc012 -Verify the functionality of All checkbox in Browser Tab  by checking unchecking at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22172',
      });

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnTab('Browser');
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.checkMultipleCheckboxes([
        'Org communications',
        'Events',
      ]);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Org communications', 'Events']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandOrgCommunicationSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Must reads', 'Alerts']
      );
    });

    test('tc013 -Verify the functionality of All checkbox in mobile Tab  by checking unchecking at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-21930',
      });

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.checkMultipleCheckboxes([
        'Org communications',
        'Feed',
      ]);

      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Org communications', 'Feed']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandOrgCommunicationSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Must reads', 'Alerts']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandFeedSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Replies to my posts or comments', 'Replies after you', 'Replies to a post you liked']
      );
    });

    test('tc014 -Verify the functionality of All checkbox in SMS Tab  by checking unchecking at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17618',
      });

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.uncheckMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.checkMultipleCheckboxes([
        'Org communications',
        'Content',
      ]);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Org communications', 'Content']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandOrgCommunicationSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Must reads', 'Alerts']
      );
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.expandContentSection();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['Content notifications', 'Comments on my content', 'Likes or shares on my content']
      );
    });

    test('tc015 -verify Overwrite notification settings for all users in Email Tab', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17654',
      });

      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.checkMultipleCheckboxes(['All']);
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Save');
      await applicationNotificationSettingsPage.commonActionsComponent.reloadPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.clickOnOverwriteButton();
      await applicationNotificationSettingsPage.commonActionsComponent.clickButton('Confirm');
      await applicationNotificationSettingsPage.commonActionsComponent.verifyToastMessage('Saved changes successfully');

      await applicationNotificationSettingsPage.commonActionsComponent.navigateToProfileNotificationSettingsPage();
      await applicationNotificationSettingsPage.defaultNotificationSettingsComponent.verifyMultipleCheckboxesAreChecked(
        ['All', 'Org communications', 'Profile & expertise', 'Sites', 'Content', 'Events', 'Site management']
      );
    });
  }
);
