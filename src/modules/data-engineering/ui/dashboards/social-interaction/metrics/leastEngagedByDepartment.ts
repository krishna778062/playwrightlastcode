import { FrameLocator, Page } from '@playwright/test';

import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export class LeastEngagedByDepartment extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    const container = iframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: iframe.getByRole('heading', { name: 'Least engaged by Department', exact: true }),
    });

    super(page, iframe, container);
  }

  /**
   * Verifies that the least engaged by department data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Gets the department with lowest engagement
   * @returns The department name with lowest engagement
   */
  async getLeastEngagedDepartment(): Promise<string> {
    const data = await this.getAllDataAsObjects();
    return data[0]?.['Department'] || '';
  }
}
