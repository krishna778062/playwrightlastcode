import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { Favorites } from './metrics/favorites';
import { FeedPostsAndComments } from './metrics/feedPostsAndComments';
import { LeastEngagedByDepartment } from './metrics/leastEngagedByDepartment';
import { MostEngagedByDepartment } from './metrics/mostEngagedByDepartment';
import { ParticipantEngagementActivity } from './metrics/participantEngagementActivity';
import { ReactionsOrLikes } from './metrics/reactionsOrLikes';
import { Replies } from './metrics/replies';
import { Shares } from './metrics/shares';
// Import dedicated metric components
import { SocialCampaignShareDistribution } from './metrics/socialCampaignShareDistribution';

import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class SocialInteractionDashboard extends BaseAnalyticsDashboardPage {
  readonly socialInteractionTab: Locator;

  // Dedicated metric components using composition
  readonly socialCampaignShareDistribution: SocialCampaignShareDistribution;
  readonly mostEngagedByDepartment: MostEngagedByDepartment;
  readonly leastEngagedByDepartment: LeastEngagedByDepartment;
  readonly participantEngagementActivity: ParticipantEngagementActivity;
  readonly reactionsOrLikesMetrics: ReactionsOrLikes;
  readonly feedPostsAndComments: FeedPostsAndComments;
  readonly replies: Replies;
  readonly shares: Shares;
  readonly favorites: Favorites;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_INTERACTION_PAGE);
    this.socialInteractionTab = this.page.getByRole('tab', { name: 'Social interaction' }).first();

    // Initialize dedicated metric components
    this.socialCampaignShareDistribution = new SocialCampaignShareDistribution(page, this.thoughtSpotIframe);
    this.mostEngagedByDepartment = new MostEngagedByDepartment(page, this.thoughtSpotIframe);
    this.leastEngagedByDepartment = new LeastEngagedByDepartment(page, this.thoughtSpotIframe);
    this.participantEngagementActivity = new ParticipantEngagementActivity(page, this.thoughtSpotIframe);
    this.reactionsOrLikesMetrics = new ReactionsOrLikes(page, this.thoughtSpotIframe);
    this.feedPostsAndComments = new FeedPostsAndComments(page, this.thoughtSpotIframe);
    this.replies = new Replies(page, this.thoughtSpotIframe);
    this.shares = new Shares(page, this.thoughtSpotIframe);
    this.favorites = new Favorites(page, this.thoughtSpotIframe);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Social Interaction page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.socialInteractionTab, {
        timeout: TIMEOUTS.VERY_LONG,
        assertionMessage: 'Social Interaction tab should be visible and active',
      });

      //verify that atleast 1 reaction/likes metric is visible
      await this.reactionsOrLikesMetrics.verifyMetricUIDataPoints();
    });
  }
}
