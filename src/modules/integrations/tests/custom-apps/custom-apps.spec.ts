import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CREDENTIALS, CUSTOM_APPS_TEST_DATA } from '@/src/modules/integrations/test-data/customApps.test-data';
import { AppConnectorOptions } from '@/src/modules/integrations/ui/components/customAppsComponent';
import {
  CustomAppsIntegrationPage,
  CustomAppType,
} from '@/src/modules/integrations/ui/pages/customAppsIntegrationPage';
import { ExternalAppsPage } from '@/src/modules/integrations/ui/pages/externalAppsPage';

let createdAppName: string | null = null;

test.describe(
  'custom apps management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APPS, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      createdAppName = null;
      const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
      await customAppsPage.loadPage();
      await customAppsPage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({ appManagerFixture }) => {
      if (createdAppName) {
        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.loadPage();
        await customAppsPage.searchForApps(createdAppName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(createdAppName);
        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        createdAppName = null;
      }
    });

    test(
      'verify the search field functionality on "Custom Apps" page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15325',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.searchForApps('Airtable');
        await customAppsPage.verifyAppIsDisplayedInList('Airtable');
        await customAppsPage.clearSearch();
        await customAppsPage.searchForApps('abcdefg');
        await customAppsPage.verifyResultCountText('0 Apps');
        await customAppsPage.verifyNoResultsHeadingIsDisplayed();
        await customAppsPage.verifyNoResultsDescriptionIsDisplayed('Try adjusting search term or filters');
      }
    );

    test(
      'verify the Status filter functionality on "Custom Apps" page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23404',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.selectStatusFilter('Enabled');
        await customAppsPage.verifyAllAppsHaveStatus('Enabled');
        await customAppsPage.clearStatusFilter();
        await customAppsPage.selectStatusFilter('Disabled');
        await customAppsPage.verifyAllAppsHaveStatus('Disabled');
        await customAppsPage.clearStatusFilter();
      }
    );

    test(
      'verify the Type filter functionality on "Custom Apps" page',
      {
        tag: [TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23402',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.selectTypeFilter('Custom');
        await customAppsPage.verifyAllAppsHaveType('Custom');
        await customAppsPage.clearTypeFilter();
        await customAppsPage.selectTypeFilter('Prebuilt');
        await customAppsPage.verifyAllAppsHaveType('Prebuilt');
        await customAppsPage.clearTypeFilter();
      }
    );

    test(
      'verify the Sort functionality on "Custom Apps" page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26529',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.selectSortBy('Name');
        await customAppsPage.selectSortOrder('Oldest first');
        await customAppsPage.verifyAppsSortedAlphabeticallyAZ();
        await customAppsPage.selectSortOrder('Newest first');
        await customAppsPage.verifyAppsSortedAlphabeticallyZA();
        await customAppsPage.selectSortBy('Date created');
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.selectSortBy('Last used');
        await customAppsPage.verifyThePageIsLoaded();
      }
    );

    test(
      'verify user is able to upload logo image through Select from Computer',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15410',
        });

        const appName = `TestCustomApp name ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Test Description ${faker.lorem.sentence()}`;
        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('Jira_Custom_App.jpg');
        await customAppsPage.verifyUploadedLogoDetails('Jira_Custom_App', 'JPG');
      }
    );

    test(
      'verify user is able to create a custom app with OAuth2 and App level connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15416',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, appDescription, 'App level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.connectBoxAccountAndVerify(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD, appName);
        await customAppsPage.verifyAppDescription(appDescription);
        await customAppsPage.verifyConnectionMessage(appName);
      }
    );

    test(
      'verify user is able to create a custom app where Auth Type - OAuth2 and connection type is user level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15417',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, appDescription, 'User level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getUserLevelConnectionMessage(appName));
      }
    );

    test(
      'verify Delete Enabled Custom Connector for OAuth with Connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15594',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, appDescription, 'App level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);

        await customAppsPage.enableApp();
        await customAppsPage.deleteAppAndVerify(appName);
        createdAppName = null;
      }
    );

    test(
      'verify user is able to create a custom app where Auth Type - API token and connection type is app level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-15717', 'INT-15596'],
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, appDescription);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);
        await customAppsPage.verifyStatusBadge('Disabled');

        await customAppsPage.connectApiTokenAndVerify(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyEditButtonIsDisplayed();
        await customAppsPage.enableAppAndVerify(appName);

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_ENABLE_APP);

        // Test cancel delete dialog
        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.verifyDialogTitle(MESSAGES.DELETE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        // Delete app
        await customAppsPage.deleteAppAndVerify(appName);
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CUSTOM_APPS_EMPTY_STATE);
        createdAppName = null;
      }
    );

    test(
      'verify behaviour when user clicks save button after adding the OAuth2 configurations with App level & user level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15414',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, appDescription, 'App level & user level');

        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.verifyTextIsDisplayed(appDescription);
        await customAppsPage.verifyStatusBadge('Disabled');
        await customAppsPage.customAppsComponent.verifyTextIsDisplayed('Connect account');
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getAppAndUserLevelConnectionMessage(appName));

        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyTextIsDisplayed(`${appName} setup checklist`);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_CREATE_API_ACTION);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_CREATE_CUSTOM_APP_TILE);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_ENABLE_APP);
      }
    );

    test(
      'verify create connector with Basic Auth and connection allowed on App level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15875',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createJiraBasicAuthApp(appName, appDescription);
        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.connectBasicAuthAndVerify(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));

        await customAppsPage.enableAppAndVerify(appName);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_ENABLE_APP);
      }
    );

    test(
      'verify Delete Disabled Custom Connector for Basic Auth with Connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15597',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createJiraBasicAuthApp(appName, appDescription);
        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.enterCredentials(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        // Test cancel delete dialog
        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.verifyDialogTitle(MESSAGES.DELETE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        // Delete app
        await customAppsPage.deleteAppAndVerify(appName);
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CUSTOM_APPS_EMPTY_STATE);
        createdAppName = null;
      }
    );

    test(
      'verify Delete Disabled Custom Connector for API token Auth with Connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15599',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, appDescription);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        // Test cancel delete dialog
        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.verifyDialogTitle(MESSAGES.DELETE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        // Delete app
        await customAppsPage.deleteAppAndVerify(appName);
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CUSTOM_APPS_EMPTY_STATE);
        createdAppName = null;
      }
    );

    test(
      'verify user is able to Disconnect account of Auth type - API token and connection type - App level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15728',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;
        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, appDescription);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);
        await customAppsPage.connectApiTokenAndVerify(CREDENTIALS.TRELLO.API_TOKEN);

        await customAppsPage.clickDisconnectAccountButton();
        await customAppsPage.verifyDialogTitle(MESSAGES.DISCONNECT_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getAppDisconnectingConfirmationMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.DISCONNECT_WARNING_MESSAGE);
        await customAppsPage.clickDisconnectAccountInDialog();

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.CONNECTION_DISCONNECTED_MESSAGE);
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);
        await customAppsPage.verifySaveButtonIsDisplayed();
      }
    );

    test(
      'verify Disable Custom Connector for OAuth with Connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16180',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, appDescription, 'App level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);
        await customAppsPage.enableApp();

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);

        await customAppsPage.verifyStatusBadge('Enabled');
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.disableAppAndVerify(appName);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_ENABLE_APP);
      }
    );

    test(
      'verify Disable Custom Connector for Basic Auth with Connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16181',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createJiraBasicAuthApp(appName, appDescription);
        await customAppsPage.enterCredentials(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.enableAppAndVerify(appName);
        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);

        await customAppsPage.verifyStatusBadge('Enabled');
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.disableAppAndVerify(appName);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_ENABLE_APP);
      }
    );

    test(
      'verify Disable Custom Connector for API token auth with Connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16182',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, appDescription);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.enableAppAndVerify(appName);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.disableAppAndVerify(appName);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_ENABLE_APP);
      }
    );

    test(
      'verify editable and non-editable fields when connection is enabled - Basic Auth',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15772',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createJiraBasicAuthApp(appName, appDescription);
        await customAppsPage.enterCredentials(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          disabledFields: [formFields.BASE_URL],
          disabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.USERNAME_LABEL, formFields.PASSWORD_LABEL],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify editable and non-editable fields when connection is enabled - OAuth 2.0 Auth code',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15774',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, appDescription, 'App level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);
        await customAppsPage.verifyTextIsDisplayed(appDescription);

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          disabledFields: [formFields.CLIENT_ID],
          disabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE, formFields.SUB_AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          disabledFields: [formFields.CLIENT_SECRET, formFields.AUTH_URL, formFields.TOKEN_URL, formFields.BASE_URL],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify user is able to create a custom app where Auth Type - OAuth2 and connection type is user level - Plain PKCE Auth code',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-21360',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getUserLevelConnectionMessage(appName));
      }
    );

    test(
      'verify user is able to create a custom app where Auth Type - OAuth2 and connection type is app & user level - SHA256 PKCE Auth code with Token URL headers',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-21337',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Airtable Staging Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Airtable (Staging) Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAirtablePkceApp(appName, appDescription);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getUserLevelConnectionMessage(appName));

        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.verifyTextIsDisplayed(appDescription);
        await customAppsPage.verifyStatusBadge('Disabled');
        await customAppsPage.customAppsComponent.verifyTextIsDisplayed('Connect account');

        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_CREATE_API_ACTION);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_CREATE_CUSTOM_APP_TILE);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CHECKLIST_ENABLE_APP);
      }
    );

    test(
      'verify Delete Enabled Custom Connector for OAuth with Connection - PKCE',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23296',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.searchAndOpenApp(appName);

        await customAppsPage.deleteAppAndVerify(appName);
        createdAppName = null;
      }
    );

    test(
      'verify Disable Custom Connector for OAuth - PKCE with Connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23289',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.searchAndOpenApp(appName);

        await customAppsPage.disableAppAndVerify(appName);
      }
    );

    test(
      'verify custom app with Other category is visible in Others section of External Apps - User level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16755',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.verifyTextIsDisplayed('Others');
        await externalAppsPage.verifyCustomAppIsVisible(appName);
      }
    );

    test(
      'verify Other app category custom app is visible in Others section of External Apps - App and User level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-18085',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        const appName = `Airtable Staging Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Airtable (Staging) Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAirtablePkceApp(appName, appDescription);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.verifyTextIsDisplayed('Others');
        await externalAppsPage.verifyCustomAppIsVisible(appName);

        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.deleteAppAndVerify(appName);
        createdAppName = null;
      }
    );

    test(
      'verify Connect Account button is displayed for user level custom app',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16638',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.verifyCustomAppButtonState(appName, 'Connect account');

        // Connect and verify button state changes
        await externalAppsPage.clickConnectAccountForCustomApp(appName);
        await externalAppsPage.connectAuth0Account(CREDENTIALS.AUTH0.USERNAME, CREDENTIALS.AUTH0.PASSWORD);
        await externalAppsPage.verifyToastMessageIsVisibleWithText(`Connected to ${appName} successfully`);

        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.verifyCustomAppButtonState(appName, 'Disconnect account');

        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.deleteAppAndVerify(appName);
        createdAppName = null;
      }
    );

    test(
      'verify Disconnect Account functionality for user level custom app',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16641',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.verifyTextIsDisplayed('Others');

        // Connect the app
        await externalAppsPage.clickConnectAccountForCustomApp(appName);
        await externalAppsPage.connectAuth0Account(CREDENTIALS.AUTH0.USERNAME, CREDENTIALS.AUTH0.PASSWORD);
        await externalAppsPage.verifyToastMessageIsVisibleWithText(`Connected to ${appName} successfully`);

        // Disconnect and verify button state changes back
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.clickDisconnectAccountForCustomApp(appName);
        await externalAppsPage.verifyCustomAppButtonState(appName, 'Connect account');
      }
    );

    test(
      'verify editable and non-editable fields when connection is enabled - OAuth 2.0 PKCE auth code',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-21385',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        // Connect the app via External Apps page
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.clickConnectAccountForCustomApp(appName);
        await externalAppsPage.connectAuth0Account(CREDENTIALS.AUTH0.USERNAME, CREDENTIALS.AUTH0.PASSWORD);
        await externalAppsPage.verifyToastMessageIsVisibleWithText(`Connected to ${appName} successfully`);

        // Verify edit form field states
        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.clickEditFromMenu();

        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          disabledFields: [formFields.BASE_URL],
          disabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          disabledFields: [formFields.CLIENT_ID, formFields.AUTH_URL, formFields.TOKEN_URL],
          disabledDropdowns: [formFields.SUB_AUTH_TYPE],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getUserLevelConnectionMessage(appName));
      }
    );

    test(
      'verify App level disconnect flow - API token',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15835',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.enableAppAndVerify(appName);

        await customAppsPage.verifyFieldIsDisplayed('API Token');
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyEditButtonIsDisplayed();

        await customAppsPage.clickDisconnectAccountButton();
        await customAppsPage.verifyDialogTitle(MESSAGES.DISCONNECT_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getAppDisconnectingConfirmationMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.DISCONNECT_WARNING_MESSAGE);
        await customAppsPage.clickDisconnectAccountInDialog();

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.CONNECTION_DISCONNECTED_MESSAGE);
        await customAppsPage.verifyFieldIsDisplayed('API Token');
        await customAppsPage.verifySaveButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
      }
    );

    test(
      'verify all fields are editable when connection is disabled - API token',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15779',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.BASE_URL],
          enabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.API_TOKEN_LABEL, formFields.AUTHORIZATION_HEADER],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify all fields are editable when connection is disabled - OAuth 2.0 Auth code',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15778',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const boxApp = CUSTOM_APPS_TEST_DATA.BOX_DELETE_ENABLED_APP;
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `${boxApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, boxApp.DESCRIPTION, 'App level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.CLIENT_ID],
          enabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE, formFields.SUB_AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.AUTH_URL, formFields.TOKEN_URL, formFields.BASE_URL],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify all fields are editable when connection is disabled - Basic Auth',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15777',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const jiraApp = CUSTOM_APPS_TEST_DATA.JIRA_BASIC_AUTH_APP;
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `${jiraApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createJiraBasicAuthApp(appName, jiraApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.BASE_URL, formFields.USERNAME_LABEL, formFields.PASSWORD_LABEL],
          enabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify editable and non-editable fields when connection is enabled - API token',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15775',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyFieldIsDisplayed('API Token');
        await customAppsPage.verifyStatusBadge('Disabled');

        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          disabledFields: [formFields.BASE_URL],
          disabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.API_TOKEN_LABEL],
          disabledFields: [formFields.AUTHORIZATION_HEADER],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify user is able to Disconnect account of Auth type - API token and connection type - App and user level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-15729',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_APP_AND_USER_LEVEL;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION, 'App level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);
        await customAppsPage.verifySaveButtonIsDisabled();

        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.verifyEditButtonIsDisplayed();
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.clickDisconnectAccountButton();
        await customAppsPage.verifyDialogTitle(MESSAGES.DISCONNECT_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.verifyCancelButtonIsDisplayedInDialog();
        await customAppsPage.verifyDisconnectButtonIsDisplayedInDialog();
        await customAppsPage.clickDisconnectAccountInDialog();

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.CONNECTION_DISCONNECTED_MESSAGE);
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);
        await customAppsPage.verifySaveButtonIsDisplayed();
      }
    );

    test(
      'verify Sort Custom Apps by Date created, oldest first',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26281',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.selectSortBy('Date created');
        await customAppsPage.selectSortOrder('Oldest first');
        await customAppsPage.verifySortDropdownLabel('Sort: Date created');
        await customAppsPage.verifyAppIsNotFirst(appName);
      }
    );

    test(
      'verify Sort Custom Apps by Date created, newest first',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29607',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.selectSortBy('Date created');
        await customAppsPage.selectSortOrder('Newest first');
        await customAppsPage.verifySortDropdownLabel('Sort: Date created');
        await customAppsPage.verifyAppIsFirst(appName);
      }
    );

    test(
      'verify user is able to enable and establish connection for OAuth 2.0 Client credentials custom app',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29423',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const spotifyApp = CUSTOM_APPS_TEST_DATA.SPOTIFY_CLIENT_CREDENTIALS_APP;
        const appName = `${spotifyApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createSpotifyClientCredentialsApp(appName, spotifyApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyAppNameInHeader(appName);

        await customAppsPage.connectClientCredentialsAndVerify(
          CREDENTIALS.SPOTIFY.CLIENT_ID,
          CREDENTIALS.SPOTIFY.CLIENT_SECRET
        );
        await customAppsPage.enableAppAndVerify(appName);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify Client credentials OAuth 2.0 type is disabled for connection type user level and app and user level',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29417',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const connectionTypes = CUSTOM_APPS_TEST_DATA.CONNECTION_TYPES;
        const subAuthTypes = CUSTOM_APPS_TEST_DATA.SUB_AUTH_TYPES;

        const appName = `Test Client Credentials ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Test Description ${faker.lorem.sentence()}`;

        // Create custom app form
        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType(connectionTypes.USER_LEVEL);
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.verifySubAuthTypeOptionIsDisabled(subAuthTypes.CLIENT_CREDENTIALS);
        await customAppsPage.selectConnectionType(connectionTypes.APP_AND_USER_LEVEL);
        await customAppsPage.verifySubAuthTypeOptionIsDisabled(subAuthTypes.CLIENT_CREDENTIALS);
      }
    );

    test(
      'verify user is able to create OAuth 2.0 Client credentials custom app',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29421',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const spotifyApp = CUSTOM_APPS_TEST_DATA.SPOTIFY_CLIENT_CREDENTIALS_APP;
        const appName = `${spotifyApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createSpotifyClientCredentialsApp(appName, spotifyApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.verifyTextIsDisplayed(spotifyApp.DESCRIPTION);
        await customAppsPage.verifyStatusBadge('Disabled');
      }
    );

    test(
      'verify disable flow for enabled and connected OAuth 2.0 Client credentials custom app',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29424',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const spotifyApp = CUSTOM_APPS_TEST_DATA.SPOTIFY_CLIENT_CREDENTIALS_APP;
        const appName = `${spotifyApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createSpotifyClientCredentialsApp(appName, spotifyApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableAppAndVerify(appName);

        await customAppsPage.enterClientCredentials(CREDENTIALS.SPOTIFY.CLIENT_ID, CREDENTIALS.SPOTIFY.CLIENT_SECRET);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.disableAppAndVerify(appName);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_ENABLE_APP);
      }
    );

    test(
      'verify edit flow for enabled and connected OAuth 2.0 Client credentials custom app',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29425',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const spotifyApp = CUSTOM_APPS_TEST_DATA.SPOTIFY_CLIENT_CREDENTIALS_APP;
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `${spotifyApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createSpotifyClientCredentialsApp(appName, spotifyApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableAppAndVerify(appName);

        await customAppsPage.enterClientCredentials(CREDENTIALS.SPOTIFY.CLIENT_ID, CREDENTIALS.SPOTIFY.CLIENT_SECRET);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          disabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE, formFields.SUB_AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          disabledFields: [formFields.TOKEN_URL, formFields.BASE_URL],
        });
      }
    );

    test(
      'verify user is able to Disconnect account of Auth type - OAuth 2.0 Client Credentials',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29720',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const spotifyApp = CUSTOM_APPS_TEST_DATA.SPOTIFY_CLIENT_CREDENTIALS_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;
        const appName = `${spotifyApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createSpotifyClientCredentialsApp(appName, spotifyApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.CLIENT_ID);
        await customAppsPage.connectClientCredentialsAndVerify(
          CREDENTIALS.SPOTIFY.CLIENT_ID,
          CREDENTIALS.SPOTIFY.CLIENT_SECRET
        );

        await customAppsPage.clickDisconnectAccountButton();
        await customAppsPage.verifyDialogTitle(MESSAGES.DISCONNECT_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getAppDisconnectingConfirmationMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.DISCONNECT_WARNING_MESSAGE);
        await customAppsPage.clickDisconnectAccountInDialog();

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.CONNECTION_DISCONNECTED_MESSAGE);
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.CLIENT_ID);
        await customAppsPage.verifySaveButtonIsDisplayed();
      }
    );

    test(
      'verify all fields are editable when connection is disabled - OAuth 2.0 Client Credentials',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29721',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const spotifyApp = CUSTOM_APPS_TEST_DATA.SPOTIFY_CLIENT_CREDENTIALS_APP;
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `${spotifyApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        await customAppsPage.createSpotifyClientCredentialsApp(appName, spotifyApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          enabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE, formFields.SUB_AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.TOKEN_URL, formFields.BASE_URL],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
      }
    );

    test(
      'verify all fields are editable when connection is disabled - OAuth 2.0 PKCE',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29722',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.searchAndOpenApp(appName);

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
          enabledDropdowns: [formFields.CATEGORY],
        });

        await customAppsPage.selectAppCategory(CUSTOM_APPS_TEST_DATA.CATEGORIES.SUPPORT_TICKETING);
        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.BASE_URL],
          enabledDropdowns: [formFields.CONNECTION_TYPE, formFields.AUTH_TYPE],
        });

        await customAppsPage.scrollPageBy(300);

        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.CLIENT_ID, formFields.AUTH_URL, formFields.TOKEN_URL],
          enabledDropdowns: [formFields.SUB_AUTH_TYPE],
        });

        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getUserLevelConnectionMessage(appName));
      }
    );

    test(
      'verify user is able to Disconnect account of Auth type - OAuth 2.0 Auth Code',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29723',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createBoxOAuthApp(appName, appDescription, 'App level');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickDisconnectAccountButton();
        await customAppsPage.verifyDialogTitle(MESSAGES.DISCONNECT_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getAppDisconnectingConfirmationMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.DISCONNECT_WARNING_MESSAGE);
        await customAppsPage.clickDisconnectAccountInDialog();

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.CONNECTION_DISCONNECTED_MESSAGE);
        await customAppsPage.customAppsComponent.verifyTextIsDisplayed('Connect account');
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
      }
    );

    test(
      'verify user is able to create a custom app with OAuth2 PKCE - App level connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29724',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Auth0 PKCE App Level ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 PKCE App Level Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain', {
          connectionType: 'App level',
        });
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));
        await customAppsPage.customAppsComponent.verifyTextIsDisplayed('Connect account');
        await customAppsPage.verifyStatusBadge('Disabled');
      }
    );

    test(
      'verify user is able to create a custom app with OAuth2 PKCE SHA-256 - User level connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29725',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const appName = `Auth0 PKCE SHA256 ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 PKCE SHA-256 User Level Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'SHA-256', {
          connectionType: 'User level',
        });
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getUserLevelConnectionMessage(appName));
        await customAppsPage.verifyStatusBadge('Disabled');
      }
    );

    test(
      'verify Edit button shows edit form and allows editing name and description',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29437',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const formFields = CUSTOM_APPS_TEST_DATA.FORM_FIELD_NAMES;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        const updatedAppName = `Updated ${appName}`;
        const updatedDescription = `Updated description ${faker.lorem.sentence()}`;
        createdAppName = updatedAppName;

        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.clickEditFromMenu();
        await customAppsPage.verifyEditFormFieldStates({
          enabledFields: [formFields.NAME, formFields.DESCRIPTION],
        });

        // Update name and description
        await customAppsPage.enterAppName(updatedAppName);
        await customAppsPage.enterAppDescription(updatedDescription);
        await customAppsPage.scrollPageBy(500);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(updatedAppName));
        await customAppsPage.verifyAppNameInHeader(updatedAppName);
        await customAppsPage.verifyTextIsDisplayed(updatedDescription);
      }
    );
  }
);
