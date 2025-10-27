import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { MobilePromotionPage } from '../../ui/pages/mobilePromotionPage';

import { appManagerFixture as test } from '@/src/modules/alert-notification/tests/fixtures/fixtures';

test.describe(
  '[Alert Notification] Mobile Promotion - full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.MOBILE_PROMOTION],
  },
  () => {
    let mobilePromotionPage: MobilePromotionPage;

    test.beforeEach(async ({ appManager }) => {
      // Navigate directly to home page after login
      mobilePromotionPage = new MobilePromotionPage(appManager);
      await mobilePromotionPage.verifyThePageIsLoaded();
    });

    test('tc001 - verify mobile promotion section is displayed when settings are enabled at application level', async () => {
      //Verify mobile promotion download text is displayed
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionDownloadTextIsDisplayed();

      //verify mobile promotion icons are displayed
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionIosIconIsDisplayed();
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionAndroidIconIsDisplayed();

      //Click on the mobile promotion iOS icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      //verify mobile promotion modal is open
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyMobilePromotionModalIsOpen();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetSimpplrOnYourMobileTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyDescriptionTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyScanQRButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetAppLinkButtonIsDisplayed();

      //click on the dismiss button
      await mobilePromotionPage.clickOnDismissButton();
    });

    test('tc002 - verify App store mobile promotion section ', async () => {
      //Click on the mobile promotion iOS icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      //verify mobile promotion modal is open
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyMobilePromotionModalIsOpen();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetSimpplrOnYourMobileTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyDescriptionTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyScanQRButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetAppLinkButtonIsDisplayed();

      //click on the dismiss button
      await mobilePromotionPage.clickOnDismissButton();
    });

    test('tc003 - verify Google Play store mobile promotion section ', async () => {
      //Click on the mobile promotion Android icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionAndroidIcon();

      //verify mobile promotion modal is open
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyMobilePromotionModalIsOpen();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetSimpplrOnYourMobileTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyDescriptionTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyScanQRButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetAppLinkButtonIsDisplayed();

      //click on the dismiss button
      await mobilePromotionPage.clickOnDismissButton();
    });

    test('tc004 - verify Android get app link section for SMS and Email', async () => {
      //Click on the mobile promotion Android icon
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();
    });
  }
);
