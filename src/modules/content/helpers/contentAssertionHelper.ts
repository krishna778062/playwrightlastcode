import { test, expect, Locator } from '@playwright/test';
import { PageCreationPage } from '../pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';
import { BaseVerificationUtil } from '../../../core/utils/baseVerificationUtil';

export class ContentCreationAssertions {
  readonly uploadImageValidation: Locator;
  private readonly verifier: BaseVerificationUtil;
  
  constructor(private readonly pageCreationPage: PageCreationPage) {
    this.uploadImageValidation = pageCreationPage.page.locator('//textarea[@placeholder="Add image caption here"]');
    this.verifier = new BaseVerificationUtil(pageCreationPage.page);
  }

  async verifyUploadedFileIsVisible(options?: { timeout?: number }): Promise<void> {
    await test.step(`Verifying that the uploaded file is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.uploadImageValidation, {
        assertionMessage: 'expected uploaded file validation element to be visible',
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      });
    });
  }
} 