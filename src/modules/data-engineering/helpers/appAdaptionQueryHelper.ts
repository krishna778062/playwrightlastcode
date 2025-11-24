import { format, parseISO } from 'date-fns';

import { GroupByOnUserParameter } from '../constants/filters';
import { PeriodFilterTimeRange } from '../constants/periodFilterTimeRange';
import { AdoptionSql } from '../sqlQueries/adoption';

import { DateHelper } from './dateHelper';
import { BaseAnalyticsQueryHelper, FilterOptions, SnowflakeHelper } from '.';

export interface AppWebPageViewsData {
  webPageGroup: string;
  totalPeople: number;
  pageViewCount: number;
  percentageContributionToTotalPageViews: number;
}

// Generic interface for adoption leaders data
interface AdoptionLeadersData {
  viewCategory: string;
  loggedInUsers: number;
  totalUsers: number;
  adoptionRate: string;
}

export interface UserEngagementBreakdownData {
  behaviour: string;
  count: number;
  percentage: number;
}

export interface AdoptionRateUserLoginData {
  reportingDate: string; // MM/DD/YYYY format (e.g., '10/02/2025')
  userLogins: number;
  adoptionRate: string; // Percentage with 2 decimal places (e.g., '5.71%')
}

export interface UserLoginFrequencyDistributionData {
  'No logins': number;
  '1-3 times': number;
  '4-7 times': number;
  '8-10 times': number;
  '10+ times': number;
}

