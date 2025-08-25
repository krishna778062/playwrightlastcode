import { faker } from '@faker-js/faker';
import { expect, Page, Response, test } from '@playwright/test';

import { PageCreationResponse } from '../apis/types/pageCreationResponse';
import { AttachementUploaderComponent } from '../components/attachementUploader';
import { ImageCropperComponent } from '../components/imageCropper';

import { BasePage } from '@/src/core/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';
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

export interface IAlbumCreationActions {
  createAndPublishAlbum: (options: AlbumCreationOptions) => Promise<{
    title: string;
    description: string;
    albumId: string;
    siteId: string;
    response: PageCreationResponse;
  }>;
  publishAlbum: () => Promise<Response>;
  deleteAlbum: () => Promise<void>;
  uploadImage: (imageName: string) => Promise<void>;
  addVideoUrl: (videoUrl: string) => Promise<void>;
  waitForVideoUpload: () => Promise<void>;
  uploadAttachment: (fileName: string) => Promise<void>;
  addTopics: (topics: string[]) => Promise<void>;
  scrollScreen: (pixels: number) => Promise<void>;
  clickAddFilesAndAttachments: () => Promise<void>;
  uploadFileAttachment: (fileName: string) => Promise<void>;
  uploadMultipleImages: (imageNames: string[]) => Promise<void>;
  hoverAndClickMakeCover: () => Promise<void>;
  openSendFeedbackTab: () => Promise<void>;
  closeFeedbackModal: () => Promise<void>;
  openVersionHistory: () => Promise<void>;
  clickOptionMenuDropdown: () => Promise<void>;
  clickUnpublishButton: () => Promise<void>;
  clickDeleteButton: () => Promise<void>;
  confirmDelete: () => Promise<void>;
  waitForVideoToUpload: () => Promise<void>;
  fillAlbumDetails: (options: Partial<AlbumCreationOptions>) => Promise<void>;
  clickSaveButton: () => Promise<void>;
  clickPublishButton: () => Promise<void>;
  clearAlbumTitle: () => Promise<void>;
  clickScheduleButton: () => Promise<void>;
  fetchContentTypeDetailsUrl: () => Promise<string>;
  createAlbumWithFutureDate: (options: AlbumCreationOptions) => Promise<{
    title: string;
    description: string;
    albumId: string;
    siteId: string;
    response: PageCreationResponse;
  }>;
}

export interface IAlbumCreationAssertions {
  verifyContentPublishedSuccessfully: (title: string) => Promise<void>;
  verifySuccessMessage: (message: string) => Promise<void>;
  verifySendHistoryTabPopup: () => Promise<void>;
  verifyVersionHistoryTabPopup: () => Promise<void>;
  verifyFileAttachmentUploadAndDownload: () => Promise<void>;
  verifyAlbumCoverImageChange: () => Promise<void>;
  verifyAlbumUnpublishFunctionality: () => Promise<void>;
  verifyAlbumDeleteFunctionality: () => Promise<void>;
  verifyScheduleToastMessage: () => Promise<void>;
  verifyAlbumTitleErrorMessage: (message: string) => Promise<void>;
}

export class AlbumCreationPage extends BasePage implements IAlbumCreationActions, IAlbumCreationAssertions {
  // Readonly locators
  readonly imageCaptionInputBox = this.page.getByPlaceholder('Add image caption here');
  readonly uploadedCoverImagePreviewContainer = this.page.locator("[class*='Banner-imageContainer']");
  readonly uploadedCoverImagePreviewImage = this.uploadedCoverImagePreviewContainer.locator('img');
  readonly publishButton = this.page.getByRole('button', { name: 'Publish' });
  readonly skipStepButton = this.page.locator('button', { hasText: 'Skip this step' });
  readonly titleInput = this.page.locator("textarea[placeholder='Album title']");
  readonly albumDescriptionInput = this.page.locator("div[aria-label='Album description']");
  readonly videoUrlInput = this.page.locator('input[placeholder="Paste a video URL"]');
  readonly videoUrlPopupInput = this.page.locator('[data-testid="video-url-popup-input"]');
  readonly videoUploadComplete = this.page.locator('div[class*="AlbumSquare-module-videoIndicator"]');
  readonly openAlbumCheckbox = this.page.locator('label[for="isOpenToSubmissions"]');
  readonly topicInput = this.page.locator('input[id="listOfTopics"]');
  readonly albumImageItem = this.page.locator('[data-testid="album-image-item"]');
  readonly makeCoverButton = this.page.locator('[data-testid="make-cover-button"]');
  readonly sendFeedbackTab = this.page.locator('[data-testid="send-feedback-tab"]');
  readonly closeModalButton = this.page.locator('[data-testid="close-modal-button"]');
  readonly optionMenuDropdown = this.page.locator('[data-testid="option-menu-dropdown"]');

