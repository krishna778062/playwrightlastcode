import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { FIELD_VALIDATION } from '@/src/modules/platforms/constants/fieldValidation';

export type CategoryModalMode = 'create' | 'edit';

export class CategoryModalComponent extends BaseComponent {
  private categoryModalForMode: CategoryModalMode;
  private dialogFilter: string;
  private submitButtonText: string;
  private titleText: string;

  // Locators
  categoryDialog: Locator;
  closeButton: Locator;
  categoryNameInput: Locator;
  addDescriptionButton: Locator;
  descriptionInput: Locator;
  categoryLabel: Locator;
  categoryTitleDescription: Locator;
  cancelButton: Locator;
  submitButton: Locator;
  deleteDescriptionButton: Locator;
  nameRequiredError: Locator;

  constructor(page: Page, categoryModalForMode: CategoryModalMode) {
    super(page);
    this.categoryModalForMode = categoryModalForMode;
    this.dialogFilter = categoryModalForMode === 'create' ? 'Create category' : 'Edit category';
    this.submitButtonText = categoryModalForMode === 'create' ? 'Add' : 'Save';
    this.titleText = categoryModalForMode === 'create' ? 'Create category' : 'Edit category';

    //Locators
    this.categoryDialog = page.locator('[role="dialog"]').filter({ hasText: this.dialogFilter });

    this.closeButton = this.categoryDialog.getByRole('button', { name: 'Close' });
    this.categoryNameInput = this.categoryDialog.getByRole('textbox', { name: 'Name' });
    this.addDescriptionButton = this.categoryDialog.getByRole('button', { name: 'Add description' });
    this.descriptionInput = this.categoryDialog.getByRole('textbox', { name: 'Description' });
    this.categoryLabel = this.categoryDialog.getByRole('heading', { name: this.titleText });
    this.categoryTitleDescription = this.categoryDialog.getByText(
      'Keep your audiences organized by grouping related audiences within a category.'
    );
    this.cancelButton = this.categoryDialog.getByRole('button', { name: 'Cancel' });
    this.submitButton = this.categoryDialog.getByRole('button', { name: this.submitButtonText, exact: true });
    this.deleteDescriptionButton = this.categoryDialog.getByRole('button', { name: 'Delete' });
    this.nameRequiredError = this.categoryDialog.getByText('Name is a required field');
  }

