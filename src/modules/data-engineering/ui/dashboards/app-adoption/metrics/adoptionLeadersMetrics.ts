import { FrameLocator, Page } from '@playwright/test';

import { TabluarMetricsComponent } from '../../../components/tabluarMetricsComponent';

import { GroupByOnUserParameter } from '@/src/modules/data-engineering/constants/filters';

/**
 * Column names for Adoption Leaders table data
 */
export enum AdoptionLeadersDataColumns {
  LOGGED_IN_USERS = 'No. of logged in users',
  TOTAL_USERS = 'Total users',
  ADOPTION_RATE = 'Adoption rate',
}

export class AdoptionLeadersMetrics extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Adoption leaders');
  }

  /**
   * Verifies that the adoption leaders data matches the snowflake data
   * @param snowflakeDataArray - Array of adoption leaders data from Snowflake
   * @param groupByColumn - The column name for grouping (Department, Location, or User Category)
   */
  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      viewCategory: string;
      loggedInUsers: number;
      totalUsers: number;
      adoptionRate: string;
    }>,
    groupByColumn: GroupByOnUserParameter = GroupByOnUserParameter.DEPARTMENT
  ): Promise<void> {
    // Define data mapper function for better readability
    const dataMapper = (item: {
      viewCategory: string;
      loggedInUsers: number;
      totalUsers: number;
      adoptionRate: string;
    }) => ({
      [groupByColumn]: item.viewCategory,
      [AdoptionLeadersDataColumns.LOGGED_IN_USERS]: item.loggedInUsers.toString(),
      [AdoptionLeadersDataColumns.TOTAL_USERS]: item.totalUsers.toString(),
      [AdoptionLeadersDataColumns.ADOPTION_RATE]: item.adoptionRate,
    });

    // Use the generic validation method from base component
    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, groupByColumn);
  }

  /**
   * Sorts the Adoption Leaders table by a specific column
   * @param columnName - The column name to sort by
   * @param direction - Sort direction ('asc' or 'desc')
   */
  async sortByColumn(columnName: string, direction: 'Ascending' | 'Descending' = 'Ascending'): Promise<void> {
    await this.sortTableByColumn(columnName, direction);
  }

  /**
   * Drills down on a specific cell in the Adoption Leaders table
   * @param viewCategory - The view category to drill down on (e.g., 'HR')
   * @param targetColumn - The column to drill down on (e.g., 'Adoption rate')
   * @param viewCategoryColumnName - The column name for the view category (e.g., 'Department', 'Location', 'User Category')
   */
  async drillDownOnViewCategory(
    viewCategory: string,
    targetColumn: string,
    viewCategoryColumnName: string = GroupByOnUserParameter.DEPARTMENT
  ): Promise<void> {
    await this.drillDownOnCell({ column: viewCategoryColumnName, value: viewCategory }, targetColumn);
  }
}
