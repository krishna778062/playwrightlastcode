import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { IntegrationsFeatureTags } from '@integrations-constants/testTags';
import { createCustomMultiUserFixture, multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { UserCredentials } from '@core/types/test.types';
import { tagTest } from '@core/utils/testDecorator';

import { waitUntilTilePresentInApi } from '@/src/modules/integrations/apis/helpers/tileApiHelpers';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

const expensifyAdmin: UserCredentials = {
  email: process.env.QA_SYSTEM_ADMIN_USERNAME!,
  password: process.env.QA_SYSTEM_ADMIN_PASSWORD!,
};

const expensifyEndUser: UserCredentials = {
  email: process.env.QA_SYSTEM_END_USER_USERNAME!,
  password: process.env.QA_SYSTEM_END_USER_PASSWORD!,
};

// Create custom fixture with both Expensify admin and end user credentials
const expensifyMultiUserFixture = createCustomMultiUserFixture(expensifyAdmin, expensifyEndUser);

test.describe(
  'expensify App Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.EXPENSIFY, IntegrationsSuiteTags.ABSOLUTE, IntegrationsFeatureTags.MULTI_USER],
  },
  () => {
    const AppName = 'Expensify';
    const tileName = 'Display expense reports';
    let createdTileTitle: string | undefined = undefined;

    multiUserTileFixture.afterEach(async ({ adminPage, tileManagementHelper }) => {
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    expensifyMultiUserFixture(
      'multi-user tile management for Expensify app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-24797',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

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

    expensifyMultiUserFixture(
      'site Manager creates site with Expensify tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-24795',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;
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
