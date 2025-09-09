import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';
import { CategoryModalComponent } from '@platforms/components/categoryModal';
import { CsvAudienceModule } from '@platforms/components/csvAudienceModule';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

// Page Object Model for the Audience management page with category creation and validation functionality
export class AudiencePage extends BasePage {
  labelAudience: Locator;
  createAudienceButton: Locator;
  createDropdown: Locator;
  createAudience: Locator;
  createCategory: Locator;
  createAudienceWithCSV: Locator;

  // Legacy category dialog elements - now handled by CategoryModalComponent
  // These are kept for backward compatibility but should be removed eventually

  // Error message elements
  nameAlreadyUsedError: Locator;

  // Category management elements
  deleteCategoryOption: Locator;
  deleteCategoryButton: Locator;
  editCategoryOption: Locator;
  editCategoryDialog: Locator;
  editCategoryLabel: Locator;
  editCategoryModalSaveButton: Locator;

  // Modal components
  addCategoryModal: CategoryModalComponent;
  editCategoryModal: CategoryModalComponent;
  csvUploadModal: CsvAudienceModule;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.AUDIENCE_PAGE) {
    super(page, pageUrl);
    const pageContainer = page.getByTestId('pageContainer-page');

    this.createAudienceButton = pageContainer.locator('button:has-text("Create")');
    this.createDropdown = page.getByRole('button', { name: 'Open menu' });
    this.createAudience = page.locator('[role="menuitem"]:has-text("Create audience")');
    this.createCategory = page.locator('[role="menuitem"]:has-text("Create category")');
    this.createAudienceWithCSV = page.locator('[role="menuitem"]:has-text("Create audience with CSV")');
    this.labelAudience = page.getByTestId('pageContainer-page').locator('header h1').filter({ hasText: 'Audiences' });
    this.nameAlreadyUsedError = page.getByText('The name is already used');
    this.deleteCategoryOption = page.getByText('Delete category');
    this.deleteCategoryButton = page.getByRole('button', { name: 'Delete' });
    this.editCategoryOption = page.getByText('Edit category');
    this.editCategoryDialog = page.locator('[role="dialog"]');
    this.editCategoryLabel = page.locator('h2:has-text("Edit category")');
    this.editCategoryModalSaveButton = page.getByRole('button', { name: 'Save' });

    this.addCategoryModal = new CategoryModalComponent(page, 'create');
    this.editCategoryModal = new CategoryModalComponent(page, 'edit');
    this.csvUploadModal = new CsvAudienceModule(page);
  }

  // Verify that the Audience page is loaded by checking if 'Audiences' heading is visible
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the audience page is loaded', async () => {
      await expect(this.labelAudience, 'expecting Audience label to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // ========== CREATE FLOW METHODS ==========

  /**
   * @description
   * Click on Create button or dropdown menu option to initiate audience creation flow
   * @param createType - The type of creation to initiate
   * @returns void
   */
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

  // Click on close (X) button at the top right corner of category modal (for Create category modal)
  // Note: For better SRP, prefer using addCategoryModal.clickCloseButton() or editCategoryModal.clickCloseButton() directly
  async clickOnCloseButton(): Promise<void> {
    await this.addCategoryModal.clickCloseButton();
  }

  // ========== CATEGORY MODAL METHODS ==========

  // Open Create category modal and validate all expected elements are visible
  async openCreateCategoryModal(): Promise<void> {
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
  }

  // These methods now delegate to the modal components for better separation of concerns

  // Verify the close button is visible in category creation modal
  async assertCloseButtonIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.addCategoryModal.closeButton, {
      assertionMessage: 'Verify Close button is visible',
      timeout: TIMEOUTS.MEDIUM,
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

  // Verify category operation success toast message (created/deleted/updated)
  async verifyToastMessageForCategoryOperation(operation: 'created' | 'deleted' | 'updated'): Promise<void> {
    const toastTextMap = {
      created: 'Category created',
      deleted: 'Category deleted',
      updated: 'Category updated',
    };

    const toastText = toastTextMap[operation];
    await test.step(`Verify category ${operation} success toast message shows text "${toastText}"`, async () => {
      // Use Playwright's automatic waiting instead of custom timeout
      const toastMessage = this.toastMessages.filter({ hasText: toastText }).first();
      await expect(toastMessage, `expecting ${toastText} toast message`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // ========== CATEGORY CRUD OPERATIONS ==========

  // Create category with name and description - high-level workflow
  async createCategoryWithNameAndDescription(categoryName: string, description?: string): Promise<void> {
    await test.step(`Create category: ${categoryName}`, async () => {
      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.addCategoryModal.fillCategoryName(categoryName);

      if (description) {
        await this.addCategoryModal.clickAddDescriptionAndVerify();
        await this.addCategoryModal.addCategoryDescription(description);
      }

      await this.addCategoryModal.submitCategory();
    });
  }

  // Attempt to create category with existing name to trigger duplicate validation error
  async attemptToCreateDuplicateCategory(existingCategoryName: string): Promise<void> {
    await test.step(`Attempt to create duplicate category: ${existingCategoryName}`, async () => {
      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.addCategoryModal.fillCategoryName(existingCategoryName);
      await this.addCategoryModal.submitCategory();
    });
  }

  // Attempt to save edit category with duplicate name
  async attemptToSaveEditCategoryWithDuplicateName(originalCategoryName: string, duplicateName: string): Promise<void> {
    await test.step(`Attempt to save category with duplicate name: ${duplicateName}`, async () => {
      await this.openEditCategoryModal(originalCategoryName);
      await this.editCategoryModal.fillInElement(this.editCategoryModal.categoryNameInput, '');
      await this.editCategoryModal.fillCategoryName(duplicateName);
      await this.editCategoryModal.submitCategory();
    });
  }

  // Delete category using 'Show more' dropdown menu
  async deleteCategoryByShowMore(categoryName: string): Promise<void> {
    await test.step(`Delete category "${categoryName}" using Show more menu`, async () => {
      await this.openCategoryDropdownAndClickOption(categoryName, 'Delete category');
      await this._confirmCategoryDeletion();
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

      // Click the parent menuitem element instead of the text element
      const menuItemLocator = this.page.locator('[role="menuitem"]').filter({ hasText: optionText });

      await this.verifier.verifyTheElementIsVisible(menuItemLocator, {
        assertionMessage: `Verify "${optionText}" menu item is visible`,
        timeout: TIMEOUTS.MEDIUM,
      });

      await menuItemLocator.click();
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

  // ========== CSV UPLOAD METHODS ==========

  // Open CSV upload modal for creating audience with CSV
  async openCreateAudienceWithCsvModal(): Promise<void> {
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create audience with CSV');
  }
}
