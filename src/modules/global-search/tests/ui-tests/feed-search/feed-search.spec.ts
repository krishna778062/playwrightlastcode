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
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.FEED_SEARCH, '@test'],
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

        const { feedId, feedName, authorName } = await feedManagementHelper.createFeed();

        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(feedName, {
          stepInfo: `Searching with term "${feedName}" and intent is to find the content`,
        });

        const resultLocator = await globalSearchResultPage.getFeedResultItemExactlyMatchingTheSearchTerm(feedName);
        const feedResultItem = new FeedListComponent(resultLocator.page, resultLocator.rootLocator);

        await feedResultItem.verifyNameIsDisplayed(testData.text);
        await feedResultItem.verifyLabelIsDisplayed(testData.label);
        await feedResultItem.verifyDateIsDisplayed();
        await feedResultItem.hoverOverCardAndCopyLink();
        await feedResultItem.verifyCopiedURL(feedId);
        await feedResultItem.goBackToPreviousPage();
        await feedResultItem.verifyNavigationToFeedLink(feedId, feedName);
        await feedResultItem.goBackToPreviousPage();
        await feedResultItem.verifyAuthorIsDisplayed(authorName);
        await feedResultItem.verifyNavigationWithAuthorLink(authorName);
        await feedResultItem.goBackToPreviousPage();
        await feedResultItem.verifyNavigationWithHomePageLink();
        await feedResultItem.goBackToPreviousPage();
      }
    );
  }
);
