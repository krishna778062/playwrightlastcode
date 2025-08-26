import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';
import { TIMEOUTS } from '@core/constants/timeouts';

export class AddCategoryModalComponent extends BaseComponent {
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
  nameRequiredError!: Locator;

  constructor(page: Page) {
    super(page);
    this._initializeLocators(page);
  }

  // Initialize all locators for the Add Category modal
  private _initializeLocators(page: Page): void {
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
    this.nameRequiredError = this.categoryDialog.locator(':text("Name is a required field")');
  }

  // Verify Create category modal elements are visible
  async verifyCreateCategoryModalElements(): Promise<void> {
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
  async triggerNameFieldValidation(): Promise<void> {
    await this.categoryNameInput.click();
    await this.page.keyboard.press('Tab');
    await this.verifier.verifyTheElementIsVisible(this.nameRequiredError);
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

  // Click on close (X) button at the top right corner of category modal
  async clickOnCloseButton(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? 'Click on close button', async () => {
      await this.clickOnElement(this.clickCloseButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  // Click 'Add description' button and verify description field and delete button become visible
  async clickAddDescriptionAndVerify(): Promise<void> {
    await test.step('Click Add description and verify in Create category modal', async () => {
      const alreadyVisible = await this.verifier.isTheElementVisible(this.descriptionInput, { timeout: 1000 });
      if (!alreadyVisible) {
        await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click Add description' });
      }

      await this.verifier.verifyTheElementIsVisible(this.descriptionInput, {});
      await this.verifier.verifyTheElementIsVisible(this.deleteDescriptionButton, {});
    });
  }

  // Remove description by clicking delete button and verify field is no longer visible
  async removeDescriptionAndVerifyAbsence(): Promise<void> {
    await test.step('Remove description and verify absence in Create category modal', async () => {
      await this.clickOnElement(this.deleteDescriptionButton, { stepInfo: 'Click Delete description' });
      await this.verifier.verifyTheElementIsNotVisible(this.descriptionInput, {});
    });
  }

  // Verify category name field has maximum length (expected: 100 characters)
  async verifyNameFieldMaxLength(): Promise<void> {
    await test.step('Verify Create category name field max length', async () => {
      const longText = 'A'.repeat(101); // 101 characters (1 more than expected limit)
      await this.fillInElement(this.categoryNameInput, longText);
      const actualValue = await this.categoryNameInput.inputValue();
      expect(actualValue.length, 'Category name should not accept more than 100 characters').toBeLessThanOrEqual(100);
    });
  }

  // Verify name and description fields accept alphanumeric and special characters
  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(): Promise<void> {
    await test.step('Verify Create category fields accept letters, numbers, and special characters', async () => {
      const sampleInput = 'Category 123 _-.,@#$()&[]{}:;!?';

      await this._verifyNameFieldAcceptsInput(sampleInput);
      await this._verifyDescriptionFieldAcceptsInput(sampleInput);
    });
  }

  // Verify name field accepts input and enables submit button
  private async _verifyNameFieldAcceptsInput(input: string): Promise<void> {
    await this.fillInElement(this.categoryNameInput, input);
    const nameFieldValue = await this.categoryNameInput.inputValue();
    expect(nameFieldValue).toBe(input);
    await expect(this.categoryModalAddButton).toBeEnabled();
  }

  // Verify description field accepts input
  private async _verifyDescriptionFieldAcceptsInput(input: string): Promise<void> {
    await this.clickAddDescriptionAndVerify();
    await this.fillInElement(this.descriptionInput, input);
    const descriptionFieldValue = await this.descriptionInput.inputValue();
    expect(descriptionFieldValue).toBe(input);
  }

  // Verify description field maximum length (expected: 1024 characters)
  async verifyDescriptionFieldMaxLength(): Promise<void> {
    await test.step('Verify Create category description field max length', async () => {
      await this.clickAddDescriptionAndVerify();
      const longText = 'A'.repeat(1025); // 1025 characters (1 more than expected limit)
      await this.fillInElement(this.descriptionInput, longText);
      const actualValue = await this.descriptionInput.inputValue();
      expect(actualValue.length, 'Description should not accept more than 1024 characters').toBeLessThanOrEqual(1024);
    });
  }

  // Create new category with specified name and optional description
  async createCategoryWithNameAndDescription(name: string, description?: string): Promise<void> {
    await test.step(`Create category with name: ${name}`, async () => {
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
      await this.fillCategoryName(existingCategoryName);
      await this.submitCategoryCreation();
    });
  }

  // Verify clicking Cancel button prevents category creation
  async verifyCategoryCancelButtonBehavior(): Promise<void> {
    await test.step('Verify Cancel button prevents category creation', async () => {
      const categoryName = `CancelTest_${Date.now()}`;

      await this.fillCategoryName(categoryName);
      await this.clickOnElement(this.categoryModalCancelButton, { stepInfo: 'Click Cancel button' });

      await this.verifier.verifyTheElementIsNotVisible(this.categoryLabel, {});
    });
  }

  // Verify clicking Close (X) button prevents category creation
  async verifyCategoryCloseButtonBehavior(): Promise<void> {
    await test.step('Verify Close button prevents category creation', async () => {
      const categoryName = `CloseTest_${Date.now()}`;

      await this.fillCategoryName(categoryName);
      await this.clickOnElement(this.clickCloseButton, { stepInfo: 'Click Close button' });

      await this.verifier.verifyTheElementIsNotVisible(this.categoryLabel, {});
    });
  }
}
