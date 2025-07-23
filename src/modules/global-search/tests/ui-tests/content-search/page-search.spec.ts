import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { PAGE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { EnterpriseSearchHelper } from '@core/helpers/enterpriseSearchHelper';
import { buildBodyAndBodyHtml } from '@/src/core/api/services/ContentManagementService';
import { getTodayDateIsoString } from '@/src/core/utils/dateUtil';

test.describe(
  'Global Search - Page Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.CONTENT_SEARCH],
  },
  () => {
    let newSiteId: string;
    let newPageID: string;
    let siteName: string;
    let pageName: string;
    let pageContentDescription: string;
    let pageAuthorName: string;
    const testData = PAGE_SEARCH_TEST_DATA;

    test.beforeEach(async ({ appManagerApiClient }) => {
      // 1. Create a new site
      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      siteName = `AutomateUI_Test_${randomNum}`;
      const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(testData.category);
      const result = await appManagerApiClient.getSiteManagementService().addNewSite({
        access: 'public',
        name: siteName,
        category: {
          categoryId: categoryObj.categoryId,
          name: categoryObj.name,
        },
      });
      newSiteId = result.siteId;

      // 2. Get page categories for the new site
      let pageCategory: any;
      pageCategory = await appManagerApiClient.getContentManagementService().getPageCategoryID(newSiteId);

      // 3. Create page content
      const randomNum1 = Math.floor(Math.random() * 1000000 + 1);
      pageName = `AutomateUIPage_Test_${randomNum1}`;
      pageContentDescription = 'AutomatePageDescription';
      pageAuthorName = process.env.TEST_ENV === 'qa' ? 'Workplace AppManager' : 'Application Manager1';
      const { body, bodyHtml } = buildBodyAndBodyHtml(pageContentDescription, 'page');
      const pageResult = await appManagerApiClient.getContentManagementService().addNewPageContent(newSiteId, {
        contentSubType: testData.contentType,
        title: pageName,
        body,
        bodyHtml,
        contentType: testData.content,
        publishAt: getTodayDateIsoString(),
        category: {
          id: pageCategory.categoryId,
          name: pageCategory.name,
        },
      });
      newPageID = pageResult.pageId;
      console.log(`Created page : ${pageName} with ID ${newPageID}`);

      //wait until the search api starts showing the newly created site in results
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
        appManagerApiClient,
        pageName,
        pageName,
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
          zephyrTestId: 'SEN-12432',
          storyId: 'SEN-12295',
        });

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
        await contentResultItem.verifyDescriptionIsDisplayed(pageContentDescription);
        await contentResultItem.verifyAuthorIsDisplayed(pageAuthorName);
        await contentResultItem.verifyDateIsDisplayed();
        await contentResultItem.verifyPageIconIsDisplayed();
        await contentResultItem.verifyNavigationWithSiteLink(newSiteId, siteName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.hoverOverCardAndCopyLink();
        await contentResultItem.verifyCopiedURL(newPageID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithThumbnailLink(newPageID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithAuthorLink(pageAuthorName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithHomePageLink();
        await contentResultItem.goBackToPreviousPage();
      }
    );
  }
);
