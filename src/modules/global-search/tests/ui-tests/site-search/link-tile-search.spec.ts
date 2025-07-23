import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { TestGroupType } from '@core/constants/testType';
import {
  LINK_TILE_SEARCH_TEST_DATA,
  PREDEFINED_LINKS,
  TILE_NUMBER_OF_LINKS,
} from '@/src/modules/global-search/test-data/link-tile-search.test-data';
import { SEARCH_RESULT_ITEM, SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';


for (const numberOfLinks of TILE_NUMBER_OF_LINKS) {
  test.describe(
    `Test Global Search - Link Tile Search functionality`,
    {
      tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.LINK_TILE_SEARCH],
    },
    () => {
      let newSiteId: string;
      let tileId: string;
      let newSiteName: string;

      test.beforeEach(
        'Setting up the test environment for link tile search',
        async ({ appManagerApiClient }) => {
          try {
            // Creating a new site
            const randomNum = Math.floor(Math.random() * 1000000 + 1);
            newSiteName = `AutomateUI_Test_${randomNum}`;

            const categoryObj = await appManagerApiClient
              .getSiteManagementService()
              .getCategoryId(SEARCH_RESULT_ITEM.CATEGORY);

            const siteResult = await appManagerApiClient.getSiteManagementService().addNewSite({
              access: SITE_TYPES.PUBLIC,
              name: newSiteName,
              category: {
                categoryId: categoryObj.categoryId,
                name: categoryObj.name,
              },
            });

            newSiteId = siteResult.siteId;
            console.log(`Created site: ${newSiteName} with ID: ${newSiteId}`);

            // Creating a new tile
            const tileResponse = await appManagerApiClient
              .getTileManagementService()
              .createTile(newSiteId, LINK_TILE_SEARCH_TEST_DATA.tileTitle, numberOfLinks, PREDEFINED_LINKS);

            tileId = tileResponse.result.id;
            console.log(`Created tile: ${LINK_TILE_SEARCH_TEST_DATA.tileTitle} with ID: ${tileId}`);
            //wait until the search api starts showing the newly created site in results
            await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
              appManagerApiClient,
              LINK_TILE_SEARCH_TEST_DATA.tileTitle,
              LINK_TILE_SEARCH_TEST_DATA.tileTitle,
              'tiles'
            );
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

        // Clean up site (if it was created)
        if (newSiteId) {
          try {
            await appManagerApiClient.getSiteManagementService().deactivateSite(newSiteId);
            console.log(`Successfully deactivated site: ${newSiteId}`);
          } catch (error) {
            console.warn(`Failed to deactivate site ${newSiteId}:`, error);
          }
        }
      });

      test(
        `Verify Link Tile Search results for a new link tile with ${numberOfLinks} links`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE],
        },
        async ({appManagerHomePage }) => {
          tagTest(test.info(), {
            zephyrTestId: 'SEN-12408',
            storyId: 'SEN-12305',
          });

          const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(
            LINK_TILE_SEARCH_TEST_DATA.tileTitle,
            {
              stepInfo: `Searching for tile "${LINK_TILE_SEARCH_TEST_DATA.tileTitle}" created with ID: ${tileId}`,
            }
          );

          const tileResultItem = await globalSearchResultPage.getTileResultItemExactlyMatchingTheSearchTerm(
            LINK_TILE_SEARCH_TEST_DATA.tileTitle
          );

          await tileResultItem.verifyTileTitleIsDisplayed(LINK_TILE_SEARCH_TEST_DATA.tileTitle);
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
