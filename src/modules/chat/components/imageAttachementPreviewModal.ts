import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ImageAttachementPreviewModal extends BaseComponent {
  readonly imageAttachementPreviewModalContainer: Locator;
  readonly downloadAttachmentButton: Locator;
  readonly closeAttachmentPreviewButton: Locator;

  constructor(page: Page, imageAttachementPreviewModalContainer: Locator) {
    super(page, imageAttachementPreviewModalContainer);
    this.imageAttachementPreviewModalContainer = imageAttachementPreviewModalContainer;
    this.downloadAttachmentButton = this.imageAttachementPreviewModalContainer.getByTestId('attachmentDownloadButton');
    this.closeAttachmentPreviewButton =
      this.imageAttachementPreviewModalContainer.locator('[class*="Base_closeIcon_"]');
  }

  /**
   * Verifies the image attachement preview modal is visible
   * @param options
   */
  async verifyTheImageAttachementPreviewModalIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying the image attachement preview modal is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.imageAttachementPreviewModalContainer, {
        timeout: 2000,
      });
    });
  }

  /**
   * Clicks on the download attachment button
   * @param options
   */
  async clickOnDownloadAttachmentButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on the download attachment button', async () => {
      await this.clickOnElement(this.downloadAttachmentButton);
    });
  }

  /**
   * Clicks on the close attachment preview button
   * @param options
   */
  async clickOnCloseAttachmentPreviewButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on the close attachment preview button', async () => {
      await this.clickOnElement(this.closeAttachmentPreviewButton);
    });
  }

  async verifyTheImageAttachementPreviewModalIsNotVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying the image attachement preview modal is not visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.imageAttachementPreviewModalContainer, {
        timeout: 2000,
      });
    });
  }
}
