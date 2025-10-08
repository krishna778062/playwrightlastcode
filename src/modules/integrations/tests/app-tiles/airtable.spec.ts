import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';
import { AIRTABLE_TILE, REDIRECT_URLS } from '@integrations-test-data/app-tiles.test-data';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { createAirtableTileViaApi } from '@/src/modules/integrations/apis/helpers/tileApiHelpers';

test.describe(
  'airtable App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ homeDashboard, tileManagementHelper }) => {
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify Personalize button functionality for user defined view tasks in Airtable app tile',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24188',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addAirtableTile(createdTileTitle, homeDashboard.config, UI_ACTIONS.ADD_TO_HOME);
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.personalizeTileSorting(createdTileTitle, AIRTABLE_TILE.SORT_BY, AIRTABLE_TILE.SORT_ORDER);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyTileAscending(createdTileTitle);
      }
    );

    test(
      'verify app manager is able to edit display content calendar tasks in Airtable apptile on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, appManagerApiContext }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24130',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;

        //add,edit,verify
        await createAirtableTileViaApi(appManagerApiContext, { tileInstanceName: createdTileTitle });
        await homeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'verify site manager is able to edit and remove a display content calendar tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiContext }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24182',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addAirtableTile(createdTileTitle, homeDashboard.config, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        // Verify tile content structure
        await siteDashboard.verifyAirtableTileContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.AIRTABLE);
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify Airtable tile displays task records with proper content structure',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ homeDashboard, appManagerApiContext }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24189',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable task records ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile and verify content structure
        await createAirtableTileViaApi(appManagerApiContext, { tileInstanceName: createdTileTitle });
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifyAirtableTileContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.AIRTABLE);
      }
    );
  }
);
