import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class SurveyBlockModal extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  // Modal elements
  readonly modalDialog: Locator;
  readonly browseSurveyButton: Locator;

  // Search
  readonly searchInput: Locator;

  // Filter
  readonly filterDropdown: Locator;
  readonly typeSelect: Locator;

  // Survey items
  readonly surveyItems: Locator;
  readonly firstCheckbox: Locator;

  // Reset button
  readonly resetFiltersButton: Locator;

  // Add button
  readonly addButton: Locator;

  // Survey in editor canvas (after adding)
  readonly surveyInEditorCanvas: Locator;

  // Remove survey block button
  readonly removeSurveyBlockButton: Locator;

  // Preview iframe
  readonly previewIframe: Locator;

  // SortableList container (for survey data assertions)
  readonly sortableList: Locator;
  readonly sortableListParagraphs: Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    // Modal dialog - find by heading inside dialog
    this.modalDialog = this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: 'Surveys', level: 1 }),
    });

    // Browse survey button
    this.browseSurveyButton = this.page.getByRole('button', { name: /browse.*survey/i });

    // Search input - using id attribute for better reliability
    this.searchInput = this.modalDialog.locator('#term');

    // Filter dropdown - scoped to dialog, the combobox for survey type selection
    this.filterDropdown = this.modalDialog.getByRole('combobox');

    // Type select - using the Cypress selector pattern
    this.typeSelect = this.page.locator('#surveyMenuPortal #type');

    // Survey items - scoped to dialog
    this.surveyItems = this.modalDialog.locator('listitem');

    // First checkbox
    this.firstCheckbox = this.modalDialog.locator('[type="checkbox"]').first();

    // Reset filters button
    this.resetFiltersButton = this.modalDialog.getByRole('button', { name: 'Reset filters' });

    // Add button - text can be "Add" or "Add (1)" etc. depending on selection
    this.addButton = this.modalDialog.getByRole('button', { name: /^Add/ });

    // Survey in editor canvas - used to verify survey was successfully added
    // Look for survey heading (level 2) or button with survey details
    this.surveyInEditorCanvas = this.page
      .getByRole('heading', { level: 2 })
      .or(this.page.getByRole('button').filter({ hasText: /Employee engagement|Testing/i }))
      .first();

    // Remove survey block button - button inside SortableList (first one)
    this.removeSurveyBlockButton = this.page.locator('[class*="SortableList"] button').first();

    // Preview iframe
    this.previewIframe = this.page.locator('.Preview_frame--akMgz, [class*="Preview_frame"]');

    // SortableList container (for survey data assertions)
    this.sortableList = this.page.locator('[class*="SortableList"]').first();
    this.sortableListParagraphs = this.sortableList.locator('p');
  }

  /**
   * Clicks on the browse survey button
   */
  async clickOnBrowseSurveyButton(): Promise<void> {
    await test.step('Click on browse survey button', async () => {
      await this.clickOnElement(this.browseSurveyButton, {
        stepInfo: 'Click browse survey button',
      });
      // Wait for modal to be visible
      await expect(this.modalDialog, 'Survey modal should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Searches for a survey by name in the modal
   * Clicks the first checkbox and asserts reset button
   */
  async searchSurveyName(): Promise<void> {
    await test.step('Search survey name', async () => {
      await this.clickOnElement(this.firstCheckbox, {
        stepInfo: 'Click first checkbox',
        force: true,
      });
      await this.assertResetButton();
    });
  }

  /**
   * Asserts that the reset button is visible
   */
  async assertResetButton(): Promise<void> {
    await test.step('Assert reset button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.resetFiltersButton, {
        assertionMessage: 'Reset filters button should be visible',
      });
    });
  }

  /**
   * Applies a survey filter
   * @param filterName - The name of the filter to apply
   */
  async applySurveyFilter(filterName: string): Promise<void> {
    await test.step(`Apply survey filter: ${filterName}`, async () => {
      // Try selectOption first, if it fails, use click approach
      try {
        await this.typeSelect.selectOption(filterName, { timeout: TIMEOUTS.VERY_SHORT });
      } catch {
        // If selectOption fails, click the select and then click the option by text
        await this.clickOnElement(this.typeSelect, {
          stepInfo: 'Click type select dropdown',
        });
        const option = this.page.getByText(filterName, { exact: true }).first();
        await this.clickOnElement(option, {
          stepInfo: `Select filter option: ${filterName}`,
        });
      }
    });
  }

  /**
   * Adds one survey and asserts it was added to the survey block
   * Clicks the first checkbox and then clicks Add button
   */
  async selectMultipleSurvey(): Promise<void> {
    await test.step('Add one survey and assert it was added', async () => {
      // Click the first checkbox
      await this.clickOnElement(this.firstCheckbox, {
        stepInfo: 'Click first checkbox',
        force: true,
      });
      // Click Add button
      await this.clickOnAddButton();
      // Wait for modal to close
      await expect(this.modalDialog, 'Modal should close after adding survey').toBeHidden({
        timeout: TIMEOUTS.SHORT,
      });
      // Assert survey was added to the survey block
      await this.assertSurveyAddedInBlock();
    });
  }

  /**
   * Asserts that the survey was successfully added to the survey block
   */
  async assertSurveyAddedInBlock(): Promise<void> {
    await test.step('Assert survey was added in survey block', async () => {
      await this.verifier.verifyTheElementIsVisible(this.surveyInEditorCanvas, {
        assertionMessage:
          'Survey should be successfully added to the survey block - survey should be visible in editor canvas',
      });
    });
  }

  /**
   * Clicks on the Add button
   */
  async clickOnAddButton(): Promise<void> {
    await test.step('Click on Add button', async () => {
      // Wait for Add button to be enabled (it's disabled until a survey is selected)
      await expect(this.addButton, 'Add button should be enabled').toBeEnabled({
        timeout: TIMEOUTS.SHORT,
      });
      await this.clickOnElement(this.addButton, {
        stepInfo: 'Click Add button',
      });
    });
  }

  /**
   * Asserts survey and adds survey block with filter
   * @param filterName - The name of the filter to apply
   */
  async assertSurveyAndAddServeyBlock(filterName: string): Promise<void> {
    await test.step(`Assert survey and add survey block with filter: ${filterName}`, async () => {
      await this.clickOnBrowseSurveyButton();
      await this.applySurveyFilter(filterName);
      // selectMultipleSurvey() will click the checkbox, so we just need to call it
      await this.selectMultipleSurvey();
    });
  }

  /**
   * Removes the added survey block
   */
  async removeSurveyBlock(): Promise<void> {
    await test.step('Remove survey block', async () => {
      await this.clickOnElement(this.removeSurveyBlockButton, {
        stepInfo: 'Click remove survey block button',
        force: true,
      });
    });
  }

  /**
   * Previews the survey block and validates survey data in the iframe
   */
  async previewSurveyBlock(): Promise<void> {
    await test.step('Preview survey block and validate survey data', async () => {
      // Wait for iframe to be attached
      await expect(this.previewIframe, 'Preview iframe should be loaded').toBeAttached({
        timeout: TIMEOUTS.SHORT,
      });

      // Get the iframe using frameLocator
      const frame = this.page.frameLocator('iframe').first();

      // Find all elements with role="presentation" in the iframe
      const presentationElements = frame.locator('[role="presentation"]');

      // Wait a bit for iframe content to load
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Get count of presentation elements
      const count = await presentationElements.count();

      // Verify buttons are visible in each presentation element, or verify Start survey link if no presentation elements
      if (count > 0) {
        let foundButtons = false;
        for (let i = 0; i < count; i++) {
          const presentationElement = presentationElements.nth(i);
          const button = presentationElement.locator('button');
          const buttonCount = await button.count();
          if (buttonCount > 0) {
            await this.verifier.verifyTheElementIsVisible(button.first(), {
              assertionMessage: `Button should be visible in presentation element ${i + 1}`,
            });
            foundButtons = true;
          }
        }
        // If no buttons found in presentation elements, verify Start survey link instead
        if (!foundButtons) {
          const startSurveyLink = frame.getByRole('link', { name: /start survey/i }).first();
          await this.verifier.verifyTheElementIsVisible(startSurveyLink, {
            assertionMessage: 'Start survey link should be visible in preview iframe',
          });
        }
      } else {
        // If no presentation elements, verify the survey content directly (Start survey link)
        const startSurveyLink = frame.getByRole('link', { name: /start survey/i }).first();
        await this.verifier.verifyTheElementIsVisible(startSurveyLink, {
          assertionMessage: 'Start survey link should be visible in preview iframe',
        });
      }
    });
  }

  /**
   * Asserts all data of the survey block in the editor
   * Verifies that the SortableList container and its paragraph elements are visible
   */
  async assertAllDataOfSurvey(): Promise<void> {
    await test.step('Assert all data of survey block', async () => {
      // Assert SortableList container is visible
      await this.verifier.verifyTheElementIsVisible(this.sortableList, {
        assertionMessage: 'SortableList container should be visible',
      });

      // Assert at least one paragraph is visible (check first one)
      await this.verifier.verifyTheElementIsVisible(this.sortableListParagraphs.first(), {
        assertionMessage: 'Survey block paragraphs should be visible',
      });

      // Assert first paragraph is visible
      await this.verifier.verifyTheElementIsVisible(this.sortableListParagraphs.first(), {
        assertionMessage: 'First paragraph in survey block should be visible',
      });

      // Assert last paragraph is visible
      await this.verifier.verifyTheElementIsVisible(this.sortableListParagraphs.last(), {
        assertionMessage: 'Last paragraph in survey block should be visible',
      });
    });
  }
}
