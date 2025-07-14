import { PageCreationPage } from "../pages/pageCreationPage";
import { test, Locator } from "@playwright/test";

export class PageCreationActions {
    readonly coverImageUpload: Locator;
    readonly nextButton: Locator;
    readonly addButton: Locator;
    
    constructor(private readonly pageCreationPage: PageCreationPage) {
        this.coverImageUpload = pageCreationPage.page.locator("//button[text()='Select from computer']/following-sibling::input");
        this.nextButton = pageCreationPage.page.locator("//button[text()='Next']");
        this.addButton = pageCreationPage.page.getByRole('button', { name: 'Add' });
    }
  
    async uploadCoverImage(fileName: string, options?: { 
      enableWidescreenCrop?: boolean; 
      enableSquareCrop?: boolean; 
    }) {
      await test.step(`Upload cover image: ${fileName}`, async () => {
        // Wait for AddFrom-input element to be present
        const fileInputElement = this.coverImageUpload;
        
        // Upload the file directly to the input element
        const filePath = `src/modules/content/test-data/static-files/images/${fileName}`;
        await fileInputElement.setInputFiles(filePath);
          await this.nextButton.click();
          await this.nextButton.click();
          await this.nextButton.click();
          await this.addButton.click();
          console.log('✅ File upload completed, Add button clicked successfully');
          
      });
    }
  

  }
  