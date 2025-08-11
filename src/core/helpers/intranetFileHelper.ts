import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { NewUxHomePage } from '../pages/homePage/newUxHomePage';
import { Page } from '@playwright/test';
import { GlobalSearchResultPage } from '@/src/modules/global-search/pages/globalSearchResultPage';

interface FileContent {
  siteId: string;
  fileId?: string;
}

/**
 * The IntranetFileHelper class is a helper class for intranet file related operations.
 * It provides methods for creating sites, uploading files, and cleaning up test data.
 */
export class IntranetFileHelper {
  private content: FileContent[] = [];
  private page: Page;
  private siteManagementService: any;
  private userManagementService: any;

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
    this.siteManagementService = appManagerApiClient.getSiteManagementService();
    this.userManagementService = appManagerApiClient.getUserManagementService();
  }

  /**
   * Creates a new site with the given name and category.
   * @param siteName - The name of the site to create.
   * @param category - The category of the site.
   * @returns A promise that resolves with the site ID.
   */
  async createSite(
    siteName: string,
    category: { name: string; categoryId: string },
    options?: { access?: 'public' | 'private' | 'unlisted' }
  ): Promise<{ siteId: string }> {
    const siteResult = await this.siteManagementService.addNewSite({
      access: options?.access ?? 'public',
      name: siteName,
      category: {
        categoryId: category.categoryId,
        name: category.name,
      },
    });
    const siteId = siteResult.siteId;
    this.content.push({ siteId: siteId });

    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      siteName,
      siteName,
      'site'
    );

    return {
      siteId,
    };
  }

  /**
   * Uploads a file to the specified site.
   * @param homePage - The home page object.
   * @param fileType - The type of file to upload.
   * @param siteName - The name of the site to upload the file to.
   * @param siteId - The ID of the site to upload the file to.
   * @returns A promise that resolves with the name of the uploaded file.
   */
  async uploadFile(homePage: NewUxHomePage, siteName: string, siteId: string, filePath: string): Promise<string> {
    const globalSearchResultPage = await homePage.actions.searchForTerm(siteName, {
      stepInfo: `Searching with term "${siteName}" and intent is to find the site`,
    });
    const siteResultComponent = await globalSearchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(siteName);
    await siteResultComponent.verifyNavigationToTitleLink(siteId, siteName, 'site');
    const intranetFileListComponent = globalSearchResultPage.getIntranetFileListComponent();
    await intranetFileListComponent.clickFilesTab();
    const uploadedFileName = await intranetFileListComponent.uploadFileFromComputer(filePath);
    return uploadedFileName;
  }

  /**
   * Cleans up the test data by deactivating the created sites.
   */
  async cleanup() {
    for (const { siteId } of this.content) {
      if (siteId) {
        await this.appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
      }
    }
  }
}
