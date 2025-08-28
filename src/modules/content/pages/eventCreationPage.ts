import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { PageCreationResponse } from '@/src/modules/content/apis/types/pageCreationResponse';
import { AttachementUploaderComponent } from '@/src/modules/content/components/attachementUploader';
import { ImageCropperComponent } from '@/src/modules/content/components/imageCropper';

export interface EventCreationOptions {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  coverImage?: {
    fileName: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
}

export interface IEventCreationActions {
  createAndPublishEvent(options: EventCreationOptions): Promise<{
    eventId: string;
    siteId: string;
  }>;
}

export interface IEventCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
}

export class EventCreationPage extends BasePage implements IEventCreationActions, IEventCreationAssertions {
  // Essential locators for event creation
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly locationInput: Locator;
  readonly publishButton: Locator;

  // Cover image components (if needed)
  readonly coverImageUploaderContainer: Locator;
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;

  constructor(page: Page) {
    super(page);

    // Essential event creation locators
    this.titleInput = page.locator("textarea[placeholder='Event title']");
    this.descriptionInput = page.locator("div[aria-label='Event description']");
    this.locationInput = page.locator('input[id="Location"]');
    this.publishButton = page.getByRole('button', { name: 'Publish' });

    // Cover image components (optional)
    this.coverImageUploaderContainer = page
      .locator("[class*='AddFromContainer']")
      .filter({ hasText: 'Select from computer' })
      .nth(0);
    this.coverImageUploader = new AttachementUploaderComponent(page, this.coverImageUploaderContainer);
    this.imageCropper = new ImageCropperComponent(page);
  }

  get actions(): IEventCreationActions {
    return this;
  }

  get assertions(): IEventCreationAssertions {
    return this;
  }

  /**
   * Verifies the event creation page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify event creation page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.verifier.verifyTheElementIsVisible(this.titleInput, {
        assertionMessage: 'Title input should be visible on event creation page',
      });
    });
  }

  /**
   * Creates a page with the given options and publishes it
   * @param options - The options for creating the page
   * @returns The options for the created page
   */
  async createAndPublishEvent(options: EventCreationOptions): Promise<{
    eventId: string;
    siteId: string;
  }> {
    return await test.step(`Creating and publishing event with title: ${options.title}`, async () => {
      // Fill in event mandatory details
      await this.fillEventDetails({
        title: options.title,
        description: options.description,
        location: options.location,
      });

      // Upload cover image if provided
      if (options.coverImage) {
        await this.uploadCoverImage(options.coverImage.fileName, {
          widescreenCropOption: options.coverImage.cropOptions?.widescreen,
          squareCropOption: options.coverImage.cropOptions?.square,
        });
      }

      // Publish the event
      const publishResponse = await this.publishEvent();

      // Parse response body
      const publishResponseBody = (await publishResponse.json()) as PageCreationResponse;

      // Extract event ID and site ID from response
      const eventId = publishResponseBody.result.id;
      const siteId = publishResponseBody.result.site.siteId;

      return {
        eventId: eventId,
        siteId: siteId,
      };
    });
  }

  /**
   * Uploads a cover image for the event (optional)
   * @param fileName - The name of the file to upload
   */
  async uploadCoverImage(
    fileName: string,
    options?: {
      widescreenCropOption?: boolean;
      squareCropOption?: boolean;
    }
  ) {
    await test.step(`Upload cover image: ${fileName}`, async () => {
      // Setup response promises for 3 upload requests
      const responsePromises = [];
      const responsePromise = this.page.waitForResponse(
        response =>
          response.request().url().includes('X-Amz-SignedHeaders=host') &&
          response.request().method() === 'PUT' &&
          response.status() === 200,
        { timeout: 35000 }
      );
      responsePromises.push(responsePromise);

      const imagePath = FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', 'images', fileName);
      await this.coverImageUploader.uploadAttachment(imagePath);

      // Handle crop options
      if (options?.widescreenCropOption) {
        await this.imageCropper.selectCropOption('Widescreen');
      }
      await this.imageCropper.clickOnNextButton();

      if (options?.squareCropOption) {
        await this.imageCropper.selectCropOption('Square');
      }
      await this.imageCropper.clickOnNextButton();
      await this.imageCropper.clickOnNextButton();
      await this.imageCropper.clickOnAddButton();

      // Wait for all 3 upload responses to complete with 200 status
      await Promise.all(responsePromises);
    });
  }

  /**
   * Fills in the event details
   * @param options - The options for filling in the event details
   */
  async fillEventDetails(options: { title: string; description: string; location: string }) {
    await test.step(`Filling event details`, async () => {
      // Add title
      await this.fillInElement(this.titleInput, options.title);

      // Add description
      await this.fillInElement(this.descriptionInput, options.description);

      //add location
      await this.fillInElement(this.locationInput, options.location);
    });
  }

  /**
   * Publishes the event and waits for API response
   */
  async publishEvent(): Promise<Response> {
    return await test.step(`Publishing event and wait for publish api response`, async () => {
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
}
