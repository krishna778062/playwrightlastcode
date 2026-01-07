import { expect, Locator, Page, test } from '@playwright/test';

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

    // Close button - try multiple possible selectors
    this.closeButton = this.page
      .locator('[data-testid="i-closeCircleLight"], [data-testid="i-close"], [aria-label="Close"]')
      .first();
  }

  /**
   * Adds an image block to the newsletter with a link
   * @param imageLinkUrl - The URL to link the image to
   */
  async addImageBlockWithLink(imageLinkUrl: string): Promise<void> {
    await test.step(`Add image block with link: ${imageLinkUrl}`, async () => {
      // Click on Image block in the blocks panel (matching Cypress: cy.get('[data-chockablock-item-id="Image"]'))
      await this.imageBlockButton.click({ force: true });

      // Click find an image button (matching Cypress: cy.findByRole('button', { name: 'find an image' }))
      await this.findImageButton.click({ force: true });

      // Select the first image from picker (matching Cypress: cy.get('div[class*="PickerModal_pickerBlock').first().dblclick())
      await this.pickerModalImages.first().dblclick();

      // Enable image link option - click the visible label (custom styled checkbox)
      await this.page.getByText('Make image a link').click();

      // Enter the image link URL (field appears after checkbox is enabled)
      await this.imageLinkField.locator('input').fill(imageLinkUrl);
    });
  }

  /**
   * Adds alt text to the image
   * @param altText - The alt text to add
   */
  async addAltTextToImage(altText: string): Promise<void> {
    await test.step(`Add alt text: ${altText}`, async () => {
      await this.altTextInput.click({ force: true });
      await this.altTextInput.fill(altText);
    });
  }

  /**
   * Clicks the close/cross button
   */
  async clickCloseButton(): Promise<void> {
    await test.step('Click close button', async () => {
      // Use force to bypass any overlay dialogs
      await this.closeButton.click({ force: true });
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
      await this.imageBlockButton.click({ force: true });
      await this.findImageButton.click();
      await this.page.locator('[aria-label="Search…"]').fill(imageName);
      await expect(this.page.getByText(/\d{1,3}(?:,\d{3})* items/)).toBeVisible();
      await this.pickerModalImages.first().dblclick();
    });
  }

  /**
   * Clicks on an added image block in the editor canvas to edit it
   */
  async clickOnAddedImageBlock(): Promise<void> {
    await test.step('Click on added image block', async () => {
      const addedImage = this.page.getByAltText('no image found');
      await addedImage.click({ force: true });
    });
  }

  /**
   * Clears and updates the alt text for an image
   * @param altText - The new alt text
   */
  async updateAltText(altText: string): Promise<void> {
    await test.step(`Update alt text to: ${altText}`, async () => {
      await this.altTextInput.click({ force: true });
      await this.altTextInput.clear();
      await this.altTextInput.fill(altText);
    });
  }
}
