import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
export class FileUtil {
  /**
   * Reads the contents of a directory.
   * @param dirPath - The path to the directory.
   * @returns An array of file names in the directory.
   * @throws Will throw an error if the directory cannot be read.
   */
  public static readDir(dirPath: string): string[] {
    try {
      return fs.readdirSync(dirPath);
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Removes a directory and its contents.
   * @param dirPath - The path to the directory to remove.
   * @throws Will throw an error if the directory cannot be removed.
   */
  public static removeDir(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Error removing directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Creates a directory recursively.
   * @param dirPath - The path to the directory to create.
   * @throws Will throw an error if the directory cannot be created.
   */
  public static createDir(dirPath: string): void {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Joins all given path segments together.
   * @param paths - A sequence of path segments.
   * @returns The joined path.
   */
  public static getFilePath(...paths: string[]): string {
    return path.join(...paths);
  }

  public static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Reads a file from the given path.
   * @param filePath - The path to the file.
   * @returns The file content as a Buffer.
   */
  public static readFile(filePath: string): Buffer {
    return fs.readFileSync(filePath);
  }

  /**
   * Gets the size of a file in bytes.
   * @param filePath - The path to the file.
   * @returns The size of the file in bytes.
   */
  public static getFileSize(filePath: string): number {
    return fs.statSync(filePath).size;
  }

  /**
   * Creates a temporary copy of a file with error handling.
   * Used for safe file operations where the original should not be modified.
   * @param sourceFilePath - The path to the source file to copy.
   * @param destinationFilePath - The path where the copy should be created.
   * @throws Will throw an error if the file cannot be copied.
   */
  public static createTemporaryFileCopy(sourceFilePath: string, destinationFilePath: string): void {
    try {
      fs.copyFileSync(sourceFilePath, destinationFilePath);
    } catch (error) {
      console.error(`Error creating temporary copy from ${sourceFilePath} to ${destinationFilePath}:`, error);
      throw new Error(
        `Failed to create temporary file copy: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generates a unique temporary file path based on the original file.
   * Creates a unique filename using a random word and timestamp to avoid conflicts.
   * @param originalFilePath - The path to the original file.
   * @returns A unique temporary file path in the same directory as the original.
   */
  public static generateTemporaryFilePath(originalFilePath: string): string {
    const fileExtension = path.extname(originalFilePath);
    const { faker } = require('@faker-js/faker');
    const uniqueName = `${faker.lorem.word()}-${Date.now()}${fileExtension}`;
    return path.join(path.dirname(originalFilePath), uniqueName);
  }

  /**
   * Safely deletes a temporary file with error handling.
   * Used for cleanup operations to remove temporary files after processing.
   * @param filePath - The path to the temporary file to delete.
   * @throws Will throw an error if the file cannot be deleted.
   */
  private static deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting temporary file ${filePath}:`, error);
      throw new Error(`Failed to delete temporary file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a copy of a file with a random name for testing purposes.
   * This method generates a unique filename and creates a copy.
   * @param originalFilePath - The path to the original file
   * @returns Object containing both the file path and filename
   */
  public static createRandomFileCopy(originalFilePath: string): {
    filePath: string;
    fileName: string;
  } {
    if (!this.fileExists(originalFilePath)) {
      throw new Error(`Source file not found: ${originalFilePath}`);
    }

    const fileName = path.basename(originalFilePath);
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';

    // Generate random filename
    const randomNum = faker.number.int({ min: 1000, max: 9000 });
    const randomFileName = `${baseName}${randomNum}${extension}`;

    const newFilePath = path.join(path.dirname(originalFilePath), randomFileName);
    this.createTemporaryFileCopy(originalFilePath, newFilePath);

    return {
      filePath: newFilePath,
      fileName: randomFileName,
    };
  }

  /**
   * Cleans up a temporary file if it exists.
   * @param filePath - The path to the file to clean up
   */
  public static cleanUpFile(filePath: string): void {
    if (this.fileExists(filePath)) {
      try {
        this.deleteFile(filePath);
      } catch (error) {
        console.warn(`Failed to cleanup temporary file ${filePath}: ${error}`);
      }
    }
  }

  /**
   * Safely deletes a temporary file with error handling.
   * Used for cleanup operations to remove temporary files after processing.
   * @param filePath - The path to the temporary file to delete.
   * @throws Will throw an error if the file cannot be deleted.
   */
  public static deleteTemporaryFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting temporary file ${filePath}:`, error);
      throw new Error(`Failed to delete temporary file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets the project root directory path.
   * Navigates up from the current file location to find the project root.
   * @param fromPath - Optional path to start from (defaults to __dirname)
   * @returns The absolute path to the project root directory.
   */
  public static getProjectRoot(fromPath?: string): string {
    // Use process.cwd() which gives us the current working directory (project root)
    return process.cwd();
  }

  /**
   * Gets the downloads directory path relative to project root.
   * Creates the downloads directory if it doesn't exist.
   * @param fromPath - Optional path to start from (defaults to __dirname)
   * @returns The absolute path to the downloads directory.
   */
  public static getDownloadsDir(fromPath?: string): string {
    const projectRoot = this.getProjectRoot(fromPath);
    const downloadsDir = path.join(projectRoot, 'downloads');

    // Create downloads directory if it doesn't exist
    if (!this.fileExists(downloadsDir)) {
      this.createDir(downloadsDir);
      console.log(`Created downloads directory: ${downloadsDir}`);
    }

    return downloadsDir;
  }

  /**
   * Saves a file to the downloads directory with automatic directory creation.
   * This method ensures the downloads folder exists and provides a safe way to save files.
   * @param fileName - The name of the file to save.
   * @param fileContent - The content to write to the file (Buffer or string).
   * @param fromPath - Optional path to start from for project root resolution.
   * @returns The full path where the file was saved.
   */
  public static saveToDownloads(fileName: string, fileContent: Buffer | string, fromPath?: string): string {
    const downloadsDir = this.getDownloadsDir(fromPath);
    const filePath = path.join(downloadsDir, fileName);

    try {
      fs.writeFileSync(filePath, fileContent);
      console.log(`File saved to downloads: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`Error saving file to downloads ${filePath}:`, error);
      throw new Error(`Failed to save file to downloads: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets a safe file path for downloads with automatic directory creation.
   * Useful for Playwright download operations where you need to ensure the directory exists.
   * @param fileName - The name of the file.
   * @param fromPath - Optional path to start from for project root resolution.
   * @returns The full path where the file should be saved.
   */
  public static getDownloadsFilePath(fileName: string, fromPath?: string): string {
    const downloadsDir = this.getDownloadsDir(fromPath);
    return path.join(downloadsDir, fileName);
  }

  /**
   * Create a debug copy of a file in the project root for debugging purposes
   * @param sourceFilePath - Path to the source file
   * @param debugFileName - Optional debug file name (defaults to debug.csv)
   * @returns Path to the debug copy
   */
  public static createDebugFileCopy(sourceFilePath: string, debugFileName: string = 'debug.csv'): string {
    try {
      if (!fs.existsSync(sourceFilePath)) {
        throw new Error(`Source file not found: ${sourceFilePath}`);
      }

      const projectRoot = this.getProjectRoot();
      const debugFilePath = path.join(projectRoot, debugFileName);

      fs.copyFileSync(sourceFilePath, debugFilePath);
      console.log(`Created debug copy: ${debugFilePath}`);

      return debugFilePath;
    } catch (error) {
      console.warn(`Failed to create debug copy: ${error}`);
      throw error;
    }
  }
}
