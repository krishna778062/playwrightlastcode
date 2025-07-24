import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { HomePage } from '@/src/core/pages/homePage';
import { tagTest } from '@core/utils/testDecorator';
import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { ALBUM_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { EnterpriseSearchHelper } from '@core/helpers/enterpriseSearchHelper';
import { buildBodyAndBodyHtml } from '@/src/core/api/services/ContentManagementService';
import { faker } from '@faker-js/faker';
import { getTodayDateIsoString } from '@/src/core/utils/dateUtil';


test.describe(
  'Global Search- Album Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.CONTENT_SEARCH],
  },
  () => {
    let newSiteId: string;
    let newAlbumID: string;
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

    test(
      `Verify Content Search results for a new ${ALBUM_SEARCH_TEST_DATA.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12410',
          storyId: 'SEN-12297',
        });
        // 1. Create a new site
        const randomNum = Math.floor(Math.random() * 1000000 + 1);
        const newSiteName = `AutomateUI_Test_${randomNum}`;
        const categoryObj = await appManagerApiClient.getSiteManagementService().getCategoryId(ALBUM_SEARCH_TEST_DATA.category);
        const result = await appManagerApiClient.getSiteManagementService().addNewSite({
          access: 'public',
          name: newSiteName,
          category: {
            categoryId: categoryObj.categoryId,
            name: categoryObj.name,
          },
        });
        newSiteId = result.siteId;

        // 3. Upload cover image and get fileId
        const fileId = await appManagerApiClient.getContentManagementService().uploadImageAndGetFileId('beach.jpg');

        // 4. Create album content
        const albumName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Album`;
        const contentDescription = 'AutomateAlbumDescription';
        const { body, bodyHtml } = buildBodyAndBodyHtml(contentDescription, 'album');

        const albumResult = await appManagerApiClient.getContentManagementService().addNewAlbumContent(newSiteId, {
          title: albumName,
          body,
          bodyHtml,
          publishAt: getTodayDateIsoString(),
          coverImageMediaId: fileId,
          listOfAlbumMedia: [{ id: fileId, description: '' }],
        });
        newAlbumID = albumResult.albumId;
        const authorName = albumResult.authorName;
        console.log(`Created album : ${albumName} with ID ${newAlbumID}`);

        //wait until the search api starts showing the newly created album in results
        await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
          appManagerApiClient,
          albumName,
          albumName,
          'content'
        );

        // 5. UI Search for the album
        const globalSearchResultPage = await homePage.actions.searchForTerm(albumName, {
          stepInfo: `Searching with term "${albumName}" and intent is to find the content`,
        });

        // 6. Get the content result item using ContentListComponent
        const resultLocator = await globalSearchResultPage.getAlbumResultItemExactlyMatchingTheSearchTerm(albumName);
        const contentResultItem = new ContentListComponent(resultLocator.page, resultLocator.rootLocator);

        //verifying album results
        await contentResultItem.verifyNameIsDisplayed(albumName);
        await contentResultItem.verifyLabelIsDisplayed(ALBUM_SEARCH_TEST_DATA.label);
        await contentResultItem.verifyThumbnailIsDisplayed();
        await contentResultItem.verifyDescriptionIsDisplayed(contentDescription);
        await contentResultItem.verifyAuthorIsDisplayed(authorName);
        await contentResultItem.verifyDateIsDisplayed();
        await contentResultItem.verifyAlbumIconIsDisplayed();
        await contentResultItem.verifyNavigationToTitleLink(newAlbumID,albumName,ALBUM_SEARCH_TEST_DATA.content);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithSiteLink(newSiteId, newSiteName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.hoverOverCardAndCopyLink();
        await contentResultItem.verifyCopiedURL(newAlbumID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithThumbnailLink(newAlbumID);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithAuthorLink(authorName);
        await contentResultItem.goBackToPreviousPage();
        await contentResultItem.verifyNavigationWithHomePageLink();
        await contentResultItem.goBackToPreviousPage();
      }
    );
  }
); 