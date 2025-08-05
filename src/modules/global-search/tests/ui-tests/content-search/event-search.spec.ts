import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { EVENT_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';

test.describe(
  'Global Search- Event Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.CONTENT_SEARCH],
  },
  () => {
    const testData = EVENT_SEARCH_TEST_DATA;

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage, contentManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12462',
          storyId: 'SEN-12298',
        });

        const randomNum = Math.floor(Math.random() * 1000000 + 1);
        const newSiteName = `AutomateUI_Test_${randomNum}`;
        const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);

        const { siteId, contentId, eventName, authorName, contentDescription } = await contentManagementHelper.createEvent(newSiteName, categoryObj, { contentType: testData.content });

        // 4. UI Search for the event
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(eventName, {
          stepInfo: `Searching with term "${eventName}" and intent is to find the event`,
        });

        // 5. Verify the event result item's data points
        await globalSearchResultPage.verifyResultItemDataPoints('event', {
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
