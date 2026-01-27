import { FrameLocator, Page } from '@playwright/test';

import { PercentageMetric } from './percentageMetric';

import { CONTENT_MODERATION_METRICS } from '@/src/modules/data-engineering/constants/contentModerationMetrics';

/**
 * Reported metric component for Content Moderation Analytics.
 * Displays the count of feed posts and comments flagged by users for review.
 */
export class Reported extends PercentageMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, {
      title: CONTENT_MODERATION_METRICS.REPORTED.title,
      subtitle: CONTENT_MODERATION_METRICS.REPORTED.subtitle,
      kpiLabelTemplate: CONTENT_MODERATION_METRICS.REPORTED.kpiLabelTemplate,
    });
  }
}
