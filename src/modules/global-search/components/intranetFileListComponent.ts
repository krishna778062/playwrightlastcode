import { faker } from '@faker-js/faker';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { Locator, Page, test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TIMEOUTS } from '@core/constants/timeouts';

/**
 * The IntranetFileListComponent class is a UI component that represents the intranet file list component.
 * It provides methods for interacting with the component and verifying its state.
 */
export class IntranetFileListComponent extends ContentListComponent {
  readonly fileType: Locator;
  readonly downloadLinkButton: Locator;
  readonly closeButton: Locator;
  readonly filesTab: Locator;
  readonly selectFromComputerButton: Locator;
  readonly loadingBar: Locator;
  readonly uploadButton: Locator;

  /**
   * Constructs a new instance of the IntranetFileListComponent class.
   * @param page - The Playwright Page object.
   * @param rootLocator - The root locator for the component.
   */
  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.fileType = this.rootLocator.locator('[class*="IconWithLabel_label"]');
    this.downloadLinkButton = this.rootLocator.getByRole('button', { name: 'Download' });
    this.closeButton = this.page.locator('[class*="reviewModal-module-closeButton"][data-state="closed"]');
    this.filesTab = this.page.locator('a[role="tab"][id="files"]');
    this.selectFromComputerButton = this.page.getByText('select from computer');
    this.loadingBar = this.page.locator('div[class*="ileItem-loading"]');
    this.uploadButton = this.page.getByRole('button', { name: 'Upload' });
  }

  /**
   * Verifies all data points for an intranet file result item.
   * @param data - The intranet file search data to verify.
   */
  async verifyIntranetFileResultItem(data: any) {
    await test.step(`Verifying all data points for the intranet file result item "${data.name}"`, async () => {
      // Common verifications
      await this.verifyNameIsDisplayed(data.name);
      await this.verifyLabelIsDisplayed(data.label);
      await this.verifyAuthorIsDisplayed(data.author);
      await this.verifyDateIsDisplayed();
      await this.verifyFileThumbnailIsDisplayed();
      await this.verifyFileTypeIsDisplayed(data.type);

      // Navigation verifications
      await this.verifyNavigationToTitleLink(data.fileId, data.name, 'file');
      await this.clickOnCloseButton();
      await this.hoverOverCardAndDownloadLink(data.name);
      await this.verifyNavigationWithSiteLink(data.siteId, data.siteName);
      await this.goBackToPreviousPage();
      await this.hoverOverCardAndCopyLink();
      await this.verifyCopiedURLWithFileId(data.fileId);
      await this.goBackToPreviousPage();
      await this.verifyNavigationWithFileThumbnailLink(data.fileId);
      await this.clickOnCloseButton();
      await this.verifyNavigationWithAuthorLink(data.author);
      await this.goBackToPreviousPage();
      await this.verifyNavigationWithHomePageLink();
      await this.goBackToPreviousPage();
    });
  }

  /**
   * Verifies that the file type is displayed in the result item.
   * @param fileType - The file type to verify.
   */
  async verifyFileTypeIsDisplayed(fileType: string) {
    let expectedLabel = '';
    switch (fileType) {
      case 'pdf':
        expectedLabel = 'PDF';
        break;
      case 'docx':
        expectedLabel = 'Word Document';
        break;
      case 'pptx':
        expectedLabel = 'Microsoft PowerPoint';
        break;
      case 'csv':
        expectedLabel = 'CSV';
        break;
      default:
        throw new Error(`Unsupported file type for verification: ${fileType}`);
    }
    await test.step(`Verifying file type is displayed as "${expectedLabel}"`, async () => {
      await this.verifier.verifyElementHasText(this.fileType, expectedLabel);
    });
  }

  /**
   * Hover over the card, click the download link button, and verify the downloaded file.
   * @param expectedFileName - The expected name of the downloaded file.
   */
  async hoverOverCardAndDownloadLink(expectedFileName: string) {
    await test.step(`Mouse over, click download link button, and verify downloaded file`, async () => {
      await this.rootLocator.hover({ timeout: 20000 });
      await this.verifier.verifyTheElementIsVisible(this.downloadLinkButton);
      const [download] = await Promise.all([
        this.page.waitForEvent('download', { timeout: TIMEOUTS.LONG }),
        this.clickOnElement(this.downloadLinkButton),
      ]);
      const downloadedFileName = download.suggestedFilename();
      expect(downloadedFileName).toBe(expectedFileName);
    });
  }

  /**
   * Verify the navigation with the file thumbnail link
   * @param expectedUrl - the expected url
   */
  async verifyNavigationWithFileThumbnailLink(fileId: string) {
    await test.step(`Verifying navigation with thumbnail link to "${fileId}"`, async () => {
      await this.clickOnElement(this.thumbnail, { timeout: 30000 });
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(fileId), {
        timeout: 50_000,
        stepInfo: `Verifying navigation with thumbnail link to "${fileId}"`,
      });
    });
  }

  /**
   * Verify the File thumbnail is displayed in the site result item
   */
  async verifyFileThumbnailIsDisplayed() {
    await test.step(`Verifying thumbnail is displayed in the result item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.thumbnail, {
        timeout: 20000,
        assertionMessage: `Verifying thumbnail is displayed in the result item`,
      });
    });
  }

  /**
   * Click on the close button
   */
  async clickOnCloseButton() {
    await test.step(`Click on the close button`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.closeButton.first(), { timeout: 50000 });
      await this.clickOnElement(this.closeButton.first());
      await this.verifier.verifyTheElementIsNotVisible(this.closeButton.first(), { timeout: 20000 });
    });
  }

  /**
   * Verify the copied URL with the file ID
   * @param fileId - the file id
   */
  async verifyCopiedURLWithFileId(fileId: string) {
    await test.step(`Verifying copied URL in the clipboard, navigates to the right file and verifies the file`, async () => {
      const copiedUrl = await this.readClipboardText();
      await this.page.goto(copiedUrl);
      if (!copiedUrl.includes(fileId)) {
        throw new Error(`Copied URL does not contain id: ${fileId}. URL: ${copiedUrl}`);
      }
      if (!copiedUrl.endsWith('?provider=intranet')) {
        throw new Error(`Copied URL does not end with "?provider=intranet". URL: ${copiedUrl}`);
      }
    });
  }

  async clickFilesTab(): Promise<void> {
    await test.step(`Clicking on the files tab`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.filesTab, { timeout: 30000 });
      await this.clickOnElement(this.filesTab);
    });
  }

  /**
   * Uploads a file from the local computer by creating a temporary copy with a unique name.
   *
   * This method performs the following steps:
   * 1. Creates a unique file name to avoid conflicts.
   * 2. Creates a temporary copy of the original file.
   * 3. Clicks the "select from computer" button to open the file chooser.
   * 4. Sets the temporary file in the file chooser.
   * 5. Waits for the upload to complete by monitoring a loading bar.
   * 6. Clicks the final "Upload" button.
   * 7. Deletes the temporary file.
   *
   * @param originalFilePath - The path of the file to be uploaded from test data.
   * @returns The unique name of the file that was uploaded.
   */
  async uploadFileFromComputer(originalFilePath: string): Promise<string> {
    const uniqueFileName = await test.step(`Uploading file from computer: ${originalFilePath}`, async () => {
      const fileExtension = path.extname(originalFilePath);
      const uniqueName = `${faker.lorem.word()}-${Date.now()}${fileExtension}`;
      const tempFilePath = path.join(path.dirname(originalFilePath), uniqueName);

      fs.copyFileSync(originalFilePath, tempFilePath);

      try {
        await this.openFileChooserAndSetFiles(() => this.clickOnElement(this.selectFromComputerButton), tempFilePath, {
          stepInfo: 'Open file chooser and select file to upload',
        });

        await this.verifier.waitUntilElementIsVisible(this.loadingBar, {
          stepInfo: 'Verifying that the loading bar is visible after selecting the file',
        });
        await this.verifier.waitUntilElementIsHidden(this.loadingBar, {
          timeout: 60_000,
          stepInfo: 'Waiting for file upload to complete (loading bar to disappear)',
        });

        await this.clickOnElement(this.uploadButton);
      } finally {
        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
      }
      return uniqueName;
    });
    return uniqueFileName;
  }
}
