import { getEnvConfig } from '@core/utils/getEnvConfig';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { AirtableAppTilesPage } from '@integrations-pages/airtableAppTilesPage';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { ACTION_LABELS, UI_ACTIONS } from '@integrations-constants/common';
import { AIRTABLE_TILE_DATA, generateUniqueTileNames } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { createAirtableTileViaApi } from '@/src/modules/integrations/api/helpers/airtableTileApi';
import {
  waitUntilTilePresentInApi,
  waitUntilTileAbsentInApi,
} from '@/src/modules/integrations/api/helpers/tileApiHelpers';
import { createSiteAndWaitForSearchResults, deactivateSiteSafe } from '@core/helpers/sitehelpers';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

test.describe('Airtable App Tiles Integration', () => {
  let airtablePage: AirtableAppTilesPage;
  let createdSiteIds: string[] = [];
  let createdTileNames: string[] = [];

  test.beforeEach(async ({ page }) => {
    airtablePage = new AirtableAppTilesPage(page);
    await LoginHelper.loginWithPassword(page, adminUser);
  });

  test.afterEach(async ({ page }) => {
    for (const tileTitle of createdTileNames) {
      await airtablePage.removeTileThroughApi(tileTitle);
      await waitUntilTileAbsentInApi(page, tileTitle);
      await airtablePage.reloadAndVerifyTileAbsent(tileTitle);
    }
    createdTileNames = [];

    // Clean up sites
    for (const siteId of createdSiteIds) {
      await deactivateSiteSafe(page, siteId);
    }
    createdSiteIds = [];
  });

  test(
    'Verify Personalize button functionality for user defined view tasks in Airtable app tile',
    {
      tag: [TestPriority.P1, TestGroupType.SANITY, IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-24188',
        storyId: 'INT-23049',
      });

      // Generate unique tile names for this test
      const { AIRTABLE_TILE_TITLE: uniqueTileTitle } = generateUniqueTileNames();
      createdTileNames.push(uniqueTileTitle);
      const config = {
        baseName: AIRTABLE_TILE_DATA.BASE_NAME,
        tableId: AIRTABLE_TILE_DATA.TABLE_ID,
        sortBy: AIRTABLE_TILE_DATA.USER_DEFINED,
        sortOrder: AIRTABLE_TILE_DATA.USER_DEFINED,
      };

      // Add tile with personalization options
      await airtablePage.addAirtableTile(uniqueTileTitle, config, UI_ACTIONS.ADD_TO_HOME);

      // Verify tile was added successfully
      await airtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(uniqueTileTitle);
      await airtablePage.verifyPersonalizeVisible(uniqueTileTitle);

      // Personalize the tile sorting
      await airtablePage.personalizeTileSorting(
        uniqueTileTitle,
        AIRTABLE_TILE_DATA.PERSONALIZE_SORT_BY,
        AIRTABLE_TILE_DATA.PERSONALIZE_SORT_ORDER
      );

      // Verify personalization was successful
      await airtablePage.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
      await airtablePage.verifyTileAscending(uniqueTileTitle);

      // Verify ascending order through API call
      await airtablePage.verifyAscendingOrderThroughAPI();
    }
  );

  test(
    'Verify app manager is able to edit display content calendar tasks in Airtable apptile on Home dashboard',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
        IntegrationsSuiteTags.AIRTABLE,
        IntegrationsSuiteTags.ABSOLUTE,
      ],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-24130',
        storyId: 'INT-23049',
      });

      const config = {
        baseName: AIRTABLE_TILE_DATA.BASE_NAME,
        tableId: AIRTABLE_TILE_DATA.TABLE_ID,
      };

      // Generate unique tile names for this test
      const { AIRTABLE_TILE_TITLE: uniqueTileTitle, AIRTABLE_UPDATED_TILE_TITLE: updatedTileTitle } =
        generateUniqueTileNames();
      createdTileNames.push(uniqueTileTitle, updatedTileTitle);

      // Add Airtable tile to Home dashboard through API
      await createAirtableTileViaApi(page, { tileInstanceName: uniqueTileTitle });
      await airtablePage.reloadAndVerifyTilePresent(uniqueTileTitle);

      //Verify personalize button is not visible
      await airtablePage.verifyPersonalizeNotVisible(uniqueTileTitle);

      // Edit the tile title
      await airtablePage.clickEditDashboard();
      await airtablePage.clickThreeDotsOnTile(uniqueTileTitle);
      await airtablePage.clickTileOption(ACTION_LABELS.EDIT);
      await airtablePage.setTileTitle(updatedTileTitle);
      await airtablePage.save();

      // Verify the edit was successful
      await airtablePage.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(updatedTileTitle);

      // Ensure API reflects rename before deletion
      await waitUntilTilePresentInApi(page, updatedTileTitle);
    }
  );

  test(
    'Verify site manager is able to edit display content calendar tile on Site dashboard',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
        IntegrationsSuiteTags.AIRTABLE,
        IntegrationsSuiteTags.ABSOLUTE,
      ],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-24182',
        storyId: 'INT-23049',
      });

      // Generate unique tile names for this test
      const { AIRTABLE_TILE_TITLE: uniqueTileTitle, AIRTABLE_UPDATED_TILE_TITLE: updatedTileTitle } =
        generateUniqueTileNames();
      createdTileNames.push(uniqueTileTitle, updatedTileTitle);

      // Create a fresh site via API
      const { siteId: createdSiteId, siteName: newSiteName } = await createSiteAndWaitForSearchResults(page, {
        access: 'public',
      });
      createdSiteIds.push(createdSiteId);

      // Print the new site name for debugging/logging
      console.log(` Created new site: "${newSiteName}" (ID: ${createdSiteId})`);

      // Navigate directly to the newly created site
      const siteUrl = new URL(`/site/${createdSiteId}/dashboard`, getEnvConfig().frontendBaseUrl).toString();
      await page.goto(siteUrl, { waitUntil: 'domcontentloaded' });

      // Add Airtable tile to Site dashboard
      const config = {
        baseName: AIRTABLE_TILE_DATA.BASE_NAME,
        tableId: AIRTABLE_TILE_DATA.TABLE_ID,
      };
      await airtablePage.addAirtableTile(uniqueTileTitle, config, UI_ACTIONS.ADD_TO_SITE);

      // Assert: Toast + tile present
      await airtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(uniqueTileTitle);

      // Edit the tile title
      await airtablePage.clickThreeDotsOnTile(uniqueTileTitle);
      await airtablePage.clickTileOption(ACTION_LABELS.EDIT);
      await airtablePage.setTileTitle(updatedTileTitle);
      await airtablePage.save();

      // Verify the edit was successful
      await airtablePage.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(updatedTileTitle);

      // Remove the tile
      await airtablePage.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
    }
  );
});
