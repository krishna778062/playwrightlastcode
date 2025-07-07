import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { expect } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { HomePage } from '@/src/core/pages/homePage';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { PAGE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { waitForSearchResultInApi } from '@/src/modules/global-search/utils/globalSearchTestUtils';

test.describe(
  'Global Search- Content Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.CONTENT_SEARCH],
  },
  () => {
    let newSiteId: string;
    let newPageID: string;
    let homePage: HomePage;

    test.beforeEach(async ({ appManagerUserPage }) => {
      homePage = new HomePage(appManagerUserPage);
      await homePage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({ appManagerApiClient }) => {
      if (newSiteId) {
        await appManagerApiClient.getSiteManagementService().deactivateSite(newSiteId);
      }
    });

    const testData = PAGE_SEARCH_TEST_DATA;
    test(
      `Verify Content Search results for a new ${testData.content}"`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12432',
          storyId: 'SEN-12295',
        });
        // 1. Create a new site
        const randomNum = Math.floor(Math.random() * 1000000 + 1);
        const newSiteName = `AutomateUI_Test_${randomNum}`;
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

        // 2. Get page categories for the new site
        const pageCategory = await appManagerApiClient.getContentManagementService().getPageCategoryID(newSiteId);

        // 3. Create page content
        const randomNum1 = Math.floor(Math.random() * 1000000 + 1);
        const pageName = `AutomateUIPage_Test_${randomNum1}`;
        const contentDescription = 'AutomateDescription';
        const pageResult = await appManagerApiClient.getContentManagementService().addNewPageContent(newSiteId, {
          contentSubType: testData.contentType,
          title: pageName,
          bodyHtml: contentDescription,
          contentType: testData.content,
          category: {
            id: pageCategory.categoryId,
            name: pageCategory.name,
          },
        });

        newPageID = pageResult.pageId;
        console.log(`Created page : ${pageName} with ID ${newPageID}`);

        // 4. UI Search for the page
        const globalSearchResultPage = await homePage.actions.searchForTerm(pageName, {
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
        await contentResultItem.verifyUserIsDisplayed('Workplace AppManager');
        await contentResultItem.verifyDateIsDisplayed();
        await contentResultItem.verifyPageIconIsDisplayed();
        await contentResultItem.verifyNavigationWithSiteLink(newSiteId, newSiteName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.hoverOverCardAndCopyLink();
        await contentResultItem.verifyCopiedURL(newPageID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithThumbnailLink(newPageID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithAuthorLink('Workplace AppManager');
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithHomePageLink();
        await contentResultItem.goBackToPreviousPage();
      }
    );
  }
);
