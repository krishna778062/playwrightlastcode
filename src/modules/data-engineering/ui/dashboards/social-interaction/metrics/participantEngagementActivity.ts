import { FrameLocator, Page } from '@playwright/test';

import { VerticalBarChartComponent } from '../../../components/verticalBarChartComponent';

import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';

export class ParticipantEngagementActivity extends VerticalBarChartComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.PARTICIPANT_ENGAGEMENT_ACTIVITY.title);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyChartIsLoaded();
  }

  async verifyChartIsLoaded(): Promise<void> {
    await this.verifier.verifyCountOfElementsIsGreaterThan(this.bars, 0, {
      timeout: 120_000,
      assertionMessage: 'Chart bars should be visible',
    });
  }
}
