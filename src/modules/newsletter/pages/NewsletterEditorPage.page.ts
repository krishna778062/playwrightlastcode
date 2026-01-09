import { expect, Locator, Page, Response, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class NewsletterEditorPage extends BasePage {
  // Header controls
  readonly backButton: Locator;
  readonly newsletterTitle: Locator;
  readonly previewButton: Locator;
  readonly saveButton: Locator;
  readonly nextButton: Locator;
  readonly moreOptionsButton: Locator;

  // View in browser
  readonly viewInBrowserLink: Locator;

  // Newsletter name modal
  readonly newsletterNameInput: Locator;
  readonly nameModalNextButton: Locator;

  // Blocks panel
  readonly blocksTab: Locator;
  readonly layoutsTab: Locator;
  readonly generalBlocksSection: Locator;
  readonly smartBlocksSection: Locator;

  // General blocks
  readonly buttonBlock: Locator;
  readonly dividerBlock: Locator;
  readonly embedBlock: Locator;
  readonly imageBlock: Locator;
  readonly textBlock: Locator;
  readonly spacerBlock: Locator;
  readonly videoBlock: Locator;

  // Smart blocks
  readonly contentBlock: Locator;
  readonly peopleBlock: Locator;
  readonly recognitionBlock: Locator;
  readonly sitesBlock: Locator;
  readonly surveysBlock: Locator;

  // Editor canvas
  readonly editorCanvas: Locator;
  readonly contentPlaceholder: Locator;

  // Create button (from home page)
  readonly createButton: Locator;

  // Additional locators for methods
  readonly backArrowLink: Locator;
  readonly threeDotButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_NEWSLETTER_PAGE);

    // Header controls
    this.backButton = this.page
      .locator('button')
      .filter({ has: this.page.locator('svg, img') })
      .first();
    this.newsletterTitle = this.page.getByRole('heading').first();
    this.previewButton = this.page.getByRole('button', { name: 'Preview' });
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.nextButton = this.page.getByRole('button', { name: 'Next' });
    this.moreOptionsButton = this.page.getByRole('button', { name: /more|options/i });

    // View in browser
    this.viewInBrowserLink = this.page.getByText('View in browser');

    // Newsletter name modal
    this.newsletterNameInput = this.page.locator('#name');
    this.nameModalNextButton = this.page.getByRole('button', { name: 'Next' });

    // Blocks panel tabs
    this.blocksTab = this.page.getByRole('tab', { name: 'Blocks' });
    this.layoutsTab = this.page.getByRole('tab', { name: 'Layouts' });

    // Blocks sections
    this.generalBlocksSection = this.page.getByText('General blocks');
    this.smartBlocksSection = this.page.getByText('Smart blocks');

    // General blocks - using data-chockablock-item-id
    this.buttonBlock = this.page.locator('[data-chockablock-item-id="Button"]');
    this.dividerBlock = this.page.locator('[data-chockablock-item-id="Divider"]');
    this.embedBlock = this.page.locator('[data-chockablock-item-id="Embed"]');
    this.imageBlock = this.page.locator('[data-chockablock-item-id="Image"]');
    this.textBlock = this.page.locator('[data-chockablock-item-id="Text"]');
    this.spacerBlock = this.page.locator('[data-chockablock-item-id="Spacer"]');
    this.videoBlock = this.page.locator('[data-chockablock-item-id="Video"]');

    // Smart blocks
    this.contentBlock = this.page.locator('[data-chockablock-item-id="Content"]');
    this.peopleBlock = this.page.locator('[data-chockablock-item-id="People"]');
    this.recognitionBlock = this.page.locator('[data-chockablock-item-id="Recognition"]');
    this.sitesBlock = this.page.locator('[data-chockablock-item-id="Sites"]');
    this.surveysBlock = this.page.locator('[data-chockablock-item-id="Surveys"]');

    // Editor canvas
    this.editorCanvas = this.page.locator('[class*="editor"], [class*="canvas"]').first();
    this.contentPlaceholder = this.page.getByText('Newsletter content');

    // Create button (it's actually a link styled as button)
    this.createButton = this.page.getByRole('link', { name: 'Create', exact: true });

    // Additional locators for methods
    this.backArrowLink = this.page.getByTestId('i-arrowLeft');
    this.threeDotButton = this.page.getByRole('button', { name: 'Show more' }).first();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify newsletter listing page is loaded', async () => {
      // Wait for URL to confirm navigation completed
      await this.page.waitForURL(/employee-newsletter/, { timeout: TIMEOUTS.SHORT });

      // Dismiss any blocking dialogs (e.g., survey prompts)
      await this.dismissSurveyPromptIfVisible();

      // Use the Create button as the primary verification element (more reliable than heading)
      // This matches the pattern used in NewsletterHomePagePage which uses searchInput
      await this.verifier.verifyTheElementIsVisible(this.createButton, {
        timeout: TIMEOUTS.SHORT,
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
   * Clicks the Next button and waits for newsletter API response
   * Returns the response for further processing
   */
  async clickNextAndWaitForNewsletterResponse(): Promise<Response> {
    return await test.step('Click Next and wait for newsletter response', async () => {
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('newsletters') && response.status() === 200,
        { timeout: TIMEOUTS.MEDIUM }
      );
      await this.clickOnElement(this.nameModalNextButton, {
        stepInfo: 'Click Next button',
      });
      return await responsePromise;
    });
  }

  /**
   * Intercepts the newsletter creation request and returns the response data
   * This is the Playwright equivalent of Cypress's intercept + wait pattern
   */
  async interceptNewsletterCreation(): Promise<{ id: string; [key: string]: unknown }> {
    return await test.step('Intercept newsletter creation', async () => {
      const response = await this.clickNextAndWaitForNewsletterResponse();
      const responseBody = await response.json();
      return responseBody;
    });
  }

  /**
   * Asserts the newsletter editor URL is correct
   * @param expectedPath - The expected path (default: /new)
   */
  async assertNewsletterPageUrlContains(expectedPath: string = '/new'): Promise<void> {
    await test.step(`Assert URL contains: ${expectedPath}`, async () => {
      await expect(this.page, `URL should contain "${expectedPath}"`).toHaveURL(new RegExp(expectedPath));
    });
  }

  /**
   * Clicks the Preview button
   */
  async clickPreviewButton(): Promise<void> {
    await test.step('Click Preview button', async () => {
      await this.clickOnElement(this.previewButton, {
        stepInfo: 'Click Preview button',
      });
    });
  }

  /**
   * Clicks the Save button
   */
  async clickSaveButton(): Promise<void> {
    await test.step('Click Save button', async () => {
      await this.clickOnElement(this.saveButton, {
        stepInfo: 'Click Save button',
      });
    });
  }

  /**
   * Clicks the Next button in the editor
   */
  async clickNextButton(): Promise<void> {
    await test.step('Click Next button', async () => {
      await this.clickOnElement(this.nextButton, {
        stepInfo: 'Click Next button',
      });
    });
  }

  /**
   * Clicks on a specific block type to add it
   * @param blockType - The type of block to add
   */
  async addBlock(
    blockType:
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
      | 'Surveys'
  ): Promise<void> {
    await test.step(`Add ${blockType} block`, async () => {
      // Use existing class properties for block locators
      const blockLocatorMap: Record<typeof blockType, Locator> = {
        Button: this.buttonBlock,
        Divider: this.dividerBlock,
        Embed: this.embedBlock,
        Image: this.imageBlock,
        Text: this.textBlock,
        Spacer: this.spacerBlock,
        Video: this.videoBlock,
        Content: this.contentBlock,
        People: this.peopleBlock,
        Recognition: this.recognitionBlock,
        Sites: this.sitesBlock,
        Surveys: this.surveysBlock,
      };
      const blockLocator = blockLocatorMap[blockType];
      await this.clickOnElement(blockLocator, {
        stepInfo: `Click ${blockType} block`,
      });
    });
  }

  /**
   * Verifies all general blocks are visible
   */
  async verifyGeneralBlocksAreVisible(): Promise<void> {
    await test.step('Verify general blocks are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.buttonBlock, {
        assertionMessage: 'Button block should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.imageBlock, {
        assertionMessage: 'Image block should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.textBlock, {
        assertionMessage: 'Text block should be visible',
      });
    });
  }

  /**
   * Verifies all smart blocks are visible
   */
  async verifySmartBlocksAreVisible(): Promise<void> {
    await test.step('Verify smart blocks are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentBlock, {
        assertionMessage: 'Content block should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.peopleBlock, {
        assertionMessage: 'People block should be visible',
      });
    });
  }

  /**
   * Clicks the back button to go back
   */
  async clickBackButton(): Promise<void> {
    await test.step('Click back button', async () => {
      await this.clickOnElement(this.backButton, {
        stepInfo: 'Click back button',
      });
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
   * Clicks the three-dot (more options) button for a newsletter row
   */
  async clickOnThreeDotButton(): Promise<void> {
    await test.step('Click three-dot menu button', async () => {
      await this.clickOnElement(this.threeDotButton, {
        stepInfo: 'Click three-dot menu button',
      });
    });
  }

  /**
   * Clicks an option from the three-dot menu
   * @param optionName - The name of the menu option to click
   */
  async clickOptionsFromThreeDotMenu(optionName: string): Promise<void> {
    await test.step(`Click "${optionName}" from three-dot menu`, async () => {
      const menuItem = this.page.getByRole('menuitem').filter({ hasText: optionName });
      await this.clickOnElement(menuItem, {
        stepInfo: `Click ${optionName} menu item`,
      });
    });
  }

  /**
   * Clicks the Save button and waits for save to complete
   */
  async clickSave(): Promise<void> {
    await test.step('Click Save button', async () => {
      // Dismiss any blocking dialogs (e.g., survey prompts)
      await this.dismissSurveyPromptIfVisible();

      // Wait for save API response before clicking to ensure we catch the response
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('newsletters') && response.status() === 200,
        { timeout: TIMEOUTS.MEDIUM }
      );

      await this.clickOnElement(this.saveButton, {
        stepInfo: 'Click Save button',
      });

      // Wait for save operation to complete via network response
      await responsePromise;
    });
  }
}
