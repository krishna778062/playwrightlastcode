import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { REDIRECT_URLS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import {
  CONNECTOR_IDS,
  TILE_IDS,
  UKG_PRO_INSTANCE_URL,
} from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'UKG PRO App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.UKG_PRO, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'UKG Pro';
    const DisplayTimeOffBalance = 'Display Time Off Balance';

    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ tileManagementHelper, homeDashboard }) => {
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'create and edit UKG Pro Display Recent Paystubs tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-21114', 'INT-21086'],
          storyId: 'INT-20795',
        });

        createdTileTitle = `UKG Pro Display Recent Paystubs ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTileWithSettings(
          createdTileTitle,
          TILE_IDS.UKG_PRO_DISPLAY_RECENT_PAYSTUBS,
          CONNECTOR_IDS.UKG_PRO,
          { instanceUrl: UKG_PRO_INSTANCE_URL }
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'verify metadata for UKG Pro Display recent paystubs tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-21137', 'INT-21151'],
          storyId: 'INT-20795',
        });

        createdTileTitle = `UKG Pro Display recent paystubs ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTileWithSettings(
          createdTileTitle,
          TILE_IDS.UKG_PRO_DISPLAY_RECENT_PAYSTUBS,
          CONNECTOR_IDS.UKG_PRO,
          { instanceUrl: UKG_PRO_INSTANCE_URL }
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify the tile metadata including pay periods, received dates, and links
        await homeDashboard.verifyUKGProTileMetadata(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.UKG_PRO);
      }
    );

    test(
      'create and edit UKG Pro Display Time Off Balance tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-21085', 'INT-21084'],
          storyId: 'INT-20795',
        });

        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.UKG_PRO_DISPLAY_TIMEOFF_BALANCE,
          CONNECTOR_IDS.UKG_PRO
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'create and verify metadata for UKG Pro Display Time Off Balance tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-21134', 'INT-21133'],
          storyId: 'INT-20795',
        });

        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.UKG_PRO_DISPLAY_TIMEOFF_BALANCE,
          CONNECTOR_IDS.UKG_PRO
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyDisplayTimeOffMetadata(createdTileTitle);
      }
    );

    test(
      'create ,edit and remove UKG Pro Display Time Off Balance tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, siteManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-21087'],
          storyId: 'INT-20795',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
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
      'create and verify metadata for UKG Pro Display Time Off Balance tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, siteManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-21088',
          storyId: 'INT-20795',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyDisplayTimeOffMetadata(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
