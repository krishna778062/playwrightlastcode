import { TestPriority } from '@core/constants/testPriority';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FrontlineFeatureTags, FrontlineSuiteTags } from '../../constants/testTags';
import { frontlineTestFixture as test } from '../../fixtures/frontlineFixture';
import { ManageQRPage } from '../../pages/manageQRPage';

test.describe(
  'Feature: QR Code Management',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.QR_CODE],
  },
  () => {
    let qrName: string;
    let qrDescription: string;
    let shouldCleanup = false;

    test.beforeEach(async () => {
      qrName = TestDataGenerator.generateQRName('AppPromotion');
      qrDescription = TestDataGenerator.generateQRDescription('App Promotion QR');
      shouldCleanup = false;
    });

    test.afterEach(async ({ appManagerHomePage }) => {
      if (!shouldCleanup) return;

      try {
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);
        await manageQRPage.deleteAppQR(qrName);
      } catch (error) {
        console.warn(`Cleanup failed for QR: ${qrName}`, error);
      }
    });

    test(
      'Scenario: Verify creation of app promotion QR',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE],
      },
      async ({ appManagerHomePage }) => {
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);

        tagTest(test.info(), {
          description: 'Verify creation of app promotion QR',
          zephyrTestId: 'FL-153',
          storyId: 'FL-153',
        });

        await manageQRPage.clickOnManage();
        await manageQRPage.clickOnQRCodesMenu();
        await manageQRPage.clickOnAddQR();
        await manageQRPage.clickOnAppPromotion();
        await manageQRPage.verifyPromoteMobileAppPageHeading();
        await manageQRPage.fillQRName(qrName);
        await manageQRPage.fillDescription(qrDescription);
        await manageQRPage.clickEyeIcon();
        await manageQRPage.verifyPopupDisplayedByHeader('Promote mobile app via QR');
        await manageQRPage.verifyQRImageDisplayOnPreview();
        await manageQRPage.verifyQRDescriptionOnPreview(qrDescription);
        await manageQRPage.clickSaveAndVisit();
        await manageQRPage.verifyManagePage();
        await manageQRPage.verifyQRName(qrName);

        shouldCleanup = true;
      }
    );
  }
);
