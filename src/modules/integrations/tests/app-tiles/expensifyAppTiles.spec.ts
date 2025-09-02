import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { tagTest } from '@core/utils/testDecorator';
import { CONNECTOR_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { HomeDashboard } from '@/src/modules/integrations/pages/homeDashboard';
import { faker } from '@faker-js/faker';
import { deactivateSiteSafe } from '@/src/core/helpers/sitehelpers';

const adminUser: UserCredentials = {
  email: process.env.QA_SYSTEM_ADMIN_USERNAME!,
  password: process.env.QA_SYSTEM_ADMIN_PASSWORD!,
};

test.describe(
  'Expensify App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.EXPENSIFY, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileNames: string[] = [];
    let createdSiteIds: string[] = [];
    let homeDashboard: HomeDashboard;

    const uniqueTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;
    const updatedTileTitle = `${uniqueTileTitle}-Updated`;

    test.beforeEach(async ({ page }) => {
      await LoginHelper.loginWithPassword(page, adminUser);
      homeDashboard = new HomeDashboard(page);
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
      'Create and edit Expensify tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24799',
          storyId: 'INT-24430',
        });

        createdTileNames.push(updatedTileTitle);

        await homeDashboard.createAppTileViaApi(uniqueTileTitle, CONNECTOR_IDS.EXPENSIFY);
        await homeDashboard.isTilePresent(uniqueTileTitle);
        await homeDashboard.editTile(uniqueTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
      }
    );
  }
);
