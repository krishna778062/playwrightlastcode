import { Page, test } from '@playwright/test';

import { NewUxHomePage } from '../pages/homePage/newUxHomePage';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
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
   * @param homePage - The home page object.
   * @param fileType - The type of file to upload.
   * @param siteName - The name of the site to upload the file to.
   * @param siteId - The ID of the site to upload the file to.
   * @returns A promise that resolves with the name of the uploaded file.
   */
  async uploadFile(_homePage: NewUxHomePage, _siteName: string, siteId: string, filePath: string): Promise<string> {
    return await test.step(`Navigate directly to site and upload file`, async () => {
      const baseUrl = getEnvConfig().frontendBaseUrl.replace(/\/$/, '');
      await this.actions.goToUrl(`${baseUrl}${PAGE_ENDPOINTS.SITE_PAGE(siteId)}`);

      const intranetFileListComponent = new IntranetFileListComponent(this.page);
      await test.step(`Open Files tab`, async () => {
        await intranetFileListComponent.clickFilesTab();
      });
      // If the file is an mp4, click the 'Site videos' link before upload
      if (filePath.endsWith('.mp4')) {
        await intranetFileListComponent.clickSiteVideosTab();
      }
      const uploadedFileName = await test.step(`Upload file from computer`, async () => {
        return await intranetFileListComponent.uploadFileFromComputer(filePath);
      });
      return uploadedFileName;
    });
  }

  /**
   * TODO: Add list to store all files created during the test and delete them after the test.
   */
  async cleanup() {
    console.log('INFO: IntranetFileHelper cleanup method is not implemented');
  }
}
