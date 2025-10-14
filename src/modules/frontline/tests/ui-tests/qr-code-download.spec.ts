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
    const qrDetails: { qrName: string | undefined; qrDescription: string | undefined; qrCodeId: string | undefined } = {
      qrName: undefined,
      qrDescription: undefined,
      qrCodeId: undefined,
    };

    test.afterEach(async ({ qrManagementService }) => {
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

      // Cleanup created QR codes
      if (qrDetails.qrCodeId) {
        try {
          await qrManagementService.deleteQRByID(qrDetails.qrCodeId);
        } catch (error) {
          console.warn(`Cleanup failed for QR: ${qrDetails.qrCodeId}`, error);
        }
      }
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

        const qrName = TestDataGenerator.generateQRName('Content QR');
        const manageQRPage = new ManageQRPage(endUserHomePage.page);

        await manageQRPage.openContent();
        await manageQRPage.clickOnQRIcon();
        await manageQRPage.verifyPromoteContentPageHeading();
        await manageQRPage.fillQRName(qrName);
        await manageQRPage.verifySaveAndVisitDashboardButtonIsNotVisible();
        await manageQRPage.verifyDownloadQRButtonIsVisible();
        await manageQRPage.clickOnDownloadQRButton();
        await manageQRPage.verifyDownloadOptionsAreVisible();
        const qrImagePath = await manageQRPage.downloadQRImage();
        downloadedFiles.push(qrImagePath);
        await manageQRPage.verifyPromoteContentModalIsClosed();
        const qrContent = await manageQRPage.scanQRCode(qrImagePath);
        const newPage = await manageQRPage.openScannedQRCodeLinkInNewTab(qrContent);
        await manageQRPage.verifyContentPageIsOpenedSuccessfully(newPage);
        await manageQRPage.clickOnQRIcon();
        await manageQRPage.verifyPromoteContentPageHeading();
        await manageQRPage.verifyQRNameFieldIsPrefilled(qrName);
        await manageQRPage.clickOnDownloadQRButton();
        const pdfPath = await manageQRPage.downloadPDF();
        downloadedFiles.push(pdfPath);
        await manageQRPage.verifyPromoteContentModalIsClosed();
      }
    );

    test(
      '[FL-452] Verify content QR Disable Status',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.QR_CODE],
      },
      async ({ appManagerHomePage, qrManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify content QR Disable Status',
          zephyrTestId: 'FL-452',
          storyId: 'FL-452',
        });
        qrDetails.qrName = TestDataGenerator.generateQRName('Content');
        qrDetails.qrDescription = TestDataGenerator.generateQRDescription('Content QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        await qrManagementService.createQR('Content', qrDetails.qrName, qrDetails.qrDescription);

        const qrList = await qrManagementService.getListOfQRCodes();
        const createdQR = qrList.qrCodes.find(qr => qr.qrName === qrDetails.qrName);
        if (createdQR) {
          qrDetails.qrCodeId = createdQR.qrCodeId;
        }

        await manageQRPage.loadPage();
        await manageQRPage.verifyQRName(qrDetails.qrName);

        await manageQRPage.toggleQRStatus(qrDetails.qrName, false);
        await manageQRPage.verifyUpdatedSuccessMessage();

        await manageQRPage.refreshPage();
        await manageQRPage.verifyQRStatusIsDisabled(qrDetails.qrName);

        const qrImagePath = await manageQRPage.downloadQRFromTable(qrDetails.qrName);
        downloadedFiles.push(qrImagePath);
        const qrContent = await manageQRPage.scanQRCode(qrImagePath);
        const newPage = await manageQRPage.openScannedQRCodeLinkInNewTab(qrContent);

        await manageQRPage.verifyQRCodeExpiredMessage(newPage, 'This QR code is either expired or has been deleted.');
      }
    );
  }
);
