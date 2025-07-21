import { test, expect } from '@playwright/test';
import { FeedPage } from '../pages/feedPage';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class FeedAssertionHelper extends BaseVerificationUtil {
  constructor(private readonly feedPage: FeedPage) {
    super(feedPage.page);
  }

  async verifyFilesAttached(): Promise<void> {
    await test.step('Verify files are attached', async () => {
      await this.verifyTheElementIsVisible(this.feedPage.attachedFiles.first());
      const attachedFilesCount = await this.feedPage.attachedFiles.count();
      await expect(attachedFilesCount, 'Expected 3 files to be attached').toBe(3);
    });
  }

  async verifyPostCreated(expectedText: string): Promise<void> {
    await test.step('Verify post is created', async () => {
      await this.verifyTheElementIsVisible(this.feedPage.getFeedTextLocator(expectedText));
    });
  }

  async verifyTimestampDisplayed(postText: string): Promise<void> {
    await test.step('Verify timestamp is displayed', async () => {
      const timestampLocator = this.feedPage.getPostTimestampLocator(postText);
      await timestampLocator.scrollIntoViewIfNeeded();
      
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const expectedTime = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;

      const actualTimestamp = await timestampLocator.textContent();
      if (!actualTimestamp) {
        throw new Error(`No timestamp found for post: ${postText}`);
      }

      const actualTime = actualTimestamp.trim();
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
      const lightboxButtons = this.feedPage.getLightboxButtonLocator(postText);
      await this.verifyTheElementIsVisible(lightboxButtons.first());
      const count = await lightboxButtons.count();
      await expect(count, 'Expected exactly 2 inline Images').toBe(expectedCount);
    });
  }

  async verifyInlineImagePreviewVisible(): Promise<void> {
    await test.step('Verify inline image preview is visible', async () => {
      await this.verifyTheElementIsVisible(this.feedPage.inlineImagePreview.first());
    });
  }

  async verifyEditorVisible(): Promise<void> {
    await test.step('Verify editor is visible', async () => {
      await this.verifyTheElementIsVisible(this.feedPage.feedEditor);
    });
  }

  async verifyDeleteConfirmDialog(expectedMessage: string): Promise<void> {
    await test.step('Verify delete confirmation dialog', async () => {
      await this.verifyTheElementIsVisible(this.feedPage.deleteConfirmDialog);
      await this.verifyElementContainsText(this.feedPage.deleteConfirmDialog, expectedMessage);
    });
  }

  async verifyPostDeleted(): Promise<void> {
    await test.step('Verify post is deleted', async () => {
      await this.verifyTheElementIsNotVisible(this.feedPage.feedPosts.first());
    });
  }

  async verifyFileAttachmentsCount(postText: string, expectedCount: number): Promise<void> {
    await test.step(`Verify file attachments count is ${expectedCount}`, async () => {
      const attachmentsCount = await this.feedPage.getPostAttachmentsLocator(postText).count();
      await expect(attachmentsCount, `Expected ${expectedCount} file attachments`).toBe(expectedCount);
    });
  }
} 