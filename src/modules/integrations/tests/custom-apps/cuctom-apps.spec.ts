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

    test.fixme(
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
        const boxApp = CUSTOM_APPS_TEST_DATA.BOX_OAUTH_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);
        await customAppsPage.selectAppCategory(boxApp.CATEGORY);
        await customAppsPage.uploadLogoFile(boxApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(boxApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(boxApp.AUTH_TYPE);
        await customAppsPage.selectSubAuthType(boxApp.SUB_AUTH_TYPE);
        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, boxApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, boxApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, boxApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, boxApp.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, boxApp.BASE_URL);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);
        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.verifyAppDescription(appDescription);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyChecklistItemIsChecked('Connect the app-level account');
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
        const boxUserLevelApp = CUSTOM_APPS_TEST_DATA.BOX_USER_LEVEL_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);
        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);
        await customAppsPage.selectAppCategory(boxUserLevelApp.CATEGORY);
        await customAppsPage.uploadLogoFile(boxUserLevelApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(boxUserLevelApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(boxUserLevelApp.AUTH_TYPE);
        await customAppsPage.selectSubAuthType(boxUserLevelApp.SUB_AUTH_TYPE);
        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, boxUserLevelApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, boxUserLevelApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, boxUserLevelApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, boxUserLevelApp.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, boxUserLevelApp.BASE_URL);
        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');
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
        const boxApp = CUSTOM_APPS_TEST_DATA.BOX_DELETE_ENABLED_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(boxApp.CATEGORY);
        await customAppsPage.uploadLogoFile(boxApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(boxApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(boxApp.AUTH_TYPE);
        await customAppsPage.selectSubAuthType(boxApp.SUB_AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, boxApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, boxApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, boxApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, boxApp.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, boxApp.BASE_URL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');
        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
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
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(trelloApp.CATEGORY);
        await customAppsPage.uploadLogoFile(trelloApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(trelloApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(trelloApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, trelloApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.API_TOKEN_LABEL, trelloApp.API_TOKEN_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.AUTHORIZATION_HEADER, trelloApp.AUTHORIZATION_HEADER);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));
        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);
        await customAppsPage.verifyStatusBadge('Disabled');
        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyEditButtonIsDisplayed();
        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.verifyDialogTitle(MESSAGES.ENABLE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(appName));
        await customAppsPage.verifyStatusBadge('Enabled');

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_ENABLE_APP);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.verifyDialogTitle(MESSAGES.DELETE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
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
          zephyrTestId: 'INT-15418',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
        const boxApp = CUSTOM_APPS_TEST_DATA.BOX_APP_AND_USER_LEVEL_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(boxApp.CATEGORY);
        await customAppsPage.uploadLogoFile(boxApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(boxApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(boxApp.AUTH_TYPE);
        await customAppsPage.selectSubAuthType(boxApp.SUB_AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, boxApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, boxApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, boxApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, boxApp.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, boxApp.BASE_URL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

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
        const jiraApp = CUSTOM_APPS_TEST_DATA.JIRA_BASIC_AUTH_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(jiraApp.CATEGORY);
        await customAppsPage.uploadLogoFile(jiraApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(jiraApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(jiraApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, jiraApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.USERNAME_LABEL, jiraApp.USERNAME_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.PASSWORD_LABEL, jiraApp.PASSWORD_LABEL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.enterCredentials(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);
        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(appName));
        await customAppsPage.verifyStatusBadge('Enabled');

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
        const jiraApp = CUSTOM_APPS_TEST_DATA.JIRA_BASIC_AUTH_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(jiraApp.CATEGORY);
        await customAppsPage.uploadLogoFile(jiraApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(jiraApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(jiraApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, jiraApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.USERNAME_LABEL, jiraApp.USERNAME_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.PASSWORD_LABEL, jiraApp.PASSWORD_LABEL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyAppNameInHeader(appName);

        await customAppsPage.enterCredentials(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);

        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.clickButton('Custom apps');

        await customAppsPage.searchForApps(appName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(appName);

        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.verifyDialogTitle(MESSAGES.DELETE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));

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
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(trelloApp.CATEGORY);
        await customAppsPage.uploadLogoFile(trelloApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(trelloApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(trelloApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, trelloApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.API_TOKEN_LABEL, trelloApp.API_TOKEN_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.AUTHORIZATION_HEADER, trelloApp.AUTHORIZATION_HEADER);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);

        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.verifyDialogTitle(MESSAGES.DELETE_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.clickCancelButton();

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));

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
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(trelloApp.CATEGORY);
        await customAppsPage.uploadLogoFile(trelloApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(trelloApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(trelloApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, trelloApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.API_TOKEN_LABEL, trelloApp.API_TOKEN_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.AUTHORIZATION_HEADER, trelloApp.AUTHORIZATION_HEADER);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);

        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);

        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();
        await customAppsPage.verifyEditButtonIsDisplayed();

        await customAppsPage.clickDisconnectAccountButton();

        await customAppsPage.verifyDialogTitle(MESSAGES.DISCONNECT_CUSTOM_APP_DIALOG_TITLE);
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getAppDisconnectingConfirmationMessage(appName));
        await customAppsPage.verifyTextIsDisplayed(MESSAGES.DISCONNECT_WARNING_MESSAGE);

        await customAppsPage.clickDisconnectAccountInDialog();

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisconnectedMessage(appName));

        await customAppsPage.verifyFieldIsDisplayed(fieldLabels.API_TOKEN);

        await customAppsPage.verifySaveButtonIsDisplayed();

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const boxApp = CUSTOM_APPS_TEST_DATA.BOX_DELETE_ENABLED_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(boxApp.CATEGORY);
        await customAppsPage.uploadLogoFile(boxApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(boxApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(boxApp.AUTH_TYPE);
        await customAppsPage.selectSubAuthType(boxApp.SUB_AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, boxApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, boxApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, boxApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, boxApp.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, boxApp.BASE_URL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');

        await customAppsPage.clickButton('Custom apps');

        await customAppsPage.searchForApps(appName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(appName);

        await customAppsPage.verifyStatusBadge('Enabled');

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Disable);
        await customAppsPage.customAppsComponent.clickDialogButton('Disable', 'Confirm disable');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisabledMessage(appName));

        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_ENABLE_APP);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const jiraApp = CUSTOM_APPS_TEST_DATA.JIRA_BASIC_AUTH_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(jiraApp.CATEGORY);
        await customAppsPage.uploadLogoFile(jiraApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(jiraApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(jiraApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, jiraApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.USERNAME_LABEL, jiraApp.USERNAME_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.PASSWORD_LABEL, jiraApp.PASSWORD_LABEL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.enterCredentials(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(appName));

        await customAppsPage.clickButton('Custom apps');

        await customAppsPage.searchForApps(appName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(appName);

        await customAppsPage.verifyStatusBadge('Enabled');

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Disable);
        await customAppsPage.customAppsComponent.clickDialogButton('Disable', 'Confirm disable');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisabledMessage(appName));

        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_ENABLE_APP);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const trelloApp = CUSTOM_APPS_TEST_DATA.TRELLO_API_TOKEN_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Trello Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Trello Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(trelloApp.CATEGORY);
        await customAppsPage.uploadLogoFile(trelloApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(trelloApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(trelloApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, trelloApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.API_TOKEN_LABEL, trelloApp.API_TOKEN_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.AUTHORIZATION_HEADER, trelloApp.AUTHORIZATION_HEADER);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.enterAPIToken(CREDENTIALS.TRELLO.API_TOKEN);

        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(appName));

        await customAppsPage.verifyStatusBadge('Enabled');

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Disable);
        await customAppsPage.customAppsComponent.clickDialogButton('Disable', 'Confirm disable');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisabledMessage(appName));

        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);
        await customAppsPage.scrollPageBy(100);
        await customAppsPage.verifyChecklistItemIsUnchecked(MESSAGES.CHECKLIST_ENABLE_APP);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const jiraApp = CUSTOM_APPS_TEST_DATA.JIRA_BASIC_AUTH_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Jira Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Jira Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(jiraApp.CATEGORY);
        await customAppsPage.uploadLogoFile(jiraApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(jiraApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(jiraApp.AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, jiraApp.BASE_URL);
        await customAppsPage.enterFieldValue(fieldLabels.USERNAME_LABEL, jiraApp.USERNAME_LABEL);
        await customAppsPage.enterFieldValue(fieldLabels.PASSWORD_LABEL, jiraApp.PASSWORD_LABEL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.enterCredentials(CREDENTIALS.JIRA.USERNAME, CREDENTIALS.JIRA.PASSWORD);

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickButton('Custom apps');

        await customAppsPage.searchForApps(appName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(appName);

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();

        await customAppsPage.verifyFieldIsEnabled('name');
        await customAppsPage.verifyFieldIsEnabled('description');
        await customAppsPage.verifyDropdownIsEnabled('category');

        await customAppsPage.selectAppCategory('Support & Ticketing');

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyDropdownIsDisabled('connectionType');
        await customAppsPage.verifyDropdownIsDisabled('authType');
        await customAppsPage.verifyFieldIsDisabled('authDetails.baseUrl');

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyFieldIsEnabled('authDetails.usernameLabel');
        await customAppsPage.verifyFieldIsEnabled('authDetails.passwordLabel');

        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));

        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const boxApp = CUSTOM_APPS_TEST_DATA.BOX_DELETE_ENABLED_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Box Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Box Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(boxApp.CATEGORY);
        await customAppsPage.uploadLogoFile(boxApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(boxApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(boxApp.AUTH_TYPE);
        await customAppsPage.selectSubAuthType(boxApp.SUB_AUTH_TYPE);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, boxApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, boxApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, boxApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, boxApp.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, boxApp.BASE_URL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.connectBoxAccount(CREDENTIALS.BOX.EMAIL, CREDENTIALS.BOX.PASSWORD);

        await customAppsPage.verifyTextIsDisplayed(appDescription);

        await customAppsPage.clickButton('Custom apps');

        await customAppsPage.searchForApps(appName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(appName);

        await customAppsPage.verifyChecklistItemIsChecked(MESSAGES.CHECKLIST_CONNECT_APP_LEVEL);

        await customAppsPage.clickEditFromMenu();

        await customAppsPage.verifyFieldIsEnabled('name');
        await customAppsPage.verifyFieldIsEnabled('description');
        await customAppsPage.verifyDropdownIsEnabled('category');

        await customAppsPage.selectAppCategory('Support & Ticketing');

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyDropdownIsDisabled('connectionType');
        await customAppsPage.verifyDropdownIsDisabled('authType');
        await customAppsPage.verifyDropdownIsDisabled('subAuthType');
        await customAppsPage.verifyFieldIsDisabled('authDetails.clientId');

        await customAppsPage.scrollPageBy(300);
        await customAppsPage.verifyFieldIsDisabled('authDetails.clientSecret');
        await customAppsPage.verifyFieldIsDisabled('authDetails.authUrl');
        await customAppsPage.verifyFieldIsDisabled('authDetails.tokenUrl');
        await customAppsPage.verifyFieldIsDisabled('authDetails.baseUrl');

        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppSettingsUpdatedMessage(appName));

        await customAppsPage.verifyTextIsDisplayed(MESSAGES.ACCOUNT_CONNECTION_MESSAGE(appName));

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const auth0App = CUSTOM_APPS_TEST_DATA.AUTH0_PKCE_PLAIN_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(auth0App.CATEGORY);
        await customAppsPage.uploadLogoFile(auth0App.LOGO_FILE);
        await customAppsPage.selectConnectionType(auth0App.CONNECTION_TYPE);
        await customAppsPage.selectSubAuthType(auth0App.SUB_AUTH_TYPE);
        await customAppsPage.selectCodeChallengeMethod(auth0App.CODE_CHALLENGE_METHOD);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, auth0App.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, auth0App.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, auth0App.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, auth0App.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, auth0App.BASE_URL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.verifyTextIsDisplayed(MESSAGES.getUserLevelConnectionMessage(appName));

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const airtableApp = CUSTOM_APPS_TEST_DATA.AIRTABLE_PKCE_SHA256_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Airtable Staging Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Airtable (Staging) Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(airtableApp.CATEGORY);
        await customAppsPage.uploadLogoFile(airtableApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(airtableApp.CONNECTION_TYPE);
        await customAppsPage.selectSubAuthType(airtableApp.SUB_AUTH_TYPE);
        await customAppsPage.selectCodeChallengeMethod(airtableApp.CODE_CHALLENGE_METHOD);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, airtableApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, airtableApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, airtableApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, airtableApp.TOKEN_URL);

        await customAppsPage.scrollPageBy(200);
        await customAppsPage.checkAddHeadersForTokenUrl();
        await customAppsPage.enterTokenRequestHeaders(airtableApp.TOKEN_REQUEST_HEADERS);

        await customAppsPage.scrollPageBy(200);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, airtableApp.BASE_URL);

        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

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

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
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
        const auth0App = CUSTOM_APPS_TEST_DATA.AUTH0_PKCE_PLAIN_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(auth0App.CATEGORY);
        await customAppsPage.uploadLogoFile(auth0App.LOGO_FILE);
        await customAppsPage.selectConnectionType(auth0App.CONNECTION_TYPE);
        await customAppsPage.selectSubAuthType(auth0App.SUB_AUTH_TYPE);
        await customAppsPage.selectCodeChallengeMethod(auth0App.CODE_CHALLENGE_METHOD);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, auth0App.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, auth0App.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, auth0App.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, auth0App.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, auth0App.BASE_URL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');

        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();

        await customAppsPage.searchForApps(appName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(appName);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
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
        const auth0App = CUSTOM_APPS_TEST_DATA.AUTH0_PKCE_PLAIN_APP;
        const fieldLabels = CUSTOM_APPS_TEST_DATA.FIELD_LABELS;

        const appName = `Auth0 Custom Test ${faker.string.alphanumeric({ length: 6 })}`;
        const appDescription = `Auth0 Custom App Description ${faker.lorem.sentence()}`;
        createdAppName = appName;

        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        await customAppsPage.selectAppCategory(auth0App.CATEGORY);
        await customAppsPage.uploadLogoFile(auth0App.LOGO_FILE);
        await customAppsPage.selectConnectionType(auth0App.CONNECTION_TYPE);
        await customAppsPage.selectSubAuthType(auth0App.SUB_AUTH_TYPE);
        await customAppsPage.selectCodeChallengeMethod(auth0App.CODE_CHALLENGE_METHOD);

        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, auth0App.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, auth0App.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, auth0App.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, auth0App.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, auth0App.BASE_URL);

        await customAppsPage.scrollPageBy(200);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(appName));

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Enable);
        await customAppsPage.customAppsComponent.clickDialogButton('Enable', 'Confirm enable');

        await customAppsPage.loadPage();
        await customAppsPage.verifyThePageIsLoaded();

        await customAppsPage.searchForApps(appName);
        await customAppsPage.customAppsComponent.clickOnAppConnector(appName);

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Disable);
        await customAppsPage.customAppsComponent.clickDialogButton('Disable', 'Confirm disable');

        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisabledMessage(appName));

        await customAppsPage.customAppsComponent.selectConnectorOption(AppConnectorOptions.Delete);
        await customAppsPage.customAppsComponent.clickDialogButton('Delete', 'Confirm delete');
        await customAppsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(appName));
        createdAppName = null;
      }
    );
  }
);
