import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { ContentPublished } from './metrics/contentPublished';
import { FavoritesReceived } from './metrics/favoritesReceived';
import { FeedPostsAndComments } from './metrics/feedPostsAndComments';
import { ProfileCompleteness } from './metrics/profileCompleteness';
import { ProfileViews } from './metrics/profileViews';
import { ReactionsMade } from './metrics/reactionsMade';
import { ReactionsReceived } from './metrics/reactionsReceived';
import { Replies } from './metrics/replies';
import { RepliesFromOtherUsers } from './metrics/repliesFromOtherUsers';
import { SharesReceived } from './metrics/sharesReceived';
import { TotalDepartments } from './metrics/totalDepartments';
import { TotalLocations } from './metrics/totalLocations';
import { TotalUserCategories } from './metrics/totalUserCategories';
import { TotalUsers } from './metrics/totalUsers';

import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class PeopleDashboard extends BaseAnalyticsDashboardPage {
  readonly peopleTab: Locator;

  // Hero metric components
  readonly totalUsers: TotalUsers;
  readonly totalDepartments: TotalDepartments;
  readonly totalLocations: TotalLocations;
  readonly totalUserCategories: TotalUserCategories;

  // Tabular metric components
  readonly contentPublished: ContentPublished;
  readonly favoritesReceived: FavoritesReceived;
  readonly reactionsMade: ReactionsMade;
  readonly reactionsReceived: ReactionsReceived;
  readonly feedPostsAndComments: FeedPostsAndComments;
  readonly replies: Replies;
  readonly repliesFromOtherUsers: RepliesFromOtherUsers;
  readonly sharesReceived: SharesReceived;
  readonly profileViews: ProfileViews;
  readonly profileCompleteness: ProfileCompleteness;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DASHBOARD_PAGE);
    this.peopleTab = this.page.getByRole('tab', { name: 'People' }).first();

    // Initialize hero metric components
    this.totalUsers = new TotalUsers(page, this.thoughtSpotIframe);
    this.totalDepartments = new TotalDepartments(page, this.thoughtSpotIframe);
    this.totalLocations = new TotalLocations(page, this.thoughtSpotIframe);
    this.totalUserCategories = new TotalUserCategories(page, this.thoughtSpotIframe);

    // Initialize tabular metric components
    this.contentPublished = new ContentPublished(page, this.thoughtSpotIframe);
    this.favoritesReceived = new FavoritesReceived(page, this.thoughtSpotIframe);
    this.reactionsMade = new ReactionsMade(page, this.thoughtSpotIframe);
    this.reactionsReceived = new ReactionsReceived(page, this.thoughtSpotIframe);
    this.feedPostsAndComments = new FeedPostsAndComments(page, this.thoughtSpotIframe);
    this.replies = new Replies(page, this.thoughtSpotIframe);
    this.repliesFromOtherUsers = new RepliesFromOtherUsers(page, this.thoughtSpotIframe);
    this.sharesReceived = new SharesReceived(page, this.thoughtSpotIframe);
    this.profileViews = new ProfileViews(page, this.thoughtSpotIframe);
    this.profileCompleteness = new ProfileCompleteness(page, this.thoughtSpotIframe);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify People Dashboard page is loaded', async () => {
      // Just verify the People tab is visible - don't wait for iframe/metrics
      // Those will be verified individually in each test
      await this.verifier.verifyTheElementIsVisible(this.peopleTab, {
        timeout: TIMEOUTS.VERY_LONG,
        assertionMessage: 'People tab should be visible and active',
      });
    });
  }
}
