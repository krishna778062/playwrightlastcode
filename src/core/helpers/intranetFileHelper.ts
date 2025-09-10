import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { IntranetFileListComponent } from '@/src/modules/global-search/components/intranetFileListComponent';

/**
 * The IntranetFileHelper class is a helper class for intranet file related operations.
 * It provides methods for creating sites, uploading files, and cleaning up test data.
 */
export class IntranetFileHelper {
  private page: Page;
  private actions: BaseActionUtil;

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
   * TODO: Add list to store all files created during the test and delete them after the test.
   */
  async cleanup() {
    console.log('INFO: IntranetFileHelper cleanup method is not implemented');
  }
}
