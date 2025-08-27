import { expect, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export type CategoryModalType = 'create' | 'edit';

export class CategoryModalComponent extends BaseComponent {
  private modalType: CategoryModalType;
  private dialogFilter: string;
  private submitButtonText: string;
  private titleText: string;

  // Locators
  categoryDialog!: any;
  closeButton!: any;
  categoryNameInput!: any;
  addDescriptionButton!: any;
  descriptionInput!: any;
  categoryLabel!: any;
  categoryTitleDescription!: any;
  cancelButton!: any;
  submitButton!: any;
  deleteDescriptionButton!: any;
  nameRequiredError!: any;

  constructor(page: Page, modalType: CategoryModalType) {
    super(page);
    this.modalType = modalType;
    this.dialogFilter = modalType === 'create' ? 'Create category' : 'Edit category';
    this.submitButtonText = modalType === 'create' ? 'Add' : 'Save';
    this.titleText = modalType === 'create' ? 'Create category' : 'Edit category';
    this.categoryDialog = page.locator('[role="dialog"]').filter({ hasText: this.dialogFilter });

    this.closeButton = this.categoryDialog.locator('button[aria-label="Close"]');
    this.categoryNameInput = this.categoryDialog.locator('input[name="name"]');
    this.addDescriptionButton = this.categoryDialog.locator('button:has-text("Add description")');
    this.descriptionInput = this.categoryDialog.locator('textarea[name="description"]');
    this.categoryLabel = this.categoryDialog.locator(`h2:has-text("${this.titleText}")`);
    this.categoryTitleDescription = this.categoryDialog.locator(
      'p:has-text("Keep your audiences organized by grouping related audiences within a category.")'
    );
    this.cancelButton = this.categoryDialog.locator('button:has-text("Cancel")');
    this.submitButton = this.categoryDialog.locator(
      `button:has-text("${this.submitButtonText}"):not(:has-text("Add description"))`
    );
    this.deleteDescriptionButton = this.categoryDialog.getByRole('button', { name: 'Delete' });
    this.nameRequiredError = this.categoryDialog.locator(':text("Name is a required field")');
  }

  /**
   * @description
   * Verify the category modal elements and validations
   * @returns void
   */
  async verifyCategoryModalElements(): Promise<void> {
    await test.step(`Verify ${this.titleText} modal elements and validations`, async () => {
      await this._verifyCategoryModalElements();

      // For Create modal: Add button should be disabled when name field is empty
      // For Edit modal: Save button should be enabled when editing existing category (name field is pre-filled)
      if (this.modalType === 'create') {
        await expect(
          this.submitButton,
          `Verify ${this.submitButtonText} button is disabled when no category name is provided`
        ).toBeDisabled();
      } else {
        await expect(
          this.submitButton,
          `Verify ${this.submitButtonText} button is enabled for existing category`
        ).toBeEnabled();
      }
    });
  }

  private async _verifyCategoryModalElements(): Promise<void> {
    const elementsToVerify = [
      { element: this.categoryLabel, message: `Verify ${this.titleText} heading is visible` },
      { element: this.categoryNameInput, message: `Verify Name input is visible in ${this.titleText} modal` },
      {
        element: this.addDescriptionButton,
        message: `Verify Add description button is visible in ${this.titleText} modal`,
      },
      { element: this.cancelButton, message: `Verify Cancel button is visible in ${this.titleText} modal` },
      {
        element: this.submitButton,
        message: `Verify ${this.submitButtonText} button is visible in ${this.titleText} modal`,
      },
      { element: this.closeButton, message: `Verify Close button is visible in ${this.titleText} modal` },
      {
        element: this.categoryTitleDescription,
        message: `Verify category helper text is visible in ${this.titleText} modal`,
      },
    ];

    for (const { element, message } of elementsToVerify) {
      await this.verifier.verifyTheElementIsVisible(element, { assertionMessage: message });
    }
  }

  // Basic methods - no smart logic
  async fillCategoryName(categoryName: string): Promise<void> {
    await this.fillInElement(this.categoryNameInput, categoryName, {
      stepInfo: `Fill category name: ${categoryName}`,
    });
  }

  async addCategoryDescription(description: string): Promise<void> {
    await this.fillInElement(this.descriptionInput, description, {
      stepInfo: `Add category description: ${description}`,
    });
  }

  async submitCategory(): Promise<void> {
    await this.clickOnElement(this.submitButton, {
      stepInfo: `Click ${this.submitButtonText} button`,
    });
  }

  async clickCancelButton(): Promise<void> {
    await this.clickOnElement(this.cancelButton, {
      stepInfo: 'Click Cancel button',
    });
  }

  async clickCloseButton(): Promise<void> {
    await this.clickOnElement(this.closeButton, {
      stepInfo: 'Click Close (X) button',
    });
  }

  // Add description - both Create and Edit modes behave the same for categories without description
  async clickAddDescriptionAndVerify(): Promise<void> {
    await test.step(`Click Add description and verify in ${this.titleText} modal`, async () => {
      await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click on Add description button' });
      await this.verifier.verifyTheElementIsVisible(this.descriptionInput, {
        assertionMessage: 'Verify description input field is visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.deleteDescriptionButton, {
        assertionMessage: 'Verify Delete description button is visible',
      });
    });
  }

  /**
   * @description
   * Remove description and verify absence
   * @returns void
   */
  async removeDescriptionAndVerifyAbsence(): Promise<void> {
    await test.step(`Remove description and verify absence in ${this.titleText} modal`, async () => {
      await this.clickOnElement(this.deleteDescriptionButton, {
        stepInfo: 'Click Delete description button',
      });

      await this.verifier.verifyTheElementIsNotVisible(this.descriptionInput, {
        assertionMessage: 'Verify description input field is not visible after deletion',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.addDescriptionButton, {
        assertionMessage: 'Verify Add description button is visible again',
      });
    });
  }

  /**
   * @description
   * Verify name and description fields accept alphanumeric and special characters
   * @returns void
   */
  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(): Promise<void> {
    await test.step(`Verify name and description fields accept alphanumeric and special characters in ${this.titleText} modal`, async () => {
      await this._verifyNameFieldAcceptsInput();
      await this._verifyDescriptionFieldAcceptsInput();
    });
  }

  private async _verifyNameFieldAcceptsInput(): Promise<void> {
    const testInputs = ['Test123', 'Test@#$', 'Test Space', 'Test-Category_Name'];

    for (const input of testInputs) {
      await this.fillInElement(this.categoryNameInput, input);
      const inputValue = await this.categoryNameInput.inputValue();
      if (inputValue !== input) {
        throw new Error(`Name field should accept input "${input}" but got "${inputValue}"`);
      }
    }
  }

  // Helper method to ensure description field is visible
  private async _ensureDescriptionFieldVisible(): Promise<void> {
    // Check if description field is already visible (might be visible if category has description)
    const descriptionVisible = await this.verifier.isTheElementVisible(this.descriptionInput, { timeout: 1000 });

    if (!descriptionVisible) {
      // Description field is hidden, need to click Add description to show it
      await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click Add description' });
    }
    // If already visible, no action needed
  }

  private async _verifyDescriptionFieldAcceptsInput(): Promise<void> {
    await this._ensureDescriptionFieldVisible();

    const testInputs = ['Description 123', 'Desc@#$%', 'Description with spaces', 'Desc-with_special-chars'];

    for (const input of testInputs) {
      await this.fillInElement(this.descriptionInput, input);
      const inputValue = await this.descriptionInput.inputValue();
      if (inputValue !== input) {
        throw new Error(`Description field should accept input "${input}" but got "${inputValue}"`);
      }
    }
  }

  async verifyNameFieldMaxLength(): Promise<void> {
    await test.step(`Verify name field max length validation in ${this.titleText} modal`, async () => {
      const testString = 'A'.repeat(101);
      await this.fillInElement(this.categoryNameInput, testString);

      const actualValue = await this.categoryNameInput.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(100);
    });
  }

  async verifyDescriptionFieldMaxLength(): Promise<void> {
    await test.step(`Verify description field max length validation in ${this.titleText} modal`, async () => {
      await this._ensureDescriptionFieldVisible();

      const testString = 'B'.repeat(1025);
      await this.fillInElement(this.descriptionInput, testString);

      const actualValue = await this.descriptionInput.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(1024);
    });
  }

  async verifyCategoryCancelButtonBehavior(): Promise<void> {
    await test.step(`Verify Cancel button behavior in ${this.titleText} modal`, async () => {
      const testCategoryName = `CancelTest_${Date.now()}`;
      await this.fillCategoryName(testCategoryName);
      await this.clickCancelButton();

      await this.verifier.verifyTheElementIsNotVisible(this.categoryDialog, {
        assertionMessage: `Verify ${this.titleText} modal is closed after clicking Cancel`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyCategoryCloseButtonBehavior(): Promise<void> {
    await test.step(`Verify Close button behavior in ${this.titleText} modal`, async () => {
      const testCategoryName = `CloseTest_${Date.now()}`;
      await this.fillCategoryName(testCategoryName);
      await this.clickCloseButton();

      await this.verifier.verifyTheElementIsNotVisible(this.categoryDialog, {
        assertionMessage: `Verify ${this.titleText} modal is closed after clicking Close`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyEditCategoryNameFieldValidation(): Promise<void> {
    if (this.modalType !== 'edit') {
      throw new Error('verifyEditCategoryNameFieldValidation can only be called in edit mode');
    }

    await test.step('Verify Edit category name field validation', async () => {
      await this.fillInElement(this.categoryNameInput, '');
      await expect(this.submitButton, 'Verify Save button is disabled when name field is empty').toBeDisabled();
    });
  }
}
