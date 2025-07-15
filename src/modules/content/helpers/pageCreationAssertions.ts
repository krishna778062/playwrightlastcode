import { test, expect, Locator } from '@playwright/test';
import { PageCreationPage } from '../pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';

export class PageCreationAssertions {
  
  constructor(private readonly pageCreationPage: PageCreationPage) {
  }
  

  /**
   * Verifies that the uploaded cover image preview is visible
   * @param options - The options for the assertion
   * @param options.timeout - The timeout for the assertion
   */
  async verifyUploadedCoverImagePreviewIsVisible(options?: { timeout?: number }): Promise<void> {
    await test.step(`Verifying that the uploaded cover image preview is visible`, async () => {
      await this.pageCreationPage.verifier.verifyTheElementIsVisible(this.pageCreationPage.uploadedCoverImagePreviewImage, {
        assertionMessage: 'expected uploaded cover image preview element to be visible',
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      }); 
    });
  }
} 