import { Page, test } from '@playwright/test';

import { SitePageTab } from '@content/constants/sitePageEnums';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

/**
 * Handles site navigation functionality
 * Separated from page objects to avoid circular dependencies
 */
export class SiteNavigationComponent {
  readonly page: Page;
  readonly siteId: string;

  constructor(page: Page, siteId: string) {
    this.page = page;
    this.siteId = siteId;
  }

  /**
   * Gets the URL for a given site and tab
   */
  getSiteTabUrl(tabName: SitePageTab): string {
    switch (tabName) {
      case SitePageTab.DashboardTab:
        return PAGE_ENDPOINTS.getSiteDashboardPage(this.siteId);
      case SitePageTab.FeedTab:
        return PAGE_ENDPOINTS.getSiteFeedPage(this.siteId);
      case SitePageTab.ContentTab:
        return PAGE_ENDPOINTS.getSiteContentPage(this.siteId);
      case SitePageTab.QuestionsTab:
        return PAGE_ENDPOINTS.getSiteQuestionsPage(this.siteId);
      case SitePageTab.FilesTab:
        return PAGE_ENDPOINTS.getSiteFilesPage(this.siteId);
      case SitePageTab.AboutTab:
        return PAGE_ENDPOINTS.getSiteAboutPage(this.siteId);
      default:
        throw new Error(`Unknown tab: ${tabName}`);
    }
  }

  async switchToTab(tabName: SitePageTab): Promise<void> {
    await test.step(`Switch to ${tabName} tab`, async () => {
      await this.page.getByRole('tab', { name: tabName }).click();
    });
  }
}
