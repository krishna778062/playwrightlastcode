import { Page, test } from '@playwright/test';

import { Downloads, Favourites, Reactions, TotalViews, UniqueViews } from './metrics';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class FilesDashboard extends BaseAnalyticsDashboardPage {
  // Dedicated metric components using composition
  readonly totalViews: TotalViews;
  readonly downloads: Downloads;
  readonly favourites: Favourites;
  readonly reactions: Reactions;
  readonly uniqueViews: UniqueViews;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FILES_DASHBOARD);
    this.totalViews = new TotalViews(page, this.thoughtSpotIframe);
    this.downloads = new Downloads(page, this.thoughtSpotIframe);
    this.favourites = new Favourites(page, this.thoughtSpotIframe);
    this.reactions = new Reactions(page, this.thoughtSpotIframe);
    this.uniqueViews = new UniqueViews(page, this.thoughtSpotIframe);
  }

  /**
   * Verifies the Files page has loaded by asserting metrics are loaded.
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Files page is loaded', async () => {
      await this.totalViews.verifyMetricIsLoaded();
    });
  }
}
