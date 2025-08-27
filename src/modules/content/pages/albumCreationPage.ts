import { Page, Response, test } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { AlbumCreationResponse } from '@/src/modules/content/apis/types/albumCreationResponse';
import { AttachementUploaderComponent } from '@/src/modules/content/components/attachementUploader';
import { ImageCropperComponent } from '@/src/modules/content/components/imageCropper';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

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
}

export interface IAlbumCreationAssertions {}

export class AlbumCreationPage extends BasePage implements IAlbumCreationActions, IAlbumCreationAssertions {
  // Readonly locators - only used ones
  readonly uploadedCoverImagePreviewContainer = this.page.locator("[class*='Banner-imageContainer']");
  readonly publishButton = this.page.getByRole('button', { name: 'Publish' });
  readonly titleInput = this.page.locator("textarea[placeholder='Album title']");
  readonly albumDescriptionInput = this.page.locator("div[aria-label='Album description']");
  readonly videoUrlInput = this.page.locator('input[placeholder="Paste a video URL"]');
  readonly videoUploadComplete = this.page.locator('div[class*="AlbumSquare-module-videoIndicator"]');
  readonly openAlbumCheckbox = this.page.locator('label[for="isOpenToSubmissions"]');
  readonly topicInput = this.page.locator('input[id="listOfTopics"]');
  readonly fileInputGeneral = this.page.locator('input[type="file"]');
  readonly addFromContainerInput = this.page.locator('div[class="AddFromContainer"] input');
  readonly addFilesAttachmentsButton = this.page.locator('button:has-text("Add files & attachments")');
  readonly enterVideoURL = this.page.locator('button', { hasText: 'enter a video URL' });
  readonly addVideo = this.page.locator('button', { hasText: 'Add video' });

  addTopicFromList(topicText: string) {
    return this.page.locator(`#listOfTopics-list >> text=${topicText}`);
  }

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
}
