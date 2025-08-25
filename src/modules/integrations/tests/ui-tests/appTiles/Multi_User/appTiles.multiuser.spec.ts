import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { AirtableAppTilesPage } from '@integrations-pages/airtableAppTilesPage';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { UI_ACTIONS } from '@integrations-constants/common';
import { AIRTABLE_TILE_DATA, generateUniqueTileNames } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import {
  waitUntilTilePresentInApi,
  waitUntilTileAbsentInApi,
} from '@/src/modules/integrations/api/helpers/tileApiHelpers';
import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { createSiteAndWaitForSearchResults, deactivateSiteSafe } from '@core/helpers/sitehelpers';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

test.describe('Multi User Tests', () => {
  test.describe('Airtable App Tiles Integration', () => {
    let createdSiteIds: string[] = [];
    let createdTileNames: string[] = [];

    test.afterEach(async ({ page }) => {
      // Clean up any created tiles
      createdTileNames?.forEach(async tileName => {
        console.log(`Cleaning up tile: ${tileName}`);
        const cleanupPage = new AirtableAppTilesPage(page);
        await cleanupPage.removeTileThroughApi(tileName);
        await waitUntilTileAbsentInApi(page, tileName);
        await cleanupPage.reloadAndVerifyTileAbsent(tileName);
      });

      // Clean up any created sites
      createdSiteIds?.forEach(async siteId => {
        console.log(`Cleaning up site with ID: ${siteId}`);
        await deactivateSiteSafe(page, siteId);
      });

      createdTileNames = [];
      createdSiteIds = [];
    });

    multiUserTileFixture(
      'Multi-user tile management for Airtable app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.SMOKE,
          IntegrationsSuiteTags.AIRTABLE,
          IntegrationsSuiteTags.ABSOLUTE,
        ],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27189',
          storyId: 'INT-23049',
        });

        // Generate unique tile names for this test
        const { AIRTABLE_TILE_TITLE: uniqueTileTitle } = generateUniqueTileNames();
        createdTileNames.push(uniqueTileTitle); // Add to cleanup list

        const config = {
          baseName: AIRTABLE_TILE_DATA.BASE_NAME,
          tableId: AIRTABLE_TILE_DATA.TABLE_ID,
        };

        // Admin creates the tile
        const adminAirtablePage = new AirtableAppTilesPage(adminPage);
        await adminAirtablePage.addAirtableTile(uniqueTileTitle, config, UI_ACTIONS.ADD_TO_HOME);
        await adminAirtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminAirtablePage.isTilePresent(uniqueTileTitle);

        // End user verifies via API, then UI fallback if API lags
        const endUserAirtablePage = new AirtableAppTilesPage(endUserPage);
        await waitUntilTilePresentInApi(endUserPage, uniqueTileTitle);
        await endUserAirtablePage.reloadAndVerifyTilePresent(uniqueTileTitle);

        //  Tile cleanup is handled in afterEach
      }
    );

    multiUserTileFixture(
      'Site Manager creates site with Airtable tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.SMOKE,
          IntegrationsSuiteTags.AIRTABLE,
          IntegrationsSuiteTags.ABSOLUTE,
        ],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27190',
          storyId: 'INT-23049',
        });

        // Generate unique tile names for this test
        const { AIRTABLE_TILE_TITLE: uniqueTileTitle } = generateUniqueTileNames();
        createdTileNames.push(uniqueTileTitle); // Add to cleanup list

        // App Manager creates a new site
        const { siteId: createdSiteId, siteName: newSiteName } = await createSiteAndWaitForSearchResults(adminPage, {
          access: 'public',
        });
        createdSiteIds.push(createdSiteId); // Add to cleanup list

        // Print the new site name for debugging/logging
        console.log(`Created new site: "${newSiteName}" (ID: ${createdSiteId})`);

        // Wait a moment for site to be fully indexed and accessible
        await adminPage.waitForTimeout(5000);

        // App Manager navigates to the newly created site
        const siteUrl = new URL(`/site/${createdSiteId}/dashboard`, getEnvConfig().frontendBaseUrl).toString();
        await adminPage.goto(siteUrl, { waitUntil: 'domcontentloaded' });

        // Site Manager adds Airtable tile to Site dashboard
        const adminAirtablePage = new AirtableAppTilesPage(adminPage);
        const config = {
          baseName: AIRTABLE_TILE_DATA.BASE_NAME,
          tableId: AIRTABLE_TILE_DATA.TABLE_ID,
        };
        await adminAirtablePage.addAirtableTile(uniqueTileTitle, config, UI_ACTIONS.ADD_TO_SITE);

        // Verify tile was added successfully
        await adminAirtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminAirtablePage.isTilePresent(uniqueTileTitle);

        // Switch to End User and navigate to site created by App Manager
        const endUserAirtablePage = new AirtableAppTilesPage(endUserPage);
        await endUserPage.goto(siteUrl, { waitUntil: 'domcontentloaded' });

        // End User verifies tile is present
        await waitUntilTilePresentInApi(endUserPage, uniqueTileTitle);
        await endUserAirtablePage.reloadAndVerifyTilePresent(uniqueTileTitle);

        // Tile and site cleanup is handled in afterEach
      }
    );
  });
});
