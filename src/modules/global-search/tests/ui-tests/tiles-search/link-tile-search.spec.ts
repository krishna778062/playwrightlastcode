import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import {
  PREDEFINED_LINKS,
  TILE_NUMBER_OF_LINKS,
} from '@/src/modules/global-search/test-data/link-tile-search.test-data';

test.describe(
  `Test Global Search - Link Tile Search functionality`,
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.LINK_TILE_SEARCH],
  },
  () => {
    let newSiteId: string;
    let newSiteName: string;

    test.beforeEach('Setting up the test environment for link tile search', async ({ publicSite }) => {
      // Use the shared public site
      newSiteId = publicSite.siteId;
      newSiteName = publicSite.siteName;
      console.log(`Using shared site: ${newSiteName} with ID: ${newSiteId}`);
    });

    // Tests for different link counts
    TILE_NUMBER_OF_LINKS.forEach(numberOfLinks => {
      test(
        `Verify Link Tile Search results for a new link tile with ${numberOfLinks} links`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage, tileManagementHelper }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12305',
          });

          // Create tile using the helper
          const tileData = await tileManagementHelper.createLinkTile({
            siteId: newSiteId,
            numberOfLinks: numberOfLinks,
          });
          const tileId = tileData.tileResponse.result.id;
          const tileTitle = tileData.tileTitle;

          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(tileTitle, {
            stepInfo: `Searching for tile "${tileTitle}" created with ID: ${tileId}`,
          });

          const tileResultItem = await globalSearchResultPage.getTileResultItemExactlyMatchingTheSearchTerm(tileTitle);

          await tileResultItem.verifyTileTitleIsDisplayed();
          await tileResultItem.siteLinkIsClickable(newSiteName, newSiteId);
          await tileResultItem.goBackToPreviousPage();
          await tileResultItem.verifyThumbnailIsDisplayed();
          await tileResultItem.verifyNavigationWithThumbnailLink(tileId);
          await tileResultItem.goBackToPreviousPage();
          await tileResultItem.hoverOverCardAndCopyLink();
          await tileResultItem.verifyCopiedURL(tileId);
          await tileResultItem.goBackToPreviousPage();
          const links = PREDEFINED_LINKS.slice(0, numberOfLinks);
          await tileResultItem.verifyShowMoreButtonIsDisplayed(links.length);
          await tileResultItem.verifyTileLinkIsClickable(links);
        }
      );
    });

    // Sidebar filter test (runs once with 2 links)
    test(
      `Verify Link Tile Search results with sidebar filter`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerHomePage, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19284',
        });

        // Create tile using the helper
        const tileData = await tileManagementHelper.createLinkTile({
          siteId: newSiteId,
          numberOfLinks: 2,
        });
        const tileTitle = tileData.tileTitle;

        // Search for the tile
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(tileTitle, {
          stepInfo: `Searching with term "${tileTitle}" to verify tile appears in search results`,
        });

        // Verify the tile appears in the initial search results
        const tileResult = await globalSearchResultPage.getTileResultItemExactlyMatchingTheSearchTerm(tileTitle);
        await tileResult.verifyTileTitleIsDisplayed();

        // Click on the tile filter in the sidebar to filter results by tiles only
        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: 'Tiles',
          iconType: 'tile',
        });

        await tileResult.verifyTileTitleIsDisplayed();

        const originalCount = await globalSearchResultPage.verifyAndClickSiteSubFilter({
          filterText: 'Tiles',
          siteName: newSiteName,
        });

        await tileResult.verifyTileTitleIsDisplayed();

        // Click on site subfilter, verify count tracking, and reset functionality
        await globalSearchResultPage.verifySiteSubFilterWithCountTracking({
          filterText: 'Tiles',
          siteName: newSiteName,
          originalCount: originalCount,
          expectedCountAfterFilter: 1,
        });
        await tileResult.verifyTileTitleIsDisplayed();
      }
    );
  }
);
