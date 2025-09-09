import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AttachementUploaderComponent extends BaseComponent {
  readonly attachmentUploaderInput: Locator;
  constructor(
    readonly page: Page,
    readonly attachmentUploaderContainer: Locator
  ) {
    super(page);
    this.attachmentUploaderInput = attachmentUploaderContainer.locator('input');
  }

  /**
   * Uploads an attachment to the attachment uploader
   * @param fileName - The name of the file to upload
   */
  async uploadAttachment(fileName: string): Promise<void> {
    await test.step(`Uploading attachment: ${fileName}`, async () => {
      await this.addInputFiles(this.attachmentUploaderInput, fileName);
    });
  }
}
