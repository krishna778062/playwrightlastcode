import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { FEED_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/feed-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { FeedListComponent } from '@/src/modules/global-search/ui/components/feedListComponent';

test.describe(
  'global Search - Feed Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FEED_SEARCH],
  },
  () => {
    const testData = FEED_SEARCH_TEST_DATA;
    let currentFeedId: string;
    let currentFeedName: string;
    let currentAuthorName: string;
    let feedResponse: any;

    test.beforeEach(async ({ appManagerFixture, publicSite }, testInfo) => {
      // Create feed based on test title
      if (testInfo.title.includes('site')) {
        feedResponse = await appManagerFixture.feedManagementHelper.createFeed({
          scope: 'site',
          siteId: publicSite.siteId,
        });
      } else {
        feedResponse = await appManagerFixture.feedManagementHelper.createFeed({
          scope: 'public',
        });
      }

      currentFeedId = feedResponse.result.feedId;
      currentFeedName = feedResponse.feedName;
      currentAuthorName = feedResponse.result.authoredBy?.name;
    });

    test(
      `Verify Feed Search results for a new home ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-13079',
          storyId: 'SEN-12843',
        });

        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(currentFeedName, {
          stepInfo: `Searching with term "${currentFeedName}" and intent is to find the content`,
        });

        await globalSearchResultPage.verifyFeedResultItemDataPoints({
          name: currentFeedName,
          text: testData.text,
          label: testData.label,
          feedId: currentFeedId,
          author: currentAuthorName,
        });
      }
    );

    test(
      `verify Feed Search results with sidebar filter`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19281',
        });

        // Search for the feed
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(currentFeedName, {
          stepInfo: `Searching with term "${currentFeedName}" to verify feed appears in search results`,
        });

        // Verify the feed appears in the initial search results
        await globalSearchResultPage.getFeedResultItemExactlyMatchingTheSearchTerm(currentFeedName);

        // Click on the feed filter in the sidebar to filter results by feeds only
        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: 'Feed',
          iconType: 'feedMobile',
        });
        await globalSearchResultPage.verifyFeedResultItemDataPoints({
          name: currentFeedName,
          text: testData.text,
          label: testData.label,
          feedId: currentFeedId,
          author: currentAuthorName,
        });
      }
    );

    test(
      `Verify user able to search feed post from site ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture, publicSite }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-13079',
          storyId: 'SEN-12844',
        });

        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(currentFeedName, {
          stepInfo: `Searching with term "${currentFeedName}" and intent is to find the site feed content`,
        });

        await globalSearchResultPage.verifyFeedResultItemDataPoints({
          name: currentFeedName,
          text: testData.text,
          label: testData.label,
          feedId: currentFeedId,
          author: currentAuthorName,
        });

        // Verify site navigation for site feed
        const feedResultItem =
          await globalSearchResultPage.getFeedResultItemExactlyMatchingTheSearchTerm(currentFeedName);
        const feedListComponent = new FeedListComponent(feedResultItem.page, feedResultItem.rootLocator);
        await feedListComponent.verifyNavigationWithSiteLink(publicSite.siteId, publicSite.siteName);
      }
    );
  }
);
