import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum ReactionsMadeColumns {
  NAME = 'Name',
  REACTIONS_MADE = 'Reactions made',
}

export class ReactionsMade extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.REACTIONS_MADE.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Reactions made': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ReactionsMadeColumns.NAME]: item['Name'],
      [ReactionsMadeColumns.REACTIONS_MADE]: item['Reactions made'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ReactionsMadeColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
