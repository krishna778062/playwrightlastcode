import { FrameLocator, Page } from '@playwright/test';

import { BaseAppAdoptionPieChartMetric } from './baseAppAdoptionPieChartMetric';

export class UserEngagementBreakdownMetric extends BaseAppAdoptionPieChartMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'User engagement breakdown');
  }
}
