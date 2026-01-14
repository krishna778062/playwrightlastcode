import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { tagTest } from '@/src/core/utils/testDecorator';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { TestFileHelper } from '@/src/modules/content/tests/utils/testFileHelper';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { SiteManager } from '@/src/modules/content/ui/managers/siteManager';
import { FavoritesPage } from '@/src/modules/content/ui/pages/favoritesPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';

test.describe(
  '@Feed - Favorite Standard User',
  {
    tag: [ContentTestSuite.FAVORITE],
  },
  () => {
    test.beforeEach('Setup for favorite test', async ({}) => {});

    test.afterEach(async ({}) => {});

    test(
      'to verify the favourite and unfavourite files functionality CONT-43049',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-43049'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite and unfavourite files functionality',
          zephyrTestId: 'CONT-43049',
          storyId: 'CONT-43049',
        });
        const getListOfSitesResponse = await standardUserFixture.siteManagementHelper.getListOfSites({
          size: 10,
          filter: 'active',
        });
        const siteId = getListOfSitesResponse.result.listOfItems[0].siteId;
        const imageFileName = FEED_TEST_DATA.ATTACHMENTS.IMAGE;
        const imagePath = TestFileHelper.getTestDataFilePath(imageFileName, __dirname);
        const fileSize = FileUtil.getFileSize(imagePath);
        const getSignedUploadUrlResponse =
          await standardUserFixture.contentManagementHelper.imageUploaderService.getSignedUploadUrl({
            file_name: imageFileName,
            mime_type: 'image/jpeg',
            size: fileSize,
            uploadContext: 'site-files',
            type: 'content',
            siteId: siteId,
          });
        await standardUserFixture.contentManagementHelper.imageUploaderService.uploadFileToSignedUrl(
          getSignedUploadUrlResponse.uploadUrl,
          imagePath,
          imageFileName
        );
        const fileDetails = await standardUserFixture.contentManagementHelper.imageUploaderService.uploadIntranetFile(
          siteId,
          imageFileName,
          imagePath,
          'image/jpeg'
        );
        console.log('fileDetails', fileDetails);
        const siteManager = new SiteManager(standardUserFixture.page, siteId);
        await siteManager.loadSite();
        const manageSitePage = new ManageSitePage(standardUserFixture.page);
        await manageSitePage.clickOnSiteTab(SitePageTab.FilesTab);
        await manageSitePage.verifyFileIsPresentInTheSiteFilesList(fileDetails.fileInfo.title);
        await manageSitePage.clickOnFileOption(fileDetails.fileInfo.title);
        await manageSitePage.clickOnFileFavoriteButton();
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        const manageSitesComponent = new ManageSitesComponent(standardUserFixture.page);
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        const favoritesPage = new FavoritesPage(standardUserFixture.page);
        await favoritesPage.clickOnFileTab();
        await favoritesPage.verifyFileIsVisibleInFilesTab(fileDetails.fileInfo.title);
        await favoritesPage.unfavoriteFileByName(fileDetails.fileInfo.title);
        const siteManagerAfterUnfavorite = new SiteManager(standardUserFixture.page, siteId);
        await siteManagerAfterUnfavorite.loadSite();
        const manageSitePageAfterUnfavorite = new ManageSitePage(standardUserFixture.page);
        await manageSitePageAfterUnfavorite.clickOnSiteTab(SitePageTab.FilesTab);
        await manageSitePageAfterUnfavorite.verifyFileIsPresentInTheSiteFilesList(fileDetails.fileInfo.title);
        await manageSitePageAfterUnfavorite.clickOnFileOption(fileDetails.fileInfo.title);
        await manageSitePageAfterUnfavorite.verifyFavoriteIsNotClicked();
      }
    );
  }
);
