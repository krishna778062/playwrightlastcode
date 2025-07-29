import { IImageUploaderService } from '@/src/core/api/interfaces/IImageUploaderService';
import { APIRequestContext, test } from '@playwright/test';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { HttpClient } from '@/src/core/api/clients/httpClient';

export class ImageUploaderService implements IImageUploaderService {
  constructor(private apiClient: HttpClient, private request: APIRequestContext) {}

  /**
   * Gets a signed URL from the API for file uploads.
   * @param payload - The payload containing file metadata like name and type.
   * @returns An object with the uploadUrl and fileId.
   */
  async getSignedUploadUrl(payload: any) {
    return await test.step('Getting signed upload URL', async () => {
      const response = await this.apiClient.post(API_ENDPOINTS.content.signedUrl, {
        data: payload,
      });
      const json = await response.json();
      if (json.status !== 'success' || !json.result?.upload_url || !json.result?.file_id) {
        throw new Error(`Failed to get signed upload URL. Response: ${JSON.stringify(json)}`);
      }
      return { uploadUrl: json.result.upload_url, fileId: json.result.file_id };
    });
  }

  /**
   * Uploads a file to a given signed URL.
   * @param uploadUrl - The signed URL to upload the file to.
   * @param filePath - The local path of the file to be uploaded.
   * @param fileName - The name of the file.
   * @returns A promise that resolves to true if the upload is successful.
   */
  async uploadFileToSignedUrl(uploadUrl: string, filePath: string, fileName: string) {
    return await test.step('Uploading file to signed upload URL', async () => {
      const fileData = FileUtil.readFile(filePath);
      const response = await this.request.post(uploadUrl, {
        multipart: {
          file: {
            name: fileName,
            mimeType: 'image/jpeg',
            buffer: fileData,
          },
        },
      });
      if (response.status() !== 200 && response.status() !== 204) {
        throw new Error(`File upload failed. Status: ${response.status()}`);
      }
      console.log('Upload successful');
      return true;
    });
  }

  /**
   * Orchestrates the image upload process by getting a signed URL and then uploading the file.
   * @param fileName - The name of the file to upload from the test data directory.
   * @returns The fileId of the uploaded image.
   */
  async uploadImageAndGetFileId(fileName: string): Promise<string> {
    const filePath = `${API_ENDPOINTS.fileUpload.albumImg}/${fileName}`;
    if (!FileUtil.fileExists(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    const fileSize = FileUtil.getFileSize(filePath);
    const { uploadUrl, fileId } = await this.getSignedUploadUrl({
      mime_type: 'image/jpeg',
      file_name: fileName,
      size: fileSize,
    });
    await this.uploadFileToSignedUrl(uploadUrl, filePath, fileName);
    return fileId;
  }
} 