import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/core/constants/contentTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { EVENT_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { ContentListComponent } from '@/src/modules/global-search/ui/components/contentListComponent';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';

test.describe(
  'global Search- Event Search functionality',
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
      async ({ appManagerFixture, publicSite }) => {
        const eventDetails = await appManagerFixture.contentManagementHelper.createEvent({
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

    test.afterEach(
      `Cleaning up the test environment by deleting the created event content`,
      async ({ appManagerFixture }) => {
        try {
          if (contentId) {
            await appManagerFixture.contentManagementHelper.deleteContent(siteId, contentId);
            console.log(`Deleted event "${eventName}" with ID: ${contentId}`);
          }
        } catch (error) {
          console.warn('After hook cleanup failed, but test will not fail:', error);
          // Silently swallow the error to prevent test failure
          // Errors in after hooks should not fail tests
        }
      }
    );

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12462',
          storyId: 'SEN-12298',
        });

        // 4. UI Search for the event
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(eventName, {
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

    test(
      `verify Event Search results with sidebar filter`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19195',
        });

        // Search for the event
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(eventName, {
          stepInfo: `Searching with term "${eventName}" to verify event appears in search results`,
        });

        // Dismiss any survey popup that might appear
        await globalSearchResultPage.dismissSurveyPopupIfPresent();

        // Verify the event appears in the initial search results
        const eventResult = await globalSearchResultPage.getEventResultItemExactlyMatchingTheSearchTerm(eventName);
        const eventResultItem = new ContentListComponent(eventResult.page, eventResult.rootLocator);
        await eventResultItem.verifyNameIsDisplayed(eventName);

        // Click on the page filter in the sidebar to filter results by pages only
        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: 'Content',
          iconType: 'page',
        });

        await eventResultItem.verifyNameIsDisplayed(eventName);

        const originalCount = await globalSearchResultPage.verifyAndClickSiteSubFilter({
          filterText: 'Content',
          siteName: newSiteName,
        });

        // Verify all the same properties are still displayed after filtering
        await eventResultItem.verifyNameIsDisplayed(eventName);

        // Click on site subfilter, verify count tracking, and reset functionality
        await globalSearchResultPage.verifySiteSubFilterWithCountTracking({
          filterText: 'Content',
          siteName: newSiteName,
          originalCount: originalCount,
          expectedCountAfterFilter: 1, // Should show only 1 result (the event we created)
        });
        await eventResultItem.verifyNameIsDisplayed(eventName);
      }
    );

    test(
      `verify Event Autocomplete functionality`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19287',
        });

        // Type in search input
        const topNavBarComponent = appManagerFixture.navigationHelper.topNavBarComponent;
        await topNavBarComponent.typeInSearchBarInput(eventName, {
          stepInfo: `Typing "${eventName}" in search input`,
        });

        const resultList = new ResultListingComponent(appManagerFixture.page);
        await resultList.waitForAndVerifyAutocompleteListIsDisplayed();

        // Then get specific autocomplete item
        const eventResult = resultList.getAutocompleteItemByName(eventName);

        // Verify all autocomplete item data in one comprehensive method
        await eventResult.verifyAutocompleteItemData(eventName, ContentType.Event);

        // Click on the autocomplete item and verify navigation
        await eventResult.verifyAutocompleteNavigationToTitleLink(contentId, eventName, testData.label);
      }
    );
  }
);
