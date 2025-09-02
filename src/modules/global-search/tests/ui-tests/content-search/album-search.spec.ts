import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/core/constants/contentTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { ALBUM_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';

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

    test.beforeEach(
      `Setting up the test environment for album search by creating site and album content`,
      async ({ contentManagementHelper, publicSite }) => {
        const albumDetails = await contentManagementHelper.createAlbum({
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

    test(
      `Verify Content Search results for a new ${ALBUM_SEARCH_TEST_DATA.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12410',
          storyId: 'SEN-12297',
        });

        5. UI Search for the album
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(albumName, {
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
  }
);
