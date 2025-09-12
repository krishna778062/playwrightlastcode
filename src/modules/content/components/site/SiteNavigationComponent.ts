import { Locator, Page } from '@playwright/test';

import { SitePageTab } from '../../constants/sitePageEnums';

/**
 * Handles site navigation functionality
 * Separated from page objects to avoid circular dependencies
 */
export class SiteNavigationComponent {
  readonly page: Page;
  readonly siteId: string;
  readonly addContentButton: Locator;
  readonly manageSiteButton: Locator;
  readonly siteNameHeading: Locator;

  constructor(page: Page, siteId: string) {
    this.page = page;
    this.siteId = siteId;
    this.addContentButton = this.page.locator("button[title='Add content']");
    this.manageSiteButton = this.page.locator("button[title='Manage site'], a[href*='/manage']");
    this.siteNameHeading = this.page.locator('[class*="SiteHeader-title-heading"]');
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

  /**
   * Gets the tab locator for a given tab name
   */
  getTabLocator(tabName: SitePageTab): Locator {
    return this.page.getByRole('tab', { name: tabName });
  }

  /**
   * Gets success message locator
   */
  getSuccessMessageLocator(message: string): Locator {
    return this.page.locator('div[class*="Toast-module"] p', { hasText: message });
  }
}
