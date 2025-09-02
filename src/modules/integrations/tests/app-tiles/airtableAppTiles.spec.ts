import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { createSiteAndWaitForSearchResults, deactivateSiteSafe } from '@core/helpers/sitehelpers';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';
import { createAirtableTileViaApi } from '@integrations-api/helpers/tileApiHelpers';
import { HomeDashboard } from '@integrations-pages/homeDashboard';
import { SiteDashboard } from '@integrations-pages/siteDashboard';
import { AIRTABLE_TILE } from '@integrations-test-data/app-tiles.test-data';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

test.describe(
  'Airtable App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let homeDashboard: HomeDashboard;
    let siteDashboard: SiteDashboard;
    let createdSiteIds: string[] = [];
    let createdTileNames: string[] = [];

    const uniqueTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;
    const updatedTileTitle = `${uniqueTileTitle}-Updated`;

    test.beforeEach(async ({ page }) => {
      await LoginHelper.loginWithPassword(page, adminUser);
      homeDashboard = new HomeDashboard(page);
      siteDashboard = new SiteDashboard(page);
    });

    test.afterEach(async ({ page }) => {
      // Clean up tiles
      for (const tileTitle of createdTileNames) {
        await homeDashboard.removeTileThroughApi(tileTitle);
        await homeDashboard.verifyTileRemoved(tileTitle);
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
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({}) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24188',
          storyId: 'INT-23049',
        });

        createdTileNames.push(uniqueTileTitle);

        await homeDashboard.addAirtableTile(uniqueTileTitle, homeDashboard.config, UI_ACTIONS.ADD_TO_HOME);
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(uniqueTileTitle);
        await homeDashboard.verifyPersonalizeVisible(uniqueTileTitle);
        await homeDashboard.personalizeTileSorting(uniqueTileTitle, AIRTABLE_TILE.SORT_BY, AIRTABLE_TILE.SORT_ORDER);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyTileAscending(uniqueTileTitle);
      }
    );

    test(
      'Verify app manager is able to edit display content calendar tasks in Airtable apptile on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24130',
          storyId: 'INT-23049',
        });

        createdTileNames.push(uniqueTileTitle, updatedTileTitle);

        // Add Airtable tile to Home dashboard through API
        await createAirtableTileViaApi(page, { tileInstanceName: uniqueTileTitle });
        await homeDashboard.reloadAndVerifyTilePresent(uniqueTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(uniqueTileTitle);
        await homeDashboard.editTile(uniqueTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
      }
    );

    test(
      'Verify site manager is able to edit display content calendar tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24182',
          storyId: 'INT-23049',
        });

        createdTileNames.push(uniqueTileTitle, updatedTileTitle);

        // Create a fresh site via API
        const { siteId: createdSiteId } = await createSiteAndWaitForSearchResults(page, {
          access: 'public',
        });
        createdSiteIds.push(createdSiteId);

        // Navigate to site dashboard
        await siteDashboard.navigateToSite(createdSiteId);

        // Add Airtable tile to Site dashboard
        await siteDashboard.addAirtableTile(uniqueTileTitle, homeDashboard.config, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.editTileName(uniqueTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
      }
    );
  }
);
