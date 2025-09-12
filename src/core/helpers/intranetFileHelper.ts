import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { IntranetFileListComponent } from '@/src/modules/global-search/components/intranetFileListComponent';

/**
 * The IntranetFileHelper class is a helper class for intranet file related operations.
 * It provides methods for creating sites, uploading files, and cleaning up test data.
 */
export class IntranetFileHelper {
  private page: Page;
  private actions: BaseActionUtil;
  private uploadedFiles: Array<{ fileId: string; siteId: string }> = [];

  /**
   * Constructs a new instance of the IntranetFileHelper class.
   * @param appManagerApiClient - The AppManagerApiClient instance.
   * @param page - The Playwright Page object.
   */
  constructor(
    private appManagerApiClient: AppManagerApiClient,
    page: Page
  ) {
    this.page = page;
    this.actions = new BaseActionUtil(page);
  }

  // Site creation is centralized in SiteManagementHelper.

  /**
   * Uploads a file to the specified site.
   * @param siteId - The ID of the site to upload the file to.
   * @param filePath - The path to the file to upload.
   * @param options - Upload options including file type information
   * @returns A promise that resolves with the name of the uploaded file.
   */
  async uploadFile(siteId: string, filePath: string, options: { videoFile?: boolean } = {}): Promise<string> {
    return await test.step(`Navigate directly to site and upload file`, async () => {
      try {
        const baseUrl = getEnvConfig().frontendBaseUrl.replace(/\/$/, '');
        await this.actions.goToUrl(`${baseUrl}${PAGE_ENDPOINTS.SITE_PAGE(siteId)}`);

        const intranetFileListComponent = new IntranetFileListComponent(this.page);
        await test.step(`Open Files tab`, async () => {
          await intranetFileListComponent.clickFilesTab();
        });

        // If it's a video file or mp4, click the 'Site videos' link before upload
        if (options.videoFile || filePath.endsWith('.mp4')) {
          await intranetFileListComponent.clickSiteVideosTab();
        }

        const uploadedFileName = await test.step(`Upload file from computer`, async () => {
          return await intranetFileListComponent.uploadFileFromComputer(filePath, options);
        });

        return uploadedFileName;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error(
          `File upload failed for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Uploads a file to an existing site and returns file details
   * @param params - Parameters for uploading file to existing site
   * @returns Object containing uploaded file details
   */
  async uploadFileToExistingSite(params: {
    siteId: string;
    siteName: string;
    filePath: string;
    options?: { videoFile?: boolean };
  }) {
    try {
      const { siteId, siteName, filePath, options = {} } = params;

      const uploadedFileName = await this.uploadFile(siteId, filePath, options);

      // Get file details - use different methods for video vs regular files
      const fileDetails = options.videoFile
        ? await this.appManagerApiClient.getSiteManagementService().getVideoFileIdFromSearch(siteId, uploadedFileName)
        : await this.appManagerApiClient.getSiteManagementService().getFileIdFromSite(siteId, uploadedFileName);

      // Extract file metadata
      const uploadedFileId = fileDetails.fileId;
      const fileAuthorName = fileDetails.authorName;

      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.appManagerApiClient,
        searchTerm: uploadedFileName,
        objectType: 'file',
      });

      return {
        uploadedFileName: uploadedFileName,
        fileId: uploadedFileId,
        authorName: fileAuthorName,
        siteId: siteId,
        siteName: siteName,
      };
    } catch (error) {
      console.error('Error in uploadFileToExistingSite:', error);
      throw new Error(
        `Failed to upload file to existing site: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Copies and renames a file for upload with unique name using FileUtil
   * @param originalFilePath - Path to the original file
   * @param newFileName - New name for the file
   * @returns Path to the copied file
   */
  private copyAndRenameFile(originalFilePath: string, newFileName: string): string {
    // Get the directory of the original file
    const originalDir = originalFilePath.substring(0, originalFilePath.lastIndexOf('/'));
    const newFilePath = FileUtil.getFilePath(originalDir, newFileName);

    // Use FileUtil to create temporary file copy
    FileUtil.createTemporaryFileCopy(originalFilePath, newFilePath);

    return newFilePath;
  }

  /**
   * Uploads a file to intranet via API using createIntranetFileWithAttachment (recommended approach)
   * @param params - Parameters for uploading file via API
   * @returns Object containing uploaded file details
   */
  async uploadFileViaApi(params: { siteId: string; siteName: string; filePath: string; fileName: string }) {
    return await test.step(`Uploading file "${params.fileName}" via API to site "${params.siteName}"`, async () => {
      try {
        const { siteId, siteName, filePath, fileName } = params;

        // Copy and rename the file to avoid conflicts
        const copiedFilePath = this.copyAndRenameFile(filePath, fileName);

        // Use createIntranetFileWithAttachment for complete workflow (like feed attachments)
        const fileDetails = await this.appManagerApiClient
          .getImageUploaderService()
          .UploadIntranetFile(siteId, fileName, copiedFilePath, this.getMimeTypeFromFileName(fileName));

        // Wait for the file to appear in search results
        await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
          apiClient: this.appManagerApiClient,
          searchTerm: fileName,
          objectType: 'file',
        });

        // Clean up the copied file using FileUtil
        try {
          FileUtil.deleteTemporaryFile(copiedFilePath);
        } catch (cleanupError) {
          console.warn(`Failed to clean up temporary file: ${cleanupError}`);
        }

        const result = {
          uploadedFileName: fileName,
          fileId: fileDetails.fileInfo.id,
          authorName: fileDetails.fileInfo?.owner?.name,
          siteId: siteId,
          siteName: siteName,
        };

        // Track uploaded file for cleanup
        this.uploadedFiles.push({
          fileId: fileDetails.fileInfo.id,
          siteId: siteId,
        });

        console.log(`📁 File tracked for cleanup: ${fileDetails.fileInfo.id} (Total: ${this.uploadedFiles.length})`);

        return result;
      } catch (error) {
        console.error('Error in uploadFileViaApi:', error);
        throw new Error(`Failed to upload file via API: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  /**
   * Helper method to determine MIME type from file extension
   * @param fileName - The name of the file
   * @returns The MIME type string
   */
  private getMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      csv: 'text/csv',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Deletes an intranet file via API
   * @param fileId - The file ID to delete
   * @param siteId - The site ID
   */
  async deleteFileViaApi(fileId: string, siteId: string): Promise<void> {
    await test.step(`Deleting intranet file with ID: ${fileId}`, async () => {
      try {
        await this.appManagerApiClient.getImageUploaderService().deleteIntranetFile(fileId, siteId);
      } catch (error) {
        console.error('Error in deleteFileViaApi:', error);
        throw new Error(`Failed to delete file via API: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  /**
   * Cleans up all uploaded files created during the test
   */
  async cleanup(): Promise<void> {
    return await test.step('IntranetFileHelper Cleanup', async () => {
      console.log(`🧹🧹🧹 IntranetFileHelper cleanup called - ${this.uploadedFiles.length} files tracked 🧹🧹🧹`);

      if (this.uploadedFiles.length === 0) {
        console.log('ℹ️ No files to clean up - upload may have failed');
        return;
      }

      console.log(`🗑️ Starting cleanup of ${this.uploadedFiles.length} files...`);
      for (const file of this.uploadedFiles) {
        try {
          console.log(`🗑️ Deleting file ${file.fileId} from site ${file.siteId}`);
          await this.deleteFileViaApi(file.fileId, file.siteId);
          console.log(`✅ Successfully deleted file ${file.fileId}`);
        } catch (error) {
          console.warn(`❌ Failed to delete file ${file.fileId}: ${error}`);
        }
      }
      this.uploadedFiles = [];
      console.log('🧹🧹🧹 IntranetFileHelper cleanup completed 🧹🧹🧹');
    });
  }
}
