import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';
import { TIMEOUTS } from '@core/constants/timeouts';

export class EditCategoryModalComponent extends BaseComponent {
  // Edit category modal elements
  editCategoryDialog!: Locator;
  editCategoryLabel!: Locator;
  editCategoryModalSaveButton!: Locator;

  constructor(page: Page) {
    super(page);
    this._initializeLocators(page);
  }

  // Initialize all locators for the Edit Category modal
  private _initializeLocators(page: Page): void {
    this.editCategoryDialog = page.locator('[role="dialog"]');
    this.editCategoryLabel = page.locator('h2:has-text("Edit category")');
    this.editCategoryModalSaveButton = page.getByRole('button', { name: 'Save' });
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

  // Verify Edit category modal elements and validations
  async verifyEditCategoryModalElements(): Promise<void> {
    await test.step('Verify Edit category modal elements and validations', async () => {
      const locators = this._getEditModalLocators();
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
      const locators = this._getEditModalLocators();

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
      const locators = this._getEditModalLocators();
      await this.fillInElement(locators.nameInput, duplicateName);
      await this.clickOnElement(locators.submitButton, {
        stepInfo: 'Click Save button to trigger duplicate name validation',
        timeout: 10_000,
      });
    });
  }

  // Click on close (X) button at the top right corner of Edit category modal
  async clickOnCloseButton(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? 'Click on close button', async () => {
      const locators = this._getEditModalLocators();
      await this.clickOnElement(locators.closeButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  // Click 'Add description' button and verify description field and delete button become visible
  async clickAddDescriptionAndVerify(): Promise<void> {
    const locators = this._getEditModalLocators();

    await test.step('Click Add description and verify in Edit category modal', async () => {
      const alreadyVisible = await this.verifier.isTheElementVisible(locators.descriptionInput, { timeout: 1000 });
      if (!alreadyVisible) {
        await this.clickOnElement(locators.addDescriptionButton, { stepInfo: 'Click Add description' });
      }

      await this.verifier.verifyTheElementIsVisible(locators.descriptionInput, {});
      await this.verifier.verifyTheElementIsVisible(locators.deleteDescriptionButton, {});
    });
  }

  // Remove description by clicking delete button and verify field is no longer visible
  async removeDescriptionAndVerifyAbsence(): Promise<void> {
    const locators = this._getEditModalLocators();

    await test.step('Remove description and verify absence in Edit category modal', async () => {
      await this.clickOnElement(locators.deleteDescriptionButton, { stepInfo: 'Click Delete description' });
      await this.verifier.verifyTheElementIsNotVisible(locators.descriptionInput, {});
    });
  }

  // Verify category name field has maximum length (expected: 100 characters)
  async verifyNameFieldMaxLength(): Promise<void> {
    await test.step('Verify Edit category name field max length', async () => {
      const locators = this._getEditModalLocators();
      const longText = 'A'.repeat(101); // 101 characters (1 more than expected limit)
      await this.fillInElement(locators.nameInput, longText);
      const actualValue = await locators.nameInput.inputValue();
      expect(actualValue.length, 'Category name should not accept more than 100 characters').toBeLessThanOrEqual(100);
    });
  }

  // Verify name and description fields accept alphanumeric and special characters
  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(): Promise<void> {
    await test.step('Verify Edit category fields accept letters, numbers, and special characters', async () => {
      const locators = this._getEditModalLocators();
      const sampleInput = 'Category 123 _-.,@#$()&[]{}:;!?';

      await this._verifyNameFieldAcceptsInput(locators, sampleInput);
      await this._verifyDescriptionFieldAcceptsInput(locators, sampleInput);
    });
  }

  // Verify name field accepts input and enables submit button
  private async _verifyNameFieldAcceptsInput(locators: any, input: string): Promise<void> {
    await this.fillInElement(locators.nameInput, input);
    const nameFieldValue = await locators.nameInput.inputValue();
    expect(nameFieldValue).toBe(input);
    await expect(locators.submitButton).toBeEnabled();
  }

  // Verify description field accepts input
  private async _verifyDescriptionFieldAcceptsInput(locators: any, input: string): Promise<void> {
    await this.clickAddDescriptionAndVerify();
    await this.fillInElement(locators.descriptionInput, input);
    const descriptionFieldValue = await locators.descriptionInput.inputValue();
    expect(descriptionFieldValue).toBe(input);
  }

  // Verify description field maximum length (expected: 1024 characters)
  async verifyDescriptionFieldMaxLength(): Promise<void> {
    await test.step('Verify Edit category description field max length', async () => {
      const locators = this._getEditModalLocators();
      await this.clickAddDescriptionAndVerify();
      const longText = 'A'.repeat(1025); // 1025 characters (1 more than expected limit)
      await this.fillInElement(locators.descriptionInput, longText);
      const actualValue = await locators.descriptionInput.inputValue();
      expect(actualValue.length, 'Description should not accept more than 1024 characters').toBeLessThanOrEqual(1024);
    });
  }
}
