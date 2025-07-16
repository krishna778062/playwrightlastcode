import { PageCreationPage } from "../pages/pageCreationPage";
import { test } from "@playwright/test";
import { FileUtil } from "@core/utils/fileUtil";
import path from "path";

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
        await this.pageCreationPage.page.waitForTimeout(5000);
      });
    }

    /**
     * Publishes the page
     */
    async publishPage() {
      await test.step(`Publishing page`, async () => {
        await this.pageCreationPage.clickOnElement(this.pageCreationPage.publishButton);
        await this.pageCreationPage.clickOnElement(this.pageCreationPage.skipStepButton);
      });
    }
  }
  