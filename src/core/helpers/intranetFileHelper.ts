import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { NewUxHomePage } from '../pages/homePage/newUxHomePage';
import { Page } from '@playwright/test';

interface FileContent {
  siteId: string;
  fileId: string;
}

export class IntranetFileHelper {
  private content: FileContent[] = [];
  private page: Page;

  constructor(
    private appManagerApiClient: AppManagerApiClient,
    page: Page
  ) {
    this.page = page;
  }

  async createSiteAndNavigateToIt(
    homePage: NewUxHomePage,
    siteName: string,
    category: { name: string; categoryId: string }
  ): Promise<{ siteId: string; siteName: string }> {
    const siteResult = await this.appManagerApiClient.getSiteManagementService().addNewSite({
      access: 'public',
      name: siteName,
      category: {
        categoryId: category.categoryId,
        name: category.name,
      },
    });
    const siteId = siteResult.siteId;
    this.content.push({ siteId, fileId: '' });

    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      siteName,
      siteName,
      'site'
    );

    const searchResultPage = await homePage.actions.searchForTerm(siteName, {
      stepInfo: `Searching for site with name ${siteName}`,
    });

    const siteResultComponent = await searchResultPage.getSiteResultItemExactlyMatchingTheSearchTerm(siteName);
    await siteResultComponent.verifyNavigationToTitleLink(siteId, siteName, 'site');

    return {
      siteId: siteId,
      siteName: siteName,
    };
  }

  async clickFilesTab(): Promise<void> {
    const filesTab = this.page.locator('a[role="tab"][id="files"]');
    await filesTab.waitFor({ state: 'visible' });
    await filesTab.click();
  }

  /**
   * Cleans up all files and sites created by this helper instance.
   */
  async cleanup() {
    for (const { siteId } of this.content) {
      if (siteId) {
        await this.appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
      }
    }
  }
}
