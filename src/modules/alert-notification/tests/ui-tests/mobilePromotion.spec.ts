import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { ALERT_NOTIFICATION_MESSAGES } from '../../constants/messageRepo';
import { MobilePromotionPage } from '../../ui/pages/mobilePromotionPage';

import { tagTest } from '@/src/core/utils/testDecorator';
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
      tagTest(test.info(), {
        zephyrTestId: 'INT-22122',
      });

      //Verify mobile promotion download text is displayed
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionDownloadTextIsDisplayed();

      //verify mobile promotion icons are displayed
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionIosIconIsDisplayed();
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionAndroidIconIsDisplayed();

      //Click on the mobile promotion iOS icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      //verify mobile promotion modal is open
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyMobilePromotionModalIsOpen();

      //click on the dismiss button
      await mobilePromotionPage.commonActionsComponent.clickButton('Dismiss');

      //Click on the mobile promotion Android  icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionAndroidIcon();

      //verify mobile promotion modal is open
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyMobilePromotionModalIsOpen();

      //click on the dismiss button
      await mobilePromotionPage.commonActionsComponent.clickButton('Dismiss');
    });

    test('tc002 - verify App store mobile promotion section ', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29012',
      });

      //Click on the mobile promotion iOS icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      //verify mobile promotion modal is open
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyMobilePromotionModalIsOpen();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyDescriptionTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyScanQRButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetAppLinkButtonIsDisplayed();

      //click on the dismiss button
      await mobilePromotionPage.commonActionsComponent.clickButton('Dismiss');
    });

    test('tc003 - verify Google Play store mobile promotion section ', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29013',
      });
      //Click on the mobile promotion Android icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionAndroidIcon();

      //verify mobile promotion modal is open
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyMobilePromotionModalIsOpen();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyDescriptionTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyScanQRButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionQRModalComponent.verifyGetAppLinkButtonIsDisplayed();

      //click on the dismiss button

      await mobilePromotionPage.commonActionsComponent.clickButton('Dismiss');
    });

    test('tc004 - verify Android get app link section for SMS and Email', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29014',
      });
      //Click on the mobile promotion Android icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionAndroidIcon();

      //Click on the get app link button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySendMeLinkTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySMSButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySMSRadioButtonIsSelected();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyCountryCodeInputIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyPhoneNumberInputIsDisplayed();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.clickOnEmailButton();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailRadioButtonIsSelected();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailInputIsDisplayed();
      await mobilePromotionPage.commonActionsComponent.clickButton('Cancel');
    });

    test('tc005 - verify iOS get app link section for SMS and Email', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29015',
      });
      //Click on the mobile promotion Android icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      //Click on the get app link button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySendMeLinkTextIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySMSButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailButtonIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySMSRadioButtonIsSelected();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyCountryCodeInputIsDisplayed();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyPhoneNumberInputIsDisplayed();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.clickOnEmailButton();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailRadioButtonIsSelected();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailInputIsDisplayed();
      await mobilePromotionPage.commonActionsComponent.clickButton('Cancel');
    });

    // INT - 22066;
    test('tc006 - verify SMS input fields validations in mobile promotion for App Manager', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22066',
      });
      //Click on the mobile promotion Android icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      //Click on the get app link button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      //check pre -populated values for phone number input field
      await mobilePromotionPage.commonActionsComponent.verifyInputValue(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.phoneNumberInput,
        '4155555555'
      );

      //check error message with invalid phone number according to the US Country Code
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.enterPhoneNumber('1234567890');
      await mobilePromotionPage.commonActionsComponent.verifyInputValue(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.phoneNumberInput,
        '1234567890'
      );
      await mobilePromotionPage.commonActionsComponent.pressTab(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.phoneNumberInput
      );
      await mobilePromotionPage.commonActionsComponent.verifyErrorMessage(
        ALERT_NOTIFICATION_MESSAGES.INVALID_PHONE_NUMBER_INPUTFIELD_ERROR
      );

      //Clearing error message by clicking on scan QR button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnScanQRButton();
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      //check error message with empty phone number input field
      await mobilePromotionPage.commonActionsComponent.clearInputField(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.phoneNumberInput
      );
      await mobilePromotionPage.commonActionsComponent.pressTab(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.phoneNumberInput
      );
      await mobilePromotionPage.commonActionsComponent.verifyErrorMessage(
        ALERT_NOTIFICATION_MESSAGES.INVALID_PHONE_NUMBER_INPUTFIELD_ERROR
      );

      //Clearing error message by clicking on scan QR button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnScanQRButton();
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      //check error message with mobile number having 9 digits
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.enterPhoneNumber('415555555');
      await mobilePromotionPage.commonActionsComponent.verifyInputValue(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.phoneNumberInput,
        '415555555'
      );
      await mobilePromotionPage.commonActionsComponent.pressTab(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.phoneNumberInput
      );
      await mobilePromotionPage.commonActionsComponent.verifyErrorMessage(
        ALERT_NOTIFICATION_MESSAGES.INVALID_PHONE_NUMBER_INPUTFIELD_ERROR
      );
    });

    test('tc007 - verify Email input fields validations for App Manager', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-29016',
      });
      //Click on the mobile promotion Android icon
      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      //Click on the get app link button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.clickOnEmailButton();

      //check pre -populated values for phone number input field
      await mobilePromotionPage.commonActionsComponent.verifyInputValue(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.emailInput,
        'mahima.varshney@simpplr.com'
      );

      //check error message with invalid email address
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.enterEmail('mahima.varshney@simpplr');
      await mobilePromotionPage.commonActionsComponent.pressTab(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.emailInput
      );
      await mobilePromotionPage.commonActionsComponent.verifyErrorMessage(
        ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR
      );

      //Clearing error message by clicking on scan QR button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnScanQRButton();
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      //check error message with invalid email address
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.enterEmail('mahima.varshney@');
      await mobilePromotionPage.commonActionsComponent.pressTab(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.emailInput
      );
      await mobilePromotionPage.commonActionsComponent.verifyErrorMessage(
        ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR
      );

      //Clearing error message by clicking on scan QR button
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnScanQRButton();
      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      //check error message with invalid email address
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.enterEmail('mahima.varshney');
      await mobilePromotionPage.commonActionsComponent.pressTab(
        mobilePromotionPage.mobilePromotionEmailSMSComponent.emailInput
      );
      await mobilePromotionPage.commonActionsComponent.verifyErrorMessage(
        ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR
      );
    });

    test('tc008- Verify Mobile promotion via Email for Android', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22196',
      });

      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionAndroidIcon();

      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.clickOnEmailButton();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailRadioButtonIsSelected();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailInputIsDisplayed();

      await mobilePromotionPage.commonActionsComponent.clickButton('Send link');

      //verify toast message
      await mobilePromotionPage.commonActionsComponent.verifyToastMessage(
        ALERT_NOTIFICATION_MESSAGES.MOBILE_PROMOTION_SENT_SUCCESSFULLY + 'mahima.varshney@simpplr.com'
      );
    });

    test('tc009- Verify Mobile promotion via Email for iOS', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-21769',
      });

      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.clickOnEmailButton();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailRadioButtonIsSelected();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyEmailInputIsDisplayed();

      await mobilePromotionPage.commonActionsComponent.clickButton('Send link');

      //verify toast message
      await mobilePromotionPage.commonActionsComponent.verifyToastMessage(
        ALERT_NOTIFICATION_MESSAGES.MOBILE_PROMOTION_EMAIL_SMS_SENT + 'mahima.varshney@simpplr.com'
      );
    });

    test('tc010- Verify Mobile promotion via SMS for Android', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22014',
      });

      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionAndroidIcon();

      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySMSRadioButtonIsSelected();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyPhoneNumberInputIsDisplayed();

      await mobilePromotionPage.commonActionsComponent.clickButton('Send link');

      //verify toast message
      await mobilePromotionPage.commonActionsComponent.verifyToastMessage(
        ALERT_NOTIFICATION_MESSAGES.MOBILE_PROMOTION_EMAIL_SMS_SENT + '+14155555555'
      );
    });

    test('tc011- Verify Mobile promotion via SMS for iOS', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-22034',
      });

      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifySMSRadioButtonIsSelected();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyPhoneNumberInputIsDisplayed();

      await mobilePromotionPage.commonActionsComponent.clickButton('Send link');

      //verify toast message
      await mobilePromotionPage.commonActionsComponent.verifyToastMessage(
        ALERT_NOTIFICATION_MESSAGES.MOBILE_PROMOTION_EMAIL_SMS_SENT + '+14155555555'
      );
    });

    test('tc012- Verify user will get "User not found" when we send mobile promotion email and SMS to non registered users', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-21984',
      });

      await mobilePromotionPage.footerMobilePromotionComponent.clickOnMobilePromotionIosIcon();

      await mobilePromotionPage.mobilePromotionQRModalComponent.clickOnGetAppLinkButton();

      await mobilePromotionPage.mobilePromotionEmailSMSComponent.verifyPhoneNumberInputIsDisplayed();

      //   //check error message with mobile number having 9 digits
      await mobilePromotionPage.mobilePromotionEmailSMSComponent.enterPhoneNumber('4155555999');

      await mobilePromotionPage.commonActionsComponent.clickButton('Send link');

      //verify toast message
      await mobilePromotionPage.commonActionsComponent.verifyToastMessage('User not found');
    });

    test('tc013- Verify Mobile promotion not visible if settings disabled at application level', async () => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-17611',
      });

      //Disable distribution and promotion
      await mobilePromotionPage.navigateToApplicationMobileAppSettingsPage();
      await mobilePromotionPage.verifyDistributionAndPromotionTextIsDisplayed();
      await mobilePromotionPage.verifyEnableDistributionAndPromotionButtonIsDisplayed();
      await mobilePromotionPage.verifyDisableDistributionAndPromotionButtonIsDisplayed();
      await mobilePromotionPage.clickOnDisableDistributionAndPromotionButton();
      await mobilePromotionPage.commonActionsComponent.clickButton('Save');

      //Verify mobile promotion download text is not displayed
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionDownloadTextIsNotDisplayed();
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionIosIconIsNotDisplayed();
      await mobilePromotionPage.footerMobilePromotionComponent.verifyMobilePromotionAndroidIconIsNotDisplayed();

      //Enable distribution and promotion
      await mobilePromotionPage.navigateToApplicationMobileAppSettingsPage();
      await mobilePromotionPage.clickOnEnableDistributionAndPromotionButton();
      await mobilePromotionPage.commonActionsComponent.clickButton('Save');
    });
  }
);
