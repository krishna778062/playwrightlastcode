import { PageCreationPage } from "../pages/pageCreationPage";
import { test } from "@playwright/test";

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
        await this.pageCreationPage.coverImageUploader.uploadAttachment(fileName);
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
      });
    }
    

  }
  