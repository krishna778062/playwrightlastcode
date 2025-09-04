import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import {
  FilesPreviewIcon,
  FilesPreviewMoreActionsOption,
  FilesPreviewToasterMessage,
} from '../../constants/filesPreviewEnums';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { filesPreviewTestFixture as test } from '@/src/modules/content/fixtures/filesPreviewFixture';

test.describe(`Files Preview || DOCUMENT || Verify More actions ${ContentTestSuite.FILES_PREVIEW} @CONT-37467`, () => {
  test.beforeEach(async ({ page }) => {
    const adminHomePage = await LoginHelper.loginWithPassword(page, {
      email: getEnvConfig().appManagerEmail,
      password: getEnvConfig().appManagerPassword,
    });
    await adminHomePage.verifyThePageIsLoaded();
  });

  // Use the fixture to cleanup the file from files preview modal
  test.afterEach(async ({ _cleanupByDeletingTheFileFromFilesPreviewModal }) => {});

  test(
    `@SCENARIO-1 Verify that for a document type of file More actions provides the option “Copy link to this file”,`,
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
    },
    async ({ siteMainPage, siteFilesPage, filesPreviewModalComponent }) => {
      tagTest(test.info(), {
        description: `SCENARIO:1 Verify Document Files open with Files Preview mode when clicked on any "File” under Sites > Files`,
        zephyrTestId: `CONT-37467`,
        storyId: `CONT-34370`,
      });

      // Generate test data
      const fileNameOnDisk = `FilesPreview_BEHAVE_DOC_1_PDF.pdf`;
      const postFixRandomNumber = faker.number.int({ min: 1000, max: 9000 });
      const expectedFileName: string = `FilesPreview_BEHAVE_DOC_1_PDF${postFixRandomNumber}.pdf`;

      await siteMainPage.landOnMainPageOfSite(`All Employees`);
      await siteMainPage.navigateToSiteFilesTab();
      await siteFilesPage.uploadFileViaSelectFromComputer(fileNameOnDisk, {
        makeFileNameRandom: true,
        randomNum: postFixRandomNumber,
      });
      await siteFilesPage.clickToOpenFileInFilesPreview(expectedFileName);
      await filesPreviewModalComponent.verifyFileNameTitle(expectedFileName);
      await filesPreviewModalComponent.clickOnIcon(FilesPreviewIcon.More_actions);
      await filesPreviewModalComponent.clickOnShowMoreActionsOption(FilesPreviewMoreActionsOption.CopyLinkToThisFile);
      await filesPreviewModalComponent.verifyFilesPreviewToastMessage(FilesPreviewToasterMessage.LinkCopiedToClipboard);
    }
  );
});
