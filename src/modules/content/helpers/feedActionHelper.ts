import { test } from '@playwright/test';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { FeedPage, IFeedActions, FeedPostOptions, FeedPostResult } from '../pages/feedPage';
import { FileUtil } from '@core/utils/fileUtil';

export class FeedActionHelper extends BaseActionUtil implements IFeedActions {
  constructor(private readonly feedPage: FeedPage) {
    super(feedPage['page']);
  }

  async createAndPublishPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await test.step(`Creating and publishing feed post with text: ${options.text}`, async () => {
      // Open editor
      await this.clickShareThoughtsButton();
      
      // Add post content
      await this.createPost(options.text);
      
      // Handle attachments if provided
      if (options.attachments) {
        const filePaths = options.attachments.files.map(file => 
          FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', file)
        );
        await this.uploadFiles(filePaths);
        
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
      await this.feedPage.verifyPostCreated(options.text);
      const timestamp = await this.feedPage.getPostTimestampLocator(options.text).textContent() || '';
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

  async editPost(currentText: string, newText: string): Promise<void> {
    await test.step(`Editing post from "${currentText}" to "${newText}"`, async () => {
      await this.openPostOptionsMenu(currentText);
      await this.clickEditOption();
      await this.feedPage.verifyEditorVisible();
      await this.updatePostText(newText);
      await this.clickUpdateButton();
      await this.feedPage.verifyPostCreated(newText);
    });
  }

  async deletePost(postText: string): Promise<void> {
    await test.step(`Deleting post with text: ${postText}`, async () => {
      await this.openPostOptionsMenu(postText);
      await this.clickDeleteOption();
      await this.feedPage.verifyDeleteConfirmDialog('Are you sure you want to delete this post?');
      await this.confirmDelete();
      await this.feedPage.verifyPostDeleted();
    });
  }

  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
      await this.clickOnElement(this.feedPage.shareThoughtsButton);
    });
  }

  async createPost(text: string): Promise<void> {
    await test.step('Create a post', async () => {
      await this.fillInElement(this.feedPage.feedEditor, text);
    });
  }

  async uploadFiles(files: string[]): Promise<void> {
    await test.step('Upload files to feed post', async () => {
      await this.feedPage.fileUploadInput.setInputFiles(files);
      await this.page.waitForSelector("div[class='FileItem-name']", { state: 'visible', timeout: 30000 });
      const count = await this.feedPage.attachedFiles.count();
      const fileNames = await Promise.all(
        (await this.feedPage.attachedFiles.all()).map(el => el.textContent())
      );
      if (count !== files.length) {
        throw new Error(`Expected ${files.length} files to be attached, but found ${count}. Files found: ${fileNames.join(', ')}`);
      }
    });
  }

  async removeAttachedFile(): Promise<void> {
    await test.step('Remove attached file', async () => {
      await this.page.waitForSelector("button[class*='delete']", { state: 'visible', timeout: 30000 });
      const deleteButtons = await this.feedPage.deleteFileIcon.all();
      if (deleteButtons.length === 0) {
        throw new Error('No delete buttons found');
      }
      const initialCount = await this.feedPage.attachedFiles.count();
      await this.clickOnElement(deleteButtons[0]);
      await this.page.waitForFunction(
        (expectedCount: number) => document.querySelectorAll("div[class='FileItem-name']").length === expectedCount,
        initialCount - 1,
        { timeout: 30000 }
      );
    });
  }

  async clickPostButton(): Promise<void> {
    await test.step('Click post button', async () => {
      await this.clickOnElement(this.feedPage.postButton);
    });
  }

  async openPostOptionsMenu(postText: string): Promise<void> {
    await test.step('Open post options menu', async () => {
      await this.clickOnElement(this.feedPage.getPostOptionsMenuLocator(postText));
    });
  }

  async clickEditOption(): Promise<void> {
    await test.step('Click edit option', async () => {
      await this.clickOnElement(this.feedPage.editButton);
    });
  }

  async clickDeleteOption(): Promise<void> {
    await test.step('Click delete option', async () => {
      await this.clickOnElement(this.feedPage.deleteButton);
    });
  }

  async updatePostText(text: string): Promise<void> {
    await test.step('Update post text', async () => {
      await this.fillInElement(this.feedPage.feedEditor, text);
    });
  }

  async clickUpdateButton(): Promise<void> {
    await test.step('Click update button', async () => {
      await this.clickOnElement(this.feedPage.updateButton);
    });
  }

  async confirmDelete(): Promise<void> {
    await test.step('Confirm delete', async () => {
      await this.clickOnElement(this.feedPage.deleteConfirmButton);
    });
  }

  async clickInlineImagePreview(postText: string): Promise<void> {
    await test.step('Click on inline image preview', async () => {
      await this.clickOnElement(this.feedPage.getLightboxButtonLocator(postText).first());
    });
  }

  async closeImagePreview(): Promise<void> {
    await test.step('Close image preview', async () => {
      await this.clickOnElement(this.feedPage.closeButton);
    });
  }
} 