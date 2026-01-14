import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

// Block types supported
export type BlockType =
  | 'Button'
  | 'Divider'
  | 'Embed'
  | 'Image'
  | 'Text'
  | 'Spacer'
  | 'Video'
  | 'Content'
  | 'People'
  | 'Recognition'
  | 'Sites'
  | 'Surveys';

export class NewsletterEditorPage extends BasePage {
  // Newsletter name modal
  readonly newsletterNameInput: Locator;
  readonly nameModalNextButton: Locator;

  // Blocks panel
  readonly blocksTab: Locator;

  // Block locator function
  readonly getBlockLocator: (blockType: BlockType) => Locator;

  // Create button (from home page)
  readonly createButton: Locator;

  // Additional locators for methods
  readonly backArrowLink: Locator;
  readonly previewButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_NEWSLETTER_PAGE);

    // Newsletter name modal
    this.newsletterNameInput = this.page.locator('#name');
    this.nameModalNextButton = this.page.getByRole('button', { name: 'Next' });

    // Blocks panel tabs
    this.blocksTab = this.page.getByRole('tab', { name: 'Blocks' });

    // Block locator function - dynamically generates locator for any block type
    this.getBlockLocator = (blockType: BlockType) => this.page.locator(`[data-chockablock-item-id="${blockType}"]`);

    // Create button (it's actually a link styled as button)
    this.createButton = this.page.getByRole('link', { name: 'Create', exact: true });

    // Additional locators for methods
    this.backArrowLink = this.page.getByTestId('i-arrowLeft');

    // Preview button
    this.previewButton = this.page.getByRole('button', { name: /preview/i });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify newsletter listing page is loaded', async () => {
      // Wait for URL to confirm navigation completed
      await this.page.waitForURL(/employee-newsletter/, { timeout: TIMEOUTS.SHORT });

      // Wait for network idle to ensure content is loaded
      await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.SHORT });

      // Wait a bit for dynamic content to render
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Dismiss any blocking dialogs (e.g., survey prompts)
      await this.dismissSurveyPromptIfVisible();

      // Use the Create button as the primary verification element (more reliable than heading)
      // This matches the pattern used in NewsletterHomePagePage which uses searchInput
      await this.verifier.verifyTheElementIsVisible(this.createButton, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Newsletter listing page should be loaded - Create button not visible',
      });
    });
  }

  /**
   * Dismisses the survey participation prompt if it's visible
   */
  async dismissSurveyPromptIfVisible(): Promise<void> {
    const surveyDialog = this.page.getByRole('dialog', { name: 'Survey participation prompt' });
    const dismissButton = surveyDialog.getByRole('button', { name: 'Dismiss' });

    try {
      // Wait briefly for dialog to appear, then dismiss it
      await surveyDialog.waitFor({ state: 'visible', timeout: TIMEOUTS.VERY_SHORT });
      await test.step('Dismiss survey prompt dialog', async () => {
        await dismissButton.click();
        await surveyDialog.waitFor({ state: 'hidden', timeout: TIMEOUTS.VERY_SHORT });
      });
    } catch {
      // Dialog not present, continue
    }
  }

  /**
   * Verifies the newsletter EDITOR is loaded (after creating/editing a newsletter)
   */
  async verifyEditorIsLoaded(): Promise<void> {
    await test.step('Verify newsletter editor is loaded', async () => {
      // Check for the Blocks tab which is unique to the editor
      await expect(this.blocksTab, 'Newsletter editor should be loaded').toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Clicks the Create/New button to start creating a newsletter
   */
  async clickCreateButton(): Promise<void> {
    await test.step('Click Create button', async () => {
      await expect(this.createButton, 'Create button should be visible').toBeVisible({ timeout: TIMEOUTS.SHORT });
      await this.clickOnElement(this.createButton, {
        stepInfo: 'Click Create button',
      });
    });
  }

  /**
   * Enters the newsletter name in the name input field
   * @param newsletterName - The name for the newsletter
   */
  async enterNewsletterName(newsletterName: string): Promise<void> {
    await test.step(`Enter newsletter name: ${newsletterName}`, async () => {
      await expect(this.newsletterNameInput, 'Newsletter name input should be visible').toBeVisible();
      await this.newsletterNameInput.clear();
      await this.fillInElement(this.newsletterNameInput, newsletterName, {
        stepInfo: 'Enter newsletter name',
      });
    });
  }

  /**
   * Clicks the Next button on the newsletter name modal
   */
  async clickNextButtonOnNameModal(): Promise<void> {
    await test.step('Click Next button on name modal', async () => {
      await this.clickOnElement(this.nameModalNextButton, {
        stepInfo: 'Click Next button',
      });
    });
  }

  /**
   * Verifies all general blocks are visible
   */
  async verifyGeneralBlocksAreVisible(): Promise<void> {
    await test.step('Verify general blocks are visible', async () => {
      const generalBlocks: BlockType[] = ['Button', 'Image', 'Text'];

      for (const blockType of generalBlocks) {
        const assertionMessage = `${blockType} block should be visible`;
        await this.verifier.verifyTheElementIsVisible(this.getBlockLocator(blockType), {
          assertionMessage,
        });
      }
    });
  }

  /**
   * Verifies all smart blocks are visible
   */
  async verifySmartBlocksAreVisible(): Promise<void> {
    await test.step('Verify smart blocks are visible', async () => {
      const smartBlocks: BlockType[] = ['Content', 'People'];

      for (const blockType of smartBlocks) {
        const assertionMessage = `${blockType} block should be visible`;
        await this.verifier.verifyTheElementIsVisible(this.getBlockLocator(blockType), {
          assertionMessage,
        });
      }
    });
  }

  /**
   * Clicks the Back arrow link to return to the employee newsletter page
   */
  async clickBackToEmployeeNewsletterPage(): Promise<void> {
    await test.step('Click Back to return to newsletter list', async () => {
      // Dismiss any blocking dialogs (e.g., survey prompts)
      await this.dismissSurveyPromptIfVisible();
      await this.clickOnElement(this.backArrowLink, {
        stepInfo: 'Click back arrow link',
      });
      // Wait for navigation to complete
      await this.page.waitForURL(/employee-newsletter/, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Clicks the Preview button to open the newsletter preview
   */
  async clickPreviewButton(): Promise<void> {
    await test.step('Click Preview button', async () => {
      await this.clickOnElement(this.previewButton, {
        stepInfo: 'Click Preview button',
      });
    });
  }
}
