import { FrameLocator, Page } from '@playwright/test';

import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export class MostEngagedByDepartment extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    const container = iframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: iframe.getByRole('heading', { name: 'Most engaged by Department', exact: true }),
    });

    super(page, iframe, container);
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
