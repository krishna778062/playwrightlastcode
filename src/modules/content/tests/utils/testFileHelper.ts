import { FileUtil } from '@core/utils/fileUtil';

/**
 * Test utility helper for getting file paths from test data directory
 */
export class TestFileHelper {
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

    if (extension && imageExtensions.includes(extension)) {
      return 'images';
    } else if (extension && documentExtensions.includes(extension)) {
      return 'documents';
    }

    throw new Error(`Unsupported or unknown file extension: ${extension}`);
  }

  /**
   * Gets the full file path for a test data file.
   * Automatically determines the correct directory based on file extension.
   * @param fileName - The name of the file (e.g., 'image1.jpg')
   * @param testFileDir - Optional: The directory of the test file calling this method (defaults to __dirname)
   * @returns The full path to the test data file
   * @example
   * const imagePath = TestFileHelper.getTestDataFilePath('image1.jpg', __dirname);
   */
  static getTestDataFilePath(fileName: string, testFileDir: string = __dirname): string {
    const directory = this.getTestDataDirectoryForSiteFiles(fileName);
    return FileUtil.getFilePath(testFileDir, '..', '..', '..', '..', 'test-data', 'static-files', directory, fileName);
  }
}
