import { Page, Locator, expect, test } from '@playwright/test';
import { BasePage } from '@core/pages/basePage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';
import { ContentCreationAssertions } from '../helpers/contentAssertionHelper';
import { HomePage } from '@/src/core/pages/homePage';
import { AddSiteContentComponents } from '../components/addSiteContentComponents';

export class ContentCreationPage extends BasePage<ContentCreationActions, ContentCreationAssertions> {
  // Page elements
  readonly createSection: Locator;
  readonly pageOption: Locator;
  readonly recentlyUsedSitesList: Locator;
  readonly addSpan: Locator;
  readonly nextButton: Locator;
  readonly addButton: Locator;
  readonly squareCropOption: Locator;
  readonly coverImageUpload: Locator;
  readonly uploadImage: Locator;
  readonly uploadImageValidation: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.createSection = page.getByRole('button', { name: 'Create' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.pageOption = page.getByText('Page');
    this.recentlyUsedSitesList = page.locator('//div[text()=\'Recently used \']/button');
    this.addSpan = page.locator('//span[text()=\'Add\']');
    this.coverImageUpload = page.locator('//button[text()=\'Select from computer\']/following-sibling::input');
    this.nextButton =  page.locator('//button[text()=\'Next\']');
    this.squareCropOption = page.locator('[data-testid="square-crop"]');
    this.uploadImage = page.locator('//div[contains(@class,"is-uploading")]');
    this.uploadImageValidation = page.locator('//textarea[@placeholder="Add image caption here"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.createSection, 'Create section should be visible').toBeVisible({
      timeout: CONTENT_TEST_DATA.TIMEOUTS.DEFAULT,
    });
  }

  get actions() {
    return new ContentCreationActions(this);
  }

  get assertions() {
    return new ContentCreationAssertions(this);
  }
}export class ContentCreationActions {
  constructor(private readonly page: ContentCreationPage) {}




  async uploadCoverImage(fileName: string, options?: { 
    enableWidescreenCrop?: boolean; 
    enableSquareCrop?: boolean; 
  }) {
    await test.step(`Upload cover image: ${fileName}`, async () => {
      // Wait for AddFrom-input element to be present
      const fileInputElement = this.page.coverImageUpload;
      
      // Upload the file directly to the input element
      const filePath = `src/modules/content/test-data/static-files/images/${fileName}`;
      await fileInputElement.setInputFiles(filePath);
      
      // Check if Next button is present and handle the flow
      
      
        // Click Next button three times
        await this.page.nextButton.click();
        await this.page.nextButton.click();
        await this.page.nextButton.click();
        await this.page.addButton.click();
        console.log('✅ File upload completed, Add button clicked successfully');
        
    });
  }

  async createPageWithCoverImage(coverImageFileName: string, options?: { enableWidescreenCrop?: boolean; enableSquareCrop?: boolean; }) {
    await test.step('Create page with cover image', async () => {
      const homePage = new HomePage(this.page.page);
      const addSiteContentComponents = new AddSiteContentComponents(this.page);
      await homePage.clickCreateSection();
      await addSiteContentComponents.clickPageOption();
      await addSiteContentComponents.selectRecentlyUsedSite();
      await addSiteContentComponents.clickAddButton();
      await this.uploadCoverImage(coverImageFileName, {
        enableWidescreenCrop: options?.enableWidescreenCrop ?? true,
        enableSquareCrop: options?.enableSquareCrop ?? true,
      });
    });
  }
}
