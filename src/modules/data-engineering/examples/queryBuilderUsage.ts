/**
 * Example usage of the new Query Builder approach
 * This demonstrates how easy it is to use the enhanced AppAdoptionDashboardQueryHelper
 */

import { AppAdoptionDashboardQueryHelper } from '../helpers/appAdaptionQueryHelper';
import { SnowflakeHelper } from '../helpers/snowflakeHelper';

// Example: How to use the new query builder approach
export async function exampleUsage() {
  // Initialize query helper
  const snowflakeHelper = new SnowflakeHelper();
  const orgId = 'ea411953-6702-4a01-8b03-b98a172be511';
  const queryHelper = new AppAdoptionDashboardQueryHelper(snowflakeHelper, orgId);

  // Example 1: Build query only (static method)
  const filters = {
    tenantCode: orgId,
    timePeriod: 'Last 30 days', // Static period
    locations: ['NYC', 'SF'],
    departments: ['IT', 'Engineering'],
  };

  const query = AppAdoptionDashboardQueryHelper.buildTotalUsersQuery(filters);
  console.log('Generated Query:', query);

  // Example 2: Execute query directly (instance method)
  const totalUsers = await queryHelper.getTotalUsersDataFromDBWithFilters(filters);
  console.log('Total Users:', totalUsers);

  // Example 3: Different metrics with same filters
  const loggedInUsers = await queryHelper.getLoggedInUsersDataFromDBWithFilters(filters);
  const contributors = await queryHelper.getContributorsAndParticipantsDataFromDBWithFilters(filters);

  console.log('Logged In Users:', loggedInUsers);
  console.log('Contributors:', contributors);

  // Example 4: No filters (empty arrays)
  const noFilters = {
    tenantCode: orgId,
    timePeriod: 'Last 12 months',
    // locations, departments, etc. are undefined - no filter clauses will be added
  };

  const totalUsersNoFilters = await queryHelper.getTotalUsersDataFromDBWithFilters(noFilters);
  console.log('Total Users (No Filters):', totalUsersNoFilters);

  // Example 5: Custom period with specific dates
  const customFilters = {
    tenantCode: orgId,
    timePeriod: 'Custom',
    customStartDate: '2025-08-13',
    customEndDate: '2025-09-11',
    locations: ['NYC'],
  };

  const customTotalUsers = await queryHelper.getTotalUsersDataFromDBWithFilters(customFilters);
  console.log('Total Users (Custom Period):', customTotalUsers);
}

/**
 * Example: How the query building works internally
 */
export function demonstrateQueryBuilding() {
  const filters = {
    tenantCode: 'ea411953-6702-4a01-8b03-b98a172be511',
    timePeriod: 'Last 30 days',
    locations: ['NYC', 'SF'],
    departments: ['IT'],
  };

  // This will generate:
  const query = AppAdoptionDashboardQueryHelper.buildTotalUsersQuery(filters);

  console.log('Generated Query:');
  console.log(query);

  // Expected output:
  /*
  select count(distinct user_code) 
  from udl.vw_daily_user_adoption dua 
  inner join udl.vw_user_as_is u on dua.user_code = u.code 
  where u.tenant_code = 'ea411953-6702-4a01-8b03-b98a172be511' 
    and reporting_date >= '2025-08-13' 
    and reporting_date <= '2025-09-11' 
    and status_code = 'US001'
  and u.location in ('NYC', 'SF')
  and u.department in ('IT')
  */
}

/**
 * Example: How empty filters are handled
 */
export function demonstrateEmptyFilters() {
  const filters = {
    tenantCode: 'ea411953-6702-4a01-8b03-b98a172be511',
    timePeriod: 'Last 12 months',
    // No location or department filters
  };

  const query = AppAdoptionDashboardQueryHelper.buildTotalUsersQuery(filters);

  console.log('Query with Empty Filters:');
  console.log(query);

  // Expected output (no location or department clauses):
  /*
  select count(distinct user_code) 
  from udl.vw_daily_user_adoption dua 
  inner join udl.vw_user_as_is u on dua.user_code = u.code 
  where u.tenant_code = 'ea411953-6702-4a01-8b03-b98a172be511' 
    and reporting_date >= '2025-08-13' 
    and reporting_date <= '2025-09-11' 
    and status_code = 'US001'
  */
}
