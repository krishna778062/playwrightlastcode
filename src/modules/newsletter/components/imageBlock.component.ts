import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class ImageBlockComponent extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  // Block selection
  readonly imageBlockButton: Locator;

  // Image picker modal
  readonly findImageButton: Locator;
  readonly pickerModalImages: Locator;

  // Image options
  readonly imageOptionsField: Locator;
  readonly imageLinkField: Locator;
  readonly altTextInput: Locator;
  readonly makeImageLinkLabel: Locator;

  // Image search
  readonly imageSearchInput: Locator;
  readonly itemsCountText: Locator;

  // Added image
  readonly addedImageBlock: Locator;
  readonly imageInEditorCanvas: Locator;

  // Close button
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    // Block selection - the Image block in the blocks panel (use original Cypress locator)
    this.imageBlockButton = this.page.locator('[data-chockablock-item-id="Image"]');

    // Image picker modal
    this.findImageButton = this.page.getByRole('button', { name: 'find an image' });
    this.pickerModalImages = this.page.locator('div[class*="PickerModal_pickerBlock"]');

    // Image options panel
    this.imageOptionsField = this.page.getByTestId('field-Image options');
    this.imageLinkField = this.page.getByTestId('field-Image link');
    this.altTextInput = this.page.locator('[id="blocks_rootBlock_children_0_options_alt_"]');
    this.makeImageLinkLabel = this.page.getByText('Make image a link');

    // Image search
    this.imageSearchInput = this.page.locator('[aria-label="Search…"]');
    this.itemsCountText = this.page.getByText(/\d{1,3}(?:,\d{3})* items/);

    // Added image
    this.addedImageBlock = this.page.getByAltText('no image found');
    // Image in editor canvas - used to verify image was successfully added
    this.imageInEditorCanvas = this.page.locator('[class*="editor"], [class*="canvas"]').first().locator('img').first();

    // Close button - try multiple possible selectors
    this.closeButton = this.page
      .locator('[data-testid="i-closeCircleLight"], [data-testid="i-close"], [aria-label="Close"]')
      .first();
  }

  /**
   * Dismisses the survey participation prompt if it's visible
   * This is a private helper method to avoid code duplication
   */
  private async dismissSurveyDialogIfVisible(): Promise<void> {
    try {
      const surveyDialog = this.page.getByRole('dialog', { name: 'Survey participation prompt' });
      const dismissButton = surveyDialog.getByRole('button', { name: 'Dismiss' });
      await surveyDialog.waitFor({ state: 'visible', timeout: TIMEOUTS.VERY_VERY_SHORT });
      await this.clickOnElement(dismissButton, {
        stepInfo: 'Click Dismiss button on survey dialog',
      });
      await surveyDialog.waitFor({ state: 'hidden', timeout: TIMEOUTS.VERY_SHORT });
    } catch {
      // Survey dialog not present, continue
    }
  }

  /**
   * Adds an image block to the newsletter with a link
   * @param imageLinkUrl - The URL to link the image to
   */
  async addImageBlockWithLink(imageLinkUrl: string): Promise<void> {
    await test.step(`Add image block with link: ${imageLinkUrl}`, async () => {
      // Dismiss survey dialog if it's blocking the UI
      await this.dismissSurveyDialogIfVisible();

      // Click on Image block in the blocks panel (matching Cypress: cy.get('[data-chockablock-item-id="Image"]'))
      await this.clickOnElement(this.imageBlockButton, {
        stepInfo: 'Click Image block',
      });

      // Wait for the modal to appear and the "find an image" button to be visible
      await expect(this.findImageButton, 'Find image button should be visible in the modal').toBeVisible();
      await this.clickOnElement(this.findImageButton, {
        stepInfo: 'Click find image button',
      });
      await this.pickerModalImages.first().dblclick();
      await this.clickOnElement(this.makeImageLinkLabel, {
        stepInfo: 'Click Make image a link',
      });
      await this.fillInElement(this.imageLinkField.locator('input'), imageLinkUrl, {
        stepInfo: 'Enter image link URL',
      });
    });
  }

  /**
   * Adds alt text to the image
   * @param altText - The alt text to add
   */
  async addAltTextToImage(altText: string): Promise<void> {
    await test.step(`Add alt text: ${altText}`, async () => {
      await this.clickOnElement(this.altTextInput, {
        stepInfo: 'Click alt text input',
      });
      await this.fillInElement(this.altTextInput, altText, {
        stepInfo: 'Enter alt text',
      });
    });
  }

  /**
   * Clicks the close/cross button
   */
  async clickCloseButton(): Promise<void> {
    await test.step('Click close button', async () => {
      // Use force to bypass any overlay dialogs
      await this.clickOnElement(this.closeButton, {
        stepInfo: 'Click close button',
        force: true,
      });
    });
  }

  /**
   * Verifies the image block is visible in the editor
   */
  async verifyImageBlockIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.imageBlockButton, {
      assertionMessage: 'Image block should be visible in blocks panel',
    });
  }

  /**
   * Searches for an image and selects it
   * @param imageName - The search term for the image
   */
  async searchAndSelectImage(imageName: string): Promise<void> {
    await test.step(`Search and select image: ${imageName}`, async () => {
      // Dismiss survey dialog if it's blocking the UI
      await this.dismissSurveyDialogIfVisible();

      await this.clickOnElement(this.imageBlockButton, {
        stepInfo: 'Click Image block',
      });
      // Wait for the modal to appear and the "find an image" button to be visible
      await expect(this.findImageButton, 'Find image button should be visible in the modal').toBeVisible();
      await this.clickOnElement(this.findImageButton, {
        stepInfo: 'Click find image button',
      });
      await this.fillInElement(this.imageSearchInput, imageName, {
        stepInfo: 'Enter image search term',
      });
      await expect(this.itemsCountText).toBeVisible();
      await this.pickerModalImages.first().dblclick();
    });
  }

  /**
   * Clicks on an added image block in the editor canvas to edit it
   */
  async clickOnAddedImageBlock(): Promise<void> {
    await test.step('Click on added image block', async () => {
      await this.clickOnElement(this.addedImageBlock, {
        stepInfo: 'Click on added image block',
      });
    });
  }

  /**
   * Clears and updates the alt text for an image
   * @param altText - The new alt text
   */
  async updateAltText(altText: string): Promise<void> {
    await test.step(`Update alt text to: ${altText}`, async () => {
      await this.clickOnElement(this.altTextInput, {
        stepInfo: 'Click alt text input',
      });
      await this.altTextInput.clear();
      await this.fillInElement(this.altTextInput, altText, {
        stepInfo: 'Enter updated alt text',
      });
    });
  }
}
