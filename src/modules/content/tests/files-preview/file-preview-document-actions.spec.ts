import { FilesPreviewMenuActionButton } from '@content/components/filesPreviewModalComponent';
import {
  FilesPreviewDeleteModal,
  FilesPreviewShowMoreActionsOption,
  FilesPreviewToastMessages,
} from '@content/constants/filesPreviewEnums';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { SiteFilesPage } from '@content/pages/sitePages/siteFilesPage';
import { SiteMainPage } from '@content/pages/sitePages/siteMainPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { FileUtil } from '@core/utils/fileUtil';
import { tagTest } from '@core/utils/testDecorator';

test.describe(`Files Preview | Verify Document Actions `, () => {
  let testFileDetails: {
    filePath: string;
    fileName: string;
    fileSystemCleanupRequired?: boolean;
    deleteByUI?: boolean;
  };
  let siteMainPage: SiteMainPage;
  let siteFilesPage: SiteFilesPage;
  test.beforeEach('Setup : Navigating to Site Files page', async ({ appManagersPage }) => {
    // Create random file copy
    const originalFilePath = `src/modules/content/test-data/static-files/documents/FilesPreview_BEHAVE_DOC_1_PDF.pdf`;
    const fileInfo = FileUtil.createRandomFileCopy(originalFilePath);
    testFileDetails = {
      ...fileInfo,
      fileSystemCleanupRequired: true,
      deleteByUI: true,
    };
    // Navigate to Site Files page
    siteMainPage = new SiteMainPage(appManagersPage);
    await siteMainPage.landOnMainPageOfSite(`All Employees`);
    siteFilesPage = await siteMainPage.navigateToSiteFilesTab();
  });

  test.afterEach(async ({}) => {
    if (testFileDetails.fileSystemCleanupRequired) {
      FileUtil.cleanUpFile(testFileDetails.filePath);
    }
    if (testFileDetails.deleteByUI) {
      await siteFilesPage.filesPreviewModalComponent.deleteFile();
    }
  });

  test(
    `Verify user is able to copy the link to this file option under More actions`,
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
    },
    async ({}) => {
      tagTest(test.info(), {
        description: `Verify user is able to click on the copy link to this file option under More actions`,
        zephyrTestId: ['CONT-37467', 'CONT-34399'],
        storyId: `CONT-34370`,
      });
      await siteFilesPage.uploadFileViaSelectFromComputer(testFileDetails.filePath);
      await siteFilesPage.verifyFileIsPresentInTheSiteFilesListAtIndex(testFileDetails.fileName, 0);
      await siteFilesPage.clickToOpenFileInFilesPreview(testFileDetails.fileName);
      await siteFilesPage.filesPreviewModalComponent.verifyFileNameTitle(testFileDetails.fileName);
      await siteFilesPage.filesPreviewModalComponent.clickOnPreviewMenuActionButton(
        FilesPreviewMenuActionButton.SHOWMORE
      );
      await siteFilesPage.filesPreviewModalComponent.clickOnShowMoreActionsOption(
        FilesPreviewShowMoreActionsOption.CopyLinkToThisFile
      );
      await siteFilesPage.verifyToastMessageIsVisibleWithText(FilesPreviewToastMessages.LinkCopiedToClipboard);
    }
  );

  test(
    `Verify user is able to delete the file using the delete option under More actions`,
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
    },
    async ({}) => {
      tagTest(test.info(), {
        description: `Verify user is able to delete the file using the delete option under More actions`,
        zephyrTestId: ['CONT-36338', 'CONT-34132'],
        storyId: `CONT-34132`,
      });
      await siteFilesPage.uploadFileViaSelectFromComputer(testFileDetails.filePath);
      await siteFilesPage.verifyFileIsPresentInTheSiteFilesListAtIndex(testFileDetails.fileName, 0);
      await siteFilesPage.clickToOpenFileInFilesPreview(testFileDetails.fileName);
      await siteFilesPage.filesPreviewModalComponent.verifyFileNameTitle(testFileDetails.fileName);
      await siteFilesPage.filesPreviewModalComponent.clickOnPreviewMenuActionButton(
        FilesPreviewMenuActionButton.SHOWMORE
      );
      await siteFilesPage.filesPreviewModalComponent.clickOnShowMoreActionsOption(
        FilesPreviewShowMoreActionsOption.Delete
      );
      await siteFilesPage.filesPreviewModalComponent.confirmDeleteOrCancelFromDeleteFileModal(
        FilesPreviewDeleteModal.Delete
      );
      await siteFilesPage.filesPreviewModalComponent.verifyToastMessageIsVisibleWithText(
        FilesPreviewToastMessages.DeletedFileSuccessfully
      );
      testFileDetails.deleteByUI = false; //since the file is deleted by UI, we don't need to cleanup the file from UI
    }
  );
});
