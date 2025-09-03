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
}
