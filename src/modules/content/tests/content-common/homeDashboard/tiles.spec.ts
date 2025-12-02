import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { HomeDashboardPage } from '@/src/modules/content/ui/pages/homeDashboardPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';

test.describe('edit Topic', () => {
  let homeDashboardPage: HomeDashboardPage;
  let contentPreviewPage: ContentPreviewPage;
  let manageFeaturesPage: ManageFeaturesPage;
  let manageContentPage: ManageContentPage;
  let createdTileId: string | null = null;

  test.beforeEach('Setup for home dashboard tiles test', async ({ appManagerFixture }) => {
    homeDashboardPage = new HomeDashboardPage(appManagerFixture.page);
    contentPreviewPage = new ContentPreviewPage(appManagerFixture.page);
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
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.CONTENT_HOME_DASHBOARD_TILES, '@healthcheck'],
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
      await homeDashboardPage.assertions.verifyToastMessage('Added tile to dashboard successfully');
      await homeDashboardPage.actions.clickingOnDoneButton();
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsVisible(tileName);

      // Get the "All Employees" site ID for API page creation
      const allEmployeesSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName('All Employees');

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
      await contentPreviewPage.actions.unpublishingTheContent();
      await contentPreviewPage.assertions.verifyUnpublishedContentToastMessage('Unpublished content successfully');
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsNotVisibleInTile(randomPageName);
      await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
      await manageFeaturesPage.actions.clickOnContentCard();
      await manageContentPage.actions.writeRandomTextInSearchBar(randomPageName);
      await manageContentPage.actions.clickSearchIcon();
      await appManagerFixture.page.reload();
      await manageContentPage.actions.openContentDetailsPage();
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
      await homeDashboardPage.actions.selectingSiteRadioButton('All Employees');
      await homeDashboardPage.actions.selectingShowcaseRadioButton();
      await homeDashboardPage.actions.clickingOnSaveButton();
      await homeDashboardPage.assertions.verifyToastMessage('Edited dashboard tile successfully');
      await homeDashboardPage.actions.clickingOnRemoveTileButton(tileName);
      await homeDashboardPage.assertions.verifyToastMessage('Removed tile from dashboard successfully');
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsNotVisible(tileName);
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

      // Step 1: Configure home dashboard to app-manager controlled
      await test.step('Configure home dashboard to app-manager controlled', async () => {
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });
      });

      // Step 2: Get or create private and unlisted sites where end user is NOT a member
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

      console.log(`Using private site: ${privateSiteName}`);
      console.log(`Using unlisted site: ${unlistedSiteName}`);

      // Step 3: Navigate to Home tab
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await homeDashboardPage.verifyThePageIsLoaded();

      // Step 4: Click settings → Add tile
      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickOnAddTileButton();

      // Step 5: Select "Sites & Categories" type → "Sites" tab
      await homeDashboardPage.actions.clickOnSitesCategoriesTileOption();
      await homeDashboardPage.actions.clickOnSitesTab();

      // Step 6: Enter tile name
      const tileName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Sites Tile`;
      await homeDashboardPage.actions.setSitesTileTitle(tileName);

      // Step 7: Add private and unlisted sites to tile
      await homeDashboardPage.actions.addSiteToSitesTile(privateSiteName);
      await homeDashboardPage.actions.addSiteToSitesTile(unlistedSiteName);

      // Step 8: Set layout as "List"
      await homeDashboardPage.actions.setSitesTileLayout('list');

      // Step 9: Click "Add to home" button
      await homeDashboardPage.actions.clickingOnAddToHomeButton();
      await homeDashboardPage.assertions.verifyToastMessage('Added tile to dashboard successfully');
      await homeDashboardPage.actions.clickingOnDoneButton();

      // Step 10: Verify tile is created on home dashboard
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsVisible(tileName);

      // Get the tile ID for cleanup
      const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
      const createdTile = tilesList.result.listOfItems.find((tile: any) => tile.title === tileName);
      if (createdTile) {
        createdTileId = createdTile.id;
      }

      // Step 11: Login as End User and verify
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
