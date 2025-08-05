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
   * Uploads a file to a pre-signed URL.
   * @param signedUrl - The pre-signed URL for the upload.
   * @param filePath - The path to the file to upload.
   * @param mimeType - The MIME type of the file.
   */
  public static async uploadFileToSignedUrl(signedUrl: string, filePath: string, mimeType: string): Promise<void> {
    const fileContent = this.readFile(filePath);
    const request = (await import('playwright')).request;
    const context = await request.newContext();
    const response = await context.post(signedUrl, {
      headers: {
        'Content-Type': mimeType,
      },
      data: fileContent,
    });
    if (response.status() !== 200) {
      throw new Error(`Failed to upload file to signed URL. Status: ${response.status()}`);
    }
    console.log('File uploaded successfully to signed URL.');
  }
}
