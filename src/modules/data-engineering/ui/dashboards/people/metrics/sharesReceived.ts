import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum SharesReceivedColumns {
  NAME = 'Name',
  SHARES_RECEIVED = 'Shares received',
}

export class SharesReceived extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.SHARES_RECEIVED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Shares received': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [SharesReceivedColumns.NAME]: item['Name'],
      [SharesReceivedColumns.SHARES_RECEIVED]: item['Shares received'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, SharesReceivedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
