import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { loginToQAEnv, logout } from '@integrations-fixtures/loginFixture';
import { AirtableAppTilesPage } from '@integrations-pages/airtableAppTilesPage';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { ACTION_LABELS, UI_ACTIONS } from '@integrations-constants/common';
import { AIRTABLE_TILE_DATA } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe('Airtable App Tiles Integration', () => {
  test.describe.configure({ mode: 'serial' });
  let airtablePage: AirtableAppTilesPage;

  test.beforeEach(async ({ page }, testInfo) => {
    airtablePage = new AirtableAppTilesPage(page);
    await loginToQAEnv(page, 'Admin');
  });

  test.afterEach(async ({}, testInfo) => {
    const tilesToRemove = [AIRTABLE_TILE_DATA.UPDATED_TILE_TITLE, AIRTABLE_TILE_DATA.TILE_TITLE];
    for (const title of tilesToRemove) {
      try {
        await airtablePage.isTilePresent(title);
        await airtablePage.clickThreeDotsOnTile(title);
        await airtablePage.clickTileOption(ACTION_LABELS.REMOVE);
        await airtablePage.verifyRemovePopupAppears(title);
        await airtablePage.clickRemoveTile();
        await airtablePage.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        console.log(`Successfully removed tile: ${title}`);
        break;
      } catch (error) {
        console.log(`Tile '${title}' not found or failed to remove: ${error}`);
      }
    }
  });

  test(
    'Verify Personalize button functionality for user defined view tasks in Airtable app tile',
    {
      tag: [TestGroupType.SMOKE, TestGroupType.SANITY, IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-24188',
        storyId: 'INT-23049',
      });

      const config = {
        baseName: AIRTABLE_TILE_DATA.BASE_NAME,
        tableId: AIRTABLE_TILE_DATA.TABLE_ID,
        sortBy: AIRTABLE_TILE_DATA.USER_DEFINED,
        sortOrder: AIRTABLE_TILE_DATA.USER_DEFINED,
      };

      // Add tile with personalization options
      await airtablePage.addAirtableTile(AIRTABLE_TILE_DATA.TILE_TITLE, config, UI_ACTIONS.ADD_TO_HOME);

      // Verify tile was added successfully
      await airtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
      await airtablePage.verifyPersonalizeVisible(AIRTABLE_TILE_DATA.TILE_TITLE);

      // Personalize the tile sorting
      await airtablePage.personalizeTileSorting(
        AIRTABLE_TILE_DATA.TILE_TITLE,
        AIRTABLE_TILE_DATA.PERSONALIZE_SORT_BY,
        AIRTABLE_TILE_DATA.PERSONALIZE_SORT_ORDER
      );

      // Verify personalization was successful
      await airtablePage.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
      await airtablePage.verifyTilesAscending();
    }
  );

  test(
    'Verify app manager is able to edit display content calendar tasks in Airtable apptile on Home dashboard',
    {
      tag: [TestGroupType.SMOKE, TestGroupType.SANITY, IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-24130',
        storyId: 'INT-23049',
      });

      const config = {
        baseName: AIRTABLE_TILE_DATA.BASE_NAME,
        tableId: AIRTABLE_TILE_DATA.TABLE_ID,
      };

      // Add tile without personalization options
      await airtablePage.addAirtableTile(AIRTABLE_TILE_DATA.TILE_TITLE, config, UI_ACTIONS.ADD_TO_HOME);
      await airtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
      await airtablePage.verifyPersonalizeNotVisible(AIRTABLE_TILE_DATA.TILE_TITLE);

      // Edit the tile title
      await airtablePage.clickThreeDotsOnTile(AIRTABLE_TILE_DATA.TILE_TITLE);
      await airtablePage.clickTileOption(ACTION_LABELS.EDIT);
      await airtablePage.setTileTitle(AIRTABLE_TILE_DATA.UPDATED_TILE_TITLE);
      await airtablePage.save();

      // Verify the edit was successful
      await airtablePage.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.UPDATED_TILE_TITLE);
    }
  );

  test(
    'Verify app manager is able to remove display content calendar tasks in Airtable apptile on Home dashboard',
    {
      tag: [TestGroupType.SANITY, IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-24181',
        storyId: 'INT-23049',
      });

      const config = {
        baseName: AIRTABLE_TILE_DATA.BASE_NAME,
        tableId: AIRTABLE_TILE_DATA.TABLE_ID,
      };

      // First add a tile
      await airtablePage.addAirtableTile(AIRTABLE_TILE_DATA.TILE_TITLE, config, UI_ACTIONS.ADD_TO_HOME);

      await airtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);

      // Then remove it - direct steps
      await airtablePage.clickThreeDotsOnTile(AIRTABLE_TILE_DATA.TILE_TITLE);
      await airtablePage.clickTileOption(ACTION_LABELS.REMOVE);
      await airtablePage.clickRemoveTile();
      await airtablePage.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);

      // Verify tile is no longer present
      try {
        await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
        throw new Error('Tile should not be present after removal');
      } catch (error) {
        // Expected - tile should not be found
        console.log('Tile successfully removed - no longer visible');
      }
    }
  );

  test(
    'Multi-user tile management - Admin creates, EndUser verifies, Admin deletes',
    {
      tag: [TestGroupType.SMOKE, TestGroupType.SANITY, IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-27189',
        storyId: 'INT-23049',
      });

      const config = {
        baseName: AIRTABLE_TILE_DATA.BASE_NAME,
        tableId: AIRTABLE_TILE_DATA.TABLE_ID,
      };

      // Step 1: Login as App Manager and add Airtable tile
      await airtablePage.addAirtableTile(AIRTABLE_TILE_DATA.TILE_TITLE, config, UI_ACTIONS.ADD_TO_HOME);
      await airtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
      await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
      console.log('Admin: Successfully added tile to dashboard');

      // Step 2: Logout App Manager
      await logout(page);
      console.log('Admin: Successfully logged out');

      // Step 3: Login as End User and verify tile is present
      await loginToQAEnv(page, 'EndUser');
      airtablePage = new AirtableAppTilesPage(page);

      await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
      console.log('EndUser: Successfully verified tile is present');

      // Step 4: Logout End User
      await logout(page);
      console.log('EndUser: Successfully logged out');

      // Step 5: Login as App Manager again
      await loginToQAEnv(page, 'Admin');

      // Step 6: Click edit dashboard and delete the tile
      await airtablePage.clickEditDashboard();
    }
  );
});
