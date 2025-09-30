import { PopupType } from '@frontline/constants/popupType';
import { FrontlineFeatureTags, FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { ManageQRPage } from '@frontline/pages/manageQRPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  'Feature: QR Code Management',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.QR_CODE],
  },
  () => {
    const qrDetails: { qrName: string | undefined; qrDescription: string | undefined; qrCodeId: string | undefined } = {
      qrName: undefined,
      qrDescription: undefined,
      qrCodeId: undefined,
    };

    test.afterEach(async ({ qrManagementService }) => {
      if (qrDetails.qrCodeId) {
        try {
          await qrManagementService.deleteQRByID(qrDetails.qrCodeId);
        } catch (error) {
          console.warn(`Cleanup failed for QR: ${qrDetails.qrCodeId}`, error);
        }
      }
    });

    test(
      'Scenario: Verify creation of app promotion QR',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE, FrontlineFeatureTags.HEALTHCHECK],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Creation and validation of app promotion QR',
          zephyrTestId: 'FL-153',
          storyId: 'FL-153',
        });

        qrDetails.qrName = TestDataGenerator.generateQRName('AppPromotion');
        qrDetails.qrDescription = TestDataGenerator.generateQRDescription('App Promotion QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        await manageQRPage.loadPage();
        await manageQRPage.clickOnQRCodesMenu();
        qrDetails.qrCodeId = await manageQRPage.clickOnAddQRAndGetQRId('AppPromotion');
        await manageQRPage.verifyPromoteMobileAppPageHeading();
        await manageQRPage.fillQRName(qrDetails.qrName);
        await manageQRPage.fillDescription(qrDetails.qrDescription);
        await manageQRPage.clickEyeIcon();
        await manageQRPage.verifyPopupDisplayedByHeader(PopupType.PromotionPopup);
        await manageQRPage.verifyQRImageDisplayOnPreview();
        await manageQRPage.verifyQRDescriptionOnPreview(qrDetails.qrDescription);
        await manageQRPage.clickSaveAndVisit();
        await manageQRPage.verifyManagePage();
        await manageQRPage.verifyQRName(qrDetails.qrName);
        await manageQRPage.hoverOnToogle(qrDetails.qrName);
        await manageQRPage.validateToogleText();
      }
    );

    test(
      'Scenario: Verify delete app promotion QR code',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE, FrontlineFeatureTags.HEALTHCHECK],
      },
      async ({ appManagerHomePage, qrManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify delete app promotion QR code',
          zephyrTestId: 'FL-432',
          storyId: 'FL-432',
        });

        qrDetails.qrName = TestDataGenerator.generateQRName('AppPromotion');
        qrDetails.qrDescription = TestDataGenerator.generateQRDescription('App Promotion QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        await qrManagementService.createQR('AppPromotion', qrDetails.qrName, qrDetails.qrDescription);
        await manageQRPage.loadPage();
        await manageQRPage.deleteAppQRByName('AppPromotion', qrDetails.qrName);
        qrDetails.qrCodeId = undefined;
      }
    );

    test(
      'Scenario: Verify delete content QR code',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE, FrontlineFeatureTags.HEALTHCHECK],
      },
      async ({ appManagerHomePage, qrManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify delete content QR code',
          zephyrTestId: 'FL-431',
          storyId: 'FL-431',
        });

        qrDetails.qrName = TestDataGenerator.generateQRName('Content');
        qrDetails.qrDescription = TestDataGenerator.generateQRDescription('Content QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        await qrManagementService.createQR('Content', qrDetails.qrName, qrDetails.qrDescription);
        await manageQRPage.loadPage();
        await manageQRPage.deleteAppQRByName('Content', qrDetails.qrName);
        qrDetails.qrCodeId = undefined;
      }
    );

    test(
      'Scenario: Verify creation of content QR',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE, FrontlineFeatureTags.HEALTHCHECK],
      },
      async ({ appManagerHomePage, qrManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify creation of content QR',
          zephyrTestId: 'FL-427',
          storyId: 'FL-427',
        });
        qrDetails.qrName = TestDataGenerator.generateQRName('Content QR');
        qrDetails.qrDescription = TestDataGenerator.generateQRDescription('Content QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        await manageQRPage.loadPage();
        qrDetails.qrCodeId = await manageQRPage.clickOnAddQRAndGetQRId('Content');
        await manageQRPage.verifyContentQRModalHeading();
        await manageQRPage.fillQRName(qrDetails.qrName);
        await manageQRPage.selectDateFromToday(2);
        await manageQRPage.fillDescription(qrDetails.qrDescription);
        await manageQRPage.clickEyeIcon();
        await manageQRPage.verifyPopupDisplayedByHeader(PopupType.PreviewPopup);
        await manageQRPage.verifyQRImageDisplayOnPreview();
        await manageQRPage.verifyQRDescriptionOnPreview(qrDetails.qrDescription);
        await manageQRPage.clickSaveAndVisit();
        await manageQRPage.verifyManagePage();
        await manageQRPage.verifyQRName(qrDetails.qrName);
      }
    );

    test(
      '[FL-210] Verify enable Content and feature promotion from manage application as adminUser',
      {
        tag: [TestPriority.P2, FrontlineFeatureTags.QR_CODE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify enable Content and feature promotion from manage application as adminUser',
          zephyrTestId: 'FL-210',
          storyId: 'FL-210',
        });

        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        await manageQRPage.navigateToApplicationSetup();
        await manageQRPage.verifyContentAndFeatureText();
        await manageQRPage.checkContentAndFeatureCheckBox();
        await manageQRPage.saveChangesOnSetup();
        await manageQRPage.clickOnManage();
        await manageQRPage.verifyQRCodeMenuVisible();
      }
    );
  }
);