  /**
   * @description
   * Verify the category modal elements visibility
   * @private
   * @returns void
   */
  private async _verifyCategoryModalElementsVisibility(): Promise<void> {
    const listOfCategoryModalUiElementsToVerify = [
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

    for (const { element, message } of listOfCategoryModalUiElementsToVerify) {
      await this.verifier.verifyTheElementIsVisible(element, { assertionMessage: message });
    }
  }
  /**
   * @description
   * Verify the category modal elements and validations
   * @returns void
   */
  async verifyUIElementsOfCategoryModal(): Promise<void> {
    await test.step(`Verify ${this.titleText} modal elements and validations`, async () => {
      await this._verifyCategoryModalElementsVisibility();
      await this.verifySubmitButtonState();
    });
  }

  /**
   * @description
   * Verify the submit button state
   * @returns void
   */
  async verifySubmitButtonState(): Promise<void> {
    const isCreateMode = this.categoryModalForMode === 'create';

    if (isCreateMode) {
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
  }

  async addCategoryDescription(description: string): Promise<void> {
    await this.addDescription(this.descriptionInput, description, `Add category description: ${description}`);
  }

  async submitCategory(): Promise<void> {
    await this.clickOnElement(this.submitButton, {
      stepInfo: `Click ${this.submitButtonText} button`,
    });
  }

  async clickCancelButton(): Promise<void> {
    await super.clickCancelButton(this.cancelButton, 'Click Cancel button');
  }

  async clickCloseButton(): Promise<void> {
    await super.clickCloseButton(this.closeButton, 'Click Close (X) button');
  }

  // Add description - assumes description field is hidden initially
  async clickAddDescriptionAndVerify(): Promise<void> {
    await test.step(`Click Add description and verify in ${this.titleText} modal`, async () => {
      await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click Add description' });

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

  async fillInCategoryDescription(description: string): Promise<void> {
    // Ensure description field is visible first
    const isDescriptionVisible = await this.descriptionInput.isVisible({ timeout: 1000 }).catch(() => false);
    if (!isDescriptionVisible) {
      await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click Add description button' });
    }

    await this.fillInElement(this.descriptionInput, description, {
      stepInfo: `Fill category description: ${description}`,
    });
  }

  async fillCategoryName(categoryName: string): Promise<void> {
    await this.fillInElement(this.categoryNameInput, categoryName, {
      stepInfo: `Fill category name: ${categoryName}`,
    });
  }

  async verifyCategoryNameInputAcceptsInput(nameToInput: string): Promise<void> {
    await this.fillCategoryName(nameToInput);
    await expect(this.categoryNameInput, `Verify name field accepts input "${nameToInput}"`).toHaveValue(nameToInput);
  }

  async verifyCategoryDescriptionInputAcceptsInput(descriptionToInput: string): Promise<void> {
    await this.fillInCategoryDescription(descriptionToInput);
    await expect(this.descriptionInput, `Verify description field accepts input "${descriptionToInput}"`).toHaveValue(
      descriptionToInput
    );
  }

  // Verify name and description fields accept alphanumeric and special characters
  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(): Promise<void> {
    await test.step(`Verify name and description fields accept alphanumeric and special characters in ${this.titleText} modal`, async () => {
      // Test name field
      const nameTestInput = 'Test123 @#$ with Space and-Category_Name';
      await this.fillCategoryName(nameTestInput);
      await expect(this.categoryNameInput, `Verify name field accepts input "${nameTestInput}"`).toHaveValue(
        nameTestInput
      );

      // Test description field
      const descTestInput = 'Description 123 @#$% with spaces and-special_chars';
      await this.fillInCategoryDescription(descTestInput);
      await expect(this.descriptionInput, `Verify description field accepts input "${descTestInput}"`).toHaveValue(
        descTestInput
      );
    });
  }

  async verifyNameFieldMaxLength(maxAllowedLength: number = FIELD_VALIDATION.MAX_LENGTHS.CATEGORY_NAME): Promise<void> {
    await test.step(`Verify name field max length validation in ${this.titleText} modal`, async () => {
      const testString = 'A'.repeat(maxAllowedLength + 1); // Try to input more than allowed
      await this.fillInElement(this.categoryNameInput, testString);
      const actualValue = await this.categoryNameInput.inputValue();
      expect(actualValue.length, `Verify name field max length is ${maxAllowedLength}`).toEqual(maxAllowedLength);
    });
  }

  async verifyDescriptionFieldMaxLength(
    maxAllowedLength: number = FIELD_VALIDATION.MAX_LENGTHS.CATEGORY_DESCRIPTION
  ): Promise<void> {
    await test.step(`Verify description field max length validation in ${this.titleText} modal`, async () => {
      const testString = 'B'.repeat(maxAllowedLength + 1); // Try to input more than allowed
      await this.fillInCategoryDescription(testString);

      const actualValue = await this.descriptionInput.inputValue();
      expect(actualValue.length, `Verify description field max length is ${maxAllowedLength}`).toEqual(
        maxAllowedLength
      );
    });
  }

  async verifyCategoryCancelButtonBehavior(): Promise<void> {
    await test.step(`Verify Cancel button behavior in ${this.titleText} modal`, async () => {
      const testCategoryName = `CancelTest_${Date.now()}`;
      await this.fillCategoryName(testCategoryName);
      await this.clickCancelButton();
      await this.verifyCategoryDialogueIsNotVisible();
    });
  }

  async verifyCategoryDialogueIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.categoryDialog, {
      assertionMessage: `Verify ${this.titleText} modal is closed after clicking Cancel`,
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifyCategoryCloseButtonBehavior(): Promise<void> {
    await test.step(`Verify Close button behavior in ${this.titleText} modal`, async () => {
      const testCategoryName = `CloseTest_${Date.now()}`;
      await this.fillCategoryName(testCategoryName);
      await this.clickCloseButton();
      await this.verifyCategoryDialogueIsNotVisible();
    });
  }

  async verifyEditCategoryNameFieldValidation(): Promise<void> {
    if (this.categoryModalForMode !== 'edit') {
      throw new Error('verifyEditCategoryNameFieldValidation can only be called in edit mode');
    }

    await test.step('Verify Edit category name field validation', async () => {
      await this.fillInElement(this.categoryNameInput, '');
      await expect(this.submitButton, 'Verify Save button is disabled when name field is empty').toBeDisabled();
    });
  }
}
