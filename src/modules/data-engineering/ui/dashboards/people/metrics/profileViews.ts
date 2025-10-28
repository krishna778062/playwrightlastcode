import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum ProfileViewsColumns {
  NAME = 'Name',
  PROFILE_VIEWS = 'Profile views',
}

export class ProfileViews extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.PROFILE_VIEWS.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Profile views': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ProfileViewsColumns.NAME]: item['Name'],
      [ProfileViewsColumns.PROFILE_VIEWS]: item['Profile views'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ProfileViewsColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
