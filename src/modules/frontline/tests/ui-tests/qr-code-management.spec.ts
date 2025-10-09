import { PopupType } from '@frontline/constants/popupType';
import { QR_SEARCH_TERMS } from '@frontline/constants/searchTerms';
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
        qrDetails.qrCodeId = undefined;
      }
    );

    test(
      '[FL-429] Verify edit content QR code as adminUser',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.QR_CODE],
      },
      async ({ appManagerHomePage, qrManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify edit content QR code as adminUser',
          zephyrTestId: 'FL-429',
          storyId: 'FL-429',
        });

        qrDetails.qrName = TestDataGenerator.generateQRName('Content QR');
        qrDetails.qrDescription = TestDataGenerator.generateQRDescription('Content QR');
        const updatedDescription = TestDataGenerator.generateQRDescription('Updated Content QR');
        const manageQRPage = new ManageQRPage(appManagerHomePage.page);

        await qrManagementService.createQR('Content', qrDetails.qrName, qrDetails.qrDescription);
        const qrList = await qrManagementService.getListOfQRCodes();
        const createdQR = qrList.qrCodes.find(qr => qr.name === qrDetails.qrName);
        qrDetails.qrCodeId = createdQR?.qrCodeId;

        await manageQRPage.loadPage();
        await manageQRPage.verifyManagePage();
        await manageQRPage.verifyQRName(qrDetails.qrName);

        await manageQRPage.clickOnThreeDots(qrDetails.qrName);
        await manageQRPage.clickOnEdit();

        await manageQRPage.verifyEditContentQRHeader();
        await manageQRPage.verifyAddContentDescription();
        await manageQRPage.verifyContentSearchBoxText();

        await manageQRPage.enterAndSelectContent();
        await manageQRPage.clickOnNextButton();
        await manageQRPage.verifyPromoteContentPageHeading();

        await manageQRPage.fillDescription(updatedDescription);
        await manageQRPage.clickSaveAndVisit();
        await manageQRPage.verifyManagePage();

        await manageQRPage.verifyUpdatedDescriptionOnListing(qrDetails.qrName, updatedDescription);

        await manageQRPage.clickOnThreeDots(qrDetails.qrName);
        await manageQRPage.clickOnEdit();
        await manageQRPage.verifyPagesAfterEdit();
      }
    );
  }
);

test(
  '[FL-149] Display QR codes under Manage as PromotionManager',
  {
    tag: [TestPriority.P2, FrontlineFeatureTags.QR_CODE],
  },
  async ({ promotionManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'Display QR Codes under Manage as PromotionManager',
      zephyrTestId: 'FL-149',
      storyId: 'FL-149',
    });

    const manageQRPage = new ManageQRPage(promotionManagerHomePage.page);
    await manageQRPage.loadPage();
    await manageQRPage.clickOnManage();
    await manageQRPage.verifyQRCodeMenuVisible();
  }
);

test(
  '[FL-415] Verify search qr, searching the textbox should provide valid results',
  {
    tag: [TestPriority.P2, FrontlineFeatureTags.QR_CODE],
  },
  async ({ appManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'Verify search qr, searching the textbox should provide valid results',
      zephyrTestId: 'FL-415',
      storyId: 'FL-415',
    });

    const manageQRPage = new ManageQRPage(appManagerHomePage.page);
    await manageQRPage.loadPage();
    await manageQRPage.clickOnManage();
    await manageQRPage.clickOnQRCodesMenu();
    await manageQRPage.verifyManagePage();
    await manageQRPage.clickOnSearchQRTextbox();
    await manageQRPage.fillSearchQRTextbox(QR_SEARCH_TERMS.VALID_SEARCH);
    await manageQRPage.hitEnterOnSearchBox();
    await manageQRPage.verifySearchResults(QR_SEARCH_TERMS.VALID_SEARCH);
    await manageQRPage.clickClearButton();
    await manageQRPage.fillSearchQRTextbox(QR_SEARCH_TERMS.INVALID_SEARCH);
    await manageQRPage.hitEnterOnSearchBox();
    await manageQRPage.verifyNothingToShowMessage();
  }
);

test(
  '[FL-416] Verify search status filter Active Inactive Expired as adminUser',
  {
    tag: [TestPriority.P2, FrontlineFeatureTags.QR_CODE],
  },
  async ({ appManagerHomePage, qrManagementService }) => {
    tagTest(test.info(), {
      description: 'Verify search status filter Active Inactive Expired as adminUser',
      zephyrTestId: 'FL-416',
      storyId: 'FL-416',
    });

    const manageQRPage = new ManageQRPage(appManagerHomePage.page);

    await manageQRPage.loadPage();
    await manageQRPage.verifyManagePage();
    const qrListData = await qrManagementService.getListOfQRCodes();
    const originalCount = qrListData.count;
    await manageQRPage.clickOnFilter();
    await manageQRPage.verifyFilterHeaderText();
    await manageQRPage.selectExpiredFilter();
    await manageQRPage.clickOnFilterApply();
    await manageQRPage.verifyAllExpiredQRs();
    await manageQRPage.clickOnFilter();
    await manageQRPage.clickOnFilterReset();
    await manageQRPage.verifyFilterReset();
    await manageQRPage.clickOnFilterApply();
    await manageQRPage.verifyQRAfterFilterReset(originalCount);
  }
);

