import { PageCreationPage } from "../pages/pageCreationPage";
import { test } from "@playwright/test";

export class PageCreationActions {
    constructor(private readonly pageCreationPage: PageCreationPage) {
    }
  
    async uploadCoverImage(fileName: string, options?: { 
      enableWidescreenCrop?: boolean; 
      enableSquareCrop?: boolean; 
    }) {
      await test.step(`Upload cover image: ${fileName}`, async () => {
        // Wait for AddFrom-input element to be present
        const fileInputElement = this.pageCreationPage.addContentModal.coverImageUpload;
        
        // Upload the file directly to the input element
        const filePath = `src/modules/content/test-data/static-files/images/${fileName}`;
        await fileInputElement.setInputFiles(filePath);
          await this.pageCreationPage.addContentModal.nextButton.click();
          await this.pageCreationPage.addContentModal.nextButton.click();
          console.log('✅ File upload completed, Add button clicked successfully');
          
      });
    }
  

  }
  