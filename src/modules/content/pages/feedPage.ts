import { BasePage } from '@core/pages/basePage';
import { Locator, Page, expect, test } from '@playwright/test';
import { FileUtil } from '@core/utils/fileUtil';
import { TIMEOUTS } from '@core/constants/timeouts';

export interface FeedPostOptions {
  text: string;
  attachments?: {
    files: string[];
    removeCount?: number;
  };
}

export interface FeedPostResult {
  postText: string;
  attachmentCount: number;
  timestamp: string;
}

export interface IFeedActions {
  createAndPublishPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  deletePost: (postText: string) => Promise<void>;
  clickShareThoughtsButton: () => Promise<void>;
  createPost: (text: string) => Promise<void>;
  uploadFiles: (files: string[]) => Promise<void>;
  removeAttachedFile: () => Promise<void>;
  clickPostButton: () => Promise<void>;
  openPostOptionsMenu: (postText: string) => Promise<void>;
  clickEditOption: () => Promise<void>;
  clickDeleteOption: () => Promise<void>;
  updatePostText: (text: string) => Promise<void>;
  clickUpdateButton: () => Promise<void>;
  confirmDelete: () => Promise<void>;
  clickInlineImagePreview: (postText: string) => Promise<void>;
  closeImagePreview: () => Promise<void>;
}

export interface IFeedAssertions {
  verifyPostCreated: (expectedText: string) => Promise<void>;
  verifyTimestampDisplayed: (postText: string) => Promise<void>;
  verifyFileAttachmentsCount: (postText: string, expectedCount: number) => Promise<void>;
  verifyEditorVisible: () => Promise<void>;
  verifyDeleteConfirmDialog: (expectedText: string) => Promise<void>;
  verifyPostDeleted: () => Promise<void>;
  verifyInlineImagePreviewVisible: () => Promise<void>;
  verifyInlineImagePerview: (postText: string) => Promise<void>;
}

export class FeedPage extends BasePage implements IFeedActions, IFeedAssertions {
  // Share thoughts section
  readonly shareThoughtsButton = this.page.getByRole('button', { name: 'Share your thoughts' });
  readonly feedEditor = this.page.locator("div[aria-describedby='content-description']");
  readonly fileUploadInput = this.page.locator("input[type='file']");
  readonly attachedFiles = this.page.locator("div[class='FileItem-name']");
  readonly deleteFileIcon = this.page.locator("button[class*='delete']");
  readonly postButton = this.page.locator("div[class*='PostFormShareContainer'] button:text('Post')");

  // Post options section
  readonly editButton = this.page.locator("div:text('Edit')");
  readonly deleteButton = this.page.locator("div:text('Delete')");
  readonly updateButton = this.page.getByRole('button', { name: 'Update' });
  readonly deleteConfirmDialog = this.page.locator('div[role="dialog"]');
  readonly deleteConfirmButton = this.page.getByRole('button', { name: 'Delete' });
  readonly closeButton = this.page.locator("button[class*='closeBtn']");
  readonly inlineImagePreview = this.page.locator("div[class*='gallerySlide'] img");

  // File upload section
  readonly fileItemNameSelector = "div[class='FileItem-name']";
  readonly deleteButtonSelector = "button[class*='delete']";

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

  get actions(): IFeedActions {
    return this;
  }

  get assertions(): IFeedAssertions {
    return this;
  }

