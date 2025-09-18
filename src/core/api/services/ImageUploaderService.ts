import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { IImageUploaderService } from '@/src/core/api/interfaces/IImageUploaderService';
import { FeedManagementService } from '@/src/core/api/services/FeedManagementService';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { FileUtil } from '@/src/core/utils/fileUtil';

export class ImageUploaderService implements IImageUploaderService {
  private feedService: FeedManagementService;

  constructor(
    private apiClient: HttpClient,
    private request: APIRequestContext
  ) {
    this.feedService = new FeedManagementService(request);
  }

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

  /**
   * Creates an intranet file with attachment (similar to createFeedWithAttachment pattern)
   * @param siteId - The site ID to upload the file to
   * @param fileName - The name of the file to upload
   * @param filePath - The local path to the file
   * @param mimeType - The MIME type of the file
   * @returns Promise with file ID
   */
  async UploadIntranetFile(
    siteId: string,
    fileName: string,
    filePath: string,
    mimeType: string
  ): Promise<{
    fileInfo: any;
  }> {
    return await test.step(`Creating intranet file with attachment "${fileName}"`, async () => {
      // Get file size
      const fileSize = FileUtil.getFileSize(filePath);

      // Step 1: Get signed upload URL (similar to feed attachment)
      const { uploadUrl, fileId } = await this.getSignedUploadUrl({
        file_name: fileName,
        size: fileSize,
        mime_type: mimeType,
        uploadContext: 'site-files',
        type: 'content',
        siteId: siteId,
      });

      if (!fileId) {
        throw new Error('Failed to get fileId from intranet upload response');
      }

      // Step 2: Upload file to signed URL using FeedManagementService
      await this.feedService.uploadToAttachmentURL(uploadUrl, fileName, filePath, mimeType);

      // Step 3: Get file details from content files API to get owner name
      const fileDetails = await this.getIntranetFileDetails(fileId, siteId);

      return {
        fileInfo: fileDetails.fileInfo,
      };
    });
  }

  /**
   * Gets file details from content files API after upload
   * @param fileId - The file ID from upload response
   * @param siteId - The site ID
   * @returns File details including owner name
   */
  private async getIntranetFileDetails(
    fileId: string,
    siteId: string
  ): Promise<{
    fileInfo: any;
  }> {
    return await test.step(`Getting file details for fileId: ${fileId}`, async () => {
      const payload = {
        file_id: [
          {
            file_id: fileId,
            provider: 'intranet',
          },
        ],
        site_id: siteId,
      };

      const response = await this.apiClient.post(API_ENDPOINTS.content.files, {
        data: payload,
      });

      if (response.status() !== 201) {
        throw new Error(`Failed to get file details. Status: ${response.status()}`);
      }

      const responseData = await response.json();

      if (responseData.status !== 'success' || !responseData.result?.listOfFiles?.length) {
        throw new Error('Invalid response from content files API');
      }

      const fileInfo = responseData.result.listOfFiles[0];

      return {
        fileInfo: fileInfo,
      };
    });
  }

  /**
   * Deletes an intranet file using the content files API
   * @param fileId - The file ID to delete
   * @param siteId - The site ID
   * @param provider - The provider (default: 'intranet')
   * @returns Promise with deletion result
   */
  async deleteIntranetFile(
    fileId: string,
    siteId: string,
    provider: string = 'intranet'
  ): Promise<{
    status: string;
    message: string;
    listOfFileIds: string[];
  }> {
    return await test.step(`Deleting intranet file with ID: ${fileId}`, async () => {
      const deleteUrl = `${API_ENDPOINTS.content.files}/${fileId}?provider=${provider}&action=delete&isDir=false&siteId=${siteId}`;

      const response = await this.apiClient.delete(deleteUrl);

      if (response.status() !== 200) {
        throw new Error(`Failed to delete file. Status: ${response.status()}`);
      }

      const responseData = await response.json();

      if (responseData.status !== 'success') {
        throw new Error(`File deletion failed: ${responseData.message || 'Unknown error'}`);
      }

      return {
        status: responseData.status,
        message: responseData.message,
        listOfFileIds: responseData.result?.listOfFileIds || [fileId],
      };
    });
  }
}
