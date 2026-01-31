import { SnowflakeHelper } from '@data-engineering/helpers/snowflakeHelper';
import { MustReadSql } from '@data-engineering/sqlQueries/mustRead';

export interface MustReadContentIdResult {
  CODE: string;
  SITE_TYPE_DESCRIPTION: string;
}

export interface MustReadStatusResult {
  CONTENT_CODE: string;
  SITE_NAME: string | null;
  IS_MUST_READ: boolean;
  WAS_MUST_READ: boolean;
  IS_MUST_READ_EXPIRED: number;
  MUST_READ_AUDIENCE_TYPE_CODE: string | null;
  MUST_READ_START_DATETIME: string | null;
  MUST_READ_END_DATETIME: string | null;
}

export class MustReadQueryHelper {
  constructor(
    private readonly snowflakeHelper: SnowflakeHelper,
    private readonly tenantCode: string
  ) {}

  async getActiveMustReadContentIds(): Promise<MustReadContentIdResult[]> {
    const query = MustReadSql.MUST_READ_ACTIVE_CONTENT_IDS.replace('{tenantCode}', this.tenantCode);
    return await this.snowflakeHelper.execute<MustReadContentIdResult>(query);
  }

  async getMustReadStatusByContentId(contentCode: string): Promise<MustReadStatusResult[]> {
    const query = MustReadSql.MUST_READ_STATUS_BY_CONTENT_ID.replace('{tenantCode}', this.tenantCode).replace(
      '{contentCode}',
      contentCode
    );
    return await this.snowflakeHelper.execute<MustReadStatusResult>(query);
  }

  async getMustReadCountsFromDB(contentCode: string): Promise<any[]> {
    const query = MustReadSql.MUST_READ_COUNTS.replace('{tenantCode}', this.tenantCode).replace(
      '{contentCode}',
      contentCode
    );
    return await this.snowflakeHelper.execute(query);
  }

  async getMustReadAudienceListFromDB(contentCode: string, page: number = 1): Promise<any[]> {
    const query = MustReadSql.MUST_READ_AUDIENCE_LIST.replace('{tenantCode}', this.tenantCode)
      .replace('{contentCode}', contentCode)
      .replace('{page}', String(page));
    return await this.snowflakeHelper.execute(query);
  }

  async getMustReadUserListFromDB(params: {
    contentCode: string;
    readStatus: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    const query = MustReadSql.MUST_READ_USER_LIST.replace('{tenantCode}', this.tenantCode)
      .replace('{contentCode}', params.contentCode)
      .replace('{readStatus}', params.readStatus)
      .replace('{search}', params.search ?? '')
      .replace('{page}', String(params.page ?? 1))
      .replace('{limit}', String(params.limit ?? 25));
    return await this.snowflakeHelper.execute(query);
  }

  async getMustReadUserCountFromDB(params: {
    contentCode: string;
    readStatus: string;
    search?: string;
  }): Promise<any[]> {
    const query = MustReadSql.MUST_READ_USER_COUNT.replace('{tenantCode}', this.tenantCode)
      .replace('{contentCode}', params.contentCode)
      .replace('{readStatus}', params.readStatus)
      .replace('{search}', params.search ?? '');
    return await this.snowflakeHelper.execute(query);
  }

  async getMustReadUsersCsvFromDB(contentCode: string): Promise<any[]> {
    const query = MustReadSql.MUST_READ_USERS_CSV.replace('{tenantCode}', this.tenantCode).replace(
      '{contentCode}',
      contentCode
    );
    return await this.snowflakeHelper.execute(query);
  }
}
