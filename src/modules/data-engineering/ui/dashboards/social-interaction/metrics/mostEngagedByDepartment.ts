import { FrameLocator, Page } from '@playwright/test';

import { EngagedByDepartmentBase } from './engagedByDepartmentBase';

import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';

export class MostEngagedByDepartment extends EngagedByDepartmentBase {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.MOST_ENGAGED_BY_DEPARTMENT.title);
  }

  async getTopEngagedDepartment(): Promise<string> {
    const data = await this.getAllDataAsObjects();
    return data[0]?.['Department'] || '';
  }
}
