import { SnowflakeHelper } from '@data-engineering/helpers/snowflakeHelper';
import { AnalyticsSql } from '@data-engineering/sqlQueries/analytics';
import { CommonSql } from '@data-engineering/sqlQueries/common';
import { OnPageAnalyticsSql } from '@data-engineering/sqlQueries/on-page-analytics';

export interface SegmentResult {
  SEGMENT_CODE: string;
  SEGMENT_NAME: string;
}

export interface DepartmentResult {
  DEPARTMENT: string;
}

export interface LocationResult {
  LOCATION: string;
}

export interface UserCategoryResult {
  USER_CATEGORY_CODE: string;
  USER_CATEGORY_NAME: string;
}

export interface CompanyNameResult {
  COMPANY_NAME: string;
}

export interface DivisionResult {
  DIVISION: string;
}

export interface BatchRunDetailResult {
  BATCH_NAME: string;
  LAST_BATCH_END_TIME: string;
}

export interface ContentEngagementResult {
  REACTIONS_COUNT: number;
  COMMENT_COUNT: number;
  REPLIES_COUNT: number;
  SHARES_COUNT: number;
  FAVORITES_COUNT: number;
}

export interface ContentDataResult {
  CODE: string;
  TITLE: string;
  CONTENT_URL: string;
  CONTENT_TYPE: string;
}

export type SiteType = 'Public' | 'Private' | 'Unlisted';

/**
 * Analytics Query Helper
 * Handles all database queries for Analytics APIs
 * (Filters, Batch Run Details, etc.)
 */
export class AnalyticsQueryHelper {
  constructor(
    private readonly snowflakeHelper: SnowflakeHelper,
    private readonly tenantCode: string
  ) {}

  async getActiveSegmentsFromDB(): Promise<SegmentResult[]> {
    return await this.snowflakeHelper.executeWithParams<SegmentResult>(AnalyticsSql.Active_Segments, [this.tenantCode]);
  }

  async getActiveDepartmentsFromDB(): Promise<DepartmentResult[]> {
    return await this.snowflakeHelper.executeWithParams<DepartmentResult>(AnalyticsSql.Active_Departments, [
      this.tenantCode,
    ]);
  }

  async getActiveLocationsFromDB(): Promise<LocationResult[]> {
    return await this.snowflakeHelper.executeWithParams<LocationResult>(AnalyticsSql.Active_Locations, [
      this.tenantCode,
    ]);
  }

  async getActiveUserCategoriesFromDB(): Promise<UserCategoryResult[]> {
    return await this.snowflakeHelper.executeWithParams<UserCategoryResult>(AnalyticsSql.Active_User_Categories, [
      this.tenantCode,
    ]);
  }

  async getActiveCompanyNamesFromDB(): Promise<CompanyNameResult[]> {
    return await this.snowflakeHelper.executeWithParams<CompanyNameResult>(AnalyticsSql.Active_Company_Names, [
      this.tenantCode,
    ]);
  }

  async getActiveDivisionsFromDB(): Promise<DivisionResult[]> {
    return await this.snowflakeHelper.executeWithParams<DivisionResult>(AnalyticsSql.Active_Divisions, [
      this.tenantCode,
    ]);
  }

  async getBatchRunDetailsFromDB(): Promise<BatchRunDetailResult[]> {
    return await this.snowflakeHelper.execute<BatchRunDetailResult>(AnalyticsSql.ANALYTICS_LAST_UPDATED_DATETIME);
  }

  async getContentEngagementFromDB(contentCode: string): Promise<ContentEngagementResult[]> {
    const query = OnPageAnalyticsSql.CONTENT_ENGAGEMENT_DATA.replace('{tenantCode}', this.tenantCode).replace(
      '{contentCode}',
      contentCode
    );
    return await this.snowflakeHelper.execute<ContentEngagementResult>(query);
  }

  /**
   * Fetches content data from Snowflake based on tenant, restriction status, and site type
   * @param isRestricted - Whether the content is restricted
   * @param siteType - The site type (Public, Private, or Unlisted)
   * @returns Promise with content data results
   */
  async getContentDataFromDB(isRestricted: boolean, siteType: SiteType): Promise<ContentDataResult[]> {
    const query = CommonSql.CONTENT_DATA.replace('{tenantCode}', this.tenantCode)
      .replace('{isRestricted}', String(isRestricted))
      .replace('{siteType}', siteType);
    console.log('Query:', query);
    return await this.snowflakeHelper.execute<ContentDataResult>(query);
  }

  /**
   * Gets a random site type from the available options
   * @returns A random site type
   */
  static getRandomSiteType(): SiteType {
    const siteTypes: SiteType[] = ['Public', 'Private', 'Unlisted'];
    return siteTypes[Math.floor(Math.random() * siteTypes.length)];
  }
}
