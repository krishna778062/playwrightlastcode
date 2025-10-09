import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { waitUntilTilePresentInApi } from '@/src/modules/integrations/apis/helpers/tileApiHelpers';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

test.describe(
  'docuSign App Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.DOCUSIGN, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Docusign';
    const tileName = 'Display Docusign signature requests';
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
      'verify the "Display Docusign signature requests" tile is visible to end users after it has been added by the App Manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-25165',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `DocuSign report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'Verify the "Display Docusign signature requests" tile is visible to end users on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-25162',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `DocuSign report${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_SITE);
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
