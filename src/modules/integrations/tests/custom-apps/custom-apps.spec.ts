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
      'verify user is able to replace logo by removing existing logo and uploading a new one ',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28965',
        });

        const appName = `TestCustomApp name ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Test Description ${faker.lorem.sentence()}`;
        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.verifySaveButtonIsDisabled(); // Verify save button is disabled when required fields are not filled
        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);
        await customAppsPage.selectAppCategory('Other');

        // Upload first logo
        await customAppsPage.uploadLogoFile('Jira_Custom_App.jpg');
        await customAppsPage.verifyUploadedLogoDetails('Jira_Custom_App', 'JPG');
        await customAppsPage.verifyRemoveLogoButtonIsDisplayed();

        // Remove the first logo
        await customAppsPage.clickRemoveLogoButton();

        // Verify logo is removed - logo preview should not be visible
        await customAppsPage.verifyLogoPreviewIsHidden();

        // Upload a new logo
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.verifyUploadedLogoDetails('favicon', 'PNG');
        await customAppsPage.verifyRemoveLogoButtonIsDisplayed();
      }
    );

    test(
      'verify URL validations for custom app configuration fields',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28923',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName(`Test App ${faker.string.alphanumeric({ length: 6 })}`);
        await customAppsPage.enterAppDescription(`Test Description ${faker.lorem.sentence()}`);
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('Jira_Custom_App.jpg');
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.selectSubAuthType('Auth Code');

        // Enter invalid URLs for required fields
        await customAppsPage.enterFieldValue('Auth URL', 'invalid-auth-url');
        await customAppsPage.enterFieldValue('Token URL', 'invalid-token');
        await customAppsPage.enterFieldValue('Base URL', 'invalid base url');

        // Attempt to save
        await customAppsPage.clickSaveButtonOnForm();

        // Verify validation errors for all URL fields
        await customAppsPage.verifyUrlValidationError('Invalid Auth URL format');
        await customAppsPage.verifyUrlValidationError('Invalid Token URL format');
        await customAppsPage.verifyUrlValidationError('Invalid Base URL format');
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

    test(
      'verify correct prebuilt apps are visible on using both search filter and categories dropdown',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23501',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        await customAppsPage.clickAddCustomAppOption(CustomAppType.ADD_PREBUILT_APP);
        await customAppsPage.clickCategoryButtonInPrebuiltDialog();
        await customAppsPage.selectCategoryRadioInPrebuiltDialog('Calendar');
        await customAppsPage.searchForPrebuiltApp('Auth0');
        await customAppsPage.verifyCreateYourOwnAppTextIsDisplayed();
        await customAppsPage.verifyNoResultsMessageWithCreateOwnApp();
      }
    );

    test(
      'verify delete custom app without connection',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25365',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        // Create app without connecting
        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        // Delete app without connection
        await customAppsPage.deleteAppAndVerify(appName);
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.CUSTOM_APPS_EMPTY_STATE);
        createdAppName = null;
      }
    );

    test(
      'verify user can navigate back to custom apps list using breadcrumb',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25363',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        // Create app and navigate to details
        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyAppNameInHeader(appName);

        // Navigate back using breadcrumb
        await customAppsPage.navigateToCustomAppsList();
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.verifyAppIsDisplayedInList(appName);
      }
    );

    test(
      'verify Show next items button reveals additional filter options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-13513',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        // Verify Type filter functionality which requires Show next items
        await customAppsPage.selectTypeFilter('Custom');
        await customAppsPage.verifyAllAppsHaveType('Custom');
        await customAppsPage.clearTypeFilter();
      }
    );

    test(
      'verify app is not visible in External Apps page after disabling',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-13512',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        const appName = `Auth0 Disable Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Disable Test Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        // Create and enable app
        await customAppsPage.createAuth0PkceApp(appName, appDescription, 'Plain');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enableApp();

        // Verify app is visible in External Apps
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.verifyCustomAppIsVisible(appName);

        // Disable the app
        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();
        await customAppsPage.searchAndOpenApp(appName);
        await customAppsPage.disableAppAndVerify(appName);

        // Verify app is not visible in External Apps after disabling
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await customAppsPage.scrollPageBy(1000);
        await externalAppsPage.verifyCustomAppIsNotVisible(appName);
      }
    );

    test(
      'verify invalid API token shows error or fails to connect',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-13511',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        // Create app
        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        // Enter invalid API token
        await customAppsPage.enterAPIToken('invalid-api-token-12345');

        // Verify connection is not established - checklist item should remain unchecked
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
      }
    );

    test(
      'verify cancel button in delete dialog does not delete the app',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14330',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        // Create app
        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        // Open delete dialog and cancel
        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.verifyDialogTitle(MESSAGES.DELETE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        // Verify app still exists
        await customAppsPage.verifyAppNameInHeader(appName);
      }
    );

    test(
      'verify cancel button in disconnect dialog does not disconnect the account',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14329',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const appName = `${trelloApp.NAME_PREFIX} ${faker.string.alphanumeric({ length: 6 })}`;
        createdAppName = appName;

        // Create and connect app
        await customAppsPage.createTrelloApiTokenApp(appName, trelloApp.DESCRIPTION);
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        // Open disconnect dialog and cancel
        await customAppsPage.clickDisconnectAccountButton();
        await customAppsPage.verifyDialogTitle(MESSAGES.DISCONNECT_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        // Verify account is still connected
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
      }
    );

    test(
      'verify form fields displayed for API Token auth type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14328',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test API Token Fields');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.selectAuthType('API Token');

        // Verify API Token specific fields are displayed
        await customAppsPage.verifyFieldIsDisplayed('Base URL');
        await customAppsPage.verifyFieldIsDisplayed('API Token label');
        await customAppsPage.verifyFieldIsDisplayed('Authorization header');
      }
    );

    test(
      'verify form fields displayed for Basic Auth type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14327',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test Basic Auth Fields');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.selectAuthType('Basic Auth');

        // Verify Basic Auth specific fields are displayed
        await customAppsPage.verifyFieldIsDisplayed('Base URL');
        await customAppsPage.verifyFieldIsDisplayed('Username label');
        await customAppsPage.verifyFieldIsDisplayed('Password label');
      }
    );

    test(
      'verify form fields displayed for OAuth 2.0 Auth Code type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14324',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test OAuth Auth Code Fields');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.selectSubAuthType('Auth Code');

        // Verify OAuth 2.0 Auth Code specific fields are displayed
        await customAppsPage.verifyFieldIsDisplayed('Client ID');
        await customAppsPage.verifyFieldIsDisplayed('Secret key');
        await customAppsPage.verifyFieldIsDisplayed('Auth URL');
        await customAppsPage.verifyFieldIsDisplayed('Token URL');
        await customAppsPage.verifyFieldIsDisplayed('Base URL');
        await customAppsPage.verifyTextIsDisplayed('Add headers for Token URL');
      }
    );

    test(
      'verify form fields displayed for OAuth 2.0 Auth Code with PKCE type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14158',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test OAuth PKCE Fields');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('User level');
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.selectSubAuthType('Auth Code with PKCE');

        // Verify OAuth 2.0 PKCE specific fields are displayed
        await customAppsPage.verifyFieldIsDisplayed('Code challenge method');
        await customAppsPage.verifyFieldIsDisplayed('Client ID');
        await customAppsPage.verifyFieldIsDisplayed('Secret key');
        await customAppsPage.verifyFieldIsDisplayed('Auth URL');
        await customAppsPage.verifyFieldIsDisplayed('Token URL');
        await customAppsPage.verifyFieldIsDisplayed('Base URL');
      }
    );

    test(
      'verify form fields displayed for OAuth 2.0 Client Credentials type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14157',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test Client Credentials Fields');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.selectSubAuthType('Client Credentials');

        // Verify Client Credentials specific fields are displayed
        await customAppsPage.verifyFieldIsDisplayed('Client ID label');
        await customAppsPage.verifyFieldIsDisplayed('Secret key label');
        await customAppsPage.verifyFieldIsDisplayed('Token URL');
        await customAppsPage.verifyFieldIsDisplayed('Base URL');
      }
    );

    test(
      'verify OAuth 2.0 redirect URL is displayed when OAuth auth type is selected',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-10642',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test OAuth Redirect URL');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.selectAuthType('OAuth 2.0');

        // Verify redirect URL guidance message is displayed
        await customAppsPage.verifyTextIsDisplayed('Use this redirect URL when setting up your OAuth 2.0 app');
        await customAppsPage.verifyTextIsDisplayed('connector/callback');
      }
    );

    test(
      'verify Code challenge method dropdown options for PKCE auth type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-10640',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test PKCE Code Challenge');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('User level');
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.selectSubAuthType('Auth Code with PKCE');

        // Verify Code challenge method field is displayed
        await customAppsPage.verifyFieldIsDisplayed('Code challenge method');

        // Select Plain method and verify
        await customAppsPage.selectCodeChallengeMethod('Plain');

        // Select SHA-256 method and verify
        await customAppsPage.selectCodeChallengeMethod('SHA-256');
      }
    );

    test(
      'verify required field validation error for Client ID',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28637',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test Client ID Validation');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('User level');
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.selectSubAuthType('Auth Code');

        // Click on Client ID field and blur to trigger validation
        await customAppsPage.clickSaveButtonOnForm();

        // Verify Client ID required error is displayed
        await customAppsPage.verifyTextIsDisplayed('Client ID is required');
      }
    );

    test(
      'verify required field validation error for OAuth 2.0 type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26520',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test OAuth Type Validation');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level & user level');
        await customAppsPage.selectAuthType('OAuth 2.0');

        // Do not select OAuth 2.0 type and try to save
        await customAppsPage.clickSaveButtonOnForm();

        // Verify OAuth 2.0 type required error is displayed
        await customAppsPage.verifyTextIsDisplayed('OAuth 2.0 type is required');
      }
    );

    test(
      'verify all three connection type options are available',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14331',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test Connection Types');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');

        // Verify App level connection type
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.verifyTextIsDisplayed('App level connection requires only an app manager to connect');

        // Verify User level connection type
        await customAppsPage.selectConnectionType('User level');
        await customAppsPage.verifyTextIsDisplayed(
          'user level connection requires all users to connect their accounts'
        );

        // Verify App level & user level connection type
        await customAppsPage.selectConnectionType('App level & user level');
        await customAppsPage.verifyTextIsDisplayed('App level connection requires only an app manager to connect');
      }
    );

    test(
      'verify all three auth type options are available',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-22242',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test Auth Types');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level');

        // Verify API Token auth type
        await customAppsPage.selectAuthType('API Token');
        await customAppsPage.verifyFieldIsDisplayed('API Token label');

        // Verify Basic Auth type
        await customAppsPage.selectAuthType('Basic Auth');
        await customAppsPage.verifyFieldIsDisplayed('Username label');

        // Verify OAuth 2.0 auth type
        await customAppsPage.selectAuthType('OAuth 2.0');
        await customAppsPage.verifyFieldIsDisplayed('OAuth 2.0 type');
      }
    );

    test(
      'verify all OAuth 2.0 sub-type options are available for App level connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-22241',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName('Test OAuth Sub Types');
        await customAppsPage.enterAppDescription('Test Description');
        await customAppsPage.selectAppCategory('Other');
        await customAppsPage.uploadLogoFile('favicon.png');
        await customAppsPage.selectConnectionType('App level');
        await customAppsPage.selectAuthType('OAuth 2.0');

        // Verify Auth Code sub-type
        await customAppsPage.selectSubAuthType('Auth Code');
        await customAppsPage.verifyFieldIsDisplayed('Client ID');

        // Verify Auth Code with PKCE sub-type
        await customAppsPage.selectSubAuthType('Auth Code with PKCE');
        await customAppsPage.verifyFieldIsDisplayed('Code challenge method');

        // Verify Client Credentials sub-type
        await customAppsPage.selectSubAuthType('Client Credentials');
        await customAppsPage.verifyFieldIsDisplayed('Client ID label');
      }
    );
  }
);
