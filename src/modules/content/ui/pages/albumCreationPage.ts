import { Locator, Page, Response, test } from '@playwright/test';

import { AlbumCreationResponse } from '@content/apis/types/albumCreationResponse';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { AttachementUploaderComponent } from '@content/ui/components/attachementUploader';
import { ImageCropperComponent } from '@content/ui/components/imageCropper';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';

export interface AlbumCreationOptions {
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
    response: AlbumCreationResponse;
  }>;
  createAndSubmitAlbum: (options: AlbumCreationOptions) => Promise<{
    title: string;
    description: string;
    albumId: string;
    siteId: string;
    peopleName: string;
    peopleId: string;
    response: AlbumCreationResponse;
  }>;
}

export class AlbumCreationPage extends BasePage {
  // Page components
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;

  // Readonly locators - only used ones
  readonly uploadedCoverImagePreviewContainer: Locator;
  readonly publishButton: Locator;
  readonly submitButton: Locator;
  readonly titleInput: Locator;
  readonly albumDescriptionInput: Locator;
  readonly videoUrlInput: Locator;
  readonly videoUploadComplete: Locator;
  readonly openAlbumCheckbox: Locator;
  readonly topicInput: Locator;
  readonly fileInputGeneral: Locator;
  readonly addFromContainerInput: Locator;
  readonly addFilesAttachmentsButton: Locator;
  readonly enterVideoURL: Locator;
  readonly addVideo: Locator;

  constructor(page: Page, siteId?: string) {
    super(page, PAGE_ENDPOINTS.getAlbumCreationPage(siteId ?? ''));
    this.uploadedCoverImagePreviewContainer = this.page.locator("[class*='Banner-imageContainer']");
    this.coverImageUploader = new AttachementUploaderComponent(page, this.uploadedCoverImagePreviewContainer);
    this.imageCropper = new ImageCropperComponent(page);
    this.publishButton = this.page.getByRole('button', { name: 'Publish' });
    this.submitButton = this.page.locator('span').filter({ hasText: 'Submit for approval' });
    this.titleInput = this.page.locator("textarea[placeholder='Album title']");
    this.albumDescriptionInput = this.page.locator("div[aria-label='Album description']");
    this.videoUrlInput = this.page.locator('input[placeholder="Paste a video URL"]');
    this.videoUploadComplete = this.page.locator('div[class*="AlbumSquare-module-videoIndicator"]');
    this.openAlbumCheckbox = this.page.locator('label[for="isOpenToSubmissions"]');
    this.topicInput = this.page.locator('input[id="listOfTopics"]');
    this.fileInputGeneral = this.page.locator('input[type="file"]');
    this.addFromContainerInput = this.page.locator('div[class="AddFromContainer"] input');
    this.addFilesAttachmentsButton = this.page.locator('button:has-text("Add files & attachments")');
    this.enterVideoURL = this.page.locator('button', { hasText: 'enter a video URL' });
    this.addVideo = this.page.locator('button', { hasText: 'Add video' });
  }

  addTopicFromList(topicText: string) {
    return this.page.locator(`#listOfTopics-list >> text=${topicText}`);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.titleInput, {
      assertionMessage: 'Album title input should be visible',
    });
  }

  get actions(): IAlbumCreationActions {
    return this;
  }

  // Action methods implementation
  async createAndPublishAlbum(options: AlbumCreationOptions): Promise<{
    title: string;
    description: string;
    albumId: string;
    siteId: string;
    response: AlbumCreationResponse;
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
      const publishResponseBody = (await publishResponse.json()) as AlbumCreationResponse;

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
      return publishResponse;
    });
  }

  async uploadImage(imageName: string): Promise<void> {
    await test.step(`Upload image and wait for upload api response: ${imageName}`, async () => {
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
    });
  }

  async addVideoUrl(videoUrl: string): Promise<void> {
    await test.step(`Add video URL: ${videoUrl}`, async () => {
      await this.clickOnElement(this.enterVideoURL, {
        stepInfo: 'Click on "Enter Video URL" button',
      });
      await this.fillInElement(this.videoUrlInput, videoUrl, {
        stepInfo: `Fill video URL input with: ${videoUrl}`,
      });
      await this.clickOnElement(this.addVideo, {
        stepInfo: 'Click "Add Video" button to confirm',
      });
    });
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

      // Determine folder based on file extension
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const folder = ['docx', 'xlsx', 'pdf'].includes(fileExtension || '') ? 'excel' : 'images';
      const filePath = FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', folder, fileName);
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

  async createAndSubmitAlbum(options: AlbumCreationOptions): Promise<{
    title: string;
    description: string;
    albumId: string;
    siteId: string;
    peopleName: string;
    peopleId: string;
    response: AlbumCreationResponse;
  }> {
    return await test.step(`Creating and submit album with title: ${options.title}`, async () => {
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
      const submitResponse = await this.submitAlbum();

      // Get response body
      const submitResponseBody = (await submitResponse.json()) as AlbumCreationResponse;

      // Extract the album ID and site ID from the response
      const albumId = submitResponseBody.result.id;
      const siteId = submitResponseBody.result.site.siteId;
      const peopleId = submitResponseBody.result.authoredBy.peopleId;
      const peopleName = submitResponseBody.result.authoredBy.name;

      return {
        title: options.title,
        description: options.description,
        albumId: albumId,
        siteId: siteId,
        peopleId: peopleId,
        peopleName: peopleName.trim(),
        response: submitResponseBody,
      };
    });
  }

  async submitAlbum(): Promise<Response> {
    return await test.step(`Submitting album and wait for publish api response`, async () => {
      const submitResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.submitButton, { delay: 2_000 }),
        response =>
          response.url().includes('content?action=publish') &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
        }
      );
      return submitResponse;
    });
  }
}
