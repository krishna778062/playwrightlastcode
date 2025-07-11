import { test, expect } from '@playwright/test';
import { ContentCreationPage } from '../pages/contentCreationPage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';

export class ContentCreationAssertions {
  constructor(private readonly page: ContentCreationPage) {}

  async verifyUploadedFileIsVisible(options?: { timeout?: number }) {
    // Check for success indicators - verify the uploaded image validation element is visible
    await expect(
      this.page.uploadImageValidation,
      'Upload success should be indicated'
    ).toBeVisible({
      timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
    });
  }
} 