export class AppAdoptionDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total users data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total users data
   */
  async getTotalUsersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: AdoptionSql.TOTAL_USERS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets logged in users data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<{
   *   absoluteValueOfLoggedInUsers: number;
   *   percentageOfLoggedInUsersFromTotalUsers: number;
   *   expectedTrendText: string;
   * }> - Logged in users data with benchmarking
   */
  async getLoggedInUsersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<{
    absoluteValueOfLoggedInUsers: number;
    percentageOfLoggedInUsersFromTotalUsers: number;
    expectedTrendText: string;
  }> {
    /**
     * 1. get the absolute value of logged in users
     * 2. get the absolute value of total users
     * 3. get the percentage of logged in users based on total users
     * 4. get the benchmarking data and get the USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE
     * 5. compare the percentage of logged in users with the benchmarking data
     * 6. return the result with trend text
     */
    let absoluteValueOfLoggedInUsers: number | undefined = undefined;
    let percentageOfLoggedInUsersFromTotalUsers: number | undefined = undefined;
    let expectedTrendText: string | undefined = undefined;

    // Step 1: Get absolute value of logged-in users
    const finalQueryToFetchLoggedInUsers = await this.transformQueryWithFilters({
      baseQuery: AdoptionSql.LOGGED_IN_USERS,
      filterBy,
    });
    absoluteValueOfLoggedInUsers = await this.getHeroMetricDataFromDB(finalQueryToFetchLoggedInUsers);
    console.log(
      `Absolute value of logged in users fetched from DB with given filters is `,
      absoluteValueOfLoggedInUsers
    );

    // Step 2: Get total users count
    const totalUsers = await this.getTotalUsersDataFromDBWithFilters({ filterBy });
    console.log(`Total users fetched from DB with given filters is `, totalUsers);

    // Early validation - if no total users, return early
    if (totalUsers === 0) {
      console.log(`----> No total users found, returning early without benchmark data`);
      return {
        absoluteValueOfLoggedInUsers: 0,
        percentageOfLoggedInUsersFromTotalUsers: 0,
        expectedTrendText: 'No data available',
      };
    }

    // Step 3: Calculate percentage of logged-in users from total users and round it to 1 decimal place
    percentageOfLoggedInUsersFromTotalUsers = Math.round((absoluteValueOfLoggedInUsers / totalUsers) * 100 * 10) / 10;
    console.log(`Percentage of logged in users from total users is `, percentageOfLoggedInUsersFromTotalUsers);

    // Step 4 & 5: Get benchmarking data if period is 30 days
    if (this.shouldFetchBenchmarkData(filterBy)) {
      console.log(`----> We need to fetch the benchmarking data as the difference in days is exactly 30 days`);
      const benchMarkData = await this.getBenchMarkDataForAdoptionDashboard();
      console.log(`----> The bench mark retrieved results for adoption table is  `, benchMarkData);
      const percentageOfLoggedInUsersFromBenchmark = benchMarkData.USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE;
      console.log(
        `----> The percentage of logged in users from benchmark is  `,
        percentageOfLoggedInUsersFromBenchmark
      );

      // Step 6: Calculate trend text
      expectedTrendText = this.getTrendText(
        percentageOfLoggedInUsersFromTotalUsers,
        percentageOfLoggedInUsersFromBenchmark
      );
      console.log(`----> The expected trend text is  `, expectedTrendText);
    } else {
      console.log(`----> We do not need to fetch the benchmarking data as the difference in days is not exactly 30`);
    }

    console.log(`----> The data to return for logged in users is  `, {
      absoluteValueOfLoggedInUsers,
      percentageOfLoggedInUsersFromTotalUsers,
      expectedTrendText: expectedTrendText || '',
    });

    return {
      absoluteValueOfLoggedInUsers,
      percentageOfLoggedInUsersFromTotalUsers,
      expectedTrendText: expectedTrendText || '',
    };
  }

  /**
   * Gets contributors and participants data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<any[]> - Contributors and participants data
   */
  async getContributorsAndParticipantsDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<{
    absoluteValueOfContributorsAndParticipants: number;
    percentageOfContributorsAndParticipantsFromLoggedInUsers: number;
    expectedTrendText: string;
  }> {
    /**
     * 1. get the absolute value of loggged in users
     * 2. get the absolute value of contributors and participants who has logged in true
     * 3. get the benchmarking data and get the CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE
     * 4. compare the absolute value of contributors and participants with the benchmarking data
     * 5. return the result as {
     *
     *   absoluteValueOfContributorsAndParticipants: number,
     *   percentageOfContributorsAndParticipantsFromLoggedInUsers: number,
     *   percentageOfContributorsAndParticipantsFromBenchmark: number,
     *   differenceInPercentage: number,
     *   trend: 'positive' | 'negative' | 'neutral',
     *
     * }
     * Note:
     * 1. if the difference in percentage is positive, then the trend is positive
     * 2. if the difference in percentage is negative, then the trend is negative
     * 3. if the difference in percentage is 0, then the trend is neutral
     */
    let absoluteValueOfContributorsAndParticipants: number | undefined = undefined;
    let percentageOfContributorsAndParticipantsFromLoggedInUsers: number | undefined = undefined;
    let expectedTrendText: string | undefined = undefined;

    const finalQueryToFetchAbsoluteValueOfContributorsAndParticipants = await this.transformQueryWithFilters({
      baseQuery: AdoptionSql.CONTRIBUTORS_AND_PARTICIPANTS,
      filterBy,
    });
    absoluteValueOfContributorsAndParticipants = await this.getHeroMetricDataFromDB(
      finalQueryToFetchAbsoluteValueOfContributorsAndParticipants
    );
    console.log(
      `Absolute value of contributors and particiapnts fetched from DB with given filters is `,
      absoluteValueOfContributorsAndParticipants
    );

    //total logged in users
    const loggedInUsersData = await this.getLoggedInUsersDataFromDBWithFilters({ filterBy });
    console.log(`Total logged in users fetched from DB with given filters is `, loggedInUsersData);

    // Early validation - if no logged-in users, return early
    if (loggedInUsersData.absoluteValueOfLoggedInUsers === 0) {
      console.log(`----> No logged-in users found, returning early without benchmark data`);
      return {
        absoluteValueOfContributorsAndParticipants: 0,
        percentageOfContributorsAndParticipantsFromLoggedInUsers: 0,
        expectedTrendText: 'No data available',
      };
    }

    //percentage of contributors and participants from logged in users
    percentageOfContributorsAndParticipantsFromLoggedInUsers =
      Math.round(
        (absoluteValueOfContributorsAndParticipants / loggedInUsersData.absoluteValueOfLoggedInUsers) * 100 * 10
      ) / 10;
    console.log(
      `Percentage of contributors and participants from logged in users is `,
      percentageOfContributorsAndParticipantsFromLoggedInUsers
    );

    //here we need to evaluate if we need to fetch the benchmarking data or not
    /**
     * Condition 1: if the period filter is last 30 days
     * Condition 2: if the difference in days between the end date and start date is exactly 30 days
     */
    if (this.shouldFetchBenchmarkData(filterBy)) {
      console.log(`----> We need to fetch the benchmarking data as the difference in days is exactly 30 days`);
      const benchMarkData = await this.getBenchMarkDataForAdoptionDashboard();
      console.log(`----> The bench mark retrieved results for adoption table is  `, benchMarkData);
      const percentageOfContributorsAndParticipantsFromBenchmark =
        benchMarkData.CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE;
      console.log(
        `----> The percentage of contributors and participants from benchmark is  `,
        percentageOfContributorsAndParticipantsFromBenchmark
      );
      //now get the trend
      expectedTrendText = this.getTrendText(
        percentageOfContributorsAndParticipantsFromLoggedInUsers,
        percentageOfContributorsAndParticipantsFromBenchmark
      );
      console.log(`----> The expected trend text is  `, expectedTrendText);
    } else {
      console.log(`----> We do not need to fetch the benchmarking data as the difference in days is not exactly 30`);
    }

    console.log(`----> The data to return is  `, {
      absoluteValueOfContributorsAndParticipants,
      percentageOfContributorsAndParticipantsFromLoggedInUsers,
      expectedTrendText: expectedTrendText || '',
    });

    return {
      absoluteValueOfContributorsAndParticipants,
      percentageOfContributorsAndParticipantsFromLoggedInUsers,
      expectedTrendText: expectedTrendText || '',
    };
  }

  /**
   * Gets the benchmark data for the adoption dashboard
   * @example getBenchMarkDataForAdoptionDashboard() -> returns the benchmark data for the adoption dashboard
   * @example output
   * {
   *   "USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE": 50,
   *   "CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE": 60
   * }
   * @returns Promise<{ USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE: number; CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE: number; }> - Benchmark data
   */
  async getBenchMarkDataForAdoptionDashboard(): Promise<{
    USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE: number;
    CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE: number;
  }> {
    //retrive the benchmark reporting month
    /**
     *
     * Benchmark reporitng month logic is
     * after 3rd of every month, the data gets stored in monthly tenant adoption snapshot table.
     * so if current date is less than 3rd of the month, then we should use the n-2 month as the benchmark reporting month.
     * otherwise we should use the n-1 month as the benchmark reporting month.
     *
     * so we need to get the current date and check if it is less than 3rd of the month.
     * if it is, then we should use the n-2 month as the benchmark reporting month.
     * otherwise we should use the n-1 month as the benchmark reporting month.
     *
     * One more clause is that for this to be visible or calculated, the period filter
     * should be last 30 days other wise it wont be visible
     * or end date -start date == 30 days
     *
     */
    const benchmarkReportingMonth = this.getBenchmarkReportingMonth();
    const benchMarkRetrievalQuery = AdoptionSql.BENCHMARK_DATA.replace('{tenantCode}', this.orgId).replace(
      '{reportingMonth}',
      benchmarkReportingMonth
    );

    //execute the query
    const benchMarkRetrievalResults = await this.executeQuery(benchMarkRetrievalQuery);

    console.log(`----> The bench mark retrieved results for adoption table is  `, benchMarkRetrievalResults);
    //round of the percentage values to 1 decimal place (e.g., 2.37772 -> 2.4)
    const usersWhoLoggedInAtLeastOncePercentage =
      Math.round(Number(benchMarkRetrievalResults[0].USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE) * 10) / 10;
    const contributorsAndParticipantsPercentage =
      Math.round(Number(benchMarkRetrievalResults[0].CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE) * 10) / 10;
    return {
      USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE: usersWhoLoggedInAtLeastOncePercentage,
      CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE: contributorsAndParticipantsPercentage,
    };
  }

  /**
   * Determines if benchmark data should be fetched based on filter criteria
   * @param filterBy - Filter options including time period
   * @returns boolean - True if benchmark data should be fetched
   */
  private shouldFetchBenchmarkData(filterBy: FilterOptions): boolean {
    // Handle static period
    if (filterBy.timePeriod === PeriodFilterTimeRange.LAST_30_DAYS) {
      return true;
    }

    // Handle custom period - calculate date difference internally
    if (filterBy.timePeriod === PeriodFilterTimeRange.CUSTOM) {
      const dateReplacements = DateHelper.getDateReplacements(
        filterBy.timePeriod,
        filterBy.customStartDate,
        filterBy.customEndDate
      );
      return DateHelper.differenceInDays(dateReplacements.startDate, dateReplacements.endDate) === 30;
    }

    return false;
  }

  /**
   * Gets the benchmark reporting month
   * @returns Promise<string> - Benchmark reporting month
   * @example getBenchmarkReportingMonth() -> returns the benchmark reporting month for the current date
   */
  private getBenchmarkReportingMonth() {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return currentDay < 3 ? `${currentYear}-${currentMonth - 1}-01` : `${currentYear}-${currentMonth}-01`;
  }

  /**
   * Transforms the app web page views query using replacement approach
   * Much simpler than trying to append filters after subqueries
   */
  private async transformAppWebPageViewsQuery({
    baseQuery,
    filterBy,
  }: {
    baseQuery: string;
    filterBy: FilterOptions;
  }): Promise<string> {
    // Handle date replacements internally
    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    // Replace all placeholders in the base query
    let query = baseQuery
      .replace('{tenantCode}', filterBy.tenantCode)
      .replace('{startDate}', dateReplacements.startDate)
      .replace('{endDate}', dateReplacements.endDate)
      .replace('{locationFilter}', this.addLocationFilter(filterBy.locations))
      .replace('{departmentFilter}', this.addDepartmentFilter(filterBy.departments))
      .replace('{segmentFilter}', this.addSegmentFilter(filterBy.segments))
      .replace('{companyNameFilter}', this.addCompanyNameFilter(filterBy.companyName));

    // Handle user category mapping and replacement
    if (filterBy.userCategories && filterBy.userCategories.length > 0) {
      const userCategoryCodes = await this.mapUserCategoryNamesToCodes(filterBy.userCategories);
      query = query.replace('{userCategoryFilter}', this.addUserCategoryFilter(userCategoryCodes));
    } else {
      query = query.replace('{userCategoryFilter}', this.addUserCategoryFilter(filterBy.userCategories));
    }

    return query;
  }

  /**
   * Transforms raw database results to typed AppWebPageViewsData objects
   * @param rawResults - Raw results from database query
   * @returns AppWebPageViewsData[] - Properly typed and transformed data
   */
  private transformAppWebPageViewsResults(rawResults: any[]): AppWebPageViewsData[] {
    return rawResults.map(result => ({
      webPageGroup: result['Web page group'],
      totalPeople: Number(result['Total people']),
      pageViewCount: Number(result['Page view count']),
      percentageContributionToTotalPageViews: Number(result['Percentage contribution to total page views']),
    }));
  }

  /**
   * Gets app web page views data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<AppWebPageViewsData[]> - App web page views data with proper typing
   */
  async getAppWebPageViewsDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<AppWebPageViewsData[]> {
    const finalQuery = await this.transformAppWebPageViewsQuery({
      baseQuery: AdoptionSql.APP_WEB_PAGE_VIEWS,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformAppWebPageViewsResults(rawResults);
  }

  /**
   * Gets adoption leaders data grouped by the specified criteria
   * @param filterBy - Filter options including time period and user filters
   * @param groupBy - The grouping criteria ('department', 'location', or 'user_category')
   * @param orderDirection - Order direction (asc or desc)
   * @returns Promise<AdoptionLeadersData[]> - Adoption leaders data grouped by specified criteria
   */
  async getAdoptionLeadersData({
    filterBy,
    groupBy = GroupByOnUserParameter.DEPARTMENT,
    orderDirection = 'desc',
  }: {
    filterBy: FilterOptions;
    groupBy?: GroupByOnUserParameter;
    orderDirection?: 'asc' | 'desc';
  }): Promise<AdoptionLeadersData[]> {
    switch (groupBy) {
      case GroupByOnUserParameter.DEPARTMENT:
        return this.getAdoptionLeadersByDepartment({ filterBy, orderDirection });
      case GroupByOnUserParameter.LOCATION:
        return this.getAdoptionLeadersByLocation({ filterBy, orderDirection });
      case GroupByOnUserParameter.USER_CATEGORY:
        return this.getAdoptionLeadersByUserCategory({ filterBy, orderDirection });
      default:
        throw new Error(
          `Unsupported groupBy: ${groupBy}. Supported values: ${Object.values(GroupByOnUserParameter).join(', ')}`
        );
    }
  }

  /**
   * Gets adoption leaders data grouped by department
   * @param filterBy - Filter options including time period and user filters
   * @param orderDirection - Order direction (asc or desc)
   * @returns Promise<AdoptionLeadersData[]> - Adoption leaders data grouped by department
   */
  async getAdoptionLeadersByDepartment({
    filterBy,
    orderDirection = 'desc',
  }: {
    filterBy: FilterOptions;
    orderDirection?: 'asc' | 'desc';
  }): Promise<AdoptionLeadersData[]> {
    const baseQuery = AdoptionSql.ADOPTION_LEADERS_BY_DEPARTMENT.replace('{orderDirection}', orderDirection);

    const finalQuery = await this.transformQueryWithFilters({
      baseQuery,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    console.log(`----> The adoption leaders data grouped by department is  `, rawResults);
    return this.transformAdoptionLeadersResults(rawResults);
  }

  /**
   * Gets adoption leaders data grouped by location
   * @param filterBy - Filter options including time period and user filters
   * @param orderDirection - Order direction (asc or desc)
   * @returns Promise<AdoptionLeadersData[]> - Adoption leaders data grouped by location
   */
  async getAdoptionLeadersByLocation({
    filterBy,
    orderDirection = 'desc',
  }: {
    filterBy: FilterOptions;
    orderDirection?: 'asc' | 'desc';
  }): Promise<AdoptionLeadersData[]> {
    const baseQuery = AdoptionSql.ADOPTION_LEADERS_BY_LOCATION.replace('{orderDirection}', orderDirection);

    const finalQuery = await this.transformQueryWithFilters({
      baseQuery,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformAdoptionLeadersResults(rawResults);
  }

  /**
   * Gets adoption leaders data grouped by user category
   * @param filterBy - Filter options including time period and user filters
   * @param orderDirection - Order direction (asc or desc)
   * @returns Promise<AdoptionLeadersData[]> - Adoption leaders data grouped by user category
   */
  async getAdoptionLeadersByUserCategory({
    filterBy,
    orderDirection = 'desc',
  }: {
    filterBy: FilterOptions;
    orderDirection?: 'asc' | 'desc';
  }): Promise<AdoptionLeadersData[]> {
    const baseQuery = AdoptionSql.ADOPTION_LEADERS_BY_USER_CATEGORY.replace('{orderDirection}', orderDirection);

    const finalQuery = await this.transformQueryWithFilters({
      baseQuery,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformAdoptionLeadersResults(rawResults);
  }

  /**
   * Transforms raw database results to generic AdoptionLeadersData objects
   * @param rawResults - Raw results from database query
   * @returns AdoptionLeadersData[] - Properly typed and transformed data
   */
  private transformAdoptionLeadersResults(rawResults: any[]): AdoptionLeadersData[] {
    // Handle empty/null results - just return empty array
    if (rawResults.length === 0) {
      console.log(`----> No adoption leaders data found, returning empty array`);
      return [];
    }
    return rawResults.map(result => ({
      viewCategory: result.VIEW_CATEGORY,
      loggedInUsers: Number(result.LOGGED_IN_USERS),
      totalUsers: Number(result.TOTAL_USERS),
      adoptionRate: result.ADOPTION_RATE,
    }));
  }

  /**
   * Transforms raw database results to typed UserEngagementBreakdownData objects
   * @param rawResults - Raw results from database query
   * @returns UserEngagementBreakdownData[] - Properly typed and transformed data with percentages
   */
  private transformUserEngagementBreakdownResults(rawResults: any[]): UserEngagementBreakdownData[] {
    if (rawResults.length === 0) {
      return [];
    }

    // Filter out "No logins" for percentage calculation (as it's not displayed in UI)
    const visibleSegments = rawResults.filter(result => result.BEHAVIOUR !== 'No logins');

    // Calculate total count only from visible segments (excluding "No logins")
    const totalCount = visibleSegments.reduce((sum, result) => sum + Number(result.COUNT), 0);

    // Transform and calculate percentages based on visible segments only
    return rawResults.map(result => {
      const count = Number(result.COUNT);
      // Use visible segments total for percentage calculation, rounded to 2 decimal places to match UI
      const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100 * 100) / 100 : 0;
      return {
        behaviour: result.BEHAVIOUR,
        count,
        percentage,
      };
    });
  }

  /**
   * Gets user engagement breakdown data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<UserEngagementBreakdownData[]> - User engagement breakdown data
   */
  async getUserEngagementBreakdownDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<UserEngagementBreakdownData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: AdoptionSql.USER_ENGAGEMENT_BREAKDOWN,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformUserEngagementBreakdownResults(rawResults);
  }

  /**
   * Transforms raw database results for adoption rate user login data
   * Converts data to UI-friendly format matching tooltip display:
   * - Reporting date: MM/DD/YYYY format
   * - User logins: numeric value
   * - Adoption rate: percentage rounded to 2 decimal places with % symbol
   * @param rawResults - Raw results from database query
   * @returns Transformed data in UI format
   */
  private transformAdoptionRateUserLoginResults(rawResults: any[]): AdoptionRateUserLoginData[] {
    return rawResults.map(result => {
      // Convert LOGIN_DATE from YYYY-MM-DD to MM/DD/YYYY format
      const loginDate = parseISO(result.LOGIN_DATE);
      const reportingDate = format(loginDate, 'MM/dd/yyyy');

      // Extract numeric value from PERCENT string (e.g., '5.714300%' -> 5.7143)
      const percentString = result.PERCENT || '0%';
      const percentValue = parseFloat(percentString.replace('%', ''));

      // Round to 2 decimal places and format as percentage string
      const adoptionRate = `${Math.round(percentValue * 100) / 100}%`;

      return {
        reportingDate,
        userLogins: Number(result.USERS_WHO_LOGGED_IN_AT_LEAST_ONCE),
        adoptionRate,
      };
    });
  }

  /**
   * Transforms raw database results to typed UserLoginFrequencyDistributionData objects
   * @param rawResults - Raw results from database query
   * @returns UserLoginFrequencyDistributionData[] - Properly typed and transformed data
   */
  private transformUserLoginFrequencyDistributionResults(rawResults: any[]): UserLoginFrequencyDistributionData {
    try {
      const firstRow = rawResults[0];

      // Map database keys to expected keys
      // SQL query returns: '10+ times', '8-10 times', '4-7 times', '1-3 times', 'No logins'
      // Fallback to old keys ('10+ visits', '8-10', '4-7', '1-3') for backward compatibility
      return {
        'No logins': Number(firstRow['No logins'] ?? 0),
        '1-3 times': Number(firstRow['1-3 times'] ?? firstRow['1-3'] ?? 0),
        '4-7 times': Number(firstRow['4-7 times'] ?? firstRow['4-7'] ?? 0),
        '8-10 times': Number(firstRow['8-10 times'] ?? firstRow['8-10'] ?? 0),
        '10+ times': Number(firstRow['10+ times'] ?? firstRow['10+ visits'] ?? 0),
      };
    } catch (error) {
      console.error(`----> Error transforming user login frequency distribution data: ${error}`);
      throw error;
    }
  }

  /**
   * Gets adoption rate user login data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<AdoptionRateUserLoginData[]> - Adoption rate user login data in UI format
   */
  async getAdoptionRateUserLoginDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<AdoptionRateUserLoginData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: AdoptionSql.ADOPTION_RATE_USER_LOGIN,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    const transformedResults = this.transformAdoptionRateUserLoginResults(rawResults);
    console.log(`----> The adoption rate user login data is  `, transformedResults);
    return transformedResults;
  }

  /**
   * Gets user login frequency distribution data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<UserLoginFrequencyDistributionData[]> - User login frequency distribution data
   */
  async getUserLoginFrequencyDistributionDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<UserLoginFrequencyDistributionData> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: AdoptionSql.USER_LOGIN_FREQUENCY_DISTRIBUTION,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    console.log(`----> The user login frequency distribution data is  `, rawResults);
    const transformedResults = this.transformUserLoginFrequencyDistributionResults(rawResults);
    console.log(`----> The user login frequency distribution data is  `, transformedResults);
    return transformedResults;
  }
}