  /**
   * Verifies that the feed page is loaded by checking if share thoughts button is visible
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton);
  }

  /**
   * Creates and publishes a new feed post
   * @param options - Options for creating the post including text and attachments
   * @returns Result containing post text, attachment count and timestamp
   */
  async createAndPublishPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await test.step(`Creating and publishing feed post with text: ${options.text}`, async () => {
      // Open editor
      await this.clickShareThoughtsButton();
      
      // Add post content
      await this.createPost(options.text);
      
      // Handle attachments if provided
      if (options.attachments) {
        await this.uploadFiles(options.attachments.files);
        
        // Remove files if specified
        if (options.attachments.removeCount) {
          for (let i = 0; i < options.attachments.removeCount; i++) {
            await this.removeAttachedFile();
          }
        }
      }
      
      // Publish post
      await this.clickPostButton();
      
      // Wait for post to appear and get details
      await this.verifyPostCreated(options.text);
      const timestamp = await this.getPostTimestampLocator(options.text).textContent() || '';
      const attachmentCount = options.attachments ? 
        options.attachments.files.length - (options.attachments.removeCount || 0) : 
        0;
      
      return {
        postText: options.text,
        attachmentCount,
        timestamp
      };
    });
  }

  /**
   * Edits an existing post with new text
   * @param currentText - Current text of the post to edit
   * @param newText - New text to update the post with
   */
  async editPost(currentText: string, newText: string): Promise<void> {
    await test.step(`Editing post from "${currentText}" to "${newText}"`, async () => {
      await this.openPostOptionsMenu(currentText);
      await this.clickEditOption();
      await this.verifyEditorVisible();
      await this.updatePostText(newText);
      await this.clickUpdateButton();
      await this.verifyPostCreated(newText);
    });
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
   * Clicks the share thoughts button to open post editor
   */
  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
      await this.clickOnElement(this.shareThoughtsButton);
    });
  }

  /**
   * Creates a new post with specified text
   * @param text - Text content for the post
   */
  async createPost(text: string): Promise<void> {
    await test.step('Create a post', async () => {
      await this.fillInElement(this.feedEditor, text);
    });
  }

  /**
   * Uploads files to the post
   * @param files - Array of file paths to upload
   */
  async uploadFiles(files: string[]): Promise<void> {
    await test.step('Upload files to feed post', async () => {
      const filePaths = files.map(file => 
        FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', file)
      );
      await this.fileUploadInput.setInputFiles(filePaths);
      await this.page.waitForSelector(this.fileItemNameSelector, { state: 'visible', timeout: TIMEOUTS.VERY_LONG });
      await this.page.waitForTimeout(2000);
      const count = await this.attachedFiles.count();
      const fileNames = await Promise.all(
        (await this.attachedFiles.all()).map(el => el.textContent())
      );
      if (count !== files.length) {
        throw new Error(`Expected ${files.length} files to be attached, but found ${count}. Files found: ${fileNames.join(', ')}`);
      }
    });
  }

  /**
   * Removes the first attached file from the post
   */
  async removeAttachedFile(): Promise<void> {
    await test.step('Remove attached file', async () => {
      await this.page.waitForSelector(this.deleteButtonSelector, { state: 'visible', timeout: 30000 });
      const deleteButtons = await this.deleteFileIcon.all();
      if (deleteButtons.length === 0) {
        throw new Error('No delete buttons found');
      }
      const initialCount = await this.attachedFiles.count();
      await this.clickOnElement(deleteButtons[0]);
      await expect(this.attachedFiles).toHaveCount(initialCount - 1);
    });
  }

  /**
   * Clicks the post button to publish
   */
  async clickPostButton(): Promise<void> {
    await test.step('Click post button', async () => {
      await this.clickOnElement(this.postButton);
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
   * Clicks the edit option in the options menu
   */
  async clickEditOption(): Promise<void> {
    await test.step('Click edit option', async () => {
      await this.clickOnElement(this.editButton);
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
   * Updates the post text in the editor
   * @param text - New text for the post
   */
  async updatePostText(text: string): Promise<void> {
    await test.step('Update post text', async () => {
      await this.feedEditor.clear();
      await this.fillInElement(this.feedEditor, text);
    });
  }

  /**
   * Clicks the update button to save changes
   */
  async clickUpdateButton(): Promise<void> {
    await test.step('Click update button', async () => {
      await this.clickOnElement(this.updateButton);
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
   * Verifies that a post is created and visible
   * @param expectedText - Expected text of the post
   */
  async verifyPostCreated(expectedText: string): Promise<void> {
    await test.step('Verify post is created', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFeedTextLocator(expectedText), {
        timeout: TIMEOUTS.MEDIUM,
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
   * Verifies that the post editor is visible
   */
  async verifyEditorVisible(): Promise<void> {
    await test.step('Verify editor is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.feedEditor);
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
   * Opens and verifies the inline image preview
   * @param postText - Text of the post containing the image
   */
  async verifyInlineImagePerview(postText: string): Promise<void> {
    await this.clickInlineImagePreview(postText);
    await this.verifyInlineImagePreviewVisible();
    await this.closeImagePreview();
  }
} 