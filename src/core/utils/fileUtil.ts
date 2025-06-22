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
}
