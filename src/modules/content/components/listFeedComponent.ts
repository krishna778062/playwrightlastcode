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
    this.page.locator("p")
      .filter({ hasText: postText })
      .locator("xpath=./ancestor::div[4]")
      .locator("div[class*='headerInne'] p a");

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
   * Deletes a post
   * @param postText - Text of the post to delete
   */
  async deletePost(postText: string): Promise<void> {
    await test.step(`Deleting post with text: ${postText}`, async () => {
      await this.openPostOptionsMenu(postText);
      await this.clickDeleteOption();
      await this.verifyDeleteConfirmDialog('Are you sure you want to delete this post?');
      await this.confirmDelete();
      await this.verifyPostDeleted();
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
  async confirmDelete(): Promise<void> {
    await test.step('Confirm delete', async () => {
      await this.clickOnElement(this.deleteConfirmButton);
    });
  }

  /**
   * Clicks the inline image preview to open lightbox
   * @param postText - Text of the post containing the image
   */
  async clickInlineImagePreview(postText: string): Promise<void> {
    await test.step('Click on inline image preview', async () => {
      await this.clickOnElement(this.getLightboxButtonLocator(postText).first());
    });
  }

  /**
   * Closes the image preview lightbox
   */
  async closeImagePreview(): Promise<void> {
    await test.step('Close image preview', async () => {
      await this.clickOnElement(this.closeButton);
    });
  }

  /**
   * Opens and verifies the inline image preview
   * @param postText - Text of the post containing the image
   */
  async verifyInlineImagePerview(postText: string): Promise<void> {
    await this.clickInlineImagePreview(postText);
    await this.verifyInlineImagePreviewVisible();
    await this.closeImagePreview();
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
   * Verifies that the post timestamp is displayed
   * @param postText - Text of the post to verify timestamp for
   */
  async verifyTimestampDisplayed(postText: string): Promise<void> {
    await test.step('Verify timestamp is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getPostTimestampLocator(postText));
    });
  }

  /**
   * Verifies the number of file attachments on a post
   * @param postText - Text of the post to verify attachments for
   * @param expectedCount - Expected number of attachments
   */
  async verifyFileAttachmentsCount(postText: string, expectedCount: number): Promise<void> {
    await test.step(`Verify ${expectedCount} file attachments are displayed`, async () => {
      const attachments = await this.getPostAttachmentsLocator(postText).all();
      expect(attachments.length).toBe(expectedCount);
    });
  }

  /**
   * Verifies the delete confirmation dialog
   * @param expectedText - Expected text in the confirmation dialog
   */
  async verifyDeleteConfirmDialog(expectedText: string): Promise<void> {
    await test.step('Verify delete confirmation dialog', async () => {
      await this.verifier.verifyTheElementIsVisible(this.deleteConfirmDialog);
      await expect(this.deleteConfirmDialog).toContainText(expectedText);
    });
  }

  /**
   * Verifies that a post is deleted
   */
  async verifyPostDeleted(): Promise<void> {
    await test.step('Verify post is deleted', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.deleteConfirmDialog);
    });
  }

  /**
   * Verifies that the inline image preview is visible
   */
  async verifyInlineImagePreviewVisible(): Promise<void> {
    await test.step('Verify inline image preview is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.inlineImagePreview.first());
    });
  }

  /**
   * Gets all visible posts on the current page
   * @returns Array of post text content
   */
  async getAllVisiblePosts(): Promise<string[]> {
    return await test.step('Get all visible posts', async () => {
      const posts = await this.page.locator("div[class*='postContent']").all();
      const postTexts = await Promise.all(posts.map(post => post.textContent()));
      return postTexts.filter((text): text is string => text !== null);
    });
  }

  /**
   * Verifies that a specific post exists in the feed
   * @param postText - Text of the post to verify
   * @returns True if post exists, false otherwise
   */
  async verifyPostExists(postText: string): Promise<boolean> {
    return await test.step(`Verify post "${postText}" exists in feed`, async () => {
      const posts = await this.getAllVisiblePosts();
      return posts.some(post => post.includes(postText));
    });
  }

  /**
   * Counts the total number of posts in the current feed view
   * @returns Number of posts visible
   */
  async getPostCount(): Promise<number> {
    return await test.step('Count total posts in feed', async () => {
      return await this.page.locator("div[class*='postContent']").count();
    });
  }

  /**
   * Scrolls to load more posts if infinite scroll is implemented
   */
  async scrollToLoadMorePosts(): Promise<void> {
    await test.step('Scroll to load more posts', async () => {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      // Wait for potential new posts to load
      await this.page.waitForTimeout(2000);
    });
  }

  /**
   * Searches for posts containing specific text
   * @param searchText - Text to search for in posts
   * @returns Array of matching posts
   */
  async searchPostsByText(searchText: string): Promise<string[]> {
    return await test.step(`Search posts containing "${searchText}"`, async () => {
      const allPosts = await this.getAllVisiblePosts();
      return allPosts.filter(post => post.toLowerCase().includes(searchText.toLowerCase()));
    });
  }

  /**
   * Gets the latest post in the feed
   * @returns Text content of the most recent post
   */
  async getLatestPost(): Promise<string> {
    return await test.step('Get latest post', async () => {
      const firstPost = await this.page.locator("div[class*='postContent']").first();
      return await firstPost.textContent() || '';
    });
  }

  /**
   * Waits for a new post to appear in the feed
   * @param expectedText - Text of the expected new post
   * @param timeout - Timeout in milliseconds (default: 10000)
   */
  async waitForNewPost(expectedText: string, timeout: number = 10000): Promise<void> {
    await test.step(`Wait for new post containing "${expectedText}"`, async () => {
      await this.page.waitForSelector(`div[class*='postContent']:has-text("${expectedText}")`, {
        state: 'visible',
        timeout
      });
    });
  }
} 