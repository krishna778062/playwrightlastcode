import { FrameLocator, Page } from '@playwright/test';

import { PieChartComponent } from '../../../components/pieChartComponent';

export class UserEngagementBreakdownMetric extends PieChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'User engagement breakdown');
  }
}
