import { FrameLocator, Page } from '@playwright/test';

import { PercentageMetric } from './percentageMetric';

import { CONTENT_MODERATION_METRICS } from '@/src/modules/data-engineering/constants/contentModerationMetrics';

/**
 * Removed metric component for Content Moderation Analytics.
 * Displays the count of feed posts and comments taken down after moderation decisions.
 */
export class Removed extends PercentageMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, {
      title: CONTENT_MODERATION_METRICS.REMOVED.title,
      subtitle: CONTENT_MODERATION_METRICS.REMOVED.subtitle,
      kpiLabelTemplate: CONTENT_MODERATION_METRICS.REMOVED.kpiLabelTemplate,
    });
  }
}
