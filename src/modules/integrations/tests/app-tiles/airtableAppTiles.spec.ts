import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { faker } from '@faker-js/faker';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { createAirtableTileViaApi } from '@integrations-api/helpers/tileApiHelpers';
import { AIRTABLE_TILE } from '@integrations-test-data/app-tiles.test-data';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

test.describe(
  'Airtable App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ homeDashboard }) => {
      if (createdTileTitle) {
        await homeDashboard.removeTileThroughApi(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'Verify Personalize button functionality for user defined view tasks in Airtable app tile',
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
      'Verify app manager is able to edit display content calendar tasks in Airtable apptile on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24130',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;

        //add,edit,verify
        await createAirtableTileViaApi(page, { tileInstanceName: createdTileTitle });
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
      'Verify site manager is able to edit and remove a display content calendar tile on Site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24182',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
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
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
      }
    );
  }
);
