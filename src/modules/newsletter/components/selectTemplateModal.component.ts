import { expect, Locator, Page, test } from '@playwright/test';

import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class SelectTemplateModal extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  // Modal elements
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeButton: Locator;
  readonly backButton: Locator;

  // Search and sort
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly sortByDropdown: Locator;

  // Template items
  readonly templateItems: Locator;
  readonly blankTemplate: Locator;
  readonly minimalTemplate: Locator;

  // Action buttons
  readonly cancelButton: Locator;
  readonly nextButton: Locator;
  readonly showMoreButton: Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    // Modal container
    this.modalDialog = this.page.getByRole('dialog', { name: 'Select a template' });
    this.modalTitle = this.modalDialog.getByRole('heading', { name: 'Select a template' });
    this.closeButton = this.modalDialog.getByRole('button', { name: 'Close' });
    this.backButton = this.modalDialog.getByRole('button', { name: 'Back' });

    // Search and sort
    this.searchInput = this.modalDialog.getByRole('textbox', { name: /search/i });
    this.searchButton = this.modalDialog.getByRole('button', { name: 'Search' });
    this.sortByDropdown = this.modalDialog.getByRole('combobox', { name: 'Sort by' });

    // Template items - using data-testid
    this.templateItems = this.modalDialog.locator('[data-testid="thumbnail-item-wrapper"]');

    // Specific templates
    this.blankTemplate = this.modalDialog
      .getByRole('heading', { name: 'Blank template', exact: true })
      .locator('xpath=ancestor::*[@data-testid="thumbnail-item-wrapper"]');
    this.minimalTemplate = this.modalDialog
      .getByRole('heading', { name: 'Minimal template', exact: true })
      .locator('xpath=ancestor::*[@data-testid="thumbnail-item-wrapper"]');

    // Action buttons
    this.cancelButton = this.modalDialog.getByRole('button', { name: 'Cancel' });
    this.nextButton = this.modalDialog.getByRole('button', { name: 'Next' });
    this.showMoreButton = this.modalDialog.getByRole('button', { name: 'Show more' });
  }

  /**
   * Waits for the template modal to be visible
   */
  async waitForModal(): Promise<void> {
    await test.step('Wait for Select Template modal', async () => {
      await expect(this.modalDialog, 'Template modal should be visible').toBeVisible({ timeout: 15000 });
    });
  }

  /**
   * Selects a template by its name
   * @param templateName - The name of the template to select
   */
  async selectTemplateByName(templateName: string): Promise<void> {
    await test.step(`Select template: ${templateName}`, async () => {
      await this.waitForModal();

      // Find template by heading name and click its container
      const templateHeading = this.modalDialog.getByRole('heading', { name: templateName, exact: true });
      const templateContainer = templateHeading.locator('xpath=ancestor::*[@data-testid="thumbnail-item-wrapper"]');

      await expect(templateContainer, `Template "${templateName}" should be visible`).toBeVisible({ timeout: 10000 });
      await templateContainer.click();
    });
  }

  /**
   * Selects the Blank template
   */
  async selectBlankTemplate(): Promise<void> {
    await test.step('Select Blank template', async () => {
      await this.waitForModal();
      await expect(this.blankTemplate, 'Blank template should be visible').toBeVisible();
      await this.blankTemplate.click();
    });
  }

  /**
   * Clicks the Next button in the modal
   */
  async clickNextButton(): Promise<void> {
    await test.step('Click Next button in template modal', async () => {
      await expect(this.nextButton, 'Next button should be enabled').toBeEnabled();
      await this.clickOnElement(this.nextButton, {
        stepInfo: 'Click Next button',
      });
    });
  }

  /**
   * Clicks the Cancel button
   */
  async clickCancelButton(): Promise<void> {
    await test.step('Click Cancel button', async () => {
      await this.clickOnElement(this.cancelButton, {
        stepInfo: 'Click Cancel button',
      });
    });
  }

  /**
   * Closes the modal
   */
  async closeModal(): Promise<void> {
    await test.step('Close template modal', async () => {
      await this.clickOnElement(this.closeButton, {
        stepInfo: 'Click close button',
      });
    });
  }

  /**
   * Searches for a template
   * @param searchTerm - The search term
   */
  async searchTemplate(searchTerm: string): Promise<void> {
    await test.step(`Search for template: ${searchTerm}`, async () => {
      await this.fillInElement(this.searchInput, searchTerm, {
        stepInfo: 'Enter search term',
      });
      await this.clickOnElement(this.searchButton, {
        stepInfo: 'Click search button',
      });
    });
  }

  /**
   * Verifies the modal is displayed correctly
   */
  async verifyModalIsDisplayed(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.modalTitle, {
      assertionMessage: 'Template modal title should be visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      assertionMessage: 'Search input should be visible',
    });
  }
}
