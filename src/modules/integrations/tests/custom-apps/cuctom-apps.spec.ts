import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CUSTOM_APPS_TEST_DATA } from '@/src/modules/integrations/test-data/customApps.test-data';
import {
  CustomAppsIntegrationPage,
  CustomAppType,
} from '@/src/modules/integrations/ui/pages/customAppsIntegrationPage';

test.describe(
  'custom apps management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APPS, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);
      await customAppsPage.loadPage();
      await customAppsPage.verifyThePageIsLoaded();
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

        // Search for an existing app and verify it appears in results
        await customAppsPage.searchForApps('Airtable');
        await customAppsPage.verifyAppIsDisplayedInList('Airtable');

        // Clear the search field
        await customAppsPage.clearSearch();

        // Search for a non-existent app and verify no results
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
          zephyrTestId: 'INT-XXXXX',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        // Filter by Enabled status and verify all apps are Enabled
        await customAppsPage.selectStatusFilter('Enabled');
        await customAppsPage.verifyAllAppsHaveStatus('Enabled');

        // Clear the status filter
        await customAppsPage.clearStatusFilter();

        // Filter by Disabled status and verify all apps are Disabled
        await customAppsPage.selectStatusFilter('Disabled');
        await customAppsPage.verifyAllAppsHaveStatus('Disabled');

        // Clear the status filter
        await customAppsPage.clearStatusFilter();
      }
    );

    test(
      'verify the Type filter functionality on "Custom Apps" page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-XXXXX',
        });

        const customAppsPage = new CustomAppsIntegrationPage(appManagerFixture.page);

        // Filter by Custom type and verify all apps are Custom
        await customAppsPage.selectTypeFilter('Custom');
        await customAppsPage.verifyAllAppsHaveType('Custom');

        // Clear the type filter
        await customAppsPage.clearTypeFilter();

        // Filter by Prebuilt type and verify all apps are Prebuilt
        await customAppsPage.selectTypeFilter('Prebuilt');
        await customAppsPage.verifyAllAppsHaveType('Prebuilt');

        // Clear the type filter
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

        // Sort by Name + Oldest first (A-Z)
        await customAppsPage.selectSortBy('Name');
        await customAppsPage.selectSortOrder('Oldest first');
        await customAppsPage.verifyAppsSortedAlphabeticallyAZ();

        // Sort by Name + Newest first (Z-A)
        await customAppsPage.selectSortOrder('Newest first');
        await customAppsPage.verifyAppsSortedAlphabeticallyZA();

        // Sort by Date created
        await customAppsPage.selectSortBy('Date created');
        await customAppsPage.verifyThePageIsLoaded();

        // Sort by Last used (default)
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

        // Click on Add custom app dropdown and select "Create your own app"
        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        // Enter app details
        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        // Select app category
        await customAppsPage.selectAppCategory('Other');

        // Upload logo file
        await customAppsPage.uploadLogoFile('Jira_Custom_App.jpg');

        // Verify uploaded logo details (image preview, file name, file size, delete button)
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

        // Click on Add custom app dropdown and select "Create your own app"
        await customAppsPage.clickAddCustomAppOption(CustomAppType.CREATE_OWN_APP);

        // Enter app details
        await customAppsPage.enterAppName(appName);
        await customAppsPage.enterAppDescription(appDescription);

        // Select app details
        await customAppsPage.selectAppCategory(boxApp.CATEGORY);
        await customAppsPage.uploadLogoFile(boxApp.LOGO_FILE);
        await customAppsPage.selectConnectionType(boxApp.CONNECTION_TYPE);
        await customAppsPage.selectAuthType(boxApp.AUTH_TYPE);
        await customAppsPage.selectSubAuthType(boxApp.SUB_AUTH_TYPE);

        // Enter OAuth details from test data file
        await customAppsPage.enterFieldValue(fieldLabels.CLIENT_ID, boxApp.CLIENT_ID);
        await customAppsPage.enterFieldValue(fieldLabels.SECRET_KEY, boxApp.CLIENT_SECRET);
        await customAppsPage.enterFieldValue(fieldLabels.AUTH_URL, boxApp.AUTH_URL);
        await customAppsPage.enterFieldValue(fieldLabels.TOKEN_URL, boxApp.TOKEN_URL);
        await customAppsPage.enterFieldValue(fieldLabels.BASE_URL, boxApp.BASE_URL);
        //upload logo file takes time to complete, so we need to wait for 2 seconds
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppsPage.page.waitForTimeout(2000);
        await customAppsPage.clickButton('Save');

        // Verify app added toast message
        await customAppsPage.verifyToastMessageIsVisibleWithText(`${appName} added`);

        // Connect Box account via OAuth popup
        await customAppsPage.connectBoxAccount('box2@simpplr.com', '_Simp_1234');

        // Verify connection success toast message
        await customAppsPage.verifyToastMessageIsVisibleWithText(`Connected to ${appName} successfully`);
        await customAppsPage.verifyToastMessageIsVisibleWithText(`Connected`);

        // Verify app name and description are displayed
        await customAppsPage.verifyAppNameInHeader(appName);
        await customAppsPage.verifyAppDescription(appDescription);

        // Verify Disconnect account button is displayed
        await customAppsPage.verifyDisconnectAccountButtonIsDisplayed();

        // Verify checklist item is checked
        await customAppsPage.verifyChecklistItemIsChecked('Connect the app-level account');

        // Verify connection message
        await customAppsPage.verifyConnectionMessage(appName);
      }
    );
  }
);
