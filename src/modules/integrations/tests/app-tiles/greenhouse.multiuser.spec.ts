import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GREENHOUSE_VALUES } from '../../test-data/app-tiles.test-data';

import { waitUntilTilePresentInApi } from '@/src/modules/integrations/apis/helpers/tileApiHelpers';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

test.describe(
  'greenhouse App Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.GREENHOUSE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Greenhouse';
    const tileName = 'Display job postings';
    let createdTileTitle: string | undefined = undefined;

    multiUserTileFixture.afterEach(async ({ adminPage, tileManagementHelper }) => {
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    multiUserTileFixture(
      'verify the "Greenhouse App" tile is visible to end users after it has been added by the App Manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        const homeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28906',
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
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
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
        await homeDashboard.verifyGreenhouseContentStructure(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'verify the "Greenhouse App" tile is visible to end users after it has been added by the App Manager on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28908',
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `Greenhouse report${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
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
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.verifyGreenhouseContentStructure(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
  }
);
