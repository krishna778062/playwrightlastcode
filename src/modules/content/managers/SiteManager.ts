import { Page } from '@playwright/test';

import { SitePageTab } from '../constants/sitePageEnums';
import { SiteAboutPage } from '../pages/sitePages/siteAboutPage';
import { SiteContentPage } from '../pages/sitePages/siteContentPage';
import { SiteDashboardPage } from '../pages/sitePages/siteDashboardPage';
import { SiteFeedPage } from '../pages/sitePages/siteFeedPage';
import { SiteFilesPage } from '../pages/sitePages/siteFilesPage';
import { SiteQuestionsPage } from '../pages/sitePages/siteQuestionsPage';

export type SitePages =
  | SiteDashboardPage
  | SiteFeedPage
  | SiteContentPage
  | SiteQuestionsPage
  | SiteFilesPage
  | SiteAboutPage;

export class SiteManager {
  private currentPage: SitePages | null = null;
  constructor(
    private readonly page: Page,
    readonly siteId: string
  ) {}

  /**
   * Loads the site dashboard page as thats default landing page for a site
   * @returns
   */
  async loadSite(): Promise<SiteDashboardPage> {
    // Navigate to specific site
    this.currentPage = new SiteDashboardPage(this.page, this.siteId);
    await this.currentPage.loadPage();
    await this.currentPage.verifyThePageIsLoaded();
    return this.currentPage as SiteDashboardPage;
  }

  getSiteId(): string {
    return this.siteId;
  }

  async goToTab(tabName: SitePageTab): Promise<SitePages> {
    if (!this.currentPage) {
      await this.loadSite();
    }
    await this.currentPage?.navigateToTab(tabName);
    switch (tabName) {
      case SitePageTab.DashboardTab:
        this.currentPage = new SiteDashboardPage(this.page, this.siteId);
        break;
      case SitePageTab.FeedTab:
        this.currentPage = new SiteFeedPage(this.page, this.siteId);
        break;
      case SitePageTab.ContentTab:
        this.currentPage = new SiteContentPage(this.page, this.siteId);
        break;
      case SitePageTab.QuestionsTab:
        this.currentPage = new SiteQuestionsPage(this.page, this.siteId);
        break;
      case SitePageTab.FilesTab:
        this.currentPage = new SiteFilesPage(this.page, this.siteId);
        break;
      case SitePageTab.AboutTab:
        this.currentPage = new SiteAboutPage(this.page, this.siteId);
        break;
      default:
        throw new Error(`Unknown tab: ${tabName}`);
    }
    return this.currentPage as SitePages;
  }
}
