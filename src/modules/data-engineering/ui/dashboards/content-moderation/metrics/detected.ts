import { FrameLocator, Page } from '@playwright/test';

import { PercentageMetric } from './percentageMetric';

import { CONTENT_MODERATION_METRICS } from '@/src/modules/data-engineering/constants/contentModerationMetrics';

/**
 * Detected metric component for Content Moderation Analytics.
 * Displays the count of feed posts and comments automatically flagged by moderation rules.
 */
export class Detected extends PercentageMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, {
      title: CONTENT_MODERATION_METRICS.DETECTED.title,
      subtitle: CONTENT_MODERATION_METRICS.DETECTED.subtitle,
      kpiLabelTemplate: CONTENT_MODERATION_METRICS.DETECTED.kpiLabelTemplate,
    });
  }
}
