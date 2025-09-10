import test, { Locator, Page } from '@playwright/test';

import { SiteAboutPage } from './siteAboutPage';
import { SiteContentPage } from './siteContentPage';
import { SiteDashboardPage } from './siteDashboardPage';
import { SiteFeedPage } from './siteFeedPage';
import { SiteFilesPage } from './siteFilesPage';
import { SiteQuestionsPage } from './siteQuestionsPage';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@/src/core/api/factories/apiClientFactory';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { BasePage } from '@/src/core/pages/basePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

// Tab ID mapping type for better type safety
type TabIdToPageTypeMap = {
  files: SiteFilesPage;
  about: SiteAboutPage;
  content: SiteContentPage;
  feed: SiteFeedPage;
  questions: SiteQuestionsPage;
  dashboard: SiteDashboardPage;
};

/**
 * A Site has many pages.
 * This class is for managing the Site Main page. This page is the main entry point for site-related functionalities.
 */
export class SitePage extends BasePage {
  get gsBox(): Locator {
    return this.page.locator(`header[aria-label="Header"]`).locator('input');
  }
  gsNameOfTheSite: string = '';
  get gsDropDownFirstResult(): Locator {
    return this.page
      .locator(`header[aria-label="Header"]`)
      .locator(`a`)
      .locator(`p`, { hasText: this.gsNameOfTheSite })
      .first();
  }

  getTabById(tabId: string): Locator {
    return this.page.locator(`a[role='tab'][id='${tabId}']`);
  }
  get siteFilesLinkText(): Locator {
    return this.page.locator(`a[title="Site files"]`);
  }
  constructor(page: Page) {
    super(page);
  }

  /**
   * Factory method to create the appropriate page object based on tab ID
   * @param tabId - The ID of the tab navigated to
   * @returns The corresponding page object instance
   */
  private createPageObjectByTabId<T extends keyof TabIdToPageTypeMap>(tabId: T): TabIdToPageTypeMap[T] {
    switch (tabId) {
      case 'files':
        return new SiteFilesPage(this.page) as TabIdToPageTypeMap[T];
      case 'about':
        return new SiteAboutPage(this.page) as TabIdToPageTypeMap[T];
      case 'content':
        return new SiteContentPage(this.page) as TabIdToPageTypeMap[T];
      case 'feed':
        return new SiteFeedPage(this.page) as TabIdToPageTypeMap[T];
      case 'questions':
        return new SiteQuestionsPage(this.page) as TabIdToPageTypeMap[T];
      case 'dashboard':
        return new SiteDashboardPage(this.page) as TabIdToPageTypeMap[T];
      default:
        throw new Error(
          `Unsupported tab ID: ${tabId}. Supported tabs: files, about, content, feed, questions, dashboard`
        );
    }
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilPageHasNavigatedTo(/site/);
    await this.verifier.verifyTheElementIsVisible(this.getTabById('files'), { timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * Landing on a Site Main page with a specific keyword.
   * @param keyword
   * @param keywordType
   */
  async landOnMainPageOfSite(fullNameOfTheSite: string) {
    await test.step(`Navigate to the "Public Site" ${fullNameOfTheSite}`, async () => {
      this.gsNameOfTheSite = fullNameOfTheSite;
      await this.verifier.isTheElementVisible(this.gsBox, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.gsBox, { timeout: TIMEOUTS.MEDIUM });

      await this.fillInElement(this.gsBox, fullNameOfTheSite);
      await this.verifier.isTheElementVisible(this.gsDropDownFirstResult, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.gsDropDownFirstResult);

      await this.verifier.waitUntilPageHasNavigatedTo(/site/, { timeout: TIMEOUTS.MEDIUM });
      await this.verifier.verifyTheElementIsVisible(this.getTabById('files'), { timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Navigate to a specific tab on the Site Main page and return the corresponding page object.
   * @param tabId - The ID of the tab to navigate to (e.g., 'files', 'about', 'content', etc.)
   * @returns Promise resolving to the corresponding page object based on tabId
   *
   * @example
   * ```typescript
   * const filesPage = await SitePage.navigateToSiteTab('files');     // Returns SiteFilesPage
   * const aboutPage = await SitePage.navigateToSiteTab('about');     // Returns SiteAboutPage
   * const contentPage = await SitePage.navigateToSiteTab('content'); // Returns SiteContentPage
   * ```
   */
  async navigateToSiteTab<T extends keyof TabIdToPageTypeMap>(tabId: T): Promise<TabIdToPageTypeMap[T]> {
    return await test.step(`Navigate to "Site > ${tabId}" tab`, async () => {
      await this.verifier.isTheElementVisible(this.getTabById(tabId), { timeout: TIMEOUTS.MEDIUM });
      await this.getTabById(tabId).click();

      const pageObject = this.createPageObjectByTabId(tabId);

      // Verify page is loaded if the page object has the method
      if ('verifyThePageIsLoaded' in pageObject && typeof pageObject.verifyThePageIsLoaded === 'function') {
        await pageObject.verifyThePageIsLoaded();
      }

      return pageObject;
    });
  }

  /**
   * Navigate directly to a specific site tab by constructing the URL and navigating to it.
   * This method will fetch the site ID from the site list and construct the direct URL.
   *
   * @param siteName - The name of the site to navigate to
   * @param tabId - The ID of the tab to navigate to (e.g., 'files', 'about', 'dashboard', etc.)
   * @returns Promise resolving to the corresponding page object based on tabId
   *
   * @example
   * ```typescript
   * // Navigate directly to files tab of "My Site"
   * const filesPage = await SitePage.navigateToSiteTabDirectly('My Site', 'files');
   *
   * // Navigate directly to dashboard tab of "Project Alpha"
   * const dashboardPage = await SitePage.navigateToSiteTabDirectly('Project Alpha', 'dashboard');
   * ```
   */
  async navigateDirectlyToTheSiteTabOfSite<T extends keyof TabIdToPageTypeMap>(
    siteName: string,
    tabId: T
  ): Promise<TabIdToPageTypeMap[T]> {
    return await test.step(`Navigate to "${siteName}" Site > ${tabId} tab directly`, async () => {
      // Get environment configuration for base URL
      const envConfig = getEnvConfig();
      const baseUrl = envConfig.frontendBaseUrl;

      // Create API client and site management helper to get site ID
      const apiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: envConfig.appManagerEmail,
          password: envConfig.appManagerPassword,
        },
        baseUrl: envConfig.apiBaseUrl,
      });
      const siteManagementHelper = new SiteManagementHelper(apiClient);

      // Get the site ID for the given site name
      const siteId = await siteManagementHelper.getSiteFromSiteList(siteName);

      // Construct the direct URL
      const directUrl = `${baseUrl}/site/${siteId}/${tabId}`;

      console.log(`Navigating directly to: ${directUrl}`);

      // Navigate to the constructed URL
      await this.page.goto(directUrl);
      // await this.verifier.waitUntilPageHasNavigatedTo(directUrl);

      // Create and verify the appropriate page object
      await this.getTabById(tabId).click();
      const pageObject = this.createPageObjectByTabId(tabId);

      // Verify page is loaded if the page object has the method
      if ('verifyThePageIsLoaded' in pageObject && typeof pageObject.verifyThePageIsLoaded === 'function') {
        await pageObject.verifyThePageIsLoaded();
      }

      return pageObject;
    });
  }
}
