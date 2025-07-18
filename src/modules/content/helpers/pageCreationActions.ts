import { PageCreationPage } from '../pages/pageCreationPage';
import { request, test } from '@playwright/test';
import { FileUtil } from '@core/utils/fileUtil';
import { PageContentType } from '../constants/pageContentType';
import { PageCreationResponse } from '../apis/types/pageCreationResponse';

interface PageCreationOptions {
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

export class PageCreationActions {
  constructor(private readonly pageCreationPage: PageCreationPage) {}

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
      //there will be three requests for the cover image to upload different sizes
      //we will wait until all three requests are completed
      const reqPromises = [];
      for (let i = 0; i < 3; i++) {
        reqPromises.push(
          this.pageCreationPage.page.waitForResponse(
            response => response.url().includes('Content-Type=image%2Fpng') && response.request().method() === 'PUT'
          ),
          35_000
        );
      }
      const imagePath = FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', 'images', fileName);
      await this.pageCreationPage.coverImageUploader.uploadAttachment(imagePath);
      //handle wide screen crop option
      if (options?.widescreenCropOption) {
        await this.pageCreationPage.imageCropper.selectCropOption('Widescreen');
      }
      await this.pageCreationPage.imageCropper.clickOnNextButton();
      //handle square crop option
      if (options?.squareCropOption) {
        await this.pageCreationPage.imageCropper.selectCropOption('Square');
      }
      await this.pageCreationPage.imageCropper.clickOnNextButton();
      await this.pageCreationPage.imageCropper.clickOnNextButton();
      await this.pageCreationPage.imageCropper.clickOnAddButton();

      //wait for all the requests to be completed
      await Promise.all(reqPromises);
    });
  }

  /**
   * Fills in the page details
   * @param options - The options for filling in the page details
   */
  async fillPageDetails(options: { category: string; contentType: string; title: string; description: string }) {
    await test.step(`Filling page details`, async () => {
      //add title
      await this.pageCreationPage.fillInElement(this.pageCreationPage.titleInput, options.title);

      //add description
      await this.pageCreationPage.fillInElement(this.pageCreationPage.descriptionInput, options.description);

      // Handle category selection
      await this.pageCreationPage.clickOnElement(this.pageCreationPage.categoryDropdown);
      await this.pageCreationPage.fillInElement(this.pageCreationPage.categoryDropdown, options.category);
      await this.pageCreationPage.categoryDropdown.press('Enter');

      await this.pageCreationPage.clickOnElement(this.pageCreationPage.contentTypeCheckbox(options.contentType));
    });
  }

  /**
   * Publishes the page
   */
  async publishPage() {
    await test.step(`Publishing page`, async () => {
      await this.pageCreationPage.clickOnElement(this.pageCreationPage.publishButton, { delay: 2_000 });
    });
  }

  /**
   * Handles the promotion of the page
   * @param options - The options for handling the promotion
   */
  async handlePromotePage(options?: { skipPromotion?: boolean }) {
    await test.step(`Promoting page`, async () => {
      const skipPromotion = options?.skipPromotion ?? true;
      if (skipPromotion) {
        await this.pageCreationPage.promotePageModal.clickOnSkipPromotionButton();
      } else {
        //hanlde the promotion actions
        await this.pageCreationPage.promotePageModal.handlePromotion(options);
      }
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
      const publishResponse = await this.pageCreationPage.performActionAndWaitForResponse(
        () => this.publishPage(),
        response =>
          response.url().includes('content?action=publish') &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 60_000,
        }
      );

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
   * Handles the promotion of the page
   * @param options - The options for handling the promotion
   */
  async handlePagePromotion(options?: { skipPromotion?: boolean }) {
    await test.step(`Promoting page`, async () => {
      const skipPromotion = options?.skipPromotion ?? true;
      if (skipPromotion) {
        await this.pageCreationPage.promotePageModal.clickOnSkipPromotionButton();
      } else {
        //hanlde the promotion actions
        await this.pageCreationPage.promotePageModal.handlePromotion(options);
      }
    });
  }
}
