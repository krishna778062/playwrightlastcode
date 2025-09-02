import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import {
  getLinkTileSearchTestData,
  LinkTileSearchTestCase,
  PREDEFINED_LINKS,
  TILE_NUMBER_OF_LINKS,
} from '@/src/modules/global-search/test-data/link-tile-search.test-data';

for (const numberOfLinks of TILE_NUMBER_OF_LINKS) {
  test.describe(
    `Test Global Search - Link Tile Search functionality`,
    {
      tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.LINK_TILE_SEARCH],
    },
    () => {
      let newSiteId: string;
      let tileId: string;
      let newSiteName: string;
      let testData: LinkTileSearchTestCase;

      test.beforeEach(
        'Setting up the test environment for link tile search',
        async ({ appManagerApiClient, publicSite }) => {
          try {
            // Generate unique test data for each test
            testData = getLinkTileSearchTestData();

            // Use the shared public site
            newSiteId = publicSite.siteId;
            newSiteName = publicSite.siteName;
            console.log(`Using shared site: ${newSiteName} with ID: ${newSiteId}`);

            // Creating a new tile
            const tileResponse = await appManagerApiClient
              .getTileManagementService()
              .createTile(newSiteId, testData.tileTitle, numberOfLinks, PREDEFINED_LINKS);

            tileId = tileResponse.result.id;
            console.log(`Created tile: ${testData.tileTitle} with ID: ${tileId}`);
            //wait until the search api starts showing the newly created site in results
            await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
              apiClient: appManagerApiClient,
              searchTerm: testData.tileTitle,
              objectType: 'tiles',
              valueToFind: testData.tileTitle,
            });
          } catch (error) {
            console.error('Failed to set up test environment:', error);
            throw error;
          }
        }
      );

      test.afterEach('Tearing down the test environment for link tile search', async ({ appManagerApiClient }) => {
        // Clean up tile first (if it was created)
        if (tileId) {
          try {
            await appManagerApiClient.getTileManagementService().deleteTile(newSiteId, tileId);
            console.log(`Successfully deleted tile: ${tileId}`);
          } catch (error) {
            console.warn(`Failed to delete tile ${tileId}:`, error);
          }
        }

        // Note: Site cleanup is handled by publicSite fixture at worker level
      });

      test(
        `Verify Link Tile Search results for a new link tile with ${numberOfLinks} links`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({ appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12305',
          });

          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(testData.tileTitle, {
            stepInfo: `Searching for tile "${testData.tileTitle}" created with ID: ${tileId}`,
          });

          const tileResultItem = await globalSearchResultPage.getTileResultItemExactlyMatchingTheSearchTerm(
            testData.tileTitle
          );

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
    }
  );
}
