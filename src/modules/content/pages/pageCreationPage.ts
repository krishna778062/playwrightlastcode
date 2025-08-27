import { Locator, Page, Response, test } from '@playwright/test';

import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { BasePage } from '@core/pages/basePage';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { PageCreationResponse } from '@/src/modules/content/apis/types/pageCreationResponse';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { AttachementUploaderComponent } from '@/src/modules/content/components/attachementUploader';
import { ImageCropperComponent } from '@/src/modules/content/components/imageCropper';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

export interface PageCreationOptions {
  // Required fields
  title: string;
  description: string;
  category: string;
  contentType: PageContentType;

  // Optional fields
  coverImage?: {
    fileName: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
}

export interface IPageCreationActions {
  uploadCoverImage: (
    fileName: string,
    options?: { widescreenCropOption?: boolean; squareCropOption?: boolean }
  ) => Promise<void>;
  fillPageDetails: (options: {
    category: string;
    contentType: string;
    title: string;
    description: string;
  }) => Promise<void>;
  publishPage: () => Promise<Response>;
  createAndPublishPage: (options: PageCreationOptions) => Promise<{
    title: string;
    description: string;
    category: string;
    contentType: PageContentType;
    pageId: string;
    siteId: string;
    response: PageCreationResponse;
  }>;
  navigateToAddContentModal: () => Promise<void>;
}

export interface IPageCreationAssertions {
  verifyUploadedCoverImagePreviewIsVisible: (options?: { timeout?: number }) => Promise<void>;
}

export class PageCreationPage extends BasePage implements IPageCreationActions, IPageCreationAssertions {
  //root locators of some components
  readonly coverImageUploaderContainer: Locator;
  readonly fileAttachmentUploaderContainer: Locator;
  readonly imageCaptionInputBox: Locator;
  readonly uploadedCoverImagePreviewContainer: Locator;
  readonly uploadedCoverImagePreviewImage: Locator;
  readonly categoryDropdown: Locator;
  readonly contentTypeCheckbox: (type: string) => Locator;
  readonly publishButton: Locator;
  readonly skipStepButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  // Page components
  readonly addContentModal: AddContentModalComponent;
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly fileAttachmentUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;
  readonly sideNavBarComponent: SideNavBarComponent;

  constructor(page: Page) {
    super(page);
    //root locators of some components
    this.coverImageUploaderContainer = page
      .locator("[class*='AddFromContainer']")
      .filter({ hasText: 'Select from computer' })
      .nth(0);
    this.fileAttachmentUploaderContainer = page
      .locator("[class*='AddFromContainer']")
      .filter({ hasText: 'Select from computer' })
      .nth(1);
    this.imageCaptionInputBox = page.getByPlaceholder('Add image caption here');
    this.uploadedCoverImagePreviewContainer = page.locator("[class*='Banner-imageContainer']");
    this.uploadedCoverImagePreviewImage = this.uploadedCoverImagePreviewContainer.locator('img');
    this.categoryDropdown = page.locator('label[for="category"] + div input');
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.skipStepButton = page.locator('button', { hasText: 'Skip this step' });
    this.titleInput = page.locator("textarea[placeholder='Page title']");
    this.descriptionInput = page.locator("div[aria-label='Page content']");
    this.contentTypeCheckbox = (type: string) => page.locator('label:has(span)', { hasText: type });
    // Page components
    this.addContentModal = new AddContentModalComponent(page);
    this.coverImageUploader = new AttachementUploaderComponent(page, this.coverImageUploaderContainer);
    this.fileAttachmentUploader = new AttachementUploaderComponent(page, this.fileAttachmentUploaderContainer);
    this.imageCropper = new ImageCropperComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.titleInput, {
      assertionMessage: 'Page title input should be visible',
    });
  }

  get actions(): IPageCreationActions {
    return this;
  }

  get assertions(): IPageCreationAssertions {
    return this;
  }

