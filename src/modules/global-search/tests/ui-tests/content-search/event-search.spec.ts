import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { EVENT_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { ContentType } from '@/src/core/constants/contentTypes';

test.describe(
  'Global Search- Event Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    const testData = EVENT_SEARCH_TEST_DATA;

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage, contentManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12462',
          storyId: 'SEN-12298',
        });

        const {
          siteId,
          siteName: newSiteName,
          contentId,
          eventName,
          authorName,
          contentDescription,
        } = await contentManagementHelper.createSiteAndEvent(testData.category, { contentType: testData.content });

        // 4. UI Search for the event
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(eventName, {
          stepInfo: `Searching with term "${eventName}" and intent is to find the event`,
        });

        // 5. Verify the event result item's data points
        await globalSearchResultPage.verifyContentResultItemDataPoints(ContentType.Event, {
          name: eventName,
          label: testData.label,
          description: contentDescription,
          author: authorName,
          contentType: 'Event',
          contentId,
          siteId,
          siteName: newSiteName,
        });
      }
    );
  }
);
