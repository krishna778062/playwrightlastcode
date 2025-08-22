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
}
