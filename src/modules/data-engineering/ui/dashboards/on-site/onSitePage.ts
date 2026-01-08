import {
  ContentReferrals,
  FavoritesReceived,
  FeedPostsAndContentComments,
  MostContentPublished,
  MostPopular,
  MostViewedContent,
  ReactionsMade,
  ReactionsReceived,
  RepliesFromOtherUsers,
  RepliesToOthers,
  SharesReceived,
} from '@data-engineering/ui/dashboards/on-site/metrics';
import { BaseAnalyticsDashboardPage } from '@data-engineering/ui/pages/baseAnalyticsDashboardPage';
import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

/**
 * On-Site Analytics Page
 * This page represents the site-specific analytics page for verification
 * Currently configured with a static URL for a specific site
 */
export class OnSitePage extends BaseAnalyticsDashboardPage {
  // Tabular metric components
  readonly reactionsMade: ReactionsMade;
  readonly reactionsReceived: ReactionsReceived;
  readonly favoritesReceived: FavoritesReceived;
  readonly sharesReceived: SharesReceived;
  readonly feedPostsAndContentComments: FeedPostsAndContentComments;
  readonly repliesToOthers: RepliesToOthers;
  readonly repliesFromOtherUsers: RepliesFromOtherUsers;
  readonly mostPopular: MostPopular;
  readonly contentReferrals: ContentReferrals;
  readonly mostContentPublished: MostContentPublished;
  readonly mostViewedContent: MostViewedContent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ON_SITE_PAGE);
    this.reactionsMade = new ReactionsMade(page, this.thoughtSpotIframe);
    this.reactionsReceived = new ReactionsReceived(page, this.thoughtSpotIframe);
    this.favoritesReceived = new FavoritesReceived(page, this.thoughtSpotIframe);
    this.sharesReceived = new SharesReceived(page, this.thoughtSpotIframe);
    this.feedPostsAndContentComments = new FeedPostsAndContentComments(page, this.thoughtSpotIframe);
    this.repliesToOthers = new RepliesToOthers(page, this.thoughtSpotIframe);
    this.repliesFromOtherUsers = new RepliesFromOtherUsers(page, this.thoughtSpotIframe);
    this.mostPopular = new MostPopular(page, this.thoughtSpotIframe);
    this.contentReferrals = new ContentReferrals(page, this.thoughtSpotIframe);
    this.mostContentPublished = new MostContentPublished(page, this.thoughtSpotIframe);
    this.mostViewedContent = new MostViewedContent(page, this.thoughtSpotIframe);
  }

  /**
   * Extracts the site code from the current page URL
   * @returns The site code (UUID) extracted from the URL
   */
  getSiteCodeFromUrl(): string {
    const url = this.page.url();
    // Extract site code from URL pattern: /manage/sites/{siteCode}/analytics
    const match = url.match(/\/manage\/sites\/([a-f0-9-]+)\/analytics/i);
    if (!match?.[1]) {
      throw new Error(`Failed to extract site code from URL: ${url}`);
    }
    return match[1];
  }

  /**
   * Verifies that the On-Site Analytics page has loaded
   * This is a basic verification that can be extended as widgets are added
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify On-Site Analytics page is loaded', async () => {
      // Hard wait for page to load
      await this.page.waitForTimeout(TIMEOUTS.VERY_LONG);
    });
  }
}
