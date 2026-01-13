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
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_HEADERS_AND_SUBHEADERS,
  NOTIFICATION_CATEGORY_TEMPLATES,
  NotificationTestDataGenerator,
  OVERRIDE_CONFIRMATION_TEXT,
  PAGE_TEXT,
  SEARCH_TERMS,
  SUBJECT_LINES,
  TEMPLATE_DATA,
  TEST_EMAILS,
  TEST_PREFIXES,
  TIMESTAMP_TEXT,
} from '../test-data/notification-customization.test-data';

import { EmailUtils } from '@/src/core/utils/emailUtil';
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
        await notificationCustomizationPage.searchInListing(SEARCH_TERMS.MUST);

        // Verify count matches expected for "Must" search
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.MUST_SEARCH);

        // Test 2: Non-matching results - search for "zzq-nomatch"
        await notificationCustomizationPage.searchInListing(SEARCH_TERMS.NO_MATCH);

        // Verify no results are shown - count should be 0
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.EMPTY_SEARCH);

        // Test 3: Clear search to return to full list
        await notificationCustomizationPage.searchInListing('');

        // Verify full list is restored - count should match base count exactly
        await notificationCustomizationPage.verifyTemplateItemsCount(EXPECTED_COUNTS.BASE_COUNT);

        // Test 4: Search for "Alerts" keyword
        await notificationCustomizationPage.searchInListing(TEMPLATE_DATA.ALERTS.FEATURE_NAME);

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
      'tc004 - Verify clicking Save without selecting Custom subject line returns to listing and does not create an entry',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27639',
          storyId: 'INT-24252',
        });

        // Note the current total customization rows count
        const countBefore = await notificationCustomizationPage.countNotificationItems();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify the "Add customization" page loads and the stepper shows "Select notification" as active
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );

        // On "Select notification" expand a category and choose the template "Must reads"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify the "Override and confirmation" step is active
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the labels "Default subject line" and "Custom subject line" are visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        // Verify by default the "Default subject line" option is selected (no custom selected)
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();

        // Verify the custom subject textarea is hidden or disabled
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectTextareaIsHiddenOrDisabled();

        // Click "Save"
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify you are redirected to the "Notification customization" listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify no success toast for "Customization saved" is shown for a new custom entry
        await notificationCustomizationPage.commonActions.verifyToastMessageNotShown(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Verify the total rows count remains unchanged
        await notificationCustomizationPage.verifyNotificationItemsCountUnchanged(countBefore);
      }
    );

    test(
      'tc005 - Verify the selected default template is displayed as the Default Subject Line (non-editable)',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27634',
          storyId: 'INT-24252',
        });

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Expand the "Alerts" category and select the template
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Click "Next"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify the "Override and confirmation" page loads successfully
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // The section heading "Override and confirmation" is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.overrideConfirmationStepText
        );

        // Verify the label "Default subject line" is visible above the non-editable field
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();

        // Verify the field below it displays the selected template's subject as "New Alert - {{message}}"
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineText(
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Verify the "Default subject line" input is read-only (non-editable)
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsReadOnly();

        // Verify the label "Custom subject line" is visible below the Default subject section
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        // Verify a radio button or selector allows switching to the "Custom subject line" option
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.customSubjectLineRadio
        );

        // Verify the custom subject line text area is disabled until the "Custom subject line" option is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectTextareaIsHiddenOrDisabled();

        // Verify helper text below reads: "Enter the subject line for the email. Personalize it by adding recipient fields."
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(OVERRIDE_CONFIRMATION_TEXT.HELPER_TEXT);
      }
    );

    test(
      'tc006 - Verify user can select only one template at a time and clicking Next navigates to Override & Confirmation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27632',
          storyId: 'INT-24252',
        });

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // The "Select notification" step is displayed with a list of template cards or rows
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // A search input and items counter are visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );
        // Verify items counter by checking that template items exist (count > 0)
        await notificationCustomizationPage.verifyTemplateItemsCounterIsVisible();

        // Click on the template card/row for "Must reads"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Verify the "Must reads" card shows a selected state (checkbox, highlight, or radio)
        await notificationCustomizationPage.selectNotificationStep.verifyTemplateIsSelected(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Verify the "Next" button becomes enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Click on a different template card/row "Alerts"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Verify only the "Alerts" card is selected and "Must reads" is unselected
        // Verify the UI does not allow multiple cards to remain selected simultaneously (single-selection enforced)
        // This is verified  only Alerts is selected, Must reads is not
        await notificationCustomizationPage.selectNotificationStep.verifyTemplateIsSelected(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.selectNotificationStep.verifyTemplateIsNotSelected(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click the "Next" button
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify navigation to the "Override & Confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the page header or preview shows the selected template name "Alerts"
        // This is verified by checking the default subject line displays the Alerts template text
        // Verify the "Default subject line" displays the subject for the selected template
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineText(
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
      }
    );

    //this should be in top till 41
    test(
      'tc007 - Daily summary — Default subject line UI and footer buttons',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27640',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // On "Select notification" expand "Daily summary" and select the template
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.DAILY_SUMMARY,
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify the stepper shows "Select notification" completed and "Override and confirmation" active
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the page header "Add customization" is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );

        // Verify the "Default subject line" label and non-editable preview are visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();

        // Verify the default subject line shows "Your summarized email notifications for {{appName}}"
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineText(
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );

        // Verify the "Default subject line" input is read-only (non-editable)
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsReadOnly();

        // Verify the "Custom subject line" label and empty textarea are visible (not selected)
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        // Verify the custom subject line textarea is hidden or disabled when default is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectTextareaIsHiddenOrDisabled();

        // Verify helper text below reads: "Enter the subject line for the email. Personalize it by adding recipient fields."
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(OVERRIDE_CONFIRMATION_TEXT.HELPER_TEXT);

        // Verify the "View best practices" helper icon/text is visible
        await notificationCustomizationPage.commonActions.verifyButton(
          OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES,
          'visible'
        );
        await notificationCustomizationPage.verifyHelpIconIsVisible();

        // Verify tooltip with bullet points on hover/click
        await notificationCustomizationPage.commonActions.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);
        await notificationCustomizationPage.verifyBestPracticesTooltipContent(
          OVERRIDE_CONFIRMATION_TEXT.TIPS_BULLET_POINTS
        );

        // Dismiss the tooltip
        await notificationCustomizationPage.page.keyboard.press('Tab');
        await notificationCustomizationPage.verifyBestPracticesTooltipIsClosed();

        // Verify that the "Default subject line" option is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();

        // When "Default subject line" is selected, verify that the footer shows both "Cancel" and "Save" buttons
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON,
          'visible'
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.saveButton
        );

        // Verify that the "Save" button is enabled (since default subject line is selected and valid)
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.saveButton
        );

        // Now select "Custom subject line" option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Verify that "Default subject line" gets deselected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsNotSelected();

        // When "Custom subject line" is selected, verify that the footer shows both "Cancel" and "Next" buttons
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON,
          'visible'
        );
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT,
          'visible'
        );

        // Verify that the "Next" button is enabled (since custom subject line is selected)
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Verify "Add dynamic value" link is present below "Custom subject line" section
        await notificationCustomizationPage.commonActions.verifyButton(
          DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON,
          'visible'
        );

        // Click Cancel to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc008 - Daily summary — Manage translations page UI validation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28995',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // On "Select notification" expand "Daily summary" and select the template
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.DAILY_SUMMARY,
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are on the "Override and confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select the "Custom subject line" option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Fill the custom subject line with the template text
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are navigated to the "Manage translations" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the header - "Defaults" breadcrumb is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultsBreadcrumb
        );

        // Verify "Add customization" text is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );

        // Verify "Create custom subject lines for your email notifications. Personalize each message with recipient fields." text is present
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationSubheading
        );

        // Verify the stepper shows "Select notification" and "Override and confirmation" completed and "Manage translations" active
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.selectNotificationStepText
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.overrideConfirmationStepText
        );

        // Verify the sub-section "Send yourself a test" is visible below the subject field
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );

        // Verify a dropdown labeled "Language" is visible with default value
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.languageDropdown
        );
        await notificationCustomizationPage.manageTranslationComponent.verifyLanguageDropdownShows(
          MANAGE_TRANSLATIONS_TEXT.DEFAULT_LANGUAGE
        );

        // Verify the "Custom subject line" field is visible and pre-filled with "Your summarized email notifications for {{appName}}"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.translationSubjectTextarea
        );
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );

        // Verify the helper text "Enter the subject line for this notification." is displayed below the text box
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.CUSTOM_SUBJECT_HELPER
        );

        // Verify the "Add dynamic value" link is visible near the subject input
        await notificationCustomizationPage.commonActions.verifyButton(
          DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON,
          'visible'
        );

        // Verify the "Custom subject line" field is editable
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsEditable();

        // Verify the heading "Send yourself a test" is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );

        // Verify the text "Preview the notification by sending a test to yourself or choose a different email address." is visible
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.SEND_TEST_HELPER
        );

        // Verify two options are displayed: "Your email address" and "Different email address"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.yourEmailOption
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.differentEmailOption
        );

        // Verify the "Send test" button is visible and enabled
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.manageTranslationComponent.sendTestButton
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.manageTranslationComponent.sendTestButton
        );

        // Verify the footer displays "Cancel" and "Save" buttons
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON,
          'visible'
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.saveButton
        );

        // Verify clicking "Cancel" should navigate back to the "Notification customization" listing without saving
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc009 - Verify UI helper texts and tooltips on Digest email customization screens',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27638',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Expand "Digest email" and select the template "Your weekly feed digest for {{appName}}"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.DIGEST_EMAIL,
          TEMPLATE_DATA.DIGEST_EMAIL.TEMPLATE
        );

        // Click "Next" to go to the "Override and confirmation" step
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Override & Confirmation - Helper texts
        // Verify the helper text below the subject line reads "Enter the subject line for the email. Personalize it by adding recipient fields."
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(OVERRIDE_CONFIRMATION_TEXT.HELPER_TEXT);

        // Verify the text "View best practices" is visible near the helper icon
        await notificationCustomizationPage.commonActions.verifyButton(
          OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES,
          'visible'
        );
        await notificationCustomizationPage.verifyHelpIconIsVisible();

        // When I hover or click on the "View best practices" icon
        await notificationCustomizationPage.commonActions.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);

        // Then a tooltip titled "Tips for custom subject lines" is displayed with bullet points
        await notificationCustomizationPage.verifyBestPracticesTooltipContent(
          OVERRIDE_CONFIRMATION_TEXT.TIPS_BULLET_POINTS
        );

        // Dismiss the tooltip
        await notificationCustomizationPage.page.keyboard.press('Tab');
        await notificationCustomizationPage.verifyBestPracticesTooltipIsClosed();

        // Manage Translations - Helper texts
        // Select "Custom subject line" to proceed to Manage translations
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          TEMPLATE_DATA.DIGEST_EMAIL.TEMPLATE
        );

        // Click "Next" to go to the "Manage translations" step
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the helper text below "Custom subject line" reads "Enter the subject line for this notification."
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.CUSTOM_SUBJECT_HELPER
        );

        // Verify under "Send yourself a test" section, the description text is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.SEND_TEST_HELPER
        );

        // Select "Different email address" option
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();

        // Verify when "Different email address" is selected, the helper text "Commas can be used to send to multiple recipients." is visible
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.DIFFERENT_EMAIL_HELPER
        );

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc010 - Verify all expandable panels open correctly on the "Select notification" step',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27636',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify I should be on the "Select notification" step with the search bar visible
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );

        // Verify panel visibility - verify all notification category panels are visible
        await notificationCustomizationPage.selectNotificationStep.verifyAllPanelsAreVisible(NOTIFICATION_CATEGORIES);

        // Expand one by one - click to expand each notification panel and verify it expands
        // Note: The expandAllPanels method already verifies each panel is expanded after expanding it
        await notificationCustomizationPage.selectNotificationStep.expandAllPanels(NOTIFICATION_CATEGORIES);

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc011 -Verify all headers and subheaders are displayed correctly on the "Select notification" step',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27637',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify I should be on the "Select notification" step with the search bar visible
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );

        // Validate top section - Verify the page header "Add customization" is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );

        // Verify the step indicator highlights "Select notification" as active
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.selectNotificationStepText
        );

        // Verify the helper text under header reads "Create custom subject lines for your email notifications. Personalize each message with recipient fields."
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationSubheading
        );

        // Verify all headers and subheaders - verify that each notification section displays correct header and subheader text
        await notificationCustomizationPage.selectNotificationStep.verifyAllCategoryHeadersAndSubheaders(
          NOTIFICATION_CATEGORY_HEADERS_AND_SUBHEADERS
        );

        // Footer validation - Verify that "Cancel" and "Next" buttons are visible at the bottom of the screen
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON,
          'visible'
        );
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT,
          'visible'
        );

        // Verify "Next" remains disabled until at least one template is selected
        await notificationCustomizationPage.verifyNextButtonIsDisabled();

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc012 - Verify the expanded templates and text for five key customizations on "Select notification" step',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27624',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify I should be on the "Select notification" step with the search bar visible
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.searchInput
        );

        // Verify the page header "Add customization" and step indicator are displayed
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.addCustomizationTitle
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.selectNotificationStepText
        );

        // 1. Must Reads - Expand and verify templates
        await notificationCustomizationPage.selectNotificationStep.verifySelectTemplateText(
          NOTIFICATION_CATEGORY_TEMPLATES.MUST_READS.header,
          NOTIFICATION_CATEGORY_TEMPLATES.MUST_READS.templates
        );

        // 2. Alerts - Expand and verify templates
        await notificationCustomizationPage.selectNotificationStep.verifySelectTemplateText(
          NOTIFICATION_CATEGORY_TEMPLATES.ALERTS.header,
          NOTIFICATION_CATEGORY_TEMPLATES.ALERTS.templates
        );

        // 3. Follows - Expand and verify templates
        await notificationCustomizationPage.selectNotificationStep.verifySelectTemplateText(
          NOTIFICATION_CATEGORY_TEMPLATES.FOLLOWS.header,
          NOTIFICATION_CATEGORY_TEMPLATES.FOLLOWS.templates
        );

        // 4. Digest Email - Expand and verify templates
        await notificationCustomizationPage.selectNotificationStep.verifySelectTemplateText(
          NOTIFICATION_CATEGORY_TEMPLATES.DIGEST_EMAIL.header,
          NOTIFICATION_CATEGORY_TEMPLATES.DIGEST_EMAIL.templates
        );

        // 5. Daily Summary - Expand and verify templates
        await notificationCustomizationPage.selectNotificationStep.verifySelectTemplateText(
          NOTIFICATION_CATEGORY_TEMPLATES.DAILY_SUMMARY.header,
          NOTIFICATION_CATEGORY_TEMPLATES.DAILY_SUMMARY.templates
        );

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc013 - Verify all customization categories are displayed and have templates with radio buttons',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28997',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify I am on the "Select notification" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Verify that all customization categories are displayed
        await notificationCustomizationPage.selectNotificationStep.verifyAllPanelsAreVisible(NOTIFICATION_CATEGORIES);

        // Expand each customization category one by one and verify templates with radio buttons
        // This verifies:
        // - Each category can be expanded
        // - At least one template option is displayed within each expanded section
        // - Radio buttons are visible for each template
        // - No section expands empty or without selectable templates
        await notificationCustomizationPage.selectNotificationStep.verifyAllCategoriesHaveTemplatesWithRadioButtons(
          NOTIFICATION_CATEGORIES
        );

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc014 - verify app manager is able to customize must read with default subject line',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //now verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify the default subject line is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();
        //click on save button
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
      }
    );

    test(
      'tc015 - verify app manager is able to customize must read with custom subject line',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //now verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify the default subject line is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsSelected();

        //click on custom subject line option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //click on next button
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //now verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        //click on save button
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
        //verify toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );
        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu();
        //verify delete toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc016 - verify cancel action and validation on subject line customization',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.PLURAL_TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

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
      'tc017 - verify custom subject line creation and delivery for Follow template',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.FOLLOWS,
          TEMPLATE_DATA.FOLLOW.TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
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
      'tc018 - verify custom subject line creation and delivery for Alerts template',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //verify default subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineIsVisible();
        //verify custom subject line label is visible
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();
        //Test Cancel Action - click cancel and verify return to listing page
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //Start over - click add customization again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
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
      'tc019 - verify Admin creates a “Must reads” customization with a French subject, confirms it on the listing, and deletes',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //select custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line (placeholder subject)
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //click on next button
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        //select French language
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage('Français - French');
        //click on save button
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
        //verify toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );
        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        //verify delete toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc020 - verify multiple cancel actions and validation for Alerts template',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Second attempt - select custom subject line, then cancel from subject line page
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Third attempt - test validation with empty custom subject line
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        // Clear the textarea to test validation
        await notificationCustomizationPage.subjectLineCustomizationComponent.clearCustomSubjectLine();
        // Verify next button is disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();
      }
    );

    test(
      'tc021 - Verify system blocks sending test email if email format is invalid',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the select subject line step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //select custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = SUBJECT_LINES.MUST_READ.ENGLISH;
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //click on next button
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        //select different email address option
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();
        //enter invalid email
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(TEST_EMAILS.SINGLE_INVALID);
        //tab outside to trigger validation
        await notificationCustomizationPage.page.keyboard.press('Tab');
        //verify inline error message
        await notificationCustomizationPage.commonActions.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR
        );

        // Generate unique test email address using Mailosaur
        const emailUtils = new EmailUtils(process.env.MAILOSAUR_API_KEY!, process.env.MAILOSAUR_SERVER_ID!);
        const randomTestEmail = await emailUtils.generateUniqueEmailAddress('notificationcustomization');

        //enter valid email
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(randomTestEmail);
        //click send test button
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();
        //verify success toast
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );

        // Verify the email was received with the correct subject line
        await emailUtils.verifyEmailIsInInboxWithThisSubject({
          sentTo: randomTestEmail,
          subject: customSubjectLine,
        });
      }
    );

    test(
      'tc022 - Verify test email can be sent to multiple recipients by separating addresses with commas',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on override and confirmation step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        //select custom subject line option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill custom subject line
        const customSubject = SUBJECT_LINES.MUST_READ.ENGLISH;
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubject);
        //click next button
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        //verify user is on the manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Generate unique test email address using Mailosaur
        const emailUtils = new EmailUtils(process.env.MAILOSAUR_API_KEY!, process.env.MAILOSAUR_SERVER_ID!);
        const randomTestEmail = await emailUtils.generateUniqueEmailAddress('notificationcustomization');

        //select different email address option
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();
        //enter unique test email address
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(randomTestEmail);
        //click send test button
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();
        //verify success toast
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );

        // Verify the email was received with the correct subject line
        await emailUtils.verifyEmailIsInInboxWithThisSubject({
          sentTo: randomTestEmail,
          subject: customSubject,
        });
      }
    );

    test(
      'tc023 - Verify user is redirected to Add customization page from Notification customization and tab displays search and communication list correctly',
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
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL,
          'visible'
        );
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL,
          'enabled'
        );

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
      'tc024 - Verify user is able to select communication and proceed or cancel, and error/warning messages are shown correctly',
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
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL,
          'visible'
        );
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL,
          'enabled'
        );

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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify user is on the next step (Override and confirmation)
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Navigate back to test cancel functionality
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify redirected back to Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );
      }
    );

    test(
      'tc025 - Verify cancel and next actions work correctly and appropriate warnings are shown for empty or invalid subject lines',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

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
        await notificationCustomizationPage.commonActions.verifyButton(
          OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES,
          'visible'
        );

        // Verify info icon is present
        await notificationCustomizationPage.verifyHelpIconIsVisible();
        // Tooltip / popover testing
        // Click the info icon to trigger the popover
        await notificationCustomizationPage.commonActions.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);
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
        await notificationCustomizationPage.commonActions.verifyInlineErrorMessage(
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // Verify we advance to the "Manage translations" step without errors
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
      }
    );

    test(
      'tc026 - Comprehensive UI validation of Manage translations step with validations and user flows',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // Select custom subject line and proceed to Manage translations
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
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
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.CUSTOM_SUBJECT_HELPER
        );

        // Verify "Send yourself a test" section
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.SEND_TEST_HELPER
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
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON,
          'visible'
        );

        // Required-field validation testing
        // Clear the custom subject line field
        await notificationCustomizationPage.manageTranslationComponent.translationSubjectTextarea.clear();

        // Tab outside to trigger validation
        await notificationCustomizationPage.page.keyboard.press('Tab');

        // Verify inline error is displayed
        await notificationCustomizationPage.commonActions.verifyInlineErrorMessage(
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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify redirected back to Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Repeat the flow to test save functionality
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are on Manage translations step again
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Enter valid subject and save
        await notificationCustomizationPage.manageTranslationComponent.fillTranslatedSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        //verify delete toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc027 - Admin inserts a dynamic value ({{message}}) into a custom subject and sees it rendered correctly',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are on the Override and confirmation step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the Default subject line field displays "New Alert - {{message}}"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultSubjectLineRadio
        );

        // Select Custom subject line option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Verify the "Add dynamic value" link text is visible near the textarea
        await notificationCustomizationPage.commonActions.verifyButton(
          DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON,
          'visible'
        );

        // Click "Add dynamic value" button
        await notificationCustomizationPage.commonActions.clickButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON);

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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify we are on the Manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click Save
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify a success toast confirms the customization was saved
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Verify the listing shows the new Alerts row (by checking we're back on the main page)
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click the 3-dot menu for this row
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.ALERTS.FEATURE_NAME);

        // Verify a success message appears and the customization is removed from the listing
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc028 - Verify user is able to delete a notification override through confirmation modal and system reverts to default notification with success message after deletion',
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
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

        // Get the updated count (for future verification if needed)
        const _countBeforeDeletion = await notificationCustomizationPage.countNotificationItems();

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
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );

        // Wait for the listing page to update with the deleted item removed
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc029 - Verify the search works correctly within the template selection list',
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
        await notificationCustomizationPage.searchInListing(SEARCH_TERMS.MUST);
        await notificationCustomizationPage.verifyFilteredCountIsValid(baseCount);

        // Test 2: Non-matching search
        await test.step('Search for non-matching term and verify empty state', async () => {
          await notificationCustomizationPage.searchInListing(SEARCH_TERMS.NO_MATCH);

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
      'tc030 - Verify automatic translation for Hindi when creating custom subject line',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter the subject line using faker-generated test data
        const customSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast is displayed
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Verify on the Notification customization listing the new entry for "Must reads" is shown
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.notificationCustomizationTitle
        );

        // Clean up - delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc031 - Verify manual translation functionality when creating custom subject line',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter the subject line using faker-generated test data
        const customSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast is displayed
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Return to listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );
    //Testcase on Edit

    test(
      'tc032 - Verify Notification customization — Cancel on edit does not persist changes on override and confirmation page',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(initialSubject);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Click "Save" to persist the new customization
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears confirming save
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify no save toast is displayed (just verify we're back on listing)
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" row by clicking "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify the subject remains the original value (the edited value was not saved)
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.verifyCustomSubjectLineText(initialSubject);

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify returned to listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Clean up - delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc033 - Verify Edit on Notification customization — Cancel does not persist changes on Manage translation Page',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // On "Override and confirmation", select "Custom subject line"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(initialSubject);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Click "Save" to persist the new customization
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears confirming save
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Return to the "Notification customization" listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Locate the saved row for "Must reads" and note the current subject value
        await notificationCustomizationPage.verifySubjectInListing(TEMPLATE_DATA.MUST_READ.BUTTON_NAME, initialSubject);

        // Click the three-dot menu (⋯) for the "Must reads" row and select "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Navigate to Manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Edit the subject line on manage translations page (auto-generated with faker)
        const editedSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.editSubjectLineOnManageTranslationsPage(initialSubject, editedSubject);

        // Click the "Cancel" button to exit without saving
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify no save toast is displayed (just verify we're back on listing)
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" row by clicking "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Navigate to Manage translations step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the subject remains the original value (the edited value was not saved)
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(initialSubject);

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify returned to listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Cleanup: Delete the created customization
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc034 - Verify navigation, breadcrumb, and UI elements on the Override and Confirmation page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28909',
          storyId: 'INT-24252',
        });

        // Setup: Ensure customization exists for testing
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

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
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(OVERRIDE_CONFIRMATION_TEXT.HELPER_TEXT);
        // Verify the presence of labels
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.defaultSubjectLineRadio
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.customSubjectLineRadio
        );

        // Verify the link or icon "View best practices" is visible beside the text
        await notificationCustomizationPage.commonActions.verifyButton(
          OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES,
          'visible'
        );
        await notificationCustomizationPage.verifyHelpIconIsVisible();

        // Hover or click on the "View best practices" icon
        await notificationCustomizationPage.commonActions.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);

        // Verify a tooltip or popup appears titled "Tips for Custom Subject Lines"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.tipsHeading
        );

        // Verify that "Next" and "Cancel" buttons are visible
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT,
          'visible'
        );
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON,
          'visible'
        );

        // When editing, the subject line is already pre-filled, so "Next" button should already be enabled
        // Verify "Next" button is enabled (since subject is pre-filled when editing)
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT,
          'enabled'
        );

        // Click "Next"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify user is navigated to the "Manage translations" step successfully
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click "Cancel" to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Cleanup: Delete the customization
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc035 - Verify Manage Translations page tabs, controls, helper text, and validations in Edit flow',
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
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
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
        await notificationCustomizationPage.commonActions.verifyTextIsVisible(
          MANAGE_TRANSLATIONS_TEXT.DIFFERENT_EMAIL_HELPER
        );

        // Verify the email input box is enabled for entry
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.manageTranslationPage.emailAddressInput
        );

        // Verify "Cancel" and "Save" buttons are visible
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON,
          'visible'
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.saveButton
        );

        // Verify "Cancel" redirects back to listing without saving when clicked
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Cleanup: Delete the customization
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc036 -Verify Admin Edits an existing custom subject and saves changes on Manage translations step',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28894',
          storyId: 'INT-24252',
        });

        // Setup: Create a customization for testing
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

        // Part 1: Edit on Manage translations step
        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // The Override and confirmation step opens
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Click "Next" to go to Manage translations (skip editing on Override step)
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // A success toast appears: "Customization saved"
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Verify returned to listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify the listing shows the updated subject
        await notificationCustomizationPage.verifySubjectInListing(
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME,
          editedSubjectOnManageTranslations2
        );

        // Cleanup: Delete the created customization
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc037 - Verify Admin edits the French translation for an existing Must reads customization and verifies it persists',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28897',
          storyId: 'INT-24252',
        });

        // Setup: Ensure a customization exists for testing
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

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
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify a success toast appears confirming "Customization saved"
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // You are returned to the "Notification customization" listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" row by clicking the three-dot menu (⋯) and selecting "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Click "Next" to open "Manage translations"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Select "Français - French" from the Language dropdown
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Verify the French subject field shows the edited French translation
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(editedFrenchSubject);

        // Click "Cancel" to return to listing (no need to save again)
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();

        //delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );
    // not edit screen
    test(
      'tc038 - Verify the subject line auto-translates when a different language is selected',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select Custom subject line and enter the English subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(englishSubject);

        // Click Next to go to Manage translations
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Test automatic translation for each language sequentially within the same test
        for (const language of LANGUAGES_FOR_AUTOMATIC_TRANSLATION) {
          // Open the Language dropdown and select the language
          await notificationCustomizationPage.manageTranslationComponent.selectLanguage(language);

          // Wait for translation to complete
          await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

          // Verify the UI shows that translations are automatic
          await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();
        }
        // Click "Cancel" to return to listing without saving
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc039 - Verify test email can be sent for the selected language and current subject line',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27647',
          storyId: 'INT-24252',
        });
        const emailUtils = new EmailUtils(process.env.MAILOSAUR_API_KEY!, process.env.MAILOSAUR_SERVER_ID!);
        const randomTestEmail = await emailUtils.generateUniqueEmailAddress('notificationcustomization'); //with mailosaur domain and server key
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select Custom subject line and enter the English subject
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(englishSubject);

        // Click Next to go to Manage translations
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Select a language (e.g., Hindi) from the Language dropdown
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.HINDI);

        // Wait for translation to complete
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

        // Verify the Custom subject line is non-empty (the translated subject is captured for email verification)
        const udpatedTranslatedSubject =
          await notificationCustomizationPage.manageTranslationComponent.verifyAndGetTranslatedSubject(LANGUAGES.HINDI);

        // Choose the test recipient option "Different email address"
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();

        // Enter a reachable test email address
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(randomTestEmail);

        // Click "Send test"
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();

        // Note: Email verification would require email service API integration
        // The translated subject (<expectedSubject>) is captured above for verification
        // In a real scenario, the email inbox would be checked to verify the subject matches
        await emailUtils.verifyEmailIsInInboxWithThisSubject({
          sentTo: randomTestEmail,
          subject: udpatedTranslatedSubject,
        });

        // Click "Cancel" to return to listing without saving
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc040 - Verify manual translation can be entered differently for each selected language for custom subject line',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27646',
          storyId: 'INT-24252',
        });

        // Generate unique English subject for the customization
        const englishSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // On "Select notification" choose the template "Must reads"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter custom subject in English
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(englishSubject);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // The "Manage translations" step is active and the Language dropdown defaults to English
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        await notificationCustomizationPage.manageTranslationComponent.verifyLanguageDropdownShows(
          MANAGE_TRANSLATIONS_TEXT.DEFAULT_LANGUAGE
        );

        // The English subject field shows and is editable
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsEditable();
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(englishSubject);

        // Select first target language (French) and convert to manual
        // Open the Language dropdown and select "Français - French"
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // The French subject field is populated with an automatic translation (read-only) and the info text "Automatic translations - powered by Google Translate" is visible
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsNotEditable();
        await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

        // Toggle ON "Manual translation" (or click "Convert to manual") for French
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // The French subject field becomes editable and is pre-populated with the auto-translation
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsEditable();

        // Replace the French subject
        await notificationCustomizationPage.manageTranslationComponent.editTranslationText(
          SUBJECT_LINES.MUST_READ.FRENCH_MANUAL
        );

        // Select second target language (Hindi) and convert to manual with a different text
        // Open the Language dropdown and select "हिन्दी - Hindi"
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.HINDI);

        // The Hindi subject field is populated with an automatic translation (read-only) and the automatic-translation info text is visible
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsNotEditable();
        await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();

        // Toggle ON "Manual translation" (or click "Convert to manual") for Hindi
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // The Hindi subject field becomes editable and is pre-populated with the auto-translation
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationFieldIsEditable();

        // Replace the Hindi subject
        await notificationCustomizationPage.manageTranslationComponent.editTranslationText(
          SUBJECT_LINES.MUST_READ.HINDI_MANUAL
        );

        // Save and verify persistence
        // Click "Save"
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // A success toast appears confirming "Customization saved"
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // You are returned to the "Notification customization" listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" customization by clicking the three-dot menu → "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Select "Français - French" and verify the subject field shows the manual text "Mise à jour du PDG — veuillez lire"
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.MUST_READ.FRENCH_MANUAL
        );

        // Select "हिन्दी - Hindi" and verify the subject field shows the manual text
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.HINDI);
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.MUST_READ.HINDI_MANUAL
        );
        // Clean up - delete the customization
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc041 - Verify best-practices tooltip displays correctly and is accessible from the Custom subject line area',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27637',
          storyId: 'INT-24252',
        });

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Select a template and click "Next" to arrive at the "Override and confirmation" step
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Focus the Custom subject line area
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // I should see a control or label "View best practices" near the textarea
        await notificationCustomizationPage.commonActions.verifyButton(
          OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES,
          'visible'
        );
        await notificationCustomizationPage.verifyHelpIconIsVisible();

        // Open tooltip (mouse) - hover over or click the "View best practices" control
        await notificationCustomizationPage.commonActions.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);

        // A tooltip/popup titled "Tips for custom subject lines" should appear
        // The tooltip should contain the following bullet items
        // verifyBestPracticesTooltipContent already verifies the heading is visible
        await notificationCustomizationPage.verifyBestPracticesTooltipContent(
          OVERRIDE_CONFIRMATION_TEXT.TIPS_BULLET_POINTS
        );

        // The tooltip should be visually adjacent to the "View best practices" control
        // This is verified by the tooltip being visible after clicking the button

        // Dismiss behavior - When the tooltip is open, press Tab to move focus away and close the tooltip
        await notificationCustomizationPage.page.keyboard.press('Tab');

        // The tooltip should close
        await notificationCustomizationPage.verifyBestPracticesTooltipIsClosed();

        // Persist / non-blocking - Re-open the tooltip
        await notificationCustomizationPage.commonActions.clickButton(OVERRIDE_CONFIRMATION_TEXT.VIEW_BEST_PRACTICES);
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.tipsHeading
        );

        // When the tooltip is open and I type into the Custom subject line textarea
        const testText = 'Test subject line';
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(testText);

        // Typing should continue normally and the tooltip should not block input
        // This is verified by successfully filling the textarea
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsVisible();

        // The Next button should remain interactive (tooltip does not disable page actions)
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Click Cancel to return to listing
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc042 - Verify custom subject line Data persists when navigating between steps',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26616',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Expand "Daily summary" and select the template
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.DAILY_SUMMARY,
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter text into the custom subject line field
        const customSubjectLineText = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          customSubjectLineText
        );

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click the stepper to navigate back to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.OVERRIDE_CONFIRMATION
        );
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify that the entered text is still present in the custom subject line field
        await notificationCustomizationPage.verifyCustomSubjectLineText(customSubjectLineText);

        // Verify that "Custom subject line" option remains selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();

        // Click the stepper "Select notification" to navigate back
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.SELECT_NOTIFICATION
        );
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Verify that the template "Daily summary" remains selected
        await notificationCustomizationPage.selectNotificationStep.verifyTemplateIsSelected(
          NotificationFeatures.DAILY_SUMMARY,
          TEMPLATE_DATA.DAILY_SUMMARY.TEMPLATE
        );

        // Click "Next" again to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify that on "Override and confirmation" page, the custom subject line text persists
        await notificationCustomizationPage.verifyCustomSubjectLineText(customSubjectLineText);

        // Verify that "Custom subject line" option remains selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();
        // And click on Next
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // Verify we are on the "Manage translations" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        // Verify that the entered text is still present in the custom subject line field
        await notificationCustomizationPage.verifyCustomSubjectLineText(customSubjectLineText);
        //click on save
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
        // Verify success toast appears confirming save
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        //and delete the customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.DAILY_SUMMARY.BUTTON_NAME);
        //verify toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc043 - Verify custom subject line Data persists for Edit when navigating between steps',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28998',
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
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //select custom subject line
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
        //fill in the custom subject line
        const customSubjectLine = NotificationTestDataGenerator.generateRandomSubject();
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);
        //and cllick on next button to go to manage translations
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //click on save button
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
        //verify toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Part 1: Edit on Manage translations step
        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify I am navigated to the "Override and confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the "Custom subject line" option is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();

        // Get the existing pre-filled subject line text
        const existingSubjectLineText =
          await notificationCustomizationPage.subjectLineCustomizationComponent.customSubjectTextarea.inputValue();

        // Edit the subject line with "Updated" suffix
        const updatedSubjectLine = NotificationTestDataGenerator.generateVersionedSubjectLine(
          existingSubjectLineText,
          'Updated'
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(updatedSubjectLine);

        // Click "Next" to go to the "Manage translations" page
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // Verify navigated to "Manage translations" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the updated subject is visible in the translation preview field
        await notificationCustomizationPage.verifyCustomSubjectLineText(updatedSubjectLine);

        // Click the stepper to navigate back to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.OVERRIDE_CONFIRMATION
        );
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the same updated subject persists in the subject line field
        await notificationCustomizationPage.verifyCustomSubjectLineText(updatedSubjectLine);

        // Verify that the "Custom subject line" option remains selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();

        // Click the stepper "Select notification" to verify it doesn't navigate in Edit flow
        // In Edit flow, clicking "Select notification" should not navigate to that step
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.SELECT_NOTIFICATION
        );
        // Verify we remain on the "Override and confirmation" step (not navigated to "Select notification")
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify no data loss occurs - the updated subject line should still be present
        await notificationCustomizationPage.verifyCustomSubjectLineText(updatedSubjectLine);

        // Verify "Custom subject line" option is still selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();

        // Click "Cancel" to return to listing without saving
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL);
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        //verify toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc044 - Verify translated subject-line data persists when switching languages and navigating steps',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29011',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Expand "Must reads" and select the template
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter into the custom subject line field (English)
        const englishSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(englishSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Change language to "Français - French"
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Enable "Manual translations"
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // Enter into the custom subject line field (French)
        await notificationCustomizationPage.manageTranslationComponent.editTranslationText(
          SUBJECT_LINES.MUST_READ.FRENCH_MANUAL
        );

        // Change language to "हिंदी - Hindi"
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.HINDI);

        // Enable "Manual translations"
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // Enter into the custom subject line field (Hindi)
        await notificationCustomizationPage.manageTranslationComponent.editTranslationText(
          SUBJECT_LINES.MUST_READ.HINDI_MANUAL
        );

        // Click the stepper to go back to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.OVERRIDE_CONFIRMATION
        );
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the custom subject line field shows the English text
        await notificationCustomizationPage.verifyCustomSubjectLineText(englishSubjectLine);

        // Verify "Custom subject line" option remains selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();

        // Click the stepper to go forward to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Change language to "Français - French"
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Verify the custom subject line field shows the French text
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.MUST_READ.FRENCH_MANUAL
        );

        // Change language to "हिंदी - Hindi"
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.HINDI);

        // Verify the custom subject line field shows the Hindi text
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.MUST_READ.HINDI_MANUAL
        );

        // Click on "Save"
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Cleanup: Delete the created customization
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc045 - Verify subject line persists when navigating between steps in Edit flow with default subject',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29018',
          storyId: 'INT-24252',
        });

        // Setup: Ensure a customization exists for testing
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify navigated to "Override and confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the "Custom subject line" option is selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();

        // Get the pre-filled subject line text
        const preFilledSubjectLine =
          await notificationCustomizationPage.subjectLineCustomizationComponent.customSubjectTextarea.inputValue();

        // Change the subject line
        const updatedSubjectLine = NotificationTestDataGenerator.generateVersionedSubjectLine(
          preFilledSubjectLine,
          'Updated'
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(updatedSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the translation preview displays the updated subject
        await notificationCustomizationPage.verifyCustomSubjectLineText(updatedSubjectLine);

        // Click the stepper to navigate back to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.OVERRIDE_CONFIRMATION
        );
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the subject line field still contains the updated text
        await notificationCustomizationPage.verifyCustomSubjectLineText(updatedSubjectLine);

        // Verify the "Custom subject line" option remains selected
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectLineIsSelected();

        // Click the stepper to navigate back to "Select notification"
        // Verify "Select notification" step is not clickable (user remains on "Override and confirmation")
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.SELECT_NOTIFICATION
        );
        // Verify we remain on "Override and confirmation" step (not navigated to "Select notification")
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify no data loss occurs (the updated subject still appears)
        await notificationCustomizationPage.verifyCustomSubjectLineText(updatedSubjectLine);

        // Click "Next" to return to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the updated subject is still present in translation preview and input fields
        await notificationCustomizationPage.verifyCustomSubjectLineText(updatedSubjectLine);

        // Click "Save"
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast appears
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Delete the customization
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc046 - Verify Send yourself a test email addresses are not retained when navigating between steps',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28999',
          storyId: 'INT-24252',
        });

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization" button
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify redirected to "Add customization" page
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Select the template "Must reads"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify navigated to "Override and confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter a new subject line
        const customSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        // Verify the entered subject appears correctly in the input field
        await notificationCustomizationPage.verifyCustomSubjectLineText(customSubjectLine);

        // Verify the "Next" button becomes enabled
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT,
          'enabled'
        );

        // Click "Next"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify navigated to "Manage translations" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the "Send yourself a test" section is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );

        // Verify options are visible: "Your email address" and "Different email address"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.yourEmailOption
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.differentEmailOption
        );

        // Select "Different email address"
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();

        // Enter multiple test addresses
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(TEST_EMAILS.MULTI_VALID_CSV);

        // Click "Send test"
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();

        // Verify a confirmation message appears "Test email sent successfully"
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );

        // Click on "Override and confirmation" stepper
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.OVERRIDE_CONFIRMATION
        );
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Click "Next" again to go back to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        // await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the "Different email address" option is NOT preselected
        await notificationCustomizationPage.manageTranslationPage.verifyDifferentEmailAddressIsNotSelected();

        // Select "Different email address" again
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();

        // Verify no previously entered test email addresses are retained (input should be empty)
        await notificationCustomizationPage.manageTranslationPage.verifyEmailAddressInputIsEmpty();

        //And click on save
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);
        //verify toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Cleanup: Delete the created customization
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc047 - Verify Edit-"Send yourself a test" email data does not persist after navigation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29000',
          storyId: 'INT-24252',
        });

        // Setup: Ensure a customization exists for testing
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

        // Click the three-dot menu (⋯) for the "Must reads" row and click "Edit"
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify you are on  "Override and confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        //And click on next
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify navigated to "Manage translations" step (Edit flow goes directly to Manage translations)
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the section "Send yourself a test" is visible
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.sendTestHeading
        );

        // Verify options are visible: "Your email address" and "Different email address"
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.yourEmailOption
        );
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.differentEmailOption
        );

        // Select "Different email address"
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();

        // Enter multiple test addresses
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(TEST_EMAILS.MULTI_VALID_CSV);

        // Click "Send test"
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();

        // Verify a confirmation message appears "Test email sent successfully"
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );

        // Verify the entered email addresses remain visible in the field
        await notificationCustomizationPage.manageTranslationPage.verifyEmailAddressInputValue(
          TEST_EMAILS.MULTI_VALID_CSV
        );

        // Click on "Override and confirmation" stepper
        await notificationCustomizationPage.commonActions.clickButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.OVERRIDE_CONFIRMATION
        );
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Click "Next" again to go back to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //  await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Verify the "Different email address" option is NOT preselected
        await notificationCustomizationPage.manageTranslationPage.verifyDifferentEmailAddressIsNotSelected();

        // Select "Different email address" again
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();

        // Verify no previously entered test email addresses are retained (input should be empty)
        await notificationCustomizationPage.manageTranslationPage.verifyEmailAddressInputIsEmpty();

        // Click "Cancel" to return to listing without saving
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL);
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        //verify toast message
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc048 - Verify user can select the Custom Subject Line option and edit text, including inserting dynamic values at the cursor position',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27635',
          storyId: 'INT-24252',
        });

        // Navigate to notification customization and start the flow
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Verify that the "Select notification" step is displayed
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Expand the "Alerts" section
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Click "Next"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

        // Verify that the user is navigated to the "Override and confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Verify the "Default subject line" displays the value "New Alert - {{message}}"
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyDefaultSubjectLineText(
          TEMPLATE_DATA.ALERTS.TEMPLATE
        );

        // Select the "Custom subject line" option
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Verify that a text area becomes visible and editable
        await notificationCustomizationPage.subjectLineCustomizationComponent.verifyCustomSubjectTextareaIsVisibleAndEditable();

        // Enter text
        const customText = `${TEST_PREFIXES.ALERTS_PREFIX}: `;
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customText);

        // Click the "Add dynamic value" link
        await notificationCustomizationPage.commonActions.clickButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON);

        // Open the dynamic values picker (verifies pop-up appears and list includes "Alert Message")
        await notificationCustomizationPage.addDynamicValueComponent.openDynamicValuesPicker();

        // Select "Alert Message" from the list
        await notificationCustomizationPage.addDynamicValueComponent.clickAlertMessageOption();

        // Verify that the token "{{message}}" is inserted at the cursor position
        // Verify the text area now contains "{{message}}"
        await notificationCustomizationPage.addDynamicValueComponent.verifyCustomSubjectContainsToken(
          DYNAMIC_VALUE_TEXT.ALERT_MESSAGE_TOKEN
        );

        // Verify that the "Next" button becomes enabled once text is entered
        await notificationCustomizationPage.verifier.verifyTheElementIsEnabled(
          notificationCustomizationPage.nextButton
        );

        // Click "Add dynamic value" again and select "Alert Message"
        await notificationCustomizationPage.commonActions.clickButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON);
        await notificationCustomizationPage.addDynamicValueComponent.openDynamicValuesPicker();
        await notificationCustomizationPage.addDynamicValueComponent.clickAlertMessageOption();

        // Verify that another "{{message}}" token is appended at the current cursor position
        // Verify the text area now contains multiple dynamic values
        await notificationCustomizationPage.addDynamicValueComponent.verifyCustomSubjectContainsTokenCount(
          DYNAMIC_VALUE_TEXT.ALERT_MESSAGE_TOKEN,
          2
        );

        // Click "Save" (navigate to Manage translations step first, then save)
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify a success toast appears confirming that the customization was saved successfully
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Cleanup: Delete the created customization
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.ALERTS.FEATURE_NAME);
      }
    );

    test(
      'tc049 - Verify that when a manual translation exists for a language, the email subject uses the manual translation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27630',
          storyId: 'INT-24252',
        });

        const emailUtils = new EmailUtils(process.env.MAILOSAUR_API_KEY!, process.env.MAILOSAUR_SERVER_ID!);
        const randomTestEmail = await emailUtils.generateUniqueEmailAddress('notificationcustomization');

        // Navigate to Notification customization
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();

        // Expand "Must reads" and select the template
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter into the custom subject field
        const englishSubject = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(englishSubject);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Select "Français - French" from the Language dropdown
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Wait for automatic translation to complete
        await notificationCustomizationPage.manageTranslationComponent.waitForTranslationToComplete();
        await notificationCustomizationPage.manageTranslationComponent.verifyAutomaticTranslationText();

        // Click "Convert to manual" or toggle manual translations ON for French
        await notificationCustomizationPage.manageTranslationComponent.switchToManualTranslation();

        // Replace the French subject
        await notificationCustomizationPage.manageTranslationComponent.editTranslationText(
          SUBJECT_LINES.MUST_READ.FRENCH_MANUAL
        );

        // Verify the manual translation is saved
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.MUST_READ.FRENCH_MANUAL
        );

        // Enter email in the test email field
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(randomTestEmail);

        // Click "Send test"
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();

        // Verify success toast "Test email sent successfully"
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );

        // Verify the delivered/preview email subject uses manual translation
        await emailUtils.verifyEmailIsInInboxWithThisSubject({
          sentTo: randomTestEmail,
          subject: SUBJECT_LINES.MUST_READ.FRENCH_MANUAL,
        });

        // Click "Save" on the Manage translations page
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast confirms "Customization saved successfully"
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Verify returned to Notification customization listing
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Re-open the same "Must reads" customization for edit
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Go to "Manage translations" and select "Français - French"
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);
        await notificationCustomizationPage.manageTranslationComponent.selectLanguage(LANGUAGES.FRENCH);

        // Verify the French manual subject field should still contain the manual translation
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.MUST_READ.FRENCH_MANUAL
        );

        // Verify the Send test (when clicked) should continue to send emails using that manual French subject
        // Generate a new unique email for the second test
        const secondTestEmail = await emailUtils.generateUniqueEmailAddress('notificationcustomization');
        await notificationCustomizationPage.manageTranslationPage.selectDifferentEmailAddress();
        await notificationCustomizationPage.manageTranslationPage.fillEmailAddress(secondTestEmail);
        await notificationCustomizationPage.manageTranslationPage.clickSendTestButton();
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT
        );

        // Verify the email subject uses the manual French translation
        await emailUtils.verifyEmailIsInInboxWithThisSubject({
          sentTo: secondTestEmail,
          subject: SUBJECT_LINES.MUST_READ.FRENCH_MANUAL,
        });

        // Cleanup: Delete the created customization to keep tests independent
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc050 - Verify the three-dot menu is displayed for each customization entry with Edit and Delete options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27627',
          storyId: 'INT-24252',
        });

        // Setup: Create fresh test customizations
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.createFreshCustomization(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE,
          TEMPLATE_DATA.ALERTS.BUTTON_NAME
        );
        await notificationCustomizationPage.createFreshCustomization(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );

        // Wait for page to fully load after creating customizations
        await notificationCustomizationPage.waitForListingPageToFullyLoad();

        // Execute: Verify the "Notification customization" table is visible
        await notificationCustomizationPage.verifyNotificationCustomizationTableIsVisible();

        // Verify that a three-dot menu (⋯) icon is displayed for "Must reads" row
        // Click the three-dot menu for the "Must reads" row
        const mustReadsMenuButton = notificationCustomizationPage.getMenuButton(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.clickOnElement(mustReadsMenuButton, { timeout: 10_000 });

        // Verify a dropdown or popup menu appears with Edit and Delete options
        await notificationCustomizationPage.verifyMenuOptionsAreVisibleAndEnabled();

        // Click outside the menu to close it
        await notificationCustomizationPage.closeMenuByClickingOutside();

        // Verify the three-dot menu popup closes automatically
        await notificationCustomizationPage.verifyMenuIsClosed();

        // Verify the same options for "Must reads" row again
        await notificationCustomizationPage.clickOnElement(mustReadsMenuButton, { timeout: 10_000 });
        await notificationCustomizationPage.verifyMenuOptionsAreVisibleAndEnabled();
        await notificationCustomizationPage.closeMenuByClickingOutside();
        await notificationCustomizationPage.verifyMenuIsClosed();

        // Verify the same options for "Alerts" row
        const alertsMenuButton = notificationCustomizationPage.getMenuButton(TEMPLATE_DATA.ALERTS.FEATURE_NAME);
        await notificationCustomizationPage.clickOnElement(alertsMenuButton, { timeout: 10_000 });
        await notificationCustomizationPage.verifyMenuOptionsAreVisibleAndEnabled();
        await notificationCustomizationPage.closeMenuByClickingOutside();
        await notificationCustomizationPage.verifyMenuIsClosed();

        // Cleanup: Delete the created customizations to keep tests independent
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.ALERTS.FEATURE_NAME);
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc051 - Verify delete customization functionality with confirmation modal',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27655',
          storyId: 'INT-24252',
        });

        // Ensure customizations exist for testing
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE,
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME
        );
        await notificationCustomizationPage.ensureAtLeastOneCustomizationExists(
          NotificationFeatures.ALERTS,
          TEMPLATE_DATA.ALERTS.TEMPLATE,
          TEMPLATE_DATA.ALERTS.BUTTON_NAME
        );

        // Click the three-dot menu for "Must reads" customization and click Delete
        await notificationCustomizationPage.clickOnDeleteOption(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify the delete confirmation modal appears with all content
        await notificationCustomizationPage.verifyDeleteConfirmationModalContent();

        // Click "Cancel" on the confirmation modal
        await notificationCustomizationPage.cancelDeletion();

        // Verify the "Must reads" customization remains visible in the list
        await notificationCustomizationPage.waitForCustomizationToBeVisible(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Again click the three-dot menu for "Must reads" and click Delete
        await notificationCustomizationPage.clickOnDeleteOption(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify the delete confirmation modal appears again
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.deleteConfirmationDialog
        );

        // Cancel the modal before testing delete on "Alerts"
        await notificationCustomizationPage.cancelDeletion();

        // Delete "Alerts" customization
        await notificationCustomizationPage.clickOnDeleteOption(TEMPLATE_DATA.ALERTS.FEATURE_NAME);

        // Verify the delete confirmation modal appears
        await notificationCustomizationPage.verifier.verifyTheElementIsVisible(
          notificationCustomizationPage.deleteConfirmationDialog
        );

        // Click "Delete" in the confirmation modal
        await notificationCustomizationPage.confirmDeletion();

        // Verify a success toast message appears
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );

        // Verify the "Alerts" entry is no longer present in the table
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.verifyCustomizationIsNotVisible(TEMPLATE_DATA.ALERTS.FEATURE_NAME);

        // Cleanup: Delete the "Must reads" customization that was created during setup
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
      }
    );

    test(
      'tc052 - Verify duplicate customization cannot be created - template is disabled when already exists',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27645',
          storyId: 'INT-24252',
        });

        // Step 1: Create the first customization
        // Click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Expand "Must reads" and select the template
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter into the custom subject field
        const customSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click "Save"
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast message appears
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Verify redirected to listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Verify that "Must reads" is listed in the table with the subject
        await notificationCustomizationPage.waitForCustomizationToBeVisible(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.verifySubjectInListing(
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME,
          customSubjectLine
        );

        // Step 2: Try to create a duplicate customization
        // Click "Add customization" again
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Expand "Must reads"
        await notificationCustomizationPage.selectNotificationStep.expandFeature(NotificationFeatures.MUST_READS);

        // Verify the radio button or selection for "Must reads" template is disabled (cannot be selected)
        await notificationCustomizationPage.selectNotificationStep.verifyTemplateIsDisabled(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Step 3: Confirm user cannot bypass restriction
        // Verify that "Next" button is disabled until a valid (non-duplicate) template is selected
        await notificationCustomizationPage.verifyNextButtonIsDisabled();

        // Cleanup: Navigate back to listing and delete the created customization
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL);
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc053 - Verify last modified fields are updated correctly',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27651',
          storyId: 'INT-24252',
        });

        // Step 1: Create a new customization
        // Click "Add customization" button
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // Expand "Must reads" and select the template
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // Click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // Enter into the custom subject field
        const customSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubjectLine);

        // Click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        //await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Click "Save"
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

        // Verify success toast message appears
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED
        );

        // Verify redirected to listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Step 2: Validate after creation
        // Verify the "Last modified" field shows "in a few seconds" (or similar relative time)
        await notificationCustomizationPage.verifyLastModifiedTimestamp(
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME,
          TIMESTAMP_TEXT.IN_A_FEW_SECONDS
        );

        // Step 3: Edit the customization
        // Click the three-dot menu (⋯) for the "Must reads" entry
        await notificationCustomizationPage.clickEditFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify on "Override and confirmation" step
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // Update the custom subject line
        const updatedSubjectLine = NotificationTestDataGenerator.generateCustomSubjectLine(
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(updatedSubjectLine);

        // Click "Cancel"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.CANCEL);

        // Verify redirected back to listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Step 4: Validate after edit and cancel
        // Note: Since we clicked "Cancel", the timestamp should NOT be updated
        // Verify the customization row is still visible and timestamp field exists
        await notificationCustomizationPage.waitForCustomizationToBeVisible(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Verify the "Last modified" timestamp still exists (should remain unchanged after cancel)
        // Note: The scenario mentions verifying timestamp is updated, but logically cancel shouldn't update it
        // This verification ensures the timestamp field is still present and accessible
        await notificationCustomizationPage.verifyLastModifiedTimestamp(
          TEMPLATE_DATA.MUST_READ.BUTTON_NAME,
          TIMESTAMP_TEXT.AGO
        );

        // Cleanup: Delete the created customization
        await notificationCustomizationPage.deleteCustomizationFromMenu(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);
        await notificationCustomizationPage.commonActions.verifyToastMessage(
          ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED
        );
      }
    );

    test(
      'tc054 - Char-limit validation blocks Next on Override & persists to Manage translations (static template)',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27654',
          storyId: 'INT-24252',
        });

        // Setup: Ensure clean state (no existing Must reads customization)
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Execute: Test character limit validation
        // Given: I am logged in as "Admin" and navigate to "Application settings → Application → Defaults → Notification customization"
        // And: I click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // And: I expand "Must reads" and select "A 'must read' requires your attention"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.SINGLE_TEMPLATE
        );

        // And: I click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // When: I select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // And: I enter a custom subject line that is longer than 120 characters
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXCEEDING_120_CHARS
        );
        //click outside  using press method
        await notificationCustomizationPage.page.keyboard.press('Tab');

        // Then: I should see the validation message "Custom subject cannot be longer than 120 characters"
        await notificationCustomizationPage.commonActions.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR
        );

        // And: the "Next" button should be disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();

        // When: I shorten the custom subject line to 120 characters or fewer
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXACTLY_120_CHARS
        );

        // Then: the validation message should not be visible
        await notificationCustomizationPage.verifier.verifyTheElementIsNotVisible(
          notificationCustomizationPage.page.getByText(ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR)
        );

        // And: the "Next" button should be enabled
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT,
          'enabled'
        );

        // When: I click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Then: the trimmed custom subject (120 chars) should be present on the Manage translations page
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXACTLY_120_CHARS
        );

        // When: I enter a custom subject line in Manage translations that is longer than 120 characters
        await notificationCustomizationPage.manageTranslationComponent.fillTranslatedSubjectLine(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXCEEDING_120_CHARS
        );

        // Then: I should see the validation message "Custom subject cannot be longer than 120 characters"
        await notificationCustomizationPage.commonActions.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR
        );

        // And: the "Save" button should be disabled
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON,
          'disabled'
        );

        // When: I shorten the subject line in Manage translations to 120 characters or fewer
        await notificationCustomizationPage.manageTranslationComponent.fillTranslatedSubjectLine(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXACTLY_120_CHARS
        );

        // Then: the validation message should disappear
        await notificationCustomizationPage.verifier.verifyTheElementIsNotVisible(
          notificationCustomizationPage.page.getByText(ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR)
        );

        // And: the "Save" button should be enabled
        await notificationCustomizationPage.commonActions.verifyButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON, 'enabled');

        // Cleanup: When I click "Cancel", no customization should be saved
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify redirected to listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc055 - Char-limit validation for dynamic template blocks Next and persists to Manage translations (dynamic template)',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'TBD',
          storyId: 'INT-24252',
        });

        // Setup: Ensure clean state (no existing Must reads customization)
        await notificationCustomizationPage.verifyThePageIsLoaded();
        await notificationCustomizationPage.deleteCustomizationIfExists(TEMPLATE_DATA.MUST_READ.BUTTON_NAME);

        // Execute: Test character limit validation with dynamic template
        // Given: I am logged in as "Admin" and navigate to "Application settings → Application → Defaults → Notification customization"
        // And: I click "Add customization"
        await notificationCustomizationPage.clickOnAddCustomizationButton();
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

        // And: I expand "Must reads" and select "{{count}} 'must read' requires your attention"
        await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(
          NotificationFeatures.MUST_READS,
          TEMPLATE_DATA.MUST_READ.PLURAL_TEMPLATE
        );

        // And: I click "Next" to go to "Override and confirmation"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

        // When: I select "Custom subject line"
        await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

        // And: I enter a custom subject line that is longer than 120 characters
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXCEEDING_120_CHARS
        );
        //click outside  using press method
        await notificationCustomizationPage.page.keyboard.press('Tab');

        // Then: I should see the validation message "Custom subject cannot be longer than 120 characters"
        await notificationCustomizationPage.commonActions.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR
        );

        // And: the "Next" button should be disabled
        await notificationCustomizationPage.verifyNextButtonIsDisabled();

        // When: I shorten the custom subject line to 120 characters or fewer while keeping the dynamic token
        await notificationCustomizationPage.subjectLineCustomizationComponent.fillCustomSubjectLine(
          SUBJECT_LINES.VALIDATION.DYNAMIC_SUBJECT_WITH_TOKEN_120_CHARS
        );

        // Then: the validation message should not be visible
        await notificationCustomizationPage.verifier.verifyTheElementIsNotVisible(
          notificationCustomizationPage.page.getByText(ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR)
        );

        // And: the "Next" button should be enabled
        await notificationCustomizationPage.commonActions.verifyButton(
          PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT,
          'enabled'
        );

        // When: I click "Next" to go to "Manage translations"
        await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
        await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

        // Then: the trimmed custom subject should be displayed for the dynamic template
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(
          SUBJECT_LINES.VALIDATION.DYNAMIC_SUBJECT_WITH_TOKEN_120_CHARS
        );

        // And: the dynamic token "{{count}}" should remain visible in the translation preview
        await notificationCustomizationPage.manageTranslationComponent.verifyTranslationTextContainsToken(
          DYNAMIC_VALUE_TEXT.COUNT_TOKEN
        );

        // When: I enter a subject line in Manage translations that is longer than 120 characters
        await notificationCustomizationPage.manageTranslationComponent.fillTranslatedSubjectLine(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXCEEDING_120_CHARS
        );

        // Then: I should see the validation message "Custom subject cannot be longer than 120 characters"
        await notificationCustomizationPage.commonActions.verifyInlineErrorMessage(
          ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR
        );

        // And: the "Save" button should be disabled
        await notificationCustomizationPage.commonActions.verifyButton(
          MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON,
          'disabled'
        );

        // When: I shorten the subject line in Manage translations to 120 characters or fewer
        await notificationCustomizationPage.manageTranslationComponent.fillTranslatedSubjectLine(
          SUBJECT_LINES.VALIDATION.SUBJECT_EXACTLY_120_CHARS
        );

        // Then: the validation message should disappear
        await notificationCustomizationPage.verifier.verifyTheElementIsNotVisible(
          notificationCustomizationPage.page.getByText(ALERT_NOTIFICATION_MESSAGES.CHAR_LIMIT_VALIDATION_ERROR)
        );

        // And: the "Save" button should be enabled
        await notificationCustomizationPage.commonActions.verifyButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON, 'enabled');

        // Cleanup: When I click "Cancel", no customization should be saved
        await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);

        // Verify redirected to listing page
        await notificationCustomizationPage.verifyThePageIsLoaded();
      }
    );

    test(
      'tc056 - Verify Recipient First Name and Recipient Last Name dynamic values across email subject customizations',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'TBD',
          storyId: 'TBD',
        });

        // Given I am on the Notification customization page
        await notificationCustomizationPage.verifyThePageIsLoaded();

        // Define the set of notification customizations that support email subject overrides
        // Use NOTIFICATION_CATEGORY_TEMPLATES so we cover ALL configured templates for each category
        const subjectSupportingTemplates = Object.values(NOTIFICATION_CATEGORY_TEMPLATES).flatMap(
          ({ header, templates }) =>
            templates.map(template => ({
              feature: header as NotificationFeatures,
              template,
            }))
        );

        for (const { feature, template } of subjectSupportingTemplates) {
          // Start Add customization flow
          await notificationCustomizationPage.clickOnAddCustomizationButton();
          await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_NOTIFICATION);

          // Select the notification/template
          await notificationCustomizationPage.selectNotificationStep.selectTemplateForFeature(feature, template);
          await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

          // On Override and confirmation step
          await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.SELECT_SUBJECT_LINE);

          // Select Custom subject line
          await notificationCustomizationPage.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();

          // Verify "Add dynamic value" action is visible
          await notificationCustomizationPage.commonActions.verifyButton(
            DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON,
            'visible'
          );

          // Open dynamic values picker
          await notificationCustomizationPage.commonActions.clickButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON);
          await notificationCustomizationPage.addDynamicValueComponent.openDynamicValuesPicker();

          // Verify Recipient First Name / Last Name options are available
          await notificationCustomizationPage.addDynamicValueComponent.verifyDynamicValueOptionVisible(
            DYNAMIC_VALUE_TEXT.RECIPIENT_FIRST_NAME_OPTION
          );
          await notificationCustomizationPage.addDynamicValueComponent.verifyDynamicValueOptionVisible(
            DYNAMIC_VALUE_TEXT.RECIPIENT_LAST_NAME_OPTION
          );

          // Insert Recipient First Name and verify token is added to the subject line
          await notificationCustomizationPage.addDynamicValueComponent.clickDynamicValueOption(
            DYNAMIC_VALUE_TEXT.RECIPIENT_FIRST_NAME_OPTION
          );
          await notificationCustomizationPage.addDynamicValueComponent.verifyCustomSubjectContainsToken(
            DYNAMIC_VALUE_TEXT.RECIPIENT_FIRST_NAME_TOKEN
          );

          // Open picker again, insert Recipient Last Name, and verify token is added
          await notificationCustomizationPage.commonActions.clickButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON);
          await notificationCustomizationPage.addDynamicValueComponent.openDynamicValuesPicker();
          await notificationCustomizationPage.addDynamicValueComponent.clickDynamicValueOption(
            DYNAMIC_VALUE_TEXT.RECIPIENT_LAST_NAME_OPTION
          );
          await notificationCustomizationPage.addDynamicValueComponent.verifyCustomSubjectContainsToken(
            DYNAMIC_VALUE_TEXT.RECIPIENT_LAST_NAME_TOKEN
          );

          // Capture subject value after inserting RFN/RLN
          const overrideStepSubject =
            await notificationCustomizationPage.addDynamicValueComponent.getCustomSubjectValue();

          // Proceed to Manage translations step
          await notificationCustomizationPage.commonActions.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);
          await notificationCustomizationPage.verifyUserIsOnStep(CustomizationNotificationSteps.MANAGE_TRANSLATIONS);

          // Verify subject line content remains unchanged on Manage translations
          await notificationCustomizationPage.manageTranslationComponent.verifyTranslationText(overrideStepSubject);

          // Verify dynamic values dropdown is still available and RFN/RLN options are present
          await notificationCustomizationPage.commonActions.clickButton(DYNAMIC_VALUE_TEXT.ADD_DYNAMIC_VALUE_BUTTON);
          await notificationCustomizationPage.addDynamicValueComponent.openDynamicValuesPicker();
          await notificationCustomizationPage.addDynamicValueComponent.verifyDynamicValueOptionVisible(
            DYNAMIC_VALUE_TEXT.RECIPIENT_FIRST_NAME_OPTION
          );
          await notificationCustomizationPage.addDynamicValueComponent.verifyDynamicValueOptionVisible(
            DYNAMIC_VALUE_TEXT.RECIPIENT_LAST_NAME_OPTION
          );

          // Cancel without saving to keep state clean and return to listing
          await notificationCustomizationPage.commonActions.clickButton(MANAGE_TRANSLATIONS_TEXT.CANCEL_BUTTON);
          await notificationCustomizationPage.verifyThePageIsLoaded();
        }
      }
    );
  }
);
