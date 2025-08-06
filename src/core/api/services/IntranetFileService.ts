import { BaseApiClient } from '@api/clients/baseApiClient';
import { IIntranetFileService } from '@api/interfaces/IIntranetFileService';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { FileUtil } from '@core/utils/fileUtil';
import { test } from '@playwright/test';

export class IntranetFileService extends BaseApiClient implements IIntranetFileService {
  /**
   * Retrieves a signed URL for file uploads.
   * @param siteId - The ID of the site.
   * @param fileName - The name of the file.
   * @param fileSize - The size of the file in bytes.
   * @returns The signed URL and the file ID.
   */
  async getSignedUrlForFileUpload(
    siteId: string,
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Promise<{ uploadUrl: string; fileId: string }> {
    const response = await this.post(API_ENDPOINTS.content.signedUrl, {
      data: {
        file_name: fileName,
        size: fileSize,
        mime_type: mimeType,
        type: 'content',
        uploadContext: 'site-files',
        siteId: siteId,
      },
    });
    const json = await response.json();
    console.log(`Signed URL response for ${fileName}:`, JSON.stringify(json, null, 2));
    if (json.status !== 'success' || !json.result?.upload_url) {
      throw new Error(`Failed to get signed URL. Response: ${JSON.stringify(json)}`);
    }
    return {
      uploadUrl: json.result.upload_url,
      fileId: json.result.file_id,
    };
  }

  /**
   * Associates a file with a site after upload.
   * @param siteId - The ID of the site.
   * @param fileId - The ID of the file.
   * @returns The file ID and author name.
   */
  async associateFileWithSite(siteId: string, fileId: string): Promise<{ fileId: string; authorName: string }> {
    const response = await this.post(API_ENDPOINTS.content.files, {
      data: {
        file_id: [{ file_id: fileId, provider: 'intranet' }],
        site_id: siteId,
      },
    });
    const json = await response.json();
    console.log(`Associate file response for ${fileId}:`, JSON.stringify(json, null, 2));
    if (json.status !== 'success' || !json.result?.listOfFiles?.[0]?.fileId) {
      throw new Error(`Failed to associate file with site. Response: ${JSON.stringify(json)}`);
    }
    return {
      fileId: json.result.listOfFiles[0].fileId,
      authorName: json.result.listOfFiles[0].owner.name,
    };
  }

  /**
   * Uploads a file to a site.
   * @param siteId - The site ID.
   * @param fileName - The name of the file to upload.
   * @param filePath - The local path of the file.
   * @returns The created file's ID and author name.
   */
  async uploadFileAndGetId(
    siteId: string,
    fileName: string,
    filePath: string,
    mimeType: string
  ): Promise<{ fileId: string; authorName: string }> {
    console.log(`Initiating file upload for site: ${siteId}, file: ${fileName}`);
    return await test.step('Uploading file via API post request', async () => {
      const fileSize = FileUtil.getFileSize(filePath);
      const { uploadUrl, fileId } = await this.getSignedUrlForFileUpload(siteId, fileName, fileSize, mimeType);
      await FileUtil.uploadFileToSignedUrl(uploadUrl, filePath, mimeType);
      return await this.associateFileWithSite(siteId, fileId);
    });
  }
}
