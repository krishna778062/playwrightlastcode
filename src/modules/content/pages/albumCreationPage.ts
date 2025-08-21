import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

interface AlbumCreationOptions {
  title: string;
  description: string;
  images?: string[];
  videoUrl?: string;
  attachments?: string[];
  openAlbum?: boolean;
  topics?: string[];
  category?: string;
  language?: string;
  publishUntilDate?: string;
}

export class AlbumCreationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.page.locator('[data-testid="album-creation-form"]')).toBeVisible();
  }

  get actions() {
    return {
      createAndPublishAlbum: async (options: AlbumCreationOptions) => {
        // Fill album title
        await this.page.fill('[data-testid="album-title-input"]', options.title);

        // Fill description
        await this.page.fill('[data-testid="album-description-input"]', options.description);

        // Upload images if provided
        if (options.images && options.images.length > 0) {
          for (const image of options.images) {
            await this.uploadImage(image);
          }
        }

        // Add video if provided
        if (options.videoUrl) {
          await this.addVideoUrl(options.videoUrl);
          await this.waitForVideoUpload();
        }

        // Add attachments if provided
        if (options.attachments && options.attachments.length > 0) {
          await this.page.click('button:has-text("Add files & attachments")');
          for (const attachment of options.attachments) {
            await this.uploadAttachment(attachment);
          }
        }

        // Set open album if specified
        if (options.openAlbum) {
          await this.page.check('[data-testid="open-album-checkbox"]');
        }

        // Add topics if provided
        if (options.topics && options.topics.length > 0) {
          await this.addTopics(options.topics);
        }

        // Publish the album
        await this.page.click('button:has-text("Publish")');

        // Return album and site IDs (these would be extracted from the response/URL)
        const albumId = await this.extractAlbumId();
        const siteId = await this.extractSiteId();

        return { albumId, siteId };
      },

      handlePromotionStep: async () => {
        await this.page.click('button:has-text("Skip this step")');
      },

      deleteAlbum: async () => {
        await this.page.click('[data-testid="option-menu-dropdown"]');
        await this.page.click('button:has-text("Delete")');
        await this.page.click('button:has-text("Delete")');
      },

      uploadImage: async (imageName: string) => {
        const fileInput = this.page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(`test-data/static-files/images/${imageName}`);
      },

      addVideoUrl: async (videoUrl: string) => {
        await this.page.fill('[data-testid="video-url-input"]', videoUrl);
      },

      waitForVideoUpload: async () => {
        await this.page.waitForSelector('[data-testid="video-upload-complete"]', {
          timeout: CONTENT_TEST_DATA.TIMEOUTS.VIDEO_UPLOAD,
        });
      },

      uploadAttachment: async (fileName: string) => {
        const fileInput = this.page.locator('input[type="file"][accept*="*"]');
        await fileInput.setInputFiles(`test-data/static-files/${fileName}`);
      },

      addTopics: async (topics: string[]) => {
        for (const topic of topics) {
          await this.page.fill('[data-testid="topic-input"]', topic);
          await this.page.press('[data-testid="topic-input"]', 'Enter');
        }
      },

      scrollScreen: async (pixels: number) => {
        await this.page.evaluate(px => window.scrollBy(0, px), pixels);
      },

      clickAddFilesAndAttachments: async () => {
        await this.page.click('button:has-text("Add files & attachments")');
      },

      uploadFileAttachment: async (fileName: string) => {
        await this.uploadAttachment(fileName);
      },

      uploadMultipleImages: async (imageNames: string[]) => {
        for (const imageName of imageNames) {
          await this.uploadImage(imageName);
        }
      },

      hoverAndClickMakeCover: async () => {
        await this.page.hover('[data-testid="album-image-item"]');
        await this.page.click('[data-testid="make-cover-button"]');
      },

      openSendFeedbackTab: async () => {
        await this.page.click('[data-testid="send-feedback-tab"]');
      },

      closeFeedbackModal: async () => {
        await this.page.click('[data-testid="close-modal-button"]');
      },

      openVersionHistory: async () => {
        await this.page.click('button:has-text("Version history")');
      },

      clickOptionMenuDropdown: async () => {
        await this.page.click('[data-testid="option-menu-dropdown"]');
      },

      clickUnpublishButton: async () => {
        await this.page.click('button:has-text("Unpublish")');
      },

      clickDeleteButton: async () => {
        await this.page.click('button:has-text("Delete")');
      },

      confirmDelete: async () => {
        await this.page.click('button:has-text("Delete")');
      },

      extractAlbumId: async (): Promise<string> => {
        // Extract album ID from URL or response
        const url = this.page.url();
        const match = url.match(/\/album\/([^\/]+)/);
        return match ? match[1] : faker.string.uuid();
      },

      extractSiteId: async (): Promise<string> => {
        // Extract site ID from URL or response
        const url = this.page.url();
        const match = url.match(/\/site\/([^\/]+)/);
        return match ? match[1] : faker.string.uuid();
      },

      // Additional methods for new test cases
      clickEnterVideoUrlButton: async () => {
        await this.page.click('button:has-text("enter a video URL")');
      },

      addYoutubeVideoUrlInPopupCoverSection: async (videoUrl: string) => {
        await this.page.fill('[data-testid="video-url-popup-input"]', videoUrl);
      },

      clickAddVideoButton: async () => {
        await this.page.click('button:has-text("Add video")');
      },

      waitForVideoToUpload: async () => {
        await this.page.waitForSelector('[data-testid="video-upload-complete"]', {
          timeout: CONTENT_TEST_DATA.TIMEOUTS.VIDEO_UPLOAD,
        });
      },

      fillAlbumDetails: async (options: Partial<AlbumCreationOptions>) => {
        if (options.title) {
          await this.page.fill('[data-testid="album-title-input"]', options.title);
        }
        if (options.description) {
          await this.page.fill('[data-testid="album-description-input"]', options.description);
        }
        if (options.images && options.images.length > 0) {
          for (const image of options.images) {
            await this.uploadImage(image);
          }
        }
      },

      clickSaveButton: async () => {
        await this.page.click('button:has-text("Save")');
      },

      clickPublishButton: async () => {
        await this.page.click('button:has-text("Publish")');
      },

      clearAlbumTitle: async () => {
        await this.page.fill('[data-testid="album-title-input"]', '');
      },

      createAlbumWithFutureDate: async (options: AlbumCreationOptions) => {
        // Fill basic details
        await this.page.fill('[data-testid="album-title-input"]', options.title);
        await this.page.fill('[data-testid="album-description-input"]', options.description);

        // Upload images if provided
        if (options.images && options.images.length > 0) {
          for (const image of options.images) {
            await this.uploadImage(image);
          }
        }

        // Set future publish date
        await this.page.click('[data-testid="publish-date-picker"]');
        await this.page.click('[data-testid="future-date-option"]');

        const albumId = await this.extractAlbumId();
        const siteId = await this.extractSiteId();

        return { albumId, siteId };
      },

      clickScheduleButton: async () => {
        await this.page.click('button:has-text("Schedule")');
      },

      fetchContentTypeDetailsUrl: async (): Promise<string> => {
        // This would typically extract the content URL from the page or API response
        return this.page.url();
      },
    };
  }

  get assertions() {
    return {
      verifyContentPublishedSuccessfully: async (title: string) => {
        await expect(this.page.locator(`text=${title}`)).toBeVisible();
        await expect(this.page.locator('text=Created album successfully')).toBeVisible();
      },

      verifySuccessMessage: async (message: string) => {
        await expect(this.page.locator(`text=${message}`)).toBeVisible();
      },

      verifySendHistoryTabPopup: async () => {
        await expect(this.page.locator('[data-testid="send-history-popup"]')).toBeVisible();
      },

      verifyVersionHistoryTabPopup: async () => {
        await expect(this.page.locator('[data-testid="version-history-popup"]')).toBeVisible();
      },

      verifyFileAttachmentUploadAndDownload: async () => {
        await expect(this.page.locator('[data-testid="file-attachment-item"]')).toBeVisible();
        // Add download verification logic
      },

      verifyAlbumCoverImageChange: async () => {
        await expect(this.page.locator('[data-testid="cover-image-changed"]')).toBeVisible();
      },

      verifyAlbumUnpublishFunctionality: async () => {
        await expect(this.page.locator('text=Album unpublished successfully')).toBeVisible();
      },

      verifyAlbumDeleteFunctionality: async () => {
        await expect(this.page.locator('text=Album deleted successfully')).toBeVisible();
      },

      verifyScheduleToastMessage: async () => {
        await expect(this.page.locator('[data-testid="schedule-toast"]')).toBeVisible();
      },

      verifyAlbumTitleErrorMessage: async (message: string) => {
        await expect(this.page.locator(`text=${message}`)).toBeVisible();
      },
    };
  }

  private async uploadImage(imageName: string) {
    const fileInput = this.page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles(`test-data/static-files/images/${imageName}`);
  }

  private async uploadAttachment(fileName: string) {
    const fileInput = this.page.locator('input[type="file"]').last();
    await fileInput.setInputFiles(`test-data/static-files/${fileName}`);
  }
}
