import { Locator, Page, test } from '@playwright/test';

import { AttachementUploaderComponent } from '@content/components/attachementUploader';
import { BaseComponent } from '@core/components/baseComponent';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { FileUtil } from '@core/utils/fileUtil';

export class FilePreviewComponent extends BaseComponent {
  readonly previewModal: Locator;
  readonly showMoreButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly infoIconOnImage: Locator;
  readonly editVersionButton: Locator;
  readonly imageUploaderContainer: Locator;
  readonly imageUploader: AttachementUploaderComponent;
  readonly uploadButton: Locator;
  readonly closeButton: Locator;
  readonly versionNumber: Locator;

  constructor(page: Page) {
    super(page);
    this.previewModal = this.page.locator('div[class*="imagePreviewContainer"]');
    this.showMoreButton = this.page.locator('div[class*="PreviewModal"] button[aria-label="Show more"]').nth(1);
    this.deleteButton = this.page.locator('div[role="menuitem"] > div').filter({ hasText: /^Delete$/ });
    this.confirmDeleteButton = this.page.locator('div[class*="BaseModal"] > button').filter({ hasText: /^Delete$/ });
    this.infoIconOnImage = this.page.getByTestId('info-button');
    this.editVersionButton = this.page.getByRole('button', { name: 'Edit Version' });
    this.uploadButton = this.page.getByRole('button', { name: 'Upload' });
    this.imageUploaderContainer = page
      .locator("[class*='AddFromContainer']")
      .filter({ hasText: 'Select from computer' })
      .nth(0);

    this.imageUploader = new AttachementUploaderComponent(page, this.imageUploaderContainer);
    this.closeButton = this.page.locator('button[aria-label="Close"]').nth(1);
    this.versionNumber = this.page.locator('span:has-text("Versions")').locator('+ h4 button');
  }

  /**
   * Verifies that the file preview modal is opened
   */
  async verifyPreviewModalIsOpened(): Promise<void> {
    await test.step('Verify file preview modal is opened', async () => {
      await this.verifier.verifyTheElementIsVisible(this.previewModal, {
        assertionMessage: 'File preview modal should be visible',
      });
    });
  }

  /**
   * Clicks the delete button in the preview
   */
  async clickDeleteButton(): Promise<void> {
    await test.step('Click delete button in preview', async () => {
      await this.clickOnElement(this.deleteButton);
      await this.verifier.verifyTheElementIsVisible(this.confirmDeleteButton, {
        assertionMessage: 'Confirm modal should be visible',
      });
      await this.clickOnElement(this.confirmDeleteButton);
    });
  }

  async clickShowMoreButton(): Promise<void> {
    await test.step('Click show more button in preview', async () => {
      await this.clickOnElement(this.showMoreButton);
    });
  }

  async clickOnInfoIconOnImage(): Promise<void> {
    await test.step(`Click on info icon on image`, async () => {
      await this.clickOnElement(this.infoIconOnImage);
    });
  }

  async clickOnEditVersionButton(): Promise<void> {
    await test.step(`Click on edit version button`, async () => {
      await this.clickOnElement(this.editVersionButton);
    });
  }

  /**
   * Uploads a cover image to the page creation page
   * It calls uploadAttachment from attachementUploader component
   * and then clicks on next button twice to go to the image cropper page
   * @param fileName - The name of the file to upload
   */
  async uploadImage(
    fileName: string,
    options?: {
      widescreenCropOption?: boolean;
      squareCropOption?: boolean;
    }
  ): Promise<string> {
    return await test.step(`Upload cover image: ${fileName}`, async () => {
      // Setup response promises for 3 upload requests
      const responsePromises = [];
      let requestURL: string = '';
      const responsePromise = this.page
        .waitForResponse(
          response =>
            response.request().url().includes('X-Amz-SignedHeaders=host') &&
            response.request().method() === 'PUT' &&
            response.status() === 200,
          { timeout: 35000 }
        )
        .then(response => {
          requestURL = response.request().url();
        });
      responsePromises.push(responsePromise);

      await this.imageUploader.uploadAttachment(fileName);

      // Wait for all 3 upload responses to complete with 200 status
      await Promise.all(responsePromises);
      const id = requestURL.split('/u/o/')[1].split('?')[0];
      return id;
    });
  }

  async clickOnUploadButton(fileId: string): Promise<void> {
    await test.step(`Click on upload button`, async () => {
      await this.clickOnElement(this.uploadButton);
    });
  }

  async clickOnCloseButton(): Promise<void> {
    await test.step(`Click on close button`, async () => {
      await this.clickOnElement(this.closeButton);
    });
  }

  async verifyVersionNumber(expectedVersionNumber: string): Promise<void> {
    await test.step(`Click on version number`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.versionNumber, {
        assertionMessage: 'Version number should be visible',
      });
      const versionNumberText = await this.versionNumber.textContent();
      if (versionNumberText !== expectedVersionNumber) {
        throw new Error(`Expected version number to be ${expectedVersionNumber}, but found: ${versionNumberText}`);
      }
    });
  }
}
