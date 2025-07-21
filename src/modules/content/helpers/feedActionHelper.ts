import { test } from '@playwright/test';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { FeedPage } from '../pages/feedPage';

export class FeedActionHelper extends BaseActionUtil {
  constructor(private readonly feedPage: FeedPage) {
    super(feedPage.page);
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
      await this.feedPage.page.waitForSelector("div[class='FileItem-name']", { state: 'visible', timeout: 30000 });
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
      await this.feedPage.page.waitForSelector("button[class*='delete']", { state: 'visible', timeout: 30000 });
      const deleteButtons = await this.feedPage.deleteFileIcon.all();
      if (deleteButtons.length === 0) {
        throw new Error('No delete buttons found');
      }
      const initialCount = await this.feedPage.attachedFiles.count();
      await this.clickOnElement(deleteButtons[0]);
      await this.feedPage.page.waitForFunction(
        (expectedCount) => document.querySelectorAll("div[class='FileItem-name']").length === expectedCount,
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

  async clickDeleteOption(): Promise<void> {
    await test.step('Click delete option', async () => {
      await this.clickOnElement(this.feedPage.deleteButton);
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