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
   * Returns top 5 users who published the most content in the period
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
    order by count(distinct c.code) desc
    limit 5;
  `,

  /**
   * Favorites Received Query Template
   * Returns top 5 users with most favorited profiles/content/feed posts and content comments in the period
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
    order by count(i.code) desc
    limit 5;
  `,

  /**
   * Reactions Made Query Template
   * Returns top 5 users who reacted the most to content/feed posts and content comments/replies in the period
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
    order by count(i.code) desc
    limit 5;
  `,

  /**
   * Reactions Received Query Template
   * Returns top 5 users who received the most reactions on content/feed posts and content comments/replies in the period
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
    order by count(i.code) desc
    limit 5;
  `,

  /**
   * Feed Posts and Content Comments Query Template
   * Returns top 5 users who made most feed posts and content comments in the period
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
    order by count(i.code) desc
    limit 5;
  `,

  /**
   * Replies Query Template
   * Returns top 5 users who replied the most in feeds in the period
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
    order by count(i.code) desc
    limit 5;
  `,

  /**
   * Replies from Other Users Query Template
   * Returns top 5 users with most replies on their feed posts and content comments in the period
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
    order by count(i.code) desc
    limit 5;
  `,

  /**
   * Shares Received Query Template
   * Returns top 5 users whose content/feed posts and content comments were most shared in the period
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
    order by count(i.code) desc
    limit 5;
  `,

  /**
   * Profile Views Query Template
   * Returns top 5 users with most viewed profiles in the period
   * Column aliases match UI table headers exactly
   */
  PROFILE_VIEWS: `
    select
      max(u.full_name) as "Name",
      count(distinct i.code) as "Profile views"
    from simpplr_common_tenant.udl.vw_user_as_is u
    inner join simpplr_common_tenant.udl.vw_interaction i
      on i.receiver_user_code = u.code
    where u.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code in ('IT001')
      and i.interaction_entity_code = 'ET001'
    group by u.code
    having count(i.code) > 0
    order by count(i.code) desc
    limit 5;
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
};
