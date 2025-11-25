import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags, TEST_TAGS } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ACTION_LABELS, APP_LABELS, UI_ACTIONS } from '../../constants/common';
import { GREENHOUSE_VALUES } from '../../test-data/app-tiles.test-data';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { GREENHOUSE_CREDS, REDIRECT_URLS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { AppConnectorOptions } from '@/src/modules/integrations/ui/components/customAppsListComponent';
import { CustomAppsIntegrationPage } from '@/src/modules/integrations/ui/pages/customAppsIntegrationPage';

test.describe(
  'greenhouse App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.GREENHOUSE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Greenhouse';
    const tileName = 'Display job postings';
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ appManagerFixture }) => {
      const { homeDashboard, tileManagementHelper } = appManagerFixture;
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });
    test(
      'verify app manager is able to add and connect Greenhouse in Custom Apps',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { page } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25932'],
          storyId: 'INT-24587',
        });
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);

        // Navigate to Manage->Integrations->Custom page
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(AppName, AppConnectorOptions.Delete);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(AppName));
        await customIntegrationsPage.addPrebuiltApp(AppName);
        await customIntegrationsPage.clickSaveButton();
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(AppName));
        await customIntegrationsPage.enterAPIToken(GREENHOUSE_CREDS.API_Token);
        await customIntegrationsPage.openConnectorOptions(ACTION_LABELS.ENABLE);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(AppName));
      }
    );

    test.fixme(
      'verify App Admin is able to add Greenhouse job postings from a tile on Home Dashboard with All selected for Job Type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25356', 'INT-25368', 'INT-25370'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_HOME,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.ALL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test(
      'verify App Admin is able to add Greenhouse job postings from a tile on Home Dashboard with App Manager Defined as External',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25358'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test(
      'verify App Admin is able to add Greenhouse job postings from a tile on Home Dashboard with App Manager Defined as Internal',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25360'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.INTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test.fixme(
      'verify App Admin is able to add Greenhouse job postings from a tile on Site Dashboard with All selected for Job Type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28629', 'INT-28631'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_SITE,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.ALL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        createdTileTitle = undefined;
      }
    );
    test(
      'verify App Admin is able to add Greenhouse job postings from a tile on Site Dashboard with App Manager Defined as External',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28630'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        createdTileTitle = undefined;
      }
    );
    test(
      'verify UI layout for Greenhouse App Tiles on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28686', 'INT-28687', 'INT-25372'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifyGreenhouseContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GREENHOUSE);
      }
    );
    test(
      'verify UI layout for Greenhouse App Tiles on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28688', 'INT-28689'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifyGreenhouseContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GREENHOUSE);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify Show more is visible after 4 courses for pending learning courses from Greenhouse on a tile',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28910',
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
    test(
      'verify Show more is visible after 4 courses for pending learning courses from Greenhouse on a tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28911',
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify add tile modal for greenhouse app tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29197'],
          storyId: 'INT-24587',
        });

        //add, verify
        await homeDashboard.openAddAppTileModal(AppName);
        //Verify add to home button is disabled
        await homeDashboard.verifyButtonStatus(UI_ACTIONS.DISABLED, UI_ACTIONS.ADD_TO_HOME);
        // Click on app settings which opens in a new tab
        const newPage = await homeDashboard.clickDialogLinkAndGetNewPage(ACTION_LABELS.APP_SETTINGS);

        // Create a new instance of CustomAppsIntegrationPage with the new page context
        const customAppsPageInNewTab = new CustomAppsIntegrationPage(newPage);

        // Verify the Greenhouse app settings page in the new tab
        await customAppsPageInNewTab.verifyGreenhouseSettingsPage();

        // Close the new tab after verification
        await newPage.close();
      }
    );
    test(
      'when App Manager Disabling a connector removes its tiles',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, page } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29194'],
          storyId: 'INT-24587',
        });

        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);

        // Disable the connector
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(AppName, AppConnectorOptions.Disable);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisabledMessage(AppName));
        await homeDashboard.loadPage();
        await homeDashboard.verifyTileRemoved(createdTileTitle);

        // Re-enable the connector
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithName(AppName);
        await customIntegrationsPage.enterAPIToken(GREENHOUSE_CREDS.API_Token);

        // Enable the connector
        await customIntegrationsPage.openConnectorOptions(APP_LABELS.ENABLE_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(AppName));
        await homeDashboard.loadPage();
        await homeDashboard.isTilePresent(createdTileTitle);
      }
    );
    test(
      'disconnect greenhouse and verify tile shows unavailable connection message',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, page } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29196'],
          storyId: 'INT-24587',
        });

        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;
        //add tile and verify
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);
        // Disconnect the app
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.disconnectApp(AppName);
        await customIntegrationsPage.verifyDisconnectDialogContent(AppName);
        await customIntegrationsPage.clickOnButtonWithName(APP_LABELS.DISCONNECT_ACCOUNT_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisconnectedMessage(AppName));
        // Verify Greenhouse setup checklist - Connect is incomplete, Enable is completed
        await customIntegrationsPage.verifySetupChecklistSteps([
          { text: 'Connect the app-level account', status: 'incomplete' },
          { text: 'Enable the app', status: 'completed' },
        ]);
        // Verify tile shows unavailable connection message
        await homeDashboard.loadPage();
        await homeDashboard.verifyTileMessage(createdTileTitle, MESSAGES.getAppConnectionUnavailableMessage(AppName));
        // Re-connect the connector
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithName(AppName);
        await customIntegrationsPage.enterAPIToken(GREENHOUSE_CREDS.API_Token);
        await homeDashboard.loadPage();
        await homeDashboard.isTilePresent(createdTileTitle);
      }
    );
    test(
      'verify disabling greenhouse connector removes tiles and moves app to available apps',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, page } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29198'],
          storyId: 'INT-24587',
        });

        const customIntegrationsPage = new CustomAppsIntegrationPage(page);

        // Disable the connector
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(AppName, AppConnectorOptions.Disable);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisabledMessage(AppName));
        // Verify fields are empty and Save button is disabled
        await customIntegrationsPage.verifyFieldsEmptyAndSaveDisabled(AppName, [
          { fieldName: 'apiToken', fieldLabel: 'API Token' },
        ]);

        // Verify Greenhouse setup checklist - Connect is incomplete, Enable is completed
        await customIntegrationsPage.verifySetupChecklistSteps([
          { text: 'Connect the app-level account', status: 'incomplete' },
          { text: 'Enable the app', status: 'incomplete' },
        ]);

        await homeDashboard.loadPage();
        await homeDashboard.openAddAppTile();

        // Verify Greenhouse is not available in enabled apps
        await homeDashboard.verifyAppNotInEnabledApps(AppName);

        // Verify Greenhouse is available in available apps
        await homeDashboard.verifyAppInAvailableApps(AppName);

        // Click on Expensify in available apps to navigate to custom apps page in new tab
        const newPage = await homeDashboard.clickAppInAvailableAppsAndGetNewPage(AppName);

        // Create a new instance of CustomAppsIntegrationPage with the new page context
        const customAppsPageInNewTab = new CustomAppsIntegrationPage(newPage);

        // Verify the custom apps page is loaded with Expensify
        await customAppsPageInNewTab.verifyAppSettingsPageLoaded(AppName);

        // Enter credentials in the new tab
        await customAppsPageInNewTab.enterAPIToken(GREENHOUSE_CREDS.API_Token);

        // Enable the connector in the new tab
        await customAppsPageInNewTab.openConnectorOptions(APP_LABELS.ENABLE_LABEL);
        await customAppsPageInNewTab.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(AppName));

        // Close the new tab after enabling
        await newPage.close();

        // Reload the home dashboard
        await homeDashboard.loadPage();
      }
    );
  }
);
