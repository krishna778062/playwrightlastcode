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

  /**
   * Verifies that the content was published successfully
   * @param title - The title of the content to verify
   */
  async verifyContentPublishedSuccessfully(title: string): Promise<void> {
    await test.step(`Verifying content was published successfully`, async () => {
      // Verify success message is visible
      await this.pageCreationPage.verifier.verifyTheElementIsVisible(
        this.pageCreationPage.successMessage("Created page successfully - it's published"),
        { assertionMessage: "Success message should be visible after publishing" }
      );

      await this.pageCreationPage.verifier.verifyTheElementIsVisible(this.pageCreationPage.contentTitleHeading(title), {
        assertionMessage: `Content title "${title}" should be visible in heading`
      });
    });
  }
} 