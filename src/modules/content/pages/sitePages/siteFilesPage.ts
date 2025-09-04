import test, { Locator, Page } from '@playwright/test';

import { FilesPreviewModalComponent } from '../../components/filesPreviewModalComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';

interface UploadFileOptions {
  makeFileNameRandom?: boolean;
  randomNum?: number;
}

/**
 * A Site has many pages.
 * This class is for managing the Site Files page.
 */
export class SiteFilesPage extends BasePage {
  readonly inputFilesSelector: string = `input[type="file"]`;
  static newFileNameFinal: string;

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

  constructor(page: Page) {
    super(page);
  }

  /**
   * To determine the file type directory based on the file extension.
   * @param filename
   * @returns
   */
  private static getTestDataDirectoryForSiteFiles(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm'];

    let fileTypeDirectory = 'Unknown';

    if (extension && imageExtensions.includes(extension)) {
      fileTypeDirectory = 'Image';
    } else if (extension && documentExtensions.includes(extension)) {
      fileTypeDirectory = 'Document';
    } else if (extension && audioExtensions.includes(extension)) {
      fileTypeDirectory = 'Audio';
    } else if (extension && videoExtensions.includes(extension)) {
      fileTypeDirectory = 'Video';
    }

    if (fileTypeDirectory === 'Unknown') {
      try {
        throw new Error(`Unsupported or unknown file extension: ${extension}`);
      } catch (error) {
        throw new Error(`Failed to determine file type: ${(error as Error).message}`);
      }
    }

    return fileTypeDirectory;
  }

  /**
   * Uploads a file to the site using the "Select from Computer" option.
   * @param fullFileName The name of the file to be uploaded should be full
   * @param options Upload options including makeFileNameRandom and randomNum
   * @param options.makeFileNameRandom Whether to make the filename random by appending the randomNum (default: false)
   * @param options.randomNum Optional random number to append to filename
   * @example
   * // Upload with original filename
   * await uploadFileViaSelectFromComputer("document.pdf");
   *
   * // Upload with randomized filename
   * await uploadFileViaSelectFromComputer("document.pdf", { makeFileNameRandom: true, randomNum: 123 });
   */
  async uploadFileViaSelectFromComputer(fileNameOnDisk: string, options: UploadFileOptions = {}) {
    const { makeFileNameRandom = false, randomNum } = options;

    const fixedRelativePath: string = `src/modules/content/test-data/static-files/`;
    const fileTypeDirectoryName: string = `${SiteFilesPage.getTestDataDirectoryForSiteFiles(fileNameOnDisk).toLowerCase()}s`;

    const lastDotIndex = fileNameOnDisk.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? fileNameOnDisk.substring(0, lastDotIndex) : fileNameOnDisk;
    const extension = lastDotIndex !== -1 ? fileNameOnDisk.substring(lastDotIndex) : '';

    // Create the new file name with the random number appended only if makeFileNameRandom is true
    const newFileName =
      makeFileNameRandom && randomNum !== undefined ? `${baseName}${randomNum}${extension}` : fileNameOnDisk;
    SiteFilesPage.newFileNameFinal = newFileName;

    await test.step(`Upload a File with the name as ${newFileName}`, async () => {
      const originalPathWithFileName: string = `${fixedRelativePath}${fileTypeDirectoryName}/${fileNameOnDisk}`;
      const finalPathWithFileName: string = `${fixedRelativePath}${fileTypeDirectoryName}/${newFileName}`;

      // Duplicate the file on disk only if we're creating a new filename
      const needsFileCopy = makeFileNameRandom && randomNum !== undefined;

      if (needsFileCopy) {
        FileUtil.createTemporaryFileCopy(originalPathWithFileName, finalPathWithFileName);
      }

      try {
        this.verifier.isTheElementVisible(this.selectFromComputer);

        const filePathToUpload = needsFileCopy ? finalPathWithFileName : originalPathWithFileName;
        await this.page.setInputFiles(this.inputFilesSelector, [filePathToUpload]);

        await this.verifier.isTheElementVisible(this.uploadProgressBarLoading),
          await this.verifier.verifyTheElementIsNotVisible(this.uploadProgressBarLoading);

        await this.verifier.isTheElementVisible(this.uploadButton);
        await this.clickOnElement(this.uploadButton);

        // ENSURING THE FILE IS UPLOADED
        const lastUploadedFile: Locator = this.page
          .locator(`button[type="button"][class="filenameWrap"]`)
          .getByText(`${newFileName}`, { exact: true })
          .first();

        await this.verifier.isTheElementVisible(lastUploadedFile);
      } finally {
        // Delete the duplicated file after upload only if we created a copy
        if (needsFileCopy && FileUtil.fileExists(finalPathWithFileName)) {
          FileUtil.deleteTemporaryFile(finalPathWithFileName);
        }
      }
      // Optionally return the new file name for further use
      return newFileName;
    });
  }

  async clickToOpenFileInFilesPreview(fileNameWithExtension: string) {
    const fileNameToClick: Locator = this.page
      .locator(`button[type="button"][class="filenameWrap"]`)
      .getByText(fileNameWithExtension, { exact: true })
      .first();
    await this.verifier.isTheElementVisible(fileNameToClick);
    await this.clickOnElement(fileNameToClick);

    const filesPreviewModalComponent = new FilesPreviewModalComponent(this.page);
    await filesPreviewModalComponent.verifyProgressBarLoadingIsComplete();
  }
}
