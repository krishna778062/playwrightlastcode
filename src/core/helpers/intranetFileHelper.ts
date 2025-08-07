import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { NewUxHomePage } from '../pages/homePage/newUxHomePage';
import { Page } from '@playwright/test';
import { GlobalSearchResultPage } from '@/src/modules/global-search/pages/globalSearchResultPage';

interface FileContent {
  siteId: string;
  fileId?: string;
}

export class IntranetFileHelper {
  private content: FileContent[] = [];
  private page: Page;
  private siteManagementService: any;
  private userManagementService: any;

  constructor(
    private appManagerApiClient: AppManagerApiClient,
    page: Page
  ) {
    this.page = page;
    this.siteManagementService = appManagerApiClient.getSiteManagementService();
    this.userManagementService = appManagerApiClient.getUserManagementService();
  }

  async createSite(siteName: string, category: { name: string; categoryId: string }): Promise<{ siteId: string }> {
    const siteResult = await this.siteManagementService.addNewSite({
      access: 'public',
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

  async uploadFile(
    homePage: NewUxHomePage,
    fileType: { type: string; fileName: string },
    siteName: string,
    siteId: string
  ): Promise<string> {
    const globalSearchResultPage = await homePage.actions.searchForTerm(siteName, {
      stepInfo: `Searching with term "${siteName}" and intent is to find the site`,
    });
    const siteResultComponent = await globalSearchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(siteName);
    await siteResultComponent.verifyNavigationToTitleLink(siteId, siteName, 'site');
    const intranetFileListComponent = globalSearchResultPage.getIntranetFileListComponent();
    await intranetFileListComponent.clickFilesTab();
    const uploadedFileName = await intranetFileListComponent.uploadFileFromComputer(
      `src/modules/global-search/test-data/${fileType.fileName}`
    );
    return uploadedFileName;
  }

  async cleanup() {
    for (const { siteId } of this.content) {
      if (siteId) {
        await this.appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
      }
    }
  }
}