  /**
   * Uploads a cover image to the page creation page
   * It calls uploadAttachment from attachementUploader component
   * and then clicks on next button twice to go to the image cropper page
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

      //handle wide screen crop option
      if (options?.widescreenCropOption) {
        await this.imageCropper.selectCropOption('Widescreen');
      }
      await this.imageCropper.clickOnNextButton();

      //handle square crop option
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
   * Fills in the page details
   * @param options - The options for filling in the page details
   */
  async fillPageDetails(options: { category: string; contentType: string; title: string; description: string }) {
    await test.step(`Filling page details`, async () => {
      //add title
      await this.fillInElement(this.titleInput, options.title);

      //add description
      await this.fillInElement(this.descriptionInput, options.description);

      // Handle category selection
      await this.clickOnElement(this.categoryDropdown);
      await this.fillInElement(this.categoryDropdown, options.category);
      await this.categoryDropdown.press('Enter');

      await this.clickOnElement(this.contentTypeCheckbox(options.contentType));
    });
  }

  /**
   * TODO: Improve publish mechanism with better API handling:
   * - Currently we click publish button and wait for API response
   * - Need to add polling mechanism to check API response status
   * - Implement try-catch with proper retries:
   *   try {
   *     await this.clickPublishButton()
   *     const response = await this.waitForPublishResponse()
   *     if (!response.ok()) {
   *       throw new Error('Publish failed')
   *     }
   *   } catch (error) {
   *     // Handle API failures
   *     // Retry with exponential backoff
   *   }
   */
  async publishPage(): Promise<Response> {
    return await test.step(`Publishing page and wait for publish api response`, async () => {
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

  /**
   * Creates a page with the given options and publishes it
   * @param options - The options for creating the page
   * @returns The options for the created page
   */
  async createAndPublishPage(options: PageCreationOptions): Promise<{
    title: string;
    description: string;
    category: string;
    contentType: PageContentType;
    pageId: string;
    siteId: string;
    response: PageCreationResponse;
  }> {
    return await test.step(`Creating and publishing page with title: ${options.title}`, async () => {
      // Fill in page mandatory details
      await this.fillPageDetails({
        title: options.title,
        description: options.description,
        category: options.category,
        contentType: options.contentType,
      });

      // Upload cover image if provided
      if (options.coverImage) {
        await this.uploadCoverImage(options.coverImage.fileName, {
          widescreenCropOption: options.coverImage.cropOptions?.widescreen,
          squareCropOption: options.coverImage.cropOptions?.square,
        });
      }
      // Publish the page
      const publishResponse = await this.publishPage();

      //json body
      const publishResponseBody = (await publishResponse.json()) as PageCreationResponse;

      //fetch the page id from the response
      const pageId = publishResponseBody.result.id;
      const siteId = publishResponseBody.result.site.siteId;

      return {
        title: options.title,
        description: options.description,
        category: options.category,
        contentType: options.contentType,
        pageId: pageId,
        siteId: siteId,
        response: publishResponseBody,
      };
    });
  }

  /**
   * Navigates to add content modal from site dashboard
   * @param contentType - The content type to create
   */
  async navigateToAddContentModal(): Promise<void> {
    await test.step(`Navigate to add content modal`, async () => {
      const siteDashboard = new SiteDashboardPage(this.page, '');
      await siteDashboard.verifyThePageIsLoaded();
      await siteDashboard.clickOnAddContent();
    });
  }

  //assertions
  /**
   * Verifies that the uploaded cover image preview is visible
   * @param options - The options for the assertion
   * @param options.timeout - The timeout for the assertion
   */
  async verifyUploadedCoverImagePreviewIsVisible(options?: { timeout?: number }): Promise<void> {
    await test.step(`Verifying that the uploaded cover image preview is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.uploadedCoverImagePreviewImage, {
        assertionMessage: 'expected uploaded cover image preview element to be visible',
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      });
    });
  }
}
