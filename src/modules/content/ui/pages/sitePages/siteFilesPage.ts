import { Locator, Page, test } from '@playwright/test';
import path from 'path';

import { FilesPreviewModalComponent } from '@content/ui/components/filesPreviewModalComponent';
import { BaseSitePage } from '@content/ui/pages/sitePages/baseSite';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { FileUtil } from '@/src/core/utils/fileUtil';

export interface ISiteFilesPageActions {
  uploadBoxFileFolder: (folderName: string) => Promise<void>;
  uploadFileViaSelectFromComputer: (filePath: string) => Promise<string>;
  clickToOpenFileInFilesPreview: (fileNameWithExtension: string) => Promise<void>;
  clickOnFilesFolder: (folderName: string) => Promise<void>;
  clickSiteVideosTab: () => Promise<void>;
  hoverOverFileOptionsDropdown: (fileName: string) => Promise<void>;
  clickShareOptionFromFileMenu: () => Promise<void>;
}

export interface ISiteFilesPageAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyFileIsPresentInTheSiteFilesList: (fileName: string) => Promise<void>;
  verifyFileIsPresentInTheSiteFilesListAtIndex: (fileName: string, index: number) => Promise<void>;
}

/**
 * A Site has many pages.
 * This class is for managing the Site Files page.
 */
export class SiteFilesPage extends BaseSitePage implements ISiteFilesPageActions, ISiteFilesPageAssertions {
  readonly filesPreviewModalComponent: FilesPreviewModalComponent;

  readonly inputFilesSelector: string = `input[type="file"]`;
  readonly siteVideosTab: Locator = this.page.getByRole('link', { name: 'Site videos' });
  readonly boxFolderLocator = (folderName: string) => this.page.getByRole('link', { name: folderName });
  readonly linkNewFolder = (folderName: string) =>
    this.page.getByRole('button', { name: new RegExp(`^${folderName}$`, 'i') });
  readonly linkFolderDialog = (folderName: string) =>
    this.page.getByRole('dialog', { name: new RegExp(`^${folderName}$`, 'i') });
  readonly linkFolderDialogInput: Locator = this.page
    .locator('div')
    .filter({ hasText: /^Please select a document library…$/ });
  readonly linkNewFolderButton = (folderName: string) => this.linkFolderDialog(folderName).getByLabel(folderName);
  readonly shareOption: Locator = this.page.getByRole('button', { name: 'Share' });

  readonly getFileRowLocator = (fileName: string): Locator =>
    this.page
      .locator('tr')
      .filter({ has: this.page.locator(`a.directory-ownerName`, { hasText: fileName }) })
      .first();

  readonly getFileOptionsDropdownLocator = (fileName: string): Locator =>
    this.getFileRowLocator(fileName).locator('button.OptionsMenu-iconContainer');

  get selectFromComputer(): Locator {
    return this.page.getByText('Drop media and files here or').locator('input[type="file"]');
  }

  get uploadProgressBarLoading(): Locator {
    return this.page.locator('div[class="ProgressBar"]');
  }

  get uploadButton(): Locator {
    return this.page.locator('button[type="submit"]').getByText('Upload', { exact: true });
  }

  get siteFilesLinkText(): Locator {
    return this.page.locator(`a[title="Site files"]`);
  }

  constructor(page: Page, siteId: string) {
    super(page, siteId);
    this.filesPreviewModalComponent = new FilesPreviewModalComponent(page);
  }

  get actions(): ISiteFilesPageActions {
    return this;
  }