test(
  '[FL-417] Verify search type filter Content App promotion as adminUser',
  {
    tag: [TestPriority.P2, FrontlineFeatureTags.QR_CODE],
  },
  async ({ appManagerHomePage, qrManagementService }) => {
    tagTest(test.info(), {
      description: 'Verify search type filter Content App promotion as adminUser',
      zephyrTestId: 'FL-417',
      storyId: 'FL-417',
    });

    const manageQRPage = new ManageQRPage(appManagerHomePage.page);

    await manageQRPage.loadPage();
    await manageQRPage.verifyManagePage();
    const qrListData = await qrManagementService.getListOfQRCodes();
    const originalCount = qrListData.count;
    await manageQRPage.clickOnFilter();
    await manageQRPage.verifyFilterHeaderText();
    await manageQRPage.selectAppPromotionTypeFilter();
    await manageQRPage.clickOnFilterApply();
    await manageQRPage.verifyValidTillDateIsNAForAllQRs();
    await manageQRPage.clickOnFilter();
    await manageQRPage.selectContentTypeFilter();
    await manageQRPage.verifyBothTypeFiltersAreChecked();
    await manageQRPage.clickOnFilterApply();
    await manageQRPage.verifyQRAfterFilterReset(originalCount);
    await manageQRPage.clickOnFilter();
    await manageQRPage.clickOnFilterReset();
    await manageQRPage.verifyTypeFiltersAreUnchecked();
    await manageQRPage.clickOnFilterApply();
    await manageQRPage.verifyQRAfterFilterReset(originalCount);
  }
);

test(
  '[FL-424] Verify combination of type and status filter as adminUser',
  {
    tag: [TestPriority.P2, FrontlineFeatureTags.QR_CODE],
  },
  async ({ appManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'Verify combination of type and status filter as adminUser',
      zephyrTestId: 'FL-424',
      storyId: 'FL-424',
    });

    const manageQRPage = new ManageQRPage(appManagerHomePage.page);
    await manageQRPage.loadPage();
    await manageQRPage.verifyManagePage();
    await manageQRPage.clickOnFilter();
    await manageQRPage.verifyFilterHeaderText();
    await manageQRPage.selectContentFilter();
    await manageQRPage.selectInactiveFilter();
    await manageQRPage.clickOnFilterApply();
    await manageQRPage.verifyInactiveQRs();
  }
);

test(
  '[FL-433] Verify content QR share option via promotion manager',
  {
    tag: [TestPriority.P1, FrontlineFeatureTags.QR_CODE, FrontlineFeatureTags.HEALTHCHECK],
  },
  async ({ promotionManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'Verify content QR share option via promotion manager',
      zephyrTestId: 'FL-433',
      storyId: 'FL-433',
    });

    const qrName = TestDataGenerator.generateQRName('Content QR');
    const manageQRPage = new ManageQRPage(promotionManagerHomePage.page);

    await manageQRPage.openContent();
    await manageQRPage.clickOnQRIcon();
    await manageQRPage.verifyPromoteContentPageHeading();
    await manageQRPage.fillQRName(qrName);
    await manageQRPage.clickSaveAndVisit();
    await manageQRPage.verifyManagePage();
    await manageQRPage.validateQRName(qrName);
  }
);

test(
  '[FL-995] Verify UI elements on the Manage QR page',
  {
    tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE, FrontlineFeatureTags.HEALTHCHECK],
  },
  async ({ appManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'Verify UI elements on the Manage QR page',
      zephyrTestId: 'FL-995',
      storyId: 'FL-995',
    });

    const manageQRPage = new ManageQRPage(appManagerHomePage.page);
    await manageQRPage.loadPage();
    await manageQRPage.verifyManagePage();
    await manageQRPage.verifyAddQRButton();
    await manageQRPage.verifySearchQRTextbox();
    await manageQRPage.verifySearchButton();
    await manageQRPage.verifyFilterButton();
    await manageQRPage.verifyQRCodesAddedHeaderText();
  }
);

test(
  '[FL-996] Verify table headers and QR action icons (View, Download, More options) on the Manage QR page',
  {
    tag: [TestPriority.P0, FrontlineFeatureTags.QR_CODE, FrontlineFeatureTags.HEALTHCHECK],
  },
  async ({ appManagerHomePage }) => {
    tagTest(test.info(), {
      description: 'Verify table headers are visible on the Manage QR page',
      zephyrTestId: 'FL-996',
      storyId: 'FL-996',
    });

    const manageQRPage = new ManageQRPage(appManagerHomePage.page);
    await manageQRPage.loadPage();
    await manageQRPage.verifyManagePage();
    await manageQRPage.verifyTableHeaders();
    await manageQRPage.verifyQRActionIcons();
  }
);
