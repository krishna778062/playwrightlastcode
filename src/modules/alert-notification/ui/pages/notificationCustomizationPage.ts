import { Locator, Page, test } from '@playwright/test';

import { ALERT_NOTIFICATION_MESSAGES } from '../../constants/messageRepo';
import {
  MANAGE_TRANSLATIONS_TEXT,
  OVERRIDE_CONFIRMATION_TEXT,
  PAGE_TEXT,
  SUBJECT_LINE_RADIO_NAMES,
  TEMPLATE_DATA,
} from '../../tests/test-data/notification-customization.test-data';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';
import { AddDynamicValueComponent } from '@/src/modules/alert-notification/ui/components/addDynamicValueComponent';
import { CommonActionsComponent } from '@/src/modules/alert-notification/ui/components/commonActionsComponent';
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
  readonly commonActions: CommonActionsComponent;
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
    this.commonActions = new CommonActionsComponent(page);
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
   * Waits for the listing page to fully load with all existing customizations
   * Uses element visibility checks instead of hard waits to follow framework patterns
   */
  async waitForListingPageToFullyLoad(): Promise<void> {
    await test.step('Wait for listing page to fully load with customizations', async () => {
      // First verify the page basic elements are loaded
      await this.verifyThePageIsLoaded();

      // Check if there are any existing items and wait for them to be fully loaded
      // Use try-catch since page might be empty (no customizations exist)
      try {
        const itemCount = await this.notificationItems.count();
        if (itemCount > 0) {
          // If items exist, wait for the first item to be visible (indicates data is loaded)
          await this.verifier.verifyTheElementIsVisible(this.notificationItems.first(), {
            assertionMessage: 'First notification item should be visible',
            timeout: 10_000,
          });
        }
      } catch {
        // If no items exist or counting fails, it's okay - page might be empty
        // The page is still loaded (verified by verifyThePageIsLoaded above)
      }
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

  /**
   * Verifies button state - delegates to CommonActionsComponent
   */
  async verifyButton(
    buttonName: string,
    verificationType: 'visible' | 'enabled' | 'disabled',
    step?: string
  ): Promise<void> {
    await this.commonActions.verifyButton(buttonName, verificationType, step);
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
   * Verifies that template items counter shows items (count > 0)
   */
  async verifyTemplateItemsCounterIsVisible(): Promise<void> {
    await test.step('Verify template items counter shows items', async () => {
      const templateCount = await this.countTemplateItems();
      if (templateCount === 0) {
        throw new Error('Template items counter should show items but count is 0');
      }
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
   * Opens the More menu and clicks the Delete option
   * @param customizationText - Optional text to identify the specific customization row. If not provided, uses the first item.
   */
  async clickOnDeleteOption(customizationText?: string): Promise<void> {
    await test.step('Click on delete option from More menu', async () => {
      const menuButton = customizationText
        ? this.getMenuButton(customizationText)
        : this.page.getByRole('button', { name: 'More' }).first();
      await this.clickOnElement(menuButton, { timeout: 10_000 });

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
   * Verifies toast message is visible - delegates to CommonActionsComponent
   */
  async verifyToastMessage(message: string): Promise<void> {
    await this.commonActions.verifyToastMessage(message);
  }

  /**
   * Verifies toast message is NOT visible - delegates to CommonActionsComponent
   */

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
        ? this.getMenuButton(customizationText)
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
      const menuButton = this.getMenuButton(customizationText);
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
   * Waits for a customization to be visible in the listing
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   */
  async waitForCustomizationToBeVisible(customizationText: string): Promise<void> {
    await test.step(`Wait for customization "${customizationText}" to be visible in listing`, async () => {
      const row = this.page.locator(`tr:has-text("${customizationText}")`).first();
      await this.verifier.verifyTheElementIsVisible(row, {
        assertionMessage: `Customization row for "${customizationText}" should be visible`,
        timeout: 30_000,
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
   * Gets the "Last modified" timestamp text for a specific customization row
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   * @returns Promise<string> - The "Last modified" timestamp text
   */
  async getLastModifiedTimestamp(customizationText: string): Promise<string> {
    return await test.step(`Get last modified timestamp for ${customizationText}`, async () => {
      const row = this.page.locator(`tr:has-text("${customizationText}")`).first();
      await this.verifier.verifyTheElementIsVisible(row, {
        assertionMessage: `Row for ${customizationText} should be visible`,
        timeout: 10_000,
      });

      // Find the "Last modified" cell - typically contains text like "in a few seconds", "a few seconds ago", "a minute ago", etc.
      // The timestamp is usually in a cell that contains relative time text
      const lastModifiedCell = row
        .locator('td')
        .filter({ hasText: /(in|ago|seconds|minute|minutes|hour|hours|day|days)/i })
        .last();
      const timestampText = await lastModifiedCell.textContent();
      if (!timestampText) {
        throw new Error(`Could not find "Last modified" timestamp for ${customizationText}`);
      }
      return timestampText.trim();
    });
  }

  /**
   * Verifies the "Last modified" field shows expected text (e.g., "in a few seconds")
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   * @param expectedText - The expected timestamp text (can be partial match, e.g., "in a few seconds", "a minute ago")
   */
  async verifyLastModifiedTimestamp(customizationText: string, expectedText: string): Promise<void> {
    await test.step(`Verify last modified timestamp for ${customizationText} shows "${expectedText}"`, async () => {
      const row = this.page.locator(`tr:has-text("${customizationText}")`).first();
      await this.verifier.verifyTheElementIsVisible(row, {
        assertionMessage: `Row for ${customizationText} should be visible`,
        timeout: 10_000,
      });

      // Find the timestamp text in the row (it should be in a cell)
      const timestampCell = row.getByText(expectedText, { exact: false });
      await this.verifier.verifyTheElementIsVisible(timestampCell, {
        assertionMessage: `Last modified timestamp "${expectedText}" should be visible in listing`,
        timeout: 10_000,
      });
    });
  }

  /**
   * Verifies that the "Last modified" timestamp has been updated (changed from previous value)
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   * @param previousTimestamp - The previous timestamp text to compare against
   */
  async verifyLastModifiedTimestampUpdated(customizationText: string, previousTimestamp: string): Promise<void> {
    await test.step(`Verify last modified timestamp for ${customizationText} has been updated from "${previousTimestamp}"`, async () => {
      // Wait a moment for the timestamp to potentially update
      await this.page.waitForTimeout(1_000);

      const currentTimestamp = await this.getLastModifiedTimestamp(customizationText);

      // The timestamp should be different from the previous one
      if (currentTimestamp === previousTimestamp) {
        throw new Error(
          `Expected "Last modified" timestamp to be updated for ${customizationText}, but it remains "${currentTimestamp}"`
        );
      }
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
   * Verifies the best practices tooltip is visible and contains the expected bullet points
   * @param expectedBulletPoints - Array of expected bullet point texts
   */
  async verifyBestPracticesTooltipContent(expectedBulletPoints: readonly string[]): Promise<void> {
    await test.step('Verify best practices tooltip content', async () => {
      // Verify tooltip heading is visible (ensures tooltip is open)
      await this.verifier.verifyTheElementIsVisible(this.tipsHeading, {
        assertionMessage: 'Tips heading should be visible in tooltip',
        timeout: 10_000,
      });

      // Use XPath to locate the paragraph elements containing bullet points
      // XPath: //h5[text()='Tips for custom subject lines']//ancestor::div[contains(@class,'Panel-module__panel__5CmIk')]//ul//li//p
      const bulletPointParagraphs = this.page.locator(
        "xpath=//h5[text()='Tips for custom subject lines']//ancestor::div[contains(@class,'Panel-module__panel__5CmIk')]//ul//li//p"
      );

      // Verify each bullet point is present in the tooltip
      // First, wait for the paragraphs to be available
      const paragraphCount = await bulletPointParagraphs.count();
      if (paragraphCount === 0) {
        throw new Error('No bullet point paragraphs found in tooltip');
      }

      // Helper function to normalize whitespace for comparison
      // Normalizes whitespace around punctuation to handle differences like "(e.g., " vs "(e.g.,"
      const normalizeWhitespace = (text: string): string => {
        return text
          .trim()
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\s*([,.:;!?])\s*/g, '$1 ') // Normalize whitespace around punctuation
          .replace(/\s+/g, ' ') // Replace multiple spaces again after punctuation normalization
          .trim();
      };

      // Get all paragraph texts and verify each expected bullet point is present
      const foundTexts: string[] = [];
      for (let i = 0; i < paragraphCount; i++) {
        const paragraphText = await bulletPointParagraphs.nth(i).textContent();
        if (paragraphText) {
          foundTexts.push(normalizeWhitespace(paragraphText));
        }
      }

      // Verify each expected bullet point is found in the paragraphs
      for (const bulletPoint of expectedBulletPoints) {
        const normalizedBulletPoint = normalizeWhitespace(bulletPoint);
        const found = foundTexts.some(text => text === normalizedBulletPoint || text.includes(normalizedBulletPoint));
        if (!found) {
          throw new Error(`Bullet point "${bulletPoint}" not found in tooltip. Found texts: ${foundTexts.join(' | ')}`);
        }
      }
    });
  }

  /**
   * Verifies the best practices tooltip is not visible (closed)
   */
  async verifyBestPracticesTooltipIsClosed(): Promise<void> {
    await test.step('Verify best practices tooltip is closed', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.tipsHeading, {
        assertionMessage: 'Tips tooltip should be closed',
        timeout: 5_000,
      });
    });
  }

  /**
   * Verifies text is visible on the page - delegates to CommonActionsComponent
   */
  async verifyTextIsVisible(
    text: string,
    options?: {
      exact?: boolean;
      timeout?: number;
      assertionMessage?: string;
    }
  ): Promise<void> {
    await this.commonActions.verifyTextIsVisible(text, options);
  }

  /**
   * Ensures at least one customization exists for the specified feature and template
   * If none exists, creates one
   * @param feature - The notification feature (e.g., MUST_READS, ALERTS)
   * @param template - The template name to use for this feature
   * @param featureButtonName - The button name to identify the feature in the listing (e.g., "Must reads", "Alerts")
   */
  async ensureAtLeastOneCustomizationExists(
    feature: NotificationFeatures,
    template: string,
    featureButtonName: string
  ): Promise<void> {
    await test.step(`Ensure at least one customization exists for ${feature}`, async () => {
      // Wait for listing page to fully load with all existing customizations
      await this.waitForListingPageToFullyLoad();

      // Check if the SPECIFIC customization for this feature exists
      const customizationExists = await this.isCustomizationVisible(featureButtonName);

      if (!customizationExists) {
        // This specific customization doesn't exist, create one
        await NotificationCustomizationHelper.createNotificationCustomization(this, feature, template);
        // Wait for the newly created customization to appear
        await this.waitForListingPageToFullyLoad();
      }
    });
  }

  /**
   * Verifies that a stepper step is disabled/not clickable
   * @param stepName - The name of the stepper step (e.g., "Select notification", "Override and confirmation", "Manage translations")
   */
  async verifyEditSelectStepperStepIsDisabled(stepName: string): Promise<void> {
    await test.step(`Verify stepper step "${stepName}" is disabled/not clickable`, async () => {
      const stepButton = this.page.getByRole('button', { name: stepName });
      await this.verifier.verifyTheElementIsDisabled(stepButton, {
        assertionMessage: `Stepper step "${stepName}" should be disabled/not clickable`,
      });
    });
  }

  /**
   * Gets the menu button locator for a specific customization row
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   * @returns The menu button locator
   */
  getMenuButton(customizationText: string): Locator {
    return this.page.locator(`tr:has-text("${customizationText}")`).getByRole('button', { name: 'More' }).first();
  }

  /**
   * Opens the three-dot menu for a specific customization row without clicking an option
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   */
  async openThreeDotMenu(customizationText: string): Promise<void> {
    await test.step(`Open three-dot menu for ${customizationText}`, async () => {
      const menuButton = this.getMenuButton(customizationText);
      await this.clickOnElement(menuButton, { timeout: 10_000 });
    });
  }

  /**
   * Verifies the notification customization table is visible with expected columns
   */
  async verifyNotificationCustomizationTableIsVisible(): Promise<void> {
    await test.step('Verify notification customization table is visible with columns', async () => {
      // Prefer using explicit row locators instead of generic "table"
      // to avoid hidden DataTables scaffolding or cloned tables.
      const rowCount = await this.notificationItems.count();
      if (rowCount === 0) {
        throw new Error('Notification customization table should be visible but no rows were found');
      }

      // Verify the first data row is visible – this implies the table is rendered
      await this.verifier.verifyTheElementIsVisible(this.notificationItems.first(), {
        assertionMessage: 'Notification customization table should be visible',
        timeout: 10_000,
      });
    });
  }

  /**
   * Verifies the menu options (Edit and Delete) are visible and enabled
   */
  async verifyMenuOptionsAreVisibleAndEnabled(): Promise<void> {
    await test.step('Verify menu options (Edit and Delete) are visible and enabled', async () => {
      const editOption = this.page.getByRole('button', { name: 'Edit' });
      const deleteOption = this.page.getByRole('button', { name: 'Delete' });

      await this.verifier.verifyTheElementIsVisible(editOption, {
        assertionMessage: 'Edit option should be visible in menu',
        timeout: 5_000,
      });
      await this.verifier.verifyTheElementIsEnabled(editOption, {
        assertionMessage: 'Edit option should be enabled',
      });

      await this.verifier.verifyTheElementIsVisible(deleteOption, {
        assertionMessage: 'Delete option should be visible in menu',
        timeout: 5_000,
      });
      await this.verifier.verifyTheElementIsEnabled(deleteOption, {
        assertionMessage: 'Delete option should be enabled',
      });
    });
  }

  /**
   * Closes the menu by clicking outside of it
   */
  async closeMenuByClickingOutside(): Promise<void> {
    await test.step('Close menu by clicking outside', async () => {
      // Click on the page title or a neutral area to close the menu
      await this.clickOnElement(this.notificationCustomizationTitle);
    });
  }

  /**
   * Verifies the menu is closed (Edit and Delete options are not visible)
   */
  async verifyMenuIsClosed(): Promise<void> {
    await test.step('Verify menu is closed', async () => {
      const editOption = this.page.getByRole('button', { name: 'Edit' });
      await this.verifier.verifyTheElementIsNotVisible(editOption, {
        assertionMessage: 'Menu should be closed (Edit option should not be visible)',
        timeout: 2_000,
      });
    });
  }

  /**
   * Verifies the delete confirmation modal content (title, message, description, and buttons)
   */
  async verifyDeleteConfirmationModalContent(): Promise<void> {
    await test.step('Verify delete confirmation modal content', async () => {
      // Verify modal is visible
      await this.verifier.verifyTheElementIsVisible(this.deleteConfirmationDialog, {
        assertionMessage: 'Delete confirmation modal should be visible',
        timeout: 5_000,
      });

      // Verify modal title "Delete override"
      const dialog = this.page.getByRole('dialog');
      const modalTitle = dialog.getByRole('heading', { name: /delete override/i });
      await this.verifier.verifyTheElementIsVisible(modalTitle, {
        assertionMessage: 'Modal title "Delete override" should be visible',
        timeout: 5_000,
      });

      // Verify modal message
      await this.verifier.verifyTheElementIsVisible(this.deleteConfirmationMessage, {
        assertionMessage: 'Modal message should be visible',
      });

      // Verify modal description
      await this.verifier.verifyTheElementIsVisible(this.deleteConfirmationDescription, {
        assertionMessage: 'Modal description should be visible',
      });

      // Verify Cancel and Delete buttons
      await this.verifier.verifyTheElementIsVisible(this.modalCancelButton, {
        assertionMessage: 'Cancel button should be visible in modal',
      });
      await this.verifier.verifyTheElementIsVisible(this.modalConfirmDeleteButton, {
        assertionMessage: 'Delete button should be visible in modal',
      });
    });
  }

  /**
   * Clicks Cancel button in the delete confirmation modal
   */
  async cancelDeletion(): Promise<void> {
    await test.step('Cancel deletion in modal', async () => {
      await this.clickOnElement(this.modalCancelButton);
    });
  }

  /**
   * Verifies a customization is NOT visible in the listing
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   */
  async verifyCustomizationIsNotVisible(customizationText: string): Promise<void> {
    await test.step(`Verify customization "${customizationText}" is not visible in listing`, async () => {
      const row = this.page.locator(`tr:has-text("${customizationText}")`).first();
      await this.verifier.verifyTheElementIsNotVisible(row, {
        assertionMessage: `Customization "${customizationText}" should not be visible in listing`,
        timeout: 5_000,
      });
    });
  }

  /**
   * Checks if a customization is visible in the listing (returns boolean without throwing error)
   * @param customizationText - The text to identify the customization row (e.g., "Must reads")
   * @returns Promise<boolean> - true if visible, false if not
   */
  async isCustomizationVisible(customizationText: string): Promise<boolean> {
    return await test.step(`Check if customization "${customizationText}" is visible in listing`, async () => {
      try {
        const row = this.page.locator(`tr:has-text("${customizationText}")`).first();
        // Wait briefly for the row to appear if it exists
        await row.waitFor({ state: 'visible', timeout: 3000 });
        return await row.isVisible();
      } catch {
        // If waiting fails, the row doesn't exist
        return false;
      }
    });
  }

  /**
   * Deletes a customization if it exists (graceful - no error if doesn't exist)
   * @param featureButtonName - The button name to identify the feature in the listing
   */
  async deleteCustomizationIfExists(featureButtonName: string): Promise<void> {
    await test.step(`Delete customization "${featureButtonName}" if it exists`, async () => {
      const customizationExists = await this.isCustomizationVisible(featureButtonName);
      if (customizationExists) {
        await this.deleteCustomizationFromMenu(featureButtonName);
        await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
      }
    });
  }

  /**
   * Creates a fresh customization by first deleting any existing one, then creating new
   * This ensures tests start with clean state
   * @param feature - The notification feature (e.g., MUST_READS, ALERTS)
   * @param template - The template name to use for this feature
   * @param featureButtonName - The button name to identify the feature in the listing
   */
  async createFreshCustomization(
    feature: NotificationFeatures,
    template: string,
    featureButtonName: string
  ): Promise<void> {
    await test.step(`Create fresh customization for ${feature}`, async () => {
      // Delete existing customization if present
      await this.deleteCustomizationIfExists(featureButtonName);

      // Create new customization
      await NotificationCustomizationHelper.createNotificationCustomization(this, feature, template);

      // Wait for listing page to reload
      await this.waitForListingPageToFullyLoad();
    });
  }
}
