import { getEnvConfig } from '@core/utils/getEnvConfig';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { AirtableAppTilesPage } from '@integrations-pages/airtableAppTilesPage';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { ACTION_LABELS, UI_ACTIONS } from '@integrations-constants/common';
import { AIRTABLE_TILE_DATA } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { RETRY_INTERVALS } from '@core/constants/timeouts';
import { test, expect } from '@playwright/test';
import { createAirtableTileViaApi } from '@/src/modules/integrations/api/helpers/airtableTileApi';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { createSiteAndWaitForSearchResults, deactivateSiteSafe } from '@core/helpers/sitehelpers';

// User credentials for regular tests
const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

test.describe('Airtable App Tiles Integration', () => {
  // Regular single-user tests
  test.describe('Single User Tests', () => {
    let airtablePage: AirtableAppTilesPage;

    test.beforeEach(async ({ page }) => {
      airtablePage = new AirtableAppTilesPage(page);
      await LoginHelper.loginWithPassword(page, adminUser);
    });

    test.afterEach(async () => {
      const tilesToRemove = [AIRTABLE_TILE_DATA.UPDATED_TILE_TITLE, AIRTABLE_TILE_DATA.TILE_TITLE];
      for (const title of tilesToRemove) {
        if (!(await airtablePage.tileExists(title))) continue;
        await airtablePage.clickThreeDotsOnTile(title);
        await airtablePage.clickTileOption(ACTION_LABELS.REMOVE);
        await airtablePage.verifyRemovePopupAppears(title);
        await airtablePage.clickRemoveTile();
        await airtablePage.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        console.log(`Successfully removed tile: ${title}`);
      }
    });

    test(
      'Verify Personalize button functionality for user defined view tasks in Airtable app tile',
      {
        tag: [TestGroupType.SANITY, IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
      },
      async ({ page }) => {
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
        await airtablePage.verifyTileAscending(AIRTABLE_TILE_DATA.TILE_TITLE);

        // Verify ascending order through API call
        await airtablePage.verifyAscendingOrderThroughAPI();
        await airtablePage.clickEditDashboard();
      }
    );

    test(
      'Verify app manager is able to edit display content calendar tasks in Airtable apptile on Home dashboard',
      {
        tag: [
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
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

        const tileInstanceName = AIRTABLE_TILE_DATA.TILE_TITLE;
        await createAirtableTileViaApi(page, { tileInstanceName });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(async () => {
          await airtablePage.isTilePresent(tileInstanceName);
        }).toPass({ timeout: 15000 });

        await airtablePage.verifyPersonalizeNotVisible(AIRTABLE_TILE_DATA.TILE_TITLE);

        // Edit the tile title
        await airtablePage.clickEditDashboard();
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
      'Verify site manager is able to edit display content calendar tile on Site dashboard',
      {
        tag: [
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
          IntegrationsSuiteTags.AIRTABLE,
          IntegrationsSuiteTags.ABSOLUTE,
        ],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24182',
          storyId: 'INT-23049',
        });

        // Create a fresh site via API and wait until it appears in search
        const { siteId: createdSiteId, siteName: newSiteName } = await createSiteAndWaitForSearchResults(page, {
          access: 'public',
        });

        try {
          // Navigate to the newly created site via Global Search
          const homePage = new NewUxHomePage(page);
          const searchResultPage = await homePage.searchForTerm(newSiteName, {
            stepInfo: `Searching for site ${newSiteName}`,
          });
          const siteResultItem = await searchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(newSiteName);
          await siteResultItem.clickOnThumbnailLink();

          // Add Airtable tile to Site dashboard
          const config = {
            baseName: AIRTABLE_TILE_DATA.BASE_NAME,
            tableId: AIRTABLE_TILE_DATA.TABLE_ID,
          };
          await airtablePage.addAirtableTile(AIRTABLE_TILE_DATA.TILE_TITLE, config, UI_ACTIONS.ADD_TO_SITE);

          // Assert: Toast + tile present (retry for stability)
          await airtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
          await expect(async () => {
            await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
          }).toPass({ timeout: 15000 });

          // Edit the tile title
          await airtablePage.clickThreeDotsOnTile(AIRTABLE_TILE_DATA.TILE_TITLE);
          await airtablePage.clickTileOption(ACTION_LABELS.EDIT);
          await airtablePage.setTileTitle(AIRTABLE_TILE_DATA.UPDATED_TILE_TITLE);
          await airtablePage.save();

          // Verify the edit was successful
          await airtablePage.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
          await airtablePage.isTilePresent(AIRTABLE_TILE_DATA.UPDATED_TILE_TITLE);

          // Remove the tile
          await airtablePage.clickThreeDotsOnTile(AIRTABLE_TILE_DATA.UPDATED_TILE_TITLE);
          await airtablePage.clickTileOption(ACTION_LABELS.REMOVE);
          await airtablePage.clickRemoveTile();
          await airtablePage.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
          await expect(airtablePage.airtableComponent.getTileContainers(AIRTABLE_TILE_DATA.TILE_TITLE)).toHaveCount(0);
        } finally {
          //deactivate the temporary site
          await deactivateSiteSafe(page, createdSiteId);
        }
      }
    );
  }); // End Single User Tests

  // Multi-user tests with separate browser sessions
  test.describe('Multi User Tests', () => {
    multiUserTileFixture(
      'Multi-user tile management - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [
          TestGroupType.SMOKE,
          TestGroupType.SANITY,
          IntegrationsSuiteTags.AIRTABLE,
          IntegrationsSuiteTags.ABSOLUTE,
        ],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27189',
          storyId: 'INT-23049',
        });

        const config = {
          baseName: AIRTABLE_TILE_DATA.BASE_NAME,
          tableId: AIRTABLE_TILE_DATA.TABLE_ID,
        };

        // Step 1: Admin creates Airtable tile (separate browser session)
        const adminAirtablePage = new AirtableAppTilesPage(adminPage);
        await adminAirtablePage.addAirtableTile(AIRTABLE_TILE_DATA.TILE_TITLE, config, UI_ACTIONS.ADD_TO_HOME);
        await adminAirtablePage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminAirtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
        console.log('Admin: Successfully added tile to dashboard');

        // Step 2: End User verifies tile is present (separate browser session - needs refresh)
        const endUserAirtablePage = new AirtableAppTilesPage(endUserPage);

        // Multiple refresh attempts with better synchronization
        await expect(async () => {
          // Force refresh and wait for network to settle
          await endUserPage.reload({ waitUntil: 'domcontentloaded' });
          await endUserPage.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

          // Wait a bit for any delayed rendering
          await endUserPage.waitForTimeout(1000);

          // Try to find the tile
          await endUserAirtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
        }).toPass({ timeout: 30000, intervals: [...RETRY_INTERVALS.SLOW] });

        console.log('EndUser: Successfully verified tile is present after refresh');

        // First, verify the tile exists in admin session before trying to delete
        await expect(async () => {
          await adminAirtablePage.isTilePresent(AIRTABLE_TILE_DATA.TILE_TITLE);
        }).toPass({ timeout: 15000, intervals: [...RETRY_INTERVALS.FAST] });

        console.log('Admin: Confirmed tile is visible before deletion');

        // Step 3: Admin deletes the tile (same admin session)
        await adminAirtablePage.clickThreeDotsOnTile(AIRTABLE_TILE_DATA.TILE_TITLE);
        await adminAirtablePage.clickTileOption(ACTION_LABELS.REMOVE);
        await adminAirtablePage.verifyRemovePopupAppears(AIRTABLE_TILE_DATA.TILE_TITLE);
        await adminAirtablePage.clickRemoveTile();
        await adminAirtablePage.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        console.log('Admin: Successfully removed tile from dashboard');
      }
    );
  });
});
