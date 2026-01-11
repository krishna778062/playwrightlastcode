import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
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
    'to verify content changes in home dashboard tiles CONT-22815',
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
      await homeDashboardPage.clickOnEditDashboardButton();
      await homeDashboardPage.clickOnAddTileButton();
      await homeDashboardPage.clickOnAddContentTileOption();
      await homeDashboardPage.selectingPagesAsContentType();
      const tileName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Tile`;
      await homeDashboardPage.namingTheTile(tileName);
      await homeDashboardPage.clickingOnAddToHomeButton();
      await homeDashboardPage.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.ADDED_TILE_TO_DASHBOARD);
      await homeDashboardPage.clickingOnDoneButton();
      await homeDashboardPage.verifyingThePageTileSectionIsVisible(tileName);

      // Get the DEFAULT_PUBLIC_SITE_NAME site ID for API page creation
      const allEmployeesSiteId =
        await appManagerFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);

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
      await homeDashboardPage.verifyingCreatedPageIsVisibleInTile(randomPageName);
      await homeDashboardPage.openingCreatedPageInTile(randomPageName);
      contentPreviewPage = new ContentPreviewPage(
        appManagerFixture.page,
        allEmployeesSiteId,
        pageInfo.contentId,
        'page'
      );
      await contentPreviewPage.unpublishingTheContent();
      await contentPreviewPage.verifyUnpublishedContentToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.UNPUBLISHED_CONTENT);
      await appManagerFixture.navigationHelper.clickOnHomeIconButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.verifyingCreatedPageIsNotVisibleInTile(randomPageName);
      await contentPreviewPage.loadPage();
      await contentPreviewPage.publishingTheContent();
      await appManagerFixture.navigationHelper.clickOnHomeIconButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.verifyingCreatedPageIsVisibleInTile(randomPageName);
      await homeDashboardPage.openingCreatedPageInTile(randomPageName);
      // Delete the page using API
      await appManagerFixture.contentManagementHelper.deleteContent(allEmployeesSiteId, pageInfo.contentId);
      await appManagerFixture.navigationHelper.clickOnHomeIconButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.verifyingCreatedPageIsNotVisibleInTile(randomPageName);
      await homeDashboardPage.clickOnEditDashboardButton();
      await homeDashboardPage.clickingOnEditTileButton(tileName);
      await homeDashboardPage.selectingSiteRadioButton(DEFAULT_PUBLIC_SITE_NAME);
      await homeDashboardPage.selectingShowcaseRadioButton();
      await homeDashboardPage.clickingOnSaveButton();
      await homeDashboardPage.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.EDITED_DASHBOARD_TILE);
      await homeDashboardPage.clickingOnRemoveTileButton(tileName);
      await homeDashboardPage.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.REMOVED_TILE_FROM_DASHBOARD);
      await homeDashboardPage.verifyingThePageTileSectionIsNotVisible(tileName);
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
      await appManagerFixture.navigationHelper.clickOnHomeIconButton();

      // Enter edit mode
      await homeDashboardPage.clickOnEditDashboardButton();

      // Generate unique tile names
      const textTileTitle = TestDataGenerator.generateRandomString('Text Tile');
      const sitesTileTitle = TestDataGenerator.generateRandomString('Sites Tile');
      const textTileDescription = TestDataGenerator.generateRandomText();

      // Get a site name for Sites & Category tile
      // Using "All Employees" as it's commonly available
      const siteName = DEFAULT_PUBLIC_SITE_NAME;

      // Add Text/HTML & Links tile
      await homeDashboardPage.addTextHtmlLinksTile(textTileDescription, textTileTitle);
      await homeDashboardPage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);

      // Add Sites & Category tile
      await homeDashboardPage.addSitesCategoryTile(siteName, sitesTileTitle);
      await homeDashboardPage.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);

      // Reorder tiles - move Sites tile before Text tile
      await homeDashboardPage.reorderTiles(sitesTileTitle, textTileTitle);

      // Verify tile order (Sites should be before Text)
      await homeDashboardPage.verifyTileOrder([textTileTitle, sitesTileTitle]);

      //  Exit edit mode and refresh page
      await homeDashboardPage.clickingOnDoneButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.verifyThePageIsLoaded();
      await homeDashboardPage.verifyingThePageTileSectionIsVisible(textTileTitle);

      // Verify tile order persists after refresh
      await homeDashboardPage.verifyTileOrder([textTileTitle, sitesTileTitle]);

      // Remove tiles via three dots menu
      await homeDashboardPage.clickOnEditDashboardButton();

      // Remove Text tile
      await homeDashboardPage.pageTileSectionComponent.clickThreeDotsOnTile(textTileTitle);
      await homeDashboardPage.pageTileSectionComponent.clickRemoveOptionFromMenu();
      await homeDashboardPage.pageTileSectionComponent.confirmRemoveTile();
      await homeDashboardPage.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);

      // Remove Sites tile
      await homeDashboardPage.pageTileSectionComponent.clickThreeDotsOnTile(sitesTileTitle);
      await homeDashboardPage.pageTileSectionComponent.clickRemoveOptionFromMenu();
      await homeDashboardPage.pageTileSectionComponent.confirmRemoveTile();
      await homeDashboardPage.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);

      // Exit edit mode
      await homeDashboardPage.clickingOnDoneButton();

      // Verify tiles are removed
      await homeDashboardPage.verifyingThePageTileSectionIsNotVisible(textTileTitle);
      await homeDashboardPage.verifyingThePageTileSectionIsNotVisible(sitesTileTitle);
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
      await appManagerFixture.homePage.loadPage();
      await homeDashboardPage.verifyThePageIsLoaded();

      // Click settings → Add tile
      await homeDashboardPage.clickOnEditDashboardButton();
      await homeDashboardPage.clickOnAddTileButton();

      // Select "Sites & Categories" type → "Sites" tab
      await homeDashboardPage.clickOnSitesCategoriesTileOption();
      await homeDashboardPage.clickOnSitesTab();

      // Enter tile name
      const tileName = TestDataGenerator.generateRandomString('Sites Tile');
      await homeDashboardPage.setSitesTileTitle(tileName);

      // Add private and unlisted sites to tile
      await homeDashboardPage.addSiteToSitesTile(privateSiteName);
      await homeDashboardPage.addSiteToSitesTile(unlistedSiteName);

      // Set layout as "List"
      await homeDashboardPage.setSitesTileLayout('list');

      // Click "Add to home" button
      await homeDashboardPage.clickingOnAddToHomeButton();
      await homeDashboardPage.verifyToastMessage(TILE_TEST_DATA.TOAST_MESSAGES.ADDED_TILE_TO_DASHBOARD);
      await homeDashboardPage.clickingOnDoneButton();

      // Verify tile is created on home dashboard
      await homeDashboardPage.verifyingThePageTileSectionIsVisible(tileName);

      // Get the tile ID for cleanup
      const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
      const createdTile = tilesList.result.listOfItems.find((tile: any) => tile.title === tileName);
      if (createdTile) {
        createdTileId = createdTile.id;
      }

      // Login as End User and verify
      await test.step('Verify as End User', async () => {
        // Navigate to Home tab as end user
        await standardUserFixture.navigationHelper.clickOnHomeIconButton();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        const endUserHomeDashboardPage = new HomeDashboardPage(standardUserFixture.page);
        await endUserHomeDashboardPage.reloadPage();
        await endUserHomeDashboardPage.verifyThePageIsLoaded();
        await endUserHomeDashboardPage.verifyingThePageTileSectionIsVisible(tileName);

        // Verify private site is visible in Sites tile
        await endUserHomeDashboardPage.verifyingSiteIsVisibleInSitesTile(privateSiteName, tileName);

        // Verify member icon is NOT visible for private site (non-member)
        await endUserHomeDashboardPage.verifyingMemberIconIsNotVisibleForSite(privateSiteName, tileName);

        // Verify unlisted site is NOT visible in Sites tile
        await endUserHomeDashboardPage.verifyingSiteIsNotVisibleInSitesTile(unlistedSiteName, tileName);
      });
    }
  );
});
