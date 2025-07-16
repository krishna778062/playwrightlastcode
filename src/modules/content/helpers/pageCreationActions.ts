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
        await this.pageCreationPage.titleInput.fill(options.title);

        // Scroll to description section
        await this.pageCreationPage.descriptionInput.scrollIntoViewIfNeeded();
        await this.pageCreationPage.descriptionInput.fill(options.description);
        
        // Scroll to category section
        await this.pageCreationPage.categoryDropdown.scrollIntoViewIfNeeded();
        
        // Handle category selection
        await this.pageCreationPage.categoryDropdown.click();
        await this.pageCreationPage.categoryDropdown.fill(options.category);
        await this.pageCreationPage.categoryDropdown.press('Enter');
        
        await this.pageCreationPage.contentTypeCheckbox(options.contentType).click();
        await this.pageCreationPage.page.waitForTimeout(5000);
      });
    }

    /**
     * Publishes the page
     */
    async publishPage() {
      await test.step(`Publishing page`, async () => {
        await this.pageCreationPage.publishButton.click();
        await this.pageCreationPage.page.waitForTimeout(3000); // Wait for 3 seconds
        await this.pageCreationPage.skipStepButton.click();
      });
    }
  }
  