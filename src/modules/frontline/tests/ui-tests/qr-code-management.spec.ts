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

    test.afterEach(async ({ appManagerHomePage }) => {
      if (qrDetails.qrName) {
        try {
          const manageQRPage = new ManageQRPage(appManagerHomePage.page);
          await manageQRPage.deleteAppQRByName(qrDetails.qrName);
        } catch (error) {
          console.warn(`Cleanup failed for QR: ${qrDetails.qrName}`, error);
        }
      }
    });

    test(
      'Scenario: Verify creation of app promotion QR',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE],
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
        await manageQRPage.verifyPopupDisplayedByHeader('Promote mobile app via QR');
        await manageQRPage.verifyQRImageDisplayOnPreview();
        await manageQRPage.verifyQRDescriptionOnPreview(qrDetails.qrDescription);
        await manageQRPage.clickSaveAndVisit();
        await manageQRPage.verifyManagePage();
        await manageQRPage.verifyQRName(qrDetails.qrName);
        await manageQRPage.hoverOnToogle(qrDetails.qrName);
        await manageQRPage.validateToogleText();
      }
    );
  }
);
