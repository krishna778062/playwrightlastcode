import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum FavoritesReceivedColumns {
  NAME = 'Name',
  FAVORITES_RECEIVED = 'Favorites received',
}

export class FavoritesReceived extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.FAVORITES_RECEIVED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Favorites received': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [FavoritesReceivedColumns.NAME]: item['Name'],
      [FavoritesReceivedColumns.FAVORITES_RECEIVED]: item['Favorites received'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, FavoritesReceivedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
