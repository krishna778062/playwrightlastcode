import { Page, Locator, expect, test } from '@playwright/test';
import { BasePage } from '@core/pages/basePage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';

export class ContentCreationPage extends BasePage<ContentCreationActions, ContentCreationAssertions> {
  // Page elements
  private readonly createSection: Locator;
  private readonly pageOption: Locator;
  private readonly recentlyUsedSitesList: Locator;
  private readonly addSpan: Locator;
  private readonly nextButton: Locator;
  private readonly addButton: Locator;
  private readonly squareCropOption: Locator;
  private readonly coverImageUpload: Locator;
  private readonly uploadImage: Locator;
  private readonly uploadImageValidation: Locator;

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

  // Getter methods for accessing elements
  getCreateSection() { return this.createSection; }
  getPageOption() { return this.pageOption; }
  getRecentlyUsedSitesList() { return this.recentlyUsedSitesList; }
  getAddSpan() { return this.addSpan; }
  getNextButton() { return this.nextButton; }
  getSquareCropOption() { return this.squareCropOption; }
  getCoverImageUpload() { return this.coverImageUpload; }
  getUploadedImage() {return this.uploadImage}
  getAddButton() {return this.addButton}
  getUploadImageValidation() {return this.uploadImageValidation}
}

export class ContentCreationActions {
  constructor(private readonly page: ContentCreationPage) {}

  async clickCreateSection(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || 'Click on Create section', async () => {
      await this.page.getCreateSection().click();
    });
  }

  async clickPageOption(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || 'Click on Page option', async () => {
      await this.page.getPageOption().click();
    });
  }

  async selectRecentlyUsedSite(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || 'Click on recently used site', async () => {
      // Select the first recently used site
      const firstSite = this.page.getRecentlyUsedSitesList().first();
      await firstSite.click();
    });
  }

  async clickAddButton(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || 'Click Add button', async () => {
      await this.page.getAddSpan().click();
    });
  }

  async uploadCoverImage(fileName: string, options?: { 
    stepInfo?: string; 
    enableWidescreenCrop?: boolean; 
    enableSquareCrop?: boolean; 
  }) {
    await test.step(options?.stepInfo || `Upload cover image: ${fileName}`, async () => {
      // Wait for AddFrom-input element to be present
      const fileInputElement = this.page.getCoverImageUpload();
      
      // Upload the file directly to the input element
      const filePath = `src/modules/content/test-data/static-files/images/${fileName}`;
      await fileInputElement.setInputFiles(filePath);
      
      // Check if Next button is present and handle the flow
      
      
        // Click Next button three times
        await this.page.getNextButton().click();
        await this.page.getNextButton().click();
        await this.page.getNextButton().click();
        await this.page.getAddButton().click();
        console.log('✅ File upload completed, Add button clicked successfully');
        
      
      
      // Wait for upload to complete - check if uploading indicator is present and wait for it to disappear
      const uploadingIndicator = this.page.getUploadedImage()
      
      if (await uploadingIndicator.isVisible({ timeout: 2000 })) {
        await uploadingIndicator.waitFor({ state: 'hidden', timeout: CONTENT_TEST_DATA.TIMEOUTS.UPLOAD });
      }
    });
  }

  async createPageWithCoverImage(coverImageFileName: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || 'Create page with cover image', async () => {
      await this.clickCreateSection({ stepInfo: 'Click on Create section' });
      await this.clickPageOption({ stepInfo: 'Click on Page text' });
      await this.selectRecentlyUsedSite({ stepInfo: 'Click on recently used site' });
      await this.clickAddButton({ stepInfo: 'Click on Add button' });
      await this.uploadCoverImage(coverImageFileName, {
        stepInfo: `Upload cover image: ${coverImageFileName}`,
        enableWidescreenCrop: true,
        enableSquareCrop: true,
      });
    });
  }
}

export class ContentCreationAssertions {
  constructor(private readonly page: ContentCreationPage) {}

  async verifyFileUploadSuccessful(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || 'Verify file upload is successful', async () => {
      // Check for success indicators - verify the uploaded image validation element is visible
      await expect(
        this.page.getUploadImageValidation(),
        'Upload success should be indicated'
      ).toBeVisible({
        timeout: options?.timeout || CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
      });
    });
  }
} 