import { Locator, Page, Response, test } from '@playwright/test';

import { PageCreationResponse } from '@content/apis/types/pageCreationResponse';
import { PageContentType } from '@content/constants/pageContentType';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { AttachementUploaderComponent } from '@content/ui/components/attachementUploader';
import { ImageCropperComponent } from '@content/ui/components/imageCropper';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { AddContentModalComponent } from '@/src/modules/content/ui/components/addContentModal';

export interface PageCreationOptions {
  // Required fields
  title: string;
  description: string;
  category: string;
  contentType: PageContentType;

  // Optional fields
  coverImage?: {
    imagePath: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
}

export interface IPageCreationActions {
  uploadCoverImage: (
    imagePath: string,
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
  createAndSubmitPage: (options: PageCreationOptions) => Promise<{
    title: string;
    description: string;
    category: string;
    contentType: PageContentType;
    pageId: string;
    siteId: string;
    peopleId: string;
    peopleName: string;
    response: PageCreationResponse;
  }>;
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
  readonly submitButton: Locator;
  readonly addCategoryFromList: (categoryText: string) => Locator;
  readonly successMessage: (message: string) => Locator;
  readonly contentTitleHeading: (title: string) => Locator;
  // Page components
  readonly addContentModal: AddContentModalComponent;
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly fileAttachmentUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;
  readonly sideNavBarComponent: SideNavBarComponent;

  constructor(page: Page, siteId?: string, siteManagementHelper?: SiteManagementHelper) {
    super(page, PAGE_ENDPOINTS.getPageCreationPage(siteId ?? ''));
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
    this.uploadedCoverImagePreviewContainer = page.locator('.flex.h-full.w-full.items-center');
    this.uploadedCoverImagePreviewImage = this.uploadedCoverImagePreviewContainer.locator('img');
    this.categoryDropdown = page.locator('label[for="category"] + div input');
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.skipStepButton = page.locator('button', { hasText: 'Skip this step' });
    this.titleInput = page.locator("textarea[placeholder='Page title']");
    this.descriptionInput = page.locator("div[aria-label='Page content']");
    this.contentTypeCheckbox = (type: string) => page.locator('label:has(span)', { hasText: type });
    this.submitButton = page.locator('span').filter({ hasText: 'Submit for approval' });
    this.addCategoryFromList = (categoryText: string) =>
      page.getByRole('listbox').locator('.Panel-item').filter({ hasText: categoryText });
    this.successMessage = (message: string) => page.locator(`text=${message}`);
    this.contentTitleHeading = (title: string) => page.locator(`h1:has-text("${title}")`);

    this.coverImageUploader = new AttachementUploaderComponent(page, this.coverImageUploaderContainer);
    this.fileAttachmentUploader = new AttachementUploaderComponent(page, this.fileAttachmentUploaderContainer);
    this.imageCropper = new ImageCropperComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.addContentModal = new AddContentModalComponent(page);
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
   * @param imagePath - The full path to the image file to upload
   */
  async uploadCoverImage(
    imagePath: string,
    options?: {
      widescreenCropOption?: boolean;
      squareCropOption?: boolean;
    }
  ) {
    await test.step(`Upload cover image: ${imagePath}`, async () => {
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
      await this.verifier.verifyTheElementIsVisible(this.addCategoryFromList(options.category));
      await this.page.keyboard.press('Enter');
      // await this.clickOnElement(this.addCategoryFromList(options.category));
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
        await this.uploadCoverImage(options.coverImage.imagePath, {
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

  //assertions
  /**
   * Verifies that the uploaded cover image preview is visible
   * @param options - The options for the assertion
   * @param options.timeout - The timeout for the assertion
   */
  async verifyUploadedCoverImagePreviewIsVisible(options?: { timeout?: number }): Promise<void> {
    await test.step(`Verifying that the uploaded cover image preview is visible`, async () => {
      await this.page
        .getByRole('dialog')
        .filter({ hasText: /Media Manager|Intranet File Manager|Upload|Browse|URL|Unsplash/i })
        .waitFor({ state: 'hidden', timeout: 10000 })
        .catch(() => {});

      await this.uploadedCoverImagePreviewImage.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});

      await this.page
        .waitForFunction(
          imgSelector => {
            const img = document.querySelector(imgSelector) as HTMLImageElement | null;
            return img !== null && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 && img.src.length > 0;
          },
          `.flex.h-full.w-full.items-center img`,
          { timeout: 30000 }
        )
        .catch(() => {});

      await this.verifier.verifyTheElementIsVisible(this.uploadedCoverImagePreviewImage, {
        assertionMessage: 'expected uploaded cover image preview element to be visible',
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      });

      await this.page.waitForTimeout(3000);
    });
  }

  async createAndSubmitPage(options: PageCreationOptions): Promise<{
    title: string;
    description: string;
    category: string;
    contentType: PageContentType;
    pageId: string;
    siteId: string;
    peopleId: string;
    peopleName: string;
    response: PageCreationResponse;
  }> {
    return await test.step(`Creating and submit page with title: ${options.title}`, async () => {
      // Fill in page mandatory details
      // Fill in page mandatory details
      await this.fillPageDetails({
        title: options.title,
        description: options.description,
        category: options.category,
        contentType: options.contentType,
      });

      // Upload cover image if provided
      if (options.coverImage) {
        await this.uploadCoverImage(options.coverImage.imagePath, {
          widescreenCropOption: options.coverImage.cropOptions?.widescreen,
          squareCropOption: options.coverImage.cropOptions?.square,
        });
      }

      // Submit the page
      const submitResponse = await this.submitPage();
      const submitResponseBody = (await submitResponse.json()) as PageCreationResponse;

      const pageId = submitResponseBody.result.id;
      const siteId = submitResponseBody.result.site.siteId;
      const peopleId = submitResponseBody.result.authoredBy.peopleId;
      const peopleName = submitResponseBody.result.authoredBy.name;

      return {
        title: options.title,
        description: options.description,
        category: options.category,
        contentType: options.contentType,
        pageId: pageId,
        siteId: siteId,
        peopleId: peopleId,
        peopleName: peopleName.trim(),
        response: submitResponseBody,
      };
    });
  }

  async submitPage(): Promise<Response> {
    return await test.step(`Submitting page and wait for submit api response`, async () => {
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
