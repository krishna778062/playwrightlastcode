import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { tagTest } from '@core/utils/testDecorator';

import { FIELD_NAMES, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { HomeDashboard } from '@/src/modules/integrations/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/pages/siteDashboard';
import { CONNECTOR_IDS, REDIRECT_URLS, STATUS_VALUES } from '@/src/modules/integrations/test-data/app-tiles.test-data';

const expensifyUser: UserCredentials = {
  email: process.env.QA_SYSTEM_ADMIN_USERNAME!,
  password: process.env.QA_SYSTEM_ADMIN_PASSWORD!,
};

const AppName = 'Expensify';
const tileName = 'Display expense reports';

test.describe(
  'Expensify App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.EXPENSIFY, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    test.beforeEach(async ({ page }) => {
      await LoginHelper.loginWithPassword(page, expensifyUser);
    });

    test.afterEach(async ({ page, tileManagementHelper }) => {
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        await homeDashboard.removeTileThroughApi(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'Create and edit Expensify tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24799',
          storyId: 'INT-24430',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.createAppTileViaApi(createdTileTitle, CONNECTOR_IDS.EXPENSIFY);
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
      'Verify Expensify report tile data structure',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24798',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.createAppTileViaApi(createdTileTitle, CONNECTOR_IDS.EXPENSIFY);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify the Expensify report data structure
        await homeDashboard.verifyExpensifyReportData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.EXPENSIFY);
      }
    );

    test(
      'Verify personlize button functionality for Expensify report tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ page, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24785',
          storyId: 'INT-24423',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addTilewithPersonalizeExpensify(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.APPROVED);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.APPROVED);
      }
    );

    test(
      'Verify site manager is able to edit and remove an Expensify tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page, siteManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24782',
          storyId: 'INT-24423',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
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
      }
    );
  }
);
