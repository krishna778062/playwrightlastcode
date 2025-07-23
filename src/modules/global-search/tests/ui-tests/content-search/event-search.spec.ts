import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { EVENT_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { EnterpriseSearchHelper } from '@core/helpers/enterpriseSearchHelper';
import { faker } from '@faker-js/faker';
import { buildBodyAndBodyHtml } from '@/src/core/api/services/ContentManagementService';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';

test.describe(
  'Global Search- Event Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.CONTENT_SEARCH],
  },
  () => {
    let newSiteId: string;
    let newEventID: string;
    let newSiteName: string;
    let eventName: string;
    let contentDescription: string;
    let authorName: string;

    const testData = EVENT_SEARCH_TEST_DATA;

    test.beforeEach(async ({ appManagerApiClient }) => {
      // 1. Create a new site
      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      newSiteName = `AutomateUI_Test_${randomNum}`;
      const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);
      const result = await appManagerApiClient.getSiteManagementService().addNewSite({
        access: 'public',
        name: newSiteName,
        category: {
          categoryId: categoryObj.categoryId,
          name: categoryObj.name,
        },
      });
      newSiteId = result.siteId;

      // 2. Create event content
      eventName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Event`;
      contentDescription = 'AutomateEventDescription';
      authorName = process.env.TEST_ENV === 'qa' ? 'Workplace AppManager' : 'Application Manager1';
      const { body, bodyHtml } = buildBodyAndBodyHtml(contentDescription, 'event');
      const eventResult = await appManagerApiClient.getContentManagementService().addNewEventContent(newSiteId, {
        title: eventName,
        contentType: testData.content,
        body,
        bodyHtml,
        publishAt: getTodayDateIsoString(),
        startsAt: getTodayDateIsoString(),
        endsAt: getTomorrowDateIsoString(),
        timezoneIso: 'Asia/Kolkata',
        location: 'Gurgaon',
      });
      newEventID = eventResult.eventId;
      console.log(`Created event : ${eventName} with ID ${newEventID}`);

      //wait until the search api starts showing the newly created event in results
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
        appManagerApiClient,
        eventName,
        eventName,
        'content'
      );
    });


    test.afterEach(async ({ appManagerApiClient }) => {
      if (newSiteId) {
        await appManagerApiClient.getSiteManagementService().deactivateSite(newSiteId);
      }
    });



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
        await contentResultItem.verifyNavigationWithSiteLink(newSiteId, newSiteName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.hoverOverCardAndCopyLink();
        await contentResultItem.verifyCopiedURL(newEventID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithCalendarLink(newEventID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithAuthorLink(authorName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithHomePageLink();
        await contentResultItem.goBackToPreviousPage();
      }
    );
  }
);
