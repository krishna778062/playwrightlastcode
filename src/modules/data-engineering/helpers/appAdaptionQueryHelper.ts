import { BaseAnalyticsQueryHelper, SnowflakeHelper } from '.';

export class AppAdoptionDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }
}
