import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum RepliesFromOtherUsersColumns {
  NAME = 'Name',
  REPLIES_RECEIVED = 'Replies received',
}

export class RepliesFromOtherUsers extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.REPLIES_FROM_OTHER_USERS.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Replies received': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [RepliesFromOtherUsersColumns.NAME]: item['Name'],
      [RepliesFromOtherUsersColumns.REPLIES_RECEIVED]: item['Replies received'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, RepliesFromOtherUsersColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
