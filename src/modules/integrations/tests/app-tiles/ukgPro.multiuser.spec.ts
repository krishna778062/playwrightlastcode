import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { waitUntilTilePresentInApi } from '@/src/modules/integrations/api/helpers/tileApiHelpers';
import { HomeDashboard } from '@/src/modules/integrations/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/pages/siteDashboard';

test.describe(
  'UKG Pro App Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.UKG_PRO, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'UKG Pro';
    const DisplayTimeOffBalance = 'Display time off balance';
    const DisplayRecentPaystubs = 'Display recent paystubs';
    const InstanceUrlOption = 'UKG Pro instance URL';
    const InstanceUrl = 'https://et19.ultipro.com/';
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
      'multi-user tile management for UKG Pro Display Recent Paystubs app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27189',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Display Recent Paystubs ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentPaystubs,
          InstanceUrlOption,
          InstanceUrl,
          UI_ACTIONS.ADD_TO_HOME
        );
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'site Manager creates site with UKG Pro Display Recent Paystubs tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, appManagerApiClient }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-24195',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Display Recent Paystubs ${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage);

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentPaystubs,
          InstanceUrlOption,
          InstanceUrl,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    multiUserTileFixture(
      'multi-user tile management for UKG Pro Display Time Off Balance app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27189',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Display ti me off balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'site Manager creates site with UKG Pro Display Time Off Balance tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, appManagerApiClient }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-24195',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage);

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
  }
);
