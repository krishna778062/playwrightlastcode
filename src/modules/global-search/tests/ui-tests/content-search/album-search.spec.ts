import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/core/constants/contentTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { ALBUM_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { ContentListComponent } from '@/src/modules/global-search/ui/components/contentListComponent';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';

test.describe(
  'Global Search- Album Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    let siteId: string;
    let newSiteName: string;
    let contentId: string;
    let albumName: string;
    let authorName: string;

    test.beforeAll(
      `Setting up the test environment for album search by creating site and album content`,
      async ({ appManagerFixture, publicSite }) => {
        const albumDetails = await appManagerFixture.contentManagementHelper.createAlbum({
          siteId: publicSite.siteId,
          imageName: 'beach.jpg',
          options: {
            contentDescription: ALBUM_SEARCH_TEST_DATA.description,
          },
        });

        siteId = publicSite.siteId;
        newSiteName = publicSite.siteName;
        contentId = albumDetails.contentId;
        albumName = albumDetails.albumName;
        authorName = albumDetails.authorName;
        console.log(`Created album "${albumName}" in site "${newSiteName}" with ID: ${siteId}`);
      }
    );

    test.afterAll(
      `Cleaning up the test environment by deleting the created album content`,
      async ({ appManagerFixture }) => {
        if (contentId) {
          await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
          console.log(`Deleted album "${albumName}" with ID: ${contentId}`);
        }
      }
    );

    test(
      `Verify Content Search results for a new ${ALBUM_SEARCH_TEST_DATA.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12410',
          storyId: 'SEN-12297',
        });

        // 5. UI Search for the album
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(albumName, {
          stepInfo: `Searching with term "${albumName}" and intent is to find the content`,
        });

        // 6. Verify the album result item's data points
        await globalSearchResultPage.verifyContentResultItemDataPoints(ContentType.Album, {
          name: albumName,
          label: ALBUM_SEARCH_TEST_DATA.label,
          description: ALBUM_SEARCH_TEST_DATA.description,
          author: authorName,
          contentType: 'Album',
          contentId,
          siteId,
          siteName: newSiteName,
        });
      }
    );

    test(
      `Verify Album Search results with sidebar filter`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19196',
        });

        // Search for the album
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(albumName, {
          stepInfo: `Searching with term "${albumName}" to verify album appears in search results`,
        });

        // Verify the album appears in the initial search results
        const albumResult = await globalSearchResultPage.getAlbumResultItemExactlyMatchingTheSearchTerm(albumName);
        const albumResultItem = new ContentListComponent(albumResult.page, albumResult.rootLocator);
        await albumResultItem.verifyNameIsDisplayed(albumName);

        // Click on the page filter in the sidebar to filter results by pages only
        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: 'Content',
          iconType: 'page',
        });

        await albumResultItem.verifyNameIsDisplayed(albumName);

        const originalCount = await globalSearchResultPage.verifyAndClickSiteSubFilter({
          filterText: 'Content',
          siteName: newSiteName,
        });

        // Verify all the same properties are still displayed after filtering
        await albumResultItem.verifyNameIsDisplayed(albumName);

        // Click on site subfilter, verify count tracking, and reset functionality
        await globalSearchResultPage.verifySiteSubFilterWithCountTracking({
          filterText: 'Content',
          siteName: newSiteName,
          originalCount: originalCount,
          expectedCountAfterFilter: 1, // Should show only 1 result (the album we created)
        });
        await albumResultItem.verifyNameIsDisplayed(albumName);
      }
    );

    test(
      `Verify Album Autocomplete functionality`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19288',
        });

        // Type in search input
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const topNavBarComponent = appManagerFixture.navigationHelper.topNavBarComponent;
        await topNavBarComponent.typeInSearchBarInput(albumName, {
          stepInfo: `Typing "${albumName}" in search input`,
        });

        // Wait for autocomplete to appear first
        const resultList = new ResultListingComponent(appManagerFixture.page);
        await resultList.waitForAndVerifyAutocompleteListIsDisplayed();

        // Then get specific autocomplete item
        const albumResult = resultList.getAutocompleteItemByName(albumName);

        // Verify all autocomplete item data in one comprehensive method
        await albumResult.verifyAutocompleteItemData(albumName, ContentType.Album);

        // Click on the autocomplete item and verify navigation
        await albumResult.verifyAutocompleteNavigationToTitleLink(contentId, albumName, ALBUM_SEARCH_TEST_DATA.label);
      }
    );
  }
);
