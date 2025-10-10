import { FrontlineFeatureTags, FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { ManageQRPage } from '@frontline/pages/manageQRPage';

import { TestPriority } from '@core/constants/testPriority';
import { FileUtil } from '@core/utils/fileUtil';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  'feature: QR Code Download',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.QR_CODE],
  },
  () => {
    const downloadedFiles: string[] = [];

    test.afterEach(async () => {
      // Cleanup downloaded files
      for (const filePath of downloadedFiles) {
        if (filePath) {
          try {
            FileUtil.deleteTemporaryFile(filePath);
          } catch (error) {
            console.warn(`Cleanup failed for file: ${filePath}`, error);
          }
        }
      }
      downloadedFiles.length = 0;
    });

    test(
      '[FL-434] Verify content QR share option via Standard User',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.QR_CODE],
      },
      async ({ endUserHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify content QR share option via Standard User',
          zephyrTestId: 'FL-434',
          storyId: 'FL-434',
        });

        //const qrName = TestDataGenerator.generateQRName('Content QR');
        const manageQRPage = new ManageQRPage(endUserHomePage.page);

        // await manageQRPage.openContent();
        // await manageQRPage.clickOnQRIcon();
        // await manageQRPage.verifyPromoteContentPageHeading();
        // await manageQRPage.fillQRName(qrName);
        // await manageQRPage.verifySaveAndVisitDashboardButtonIsNotVisible();
        // await manageQRPage.verifyDownloadQRButtonIsVisible();
        // await manageQRPage.clickOnDownloadQRButton();
        // await manageQRPage.verifyDownloadOptionsAreVisible();
        // const qrImagePath = await manageQRPage.downloadQRImage();
        // downloadedFiles.push(qrImagePath);
        // await manageQRPage.verifyPromoteContentModalIsClosed();
        // const qrContent = await manageQRPage.scanQRCode(qrImagePath);
        // const newPage = await manageQRPage.openScannedQRCodeLinkInNewTab(qrContent);
        // await manageQRPage.verifyContentPageIsOpenedSuccessfully(newPage);
        // await manageQRPage.clickOnQRIcon();
        // await manageQRPage.verifyPromoteContentPageHeading();
        // await manageQRPage.verifyQRNameFieldIsPrefilled(qrName);
        // await manageQRPage.clickOnDownloadQRButton();
        // const pdfPath = await manageQRPage.downloadPDF();
        // downloadedFiles.push(pdfPath);
        // await manageQRPage.verifyPromoteContentModalIsClosed();
      }
    );
  }
);
