import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

// Component for handling CSV audience upload functionality
export class CsvAudienceModule extends BaseComponent {
  // Locators - initialized in constructor following categoryModal pattern
  csvUploadDialog: Locator;
  audienceNameInput: Locator;
  addDescriptionButton: Locator;
  audienceDescriptionInput: Locator;
  categoryDropdown: Locator;
  categoryOptions: Locator;
  selectFromComputerButton: Locator;
  fileInput: Locator;
  createButton: Locator;
  // Error validation locators based on codegen
  downloadExampleCsvButton: Locator;
  cancelButton: Locator;
  deleteUploadedFileButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators in constructor (following categoryModal pattern)
    this.csvUploadDialog = page.locator('[role="dialog"]').filter({ hasText: 'Create audience with CSV' });

    // Based on actual codegen output:
    this.audienceNameInput = this.csvUploadDialog.getByRole('textbox', { name: 'Name*' });
    this.addDescriptionButton = this.csvUploadDialog.getByRole('button', { name: 'Add description' });
    this.audienceDescriptionInput = this.csvUploadDialog.getByRole('textbox', { name: 'Description' });
    this.categoryDropdown = this.csvUploadDialog.locator('.css-19bb58m'); // From codegen
    this.categoryOptions = page.getByRole('menuitem'); // Category options in dropdown
    this.selectFromComputerButton = this.csvUploadDialog.getByRole('button', { name: 'Select from computer' });
    this.fileInput = this.csvUploadDialog.locator('input[type="file"]'); // Hidden file input
    this.createButton = this.csvUploadDialog.getByRole('button', { name: 'Create' });

    // Error validation locators based on codegen output
    this.downloadExampleCsvButton = this.csvUploadDialog.getByRole('button', { name: 'Download example CSV' });
    this.cancelButton = this.csvUploadDialog.getByRole('button', { name: 'Cancel' });
    this.deleteUploadedFileButton = this.csvUploadDialog.getByRole('button', { name: 'Remove' }); // Delete uploaded file button
  }

  // Fill audience name input (from codegen: Name*)
  async fillAudienceName(name: string): Promise<void> {
    await this.fillInElement(this.audienceNameInput, name, {
      stepInfo: `Fill audience name: ${name}`,
    });
  }

  // Fill description field using BasePage method for consistency
  async fillInDescription(description: string): Promise<void> {
    // Ensure description field is visible first
    const isDescriptionVisible = await this.audienceDescriptionInput.isVisible({ timeout: 1000 }).catch(() => false);
    if (!isDescriptionVisible) {
      await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click Add description button' });
    }

    // Use the existing addDescription method from BasePage
    await this.addDescription(this.audienceDescriptionInput, description, `Fill description: ${description}`);
  }

  // Select category from dropdown with typing and selection
  async selectCategory(categoryName: string): Promise<void> {
    // Step 1: Click to open dropdown
    await this.clickOnElement(this.categoryDropdown, {
      stepInfo: 'Click category dropdown to open',
    });

    // Step 2: Type category name to filter options
    const categoryInput = this.page.locator('#react-select-2-input');
    await this.fillInElement(categoryInput, categoryName, {
      stepInfo: `Type category name: ${categoryName}`,
    });

    // Step 3: Click the filtered category option
    const categoryOption = this.categoryOptions.filter({ hasText: categoryName });
    await this.clickOnElement(categoryOption, {
      stepInfo: `Select category: ${categoryName}`,
    });
  }

  // Upload CSV file using framework's file upload method
  async uploadCsvFile(filePath: string): Promise<void> {
    await this.openFileChooserAndSetFiles(() => this.clickOnElement(this.selectFromComputerButton), filePath, {
      stepInfo: `Upload CSV file: ${filePath}`,
    });
  }

  // Click create button to submit
  async clickCreate(): Promise<void> {
    await this.clickOnElement(this.createButton, {
      stepInfo: 'Click Create button to submit CSV audience',
    });
  }

  // Error validation methods - reusing same locator as categoryModal
  // Generic error validation method - pass any error message
  async verifyErrorMessage(errorMessage: string): Promise<void> {
    const errorLocator = this.csvUploadDialog.getByText(errorMessage);
    await this.verifier.verifyTheElementIsVisible(errorLocator, {
      assertionMessage: `Verify "${errorMessage}" error is visible in CSV upload modal`,
    });
  }

  async clickDownloadExampleCsv(): Promise<void> {
    await this.downloadFileWithCleanup(
      () =>
        this.clickOnElement(this.downloadExampleCsvButton, {
          stepInfo: 'Click Download example CSV button',
        }),
      {
        stepInfo: 'Download example CSV with automatic cleanup',
        cleanup: true,
      }
    );
  }

  async clickCancel(): Promise<void> {
    await super.clickCancelButton(this.cancelButton, 'Click Cancel button to close CSV upload modal');
  }

  // Remove/delete uploaded CSV file
  async removeUploadedFile(): Promise<void> {
    await this.clickOnElement(this.deleteUploadedFileButton, {
      stepInfo: 'Click delete button to remove uploaded CSV file',
    });
  }

  // Helper methods to trigger validation errors
  async triggerNameValidation(): Promise<void> {
    // Click on name input then click elsewhere to trigger validation
    await this.clickOnElement(this.audienceNameInput, {
      stepInfo: 'Click on audience name input',
    });
    // Click outside the input to trigger validation
    await this.clickOnElement(this.csvUploadDialog, {
      stepInfo: 'Click outside name input to trigger validation',
    });
  }

  async triggerCategoryValidation(): Promise<void> {
    // Click on category dropdown to focus it
    await this.clickOnElement(this.categoryDropdown, {
      stepInfo: 'Click on category dropdown',
    });
    // Click on audience name field to close dropdown and trigger validation
    await this.clickOnElement(this.audienceNameInput, {
      stepInfo: 'Click on audience name to close category dropdown and trigger validation',
    });
  }
}