  addTopicFromList(topicText: string) {
    return this.page.locator(`#listOfTopics-list >> text=${topicText}`);
  }
  readonly sendHistoryPopup = this.page.locator('[data-testid="send-history-popup"]');
  readonly versionHistoryPopup = this.page.locator('[data-testid="version-history-popup"]');
  readonly fileAttachmentItem = this.page.locator('[data-testid="file-attachment-item"]');
  readonly coverImageChanged = this.page.locator('[data-testid="cover-image-changed"]');
  readonly scheduleToast = this.page.locator('[data-testid="schedule-toast"]');
  readonly fileInputGeneral = this.page.locator('input[type="file"]');
  readonly fileInputAttachment = this.page.locator('input[type="file"][accept*="*"]');
  readonly addFromContainerInput = this.page.locator('div[class="AddFromContainer"] input');
  readonly addFilesAttachmentsButton = this.page.locator('button:has-text("Add files & attachments")');
  readonly deleteButton = this.page.locator('button:has-text("Delete")');
  readonly enterVideoUrlButton = this.page.locator('button:has-text("enter a video URL")');
  readonly enterVideoURL = this.page.locator('button', { hasText: 'enter a video URL' });
  readonly addVideoButton = this.page.locator('button:has-text("Add video")');
  readonly addVideo = this.page.locator('button', { hasText: 'Add video' });
  readonly saveButton = this.page.locator('button:has-text("Save")');
  readonly versionHistoryButton = this.page.locator('button:has-text("Version history")');
  readonly unpublishButton = this.page.locator('button:has-text("Unpublish")');
  readonly scheduleButton = this.page.locator('button:has-text("Schedule")');

  // Page components
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;

