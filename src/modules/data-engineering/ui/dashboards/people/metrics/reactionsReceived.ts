import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum ReactionsReceivedColumns {
  NAME = 'Name',
  REACTIONS_RECEIVED = 'Reactions received',
}

export class ReactionsReceived extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.REACTIONS_RECEIVED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Reactions received': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ReactionsReceivedColumns.NAME]: item['Name'],
      [ReactionsReceivedColumns.REACTIONS_RECEIVED]: item['Reactions received'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ReactionsReceivedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
