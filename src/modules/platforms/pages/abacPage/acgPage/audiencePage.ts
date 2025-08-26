import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';
import { AddCategoryModalComponent } from '@platforms/components/addCategoryModal';
import { EditCategoryModalComponent } from '@platforms/components/editCategoryModal';

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

  // Modal components
  addCategoryModal!: AddCategoryModalComponent;
  editCategoryModal!: EditCategoryModalComponent;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.AUDIENCE_PAGE) {
    super(page, pageUrl);
    this._initializeLocators(page);
    this._initializeModalComponents(page);
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

  // Initialize modal components
  private _initializeModalComponents(page: Page): void {
    this.addCategoryModal = new AddCategoryModalComponent(page);
    this.editCategoryModal = new EditCategoryModalComponent(page);
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
    await this._getModalComponent(options?.isEditModal ?? false).clickOnCloseButton(options);
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
    await this.addCategoryModal.verifyCreateCategoryModalElements();
    await this.addCategoryModal.triggerNameFieldValidation();

    if (options?.verifyMaxLength) await this.verifyNameFieldMaxLength();
    if (options?.verifyAddDescription) await this.clickAddDescriptionAndVerify();
    if (options?.verifyRemoveDescription) await this.removeDescriptionAndVerifyAbsence();
    if (options?.closeAfter) await this.clickOnCloseButton();
  }

  // ========== CATEGORY FORM INTERACTION METHODS ==========
  // These methods now delegate to the modal components for better separation of concerns

  // Verify the close button is visible in category creation modal
  async assertCloseButtonIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.clickCloseButton, {
      assertionMessage: 'Verify Close button is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  // ========== FIELD VALIDATION METHODS ==========

  // Helper method to get the appropriate modal component
  private _getModalComponent(isEditModal: boolean = false) {
    return isEditModal ? this.editCategoryModal : this.addCategoryModal;
  }

  // Field validation methods now delegate to modal components using cleaner approach
  async clickAddDescriptionAndVerify(isEditModal: boolean = false): Promise<void> {
    await this._getModalComponent(isEditModal).clickAddDescriptionAndVerify();
  }

  async removeDescriptionAndVerifyAbsence(isEditModal: boolean = false): Promise<void> {
    await this._getModalComponent(isEditModal).removeDescriptionAndVerifyAbsence();
  }

  async verifyNameFieldMaxLength(isEditModal: boolean = false): Promise<void> {
    await this._getModalComponent(isEditModal).verifyNameFieldMaxLength();
  }

  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(isEditModal: boolean = false): Promise<void> {
    await this._getModalComponent(isEditModal).verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial();
  }

  async verifyDescriptionFieldMaxLength(isEditModal: boolean = false): Promise<void> {
    await this._getModalComponent(isEditModal).verifyDescriptionFieldMaxLength();
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
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
    await this.addCategoryModal.createCategoryWithNameAndDescription(name, description);
  }

  // Attempt to create category with existing name to trigger duplicate validation error
  async attemptToCreateDuplicateCategory(existingCategoryName: string): Promise<void> {
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
    await this.addCategoryModal.attemptToCreateDuplicateCategory(existingCategoryName);
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
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
    await this.addCategoryModal.verifyCategoryCancelButtonBehavior();
  }

  // Verify clicking Close (X) button prevents category creation
  async verifyCategoryCloseButtonBehavior(): Promise<void> {
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
    await this.addCategoryModal.verifyCategoryCloseButtonBehavior();
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

  // Edit category methods now delegate to modal component
  async verifyEditCategoryModalElements(): Promise<void> {
    await this.editCategoryModal.verifyEditCategoryModalElements();
  }

  async verifyEditCategoryNameFieldValidation(): Promise<void> {
    await this.editCategoryModal.verifyEditCategoryNameFieldValidation();
  }

  async attemptToSaveEditCategoryWithDuplicateName(duplicateName: string): Promise<void> {
    await this.editCategoryModal.attemptToSaveEditCategoryWithDuplicateName(duplicateName);
  }

  // ========== UTILITY METHODS ==========
  // Modal-specific utility methods have been moved to their respective modal components
}
