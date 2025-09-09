import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { FeedListComponent } from '@/src/modules/global-search/components/feedListComponent';
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

    test(
      `Verify Content Search results for a new home ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage, feedManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-13079',
          storyId: 'SEN-12843',
        });

        const feedResponse = await feedManagementHelper.createFeed({
          scope: 'public',
        });
        const feedId = feedResponse.feedId;
        const feedName = feedResponse.feedName;
        const authorName = feedResponse.authorName;

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
  }
);
