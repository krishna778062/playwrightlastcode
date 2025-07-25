import { BaseComponent } from '@core/components/baseComponent';
import { Locator, Page, expect, test } from '@playwright/test';

export class ListFeedComponent extends BaseComponent {
  // Post options section
  readonly deleteButton = this.page.locator("div:text('Delete')");
  readonly deleteConfirmDialog = this.page.locator('div[role="dialog"]');
  readonly deleteConfirmButton = this.page.getByRole('button', { name: 'Delete' });
  readonly closeButton = this.page.locator("button[class*='closeBtn']");
  readonly inlineImagePreview = this.page.locator("div[class*='gallerySlide'] img");

  // Dynamic locator functions
  /**
   * Gets a locator for the post text content
   * @param text - The text content to find
   * @returns Locator for the post text
   */
  readonly getFeedTextLocator = (text: string): Locator => 
    this.page.locator("div[class*='postContent']").getByText(text, { exact: true });

  /**
   * Gets a locator for the post timestamp
   * @param postText - The text of the post to find timestamp for
   * @returns Locator for the post timestamp
   */
  readonly getPostTimestampLocator = (postText: string): Locator => 
    this.page.locator(`xpath=//p[text()='${postText}']/ancestor::div[4]//div[contains(@class,'nameAndStatement')]/following-sibling::p/a`);
      

  /**
   * Gets a locator for the post attachments
   * @param postText - The text of the post to find attachments for
   * @returns Locator for the post attachments
   */
  readonly getPostAttachmentsLocator = (postText: string): Locator => 
    this.page.locator(`div[class*='postContent']`).filter({ hasText: postText })
      .locator('li');

  /**
   * Gets a locator for the lightbox button on images
   * @param postText - The text of the post to find lightbox button for
   * @returns Locator for the lightbox button
   */
  readonly getLightboxButtonLocator = (postText: string): Locator =>
    this.page.locator("p")
      .filter({ hasText: postText })
      .locator("xpath=./ancestor::div[3]")
      .locator("button[aria-label='Open image in lightbox']");

  /**
   * Gets a locator for the post options menu
   * @param postText - The text of the post to find options menu for
   * @returns Locator for the options menu button
   */
  readonly getPostOptionsMenuLocator = (postText: string): Locator =>
    this.page.locator("p")
      .filter({ hasText: postText })
      .locator("xpath=./ancestor::div[4]")
      .locator("button[class*='optionlauncher']")
      .first();

  constructor(page: Page) {
    super(page);
  }

  /**
   * Gets the timestamp text for a specific post
   * @param postText - The text of the post to find timestamp for
   */
    async getPostTimestamp(postText: string): Promise<void> {
    await this.getPostTimestampLocator(postText).textContent() || '';
  }

  /**
   * Deletes a post with complete verification flow
   * @param postText - Text of the post to delete
   */
  async deletePost(postText: string): Promise<void> {
    await test.step(`Deleting post with text: ${postText}`, async () => {
      await this.openPostOptionsMenu(postText);
      await this.clickDeleteOption();
      await this.verifyDeleteFlow('Are you sure you want to delete this post?');
    });
  }

  /**
   * Opens the options menu for a post
   * @param postText - Text of the post to open options for
   */
  async openPostOptionsMenu(postText: string): Promise<void> {
    await test.step('Open post options menu', async () => {
      await this.clickOnElement(this.getPostOptionsMenuLocator(postText));
    });
  }

  /**
   * Clicks the delete option in the options menu
   */
  async clickDeleteOption(): Promise<void> {
    await test.step('Click delete option', async () => {
      await this.clickOnElement(this.deleteButton);
    });
  }

  /**
   * Confirms the delete action in the confirmation dialog
   */
  private async confirmDelete(): Promise<void> {
    await test.step('Confirm delete', async () => {
      await this.clickOnElement(this.deleteConfirmButton);
    });
  }

  /**
   * Clicks the inline image preview to open lightbox
   */
  private async clickInlineImagePreview(postText: string): Promise<void> {
    await test.step('Click on inline image preview', async () => {
      await this.clickOnElement(this.getLightboxButtonLocator(postText).first());
    });
  }

  /**
   * Closes the image preview lightbox
   */
  private async closeImagePreview(): Promise<void> {
    await test.step('Close image preview', async () => {
      await this.clickOnElement(this.closeButton);
    });
  }

  /**
   * Verifies that a post is created and visible
   * @param expectedText - Expected text of the post
   */
  async verifyPostCreated(expectedText: string): Promise<void> {
    await test.step('Verify post is created', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFeedTextLocator(expectedText), {
        timeout: 30000,
        assertionMessage: `Post with text "${expectedText}" should be visible`
      });
    });
  }

  /**
   * Verifies complete post details including timestamp, attachments, and image preview
   * @param postText - Text of the post to verify
   * @param expectedAttachmentCount - Expected number of attachments
   */
  async verifyPostDetails(postText: string, expectedAttachmentCount: number): Promise<void> {
    await test.step(`Verify complete post details for: ${postText}`, async () => {
      // Verify timestamp is displayed
      await this.verifier.verifyTheElementIsVisible(this.getPostTimestampLocator(postText));
      
      // Verify file attachments count
      await expect(this.getPostAttachmentsLocator(postText)).toHaveCount(expectedAttachmentCount);
      
      // Verify inline image preview functionality
      await this.clickInlineImagePreview(postText);
      await this.verifyInlineImagePreviewVisible();
      await this.closeImagePreview();
    });
  }

  /**
   * Verifies the complete delete flow including confirmation dialog and final deletion
   * @param expectedText - Expected text in the confirmation dialog
   */
  async verifyDeleteFlow(expectedText: string): Promise<void> {
    await test.step('Verify complete delete flow', async () => {
      // Verify delete confirmation dialog appears
      await this.verifier.verifyTheElementIsVisible(this.deleteConfirmDialog);
      await expect(this.deleteConfirmDialog).toContainText(expectedText);
      
      // Confirm deletion
      await this.confirmDelete();
      
      // Verify post is deleted (dialog disappears)
      await this.verifier.verifyTheElementIsNotVisible(this.deleteConfirmDialog);
    });
  }

  /**
   * Verifies that the inline image preview is visible
   */
  private async verifyInlineImagePreviewVisible(): Promise<void> {
    await test.step('Verify inline image preview is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.inlineImagePreview.first());
    });
  }

} 