  get assertions(): ISiteFilesPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.siteFilesLinkText, { timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * To determine the file type directory based on the file extension.
   * Maps file extensions to actual directory names in the test-data structure.
   * @param filename
   * @returns The directory name where the file should be located
   */
  private static getTestDataDirectoryForSiteFiles(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const excelExtensions = ['xls', 'xlsx', 'ppt', 'pptx'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm'];

    if (extension && imageExtensions.includes(extension)) {
      return 'images';
    } else if (extension && documentExtensions.includes(extension)) {
      return 'documents';
    } else if (extension && excelExtensions.includes(extension)) {
      return 'excel';
    } else if (extension && audioExtensions.includes(extension)) {
      return 'audio';
    } else if (extension && videoExtensions.includes(extension)) {
      return 'video';
    }

    throw new Error(`Unsupported or unknown file extension: ${extension}`);
  }

  /**
   * Performs the actual file upload operation.
   * This method handles the UI interaction for uploading a file.
   * @param filePath The path to the file to upload
   * @param expectedFileName The expected filename to verify after upload
   */
  private async performFileUpload(filePath: string, expectedFileName: string): Promise<void> {
    await test.step(`Upload file: ${expectedFileName}`, async () => {
      await this.verifier.isTheElementVisible(this.selectFromComputer);
      await this.page.setInputFiles(this.inputFilesSelector, [filePath]);

      await this.verifier.isTheElementVisible(this.uploadProgressBarLoading, {
        assertionMessage: 'Verifying that the upload progress bar is visible',
      });
      await this.verifier.verifyTheElementIsNotVisible(this.uploadProgressBarLoading, {
        timeout: TIMEOUTS.VERY_LONG,
        assertionMessage: 'Verifying that the upload progress bar is not visible',
      });

      await this.verifier.isTheElementVisible(this.uploadButton, {
        assertionMessage: 'Verifying that the upload button is visible',
      });
      await this.clickOnElement(this.uploadButton, { stepInfo: 'Clicking on the upload button' });
    });
  }

  async verifyFileIsPresentInTheSiteFilesList(fileName: string): Promise<void> {
    const file: Locator = this.page
      .locator(`button[type="button"][class="filenameWrap"]`)
      .getByText(`${fileName}`, { exact: true });
    await this.verifier.isTheElementVisible(file, {
      assertionMessage: `Verifying that the file: ${fileName} is present in the site files list`,
    });
  }

  async verifyFileIsPresentInTheSiteFilesListAtIndex(fileName: string, index: number): Promise<void> {
    const file: Locator = this.page
      .locator(`button[type="button"][class="filenameWrap"]`)
      .getByText(`${fileName}`, { exact: true })
      .nth(index);
    await this.verifier.isTheElementVisible(file, {
      assertionMessage: `Verifying that the file: ${fileName} is present in the site files list at index: ${index}`,
    });
  }

  /**
   * Uploads a file to the site using the "Select from Computer" option.
   * This method only handles the upload operation - file preparation should be done by the test.
   * @param filePath The full path to the file to be uploaded
   * @returns The filename of the uploaded file
   * @example
   * // Upload a file (test should prepare the file path)
   * await uploadFileViaSelectFromComputer("/path/to/document.pdf");
   */
  async uploadFileViaSelectFromComputer(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);

    // Validate that the file exists
    if (!FileUtil.fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Perform the actual upload
    await this.performFileUpload(filePath, fileName);

    return fileName;
  }

  async clickToOpenFileInFilesPreview(fileNameWithExtension: string) {
    const fileNameToClick: Locator = this.page
      .locator(`button[type="button"][class="filenameWrap"]`)
      .getByText(fileNameWithExtension, { exact: true })
      .first();
    await this.clickOnElement(fileNameToClick);
    // await filesPreviewModalComponent.verifyProgressBarLoadingIsComplete();
  }

  async clickSiteVideosTab(): Promise<void> {
    await test.step('Clicking on the Site videos tab', async () => {
      // Check if Site videos tab exists before clicking
      const isVisible = await this.verifier.isTheElementVisible(this.siteVideosTab, {
        timeout: 5000,
      });
      if (isVisible) {
        await this.clickOnElement(this.siteVideosTab);
      } else {
        // If Site videos tab doesn't exist, videos might be in the main files list
        // or we need to wait for it to appear. For now, we'll proceed without clicking.
        // The upload will work in the main files area if videos tab is not available.
        console.log('Site videos tab not found. Proceeding with file upload in main files area.');
      }
    });
  }

  async clickOnFilesFolder(folderName: string): Promise<void> {
    await test.step(`Click on files folder: ${folderName}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.boxFolderLocator(folderName));
      await this.clickOnElement(this.boxFolderLocator(folderName));
    });
  }

  async uploadBoxFileFolder(folderName: string): Promise<void> {
    await test.step(`Upload Box file folder: ${folderName}`, async () => {
      const boxFolder = await this.verifier.isTheElementVisible(this.boxFolderLocator(folderName));
      if (boxFolder) {
        console.log(`Box folder "${folderName}" found`);
        return;
      }
      let linkFolderName = folderName;
      if (folderName === 'Drive') {
        linkFolderName = 'Link Google Drive';
      }
      if (folderName === 'AVISTA BOX FILES EDITOR') {
        linkFolderName = 'Link Box folder';
      }
      console.log(`folderName ---> ${linkFolderName}`);
      await this.verifier.verifyTheElementIsVisible(this.linkNewFolder(linkFolderName));
      await this.clickOnElement(this.linkNewFolder(linkFolderName));
      await this.verifier.verifyTheElementIsVisible(this.linkFolderDialog(linkFolderName));
      const sharedDriveFolder = this.page.getByRole('radio', { name: 'Shared Drive (owned by the' });
      if (await sharedDriveFolder.isVisible({ timeout: TIMEOUTS.VERY_VERY_SHORT })) {
        await this.clickOnElement(sharedDriveFolder);
      }
      await this.clickOnElement(this.linkFolderDialogInput.nth(3));
      //await this.fillInElement(this.linkFolderDialogInput.first(), folderName);
      await this.clickOnElement(this.page.getByText(folderName, { exact: true }).first());
      await this.clickOnElement(this.linkNewFolderButton(linkFolderName));
      console.log(`Box folder "${linkFolderName}" linked`);
    });
  }

  async hoverOverFileOptionsDropdown(fileName: string): Promise<void> {
    await test.step(`Click dropdown options for file: ${fileName}`, async () => {
      // Locate the file item
      const fileRow = this.getFileRowLocator(fileName);

      await this.verifier.verifyTheElementIsVisible(fileRow, {
        assertionMessage: `File row for file: ${fileName} should be visible`,
      });

      const fileOptionsDropdown = this.getFileOptionsDropdownLocator(fileName);

      await this.hoverOverElementInJavaScript(fileOptionsDropdown);
    });
  }

  /**
   * Clicks the "Share" option from the file dropdown menu
   */
  async clickShareOptionFromFileMenu(): Promise<void> {
    await test.step('Click Share option from file dropdown menu', async () => {
      await this.clickOnElement(this.shareOption);
    });
  }
}
