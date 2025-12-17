import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { TILE_TEST_DATA } from '@/src/modules/content/test-data/tile.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { HomeDashboardPage } from '@/src/modules/content/ui/pages/homeDashboardPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';

test.describe('home Dashboard Tiles', () => {
  let homeDashboardPage: HomeDashboardPage;
  let contentPreviewPage: ContentPreviewPage;
  let manageFeaturesPage: ManageFeaturesPage;
  let manageContentPage: ManageContentPage;
  let createdTileId: string | null = null;

  test.beforeEach('Setup for home dashboard tiles test', async ({ appManagerFixture }) => {
    homeDashboardPage = new HomeDashboardPage(appManagerFixture.page);
    manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
    manageContentPage = new ManageContentPage(appManagerFixture.page);
    createdTileId = null;
  });

  test.afterEach(async ({ appManagerApiFixture }) => {
    if (createdTileId) {
      try {
        await appManagerApiFixture.tileManagementHelper.deleteHomeDashboardTile(createdTileId);
        createdTileId = null;
      } catch (error) {
        console.warn(`Failed to delete tile ${createdTileId}:`, error);
      }
    }
  });

  test(
    'to verify content changes in home dashboard tiles',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        ContentFeatureTags.CONTENT_HOME_DASHBOARD_TILES,
        '@healthcheck',
        '@CONT-22815',
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'to verify content changes in home dashboard tiles',
        zephyrTestId: 'CONT-22815',
        storyId: 'CONT-22815',
      });
      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickOnAddTileButton();
      await homeDashboardPage.actions.clickOnAddContentTileOption();
      await homeDashboardPage.actions.selectingPagesAsContentType();
      const tileName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Tile`;
      await homeDashboardPage.actions.namingTheTile(tileName);
      await homeDashboardPage.actions.clickingOnAddToHomeButton();
      await homeDashboardPage.assertions.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.ADDED_TILE_TO_DASHBOARD);
      await homeDashboardPage.actions.clickingOnDoneButton();
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsVisible(tileName);

      // Get the DEFAULT_PUBLIC_SITE_NAME site ID for API page creation
      const allEmployeesSiteId =
        await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

      // Generate random page name using faker
      const randomPageName = CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.title;

      // Create page using API with the topic
      const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
        siteId: allEmployeesSiteId,
        contentInfo: {
          contentType: 'page',
          contentSubType: 'knowledge',
        },
        options: {
          pageName: randomPageName,
          contentDescription: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.description,
          waitForSearchIndex: false,
        },
      });
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsVisibleInTile(randomPageName);
      await homeDashboardPage.actions.openingCreatedPageInTile(randomPageName);
      contentPreviewPage = new ContentPreviewPage(
        appManagerFixture.page,
        allEmployeesSiteId,
        pageInfo.contentId,
        'page'
      );
      await contentPreviewPage.actions.unpublishingTheContent();
      await contentPreviewPage.assertions.verifyUnpublishedContentToastMessage(
        TILE_TEST_DATA.TOAST_MESSAGES.UNPUBLISHED_CONTENT
      );
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsNotVisibleInTile(randomPageName);
      await contentPreviewPage.loadPage();
      await contentPreviewPage.actions.publishingTheContent();
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsVisibleInTile(randomPageName);
      await homeDashboardPage.actions.openingCreatedPageInTile(randomPageName);
      // Delete the page using API
      await appManagerFixture.contentManagementHelper.deleteContent(allEmployeesSiteId, pageInfo.contentId);
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsNotVisibleInTile(randomPageName);
      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickingOnEditTileButton(tileName);
      await homeDashboardPage.actions.selectingSiteRadioButton(DEFAULT_PUBLIC_SITE_NAME);
      await homeDashboardPage.actions.selectingShowcaseRadioButton();
      await homeDashboardPage.actions.clickingOnSaveButton();
      await homeDashboardPage.assertions.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.EDITED_DASHBOARD_TILE);
      await homeDashboardPage.actions.clickingOnRemoveTileButton(tileName);
      await homeDashboardPage.assertions.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.REMOVED_TILE_FROM_DASHBOARD);
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsNotVisible(tileName);
    }
  );

  test(
    'to verify app manager can reorder tiles on home dashboard',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-13605'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'to verify app manager can reorder tiles on home dashboard',
        zephyrTestId: 'CONT-13605',
        storyId: 'CONT-13605',
      });

      // Navigate to Home page
      await appManagerFixture.navigationHelper.clickOnHomeButton();

      // Enter edit mode
      await homeDashboardPage.actions.clickOnEditDashboardButton();

      // Generate unique tile names
      const textTileTitle = FEED_TEST_DATA.TILE.TITLE;
      const sitesTileTitle = FEED_TEST_DATA.TILE.TITLE;
      const textTileDescription = FEED_TEST_DATA.SEARCH.RANDOM_TEXT;

      // Get a site name for Sites & Category tile
      // Using "All Employees" as it's commonly available
      const siteName = 'All Employees';

      // Add Text/HTML & Links tile
      await homeDashboardPage.actions.addTextHtmlLinksTile(textTileDescription, textTileTitle);
      await homeDashboardPage.assertions.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);

      // Add Sites & Category tile
      await homeDashboardPage.actions.addSitesCategoryTile(siteName, sitesTileTitle);
      await homeDashboardPage.assertions.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);

      // Reorder tiles - move Sites tile before Text tile
      await homeDashboardPage.actions.reorderTiles(sitesTileTitle, textTileTitle);

      // Verify tile order (Sites should be before Text)
      await homeDashboardPage.assertions.verifyTileOrder([textTileTitle, sitesTileTitle]);

      //  Exit edit mode and refresh page
      await homeDashboardPage.actions.clickingOnDoneButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.verifyThePageIsLoaded();
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsVisible(textTileTitle);

      // Verify tile order persists after refresh
      await homeDashboardPage.assertions.verifyTileOrder([textTileTitle, sitesTileTitle]);

      // Remove tiles via three dots menu
      await homeDashboardPage.actions.clickOnEditDashboardButton();

      // Remove Text tile
      await homeDashboardPage.pageTileSectionComponent.clickThreeDotsOnTile(textTileTitle);
      await homeDashboardPage.pageTileSectionComponent.clickRemoveOptionFromMenu();
      await homeDashboardPage.pageTileSectionComponent.confirmRemoveTile();
      await homeDashboardPage.assertions.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);

      // Remove Sites tile
      await homeDashboardPage.pageTileSectionComponent.clickThreeDotsOnTile(sitesTileTitle);
      await homeDashboardPage.pageTileSectionComponent.clickRemoveOptionFromMenu();
      await homeDashboardPage.pageTileSectionComponent.confirmRemoveTile();
      await homeDashboardPage.assertions.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);

      // Exit edit mode
      await homeDashboardPage.actions.clickingOnDoneButton();

      // Verify tiles are removed
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsNotVisible(textTileTitle);
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsNotVisible(sitesTileTitle);
    }
  );

  test(
    'verify private and unlisted sites on Sites tile for non-members',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        ContentTestSuite.HOME_DASHBOARD,
        ContentTestSuite.TILES,
        '@CONT-22852',
      ],
    },
    async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
      tagTest(test.info(), {
        description: 'Verify private and unlisted sites on Sites tile for non-members',
        zephyrTestId: 'CONT-22852',
        storyId: 'CONT-22852',
      });

      // Configure home dashboard to app-manager controlled
      await test.step('Configure home dashboard to app-manager controlled', async () => {
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });
      });

      // Get or create private and unlisted sites where end user is NOT a member
      const [privateSiteResult, unlistedSiteResult] = await Promise.all([
        appManagerApiFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
          [users.endUser.email],
          SITE_TYPES.PRIVATE
        ),
        appManagerApiFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
          [users.endUser.email],
          SITE_TYPES.UNLISTED
        ),
      ]);

      const privateSiteName = privateSiteResult.siteName;
      const unlistedSiteName = unlistedSiteResult.siteName;

      // Navigate to Home tab
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await homeDashboardPage.verifyThePageIsLoaded();

      // Click settings → Add tile
      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickOnAddTileButton();

      // Select "Sites & Categories" type → "Sites" tab
      await homeDashboardPage.actions.clickOnSitesCategoriesTileOption();
      await homeDashboardPage.actions.clickOnSitesTab();

      // Enter tile name
      const tileName = FEED_TEST_DATA.TILE.TITLE;
      await homeDashboardPage.actions.setSitesTileTitle(tileName);

      // Add private and unlisted sites to tile
      await homeDashboardPage.actions.addSiteToSitesTile(privateSiteName);
      await homeDashboardPage.actions.addSiteToSitesTile(unlistedSiteName);

      // Set layout as "List"
      await homeDashboardPage.actions.setSitesTileLayout('list');

      // Click "Add to home" button
      await homeDashboardPage.actions.clickingOnAddToHomeButton();
      await homeDashboardPage.assertions.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.ADDED_TILE_TO_DASHBOARD);
      await homeDashboardPage.actions.clickingOnDoneButton();

      // Verify tile is created on home dashboard
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsVisible(tileName);

      // Get the tile ID for cleanup
      const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
      const createdTile = tilesList.result.listOfItems.find((tile: any) => tile.title === tileName);
      if (createdTile) {
        createdTileId = createdTile.id;
      }

      // Login as End User and verify
      await test.step('Verify as End User', async () => {
        // Navigate to Home tab as end user
        await standardUserFixture.navigationHelper.clickOnHomeButton();
        const endUserHomeDashboardPage = new HomeDashboardPage(standardUserFixture.page);
        await endUserHomeDashboardPage.verifyThePageIsLoaded();
        await endUserHomeDashboardPage.reloadPage();

        await endUserHomeDashboardPage.assertions.verifyingThePageTileSectionIsVisible(tileName);

        // Verify private site is visible in Sites tile
        await endUserHomeDashboardPage.assertions.verifyingSiteIsVisibleInSitesTile(privateSiteName, tileName);

        // Verify member icon is NOT visible for private site (non-member)
        await endUserHomeDashboardPage.assertions.verifyingMemberIconIsNotVisibleForSite(privateSiteName, tileName);

        // Verify unlisted site is NOT visible in Sites tile
        await endUserHomeDashboardPage.assertions.verifyingSiteIsNotVisibleInSitesTile(unlistedSiteName, tileName);
      });
    }
  );
});
