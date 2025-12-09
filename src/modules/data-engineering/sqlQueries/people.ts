export const PeopleSql = {
  /**
   * Total Users Query Template
   * Returns count of active users with period filter applied
   */
  TOTAL_USERS: `
    select count(distinct user_code) as total_users
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and status_code = 'US001';
  `,

  /**
   * Departments Count Query Template
   * Returns count of distinct departments with active users in the period
   */
  DEPARTMENTS_COUNT: `
    select count(distinct u.department) as department_count
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      and u.department is not null
      and u.department <> '';
  `,

  /**
   * Locations Count Query Template
   * Returns count of distinct locations with active users in the period
   */
  LOCATIONS_COUNT: `
    select count(distinct u.location) as location_count
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      and u.location is not null
      and u.location <> '';
  `,

  /**
   * User Category Count Query Template
   * Returns count of distinct user categories (excluding N/A) with active users in the period
   */
  USER_CATEGORY_COUNT: `
    select count(distinct u.user_category_code) as user_category_count
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and u.status_code = 'US001'
      and u.active_flag
      and u.user_category_code <> 'N/A'
      and u.user_category_code is not null;
  `,

  /**
   * Content Published Query Template
   * Returns all users who published content in the period
   * Column aliases match UI table headers exactly
   */
  CONTENT_PUBLISHED: `
    select 
      max(u.full_name) as "Name",
      count(distinct c.code) as "Published content"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_content_as_is c 
      on c.primary_author_code = u.code
    where u.tenant_code = '{tenantCode}'
      and c.content_first_published_date between '{startDate}' and '{endDate}'
    group by u.code
    having count(distinct c.code) > 0
    order by count(distinct c.code) desc;
  `,

  /**
   * Favorites Received Query Template
   * Returns all users with favorited profiles/content/feed posts and content comments in the period
   * Column aliases match UI table headers exactly
   */
  FAVORITES_RECEIVED: `
    select 
      max(u.full_name) as "Name",
      count(distinct i.code) as "Favorites received"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i 
      on i.receiver_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code = 'IT006'
      and i.interaction_entity_code <> 'ET000'
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Reactions Made Query Template
   * Returns all users who reacted to content/feed posts and content comments/replies in the period
   * Column aliases match UI table headers exactly
   */
  REACTIONS_MADE: `
    select 
      max(u.full_name) as "Name",
      count(distinct i.code) as "Reactions made"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i 
      on i.interacted_by_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code = 'IT002'
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Reactions Received Query Template
   * Returns all users who received reactions on content/feed posts and content comments/replies in the period
   * Column aliases match UI table headers exactly
   */
  REACTIONS_RECEIVED: `
    select 
      max(u.full_name) as "Name",
      count(distinct i.code) as "Reactions received"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i 
      on i.receiver_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code = 'IT002'
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Feed Posts and Content Comments Query Template
   * Returns all users who made feed posts and content comments in the period
   * Column aliases match UI table headers exactly
   */
  FEED_POSTS_AND_COMMENTS: `
    select
      max(u.full_name) as "Name",
      count(distinct i.code) as "Post and comment"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i
      on i.interacted_by_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.is_system_feed = 'FALSE'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code in ('IT004', 'IT008')
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Replies Query Template
   * Returns all users who replied in feeds in the period
   * Column aliases match UI table headers exactly
   */
  REPLIES: `
    select
      max(u.full_name) as "Name",
      count(distinct i.code) as "Replies"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i
      on i.interacted_by_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code in ('IT007')
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Replies from Other Users Query Template
   * Returns all users with replies on their feed posts and content comments in the period
   * Column aliases match UI table headers exactly
   */
  REPLIES_FROM_OTHER_USERS: `
    select
      max(u.full_name) as "Name",
      count(distinct i.code) as "Replies received"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i
      on i.receiver_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code in ('IT007')
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Shares Received Query Template
   * Returns all users whose content/feed posts and content comments were shared in the period
   * Column aliases match UI table headers exactly
   */
  SHARES_RECEIVED: `
    select
      max(u.full_name) as "Name",
      count(distinct i.code) as "Shares received"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i
      on i.receiver_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code in ('IT003')
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Profile Views Query Template
   * Returns all users with viewed profiles in the period
   * Column aliases match UI table headers exactly
   * Includes Email for CSV validation to handle duplicate names
   */
  PROFILE_VIEWS: `
    select
      max(u.full_name) as "Name",
      max(u.email) as "Email",
      count(distinct i.code) as "Profile views"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i
      on i.receiver_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code in ('IT001')
      and i.interaction_entity_code = 'ET001'
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc;
  `,

  /**
   * Profile Completeness Query Template
   * Returns statistics about profile completeness fields
   * Column aliases match UI table headers exactly
   * Note: This query is time-independent (shows current state)
   */
  PROFILE_COMPLETENESS: `
    select 
      sum(case when has_about = true then 1 else 0 end) as "About text",
      sum(case when has_birth_date = true then 1 else 0 end) as "Birthday date",
      sum(case when has_profile_image = true then 1 else 0 end) as "Profile picture",
      sum(case when has_phone_number = true then 1 else 0 end) as "Phone number"
    from simpplr_common_tenant.udl.vw_user_as_is
    where tenant_code = '{tenantCode}'
      and status_code = 'US001';
  `,

  /**
   * Profile Completeness User-Level Query Template
   * Returns all users with their profile completeness fields for CSV validation
   * Note: This query is time-independent (shows current state)
   */
  PROFILE_COMPLETENESS_USER_LEVEL: `
    select
      u."FULL_NAME" as "Name",
      u."EMAIL" as "Email",
      u."COMPANY_NAME" as "Company name",
      u."SEGMENT_NAME" as "Segment",
      u."DIVISION" as "Division",
      u."DEPARTMENT" as "Department",
      u."CITY" as "City",
      u."STATE" as "State",
      u."COUNTRY" as "Country",
      u."USER_CATEGORY_NAME" as "User category",
      '' as "Is App Manager ?",
      extract(epoch from date_trunc('day', u."USER_CREATED_DATETIME"))::bigint as "Day(User Created Datetime)",
      case when u."USER_ACTIVE_DATETIME" is not null then extract(epoch from date_trunc('day', u."USER_ACTIVE_DATETIME"))::bigint else null end as "Day(User Active Datetime)",
      '' as "About text",
      '' as "Birthday date",
      '' as "Phone number",
      '' as "Profile image"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_ref_user_status_as_is s
      on u."STATUS_CODE" = s."CODE"
    where u."TENANT_CODE" = '{tenantCode}'
      and lower(s."DESCRIPTION") = 'active'
    group by
      u."CODE", u."FULL_NAME", u."EMAIL", u."COMPANY_NAME", u."SEGMENT_NAME",
      u."DIVISION", u."DEPARTMENT", u."CITY", u."STATE", u."COUNTRY",
      u."USER_CATEGORY_NAME", u."IS_APP_MANAGER", u."USER_CREATED_DATETIME",
      u."USER_ACTIVE_DATETIME", u."HAS_ABOUT", u."HAS_BIRTH_DATE",
      u."HAS_PHONE_NUMBER", u."HAS_PROFILE_IMAGE"
    order by u."FULL_NAME" asc nulls last;
  `,

  /**
   * Tenant Details Query Template
   * Returns tenant feature flags for determining which columns should be displayed
   */
  TENANT_DETAILS: `
    select 
      is_segment_enabled,
      is_people_category_enabled,
      people_category_singular_name
    from simpplr_common_tenant.udl.vw_tenant_details_as_is
    where tenant_code = '{tenantCode}';
  `,
};
