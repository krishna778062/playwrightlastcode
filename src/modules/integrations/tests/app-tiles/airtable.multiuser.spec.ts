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
import { faker } from '@faker-js/faker';

test.describe(
  'Airtable App Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    multiUserTileFixture.afterEach(async ({ adminPage, tileManagementHelper }) => {
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await homeDashboard.removeTileThroughApi(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    multiUserTileFixture(
      'Multi-user tile management for Airtable app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27189',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addAirtableTile(createdTileTitle, adminHomeDashboard.config, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'Site Manager creates site with Airtable tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, appManagerApiClient, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27190',
          storyId: 'INT-23049',
        });

        //Generate a random tile title
        createdTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage);
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite(undefined, category);
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addAirtableTile(createdTileTitle, adminHomeDashboard.config, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
      }
    );
  }
);
