import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

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
  }

  /**
   * To click on Create Audience Button
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

  /**
   * To click on Cross button at the top right corner of ACG creation popup.
   */
  async clickOnCloseButton(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on close button`, async () => {
      await this.clickOnElement(this.clickCloseButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  // To verify that the Audience page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step(`Verifying the audience page is loaded`, async () => {
      await expect(this.labelAudience, `expecting Audience label to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // Open the Create category modal and validate the visible elements
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

  // Fill the Name field in the Create category dialog
  async fillCategoryName(name: string): Promise<void> {
    await this.fillInElement(this.categoryNameInput, name);
  }

  // Add a description in the Create category dialog
  async addCategoryDescription(description: string): Promise<void> {
    await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click on Add description' });
    await this.fillInElement(this.descriptionInput, description);
  }

  // Click the Add button to submit the new category
  async submitCategoryCreation(): Promise<void> {
    await this.clickOnElement(this.categoryModalAddButton, { stepInfo: 'Click Add on Create category modal' });
  }

  // Verify the Close button is visible
  async assertCloseButtonIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.clickCloseButton, {
      assertionMessage: 'Verify Close button is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  // Click the Add description button to add a description to the category
  async clickAddDescriptionAndVerify(): Promise<void> {
    const alreadyVisible = await this.verifier.isTheElementVisible(this.descriptionInput, { timeout: 1000 });
    if (!alreadyVisible) {
      await this.clickOnElement(this.addCategoryDescriptionButton, { stepInfo: 'Click Add description' });
    }
    // Verify the Description textarea is visible
    await this.verifier.verifyTheElementIsVisible(this.descriptionInput, {});
    // Verify the Delete description button is visible
    await this.verifier.verifyTheElementIsVisible(this.deleteDescriptionButton, {});
  }

  // Click the Delete description button to remove the description from the category
  async removeDescriptionAndVerifyAbsence(): Promise<void> {
    await this.clickOnElement(this.deleteDescriptionButton, { stepInfo: 'Click Delete description' });
    await this.verifier.verifyTheElementIsNotVisible(this.descriptionInput, {});
  }

  // Verify the Name field max length is 100
  async verifyNameFieldMaxLength(): Promise<void> {
    await test.step('Verify Name field max length is 100', async () => {
      const expectedMaxLength = 100;
      const overLengthInput = 'A'.repeat(120);

      await this.fillInElement(this.categoryNameInput, ''); // clear
      await this.typeInElement(this.categoryNameInput, overLengthInput); // type 120 chars

      const valueAfterFirstInput = await this.categoryNameInput.inputValue();
      expect(valueAfterFirstInput.length).toBe(expectedMaxLength);
      expect(valueAfterFirstInput).toBe(overLengthInput.slice(0, expectedMaxLength)); // truncated exactly

      // Try typing more; value should not change
      await this.typeInElement(this.categoryNameInput, 'B'.repeat(5));
      const valueAfterSecondInput = await this.categoryNameInput.inputValue();
      expect(valueAfterSecondInput).toBe(valueAfterFirstInput);

      const maxLengthAttribute = await this.getElementAttribute(this.categoryNameInput, 'maxlength');
      if (maxLengthAttribute) expect(Number(maxLengthAttribute)).toBe(expectedMaxLength);
    });
  }

  // Verify the Name field accepts letters, numbers, and special characters
  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(): Promise<void> {
    await test.step('Verify Name field accepts letters, numbers, and special characters', async () => {
      const sampleInput = 'Category 123 _-.,@#$()&[]{}:;!?';
      await this.fillInElement(this.categoryNameInput, '');
      await this.typeInElement(this.categoryNameInput, sampleInput);
      const nameFieldValue = await this.categoryNameInput.inputValue();
      expect(nameFieldValue).toBe(sampleInput);
      await expect(this.categoryModalAddButton).toBeEnabled();

      // Also verify Description field accepts same character set
      await this.clickAddDescriptionAndVerify();
      await this.fillInElement(this.descriptionInput, '');
      await this.typeInElement(this.descriptionInput, sampleInput);
      const descriptionFieldValue = await this.descriptionInput.inputValue();
      expect(descriptionFieldValue).toBe(sampleInput);
    });
  }

  // Verify the Description field max length is 1024
  async verifyDescriptionFieldMaxLength(): Promise<void> {
    await test.step('Verify Description field max length', async () => {
      await this.clickAddDescriptionAndVerify();
      const maxLengthAttribute = await this.getElementAttribute(this.descriptionInput, 'maxlength');
      const maximumAllowedLength = maxLengthAttribute ? Number(maxLengthAttribute) : 1024;

      const overLengthInput = 'D'.repeat(maximumAllowedLength + 50);
      await this.fillInElement(this.descriptionInput, '');
      await this.typeInElement(this.descriptionInput, overLengthInput);

      const valueAfterFirstInput = await this.descriptionInput.inputValue();
      expect(valueAfterFirstInput.length).toBe(maximumAllowedLength);
      expect(valueAfterFirstInput).toBe(overLengthInput.slice(0, maximumAllowedLength));

      await this.typeInElement(this.descriptionInput, 'E'.repeat(10));
      const valueAfterSecondInput = await this.descriptionInput.inputValue();
      expect(valueAfterSecondInput).toBe(valueAfterFirstInput);
    });
  }

  // Helper methods for category management
  async verifyNameAlreadyUsedError(): Promise<void> {
    await test.step('Verify "Name is already used" error message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.nameAlreadyUsedError, {
        assertionMessage: 'Verify name already used error is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyToastMessage(toastMessage: string, options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await super.verifyToastMessage(toastMessage, options);
  }

  async verifyCategoryCreationSuccessToast(): Promise<void> {
    await this.verifyToastMessage('Category created', {
      stepInfo: 'Verify category creation success toast message',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifyCategoryDeletionSuccessToast(): Promise<void> {
    await this.verifyToastMessage('Category deleted', {
      stepInfo: 'Verify category deletion success toast message',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

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

  async attemptToCreateDuplicateCategory(existingCategoryName: string): Promise<void> {
    await test.step(`Attempt to create duplicate category with name: ${existingCategoryName}`, async () => {
      await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
      await this.fillCategoryName(existingCategoryName);
      await this.submitCategoryCreation();
      // Note: This will trigger the duplicate name error which should be verified separately
    });
  }

  async deleteCategoryByShowMore(categoryName?: string): Promise<void> {
    await test.step('Delete category using Show more menu', async () => {
      let showMoreButton: Locator;

      if (categoryName) {
        // Use the working XPath approach
        console.log(`Looking for Show more button for category: ${categoryName} using XPath`);
        showMoreButton = this.page.locator(`//p[contains(text(),'${categoryName}')]/ancestor::div[@role='presentation']/following-sibling::div/following-sibling::div//button`);
      } else {
        // Fallback: Use the last Show more button (most recently created category)
        console.log('Using fallback: last Show more button');
        showMoreButton = this.page.getByRole('button', { name: 'Show more' }).last();
      }

      await this.verifier.verifyTheElementIsVisible(showMoreButton, {
        assertionMessage: 'Verify Show more button is visible for category deletion',
        timeout: TIMEOUTS.MEDIUM,
      });
      
      await this.clickOnElement(showMoreButton, {
        stepInfo: 'Click on Show more button for category',
        timeout: 10_000,
      });

      // Try different variations of the delete option text
      const deleteOptions = [
        this.page.getByText('Delete category'),
        this.page.getByText('Delete'),
        this.page.getByRole('menuitem', { name: /delete/i }),
        this.page.locator('[role="menuitem"]').filter({ hasText: /delete/i }),
        this.page.locator('button, [role="menuitem"]').filter({ hasText: /delete.*category/i })
      ];
      
      let deleteOption: Locator | null = null;
      for (const option of deleteOptions) {
        const isVisible = await option.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          deleteOption = option;
          console.log('Found delete option:', await option.textContent().catch(() => 'N/A'));
          break;
        }
      }
      
      if (!deleteOption) {
        throw new Error('Could not find any delete category option in the dropdown menu');
      }
      
      await this.clickOnElement(deleteOption, {
        stepInfo: 'Click on Delete category option',
        timeout: 10_000,
      });

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

  async verifyAllCategoryOptionsArePresent(): Promise<void> {
    await test.step('Verify all three options are present in category dropdown menu', async () => {
      // Define the exact expected options
      const expectedOptions = [
        'Add Audience',
        'Edit category', 
        'Delete category'
      ];

      console.log('Verifying category dropdown options...');

      // Wait for dropdown to be visible
      await this.page.waitForTimeout(1000);

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
}
