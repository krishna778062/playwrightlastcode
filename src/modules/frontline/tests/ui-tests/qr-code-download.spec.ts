import { QR_MESSAGES } from '@frontline/constants/qrConstants';
import { FrontlineFeatureTags, FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { ManageQRPage } from '@frontline/pages/manageQRPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
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
    const qrDetails = {
      qrName: undefined as string | undefined,
      qrDescription: undefined as string | undefined,
      qrCodeId: undefined as string | undefined,
    };

    test.afterEach(async ({ qrManagementService }) => {
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

      if (qrDetails.qrCodeId) {
        try {
          await qrManagementService.deleteQRByID(qrDetails.qrCodeId);
        } catch (error) {
          console.warn(`Cleanup failed for QR: ${qrDetails.qrCodeId}`, error);
        }
        // Reset qrCodeId after cleanup to prevent it from being used in the next test
        qrDetails.qrCodeId = undefined;
      }
    });

    test(
      '[FL-434] Verify content QR share option via Standard User',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.QR_CODE, TestGroupType.HEALTHCHECK],
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
        qrDetails.qrCodeId = await qrManagementService.createQR('Content', qrDetails.qrName, qrDetails.qrDescription);

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

    test(
      '[FL-453] Verify content QR Enable Status',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.QR_CODE],
      },
      async ({ appManagerHomePage, qrManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify content QR Enable Status',
          zephyrTestId: 'FL-453',
          storyId: 'FL-453',
        });
        qrDetails.qrName = TestDataGenerator.generateQRName('Content');
        qrDetails.qrDescription = TestDataGenerator.generateQRDescription('Content QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        qrDetails.qrCodeId = await qrManagementService.createQR('Content', qrDetails.qrName, qrDetails.qrDescription);

        await manageQRPage.loadPage();
        await manageQRPage.verifyQRName(qrDetails.qrName);

        await manageQRPage.toggleQRStatus(qrDetails.qrName, false);
        await manageQRPage.verifyUpdatedSuccessMessage();

        await manageQRPage.toggleQRStatus(qrDetails.qrName, true);
        await manageQRPage.verifySuccessToastMessage(QR_MESSAGES.SUCCESSFULLY_UPDATED_QR_CODE);

        await manageQRPage.refreshPage();
        await manageQRPage.verifyQRStatusIsEnabled(qrDetails.qrName);
        const qrImagePath = await manageQRPage.downloadQRFromTable(qrDetails.qrName);
        downloadedFiles.push(qrImagePath);
        const qrContent = await manageQRPage.scanQRCode(qrImagePath);
        const newPage = await manageQRPage.openScannedQRCodeLinkInNewTab(qrContent);

        await manageQRPage.verifyContentPageIsOpenedSuccessfully(newPage);
      }
    );

    test(
      '[FL-212] Verify creation of content promotion QR from app manager',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.QR_CODE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify creation of content promotion QR from app manager',
          zephyrTestId: 'FL-212',
          storyId: 'FL-212',
        });

        const qrName = TestDataGenerator.generateQRName('Content Promotion QR');
        const qrDescription = TestDataGenerator.generateQRDescription('Content Promotion QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);

        await manageQRPage.loadPage();
        await manageQRPage.clickOnAddQR('Content');
        await manageQRPage.verifyContentQRModalHeading();
        await manageQRPage.fillQRName(qrName);
        await manageQRPage.fillDescription(qrDescription);
        await manageQRPage.selectDateFromToday(2);
        await manageQRPage.clickEyeIcon();
        await manageQRPage.verifyPreviewPopup();
        await manageQRPage.verifyQRImageDisplayOnPreview();
        await manageQRPage.clickOnDownloadQRButton();
        await manageQRPage.verifyDownloadOptionsAreVisible();
        const pdfPath = await manageQRPage.downloadPDF();
        downloadedFiles.push(pdfPath);
        await manageQRPage.verifyContentPromoteModalIsClosed();
        await manageQRPage.verifyManagePage();
      }
    );
  }
);
