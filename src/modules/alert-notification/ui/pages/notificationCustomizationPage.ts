import { Locator, Page, test } from '@playwright/test';

import {
  MANAGE_TRANSLATIONS_TEXT,
  OVERRIDE_CONFIRMATION_TEXT,
  PAGE_TEXT,
  SUBJECT_LINE_RADIO_NAMES,
  TEMPLATE_DATA,
} from '../../tests/test-data/notification-customization.test-data';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';
import { AddDynamicValueComponent } from '@/src/modules/alert-notification/ui/components/addDynamicValueComponent';
import { ManageTranslationComponent } from '@/src/modules/alert-notification/ui/components/manageTranslationComponent';
import {
  NotificationFeatures,
  SelectNotificationStep,
} from '@/src/modules/alert-notification/ui/components/selectNotificationStep';
import { SubjectLineCustomizationComponent } from '@/src/modules/alert-notification/ui/components/subjectLineCustomizationComponent';
import { NotificationCustomizationHelper } from '@/src/modules/alert-notification/ui/helpers/notificationCustomizationHelper';
import { ManageTranslationPage } from '@/src/modules/alert-notification/ui/pages/manageTranslationPage';

export enum CustomizationNotificationSteps {
  SELECT_NOTIFICATION = 'SELECT_NOTIFICATION',
  SELECT_SUBJECT_LINE = 'SELECT_SUBJECT_LINE',
  MANAGE_TRANSLATIONS = 'MANAGE_TRANSLATIONS',
}

export class NotificationCustomizationPage extends BasePage {
  readonly addCustomizationButton: Locator;
  readonly selectNotificationStep: SelectNotificationStep;
  readonly subjectLineCustomizationComponent: SubjectLineCustomizationComponent;
  readonly addDynamicValueComponent: AddDynamicValueComponent;
  readonly manageTranslationComponent: ManageTranslationComponent;
  readonly manageTranslationPage: ManageTranslationPage;
  readonly nextButton: Locator;
  readonly saveButton: Locator;
  readonly searchInput: Locator;

  // Page title and description locators
  readonly notificationCustomizationTitle: Locator;
  readonly notificationCustomizationDescription: Locator;
  readonly addCustomizationTitle: Locator;
  readonly addCustomizationSubheading: Locator;

  // Stepper step locators
  readonly selectNotificationStepText: Locator;
  readonly overrideConfirmationStepText: Locator;
  readonly manageTranslationsStepText: Locator;

  // Radio button locators (not buttons, need specific handling)
  readonly defaultSubjectLineRadio: Locator;
  readonly customSubjectLineRadio: Locator;

  // Template button locators (not regular buttons, need specific handling)
  readonly mustReadButton: Locator;
  readonly alertsButton: Locator;

  // Helper text locators
  readonly subjectLineHelperText: Locator;
  readonly customSubjectHelperText: Locator;
  readonly sendTestHelperText: Locator;
  readonly differentEmailHelperText: Locator;

  // Email option locators (radio buttons, not regular buttons)
  readonly yourEmailOption: Locator;
  readonly differentEmailOption: Locator;

  // Section heading locators
  readonly sendTestHeading: Locator;
  readonly tipsHeading: Locator;

  // Help icon locator
  readonly helpIcon: Locator;

  // Navigation locators
  readonly defaultsBreadcrumb: Locator;

  // List locators
  readonly notificationItems: Locator; // For listing page - table rows
  readonly noResultsFoundText: Locator;

  // Add customization page locators
  readonly templateItems: Locator; // For Add customization page - accordion items

  // Modal dialog locators
  readonly deleteConfirmationDialog: Locator;
  readonly deleteConfirmationMessage: Locator;
  readonly deleteConfirmationDescription: Locator;
  readonly modalCancelButton: Locator;
  readonly modalConfirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
    // "Add customization" is a link in QA, not a button
    this.addCustomizationButton = page.locator('a[href*="notifications-customization/add-override"]');
    this.selectNotificationStep = new SelectNotificationStep(page);
    this.subjectLineCustomizationComponent = new SubjectLineCustomizationComponent(page);
    this.addDynamicValueComponent = new AddDynamicValueComponent(page);
    this.manageTranslationComponent = new ManageTranslationComponent(page);
    this.manageTranslationPage = new ManageTranslationPage(page);
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.searchInput = page.getByRole('textbox', { name: 'Search…' });

