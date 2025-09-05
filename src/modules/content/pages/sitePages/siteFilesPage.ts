import test, { Locator, Page } from '@playwright/test';
import path from 'path';

import { FilesPreviewModalComponent } from '../../components/filesPreviewModalComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';

/**
 * A Site has many pages.
 * This class is for managing the Site Files page.
 */
export class SiteFilesPage extends BasePage {
  readonly inputFilesSelector: string = `input[type="file"]`;

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

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilPageHasNavigatedTo(/directory/);
    await this.verifier.verifyTheElementIsVisible(this.siteFilesLinkText, { timeout: TIMEOUTS.MEDIUM });
  }

  readonly filesPreviewModalComponent: FilesPreviewModalComponent;
  constructor(page: Page) {
    super(page);
    this.filesPreviewModalComponent = new FilesPreviewModalComponent(page);
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
    const filesPreviewModalComponent = new FilesPreviewModalComponent(this.page);
    // await filesPreviewModalComponent.verifyProgressBarLoadingIsComplete();
  }
}
