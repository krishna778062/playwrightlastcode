import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/core/constants/contentTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { EVENT_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';

test.describe(
  'Global Search- Event Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    const testData = EVENT_SEARCH_TEST_DATA;
    let siteId: string;
    let newSiteName: string;
    let contentId: string;
    let eventName: string;
    let authorName: string;

    test.beforeEach(
      `Setting up the test environment for event search by creating event content in common public site`,
      async ({ contentManagementHelper, publicSite }) => {
        const eventDetails = await contentManagementHelper.createEvent({
          siteId: publicSite.siteId,
          contentInfo: {
            contentType: testData.content,
          },
          options: {
            contentDescription: testData.description,
          },
        });

        siteId = publicSite.siteId;
        newSiteName = publicSite.siteName;
        contentId = eventDetails.contentId;
        eventName = eventDetails.eventName;
        authorName = eventDetails.authorName;
        console.log(`Created event "${eventName}" in site "${newSiteName}" with ID: ${siteId}`);
      }
    );

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12462',
          storyId: 'SEN-12298',
        });

        // 4. UI Search for the event
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(eventName, {
          stepInfo: `Searching with term "${eventName}" and intent is to find the event`,
        });

        // 5. Verify the event result item's data points
        await globalSearchResultPage.verifyContentResultItemDataPoints(ContentType.Event, {
          name: eventName,
          label: testData.label,
          description: testData.description,
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
