import { PageCreationPage } from "../pages/pageCreationPage";
import { test } from "@playwright/test";
import { FileUtil } from "@core/utils/fileUtil";
import path from "path";
import { PageContentType } from "../constants/pageContentType";

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
    constructor(private readonly pageCreationPage: PageCreationPage) {
    }
    
    /**
     * Uploads a cover image to the page creation page
     * It calls uploadAttachment from attachementUploader component
     * and then clicks on next button twice to go to the image cropper page
     * @param fileName - The name of the file to upload
     */
    async uploadCoverImage(fileName: string, options?: {
      widescreenCropOption?: boolean;
      squareCropOption?: boolean;
    }) {
      await test.step(`Upload cover image: ${fileName}`, async () => {
        const imagePath = FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', 'images', fileName);
        await this.pageCreationPage.coverImageUploader.uploadAttachment(imagePath);
        //handle wide screen crop option
        if(options?.widescreenCropOption) {
          await this.pageCreationPage.imageCropper.selectCropOption("Widescreen");
        }
        await this.pageCreationPage.imageCropper.clickOnNextButton();
        //handle square crop option
        if(options?.squareCropOption) {
          await this.pageCreationPage.imageCropper.selectCropOption("Square");
        }
        await this.pageCreationPage.imageCropper.clickOnNextButton();
        await this.pageCreationPage.imageCropper.clickOnNextButton();
        await this.pageCreationPage.imageCropper.clickOnAddButton();
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
        await this.pageCreationPage.page.waitForTimeout(5000);
        await this.pageCreationPage.clickOnElement(this.pageCreationPage.publishButton);
        await this.pageCreationPage.clickOnElement(this.pageCreationPage.skipStepButton);
      });
    }

    /**
     * Creates a page with the given options and publishes it
     * @param options - The options for creating the page
     * @returns The title of the created page
     */
    async createAndPublishPage(options: PageCreationOptions): Promise<string> {
      return await test.step(`Creating and publishing page with title: ${options.title}`, async () => {

        // Fill in page mandatory details
        await this.fillPageDetails({
          title: options.title,
          description: options.description,
          category: options.category,
          contentType: options.contentType
        });
        
        // Upload cover image if provided
        if (options.coverImage) {
          await this.uploadCoverImage(options.coverImage.fileName, {
            widescreenCropOption: options.coverImage.cropOptions?.widescreen,
            squareCropOption: options.coverImage.cropOptions?.square
          });
        }
      
        // Publish the page
        await this.publishPage();

        return options.title;
      });
    }
}
  