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
  readonly inlineImagePreview: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly updateButton: Locator;
  readonly deleteConfirmDialog: Locator;
  readonly deleteConfirmButton: Locator;
  readonly closeButton: Locator;
  readonly getFeedTextLocator: (text: string) => Locator;
  readonly getPostTimestampLocator: (postText: string) => Locator;
  readonly getPostAttachmentsLocator: (postText: string) => Locator;
  readonly getLightboxButtonLocator: (postText: string) => Locator;
  readonly getPostOptionsMenuLocator: (postText: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.shareThoughtsButton = page.getByRole('button', { name: 'Share your thoughts' });
    this.feedEditor = page.locator("div[aria-describedby='content-description']");
    this.fileUploadInput = page.locator("input[type='file']");
    this.attachedFiles = page.locator("div[class='FileItem-name']");
    this.deleteFileIcon = page.locator("button[class*='delete']");
    this.postButton = page.locator("div[class*='PostFormShareContainer'] button:text('Post')");
    this.feedPosts = page.locator('.feed-post');
    this.inlineImagePreview = page.locator("div[class*='gallerySlide'] img");
    this.editButton = page.locator("div:text('Edit')");
    this.deleteButton =page.locator("div:text('Delete')");
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.deleteConfirmDialog = page.locator('div[role="dialog"]');
    this.deleteConfirmButton = page.getByRole('button', { name: 'Delete' });
    this.closeButton = page.locator("button[class*='closeBtn']");
    this.getFeedTextLocator = (text: string) => page.locator(`div[class*='postContent'] p:text("${text}")`);
    this.getPostTimestampLocator = (postText: string) => 
      page.locator("p")
        .filter({ hasText: postText })
        .locator("xpath=./ancestor::div[4]")
        .locator("div[class*='headerInne'] p a");
    this.getPostAttachmentsLocator = (postText: string) => 
      page.locator(`div[class*='postContent']`).filter({ hasText: postText })
        .locator('li');
    this.getLightboxButtonLocator = (postText: string) =>
      page.locator("p")
        .filter({ hasText: postText })
        .locator("xpath=./ancestor::div[3]")
        .locator("button[aria-label='Open image in lightbox']");
    this.getPostOptionsMenuLocator = (postText: string) =>
      page.locator("p")
        .filter({ hasText: postText })
        .locator("xpath=./ancestor::div[4]")
        .locator("button[class*='optionlauncher']");
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
      
      // Wait for files to appear in the UI
      await this.page.waitForSelector("div[class='FileItem-name']", { state: 'visible', timeout: 30000 });
      
      // Wait for expected number of files
      const count = await this.attachedFiles.count();
      
      // Verify file names if needed
      const fileNames = await Promise.all(
        (await this.attachedFiles.all()).map(el => el.textContent())
      );

      if (count !== files.length) {
        throw new Error(`Expected ${files.length} files to be attached, but found ${count}. Files found: ${fileNames.join(', ')}`);
      }
    });
  }

  async verifyFilesAttached(): Promise<void> {
    await test.step('Verify files are attached', async () => {
      await this.verifier.verifyTheElementIsVisible(this.attachedFiles.first());
      const attachedFilesCount = await this.attachedFiles.count();
      await expect(attachedFilesCount, 'Expected 3 files to be attached').toBe(3);
    });
  }

  async removeAttachedFile(): Promise<void> {
    await test.step('Remove attached file', async () => {
      await this.page.waitForSelector("button[class*='delete']", { state: 'visible', timeout: 30000 });
      const deleteButtons = await this.deleteFileIcon.all();
      if (deleteButtons.length === 0) {
        throw new Error('No delete buttons found');
      }

      const initialCount = await this.attachedFiles.count();
      await deleteButtons[0].click();

      // Wait for file count to decrease
      await this.page.waitForFunction(
        (expectedCount) => document.querySelectorAll("div[class='FileItem-name']").length === expectedCount,
        initialCount - 1,
        { timeout: 30000 }
      );
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
      
      // Get UTC date and time
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const expectedTime = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;

      const actualTimestamp = await timestampLocator.textContent();
      if (!actualTimestamp) {
        throw new Error(`No timestamp found for post: ${postText}`);
      }

      const actualTime = actualTimestamp.trim();

      // Check if actual time is within 5 minutes of expected time
      const [actualHour, actualMinute] = actualTime.split(':').map(Number);
      const actualTotalMinutes = actualHour * 60 + actualMinute;
      const expectedTotalMinutes = utcHours * 60 + utcMinutes;
      const timeDiff = Math.abs(actualTotalMinutes - expectedTotalMinutes);

      if (timeDiff > 5) {
        throw new Error(`Timestamp ${actualTime} is not within 5 minutes of expected UTC time ${expectedTime}`);
      }
    });
  }

  async verifyInlineImage(postText: string, expectedCount: number): Promise<void> {
    await test.step('Verify inline image preview', async () => {
      const lightboxButtons = this.getLightboxButtonLocator(postText);
      await this.verifier.verifyTheElementIsVisible(lightboxButtons.first());
      const count = await lightboxButtons.count();
      await expect(count, 'Expected exactly 2 inline Images').toBe(expectedCount);
    });
  }

  async verifyInlineImagePerview(postText: string): Promise<void> {
    await test.step('Click on inline image preview and verify the image', async () => {
      await this.getLightboxButtonLocator(postText).first().click();
      await this.verifier.verifyTheElementIsVisible(this.inlineImagePreview.first());
      await this.closeButton.click();
    });
  }
  async openPostOptionsMenu(postText: string): Promise<void> {
    await test.step('Open post options menu', async () => {
      await this.getPostOptionsMenuLocator(postText).click();
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