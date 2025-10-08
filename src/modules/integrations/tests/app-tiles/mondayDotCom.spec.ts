import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';
import { REDIRECT_URLS } from '@integrations-test-data/app-tiles.test-data';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { CONNECTOR_IDS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'Monday.com App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.MONDAY_DOT_COM, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Monday.com';
    const tileName = 'Display tasks';
    const BoardId = '1989305217';
    const BoardIdOption = 'Board ID';
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ homeDashboard, tileManagementHelper }) => {
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify app/site manager is able to edit Display tasks App tile  on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25171',
          storyId: 'INT-24586',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Monday.com tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await tileManagementHelper.createIntegrationAppTileWithSettings(
          createdTileTitle,
          TILE_IDS.MONDAY_DOT_COM_DISPLAY_TASKS,
          CONNECTOR_IDS.MONDAY_DOT_COM,
          { boardId: BoardId }
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
      'verify app/site manager is able to edit Display tasks App tile  on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, siteManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25172',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `Monday.com tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          tileName,
          BoardIdOption,
          BoardId,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
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
      'verify "Display tasks" details are visible on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25170',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `Monday.com tasks ${faker.string.alphanumeric({ length: 6 })}`;

        //add and verify tile
        await tileManagementHelper.createIntegrationAppTileWithSettings(
          createdTileTitle,
          TILE_IDS.MONDAY_DOT_COM_DISPLAY_TASKS,
          CONNECTOR_IDS.MONDAY_DOT_COM,
          { boardId: BoardId }
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifyMondayDotComContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.MONDAY_DOT_COM);
      }
    );
    test(
      'verify "Display tasks" details are visible on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ siteDashboard, siteManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25169',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `Monday.com tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and verify tile
        await siteDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          tileName,
          BoardIdOption,
          BoardId,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifyMondayDotComContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.MONDAY_DOT_COM);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
  }
);
