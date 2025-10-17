import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags, TEST_TAGS } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { tagTest } from '@core/utils/testDecorator';

import { AppConnectorOptions } from '../../ui/components/customAppsListComponent';
import { CustomAppsIntegrationPage } from '../../ui/pages/customAppsIntegrationPage';

import { APP_LABELS, FIELD_NAMES, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import {
  CONNECTOR_IDS,
  EXPENSIFY_CREDS,
  EXPENSIFY_VALUES,
  REDIRECT_URLS,
  STATUS_VALUES,
  TILE_IDS,
} from '@/src/modules/integrations/test-data/app-tiles.test-data';
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
      'create and edit Expensify tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
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
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
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
          zephyrTestId: 'INT-24666',
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
          zephyrTestId: 'INT-24662',
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
  }
);
