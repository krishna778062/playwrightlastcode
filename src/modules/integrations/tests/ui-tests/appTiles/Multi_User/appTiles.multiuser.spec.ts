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
import { test, expect } from '@playwright/test';

test.describe('Multi User Tests', () => {
  multiUserTileFixture(
    'Multi-user tile management for Airtable app tile - Admin creates, EndUser verifies, Admin deletes',
    {
      tag: [TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
    },
    async ({ adminPage, endUserPage }) => {
      tagTest(multiUserTileFixture.info(), {
        zephyrTestId: 'INT-27189',
        storyId: 'INT-23049',
      });

      // Generate unique tile names for this test
      const { AIRTABLE_TILE_TITLE: uniqueTileTitle } = generateUniqueTileNames();

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

      // Admin removes the tile
      await adminAirtablePage.removeTile(uniqueTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);

      // Verify end user no longer sees the deleted tile: API fast-path then one UI poll
      await waitUntilTileAbsentInApi(endUserPage, uniqueTileTitle);
      await endUserAirtablePage.reloadAndVerifyTileAbsent(uniqueTileTitle);
    }
  );
});
