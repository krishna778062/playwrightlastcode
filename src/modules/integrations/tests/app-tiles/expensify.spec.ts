import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags, TEST_TAGS } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { tagTest } from '@core/utils/testDecorator';

import { ACTION_LABELS, APP_LABELS, FIELD_NAMES, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import {
  CONNECTOR_IDS,
  EXPENSIFY_CREDS,
  EXPENSIFY_VALUES,
  REDIRECT_URLS,
  STATUS_VALUES,
  TILE_IDS,
} from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { AppConnectorOptions } from '@/src/modules/integrations/ui/components/customAppsListComponent';
import { CustomAppsIntegrationPage } from '@/src/modules/integrations/ui/pages/customAppsIntegrationPage';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

const expensifyUser: UserCredentials = {
  email: process.env.QA_SYSTEM_ADMIN_USERNAME!,
  password: process.env.QA_SYSTEM_ADMIN_PASSWORD!,
};

test.describe(
  'expensify App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.EXPENSIFY, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Expensify';
    const tileName = 'Display expense reports';
    const { WORKSPACE, STATUS, DURATION, PROCESSING, APPROVER, MAX_DAYS, WORKSPACE_VALUE } = EXPENSIFY_VALUES;
    let createdTileTitle: string | undefined = undefined;

    test.beforeEach(async ({ page }) => {
      await LoginHelper.loginWithPassword(page, expensifyUser);
    });

    test.afterEach(async ({ page, appManagerApiFixture }) => {
      const { tileManagementHelper } = appManagerApiFixture;
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify that App Manager is able to connect Expensify from Manage->Integrations',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25946',
          storyId: 'INT-24423',
        });
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);

        // Navigate to Manage->Integrations->Custom page
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(AppName, AppConnectorOptions.Delete);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDeletedMessage(AppName));
        await customIntegrationsPage.addPrebuiltApp(AppName);
        await customIntegrationsPage.clickSaveButton();
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppAddedMessage(AppName));
        await customIntegrationsPage.enterCredentials(EXPENSIFY_CREDS.USER_ID, EXPENSIFY_CREDS.USER_SECRET);
        await customIntegrationsPage.openConnectorOptions(ACTION_LABELS.ENABLE);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(AppName));
      }
    );

    test(
      'create and edit Expensify tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24799',
          storyId: 'INT-24430',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.EXPENSIFY_REPORT,
          CONNECTOR_IDS.EXPENSIFY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'verify Expensify report tile data structure',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24798',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_HOME);
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify the Expensify report data structure
        await homeDashboard.verifyExpensifyReportData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.EXPENSIFY);
      }
    );

    test(
      'verify personlize button functionality for Expensify report tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24785',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addTilewithPersonalizeSingleField(createdTileTitle, AppName, tileName, FIELD_NAMES.STATUS);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.APPROVED);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.APPROVED);
      }
    );

    test(
      'verify site manager is able to edit and remove an Expensify tile on Site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24782',
          storyId: 'INT-24423',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyExpensifyReportData(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.EXPENSIFY);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behaviour for display expensify tasks apptile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24784',
          storyId: 'INT-23049',
        });
        createdTileTitle = `Display expensify tasks ${faker.string.alphanumeric({ length: 6 })}`;
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.EXPENSIFY_REPORT,
          CONNECTOR_IDS.EXPENSIFY
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 expensify reports and then click on show more button and verify all expensify reports are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify Personalize button is visible when clicked on Show more',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE, TEST_TAGS.PERSONALIZATION],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28332',
          storyId: 'INT-23049',
        });
        createdTileTitle = `Display expensify tasks ${faker.string.alphanumeric({ length: 6 })}`;
        //add,personalize,edit,verify
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        await homeDashboard.addTilewithPersonalizeSingleField(createdTileTitle, AppName, tileName, FIELD_NAMES.STATUS);
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 expensify reports and then click on show more button and verify all expensify reports are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );

    test(
      'verify show more behaviour for display expensify tasks apptile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24782',
          storyId: 'INT-24423',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify personalize button is visible when clicked on show more for display expensify tasks apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29068',
          storyId: 'INT-24423',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTilewithPersonalizeSingleField(createdTileTitle, AppName, tileName, FIELD_NAMES.STATUS);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verfiy App Manager Disabling a connector removes its tiles from home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24579',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.EXPENSIFY_REPORT,
          CONNECTOR_IDS.EXPENSIFY
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
        await customIntegrationsPage.enterCredentials(EXPENSIFY_CREDS.USER_ID, EXPENSIFY_CREDS.USER_SECRET);

        // Enable the connector
        await customIntegrationsPage.openConnectorOptions(APP_LABELS.ENABLE_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(AppName));
        await homeDashboard.loadPage();
        await homeDashboard.isTilePresent(createdTileTitle);
      }
    );

    test(
      'verify users should be able to display expensify reports from expensify on a tile on Home dashboard - user manager defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29069',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithUserDefinedOptions(
          createdTileTitle,
          AppName,
          tileName,
          WORKSPACE,
          STATUS,
          DURATION,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.personalizeTileWithDropdowns(
          createdTileTitle,
          WORKSPACE,
          WORKSPACE_VALUE,
          STATUS,
          PROCESSING,
          DURATION,
          MAX_DAYS.toString()
        );
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyPersonalizedExpensifyReportData(createdTileTitle, PROCESSING, APPROVER, MAX_DAYS);
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify users should be able to display expensify reports from expensify on a tile on site dashboard - user manager defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29070',
          storyId: 'INT-24423',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTileWithUserDefinedOptions(
          createdTileTitle,
          AppName,
          tileName,
          WORKSPACE,
          STATUS,
          DURATION,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.personalizeTileWithDropdowns(
          createdTileTitle,
          WORKSPACE,
          WORKSPACE_VALUE,
          STATUS,
          PROCESSING,
          DURATION,
          MAX_DAYS.toString()
        );
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyPersonalizedExpensifyReportData(createdTileTitle, PROCESSING, APPROVER, MAX_DAYS);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify users should be able to display expensify reports from expensify on a tile on Home dashboard - App manager defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        tagTest(test.info(), {
          zephyrTestId: 'INT-29071',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithAppManagerDefined(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_HOME,
          WORKSPACE,
          WORKSPACE_VALUE,
          STATUS,
          PROCESSING,
          DURATION,
          MAX_DAYS.toString()
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizedExpensifyReportData(createdTileTitle, PROCESSING, APPROVER, MAX_DAYS);
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify users should be able to display expensify reports from expensify on a tile on site dashboard - site manager defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29072',
          storyId: 'INT-24423',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTileWithSiteManagerDefined(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_SITE,
          WORKSPACE,
          WORKSPACE_VALUE,
          STATUS,
          PROCESSING,
          DURATION,
          MAX_DAYS.toString()
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyPersonalizedExpensifyReportData(createdTileTitle, PROCESSING, APPROVER, MAX_DAYS);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'disconnect expensify and verify tile shows unavailable connection message',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28878',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;
        // Add tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.EXPENSIFY_REPORT,
          CONNECTOR_IDS.EXPENSIFY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);
        // Disconnect the app
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.disconnectApp(AppName);
        await customIntegrationsPage.verifyDisconnectDialogContent(AppName);
        await customIntegrationsPage.clickOnButtonWithName(APP_LABELS.DISCONNECT_ACCOUNT_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisconnectedMessage(AppName));
        // Verify Expensify setup checklist - Connect is incomplete, Enable is completed
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
        await customIntegrationsPage.enterCredentials(EXPENSIFY_CREDS.USER_ID, EXPENSIFY_CREDS.USER_SECRET);
        await homeDashboard.loadPage();
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyExpensifyReportData(createdTileTitle);
      }
    );

    test(
      'verify add tile modal for expensify apptile on home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        tagTest(test.info(), {
          zephyrTestId: 'INT-28879',
          storyId: 'INT-13643',
        });

        //add, verify
        await homeDashboard.openAddAppTileModal(AppName);
        // Verify Expensify connection status with username
        await homeDashboard.verifyConnectorConnectionStatus('expensify', EXPENSIFY_CREDS.USER_ID);
        //Verify add to home button is disabled
        await homeDashboard.verifyButtonStatus(UI_ACTIONS.DISABLED, UI_ACTIONS.ADD_TO_HOME);
        // Click on app settings which opens in a new tab
        const newPage = await homeDashboard.clickDialogLinkAndGetNewPage(ACTION_LABELS.APP_SETTINGS);

        // Create a new instance of CustomAppsIntegrationPage with the new page context
        const customAppsPageInNewTab = new CustomAppsIntegrationPage(newPage);

        // Verify the Expensify app settings page in the new tab
        await customAppsPageInNewTab.verifyExpensifySettingsPage(EXPENSIFY_CREDS.USER_ID);

        // Close the new tab after verification
        await newPage.close();
      }
    );

    test(
      'verify disabling Expensify connector removes tiles and moves app to available apps',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28880',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);

        // Disable the connector
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(AppName, AppConnectorOptions.Disable);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisabledMessage(AppName));
        // Verify fields are empty and Save button is disabled
        await customIntegrationsPage.verifyFieldsEmptyAndSaveDisabled(AppName, [
          { fieldName: 'username', fieldLabel: 'Partner user ID' },
          { fieldName: 'password', fieldLabel: 'Partner user secret' },
        ]);

        // Verify Expensify setup checklist - Connect is incomplete, Enable is completed
        await customIntegrationsPage.verifySetupChecklistSteps([
          { text: 'Connect the app-level account', status: 'incomplete' },
          { text: 'Enable the app', status: 'incomplete' },
        ]);

        await homeDashboard.loadPage();
        await homeDashboard.openAddAppTile();

        // Verify Expensify is not available in enabled apps
        await homeDashboard.verifyAppNotInEnabledApps(AppName);

        // Verify Expensify is available in available apps
        await homeDashboard.verifyAppInAvailableApps(AppName);

        // Click on Expensify in available apps to navigate to custom apps page in new tab
        const newPage = await homeDashboard.clickAppInAvailableAppsAndGetNewPage(AppName);

        // Create a new instance of CustomAppsIntegrationPage with the new page context
        const customAppsPageInNewTab = new CustomAppsIntegrationPage(newPage);

        // Verify the custom apps page is loaded with Expensify
        await customAppsPageInNewTab.verifyAppSettingsPageLoaded(AppName);

        // Enter credentials in the new tab
        await customAppsPageInNewTab.enterCredentials(EXPENSIFY_CREDS.USER_ID, EXPENSIFY_CREDS.USER_SECRET);

        // Enable the connector in the new tab
        await customAppsPageInNewTab.openConnectorOptions(APP_LABELS.ENABLE_LABEL);
        await customAppsPageInNewTab.verifyToastMessageIsVisibleWithText(MESSAGES.getAppEnabledMessage(AppName));

        // Close the new tab after enabling
        await newPage.close();

        // Reload the home dashboard
        await homeDashboard.loadPage();
      }
    );

    test(
      'verify tile shows error message when invalid credentials are entered',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, 'INT-29202'],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29202',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create tile first
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.EXPENSIFY_REPORT,
          CONNECTOR_IDS.EXPENSIFY
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Navigate to custom integrations page and enter invalid credentials
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.disconnectApp(AppName);
        await customIntegrationsPage.verifyDisconnectDialogContent(AppName);
        await customIntegrationsPage.clickOnButtonWithName(APP_LABELS.DISCONNECT_ACCOUNT_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisconnectedMessage(AppName));

        // Enter invalid credentials
        const invalidUserId = 'invalid_user_id';
        const invalidUserSecret = 'invalid_user_secret';
        await customIntegrationsPage.enterCredentials(invalidUserId, invalidUserSecret);

        // Navigate back to home dashboard and verify error message
        await homeDashboard.loadPage();
        await homeDashboard.verifyTileMessage(createdTileTitle, MESSAGES.INVALID_CONNECTION_MESSAGE);

        // Re-connect the connector
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.disconnectApp(AppName);
        await customIntegrationsPage.verifyDisconnectDialogContent(AppName);
        await customIntegrationsPage.clickOnButtonWithName(APP_LABELS.DISCONNECT_ACCOUNT_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisconnectedMessage(AppName));
        await customIntegrationsPage.enterCredentials(EXPENSIFY_CREDS.USER_ID, EXPENSIFY_CREDS.USER_SECRET);
      }
    );

    test(
      'verify tile shows error message after changing valid credentials to invalid',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, 'INT-29201'],
      },
      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29201',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);

        // Create tile with valid credentials
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.EXPENSIFY_REPORT,
          CONNECTOR_IDS.EXPENSIFY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyExpensifyReportData(createdTileTitle);

        // Change credentials to invalid
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.disconnectApp(AppName);
        await customIntegrationsPage.verifyDisconnectDialogContent(AppName);
        await customIntegrationsPage.clickOnButtonWithName(APP_LABELS.DISCONNECT_ACCOUNT_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisconnectedMessage(AppName));
        const invalidUserId = 'invalid_user_id';
        const invalidUserSecret = 'invalid_user_secret';
        await customIntegrationsPage.enterCredentials(invalidUserId, invalidUserSecret);

        // Navigate back to home dashboard and verify error message
        await homeDashboard.loadPage();
        await homeDashboard.verifyTileMessage(createdTileTitle, MESSAGES.INVALID_CONNECTION_MESSAGE);

        // Re-connect the connector
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.disconnectApp(AppName);
        await customIntegrationsPage.verifyDisconnectDialogContent(AppName);
        await customIntegrationsPage.clickOnButtonWithName(APP_LABELS.DISCONNECT_ACCOUNT_LABEL);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(MESSAGES.getAppDisconnectedMessage(AppName));
        await customIntegrationsPage.enterCredentials(EXPENSIFY_CREDS.USER_ID, EXPENSIFY_CREDS.USER_SECRET);
        await homeDashboard.loadPage();
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyExpensifyReportData(createdTileTitle);
      }
    );
  }
);
