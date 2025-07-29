import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { PAGE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';

test.describe(
  'Global Search - Page Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.CONTENT_SEARCH],
  },
  () => {
    const testData = PAGE_SEARCH_TEST_DATA;

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage, contentManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12432',
          storyId: 'SEN-12295',
        });

        const randomNum = Math.floor(Math.random() * 1000000 + 1);
        const siteName = `AutomateUI_Test_${randomNum}`;
        const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);

        const { siteId, contentId, pageName, authorName, contentDescription } = await contentManagementHelper.createPage(siteName, categoryObj, { contentType: testData.content, contentSubType: testData.contentType!});

        // 4. UI Search for the page
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(pageName, {
          stepInfo: `Searching with term "${pageName}" and intent is to find the content`,
        });

        // 5. Get the content result item using ContentListComponent
        const resultLocator = await globalSearchResultPage.getPageResultItemExactlyMatchingTheSearchTerm(pageName);
        const contentResultItem = new ContentListComponent(resultLocator.page, resultLocator.rootLocator);

        //verifying page results
        await contentResultItem.verifyNameIsDisplayed(pageName);
        await contentResultItem.verifyLabelIsDisplayed(testData.label);
        await contentResultItem.verifyThumbnailIsDisplayed();
        await contentResultItem.verifyDescriptionIsDisplayed(contentDescription);
        await contentResultItem.verifyAuthorIsDisplayed(authorName);
        await contentResultItem.verifyDateIsDisplayed();
        await contentResultItem.verifyPageIconIsDisplayed();
        await contentResultItem.verifyNavigationToTitleLink(contentId,pageName,PAGE_SEARCH_TEST_DATA.content);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithSiteLink(siteId, siteName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.hoverOverCardAndCopyLink();
        await contentResultItem.verifyCopiedURL(contentId);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithThumbnailLink(contentId);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithAuthorLink(authorName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithHomePageLink();
        await contentResultItem.goBackToPreviousPage();
      }
    );
  }
);
