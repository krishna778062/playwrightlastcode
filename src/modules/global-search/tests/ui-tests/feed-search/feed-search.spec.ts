import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { FEED_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/feed-search.test-data';

test.describe(
  'Global Search - Feed Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FEED_SEARCH],
  },
  () => {
    const testData = FEED_SEARCH_TEST_DATA;
    let feedId: string;
    let feedName: string;
    let authorName: string;

    test.beforeAll(async ({ feedManagementHelper }) => {
      // Create a feed for testing
      const feedResponse = await feedManagementHelper.createFeed({
        scope: 'public',
      });
      feedId = feedResponse.result.feedId;
      feedName = feedResponse.feedName;
      authorName = feedResponse.result.authoredBy?.name;
    });

    test.afterAll(async ({ feedManagementHelper }) => {
      // Clean up the created feed
      if (feedId) {
        await feedManagementHelper.deleteFeed(feedId);
      }
    });

    test(
      `Verify Feed Search results for a new home ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-13079',
          storyId: 'SEN-12843',
        });

        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(feedName, {
          stepInfo: `Searching with term "${feedName}" and intent is to find the content`,
        });

        await globalSearchResultPage.verifyFeedResultItemDataPoints({
          name: feedName,
          text: testData.text,
          label: testData.label,
          feedId: feedId,
          author: authorName,
        });
      }
    );

    test(
      `Verify Feed Search results with sidebar filter`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19196',
        });

        // Search for the feed
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(feedName, {
          stepInfo: `Searching with term "${feedName}" to verify feed appears in search results`,
        });

        // Verify the feed appears in the initial search results
        await globalSearchResultPage.getFeedResultItemExactlyMatchingTheSearchTerm(feedName);

        // Click on the feed filter in the sidebar to filter results by feeds only
        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: 'Feed',
          iconType: 'feedMobile',
        });
        await globalSearchResultPage.verifyFeedResultItemDataPoints({
          name: feedName,
          text: testData.text,
          label: testData.label,
          feedId: feedId,
          author: authorName,
        });
      }
    );
  }
);
