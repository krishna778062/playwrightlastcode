import { FrameLocator, Page } from '@playwright/test';

import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export class MostEngagedByDepartment extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.MOST_ENGAGED_BY_DEPARTMENT.title);
  }

  /**
   * Verifies that the most engaged by department data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Gets the department with highest engagement
   * @returns The department name with highest engagement
   */
  async getTopEngagedDepartment(): Promise<string> {
    const data = await this.getAllDataAsObjects();
    return data[0]?.['Department'] || '';
  }
}
