import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export interface ISiteCategoriesActions {
  clickAddCategoryButton: () => Promise<void>;
  fillCategoryName: (categoryName: string) => Promise<void>;
  clickAddButton: () => Promise<void>;
  deleteCategoryByName: (categoryName: string) => Promise<void>;
  createCategoryWithName: (categoryName: string) => Promise<void>;
}

export interface ISiteCategoriesAssertions {
  verifyCategoryCreatedSuccessfully: (partialCategoryName: string) => Promise<void>;
  verifyCategoryNameFieldLengthValidation: () => Promise<void>;
  verifyCategoryNameFieldAcceptsMaxCharacters: (maxCharacters: number) => Promise<void>;
  verifyCategoryNameFieldRejectsExcessCharacters: (excessCharacters: number) => Promise<void>;
  verifyPartialTextVisibleInListing: (partialText: string) => Promise<void>;
}

export class SiteCategoriesPage extends BasePage implements ISiteCategoriesActions, ISiteCategoriesAssertions {
  readonly addCategoryButton: Locator;
  readonly categoryNameTextbox: Locator;
  readonly addButton: Locator;
  readonly optionsMenuPanel: Locator;
  readonly categoryListingTable: Locator;
  readonly deleteButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SITE_CATEGORIES_PAGE);
    this.addCategoryButton = page.locator('button:has-text("Add category")');
    this.categoryNameTextbox = page.getByRole('textbox', { name: 'Category name...' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.optionsMenuPanel = page.locator('.OptionsMenu-panel-main');
    this.categoryListingTable = page.locator('table, .table, [role="table"], .category-list, .listing');
    this.deleteButton = page.locator('*:has-text("Delete")');
    this.confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
  }

  get actions(): ISiteCategoriesActions {
    return this;
  }

  get assertions(): ISiteCategoriesAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Site Categories page is loaded', async () => {
      // Framework standard: wait for the key element with default timeout
      await this.verifier.verifyTheElementIsVisible(this.addCategoryButton, {
        assertionMessage: 'Add category button should be visible',
      });
    });
  }

  /**
   * Clicks the Add Category button
   */
  async clickAddCategoryButton(): Promise<void> {
    await test.step('Click Add Category button', async () => {
      await this.clickOnElement(this.addCategoryButton);
    });
  }

  /**
   * Fills the category name field
   * @param categoryName - The category name to fill
   */
  async fillCategoryName(categoryName: string): Promise<void> {
    await test.step(`Fill category name: ${categoryName.substring(0, 50)}...`, async () => {
      await this.fillInElement(this.categoryNameTextbox, categoryName);
    });
  }

  /**
   * Clicks the Add button to save category
   */
  async clickAddButton(): Promise<void> {
    await test.step('Click Add button to save category', async () => {
      await this.clickOnElement(this.addButton);
    });
  }

  /**
   * Creates a category with the given name (complete workflow)
   * @param categoryName - The category name to create
   */
  async createCategoryWithName(categoryName: string): Promise<void> {
    await test.step(`Create category with name: ${categoryName.substring(0, 50)}...`, async () => {
      await this.clickAddCategoryButton();
      await this.fillCategoryName(categoryName);
      await this.clickAddButton();
    });
  }

  /**
   * Verifies that category name field accepts up to maximum characters
   * @param maxCharacters - Maximum allowed characters
   */
  async verifyCategoryNameFieldAcceptsMaxCharacters(maxCharacters: number): Promise<void> {
    await test.step(`Verify category name field accepts up to ${maxCharacters} characters`, async () => {
      // Generate test text with exactly maxCharacters
      const testText = 'A'.repeat(maxCharacters);

      await this.clickAddCategoryButton();
      await this.fillCategoryName(testText);

      // Verify the field contains exactly maxCharacters
      const actualValue = await this.categoryNameTextbox.inputValue();
      if (actualValue.length === maxCharacters) {
        console.log(`Category name field correctly accepts ${maxCharacters} characters`);
      } else {
        throw new Error(`Category name field should accept ${maxCharacters} characters, but got ${actualValue.length}`);
      }
    });
  }

  /**
   * Verifies that category name field rejects characters beyond the limit
   * @param excessCharacters - Number of characters beyond the limit
   */
  async verifyCategoryNameFieldRejectsExcessCharacters(excessCharacters: number): Promise<void> {
    await test.step(`Verify category name field rejects characters beyond ${excessCharacters} limit`, async () => {
      // Generate test text that exceeds the limit
      const testText = 'A'.repeat(100 + excessCharacters);

      // Modal is already open, just fill the field
      await this.fillCategoryName(testText);

      // Verify the field is limited to 100 characters
      const actualValue = await this.categoryNameTextbox.inputValue();
      if (actualValue.length <= 100) {
        console.log(`Category name field correctly limited to ${actualValue.length} characters (max 100)`);
      } else {
        throw new Error(`Category name field should be limited to 100 characters, but got ${actualValue.length}`);
      }
    });
  }

  /**
   * Verifies partial text is visible in the category listing
   * @param partialText - Partial text to verify in listing
   */
  async verifyPartialTextVisibleInListing(partialText: string): Promise<void> {
    await test.step(`Verify partial text "${partialText}" is visible in category listing`, async () => {
      // Target only the category listing table area
      const categoryElement = this.categoryListingTable.filter({ hasText: partialText.substring(0, 30) }).first();

      console.log(`Looking for partial text: "${partialText.substring(0, 30)}..."`);

      // Debug: Show what we're actually finding
      const elementCount = await this.categoryListingTable.count();
      console.log(`Found ${elementCount} potential listing elements`);

      await this.verifier.verifyTheElementIsVisible(categoryElement, {
        assertionMessage: `Category with partial text '${partialText.substring(0, 30)}...' should be visible in listing`,
        timeout: 15000,
      });

      console.log(`Partial text "${partialText.substring(0, 30)}..." is visible in category listing`);
    });
  }

  /**
   * Verifies that category was created successfully
   * @param partialCategoryName - Partial category name to verify
   */
  async verifyCategoryCreatedSuccessfully(partialCategoryName: string): Promise<void> {
    await test.step(`Verify category created: ${partialCategoryName.substring(0, 50)}...`, async () => {
      // Target only the category listing table area
      const categoryElement = this.categoryListingTable
        .filter({ hasText: partialCategoryName.substring(0, 30) })
        .first();

      console.log(`Looking for category with text: "${partialCategoryName.substring(0, 30)}..."`);

      try {
        await this.verifier.verifyTheElementIsVisible(categoryElement, {
          assertionMessage: `Category with partial text '${partialCategoryName.substring(0, 30)}...' should be visible`,
          timeout: 15000,
        });
      } catch (error) {
        // Debug: Check what's actually visible in the listing when assertion fails
        const allTextInListing = await this.categoryListingTable.textContent();
        console.log(`Current listing content: ${allTextInListing?.substring(0, 200)}...`);
        throw error;
      }

      console.log(`Category found and verified in listing!`);
    });
  }

  /**
   * Verifies category name field length validation
   */
  async verifyCategoryNameFieldLengthValidation(): Promise<void> {
    await test.step('Verify category name field length validation', async () => {
      // Check if the field has character limit validation
      const fieldValue = await this.categoryNameTextbox.inputValue();

      // Field should not allow more than 100 characters
      if (fieldValue.length <= 100) {
        console.log(`Category name field properly limited to ${fieldValue.length} characters (max 100)`);
      } else {
        throw new Error(`Category name field allows ${fieldValue.length} characters, should be limited to 100`);
      }

      // Additional validation: Check if Add button is enabled/disabled based on input
      if (fieldValue.length === 0) {
        // For empty input, button should be disabled
        const isEnabled = await this.addButton.isEnabled();
        if (isEnabled) {
          throw new Error('Add button should be disabled for empty input');
        }
        console.log('Add button properly disabled for empty input');
      } else {
        await this.verifier.verifyTheElementIsEnabled(this.addButton, {
          assertionMessage: 'Add button should be enabled for valid input',
        });
      }
    });
  }

  /**
   * Deletes a category by name (cleanup)
   * @param categoryName - The category name to delete
   */
  async deleteCategoryByName(categoryName: string): Promise<void> {
    await test.step(`Delete category: ${categoryName.substring(0, 50)}...`, async () => {
      console.log(`Starting cleanup: Attempting to delete category "${categoryName.substring(0, 30)}..."`);

      // Find the category row and click delete
      const categoryRow = this.categoryListingTable.filter({ hasText: categoryName.substring(0, 30) }).first();

      // Click on the delete button for this category
      const deleteButton = categoryRow.locator(this.deleteButton).first();
      await this.clickOnElement(deleteButton);

      // Handle confirmation dialog if it appears
      if (await this.confirmButton.isVisible()) {
        await this.clickOnElement(this.confirmButton);
      }

      console.log(`Category deletion completed`);
    });
  }
}
