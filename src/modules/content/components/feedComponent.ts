import { BaseComponent } from '@/src/core/components/baseComponent';
import { Locator, Page, test, expect } from '@playwright/test';
import { formatDateForFeed } from '@/src/core/utils/dateUtil';

export class FeedComponent extends BaseComponent {
  readonly shareThoughtsButton: Locator;
  readonly feedEditor: Locator;
  readonly fileUploadInput: Locator;
  readonly attachedFiles: Locator;
  readonly deleteFileIcon: Locator;
  readonly postButton: Locator;
  readonly feedPosts: Locator;
  readonly postTimestamp: Locator;
  readonly fileAttachmentInfo: Locator;
  readonly inlineImagePreview: Locator;
  readonly postOptionsMenu: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly updateButton: Locator;
  readonly deleteConfirmDialog: Locator;
  readonly deleteConfirmButton: Locator;
  readonly getFeedTextLocator: (text: string) => Locator;
  readonly getPostTimestampLocator: (postText: string) => Locator;
  readonly getPostAttachmentsLocator: (postText: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.shareThoughtsButton = page.locator('span', { hasText: 'Share your thoughts' });
    this.feedEditor = page.locator("div[class*='ProseMirror'] p[data-placeholder*='Share your thoughts']");
    this.fileUploadInput = page.locator("input[type='file']");
    this.attachedFiles = page.locator("div[class='FileItem-name']");
    this.deleteFileIcon = page.locator("button[class*='delete']");
    this.postButton = page.locator("div[class*='PostFormShareContainer'] button:text('Post')");
    this.feedPosts = page.locator('.feed-post');
    this.postTimestamp = page.locator('.post-timestamp');
    this.fileAttachmentInfo = page.locator('.file-info');
    this.inlineImagePreview = page.locator('.image-preview');
    this.postOptionsMenu = page.locator('.post-options-menu');
    this.editButton = page.getByRole('menuitem', { name: 'Edit' });
    this.deleteButton = page.getByRole('menuitem', { name: 'Delete' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.deleteConfirmDialog = page.locator('div[role="dialog"]');
    this.deleteConfirmButton = page.getByRole('button', { name: 'Delete' });
    this.getFeedTextLocator = (text: string) => page.locator(`div[class*='postContent'] p:text("${text}")`);
    this.getPostTimestampLocator = (postText: string) => 
      page.locator(`div[class*='postContent'] p:text("${postText}")/../../../..//div[class*='headerInne']//p/a`);
    this.getPostAttachmentsLocator = (postText: string) => 
      page.locator(`p:text("${postText}")/../../../..//li`);
  }

  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
      await this.shareThoughtsButton.click();
    });
  }

  async createPost(text: string): Promise<void> {
    await test.step('Create a post', async () => {
      await this.feedEditor.fill(text);
    });
  }

  async uploadFiles(files: string[]): Promise<void> {
    await test.step('Upload files to feed post', async () => {
      await this.fileUploadInput.setInputFiles(files);
    });
  }

  async verifyFilesAttached(): Promise<void> {
    await test.step('Verify files are attached', async () => {
      await this.verifier.verifyTheElementIsVisible(this.attachedFiles);
      const attachedFilesCount = await this.attachedFiles.count();
      await expect(attachedFilesCount, 'Expected 3 files to be attached').toBe(3);
    });
  }

  async removeAttachedFile(): Promise<void> {
    await test.step('Remove attached file', async () => {
      const deleteButtons = await this.deleteFileIcon.all();
      await deleteButtons[0].hover();
      await deleteButtons[0].click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickPostButton(): Promise<void> {
    await test.step('Click post button', async () => {
      await this.postButton.click();
    });
  }

  async verifyPostCreated(expectedText: string): Promise<void> {
    await test.step('Verify post is created', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFeedTextLocator(expectedText));
    });
  }

  async verifyTimestampDisplayed(postText: string): Promise<void> {
    await test.step('Verify timestamp is displayed', async () => {
      const timestampLocator = this.getPostTimestampLocator(postText);
      await timestampLocator.scrollIntoViewIfNeeded();
      
      const expectedDate = formatDateForFeed().split(':')[0];
      console.log('Expected date:', expectedDate);

      const actualTimestamp = await timestampLocator.textContent();
      if (!actualTimestamp) {
        throw new Error(`No timestamp found for post: ${postText}`);
      }

      const actualDate = actualTimestamp.trim().split(':')[0];
      console.log('Actual date:', actualDate);

      expect(actualDate.toLowerCase(), 'Post timestamp should match current date').toBe(expectedDate.toLowerCase());
    });
  }

  async verifyFileInfo(): Promise<void> {
    await test.step('Verify file information', async () => {
      await this.verifier.verifyTheElementIsVisible(this.fileAttachmentInfo);
    });
  }

  async verifyInlineImagePreview(): Promise<void> {
    await test.step('Verify inline image preview', async () => {
      await this.verifier.verifyTheElementIsVisible(this.inlineImagePreview);
    });
  }

  async openPostOptionsMenu(): Promise<void> {
    await test.step('Open post options menu', async () => {
      await this.postOptionsMenu.click();
    });
  }

  async clickEditOption(): Promise<void> {
    await test.step('Click edit option', async () => {
      await this.editButton.click();
    });
  }

  async verifyEditorVisible(): Promise<void> {
    await test.step('Verify editor is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.feedEditor);
    });
  }

  async updatePostText(text: string): Promise<void> {
    await test.step('Update post text', async () => {
      await this.feedEditor.fill(text);
    });
  }

  async clickUpdateButton(): Promise<void> {
    await test.step('Click update button', async () => {
      await this.updateButton.click();
    });
  }

  async clickDeleteOption(): Promise<void> {
    await test.step('Click delete option', async () => {
      await this.deleteButton.click();
    });
  }

  async verifyDeleteConfirmDialog(expectedMessage: string): Promise<void> {
    await test.step('Verify delete confirmation dialog', async () => {
      await this.verifier.verifyTheElementIsVisible(this.deleteConfirmDialog);
      await this.verifier.verifyElementContainsText(this.deleteConfirmDialog, expectedMessage);
    });
  }

  async confirmDelete(): Promise<void> {
    await test.step('Confirm delete', async () => {
      await this.deleteConfirmButton.click();
    });
  }

  async verifyPostDeleted(): Promise<void> {
    await test.step('Verify post is deleted', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.feedPosts.first());
    });
  }

  async verifyFileAttachmentsCount(postText: string, expectedCount: number): Promise<void> {
    await test.step(`Verify file attachments count is ${expectedCount}`, async () => {
      const attachmentsCount = await this.getPostAttachmentsLocator(postText).count();
      expect(attachmentsCount, `Expected ${expectedCount} file attachments`).toBe(expectedCount);
    });
  }
} 