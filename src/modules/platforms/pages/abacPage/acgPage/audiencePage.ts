import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class AUDIENCE_PAGE extends BasePage {
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

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.AUDIENCE_PAGE) {
    super(page, pageUrl);
    this.labelAudience = page.getByRole('heading', { name: 'Audiences' });
    this.createAudienceButton = page.getByRole('button', { name: 'Create' });
    this.createDropdown = page.getByRole('button', { name: 'Open menu' });
    this.createAudience = page.getByRole('menuitem', { name: 'Create audience' });
    this.createCategory = page.getByRole('menuitem', { name: 'Create category' });
    this.createAudienceWithCSV = page.getByRole('menuitem', { name: 'Create audience with CSV' });
    const categoryDialog = page.getByRole('dialog', { name: 'Create category' });
    this.clickCloseButton = categoryDialog.getByRole('button', { name: 'Close' });
    this.categoryNameInput = categoryDialog.getByRole('textbox', { name: 'Name*' });
    this.addDescriptionButton = categoryDialog.getByRole('button', { name: 'Add description' });
    this.descriptionInput = categoryDialog.getByRole('textbox', { name: 'Description' });
    this.categoryLabel = categoryDialog.getByRole('heading', { name: 'Create category' });
    this.categoryTitleDescription = categoryDialog.getByText(
      'Keep your audiences organized by grouping related audiences within a category.'
    );
    this.categoryName = categoryDialog.getByText('Name');
    this.addCategoryDescriptionButton = categoryDialog.getByRole('button', { name: 'Add description' });
    this.categoryModalCancelButton = categoryDialog.getByRole('button', { name: 'Cancel' });
    this.categoryModalAddButton = page
      .getByRole('dialog', { name: 'Create category' })
      .getByRole('button', { name: 'Add', exact: true });
    this.nameRequiredError = categoryDialog.getByText('Name is a required field');
    this.deleteDescriptionButton = categoryDialog.getByRole('button', { name: 'Delete' });
  }

  // To verify that the Audience page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step(`Verifying the audience page is loaded`, async () => {
      await expect(this.labelAudience, `expecting Audience label to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * To click on Create Audience Button
   * @param buttonType - (Audience Creation Page).
   * @param options - Optional parameters for clicking on the element.
   */
  async clickOnCreateButtonToInitiateAudienceCreationFlowFor(
    createType: 'Create audience' | 'Create category' | 'Create audience with CSV'
  ): Promise<void> {
    await test.step(`Initiate ${createType}`, async () => {
      if (createType === 'Create audience') {
        //await this.verifier.verifyTheElementIsVisible(this.createAudienceButton, {});
        await this.clickOnElement(this.createAudienceButton, {
          timeout: 10_000,
          stepInfo: 'Click on Create audience button',
        });
        return;
      }

      await this.verifier.verifyTheElementIsVisible(this.createDropdown, {});
      await this.clickOnElement(this.createDropdown, {
        timeout: 10_000,
        stepInfo: 'Open Create dropdown',
      });

      if (createType === 'Create category') {
        await this.verifier.verifyTheElementIsVisible(this.createCategory, {});
        await this.clickOnElement(this.createCategory, {
          timeout: 10_000,
          stepInfo: 'Click on Create category menu item',
        });
      } else if (createType === 'Create audience with CSV') {
        await this.verifier.verifyTheElementIsVisible(this.createAudienceWithCSV, {});
        await this.clickOnElement(this.createAudienceWithCSV, {
          timeout: 10_000,
          stepInfo: 'Click on Create audience with CSV menu item',
        });
      }
    });
  }

  /**
   * To click on Cross button at the top right corner of ACG creation popup.
   */
  async clickOnCloseButton(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on close button`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.clickCloseButton, {});
      await this.clickOnElement(this.clickCloseButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  // Category creation helpers
  async openCreateCategoryModal(options?: {
    verifyMaxLength?: boolean;
    verifyAddDescription?: boolean;
    verifyRemoveDescription?: boolean;
    closeAfter?: boolean;
  }): Promise<void> {
    await this.clickOnCreateButtonToInitiateAudienceCreationFlowFor('Create category');
    await this.verifier.verifyTheElementIsVisible(this.categoryLabel, {});
    await this.verifier.verifyTheElementIsVisible(this.categoryTitleDescription, {});
    await this.verifier.verifyTheElementIsVisible(this.categoryName, {});
    await this.verifier.verifyTheElementIsVisible(this.categoryNameInput, {});
    await this.verifier.verifyTheElementIsVisible(this.addCategoryDescriptionButton, {});
    await this.verifier.verifyTheElementIsVisible(this.categoryModalCancelButton, {});
    await this.verifier.verifyTheElementIsVisible(this.clickCloseButton, {});
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

  async fillCategoryName(name: string): Promise<void> {
    await this.fillInElement(this.categoryNameInput, name);
  }

  async addCategoryDescription(description: string): Promise<void> {
    await this.clickOnElement(this.addDescriptionButton, { stepInfo: 'Click on Add description' });
    await this.fillInElement(this.descriptionInput, description);
  }

  async submitCategoryCreation(): Promise<void> {
    await this.clickOnElement(this.categoryModalAddButton, { stepInfo: 'Click Add on Create category modal' });
  }

  async assertCloseButtonIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.clickCloseButton, {
      assertionMessage: 'Verify Close button is visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async clickAddDescriptionAndVerify(): Promise<void> {
    // Wait for any loading/progress overlay to disappear (best-effort)
    await this.page
      .locator('[role="progressbar"]')
      .first()
      .waitFor({ state: 'detached', timeout: 5000 })
      .catch(() => {});

    const alreadyVisible = await this.verifier.isTheElementVisible(this.descriptionInput, { timeout: 1000 });
    if (!alreadyVisible) {
      await this.clickOnElement(this.addCategoryDescriptionButton, { stepInfo: 'Click Add description' });
    }
    await this.verifier.verifyTheElementIsVisible(this.descriptionInput, {});
    await this.verifier.verifyTheElementIsVisible(this.deleteDescriptionButton, {});
  }

  async removeDescriptionAndVerifyAbsence(): Promise<void> {
    await this.clickOnElement(this.deleteDescriptionButton, { stepInfo: 'Click Delete description' });
    await this.verifier.verifyTheElementIsNotVisible(this.descriptionInput, {});
  }

  async verifyNameFieldMaxLength(): Promise<void> {
    await test.step('Verify Name field max length is 100', async () => {
      const over = 'A'.repeat(120);

      await this.fillInElement(this.categoryNameInput, ''); // clear
      await this.typeInElement(this.categoryNameInput, over); // type 120 chars

      const v1 = await this.categoryNameInput.inputValue();
      expect(v1.length).toBe(100);
      expect(v1).toBe(over.slice(0, 100)); // truncated exactly

      // Try typing more; value should not change
      await this.typeInElement(this.categoryNameInput, 'B'.repeat(5));
      const v2 = await this.categoryNameInput.inputValue();
      expect(v2).toBe(v1);

      const maxAttr = await this.getElementAttribute(this.categoryNameInput, 'maxlength');
      if (maxAttr) expect(Number(maxAttr)).toBe(100);
    });
  }

  async verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(): Promise<void> {
    await test.step('Verify Name field accepts letters, numbers, and special characters', async () => {
      const sample = 'Category 123 _-.,@#$()&[]{}:;!?';
      await this.fillInElement(this.categoryNameInput, '');
      await this.typeInElement(this.categoryNameInput, sample);
      const value = await this.categoryNameInput.inputValue();
      expect(value).toBe(sample);
      await expect(this.categoryModalAddButton).toBeEnabled();

      // Also verify Description field accepts same character set
      await this.clickAddDescriptionAndVerify();
      await this.fillInElement(this.descriptionInput, '');
      await this.typeInElement(this.descriptionInput, sample);
      const descValue = await this.descriptionInput.inputValue();
      expect(descValue).toBe(sample);
    });
  }

  async verifyDescriptionFieldMaxLength(): Promise<void> {
    await test.step('Verify Description field max length', async () => {
      await this.clickAddDescriptionAndVerify();
      const maxAttr = await this.getElementAttribute(this.descriptionInput, 'maxlength');
      const max = maxAttr ? Number(maxAttr) : 1024;

      const over = 'D'.repeat(max + 50);
      await this.fillInElement(this.descriptionInput, '');
      await this.typeInElement(this.descriptionInput, over);

      const v1 = await this.descriptionInput.inputValue();
      expect(v1.length).toBe(max);
      expect(v1).toBe(over.slice(0, max));

      await this.typeInElement(this.descriptionInput, 'E'.repeat(10));
      const v2 = await this.descriptionInput.inputValue();
      expect(v2).toBe(v1);
    });
  }
}
