import { test, expect } from '@playwright/test';
import { ContentCreationPage } from '../pages/contentCreationPage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';
import { BaseVerificationUtil } from '../../../core/utils/baseVerificationUtil';

export class ContentCreationAssertions {
  private readonly verifier: BaseVerificationUtil;
  
  constructor(private readonly page: ContentCreationPage) {
    this.verifier = new BaseVerificationUtil(page.page);
  }

  async verifyUploadedFileIsVisible(options?: { timeout?: number }): Promise<void> {
    await test.step(`Verifying that the uploaded file is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.uploadImageValidation, {
        assertionMessage: 'expected uploaded file validation element to be visible',
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      });
    });
  }
} 