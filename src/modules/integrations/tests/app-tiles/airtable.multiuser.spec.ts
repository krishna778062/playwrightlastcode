import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { createSiteAndWaitForSearchResults, deactivateSiteSafe } from '@core/helpers/sitehelpers';
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
    let createdSiteIds: string[] = [];
    let createdTileNames: string[] = [];
    const uniqueTileTitle = `Airtable content calendar ${faker.string.alphanumeric({ length: 6 })}`;

    multiUserTileFixture.afterEach(async ({ adminPage }) => {
      for (const tileName of createdTileNames) {
        const cleanupPage = new HomeDashboard(adminPage);
        await cleanupPage.removeTileThroughApi(tileName);
        await cleanupPage.verifyTileRemoved(tileName);
      }
      for (const siteId of createdSiteIds) {
        await deactivateSiteSafe(adminPage, siteId);
      }
      createdTileNames = [];
      createdSiteIds = [];
    });

    multiUserTileFixture(
      'Multi-user tile management for Airtable app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27189',
          storyId: 'INT-23049',
        });
        createdTileNames.push(uniqueTileTitle);
        const adminHomeDashboard = new HomeDashboard(adminPage);
        await adminHomeDashboard.addAirtableTile(uniqueTileTitle, adminHomeDashboard.config, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(uniqueTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage);
        await waitUntilTilePresentInApi(endUserPage, uniqueTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(uniqueTileTitle);
      }
    );

    multiUserTileFixture(
      'Site Manager creates site with Airtable tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27190',
          storyId: 'INT-23049',
        });

        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage);
        const adminHomeDashboard = new HomeDashboard(adminPage);
        createdTileNames.push(uniqueTileTitle);
        const { siteId: createdSiteId } = await createSiteAndWaitForSearchResults(adminPage, {
          access: 'public',
        });
        createdSiteIds.push(createdSiteId);
        await siteDashboard.navigateToSite(createdSiteId);

        await siteDashboard.addAirtableTile(uniqueTileTitle, adminHomeDashboard.config, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(uniqueTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSiteId);
        await waitUntilTilePresentInApi(endUserPage, uniqueTileTitle);
        await endUserSiteDashboard.isTilePresent(uniqueTileTitle);
        await siteDashboard.removeTile(uniqueTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
      }
    );
  }
);
