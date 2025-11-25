import { SnowflakeHelper } from '@data-engineering/helpers/snowflakeHelper';
import { AnalyticsSql } from '@data-engineering/sqlQueries/analytics';

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
}
