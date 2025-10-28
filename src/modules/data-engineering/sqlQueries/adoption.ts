export const AdoptionSql = {
  /**
   * Total Users Query Template
   * Returns count of distinct users with filters applied
   */
  TOTAL_USERS: `
    select count(distinct user_code) 
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Logged In Users Query Template
   * Returns count of distinct users who have logged in with filters applied
   */
  LOGGED_IN_USERS: `
    select count(distinct user_code) as logged_in_users
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      and dua.has_logged_in = 'TRUE'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Contributors and Participants Query Template
   * Returns count of distinct users who are contributors or participants with filters applied
   */
  CONTRIBUTORS_AND_PARTICIPANTS: `
    select count(distinct user_code) as contributorOrParticipantUsersCount
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      and (dua.is_contributor = 'TRUE' or dua.is_participant = 'TRUE')
      and dua.has_logged_in = 'TRUE'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * App Web Page Views Query Template
   * Returns page group data with view counts and percentages
   */
  APP_WEB_PAGE_VIEWS: `
    select PAGES as "Web page group", 
           TOTAL_PEOPLE as "Total people", 
           TOTAL_VIEWS as "Page view count", 
           PERCENT as "Percentage contribution to total page views"
    from ( 
        select case when rp.description='N/A' then 'Undefined' else rp.description end as 
        PAGES,count(distinct case when u.status_code='US001' then 
        ia.INTERACTED_BY_USER_CODE end) as TOTAL_PEOPLE,count(ia.code) as 
        TOTAL_VIEWS, 
        ROUND((TOTAL_VIEWS/SUM(TOTAL_VIEWS) over())*100) as WHOLE_VALUE, 
        ROUND((TOTAL_VIEWS/SUM(TOTAL_VIEWS) over())*100,2) as PERCENT 
        from SIMPPLR_COMMON_TENANT.UDL.REF_PAGE_GROUP rp join 
        SIMPPLR_COMMON_TENANT.UDL.VW_INTERACTION ia on rp.code = ia.page_group_code 
        inner join SIMPPLR_COMMON_TENANT.UDL.vw_user_as_is u on 
        ia.interacted_by_user_code=u.code 
        where ia.INTERACTION_DATETIME>='{startDate}' and 
        ia.INTERACTION_DATETIME<='{endDate}'  
        and ia.page_group_code!='PG102'  
        and ia.INTERACTION_TYPE_CODE = 'IT001'  
        and ia.tenant_code = '{tenantCode}'
        {locationFilter}
        {departmentFilter}
        {segmentFilter}
        {userCategoryFilter}
        {companyNameFilter}
        group by rp.description order by total_views desc
    ) 
  `,

  /**
   * Debug query for App Web Page Views - 'App launch' record investigation
   * Removes date filters to investigate why 'App launch' record is missing
   */
  APP_WEB_PAGE_VIEWS_DEBUG_APP_LAUNCH: `
    select 
      rp.code as page_group_code,
      rp.description as page_description,
      count(ia.code) as total_interactions,
      count(distinct ia.interacted_by_user_code) as unique_users,
      count(distinct case when u.status_code='US001' then ia.interacted_by_user_code end) as active_users,
      min(ia.INTERACTION_DATETIME) as earliest_interaction,
      max(ia.INTERACTION_DATETIME) as latest_interaction,
      ia.INTERACTION_TYPE_CODE,
      ia.tenant_code
    from SIMPPLR_COMMON_TENANT.UDL.REF_PAGE_GROUP rp 
    left join SIMPPLR_COMMON_TENANT.UDL.VW_INTERACTION ia on rp.code = ia.page_group_code 
    left join SIMPPLR_COMMON_TENANT.UDL.vw_user_as_is u on ia.interacted_by_user_code=u.code 
    where rp.description = 'App launch'
      and ia.tenant_code = '{tenantCode}'
    group by rp.code, rp.description, ia.INTERACTION_TYPE_CODE, ia.tenant_code
    order by latest_interaction desc
  `,

  /**
   * Adoption Leaders by Department Query Template
   * Returns adoption data grouped by department
   */
  ADOPTION_LEADERS_BY_DEPARTMENT: `
    select 
      u.department as view_category,
      count(distinct case when ul.has_logged_in then ul.user_code end) as logged_in_users,
      count(distinct u.code) as total_users,
      concat(round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1), '%') as adoption_rate
    from SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u 
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_DAILY_USER_ADOPTION ul on u.code = ul.user_code 
    where u.tenant_code = '{tenantCode}' 
      and ul.reporting_date >= '{startDate}' 
      and ul.reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
    group by u.department
    order by round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1) {orderDirection}
  `,

  /**
   * Adoption Leaders by Location Query Template
   * Returns adoption data grouped by location
   */
  ADOPTION_LEADERS_BY_LOCATION: `
    select 
      u.location as view_category,
      count(distinct case when ul.has_logged_in then ul.user_code end) as logged_in_users,
      count(distinct u.code) as total_users,
      concat(round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1), '%') as adoption_rate
    from SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u 
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_DAILY_USER_ADOPTION ul on u.code = ul.user_code 
    where u.tenant_code = '{tenantCode}' 
      and ul.reporting_date >= '{startDate}' 
      and ul.reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
    group by u.location
    order by round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1) {orderDirection}
  `,

  /**
   * Adoption Leaders by User Category Query Template
   * Returns adoption data grouped by user category
   */
  ADOPTION_LEADERS_BY_USER_CATEGORY: `
    select 
      coalesce(u.user_category_name, 'Uncategorized') as view_category,
      count(distinct case when ul.has_logged_in then ul.user_code end) as logged_in_users,
      count(distinct u.code) as total_users,
      concat(round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1), '%') as adoption_rate
    from SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u 
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_DAILY_USER_ADOPTION ul on u.code = ul.user_code 
    where u.tenant_code = '{tenantCode}' 
      and ul.reporting_date >= '{startDate}' 
      and ul.reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
    group by coalesce(u.user_category_name, 'Uncategorized')
    order by round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1) {orderDirection}
  `,

  /**
   * Benchmark Data Query Template
   * Returns benchmark data for adoption dashboard
   */
  BENCHMARK_DATA: `
    select SUM(UNIQUE_LOGINS_OVERALL) / SUM(TOTAL_ACTIVE_USERS) * 100 as 
           USERS_WHO_LOGGED_IN_AT_LEAST_ONCE_PERCENTAGE, 
           ((SUM(PARTICIPANTS_OVERALL) / SUM(UNIQUE_LOGINS_OVERALL)) + 
           (SUM(CONTRIBUTORS_OVERALL) / SUM(UNIQUE_LOGINS_OVERALL))) * 100 as 
           CONTRIBUTORS_AND_PARTICIPANTS_PERCENTAGE 
           from SIMPPLR_COMMON_TENANT.UDL.MONTHLY_TENANT_ADOPTION_SNAPSHOT mtas 
           inner join SIMPPLR_COMMON_TENANT.UDL.TENANT_DETAILS td on 
           mtas.customer_segment_code=td.customer_segment_code and 
           mtas.INSTANCE_TYPE_CODE=td.INSTANCE_TYPE_CODE 
           where td.TENANT_CODE = '{tenantCode}' AND 
           REPORTING_MONTH = '{reportingMonth}'
  `,
};
