import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

// Page Object Model for the Audience management page with category creation and validation functionality
export class AudiencePage extends BasePage {
  readonly labelAudience: Locator;
  readonly createAudienceButton: Locator;
  readonly createDropdown: Locator;
  readonly createAudience: Locator;
  readonly createCategory: Locator;
  readonly createAudienceWithCSV: Locator;
  readonly clickCloseButton: Locator;
  readonly categoryNameInput: Locator;
  readonly addDescriptionButton: Locator;
  readonly descriptionInput: Locator;
  readonly categoryLabel: Locator;
  readonly categoryTitleDescription: Locator;
  readonly categoryName: Locator;
  readonly addCategoryDescriptionButton: Locator;
  readonly categoryModalCancelButton: Locator;
  readonly categoryModalAddButton: Locator;
  readonly nameRequiredError: Locator;
  readonly deleteDescriptionButton: Locator;
  readonly categoryDialog: Locator;
  readonly nameAlreadyUsedError: Locator;
  readonly deleteCategoryOption: Locator;
  readonly deleteCategoryButton: Locator;
  readonly editCategoryOption: Locator;
  readonly editCategoryDialog: Locator;
  readonly editCategoryLabel: Locator;
  readonly editCategoryModalSaveButton: Locator;

  // Initialize AudiencePage with locators for UI interaction
  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.AUDIENCE_PAGE) {
    super(page, pageUrl);

    // Page-level
    this.labelAudience = page.getByTestId('pageContainer-page').locator('header h1').filter({ hasText: 'Audiences' });

    // Container for the page
    const pageContainer = page.getByTestId('pageContainer-page');

    // Top action
    this.createAudienceButton = pageContainer.locator('button:has-text("Create")');
    this.createDropdown = page.getByRole('button', { name: 'Open menu' });
    // Menu items
    this.createAudience = page.locator('[role="menuitem"]:has-text("Create audience")');
    this.createCategory = page.locator('[role="menuitem"]:has-text("Create category")');
    this.createAudienceWithCSV = page.locator('[role="menuitem"]:has-text("Create audience with CSV")');

    // Category dialog scope
    this.categoryDialog = page
      .locator('[role="dialog"]')
      .filter({ has: page.locator('h1,h2,span').filter({ hasText: 'Create category' }) });

    this.clickCloseButton = this.categoryDialog.locator('button[aria-label="Close"]');
    this.categoryNameInput = this.categoryDialog.locator('#name');
    this.addDescriptionButton = this.categoryDialog.locator('button:has-text("Add description")');
    this.descriptionInput = this.categoryDialog.locator('#description');

    this.categoryLabel = this.categoryDialog.locator('h2:has-text("Create category")');
    this.categoryTitleDescription = this.categoryDialog.locator(
      'p:has-text("Keep your audiences organized by grouping related audiences within a category.")'
    );
    this.categoryName = this.categoryDialog.locator('label:has-text("Name")');
    this.addCategoryDescriptionButton = this.categoryDialog.locator('button:has-text("Add description")');
    this.categoryModalCancelButton = this.categoryDialog.locator('button:has-text("Cancel")');
    this.categoryModalAddButton = this.categoryDialog.locator(
      'button[aria-haspopup="false"]:has-text("Add"):not(:has-text("Add description"))'
    );
    this.nameRequiredError = this.categoryDialog.locator(':text("Name is a required field")');
    this.deleteDescriptionButton = this.categoryDialog.locator(
      'button[aria-label*="Delete" i], button:has-text("Delete")'
    );
    this.nameAlreadyUsedError = page.getByText('The name is already used');
    this.deleteCategoryOption = page.getByText('Delete category');
    this.deleteCategoryButton = page.getByRole('button', { name: 'Delete' });
    this.editCategoryOption = page.getByText('Edit category');

    // Edit category dialog scope - using a more flexible approach
    this.editCategoryDialog = page.locator('[role="dialog"]');

    this.editCategoryLabel = page.locator('h2:has-text("Edit category")');
    this.editCategoryModalSaveButton = page.getByRole('button', { name: 'Save' });
  }

  // Click on Create button or dropdown menu option to initiate audience creation flow
  async clickOnCreateButtonToInitiateAudienceCreationFlowFor(
    createType: 'Create audience' | 'Create category' | 'Create audience with CSV'
  ): Promise<void> {
    await test.step(`Initiate ${createType}`, async () => {
      if (createType === 'Create audience') {
        await this.clickOnElement(this.createAudienceButton, {
          stepInfo: 'Click Create audience',
        });
        return;
      }

      await this.clickOnElement(this.createDropdown, {
        stepInfo: 'Open Create dropdown',
      });

      const option = this.page.getByRole('menuitem', { name: createType });
      await this.clickOnElement(option, {
        stepInfo: `Click ${createType}`,
      });
    });
  }

  // Click on close (X) button at the top right corner of category modal (works for both Create and Edit modals)
  async clickOnCloseButton(options?: { stepInfo?: string; timeout?: number; isEditModal?: boolean }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on close button`, async () => {
      if (options?.isEditModal) {
        // For Edit modal, use the scoped locator
        const locators = this.getModalSpecificLocators(true);
        await this.clickOnElement(locators.closeButton, {
          timeout: options?.timeout ?? 10_000,
        });
      } else {
        // For Create modal, use the existing locator
        await this.clickOnElement(this.clickCloseButton, {
          timeout: options?.timeout ?? 10_000,
        });
      }
    });
  }

  // Verify that the Audience page is loaded by checking if 'Audiences' heading is visible
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step(`Verifying the audience page is loaded`, async () => {
      await expect(this.labelAudience, `expecting Audience label to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // Open Create category modal and validate all expected elements are visible
  async openCreateCategoryModal(options?: {
    verifyMaxLength?: boolean;
    verifyAddDescription?: boolean;
    verifyRemoveDescription?: boolean;
    closeAfter?: boolean;
  }): Promise<void> {
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
    await this.verifier.verifyTheElementIsVisible(this.categoryLabel, {
      assertionMessage: 'Verify Create category heading is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.categoryTitleDescription, {
      assertionMessage: 'Verify category helper text is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.categoryName, {
      assertionMessage: 'Verify Name label is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.categoryNameInput, {
      assertionMessage: 'Verify Name input is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.addCategoryDescriptionButton, {
      assertionMessage: 'Verify Add description button is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.categoryModalCancelButton, {
      assertionMessage: 'Verify Cancel button is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.clickCloseButton, {
      assertionMessage: 'Verify Close button is visible',
    });
    await expect(this.categoryModalAddButton, 'Expect Add button to be disabled by default').toBeDisabled();

    // Trigger validation and verify error message for empty Name
    await this.categoryNameInput.click();
    await this.page.keyboard.press('Tab');
    await this.verifier.verifyTheElementIsVisible(this.nameRequiredError);

    if (options?.verifyMaxLength) await this.verifyNameFieldMaxLength();
    if (options?.verifyAddDescription) await this.clickAddDescriptionAndVerify();
    if (options?.verifyRemoveDescription) await this.removeDescriptionAndVerifyAbsence();
    if (options?.closeAfter) await this.clickOnCloseButton();
  }

  // Fill the category name input field
  async fillCategoryName(name: string): Promise<void> {
    await this.fillInElement(this.categoryNameInput, name);
  }

  // Add description by clicking 'Add description' button and filling the field
  async addCategoryDescription(description: string): Promise<void> {
    await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click on Add description' });
    await this.fillInElement(this.descriptionInput, description);
  }

  // Submit category creation by clicking the 'Add' button
  async submitCategoryCreation(): Promise<void> {
    await this.clickOnElement(this.categoryModalAddButton, { stepInfo: 'Click Add on Create category modal' });
  }

  // Verify the close button is visible in category creation modal
  async assertCloseButtonIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.clickCloseButton, {
      assertionMessage: 'Verify Close button is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  // Click 'Add description' button and verify description field and delete button become visible (works for both Create and Edit modals)
  async clickAddDescriptionAndVerify(isEditModal: boolean = false): Promise<void> {
    const locators = this.getModalSpecificLocators(isEditModal);
    const modalType = isEditModal ? 'Edit' : 'Create';

    await test.step(`Click Add description and verify in ${modalType} category modal`, async () => {
      const alreadyVisible = await this.verifier.isTheElementVisible(locators.descriptionInput, { timeout: 1000 });
      if (!alreadyVisible) {
        await this.clickOnElement(locators.addDescriptionButton, { stepInfo: 'Click Add description' });
      }
      // Verify the Description textarea is visible
      await this.verifier.verifyTheElementIsVisible(locators.descriptionInput, {});
      // Verify the Delete description button is visible
      await this.verifier.verifyTheElementIsVisible(locators.deleteDescriptionButton, {});
    });
  }

  // Remove description by clicking delete button and verify field is no longer visible (works for both Create and Edit modals)
  async removeDescriptionAndVerifyAbsence(isEditModal: boolean = false): Promise<void> {
    const locators = this.getModalSpecificLocators(isEditModal);
    const modalType = isEditModal ? 'Edit' : 'Create';

    await test.step(`Remove description and verify absence in ${modalType} category modal`, async () => {
      await this.clickOnElement(locators.deleteDescriptionButton, { stepInfo: 'Click Delete description' });
      await this.verifier.verifyTheElementIsNotVisible(locators.descriptionInput, {});
    });
  }

  // Verify category name field has maximum length of 100 characters (works for both Create and Edit modals)
  async verifyNameFieldMaxLength(isEditModal: boolean = false): Promise<void> {
    const modalType = isEditModal ? 'Edit' : 'Create';
    await test.step(`Verify ${modalType} category name field max length is 100`, async () => {
      const locators = this.getModalSpecificLocators(isEditModal);
      const expectedMaxLength = 100;
      const overLengthInput = 'A'.repeat(120);

      await this.fillInElement(locators.nameInput, ''); // clear
      await this.typeInElement(locators.nameInput, overLengthInput); // type 120 chars

      const valueAfterFirstInput = await locators.nameInput.inputValue();
      expect(valueAfterFirstInput.length).toBe(expectedMaxLength);
      expect(valueAfterFirstInput).toBe(overLengthInput.slice(0, expectedMaxLength)); // truncated exactly

      // Try typing more; value should not change
      await this.typeInElement(locators.nameInput, 'B'.repeat(5));
      const valueAfterSecondInput = await locators.nameInput.inputValue();
      expect(valueAfterSecondInput).toBe(valueAfterFirstInput);

      const maxLengthAttribute = await this.getElementAttribute(locators.nameInput, 'maxlength');
      if (maxLengthAttribute) expect(Number(maxLengthAttribute)).toBe(expectedMaxLength);
    });
  }

  // Verify name and description fields accept alphanumeric and special characters (works for both Create and Edit modals)
  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(isEditModal: boolean = false): Promise<void> {
    const modalType = isEditModal ? 'Edit' : 'Create';
    await test.step(`Verify ${modalType} category fields accept letters, numbers, and special characters`, async () => {
      const locators = this.getModalSpecificLocators(isEditModal);
      const sampleInput = 'Category 123 _-.,@#$()&[]{}:;!?';

      await this.fillInElement(locators.nameInput, '');
      await this.typeInElement(locators.nameInput, sampleInput);
      const nameFieldValue = await locators.nameInput.inputValue();
      expect(nameFieldValue).toBe(sampleInput);
      await expect(locators.submitButton).toBeEnabled();

      // Also verify Description field accepts same character set
      await this.clickAddDescriptionAndVerify(isEditModal);
      await this.fillInElement(locators.descriptionInput, '');
      await this.typeInElement(locators.descriptionInput, sampleInput);
      const descriptionFieldValue = await locators.descriptionInput.inputValue();
      expect(descriptionFieldValue).toBe(sampleInput);
    });
  }

  // Verify description field maximum length (reads from maxlength attribute or defaults to 1024) - works for both Create and Edit modals
  async verifyDescriptionFieldMaxLength(isEditModal: boolean = false): Promise<void> {
    const modalType = isEditModal ? 'Edit' : 'Create';
    await test.step(`Verify ${modalType} category description field max length`, async () => {
      const locators = this.getModalSpecificLocators(isEditModal);

      await this.clickAddDescriptionAndVerify(isEditModal);
      const maxLengthAttribute = await this.getElementAttribute(locators.descriptionInput, 'maxlength');
      const maximumAllowedLength = maxLengthAttribute ? Number(maxLengthAttribute) : 1024;

      const overLengthInput = 'D'.repeat(maximumAllowedLength + 50);
      await this.fillInElement(locators.descriptionInput, '');
      await this.typeInElement(locators.descriptionInput, overLengthInput);

      const valueAfterFirstInput = await locators.descriptionInput.inputValue();
      expect(valueAfterFirstInput.length).toBe(maximumAllowedLength);
      expect(valueAfterFirstInput).toBe(overLengthInput.slice(0, maximumAllowedLength));

      await this.typeInElement(locators.descriptionInput, 'E'.repeat(10));
      const valueAfterSecondInput = await locators.descriptionInput.inputValue();
      expect(valueAfterSecondInput).toBe(valueAfterFirstInput);
    });
  }

  // Verify 'The name is already used' error message is displayed
  async verifyNameAlreadyUsedError(): Promise<void> {
    await test.step('Verify "Name is already used" error message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.nameAlreadyUsedError, {
        assertionMessage: 'Verify name already used error is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // Verify specific toast message is displayed
  async verifyToastMessage(toastMessage: string, options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await super.verifyToastMessage(toastMessage, options);
  }

  // Verify 'Category created' success toast message is displayed
  async verifyCategoryCreationSuccessToast(): Promise<void> {
    await test.step('Verify category creation success toast message', async () => {
      // Wait a moment for any previous toasts to disappear
      await this.page.waitForTimeout(1000);

      // Use first() to handle multiple toast messages
      const toastMessage = this.toastMessages.filter({ hasText: 'Category created' }).first();
      await expect(toastMessage, 'expecting Category created toast message').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // Verify 'Category deleted' success toast message is displayed
  async verifyCategoryDeletionSuccessToast(): Promise<void> {
    await this.verifyToastMessage('Category deleted', {
      stepInfo: 'Verify category deletion success toast message',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  // Create new category with specified name and optional description
  async createCategoryWithNameAndDescription(name: string, description?: string): Promise<void> {
    await test.step(`Create category with name: ${name}`, async () => {
      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(name);

      if (description) {
        await this.addCategoryDescription(description);
      }

      await this.submitCategoryCreation();

      // Wait for modal to close which indicates successful creation
      await this.page.waitForTimeout(2000); // Give time for the creation to complete
    });
  }

  // Attempt to create category with existing name to trigger duplicate validation error
  async attemptToCreateDuplicateCategory(existingCategoryName: string): Promise<void> {
    await test.step(`Attempt to create duplicate category with name: ${existingCategoryName}`, async () => {
      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(existingCategoryName);
      await this.submitCategoryCreation();
      // Note: This will trigger the duplicate name error which should be verified separately
    });
  }

  // Delete category using 'Show more' dropdown menu
  async deleteCategoryByShowMore(categoryName?: string): Promise<void> {
    await test.step('Delete category using Show more menu', async () => {
      if (categoryName) {
        // Use the generic method to open dropdown and click Delete category
        await this.openCategoryDropdownAndClickOption(categoryName, 'Delete category');
      } else {
        // Fallback: Use the last Show more button (most recently created category)
        console.log('Using fallback: last Show more button');
        const showMoreButton = this.page.getByRole('button', { name: 'Show more' }).last();

        await this.verifier.verifyTheElementIsVisible(showMoreButton, {
          assertionMessage: 'Verify Show more button is visible for category deletion',
          timeout: TIMEOUTS.MEDIUM,
        });

        await this.clickOnElement(showMoreButton, {
          stepInfo: 'Click on Show more button for category',
          timeout: 10_000,
        });

        // Wait for dropdown and click Delete category
        await this.page.waitForTimeout(1000);
        await this.clickOnElement(this.deleteCategoryOption, {
          stepInfo: 'Click on Delete category option',
          timeout: 10_000,
        });
      }

      // Confirm deletion
      await this.verifier.verifyTheElementIsVisible(this.deleteCategoryButton, {
        assertionMessage: 'Verify Delete confirmation button is visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.clickOnElement(this.deleteCategoryButton, {
        stepInfo: 'Click on Delete button to confirm category deletion',
        timeout: 10_000,
      });
    });
  }

  // Verify all three options are present in category dropdown menu (Add Audience, Edit category, Delete category)
  async verifyAllCategoryOptionsArePresent(categoryName: string): Promise<void> {
    await test.step('Verify all three options are present in category dropdown menu', async () => {
      // Open the dropdown for the specific category
      const showMoreButton = this.page.locator(
        `//p[contains(text(),'${categoryName}')]/ancestor::div[@role='presentation']/following-sibling::div/following-sibling::div//button`
      );

      await this.verifier.verifyTheElementIsVisible(showMoreButton, {
        assertionMessage: `Verify Show more button is visible for category: ${categoryName}`,
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.clickOnElement(showMoreButton, {
        stepInfo: `Click on Show more button for category: ${categoryName}`,
        timeout: 10_000,
      });

      // Wait for dropdown to be visible
      await this.page.waitForTimeout(1000);

      // Define the exact expected options
      const expectedOptions = ['Add Audience', 'Edit category', 'Delete category'];

      console.log('Verifying category dropdown options...');

      // Verify each expected option is present
      for (const option of expectedOptions) {
        const optionLocator = this.page.getByText(option);
        await this.verifier.verifyTheElementIsVisible(optionLocator, {
          assertionMessage: `Verify "${option}" option is visible in dropdown menu`,
          timeout: TIMEOUTS.SHORT,
        });
        console.log(`✅ Found option: "${option}"`);
      }

      console.log('✅ All three required options are present in the category dropdown menu');
    });
  }

  // Close any open dropdown by clicking elsewhere on the page
  async closeOpenDropdown(): Promise<void> {
    await test.step('Close any open dropdown', async () => {
      await this.page.click('body');
      await this.page.waitForTimeout(1000);
    });
  }

  // Verify clicking Cancel button prevents category creation
  async verifyCategoryCancelButtonBehavior(): Promise<void> {
    await test.step('Verify Cancel button prevents category creation', async () => {
      const categoryName = `CancelTest_${Date.now()}`;

      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(categoryName);
      await this.clickOnElement(this.categoryModalCancelButton, { stepInfo: 'Click Cancel button' });

      // Verify modal is closed
      await this.verifier.verifyTheElementIsNotVisible(this.categoryLabel, {});

      // Verify category is not created in the list
      await this.verifyCategoryNotInList(categoryName);
    });
  }

  // Verify clicking Close (X) button prevents category creation
  async verifyCategoryCloseButtonBehavior(): Promise<void> {
    await test.step('Verify Close button prevents category creation', async () => {
      const categoryName = `CloseTest_${Date.now()}`;

      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(categoryName);
      await this.clickOnElement(this.clickCloseButton, { stepInfo: 'Click Close button' });

      // Verify modal is closed
      await this.verifier.verifyTheElementIsNotVisible(this.categoryLabel, {});

      // Verify category is not created in the list
      await this.verifyCategoryNotInList(categoryName);
    });
  }

  // Verify specific category name is not present in the categories list
  async verifyCategoryNotInList(categoryName: string): Promise<void> {
    await test.step(`Verify category "${categoryName}" is not in the list`, async () => {
      // Wait a moment for the page to update
      await this.page.waitForTimeout(1000);

      // Check if category name appears anywhere on the page
      const categoryElement = this.page.getByText(categoryName, { exact: true });
      const isVisible = await categoryElement.isVisible({ timeout: 3000 }).catch(() => false);

      expect(isVisible, `Category "${categoryName}" should not be created and visible in the list`).toBe(false);
    });
  }

  // Generic method to open category dropdown menu and click on specific option
  async openCategoryDropdownAndClickOption(categoryName: string, optionText: string): Promise<void> {
    await test.step(`Open category dropdown for "${categoryName}" and click "${optionText}"`, async () => {
      // Find and click the Show more button for the specific category
      const showMoreButton = this.page.locator(
        `//p[contains(text(),'${categoryName}')]/ancestor::div[@role='presentation']/following-sibling::div/following-sibling::div//button`
      );

      await this.verifier.verifyTheElementIsVisible(showMoreButton, {
        assertionMessage: `Verify Show more button is visible for category: ${categoryName}`,
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.clickOnElement(showMoreButton, {
        stepInfo: `Click on Show more button for category: ${categoryName}`,
        timeout: 10_000,
      });

      // Wait for dropdown to be visible and click the specified option
      await this.page.waitForTimeout(1000);

      const optionLocator = this.page.getByText(optionText);
      await this.verifier.verifyTheElementIsVisible(optionLocator, {
        assertionMessage: `Verify "${optionText}" option is visible`,
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.clickOnElement(optionLocator, {
        stepInfo: `Click on "${optionText}" option`,
        timeout: 10_000,
      });
    });
  }

  // Open Edit category modal by clicking on 'Edit category' option from dropdown menu
  async openEditCategoryModal(categoryName: string): Promise<void> {
    await test.step(`Open Edit category modal for: ${categoryName}`, async () => {
      // Use the generic method to open dropdown and click Edit category
      await this.openCategoryDropdownAndClickOption(categoryName, 'Edit category');

      // Verify Edit category modal is opened
      await this.verifier.verifyTheElementIsVisible(this.editCategoryLabel, {
        assertionMessage: 'Verify Edit category modal is opened',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // Verify Edit category modal elements and validations (includes Save button enabled by default validation)
  async verifyEditCategoryModalElements(): Promise<void> {
    await test.step('Verify Edit category modal elements and validations', async () => {
      // Use Edit modal specific locators
      const locators = this.getModalSpecificLocators(true);

      // Verify modal heading
      await this.verifier.verifyTheElementIsVisible(this.editCategoryLabel, {
        assertionMessage: 'Verify Edit category heading is visible',
      });

      // Verify helper text (use Edit modal specific locator)
      const editModalHelperText = locators.dialog.locator(
        'p:has-text("Keep your audiences organized by grouping related audiences within a category.")'
      );
      await this.verifier.verifyTheElementIsVisible(editModalHelperText, {
        assertionMessage: 'Verify category helper text is visible in Edit modal',
      });

      // Verify Name label and input
      const editModalNameLabel = locators.dialog.locator('label:has-text("Name")');
      await this.verifier.verifyTheElementIsVisible(editModalNameLabel, {
        assertionMessage: 'Verify Name label is visible in Edit modal',
      });
      await this.verifier.verifyTheElementIsVisible(locators.nameInput, {
        assertionMessage: 'Verify Name input is visible in Edit modal',
      });

      // Verify Add description button in Edit modal
      await this.verifier.verifyTheElementIsVisible(locators.addDescriptionButton, {
        assertionMessage: 'Verify Add description button is visible in Edit modal',
      });

      // Verify Cancel and Save buttons
      await this.verifier.verifyTheElementIsVisible(locators.cancelButton, {
        assertionMessage: 'Verify Cancel button is visible in Edit modal',
      });
      await this.verifier.verifyTheElementIsVisible(locators.submitButton, {
        assertionMessage: 'Verify Save button is visible in Edit modal',
      });

      // Verify Close button
      await this.verifier.verifyTheElementIsVisible(locators.closeButton, {
        assertionMessage: 'Verify Close button is visible in Edit modal',
      });

      // Verify Save button is enabled by default (unlike Create modal where Add button is disabled)
      await expect(locators.submitButton, 'Expect Save button to be enabled by default in Edit modal').toBeEnabled();
    });
  }

  // Verify name field validation in Edit category modal (clear name and check error message and button state)
  async verifyEditCategoryNameFieldValidation(): Promise<void> {
    await test.step('Verify name field validation in Edit category modal', async () => {
      const locators = this.getModalSpecificLocators(true);

      // Clear the existing name field
      await this.fillInElement(locators.nameInput, '');

      // Trigger validation by clicking outside or pressing Tab
      await locators.nameInput.blur();

      // Verify the required field error message appears
      await this.verifier.verifyTheElementIsVisible(locators.nameRequiredError, {
        assertionMessage: 'Verify "Name is a required field" error message is visible when name is cleared',
        timeout: TIMEOUTS.SHORT,
      });

      // Verify Save button becomes disabled when name is empty
      await expect(locators.submitButton, 'Expect Save button to be disabled when name field is empty').toBeDisabled();

      // Restore a valid name to clean up the state
      await this.fillInElement(locators.nameInput, 'ValidCategoryName');

      // Verify error message disappears and Save button becomes enabled again
      await this.verifier.verifyTheElementIsNotVisible(locators.nameRequiredError, {
        assertionMessage: 'Verify error message disappears when valid name is provided',
        timeout: TIMEOUTS.SHORT,
      });
      await expect(locators.submitButton, 'Expect Save button to be enabled when valid name is provided').toBeEnabled();
    });
  }

  // Attempt to save Edit category modal with duplicate name to trigger validation error
  async attemptToSaveEditCategoryWithDuplicateName(duplicateName: string): Promise<void> {
    await test.step(`Attempt to save Edit category with duplicate name: ${duplicateName}`, async () => {
      const locators = this.getModalSpecificLocators(true);

      // Change the name to the duplicate name
      await this.fillInElement(locators.nameInput, duplicateName);

      // Try to save and trigger duplicate name validation
      await this.clickOnElement(locators.submitButton, {
        stepInfo: 'Click Save button to trigger duplicate name validation',
        timeout: 10_000,
      });

      // Note: This will trigger the duplicate name error which should be verified separately
    });
  }

  // Update locators to work with both Create and Edit category modals
  private getModalSpecificLocators(isEditModal: boolean = false) {
    if (isEditModal) {
      // For Edit modal, we need to scope the locators to the dialog context
      const editDialog = this.page.locator('[role="dialog"]').filter({ hasText: 'Edit category' });
      return {
        dialog: editDialog,
        nameInput: editDialog.getByRole('textbox', { name: 'Name*' }),
        descriptionInput: editDialog.getByRole('textbox', { name: 'Description' }),
        addDescriptionButton: editDialog.getByRole('button', { name: 'Add description' }),
        deleteDescriptionButton: editDialog.getByRole('button', { name: 'Delete' }),
        cancelButton: editDialog.locator('button:has-text("Cancel")'),
        submitButton: editDialog.getByRole('button', { name: 'Save' }),
        closeButton: editDialog.locator('button[aria-label="Close"]'),
        nameRequiredError: editDialog.locator(':text("Name is a required field")'),
      };
    }
    return {
      dialog: this.categoryDialog,
      nameInput: this.categoryNameInput,
      descriptionInput: this.descriptionInput,
      addDescriptionButton: this.addDescriptionButton,
      deleteDescriptionButton: this.deleteDescriptionButton,
      cancelButton: this.categoryModalCancelButton,
      submitButton: this.categoryModalAddButton,
      closeButton: this.clickCloseButton,
      nameRequiredError: this.nameRequiredError,
    };
  }
}
