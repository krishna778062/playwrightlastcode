import { SnowflakeHelper } from '@data-engineering/helpers/snowflakeHelper';
import { DuckDBFiltersSql } from '@data-engineering/sqlQueries/duckdb-filters';

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

/**
 * DuckDB Filters Query Helper
 * Handles all database queries for DuckDB-powered filter APIs
 * (Segments, Departments, etc.)
 */
export class DuckDBFiltersQueryHelper {
  constructor(
    private readonly snowflakeHelper: SnowflakeHelper,
    private readonly tenantCode: string
  ) {}

  async getActiveSegmentsFromDB(): Promise<SegmentResult[]> {
    return await this.snowflakeHelper.executeWithParams<SegmentResult>(DuckDBFiltersSql.Active_Segments, [
      this.tenantCode,
    ]);
  }

  async getActiveDepartmentsFromDB(): Promise<DepartmentResult[]> {
    return await this.snowflakeHelper.executeWithParams<DepartmentResult>(DuckDBFiltersSql.Active_Departments, [
      this.tenantCode,
    ]);
  }

  async getActiveLocationsFromDB(): Promise<LocationResult[]> {
    return await this.snowflakeHelper.executeWithParams<LocationResult>(DuckDBFiltersSql.Active_Locations, [
      this.tenantCode,
    ]);
  }

  async getActiveUserCategoriesFromDB(): Promise<UserCategoryResult[]> {
    return await this.snowflakeHelper.executeWithParams<UserCategoryResult>(DuckDBFiltersSql.Active_User_Categories, [
      this.tenantCode,
    ]);
  }

  async getActiveCompanyNamesFromDB(): Promise<CompanyNameResult[]> {
    return await this.snowflakeHelper.executeWithParams<CompanyNameResult>(DuckDBFiltersSql.Active_Company_Names, [
      this.tenantCode,
    ]);
  }

  async getActiveDivisionsFromDB(): Promise<DivisionResult[]> {
    return await this.snowflakeHelper.executeWithParams<DivisionResult>(DuckDBFiltersSql.Active_Divisions, [
      this.tenantCode,
    ]);
  }
}
