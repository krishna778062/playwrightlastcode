import { expect, Locator, Page, test } from '@playwright/test';
import * as path from 'path';

import { TIMEOUTS } from '@core/constants/timeouts';
import { FileUtil } from '@core/utils/fileUtil';

import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';

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
  readonly okButton: Locator;
  readonly siteVideosTab: Locator;

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
    this.okButton = this.page.getByRole('button', { name: 'OK' });
    this.siteVideosTab = this.page.getByRole('link', { name: 'Site videos' });
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
      await this.clickOnElement(this.thumbnail, { timeout: 50000 });
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

  /**
   * Clicks on the files tab in the intranet file search interface.
   * Verifies the tab is visible before clicking to ensure element readiness.
   *
   * @returns Promise that resolves when the files tab has been clicked
   */
  async clickFilesTab(): Promise<void> {
    await test.step(`Clicking on the files tab`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.filesTab, { timeout: 30000 });
      await this.clickOnElement(this.filesTab);
    });
  }

  /**
   * Clicks on the site videos tab in the intranet file search interface.
   * Verifies the tab is visible before clicking with extended timeout for video content.
   *
   * @returns Promise that resolves when the site videos tab has been clicked
   */
  async clickSiteVideosTab() {
    await test.step('Clicking on the Site videos tab', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteVideosTab, { timeout: 20000 });
      await this.clickOnElement(this.siteVideosTab, { timeout: 7_000 });
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
   * 7. Handles OK button for video files if needed.
   * 8. Deletes the temporary file.
   *
   * @param originalFilePath - The path of the file to be uploaded from test data.
   * @param options - Upload options including file type information
   * @returns The unique name of the file that was uploaded.
   */
  async uploadFileFromComputer(originalFilePath: string, options: { videoFile?: boolean } = {}): Promise<string> {
    const uniqueFileName = await test.step(`Uploading file from computer: ${originalFilePath}`, async () => {
      const tempFilePath = FileUtil.generateTemporaryFilePath(originalFilePath);
      const uniqueName = path.basename(tempFilePath);

      FileUtil.createTemporaryFileCopy(originalFilePath, tempFilePath);

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

        await this.clickOnElement(this.uploadButton, { timeout: 30000 });

        // Handle OK button - only video files have this confirmation dialog
        if (options.videoFile) {
          try {
            await this.verifier.waitUntilElementIsVisible(this.okButton, {
              timeout: 15000,
              stepInfo: 'Waiting for OK button after video file upload',
            });
            await this.clickOnElement(this.okButton);
          } catch {
            console.log('OK button did not appear for video file - continuing');
          }
        }
      } finally {
        // Clean up the temporary file
        FileUtil.deleteTemporaryFile(tempFilePath);
      }
      return uniqueName;
    });
    return uniqueFileName;
  }
}