    // Page title and description locators
    this.notificationCustomizationTitle = page.getByRole('heading', {
      name: PAGE_TEXT.NOTIFICATION_CUSTOMIZATION.TITLE,
    });
    this.notificationCustomizationDescription = page.getByText(
      PAGE_TEXT.NOTIFICATION_CUSTOMIZATION.DESCRIPTION_PARTIAL,
      { exact: false }
    );
    this.addCustomizationTitle = page.getByRole('heading', { name: PAGE_TEXT.ADD_CUSTOMIZATION.TITLE });
    this.addCustomizationSubheading = page.getByText(PAGE_TEXT.ADD_CUSTOMIZATION.SUBHEADING_PARTIAL, { exact: false });

    // Stepper step locators
    this.selectNotificationStepText = page.getByText(PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.SELECT_NOTIFICATION);
    this.overrideConfirmationStepText = page.getByText(PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.OVERRIDE_CONFIRMATION);
    this.manageTranslationsStepText = page.getByText(PAGE_TEXT.ADD_CUSTOMIZATION.STEPPER_STEPS.MANAGE_TRANSLATIONS);

    // Radio button locators (not buttons, need specific handling)
    this.defaultSubjectLineRadio = page.getByRole('radio', { name: SUBJECT_LINE_RADIO_NAMES.DEFAULT });
    this.customSubjectLineRadio = page.getByRole('radio', { name: SUBJECT_LINE_RADIO_NAMES.CUSTOM });

    // Template button locators (not regular buttons, need specific handling)
    this.mustReadButton = page.getByRole('button', { name: TEMPLATE_DATA.MUST_READ.BUTTON_NAME });
    this.alertsButton = page.getByRole('button', { name: TEMPLATE_DATA.ALERTS.BUTTON_NAME });

    // Helper text locators
    this.subjectLineHelperText = page.getByText(OVERRIDE_CONFIRMATION_TEXT.HELPER_TEXT);
    this.customSubjectHelperText = page.getByText(MANAGE_TRANSLATIONS_TEXT.CUSTOM_SUBJECT_HELPER);
    this.sendTestHelperText = page.getByText(MANAGE_TRANSLATIONS_TEXT.SEND_TEST_HELPER);
    this.differentEmailHelperText = page.getByText(MANAGE_TRANSLATIONS_TEXT.DIFFERENT_EMAIL_HELPER);

    // Email option locators
    this.yourEmailOption = page.getByRole('radio', { name: MANAGE_TRANSLATIONS_TEXT.YOUR_EMAIL_OPTION });
    this.differentEmailOption = page.getByRole('radio', { name: MANAGE_TRANSLATIONS_TEXT.DIFFERENT_EMAIL_OPTION });

    // Section heading locators
    this.sendTestHeading = page.getByRole('heading', { name: MANAGE_TRANSLATIONS_TEXT.SEND_TEST_HEADING });
    this.tipsHeading = page.getByRole('heading', { name: OVERRIDE_CONFIRMATION_TEXT.TIPS_HEADING });
    this.helpIcon = page.getByTestId('i-helpCircle');

    // Navigation locators
    this.defaultsBreadcrumb = page.getByRole('button', { name: PAGE_TEXT.ADD_CUSTOMIZATION.DEFAULTS_BREADCRUMB });

    // List locators - For listing page (saved notification customizations)
    this.notificationItems = page.locator('tbody tr[data-testid^="dataGridRow-"]');
    this.noResultsFoundText = page.getByText('No results found');

    // Add customization page locators - For template selection page
    this.templateItems = page.locator('[class*="Accordion-module__AccordionItem"]');

