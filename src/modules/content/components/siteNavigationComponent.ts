import { Page, test } from '@playwright/test';

import { SitePageTab } from '../constants/sitePageEnums';

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
        return `/site/${this.siteId}/dashboard`;
      case SitePageTab.FeedTab:
        return `/site/${this.siteId}/feed`;
      case SitePageTab.ContentTab:
        return `/site/${this.siteId}/content`;
      case SitePageTab.QuestionsTab:
        return `/site/${this.siteId}/questions`;
      case SitePageTab.FilesTab:
        return `/site/${this.siteId}/files`;
      case SitePageTab.AboutTab:
        return `/site/${this.siteId}/about/managers`;
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
