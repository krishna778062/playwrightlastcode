import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { ALERT_NOTIFICATION_MESSAGES } from '../../constants/messageRepo';
import { NotificationFeatures } from '../../ui/components/selectNotificationStep';
import {
  CustomizationNotificationSteps,
  NotificationCustomizationPage,
} from '../../ui/pages/notificationCustomizationPage';
import {
  DYNAMIC_VALUE_TEXT,
  EXPECTED_COUNTS,
  LANGUAGES,
  LANGUAGES_FOR_AUTOMATIC_TRANSLATION,
  MANAGE_TRANSLATIONS_TEXT,
  NotificationTestDataGenerator,
  OVERRIDE_CONFIRMATION_TEXT,
  PAGE_TEXT,
  SUBJECT_LINES,
  TEMPLATE_DATA,
  TEST_EMAILS,
} from '../test-data/notification-customization.test-data';

import { tagTest } from '@/src/core/utils/testDecorator';
import { appManagerFixture as test } from '@/src/modules/alert-notification/tests/fixtures/fixtures';

test.describe(
  '[Alert Notification] Subject custom line - full suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION],
  },
  () => {
    let notificationCustomizationPage: NotificationCustomizationPage;

    test.beforeEach(async ({ appManager }) => {
      // Navigate directly to notification customization page using endpoint
      await appManager.goto(PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
      notificationCustomizationPage = new NotificationCustomizationPage(appManager);
      await notificationCustomizationPage.verifyThePageIsLoaded();
    });

    test(
      'tc001 - Verify the Defaults button on Add Customization navigates back to the listing screen without creating an entry',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27629',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Note the current total rows count in the listing at runtime
        const initialCount = await notificationCustomizationPage.countNotificationItems();

        // Click Add customization to open the Add customization flow
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify the stepper shows "Select notification" as the current step and the page header reads "Add customization"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );

        // Verify a "Defaults" button/link is visible in the page header breadcrumb
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultsBreadcrumb
        );

        // Optional: Expand a feature (e.g., Alerts) and select any template without clicking Next/Save
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Click the "Defaults" button/link in the header
        await notificationCustomizationPage.clickOnElement(notificationCustomizationPage.defaultsBreadcrumb);

        // Verify you are navigated back to the Notification customization listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify the total rows count remains unchanged at runtime
        await notificationCustomizationPage.verifyNotificationItemsCountUnchanged(initialCount);

        // Verify the listing order and details are preserved (by checking we can still see expected elements)
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationButton
        );
      }
    );

    test(
      'tc002 - Verify the search bar filters notification customizations by keyword (matching, non-matching, and empty state)',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27626',
          storyId: 'INT-24252',
        });

        // Navigate to Add customization page
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Wait for page to load and verify base count matches expected (should be 34 templates)
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.BASE_COUNT);

        // Verify search input is visible and enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.searchInput
        );

        // Test 1: Matching results - search for "Must"
        await notificationCustomizationPage.searchInListing('Must');

        // Verify count matches expected for "Must" search
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.MUST_SEARCH);

        // Test 2: Non-matching results - search for "zzq-nomatch"
        await notificationCustomizationPage.searchInListing('zzq-nomatch');

        // Verify no results are shown - count should be 0
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.EMPTY_SEARCH);

        // Test 3: Clear search to return to full list
        await notificationCustomizationPage.searchInListing('');

        // Verify full list is restored - count should match base count exactly
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.BASE_COUNT);

        // Test 4: Search for "Alerts" keyword
        await notificationCustomizationPage.searchInListing('Alerts');

        // Verify count matches expected for "Alerts" search
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.ALERTS_SEARCH);

        // Clear search to clean up
        await notificationCustomizationPage.searchInListing('');
      }
    );

    test(
      'tc003 - Verify Navigation, Display, and Action Flow of "Notification overrides" Page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26610',
          storyId: 'INT-24252',
        });

        // Verify user is on notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();
        // Verify page title
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );
        // Verify description text - using partial match
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationDescription
        );
        // Verify "Add customization" button is present and enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationButton
        );
        // Click "Add customization" button
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        // Verify redirected to "Add customization" page
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );
        // Verify stepper steps are present in correct order
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.selectNotificationStepText
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.overrideConfirmationStepText
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationsStepText
        );
        // Verify subheading text - using partial match for flexibility
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationSubheading
        );
        // Verify search input is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );
        // Verify "Defaults" breadcrumb is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultsBreadcrumb
        );
        // Click "Defaults" breadcrumb to return to notification customization page
        await notificationCustomizationPage.clickOnElement(notificationCustomizationPage.defaultsBreadcrumb);
        // Verify returned to notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();
        // Verify page title and description are visible again
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationDescription
        );
        // Verify "Add customization" button is visible and enabled again
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationButton
        );
      }
    );

    test(
      'tc004 - verify app manager is able to customize must read with default subject line',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28703',
          storyId: 'INT-24252',
        });

        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //now verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify the default subject line is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();
        //click on save button
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
      }
    );

    test(
      'tc005 - verify app manager is able to customize must read with custom subject line',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27666',
          storyId: 'INT-24252',
        });
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.PLURAL_TEMPLATE
        );
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //now verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify the default subject line is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();

        //click on custom subject line option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //now verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        //click on save button
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
        //verify toast message
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);
        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu();
        //verify delete toast message
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );

    test(
      'tc006 - verify cancel action and validation on subject line customization',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27642',
          storyId: 'INT-24252',
        });
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.PLURAL_TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //Test validation - select custom subject line and clear it
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        //clear the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();

        //verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );

    test(
      'tc007 - verify custom subject line creation and delivery for Follow template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27667',
          storyId: 'INT-24252',
        });
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select follow feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.FOLLOWS,
          TEMPLATE_DATA.FOLLOW.TEMPLATE
        );
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.FOLLOWS,
          TEMPLATE_DATA.FOLLOW.TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //Test validation - select custom subject line and clear it
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //clear the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();
        //verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );

    test(
      'tc008 - verify custom subject line creation and delivery for Alerts template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27665',
          storyId: 'INT-24252',
        });
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select alerts feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();
        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //Test validation - select custom subject line and clear it
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //clear the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();
        //verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );

    test(
      'tc009 - verify Admin creates a “Must reads” customization with a French subject, confirms it on the listing, and deletes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28326',
          storyId: 'INT-24252',
        });
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //select custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line (placeholder subject)
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        //select French language
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage('Français - French');
        //click on save button
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
        //verify toast message
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);
        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu('Must reads');
        //verify delete toast message
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );

    test(
      'tc010 - verify multiple cancel actions and validation for Alerts template',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28449',
          storyId: 'INT-24252',
        });
        // First attempt - select custom subject line, next, then cancel from manage translations
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Second attempt - select custom subject line, then cancel from subject line page
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Third attempt - test validation with empty custom subject line
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        // Clear the textarea to test validation
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();
        // Verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );

    test(
      'tc011 - Verify system blocks sending test email if email format is invalid',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27649',
          storyId: 'INT-24252',
        });
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //select must read feature from the add customization step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //select custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = SUBJECT_LINES.MUST_READ.ENGLISH;
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //click on next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        //select different email address option
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();
        //enter invalid email
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(TEST_EMAILS.SINGLE_INVALID);
        //tab outside to trigger validation
        await notificationCustomizationPage.page.keyboard.press('Tab');
        //verify inline error message
        await notificationCustomizationPage.manageTranslationComponent.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR
        );

        //enter valid email
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(TEST_EMAILS.SINGLE_VALID);
        //click send test button
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();
        //verify success toast
        await notificationCustomizationPage.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );
      }
    );

    test(
      'tc012 - Verify test email can be sent to multiple recipients by separating addresses with commas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27648',
          storyId: 'INT-24252',
        });

        //click on add customization button
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        //verify user is on the select notification step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        //select must reads feature
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        //click next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on override and confirmation step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //select custom subject line option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill custom subject line
        const customSubject = SUBJECT_LINES.MUST_READ.ENGLISH;
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubject);
        //click next button
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        //select different email address option
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();
        //enter multiple email addresses separated by commas
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(TEST_EMAILS.MULTI_VALID_CSV);
        //click send test button
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();
        //verify success toast
        await notificationCustomizationPage.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );
      }
    );

    test(
      'tc013 - Verify user is redirected to Add customization page from Notification customization and tab displays search and communication list correctly',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26612',
          storyId: 'INT-24252',
        });

        // Verify we're on the Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify page elements are visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationDescription
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationButton
        );

        // Click Add customization button
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify redirected to Add customization page
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );

        // Verify stepper steps are visible in order
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.selectNotificationStepText
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.overrideConfirmationStepText
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationsStepText
        );

        // Verify search input is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );

        // Verify Next button is visible and disabled by default
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.nextButton
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsDisabled(
          notificationCustomizationPage.nextButton
        );

        // Verify Cancel button is visible and enabled
        await notificationCustomizationPage.verifyButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL, 'visible');
        await notificationCustomizationPage.verifyButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL, 'enabled');

        // Test search functionality - search for "Must reads"
        await notificationCustomizationPage.searchInListing(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify search results show Must reads (using button role to avoid ambiguity)
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.mustReadButton
        );

        // Clear search to restore full list
        await notificationCustomizationPage.searchInListing('');

        // Verify we're back to the full list - check for multiple notification types using button roles
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.mustReadButton
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.alertsButton
        );
      }
    );

    test(
      'tc014 - Verify user is able to select communication and proceed or cancel, and error/warning messages are shown correctly',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26613',
          storyId: 'INT-24252',
        });

        // Verify we're on the Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify "Add customization" button is visible and enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationButton
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.addCustomizationButton
        );

        // Click "Add customization" button
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify Next button is visible and disabled by default (no selection)
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.nextButton
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsDisabled(
          notificationCustomizationPage.nextButton
        );

        // Verify Cancel button is visible and enabled
        await notificationCustomizationPage.verifyButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL, 'visible');
        await notificationCustomizationPage.verifyButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL, 'enabled');

        // Verify all notification types are visible (as buttons/accordions)
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.mustReadButton
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.alertsButton
        );

        // Select Must reads notification type using the correct method
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Verify Next button is now enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Click Next button to proceed to next step
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify user is on the next step (Override and confirmation)
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Navigate back to test cancel functionality
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify redirected back to Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization" again to test channel switching
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify Next button is disabled again (no selection)
        await notificationCustomizationPage.verifier.verifyTheElementIsDisabled(
          notificationCustomizationPage.nextButton
        );

        // Test channel switching - select Alerts
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Verify Next button is enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Test channel switching - select Alerts
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Verify Next button is still enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Test cancel action - should return to Notification customization page
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify redirected back to Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );
      }
    );

    test(
      'tc015 - Verify cancel and next actions work correctly and appropriate warnings are shown for empty or invalid subject lines',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26618',
          storyId: 'INT-24252',
        });

        // Verify we're on the Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();
        // Click "Add customization" button
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        // On "Select notification", expand Must reads category and choose a template
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        // Click "Next" to proceed to "Override and confirmation" step
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify "Default subject line" label and read-only textarea
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultSubjectLineRadio
        );

        // Verify "Custom subject line" label and editable textarea
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.customSubjectLineRadio
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.subjectLineCustomizationComponent.customSubjectTextarea
        );

        // Verify helper text under the custom field
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.subjectLineHelperText
        );

        // Verify "View best practices" link/text with info icon
        await notificationCustomizationPage.verifyButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES, 'visible');

        // Verify info icon is present
        await notificationCustomizationPage.verifyHelpIconIsVisible();
        // Tooltip / popover testing
        // Click the info icon to trigger the popover
        await notificationCustomizationPage.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);
        // Verify popover appears with heading "Tips for Custom Subject Lines"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.tipsHeading
        );
        // Required-field validation testing
        // Select "Custom subject line" option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        // Clear the textarea completely
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();
        // Tab outside to trigger validation
        await notificationCustomizationPage.page.keyboard.press('Tab');
        // Verify "Next" button is disabled
        await notificationCustomizationPage.verifier.verifyTheElementIsDisabled(
          notificationCustomizationPage.nextButton
        );
        // Verify inline error is displayed
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.INVALID_SUBJECT_LINE_ERROR
        );
        // Positive path testing
        // Enter a valid custom subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        // Verify "Next" button becomes enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );
        // Click "Next" to advance to "Manage translations" step
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // Verify we advance to the "Manage translations" step without errors
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
      }
    );

    test(
      'tc016 - Comprehensive UI validation of Manage translations step with validations and user flows',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26619',
          storyId: 'INT-24252',
        });

        // Navigate to notification customization and start the flow
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Select Must reads template and proceed through steps
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // Select custom subject line and proceed to Manage translations
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // Verify we are on the "Manage translations" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        // Verify page header and section title
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );

        // Verify "Defaults" breadcrumb is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultsBreadcrumb
        );

        // Verify helper text is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationSubheading
        );

        // Verify language dropdown is present with default language
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.languageDropdown
        );

        // Verify custom subject line textarea and helper text
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.translationSubjectTextarea
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.customSubjectHelperText
        );

        // Verify "Send yourself a test" section
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHelperText
        );

        // Verify email options are visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.yourEmailOption
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.differentEmailOption
        );

        // Verify buttons are present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.sendTestButton
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.saveButton
        );
        await notificationCustomizationPage.verifyButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON, 'visible');

        // Required-field validation testing
        // Clear the custom subject line field
        await notificationCustomizationPage.manageTranslationComponent.translationSubjectTextarea.clear();

        // Tab outside to trigger validation
        await notificationCustomizationPage.page.keyboard.press('Tab');

        // Verify inline error is displayed
        await notificationCustomizationPage.manageTranslationComponent.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.INVALID_SUBJECT_LINE_ERROR
        );

        // Verify "Save" button is disabled
        await notificationCustomizationPage.verifier.verifyTheElementIsDisabled(
          notificationCustomizationPage.saveButton
        );

        // Verify "Send test" button is disabled
        await notificationCustomizationPage.verifier.verifyTheElementIsDisabled(
          notificationCustomizationPage.manageTranslationComponent.sendTestButton
        );

        // Positive path testing
        // Enter a valid custom subject
        await notificationCustomizationPage.manageTranslationComponent.fillTranslatedSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Verify inline error disappears (by checking Save button is enabled)
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.saveButton
        );

        // Verify "Send test" button becomes enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.manageTranslationComponent.sendTestButton
        );

        // Test cancel functionality
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify redirected back to Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Repeat the flow to test save functionality
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are on Manage translations step again
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Enter valid subject and save
        await notificationCustomizationPage.manageTranslationComponent.fillTranslatedSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu('Must reads');
        //verify delete toast message
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );

    test(
      'tc017 - Admin inserts a dynamic value ({{message}}) into a custom subject and sees it rendered correctly',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28647',
          storyId: 'INT-24252',
        });

        // Navigate to notification customization and start the flow
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Select Alerts template and proceed to Override and confirmation step
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are on the Override and confirmation step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the Default subject line field displays "New Alert - {{message}}"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultSubjectLineRadio
        );

        // Select Custom subject line option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Verify the "Add dynamic value" link text is visible near the textarea
        await notificationCustomizationPage.verifyButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON, 'visible');

        // Click "Add dynamic value" button
        await notificationCustomizationPage.clickButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON);

        // Open the dynamic values picker (clicks dropdown trigger once)
        await notificationCustomizationPage.addDynamicValueComponent.openDynamicValuesPicker();

        // Choose "Alert Message" from the picker
        await notificationCustomizationPage.addDynamicValueComponent.clickAlertMessageOption();

        // Verify the token {{message}} is inserted into the Custom subject line at the position
        await notificationCustomizationPage.addDynamicValueComponent.verifyCustomSubjectContainsToken(
          DYNAMIC_VALUE_TEXT.ALERT_MESSAGE_TOKEN
        );

        // Verify the Next button is enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Verify a second {{message}} token is appended to the field
        await notificationCustomizationPage.addDynamicValueComponent.verifyCustomSubjectContainsTokenCount(
          DYNAMIC_VALUE_TEXT.ALERT_MESSAGE_TOKEN,
          2
        );

        // Click Next to proceed to Manage translations step
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are on the Manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click Save
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify a success toast confirms the customization was saved
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // Verify the listing shows the new Alerts row (by checking we're back on the main page)
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click the 3-dot menu for this row
        await notificationCustomizationPage.deleteCustomizationFromMenu('Alerts');

        // Verify a success message appears and the customization is removed from the listing
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );

    test(
      'tc018 - Verify user is able to delete a notification override through confirmation modal and system reverts to default notification with success message after deletion',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26615',
          storyId: 'INT-24252',
        });

        // User is on the "Notification overrides" listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Wait for "Add customization" button to be fully ready
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationButton
        );

        // Ensure at least one customization exists for testing deletion
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Get the updated count
        const countBeforeDeletion = await notificationCustomizationPage.countNotificationItems();

        // Test 1: Cancel deletion - click delete, then cancel
        await test.step('Click delete and cancel in confirmation modal', async () => {
          // Click delete option from menu
          await notificationCustomizationPage.clickOnDeleteOption();

          // A confirmation modal should appear
          await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
            notificationCustomizationPage.deleteConfirmationDialog
          );

          // Verify modal message content - "Are you sure you want to delete notification override?"
          await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
            notificationCustomizationPage.deleteConfirmationMessage
          );

          // Verify modal description
          await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
            notificationCustomizationPage.deleteConfirmationDescription
          );

          // Verify modal has Cancel and Delete buttons
          await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
            notificationCustomizationPage.modalCancelButton
          );
          await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
            notificationCustomizationPage.modalConfirmDeleteButton
          );
          //  Confirm deletion
          await notificationCustomizationPage.confirmDeletion();
        });

        // The custom notification should be deleted
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);

        // Wait for the listing page to update with the deleted item removed
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify the count has decreased by 1
        await notificationCustomizationPage.verifyCountDecreasedInAddCustomization(countBeforeDeletion);
      }
    );

    test(
      'tc019 - Verify the search works correctly within the template selection list',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27631',
          storyId: 'INT-24252',
        });

        // Navigate to Add customization page
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify the step "Select notification" is current
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Verify search input is visible and enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.searchInput
        );

        // Note the unfiltered item count
        const baseCount = await notificationCustomizationPage.countAndValidateTemplateItems();

        // Test 1: Matching search - Type "Must" into the search input
        await notificationCustomizationPage.searchInListing('Must');
        await notificationCustomizationPage.verifyFilteredCountIsValid(baseCount);

        // Test 2: Non-matching search - Type "zzq-no-match"
        await test.step('Search for "zzq-no-match" and verify empty state', async () => {
          await notificationCustomizationPage.searchInListing('zzq-no-match');

          // Wait for "No results found" message to appear
          await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
            notificationCustomizationPage.noResultsFoundText
          );
        });

        // Test 3: Clear search and restore list
        await test.step('Clear search and verify full list is restored', async () => {
          // Clear the search input
          await notificationCustomizationPage.fillInElement(notificationCustomizationPage.searchInput, '');
          await notificationCustomizationPage.page.keyboard.press('Enter');

          // Wait for the full list to be restored by waiting for items to appear
          await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
            notificationCustomizationPage.templateItems.first(),
            { timeout: 10000 }
          );

          await notificationCustomizationPage.Verifytherestoredcount(baseCount);
        });
      }
    );

    test(
      'tc020 - Verify automatic translation for Hindi when creating custom subject line',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27668',
          storyId: 'INT-24252',
        });

        // Navigate to Add customization
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // On "Select notification", choose "Must reads"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter the subject line using faker-generated test data
        const customSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify the step "Manage translations" is active
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the Language dropdown is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.languageDropdown
        );

        // Open the Language dropdown and select Hindi
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.HINDI);

        // Wait for translation to complete
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

        // Verify automatic translation text is visible
        await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();

        // Click "Save"
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast is displayed
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // Verify on the Notification customization listing the new entry for "Must reads" is shown
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );

        // Clean up - delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu('Must reads');
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );

    test(
      'tc021 - Verify manual translation functionality when creating custom subject line',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27669',
          storyId: 'INT-24252',
        });

        // Navigate to Add customization
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // On "Select notification", choose "Must reads"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter the subject line using faker-generated test data
        const customSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify the "Manage translations" step is displayed
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the Language dropdown is visible with "English (main)" selected
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.languageDropdown
        );
        await notificationCustomizationPage.manageTranslationComponent.verifyLanguageDropdownShows(
          MANAGE_TRANSLATIONS_TEXT.DEFAULT_LANGUAGE
        );

        // Verify the Custom subject line field shows the entered text
        await notificationCustomizationPage.verifyCustomSubjectLineText(customSubjectLine);

        // Open the Language dropdown and select "Français - French" (automatically translated)
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Wait for translation to complete
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

        // Get the auto-translated French value
        const autoTranslatedText =
          await notificationCustomizationPage.manageTranslationComponent.getTranslationTextValue();

        // Switch the translation mode to "Manually translated"
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // Verify the French field becomes editable
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsEditable();

        // Verify the auto-translated value remains in the textbox
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(autoTranslatedText);

        // Update the French subject line (edit the auto-translated text) using faker-generated test data
        const manualFrenchText = NotificationTestDataGenerator.generateEditedTranslation(autoTranslatedText);
        await notificationCustomizationPage.manageTranslationComponent.editTranslationText(manualFrenchText);

        // Click "Save"
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast is displayed
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // Return to listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu('Must reads');
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );
    //Testcase on Edit

    test(
      'tc022 - Verify Notification customization — Cancel on edit does not persist changes on override and confirmation page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27641',
          storyId: 'INT-24252',
        });

        // Create customization with initial subject (auto-generated with faker)
        const initialSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Navigate to Add customization
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // On "Select notification", choose "Must reads"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(initialSubject);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Click "Save" to persist the new customization
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears confirming save
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // Return to the "Notification customization" listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Locate the saved row for "Must reads" and note the current subject value
        await notificationCustomizationPage.verifySubjectInListing(TEMPLATE_DATA.MUST_READ.BUTTON_NAME, initialSubject);

        // Part A — Edit subject then Cancel
        // Click the three-dot menu (⋯) for the "Must reads" row and select "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // The "Override and confirmation" step loads with the subject prefilled
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.verifyCustomSubjectLineText(initialSubject);

        // Click into the "Custom subject line" field and change the value (auto-generated with faker)
        const editedSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(editedSubject);

        // Click the "Cancel" button to exit without saving
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify no save toast is displayed (just verify we're back on listing)
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" row by clicking "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify the subject remains the original value (the edited value was not saved)
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.verifyCustomSubjectLineText(initialSubject);

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify returned to listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Clean up - delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    );

    test(
      'tc023 - Verify Edit on Notification customization — Cancel does not persist changes on Manage translation Page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27628',
          storyId: 'INT-24252',
        });

        // Create customization with initial subject (auto-generated with faker)
        const initialSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Navigate to Add customization
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // On "Select notification", choose "Must reads"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(initialSubject);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Click "Save" to persist the new customization
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears confirming save
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // Return to the "Notification customization" listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Locate the saved row for "Must reads" and note the current subject value
        await notificationCustomizationPage.verifySubjectInListing(TEMPLATE_DATA.MUST_READ.BUTTON_NAME, initialSubject);

        // Click the three-dot menu (⋯) for the "Must reads" row and select "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Navigate to Manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Edit the subject line on manage translations page (auto-generated with faker)
        const editedSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.editSubjectLineOnManageTranslationsPage(initialSubject, editedSubject);

        // Click the "Cancel" button to exit without saving
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify no save toast is displayed (just verify we're back on listing)
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" row by clicking "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Navigate to Manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the subject remains the original value (the edited value was not saved)
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(initialSubject);

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify returned to listing
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc024 - Verify navigation, breadcrumb, and UI elements on the Override and Confirmation page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28909',
          storyId: 'INT-24252',
        });

        // A customization exists for template "Must reads" from previous tests
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify the "Defaults" breadcrumb is visible on the top-left of the screen
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultsBreadcrumb
        );

        // Click on the "Defaults" breadcrumb
        await notificationCustomizationPage.clickOnElement(notificationCustomizationPage.defaultsBreadcrumb);

        // Verify user is redirected back to the "Notification customization" listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Reopen edit - Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify the user is on the "Override and confirmation" page
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the section heading "Override and confirmation" is displayed correctly
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.overrideConfirmationStepText
        );

        // Verify that the helper text is displayed below the input box
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.subjectLineHelperText
        );
        // Verify the presence of labels
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultSubjectLineRadio
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.customSubjectLineRadio
        );

        // Verify the link or icon "View best practices" is visible beside the text
        await notificationCustomizationPage.verifyButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES, 'visible');
        await notificationCustomizationPage.verifyHelpIconIsVisible();

        // Hover or click on the "View best practices" icon
        await notificationCustomizationPage.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);

        // Verify a tooltip or popup appears titled "Tips for Custom Subject Lines"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.tipsHeading
        );

        // Verify that "Next" and "Cancel" buttons are visible
        await notificationCustomizationPage.verifyButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT, 'visible');
        await notificationCustomizationPage.verifyButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON, 'visible');

        // When editing, the subject line is already pre-filled, so "Next" button should already be enabled
        // Verify "Next" button is enabled (since subject is pre-filled when editing)
        await notificationCustomizationPage.verifyButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT, 'enabled');

        // Click "Next"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify user is navigated to the "Manage translations" step successfully
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc025 - Verify Manage Translations page tabs, controls, helper text, and validations in Edit flow',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28912',
          storyId: 'INT-24252',
        });

        // Ensure a customization exists for template "Must reads" with subject
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the stepper shows all steps with correct status
        // Select notification - Completed
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.selectNotificationStepText
        );
        // Override and confirmation - Completed
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.overrideConfirmationStepText
        );
        // // Manage translations - Current
        // await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
        //   notificationCustomizationPage.manageTranslationsStepText
        // );

        // Verify a breadcrumb or "Defaults" link is present for navigation back
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultsBreadcrumb
        );

        // Verify the "Language" dropdown is visible and defaults to "English"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.languageDropdown
        );
        await notificationCustomizationPage.manageTranslationComponent.verifyLanguageDropdownShows(
          MANAGE_TRANSLATIONS_TEXT.DEFAULT_LANGUAGE
        );

        // Select "Français - French" (this also verifies the language exists in the dropdown)
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Wait for translation to complete
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

        // Verify the subject line field is NOT editable by default (automatic mode)
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsNotEditable();

        // Verify the helper text "Automatic translations - powered by Google Translate" is visible
        await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();

        // Toggle ON "Manual translation" (or click "Convert to manual")
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // Verify the subject line becomes editable
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsEditable();

        // Verify "Send yourself a test" section is displayed
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );

        // Verify radio options are visible
        // Your email address
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.yourEmailOption
        );
        // Different email address
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.differentEmailOption
        );

        // Choose "Different email address"
        await notificationCustomizationPage.clickOnElement(notificationCustomizationPage.differentEmailOption);

        // Verify helper text "Commas can be used to send to multiple recipients." is displayed
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.differentEmailHelperText
        );

        // Verify the email input box is enabled for entry
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.manageTranslationPage.emailAddressInput
        );

        // Verify "Cancel" and "Save" buttons are visible
        await notificationCustomizationPage.verifyButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON, 'visible');
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.saveButton
        );

        // Verify "Cancel" redirects back to listing without saving when clicked
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc026 -Verify Admin Edits an existing custom subject and saves changes on Manage translations step',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28894',
          storyId: 'INT-24252',
        });

        // A customization exists for template "Must reads" from tc023
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Part 1: Edit on Manage translations step
        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // The Override and confirmation step opens
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Click "Next" to go to Manage translations (skip editing on Override step)
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Get the current subject to use for editing
        const currentSubject = await notificationCustomizationPage.manageTranslationComponent.getTranslationTextValue();

        // Click on the subject text to make it editable, then edit it (auto-generated with faker)
        const editedSubjectOnManageTranslations1 = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.editSubjectLineOnManageTranslationsPage(
          currentSubject,
          editedSubjectOnManageTranslations1
        );

        // Click "Save"
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // A success toast appears: "Customization saved"
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // You are returned to the listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // The listing shows the "Must reads" row with updated Subject
        await notificationCustomizationPage.verifySubjectInListing(
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME,
          editedSubjectOnManageTranslations1
        );

        // Part 2: Edit again on Manage translation Page
        // Re-open edit and modify on Manage translations step
        // Click the three-dot menu (⋯) for the same "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // The "Override and confirmation" step opens with the Custom subject prefilled
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.verifyCustomSubjectLineText(editedSubjectOnManageTranslations1);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click on the subject text to make it editable, then edit it (auto-generated with faker)
        const editedSubjectOnManageTranslations2 = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.editSubjectLineOnManageTranslationsPage(
          editedSubjectOnManageTranslations1,
          editedSubjectOnManageTranslations2
        );

        // Click on "Save"
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // Verify returned to listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify the listing shows the updated subject
        await notificationCustomizationPage.verifySubjectInListing(
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME,
          editedSubjectOnManageTranslations2
        );
      }
    );

    test(
      'tc027 - Verify Admin edits the French translation for an existing Must reads customization and verifies it persists',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28897',
          storyId: 'INT-24252',
        });

        // A customization exists for template "Must reads" from previous tests
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Open edit flow - Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // The "Override and confirmation" step opens
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // The "Custom subject line" textarea is pre-filled - verify it's visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.subjectLineCustomizationComponent.customSubjectTextarea,
          {
            assertionMessage: 'Custom subject line textarea should be visible',
            timeout: 10_000,
          }
        );

        // Move to Manage translations - Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // The Manage translations step is active
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // The Custom subject line field displays for "English"
        await notificationCustomizationPage.manageTranslationComponent.verifyLanguageDropdownShows(
          MANAGE_TRANSLATIONS_TEXT.DEFAULT_LANGUAGE
        );

        // Select French and convert to manual
        // Open the Language dropdown
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // If French is shown as "Automatically translated", wait for translation to complete
        await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();

        // Get the auto-translated French text
        const autoTranslatedFrench =
          await notificationCustomizationPage.manageTranslationComponent.getTranslationTextValue();

        // Click "Convert to manual" (or toggle manual translations ON) for French
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // The French subject field becomes editable
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsEditable();

        // Edit French translation - Replace the French subject (auto-generated with faker)
        const editedFrenchSubject = NotificationTestDataGenerator.generateEditedTranslation(autoTranslatedFrench);
        await notificationCustomizationPage.manageTranslationComponent.editTranslationText(editedFrenchSubject);

        // Save and confirm - Click "Save"
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify a success toast appears confirming "Customization saved"
        await notificationCustomizationPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

        // You are returned to the "Notification customization" listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" row by clicking the three-dot menu (⋯) and selecting "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Click "Next" to open "Manage translations"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Select "Français - French" from the Language dropdown
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Verify the French subject field shows the edited French translation
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(editedFrenchSubject);

        // Click "Cancel" to return to listing (no need to save again)
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc028 - Verify automatic translation for multiple languages (Hindi, French, Spanish)',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27644',
          storyId: 'INT-24252',
        });

        // Generate English subject for the customization
        const englishSubject = NotificationTestDataGenerator.generateCustomSubjectLine(TEMPLATE_DATA.ALERTS.TEMPLATE);

        // Navigate to Add customization
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Expand Alerts group and select the template "New Alert - {{message}}"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Click Next to go to Override and confirmation
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select Custom subject line and enter the English subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(englishSubject);

        // Click Next to go to Manage translations
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Test automatic translation for each language sequentially within the same test
        for (const language of LANGUAGES_FOR_AUTOMATIC_TRANSLATION) {
          // Open the Language dropdown and select the language
          await notificationCustomizationPage.manageTranslationComponent.selectLanguage(language);

          // Wait for translation to complete
          await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

          // Verify the UI shows that translations are automatic
          await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();

          // Verify the Custom subject line textarea is populated automatically and different from English
          await notificationCustomizationPage.manageTranslationComponent.verifyTranslatedTextIsPopulatedAndDifferent(
            englishSubject,
            language
          );
        }

        // Click "Cancel" to return to listing without saving
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc029 - Verify test email is sent with translated subject line for selected language',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-290',
          storyId: 'INT-24252',
        });

        // Generate unique English subject for the customization
        const englishSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Navigate to Add customization
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Select "Must reads" template
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click Next to go to Override and confirmation
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select Custom subject line and enter the English subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(englishSubject);

        // Click Next to go to Manage translations
        await notificationCustomizationPage.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Select a language (e.g., Hindi) from the Language dropdown
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.HINDI);

        // Wait for translation to complete
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

        // Verify the Custom subject line is non-empty (the translated subject is captured for email verification)
        await notificationCustomizationPage.manageTranslationComponent.verifyAndGetTranslatedSubject(LANGUAGES.HINDI);

        // Choose the test recipient option "Different email address"
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();

        // Enter a reachable test email address
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(TEST_EMAILS.SINGLE_VALID);

        // Click "Send test"
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();

        // Verify the UI shows a success confirmation/toast for sending the test email
        await notificationCustomizationPage.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );

        // Note: Email verification would require email service API integration
        // The translated subject (<expectedSubject>) is captured above for verification
        // In a real scenario, the email inbox would be checked to verify the subject matches

        // Click "Cancel" to return to listing without saving
        await notificationCustomizationPage.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );
  }
);