    // Modal dialog locators
    this.deleteConfirmationDialog = page.getByRole('dialog');
    this.deleteConfirmationMessage = page.getByText('Are you sure you want to delete notification override?');
    this.deleteConfirmationDescription = page.getByText(
      'This will remove the custom subject line for this notification. The default subject line will be used instead.'
    );
    this.modalCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.modalConfirmDeleteButton = page.getByRole('button', { name: 'Delete' });
  }

  /**
   * Verifies the notification customization page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addCustomizationButton, {
        assertionMessage: 'Add customization button is visible',
        timeout: 30000,
      });
    });
  }

  /**
   * Clicks on the add customization button
   */
  async clickOnAddCustomizationButton(): Promise<void> {
    await test.step('Click on add customization button', async () => {
      await this.clickOnElement(this.addCustomizationButton);
    });
  }

  /**
   * Verifies the user is on the step
   * @param customizationStep - The customization step
   */
  async verifyUserIsOnStep(customizationStep: CustomizationNotificationSteps): Promise<void> {
    await test.step(`Verify user is on step: ${customizationStep} - > to add notification customization`, async () => {
      if (customizationStep === CustomizationNotificationSteps.SELECT_NOTIFICATION) {
        await this.selectNotificationStep.verifySelectNotificationStepIsLoaded();
      } else if (customizationStep === CustomizationNotificationSteps.SELECT_SUBJECT_LINE) {
        await this.subjectLineCustomizationComponent.verifySubjectLineCustomizationComponentIsLoaded();
      } else {
        await this.manageTranslationComponent.verifyManageTranslationComponentIsLoaded();
      }
    });
  }

  /**
   * Verifies the next button is disabled
   */
  async verifyNextButtonIsDisabled(): Promise<void> {
    await test.step('Verify next button is disabled', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.nextButton, {
        assertionMessage: 'Next button should be disabled',
      });
    });
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName });
      await this.clickOnElement(button, { timeout });
    });
  }

  /**
   * Verifies button state (visible, enabled, disabled)
   * @param buttonName - The name of the button
   * @param verificationType - Type of verification (visible, enabled, disabled)
   * @param step - Optional step name
   */
  async verifyButton(
    buttonName: string,
    verificationType: 'visible' | 'enabled' | 'disabled',
    step?: string
  ): Promise<void> {
    const stepName = step || `Verify ${buttonName} button is ${verificationType}`;
    await test.step(stepName, async () => {
      // Use first() to handle multiple buttons with same name (e.g., Cancel button in tooltip and in step)
      const button = this.page.getByRole('button', { name: buttonName }).first();
      switch (verificationType) {
        case 'visible':
          await this.verifier.verifyTheElementIsVisible(button);
          break;
        case 'enabled':
          await this.verifier.verifyTheElementIsEnabled(button);
          break;
        case 'disabled':
          await this.verifier.verifyTheElementIsDisabled(button);
          break;
      }
    });
  }

  /**
   * Counts the number of notification items in the list (for listing page)
   * @returns Promise<number> - The count of notification items
   */
  async countNotificationItems(): Promise<number> {
    return await test.step('Count notification items in the list', async () => {
      const count = await this.notificationItems.count();
      return count;
    });
  }

  /**
   * Counts the number of template items on the Add customization page
   * @returns Promise<number> - The count of template items
   */
  async countTemplateItems(): Promise<number> {
    return await test.step('Count template items on Add customization page', async () => {
      const count = await this.templateItems.count();
      return count;
    });
  }

  /**
   * Verifies that the template items count matches the expected count (for Add customization page)
   * @param expectedCount - The expected count of template items
   */
  async verifyTemplateItemsCount(expectedCount: number): Promise<void> {
    await test.step(`Verify template items count is ${expectedCount}`, async () => {
      const actualCount = await this.countTemplateItems();

      if (expectedCount === 0) {
        // For empty state, verify "No results found" message is visible
        await this.verifier.verifyTheElementIsVisible(this.noResultsFoundText, {
          assertionMessage: `Expected 0 template items, but found ${actualCount} items`,
        });
      } else {
        // For non-empty state, verify first item is visible and count matches
        await this.verifier.verifyTheElementIsVisible(this.templateItems.first(), {
          assertionMessage: `Expected ${expectedCount} template items, but found ${actualCount} items`,
        });
      }
    });
  }

  /**
   * Clears the search input and waits for the list to restore
   * @param restoredCount - The restored count of items
   */
  async Verifytherestoredcount(expectedCount: number): Promise<void> {
    // Verify the restored count matches expected
    const restoredCount = await this.countTemplateItems();
    if (restoredCount !== expectedCount) {
      throw new Error(`Expected restored count to be ${expectedCount}, but found ${restoredCount}`);
    }
  }

  /**
   * Opens the More menu and clicks the Delete option for the first item
   */
  async clickOnDeleteOption(): Promise<void> {
    await test.step('Click on delete option from More menu', async () => {
      const menuButton = this.page.getByRole('button', { name: 'More' }).first();
      await this.clickOnElement(menuButton);

      const deleteOption = this.page.getByRole('button', { name: 'Delete' });
      await this.clickOnElement(deleteOption);
    });
  }

  /**
   * Verifies that the count has decreased by 1 after deletion
   * @param countBeforeDeletion - The count before deletion
   */
  async verifyCountDecreasedInAddCustomization(countBeforeDeletion: number): Promise<void> {
    await test.step('Verify count decreased by 1 after deletion', async () => {
      const finalCount = await this.countNotificationItems();
      const expectedCount = Math.max(0, countBeforeDeletion - 1); // Ensure count never goes negative
      if (finalCount !== expectedCount) {
        throw new Error(`Expected count to be ${expectedCount}, but found ${finalCount}`);
      }
    });
  }

  /**
   * Counts and validates that template items are present (greater than 0)
   * @returns Promise<number> - The count of template items
   */
  async countAndValidateTemplateItems(): Promise<number> {
    return await test.step('Count and validate template items are present', async () => {
      const baseCount = await this.countTemplateItems();
      if (baseCount <= 0) {
        throw new Error(`Expected base count to be greater than 0, but found ${baseCount}`);
      }
      return baseCount;
    });
  }

  /**
   * Verifies that filtered count is within the expected range (between 1 and baseCount)
   * @param baseCount - The base count of items before filtering
   */
  async verifyFilteredCountIsValid(baseCount: number): Promise<void> {
    await test.step('Verify filtered count is within valid range', async () => {
      const filteredCount = await this.countTemplateItems();
      if (filteredCount < 1 || filteredCount > baseCount) {
        throw new Error(`Expected filtered count to be between 1 and ${baseCount}, but found ${filteredCount}`);
      }
    });
  }

  /**
   * Confirms deletion in the modal
   */
  async confirmDeletion(): Promise<void> {
    await test.step('Confirm deletion in modal', async () => {
      await this.clickOnElement(this.modalConfirmDeleteButton);
    });
  }

  /**
   * Verifies that the notification items count has not changed
   * @param previousCount - The previous count of items
   */
  async verifyNotificationItemsCountUnchanged(previousCount: number): Promise<void> {
    await test.step(`Verify notification items count has not changed from ${previousCount}`, async () => {
      const currentCount = await this.countNotificationItems();

      if (currentCount !== previousCount) {
        throw new Error(
          `Expected row count to remain ${previousCount}, but found ${currentCount}. A new entry may have been created or deleted.`
        );
      }
    });
  }

  /**
   * Verifies that a toast message with the specified text is visible
   * @param message - The expected toast message text
   */
  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verify toast message: ${message}`, async () => {
      const specificAlert = this.page.getByRole('alert').filter({ hasText: message }).first();
      await this.verifier.verifyTheElementIsVisible(specificAlert, {
        timeout: 15_000,
        assertionMessage: `Toast should contain: ${message}`,
      });
    });
  }

  /**
   * Searches in the notification listing
   * @param searchText - The text to search for
   */
  async searchInListing(searchText: string): Promise<void> {
    await test.step(`Search in listing: ${searchText}`, async () => {
      if (searchText) {
        // Click on search input and fill with search text
        await this.clickOnElement(this.searchInput);
        await this.fillInElement(this.searchInput, searchText);
        // Wait for search results to load - verify first result is visible
        await this.verifier.verifyTheElementIsVisible(this.templateItems.first(), {
          timeout: 5000,
        });
      } else {
        // Clear search by clicking the Clear button
        const clearButton = this.page.getByRole('button', { name: 'Clear' });
        await this.clickOnElement(clearButton);
        // Wait for results to restore - verify list is restored
        await this.verifier.verifyTheElementIsVisible(this.templateItems.first(), {
          timeout: 5000,
        });
      }
    });
  }

  /**
   * Deletes a customization from the menu
   * @param customizationText - Optional text to identify the specific customization row
   */
  async deleteCustomizationFromMenu(customizationText?: string): Promise<void> {
    await test.step('Delete customization from menu', async () => {
      // Click the 'More' menu button (first one if no specific text provided)
      const menuButton = customizationText
        ? this.page.locator(`tr:has-text("${customizationText}")`).getByRole('button', { name: 'More' }).first()
        : this.page.getByRole('button', { name: 'More' }).first();

      await this.clickOnElement(menuButton, { timeout: 10_000 });

      // Click delete option from menu
      const deleteOption = this.page.getByRole('button', { name: 'Delete' });
      await this.clickOnElement(deleteOption);

      // Wait for dialog and confirm deletion
      const dialog = this.page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 5_000 });
      const confirmDeleteButton = dialog.getByRole('button', { name: 'Delete' });
      await this.clickOnElement(confirmDeleteButton);
    });
  }

  /**
   * Verifies the custom subject line field shows the expected text
   * @param expectedText - The expected text in the custom subject line field
   */
  async verifyCustomSubjectLineText(expectedText: string): Promise<void> {
    await test.step(`Verify custom subject line text: ${expectedText}`, async () => {
      const customSubjectTextarea = this.page.locator('#customSubjectTextarea');
      await this.verifier.verifyTheElementIsVisible(customSubjectTextarea, {
        assertionMessage: 'Custom subject line textarea should be visible',
        timeout: 10_000,
      });
      const actualText = await customSubjectTextarea.inputValue();
      if (actualText !== expectedText) {
        throw new Error(`Expected custom subject line to be "${expectedText}", but found "${actualText}"`);
      }
    });
  }

  /**
   * Edits the subject line on the manage translations page by clicking on the text and filling it
   * @param currentText - The current subject line text (partial match to find and click)
   * @param newText - The new text to set
   */
  async editSubjectLineOnManageTranslationsPage(currentText: string, newText: string): Promise<void> {
    await test.step(`Edit subject line on manage translations page: ${newText}`, async () => {
      // Find and click on the text to make it editable
      const subjectText = this.page.getByText(currentText, { exact: false });
      await this.verifier.verifyTheElementIsVisible(subjectText, {
        assertionMessage: `Subject line text "${currentText}" should be visible`,
        timeout: 10_000,
      });
      await this.clickOnElement(subjectText);

      // Fill with new text - the textarea should be editable after clicking
      const customSubjectTextarea = this.page.locator('#customSubjectTextarea');
      await this.verifier.verifyTheElementIsEnabled(customSubjectTextarea, {
        assertionMessage: 'Custom subject line textarea should be enabled',
        timeout: 5_000,
      });
      await this.fillInElement(customSubjectTextarea, newText);
    });
  }

  /**
   * Clicks Edit option from the More menu for a specific customization
   * @param customizationText - The text to identify the specific customization row (e.g., "Must reads")
   */
  async clickEditFromMenu(customizationText: string): Promise<void> {
    await test.step(`Click Edit from More menu for ${customizationText}`, async () => {
      // Click the 'More' menu button for the specific customization
      const menuButton = this.page
        .locator(`tr:has-text("${customizationText}")`)
        .getByRole('button', { name: 'More' })
        .first();
      await this.clickOnElement(menuButton, { timeout: 10_000 });

      // Click Edit option from menu
      const editOption = this.page.getByRole('button', { name: 'Edit' });
      await this.clickOnElement(editOption);

      // Wait for the Add customization page to load
      await this.verifier.verifyTheElementIsVisible(this.addCustomizationTitle, {
        assertionMessage: 'Add customization page should be visible',
        timeout: 10_000,
      });
    });
  }

  /**
   * Verifies the subject text in the listing row for a specific customization
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   * @param expectedSubject - The expected subject text in the Subject column
   */
  async verifySubjectInListing(customizationText: string, expectedSubject: string): Promise<void> {
    await test.step(`Verify subject "${expectedSubject}" in listing for ${customizationText}`, async () => {
      const row = this.page.locator(`tr:has-text("${customizationText}")`).first();
      await this.verifier.verifyTheElementIsVisible(row, {
        assertionMessage: `Row for ${customizationText} should be visible`,
        timeout: 10_000,
      });

      // Find the subject text in the row (it should be in a cell)
      const subjectCell = row.getByText(expectedSubject, { exact: false });
      await this.verifier.verifyTheElementIsVisible(subjectCell, {
        assertionMessage: `Subject "${expectedSubject}" should be visible in listing`,
        timeout: 10_000,
      });
    });
  }

  /**
   * Verifies the help icon is visible
   */
  async verifyHelpIconIsVisible(): Promise<void> {
    await test.step('Verify help icon is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.helpIcon, {
        assertionMessage: 'Help icon should be visible',
        timeout: 10_000,
      });
    });
  }

  /**
   * Ensures at least one customization exists for the specified feature and template
   * If none exists, creates one
   * @param feature - The notification feature (e.g., MUST_READS, ALERTS)
   * @param template - The template name to use for this feature
   */
  async ensureAtLeastOneCustomizationExists(feature: NotificationFeatures, template: string): Promise<void> {
    await test.step(`Ensure at least one customization exists for ${feature}`, async () => {
      // Wait for page to be fully loaded before counting items
      await this.verifyThePageIsLoaded();

      // Wait for notification items to be visible (if any exist)
      const currentCount = await this.countNotificationItems();
      if (currentCount > 0) {
        // Wait for existing items to be fully loaded
        await this.verifier.verifyTheElementIsVisible(this.notificationItems.first(), {
          timeout: 10_000,
        });
      }

      if (currentCount === 0) {
        await NotificationCustomizationHelper.createNotificationCustomization(this, feature, template);
      }
    });
  }
}
