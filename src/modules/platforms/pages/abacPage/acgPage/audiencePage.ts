import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

// Page Object Model for the Audience management page with category creation and validation functionality
export class AudiencePage extends BasePage {
  // Page-level elements
  labelAudience!: Locator;

  // Create button and dropdown elements
  createAudienceButton!: Locator;
  createDropdown!: Locator;
  createAudience!: Locator;
  createCategory!: Locator;
  createAudienceWithCSV!: Locator;

  // Category dialog elements
  categoryDialog!: Locator;
  clickCloseButton!: Locator;
  categoryLabel!: Locator;
  categoryTitleDescription!: Locator;
  categoryName!: Locator;
  categoryNameInput!: Locator;
  addDescriptionButton!: Locator;
  addCategoryDescriptionButton!: Locator;
  descriptionInput!: Locator;
  deleteDescriptionButton!: Locator;
  categoryModalCancelButton!: Locator;
  categoryModalAddButton!: Locator;

  // Error message elements
  nameRequiredError!: Locator;
  nameAlreadyUsedError!: Locator;

  // Category management elements
  deleteCategoryOption!: Locator;
  deleteCategoryButton!: Locator;
  editCategoryOption!: Locator;
  editCategoryDialog!: Locator;
  editCategoryLabel!: Locator;
  editCategoryModalSaveButton!: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.AUDIENCE_PAGE) {
    super(page, pageUrl);
    this._initializeLocators(page);
  }

  // Initialize all page locators
  private _initializeLocators(page: Page): void {
    this._initializePageLevelLocators(page);
    this._initializeCreateButtonLocators(page);
    this._initializeCategoryDialogLocators(page);
    this._initializeErrorMessageLocators(page);
    this._initializeCategoryManagementLocators(page);
  }

  // Initialize page-level locators
  private _initializePageLevelLocators(page: Page): void {
    this.labelAudience = page.getByTestId('pageContainer-page').locator('header h1').filter({ hasText: 'Audiences' });
  }

  // Initialize create button and dropdown locators
  private _initializeCreateButtonLocators(page: Page): void {
    const pageContainer = page.getByTestId('pageContainer-page');

    this.createAudienceButton = pageContainer.locator('button:has-text("Create")');
    this.createDropdown = page.getByRole('button', { name: 'Open menu' });
    this.createAudience = page.locator('[role="menuitem"]:has-text("Create audience")');
    this.createCategory = page.locator('[role="menuitem"]:has-text("Create category")');
    this.createAudienceWithCSV = page.locator('[role="menuitem"]:has-text("Create audience with CSV")');
  }

  // Initialize category dialog locators
  private _initializeCategoryDialogLocators(page: Page): void {
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
    this.deleteDescriptionButton = this.categoryDialog.locator(
      'button[aria-label*="Delete" i], button:has-text("Delete")'
    );
  }

  // Initialize error message locators
  private _initializeErrorMessageLocators(page: Page): void {
    this.nameRequiredError = this.categoryDialog.locator(':text("Name is a required field")');
    this.nameAlreadyUsedError = page.getByText('The name is already used');
  }

  // Initialize category management locators
  private _initializeCategoryManagementLocators(page: Page): void {
    this.deleteCategoryOption = page.getByText('Delete category');
    this.deleteCategoryButton = page.getByRole('button', { name: 'Delete' });
    this.editCategoryOption = page.getByText('Edit category');
    this.editCategoryDialog = page.locator('[role="dialog"]');
    this.editCategoryLabel = page.locator('h2:has-text("Edit category")');
    this.editCategoryModalSaveButton = page.getByRole('button', { name: 'Save' });
  }

  // ========== PAGE NAVIGATION AND VERIFICATION METHODS ==========

  // Verify that the Audience page is loaded by checking if 'Audiences' heading is visible
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the audience page is loaded', async () => {
      await expect(this.labelAudience, 'expecting Audience label to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // ========== CREATE FLOW METHODS ==========

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
    await test.step(options?.stepInfo ?? 'Click on close button', async () => {
      const locators = this.getModalSpecificLocators(options?.isEditModal ?? false);
      await this.clickOnElement(locators.closeButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  // ========== CATEGORY MODAL METHODS ==========

  // Open Create category modal and validate all expected elements are visible
  async openCreateCategoryModal(options?: {
    verifyMaxLength?: boolean;
    verifyAddDescription?: boolean;
    verifyRemoveDescription?: boolean;
    closeAfter?: boolean;
  }): Promise<void> {
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
    await this._verifyCreateCategoryModalElements();
    await this._triggerNameFieldValidation();

    if (options?.verifyMaxLength) await this.verifyNameFieldMaxLength();
    if (options?.verifyAddDescription) await this.clickAddDescriptionAndVerify();
    if (options?.verifyRemoveDescription) await this.removeDescriptionAndVerifyAbsence();
    if (options?.closeAfter) await this.clickOnCloseButton();
  }

  // Verify Create category modal elements are visible
  private async _verifyCreateCategoryModalElements(): Promise<void> {
    const elementsToVerify = [
      { element: this.categoryLabel, message: 'Verify Create category heading is visible' },
      { element: this.categoryTitleDescription, message: 'Verify category helper text is visible' },
      { element: this.categoryName, message: 'Verify Name label is visible' },
      { element: this.categoryNameInput, message: 'Verify Name input is visible' },
      { element: this.addCategoryDescriptionButton, message: 'Verify Add description button is visible' },
      { element: this.categoryModalCancelButton, message: 'Verify Cancel button is visible' },
      { element: this.clickCloseButton, message: 'Verify Close button is visible' },
    ];

    for (const { element, message } of elementsToVerify) {
      await this.verifier.verifyTheElementIsVisible(element, { assertionMessage: message });
    }

    await expect(this.categoryModalAddButton, 'Expect Add button to be disabled by default').toBeDisabled();
  }

  // Trigger validation and verify error message for empty Name field
  private async _triggerNameFieldValidation(): Promise<void> {
    await this.categoryNameInput.click();
    await this.page.keyboard.press('Tab');
    await this.verifier.verifyTheElementIsVisible(this.nameRequiredError);
  }

  // ========== CATEGORY FORM INTERACTION METHODS ==========

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

  // ========== FIELD VALIDATION METHODS ==========

  // Click 'Add description' button and verify description field and delete button become visible
  async clickAddDescriptionAndVerify(isEditModal: boolean = false): Promise<void> {
    const locators = this.getModalSpecificLocators(isEditModal);
    const modalType = isEditModal ? 'Edit' : 'Create';

    await test.step(`Click Add description and verify in ${modalType} category modal`, async () => {
      const alreadyVisible = await this.verifier.isTheElementVisible(locators.descriptionInput, { timeout: 1000 });
      if (!alreadyVisible) {
        await this.clickOnElement(locators.addDescriptionButton, { stepInfo: 'Click Add description' });
      }

      await this.verifier.verifyTheElementIsVisible(locators.descriptionInput, {});
      await this.verifier.verifyTheElementIsVisible(locators.deleteDescriptionButton, {});
    });
  }

  // Remove description by clicking delete button and verify field is no longer visible
  async removeDescriptionAndVerifyAbsence(isEditModal: boolean = false): Promise<void> {
    const locators = this.getModalSpecificLocators(isEditModal);
    const modalType = isEditModal ? 'Edit' : 'Create';

    await test.step(`Remove description and verify absence in ${modalType} category modal`, async () => {
      await this.clickOnElement(locators.deleteDescriptionButton, { stepInfo: 'Click Delete description' });
      await this.verifier.verifyTheElementIsNotVisible(locators.descriptionInput, {});
    });
  }

  // Verify category name field has maximum length of 100 characters
  async verifyNameFieldMaxLength(isEditModal: boolean = false): Promise<void> {
    const modalType = isEditModal ? 'Edit' : 'Create';
    await test.step(`Verify ${modalType} category name field max length is 100`, async () => {
      const locators = this.getModalSpecificLocators(isEditModal);
      const expectedMaxLength = 100;
      const overLengthInput = 'A'.repeat(120);

      await this.fillInElement(locators.nameInput, '');
      await this.typeInElement(locators.nameInput, overLengthInput);

      const valueAfterFirstInput = await locators.nameInput.inputValue();
      expect(valueAfterFirstInput.length).toBe(expectedMaxLength);
      expect(valueAfterFirstInput).toBe(overLengthInput.slice(0, expectedMaxLength));

      await this.typeInElement(locators.nameInput, 'B'.repeat(5));
      const valueAfterSecondInput = await locators.nameInput.inputValue();
      expect(valueAfterSecondInput).toBe(valueAfterFirstInput);

      const maxLengthAttribute = await this.getElementAttribute(locators.nameInput, 'maxlength');
      if (maxLengthAttribute) {
        expect(Number(maxLengthAttribute)).toBe(expectedMaxLength);
      }
    });
  }

  // Verify name and description fields accept alphanumeric and special characters
  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(isEditModal: boolean = false): Promise<void> {
    const modalType = isEditModal ? 'Edit' : 'Create';
    await test.step(`Verify ${modalType} category fields accept letters, numbers, and special characters`, async () => {
      const locators = this.getModalSpecificLocators(isEditModal);
      const sampleInput = 'Category 123 _-.,@#$()&[]{}:;!?';

      await this._verifyNameFieldAcceptsInput(locators, sampleInput);
      await this._verifyDescriptionFieldAcceptsInput(locators, sampleInput, isEditModal);
    });
  }

  // Verify name field accepts input and enables submit button
  private async _verifyNameFieldAcceptsInput(locators: any, input: string): Promise<void> {
    await this.fillInElement(locators.nameInput, '');
    await this.typeInElement(locators.nameInput, input);
    const nameFieldValue = await locators.nameInput.inputValue();
    expect(nameFieldValue).toBe(input);
    await expect(locators.submitButton).toBeEnabled();
  }

  // Verify description field accepts input
  private async _verifyDescriptionFieldAcceptsInput(locators: any, input: string, isEditModal: boolean): Promise<void> {
    await this.clickAddDescriptionAndVerify(isEditModal);
    await this.fillInElement(locators.descriptionInput, '');
    await this.typeInElement(locators.descriptionInput, input);
    const descriptionFieldValue = await locators.descriptionInput.inputValue();
    expect(descriptionFieldValue).toBe(input);
  }

  // Verify description field maximum length (reads from maxlength attribute or defaults to 1024)
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

  // ========== ERROR VERIFICATION METHODS ==========

  // Verify 'The name is already used' error message is displayed
  async verifyNameAlreadyUsedError(): Promise<void> {
    await test.step('Verify "Name is already used" error message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.nameAlreadyUsedError, {
        assertionMessage: 'Verify name already used error is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // ========== TOAST MESSAGE METHODS ==========

  // Verify specific toast message is displayed
  async verifyToastMessage(toastMessage: string, options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await super.verifyToastMessage(toastMessage, options);
  }

  // Verify category operation success toast message (created/deleted/updated)
  async verifyCategoryOperationSuccessToast(operation: 'created' | 'deleted' | 'updated'): Promise<void> {
    const toastTextMap = {
      created: 'Category created',
      deleted: 'Category deleted',
      updated: 'Category updated',
    };

    const toastText = toastTextMap[operation];
    await test.step(`Verify category ${operation} success toast message`, async () => {
      await this.page.waitForTimeout(1000);
      const toastMessage = this.toastMessages.filter({ hasText: toastText }).first();
      await expect(toastMessage, `expecting ${toastText} toast message`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // Convenience methods for backward compatibility
  async verifyCategoryCreationSuccessToast(): Promise<void> {
    await this.verifyCategoryOperationSuccessToast('created');
  }

  async verifyCategoryDeletionSuccessToast(): Promise<void> {
    await this.verifyCategoryOperationSuccessToast('deleted');
  }

  async verifyCategoryUpdateSuccessToast(): Promise<void> {
    await this.verifyCategoryOperationSuccessToast('updated');
  }

  // ========== CATEGORY CRUD OPERATIONS ==========

  // Create new category with specified name and optional description
  async createCategoryWithNameAndDescription(name: string, description?: string): Promise<void> {
    await test.step(`Create category with name: ${name}`, async () => {
      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(name);

      if (description) {
        await this.addCategoryDescription(description);
      }

      await this.submitCategoryCreation();
      await this.page.waitForTimeout(2000);
    });
  }

  // Attempt to create category with existing name to trigger duplicate validation error
  async attemptToCreateDuplicateCategory(existingCategoryName: string): Promise<void> {
    await test.step(`Attempt to create duplicate category with name: ${existingCategoryName}`, async () => {
      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(existingCategoryName);
      await this.submitCategoryCreation();
    });
  }

  // Delete category using 'Show more' dropdown menu
  async deleteCategoryByShowMore(categoryName?: string): Promise<void> {
    await test.step('Delete category using Show more menu', async () => {
      if (categoryName) {
        await this.openCategoryDropdownAndClickOption(categoryName, 'Delete category');
      } else {
        await this._deleteCategoryByLastShowMoreButton();
      }

      await this._confirmCategoryDeletion();
    });
  }

  // Delete category using the last Show more button (fallback method)
  private async _deleteCategoryByLastShowMoreButton(): Promise<void> {
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

    await this.page.waitForTimeout(1000);
    await this.clickOnElement(this.deleteCategoryOption, {
      stepInfo: 'Click on Delete category option',
      timeout: 10_000,
    });
  }

  // Confirm category deletion by clicking the Delete button
  private async _confirmCategoryDeletion(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.deleteCategoryButton, {
      assertionMessage: 'Verify Delete confirmation button is visible',
      timeout: TIMEOUTS.MEDIUM,
    });

    await this.clickOnElement(this.deleteCategoryButton, {
      stepInfo: 'Click on Delete button to confirm category deletion',
      timeout: 10_000,
    });
  }

  // ========== CATEGORY DROPDOWN MENU METHODS ==========

  // Verify all three options are present in category dropdown menu (Add Audience, Edit category, Delete category)
  async verifyAllCategoryOptionsArePresent(categoryName: string): Promise<void> {
    await test.step('Verify all three options are present in category dropdown menu', async () => {
      await this._openCategoryDropdown(categoryName);
      await this._verifyDropdownOptions();
    });
  }

  // Open category dropdown menu
  private async _openCategoryDropdown(categoryName: string): Promise<void> {
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

    await this.page.waitForTimeout(1000);
  }

  // Verify all expected dropdown options are present
  private async _verifyDropdownOptions(): Promise<void> {
    const expectedOptions = ['Add Audience', 'Edit category', 'Delete category'];
    console.log('Verifying category dropdown options...');

    for (const option of expectedOptions) {
      const optionLocator = this.page.getByText(option);
      await this.verifier.verifyTheElementIsVisible(optionLocator, {
        assertionMessage: `Verify "${option}" option is visible in dropdown menu`,
        timeout: TIMEOUTS.SHORT,
      });
      console.log(`✅ Found option: "${option}"`);
    }

    console.log('✅ All three required options are present in the category dropdown menu');
  }

  // Close any open dropdown by clicking elsewhere on the page
  async closeOpenDropdown(): Promise<void> {
    await test.step('Close any open dropdown', async () => {
      await this.page.click('body');
      await this.page.waitForTimeout(1000);
    });
  }

  // Generic method to open category dropdown menu and click on specific option
  async openCategoryDropdownAndClickOption(categoryName: string, optionText: string): Promise<void> {
    await test.step(`Open category dropdown for "${categoryName}" and click "${optionText}"`, async () => {
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

  // ========== CATEGORY BEHAVIOR VERIFICATION METHODS ==========

  // Verify clicking Cancel button prevents category creation
  async verifyCategoryCancelButtonBehavior(): Promise<void> {
    await test.step('Verify Cancel button prevents category creation', async () => {
      const categoryName = `CancelTest_${Date.now()}`;

      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(categoryName);
      await this.clickOnElement(this.categoryModalCancelButton, { stepInfo: 'Click Cancel button' });

      await this.verifier.verifyTheElementIsNotVisible(this.categoryLabel, {});
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

      await this.verifier.verifyTheElementIsNotVisible(this.categoryLabel, {});
      await this.verifyCategoryNotInList(categoryName);
    });
  }

  // Verify specific category name is not present in the categories list
  async verifyCategoryNotInList(categoryName: string): Promise<void> {
    await test.step(`Verify category "${categoryName}" is not in the list`, async () => {
      await this.page.waitForTimeout(1000);
      const categoryElement = this.page.getByText(categoryName, { exact: true });
      const isVisible = await categoryElement.isVisible({ timeout: 3000 }).catch(() => false);
      expect(isVisible, `Category "${categoryName}" should not be created and visible in the list`).toBe(false);
    });
  }

  // ========== EDIT CATEGORY METHODS ==========

  // Open Edit category modal by clicking on 'Edit category' option from dropdown menu
  async openEditCategoryModal(categoryName: string): Promise<void> {
    await test.step(`Open Edit category modal for: ${categoryName}`, async () => {
      await this.openCategoryDropdownAndClickOption(categoryName, 'Edit category');
      await this.verifier.verifyTheElementIsVisible(this.editCategoryLabel, {
        assertionMessage: 'Verify Edit category modal is opened',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // Verify Edit category modal elements and validations
  async verifyEditCategoryModalElements(): Promise<void> {
    await test.step('Verify Edit category modal elements and validations', async () => {
      const locators = this.getModalSpecificLocators(true);
      await this._verifyEditModalElements(locators);
      await expect(locators.submitButton, 'Expect Save button to be enabled by default in Edit modal').toBeEnabled();
    });
  }

  // Verify all Edit modal elements are visible
  private async _verifyEditModalElements(locators: any): Promise<void> {
    const elementsToVerify = [
      { element: this.editCategoryLabel, message: 'Verify Edit category heading is visible' },
      { element: locators.nameInput, message: 'Verify Name input is visible in Edit modal' },
      { element: locators.addDescriptionButton, message: 'Verify Add description button is visible in Edit modal' },
      { element: locators.cancelButton, message: 'Verify Cancel button is visible in Edit modal' },
      { element: locators.submitButton, message: 'Verify Save button is visible in Edit modal' },
      { element: locators.closeButton, message: 'Verify Close button is visible in Edit modal' },
    ];

    for (const { element, message } of elementsToVerify) {
      await this.verifier.verifyTheElementIsVisible(element, { assertionMessage: message });
    }

    // Verify helper text
    const editModalHelperText = locators.dialog.locator(
      'p:has-text("Keep your audiences organized by grouping related audiences within a category.")'
    );
    await this.verifier.verifyTheElementIsVisible(editModalHelperText, {
      assertionMessage: 'Verify category helper text is visible in Edit modal',
    });

    // Verify Name label
    const editModalNameLabel = locators.dialog.locator('label:has-text("Name")');
    await this.verifier.verifyTheElementIsVisible(editModalNameLabel, {
      assertionMessage: 'Verify Name label is visible in Edit modal',
    });
  }

  // Verify name field validation in Edit category modal
  async verifyEditCategoryNameFieldValidation(): Promise<void> {
    await test.step('Verify name field validation in Edit category modal', async () => {
      const locators = this.getModalSpecificLocators(true);

      await this.fillInElement(locators.nameInput, '');
      await locators.nameInput.blur();

      await this.verifier.verifyTheElementIsVisible(locators.nameRequiredError, {
        assertionMessage: 'Verify "Name is a required field" error message is visible when name is cleared',
        timeout: TIMEOUTS.SHORT,
      });

      await expect(locators.submitButton, 'Expect Save button to be disabled when name field is empty').toBeDisabled();

      await this.fillInElement(locators.nameInput, 'ValidCategoryName');

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
      await this.fillInElement(locators.nameInput, duplicateName);
      await this.clickOnElement(locators.submitButton, {
        stepInfo: 'Click Save button to trigger duplicate name validation',
        timeout: 10_000,
      });
    });
  }

  // ========== UTILITY METHODS ==========

  // Get modal-specific locators for both Create and Edit category modals
  private getModalSpecificLocators(isEditModal: boolean = false) {
    if (isEditModal) {
      return this._getEditModalLocators();
    }
    return this._getCreateModalLocators();
  }

  // Get locators specific to Edit category modal
  private _getEditModalLocators() {
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

  // Get locators specific to Create category modal
  private _getCreateModalLocators() {
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