  constructor(page: Page) {
    super(page);
    this.coverImageUploader = new AttachementUploaderComponent(page, this.uploadedCoverImagePreviewContainer);
    this.imageCropper = new ImageCropperComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.titleInput, {
      assertionMessage: 'Album title input should be visible',
    });
  }

  get actions(): IAlbumCreationActions {
    return this;
  }

  get assertions(): IAlbumCreationAssertions {
    return this;
  }

  // Action methods implementation
  async createAndPublishAlbum(options: AlbumCreationOptions): Promise<{
    title: string;
    description: string;
    albumId: string;
    siteId: string;
    response: PageCreationResponse;
  }> {
    return await test.step(`Creating and publishing album with title: ${options.title}`, async () => {
      // Fill album title
      await this.fillInElement(this.titleInput, options.title, {
        stepInfo: 'Fill album title',
      });

      // Fill description
      await this.fillInElement(this.albumDescriptionInput, options.description, {
        stepInfo: 'Fill album description',
      });

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
        await this.clickOnElement(this.addFilesAttachmentsButton, {
          stepInfo: 'Click add files and attachments button',
        });
        for (const attachment of options.attachments) {
          await this.uploadAttachment(attachment);
        }
      }

      // Set open album if specified
      if (options.openAlbum) {
        await this.checkElement(this.openAlbumCheckbox, {
          stepInfo: 'Check open album checkbox',
        });
      }

      // Add topics if provided
      if (options.topics && options.topics.length > 0) {
        await this.addTopics(options.topics);
      }

      // Publish the album
      const publishResponse = await this.publishAlbum();

      // Get response body
      const publishResponseBody = (await publishResponse.json()) as PageCreationResponse;

      // Extract the album ID and site ID from the response
      const albumId = publishResponseBody.result.id;
      const siteId = publishResponseBody.result.site.siteId;

      return {
        title: options.title,
        description: options.description,
        albumId: albumId,
        siteId: siteId,
        response: publishResponseBody,
      };
    });
  }

  async publishAlbum(): Promise<Response> {
    //add pause for debugging
    await this.page.pause();
    return await test.step(`Publishing album and wait for publish api response`, async () => {
      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.publishButton, { delay: 2_000 }),
        response =>
          response.url().includes('content?action=publish') &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
        }
      );
      await this.page.pause();
      return publishResponse;
    });
  }

  async deleteAlbum(): Promise<void> {
    await this.clickOnElement(this.optionMenuDropdown, {
      stepInfo: 'Click option menu dropdown',
    });
    await this.clickOnElement(this.deleteButton, {
      stepInfo: 'Click delete button',
    });
    await this.clickOnElement(this.deleteButton, {
      stepInfo: 'Confirm delete',
    });
  }

  async uploadImage(imageName: string): Promise<void> {
    const reqPromises = [];
    reqPromises.push(
      this.page.waitForResponse(
        response => response.url().includes('X-Amz-SignedHeaders=host') && response.request().method() === 'PUT'
      ),
      35_000
    );
    const fileInput = this.fileInputGeneral.first();
    const filePath = FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', 'images', imageName);
    await this.addInputFiles(fileInput, filePath);
    //wait for all the requests to be completed
    await Promise.all(reqPromises);
  }

  async addVideoUrl(videoUrl: string): Promise<void> {
    await this.clickOnElement(this.enterVideoURL);
    await this.fillInElement(this.videoUrlInput, videoUrl, {
      stepInfo: 'Fill video URL input',
    });
    await this.clickOnElement(this.addVideo);
  }

  async waitForVideoUpload(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.videoUploadComplete, {
      timeout: CONTENT_TEST_DATA.TIMEOUTS.VIDEO_UPLOAD,
      stepInfo: 'Wait for video upload to complete',
    });
  }

  async uploadAttachment(fileName: string): Promise<void> {
    await test.step(`Upload attachment: ${fileName}`, async () => {
      // Setup request promise for attachment upload
      const reqPromises = [];
      reqPromises.push(
        this.page.waitForResponse(
          response => response.url().includes('X-Amz-SignedHeaders=host') && response.request().method() === 'PUT'
        ),
        35_000
      );

      const filePath = FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', 'images', fileName);
      await this.addInputFiles(this.addFromContainerInput, filePath);

      // Wait for the upload request to complete
      await Promise.all(reqPromises);
    });
  }

  async addTopics(topics: string[]): Promise<void> {
    for (const topic of topics) {
      await this.fillInElement(this.topicInput, topic, {
        stepInfo: `Fill topic: ${topic}`,
      });
      await this.clickOnElement(this.addTopicFromList(topic));
    }
  }

  async scrollScreen(pixels: number): Promise<void> {
    await this.page.evaluate(px => window.scrollBy(0, px), pixels);
  }

  async clickAddFilesAndAttachments(): Promise<void> {
    await this.clickOnElement(this.addFilesAttachmentsButton, {
      stepInfo: 'Click add files and attachments button',
    });
  }

  async uploadFileAttachment(fileName: string): Promise<void> {
    await this.uploadAttachment(fileName);
  }

  async uploadMultipleImages(imageNames: string[]): Promise<void> {
    for (const imageName of imageNames) {
      await this.uploadImage(imageName);
    }
  }

  async hoverAndClickMakeCover(): Promise<void> {
    await this.albumImageItem.hover();
    await this.clickOnElement(this.makeCoverButton, {
      stepInfo: 'Click make cover button',
    });
  }

  async openSendFeedbackTab(): Promise<void> {
    await this.clickOnElement(this.sendFeedbackTab, {
      stepInfo: 'Click send feedback tab',
    });
  }

  async closeFeedbackModal(): Promise<void> {
    await this.clickOnElement(this.closeModalButton, {
      stepInfo: 'Click close modal button',
    });
  }

  async openVersionHistory(): Promise<void> {
    await this.clickOnElement(this.versionHistoryButton, {
      stepInfo: 'Click version history button',
    });
  }

  async clickOptionMenuDropdown(): Promise<void> {
    await this.clickOnElement(this.optionMenuDropdown, {
      stepInfo: 'Click option menu dropdown',
    });
  }

  async clickUnpublishButton(): Promise<void> {
    await this.clickOnElement(this.unpublishButton, {
      stepInfo: 'Click unpublish button',
    });
  }

  async clickDeleteButton(): Promise<void> {
    await this.clickOnElement(this.deleteButton, {
      stepInfo: 'Click delete button',
    });
  }

  async confirmDelete(): Promise<void> {
    await this.clickOnElement(this.deleteButton, {
      stepInfo: 'Confirm delete action',
    });
  }

  async waitForVideoToUpload(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.videoUploadComplete, {
      timeout: CONTENT_TEST_DATA.TIMEOUTS.VIDEO_UPLOAD,
      stepInfo: 'Wait for video to upload',
    });
  }

  async fillAlbumDetails(options: Partial<AlbumCreationOptions>): Promise<void> {
    if (options.title) {
      await this.fillInElement(this.titleInput, options.title, {
        stepInfo: 'Fill album title',
      });
    }
    if (options.description) {
      await this.fillInElement(this.albumDescriptionInput, options.description, {
        stepInfo: 'Fill album description',
      });
    }
    if (options.images && options.images.length > 0) {
      for (const image of options.images) {
        await this.uploadImage(image);
      }
    }
  }

  async clickSaveButton(): Promise<void> {
    await this.clickOnElement(this.saveButton, {
      stepInfo: 'Click save button',
    });
  }

  async clickPublishButton(): Promise<void> {
    await this.clickOnElement(this.publishButton, {
      stepInfo: 'Click publish button',
    });
  }

  async clearAlbumTitle(): Promise<void> {
    await this.fillInElement(this.titleInput, '', {
      stepInfo: 'Clear album title',
    });
  }

  async clickScheduleButton(): Promise<void> {
    await this.clickOnElement(this.scheduleButton, {
      stepInfo: 'Click schedule button',
    });
  }

  async fetchContentTypeDetailsUrl(): Promise<string> {
    return this.page.url();
  }

  async createAlbumWithFutureDate(options: AlbumCreationOptions): Promise<{
    title: string;
    description: string;
    albumId: string;
    siteId: string;
    response: PageCreationResponse;
  }> {
    return await test.step(`Creating album with future date: ${options.title}`, async () => {
      // Fill album title
      await this.fillInElement(this.titleInput, options.title, {
        stepInfo: 'Fill album title',
      });

      // Fill description
      await this.fillInElement(this.albumDescriptionInput, options.description, {
        stepInfo: 'Fill album description',
      });

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

      // Set future publish date (placeholder implementation)
      // This would need actual date picker interaction

      // For now, return placeholder data
      const albumId = faker.string.uuid();
      const siteId = faker.string.uuid();
      const response: PageCreationResponse = {
        result: {
          id: albumId,
          site: {
            siteId: siteId,
          },
        },
      } as PageCreationResponse;

      return {
        title: options.title,
        description: options.description,
        albumId: albumId,
        siteId: siteId,
        response: response,
      };
    });
  }

  // Assertion methods implementation
  async verifyContentPublishedSuccessfully(title: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator(`text=${title}`), {
      assertionMessage: `Album title '${title}' should be visible`,
    });
    await this.verifier.verifyTheElementIsVisible(this.page.locator('text=Created album successfully'), {
      assertionMessage: 'Success message should be visible',
    });
  }

  async verifySuccessMessage(message: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator(`text=${message}`), {
      assertionMessage: `Success message '${message}' should be visible`,
    });
  }

  async verifySendHistoryTabPopup(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.sendHistoryPopup, {
      assertionMessage: 'Send history popup should be visible',
    });
  }

  async verifyVersionHistoryTabPopup(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.versionHistoryPopup, {
      assertionMessage: 'Version history popup should be visible',
    });
  }

  async verifyFileAttachmentUploadAndDownload(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.fileAttachmentItem, {
      assertionMessage: 'File attachment item should be visible',
    });
  }

  async verifyAlbumCoverImageChange(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.coverImageChanged, {
      assertionMessage: 'Cover image changed indicator should be visible',
    });
  }

  async verifyAlbumUnpublishFunctionality(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator('text=Album unpublished successfully'), {
      assertionMessage: 'Album unpublished success message should be visible',
    });
  }

  async verifyAlbumDeleteFunctionality(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator('text=Album deleted successfully'), {
      assertionMessage: 'Album deleted success message should be visible',
    });
  }

  async verifyScheduleToastMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.scheduleToast, {
      assertionMessage: 'Schedule toast message should be visible',
    });
  }

  async verifyAlbumTitleErrorMessage(message: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator(`text=${message}`), {
      assertionMessage: `Album title error message '${message}' should be visible`,
    });
  }
}
