import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { ALBUM_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';

test.describe(
  'Global Search- Album Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    test(
      `Verify Content Search results for a new ${ALBUM_SEARCH_TEST_DATA.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage, contentManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12410',
          storyId: 'SEN-12297',
        });

        const randomNum = Math.floor(Math.random() * 1000000 + 1);
        const newSiteName = `AutomateUI_Test_${randomNum}`;
        const categoryObj = await appManagerApiClient
          .getSiteManagementService()
          .getCategoryId(ALBUM_SEARCH_TEST_DATA.category);

        const { siteId, contentId, albumName, authorName, contentDescription } =
          await contentManagementHelper.createAlbum(newSiteName, categoryObj, 'beach.jpg');

        // 5. UI Search for the album
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(albumName, {
          stepInfo: `Searching with term "${albumName}" and intent is to find the content`,
        });

        // 6. Verify the album result item's data points
        await globalSearchResultPage.verifyContentResultItemDataPoints('album', {
          name: albumName,
          label: ALBUM_SEARCH_TEST_DATA.label,
          description: contentDescription,
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
