import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
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

        const { siteId, contentId, eventName, authorName, contentDescription } =
          await contentManagementHelper.createEvent(newSiteName, categoryObj, { contentType: testData.content });

        // 4. UI Search for the event
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(eventName, {
          stepInfo: `Searching with term "${eventName}" and intent is to find the event`,
        });

        // 5. Get the content result item using ContentListComponent
        const resultLocator = await globalSearchResultPage.getEventResultItemExactlyMatchingTheSearchTerm(eventName);
        const contentResultItem = new ContentListComponent(resultLocator.page, resultLocator.rootLocator);

        //verifying event results
        await contentResultItem.verifyNameIsDisplayed(eventName);
        await contentResultItem.verifyLabelIsDisplayed(testData.label);
        await contentResultItem.verifyEventCalendarThumbnailIsDisplayed(getTodayDateIsoString());
        await contentResultItem.verifyDescriptionIsDisplayed(contentDescription);
        await contentResultItem.verifyAuthorIsDisplayed(authorName);
        await contentResultItem.verifyEventDateIsDisplayed(getTodayDateIsoString(), getTomorrowDateIsoString());
        await contentResultItem.verifyCalendarIconIsDisplayed();
        await contentResultItem.verifyNavigationToTitleLink(contentId, eventName, EVENT_SEARCH_TEST_DATA.content);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithSiteLink(siteId, newSiteName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.hoverOverCardAndCopyLink();
        await contentResultItem.verifyCopiedURL(contentId);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithCalendarLink(contentId);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithAuthorLink(authorName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithHomePageLink();
        await contentResultItem.goBackToPreviousPage();
      }
    );
  }
);
