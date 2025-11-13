export const ContentSql = {
  /**
   * Total Content Views Query Template
   * Returns count of content views with filters applied
   */
  TOTAL_CONTENT_VIEWS: `
    select count(i.code) as count 
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c on c.code = i.content_code
    {userJoin}
    where i.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' and '{endDate}'
      and i.interaction_type_code = 'IT001'
      and c.content_type_code in ('CT001','CT002','CT003','CT004')
      and i.interaction_content_post_first_publish = 'true'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Total Content Published Query Template
   * Returns count of content published with filters applied
   */
  TOTAL_CONTENT_PUBLISHED: `
    select count(c.code) as count 
    from SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c
    where c.content_first_published_date between '{startDate}' AND '{endDate}'
      and c.content_type_code in ('CT002','CT003','CT004')
      and c.tenant_code = '{tenantCode}'
  `,

  /**
   * Unique Content View Query Template
   * Returns count of unique content views (aggregated at daily level) with filters applied
   */
  UNIQUE_CONTENT_VIEW: `
    SELECT 
        COUNT(DISTINCT 
            i.interacted_by_user_code || '_' || 
            i.content_code || '_' || 
            CAST(i.interaction_datetime AS DATE)
        ) AS user_content_day_count
    FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction i
      LEFT JOIN SIMPPLR_COMMON_TENANT.udl.vw_ref_interaction_type_as_is it
        ON i.interaction_type_code = it.code
      RIGHT JOIN SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c
        ON i.tenant_code = c.tenant_code
       AND i.content_code = c.code
      JOIN SIMPPLR_COMMON_TENANT.udl.vw_ref_content_type_as_is ct
        ON c.content_type_code = ct.code
      {userJoin}
    WHERE i.tenant_code = '{tenantCode}'
      AND i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
      AND i.interaction_type_code = 'IT001'
      AND LOWER(ct.description) IN ('album', 'blog post', 'event', 'page')
      AND i.interaction_content_post_first_publish = 'true'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Currently Published Content Query Template
   * Returns count of currently published content grouped by content type
   */
  CURRENTLY_PUBLISHED: `
    SELECT 
        content_type_code,
        COUNT(code) as content_count
    FROM SIMPPLR_COMMON_TENANT.udl.content 
    WHERE tenant_code = '{tenantCode}'
      AND is_content_active = true
      AND is_content_site_active = true
      AND content_type_code IN ('CT001','CT002','CT003','CT004')
      AND is_deleted = 'false'
      AND content_status_code = 'CS005'
    GROUP BY content_type_code
    ORDER BY content_count DESC
  `,

  /**
   * Users Who Viewed Content Percentage Query Template
   * Returns percentage of users who viewed content out of total active users
   */
  USERS_WHO_VIEWED_CONTENT_PERCENTAGE: `
    SELECT 
        (CAST(q2.users_who_viewed_content AS FLOAT) / q1.total_active_users) * 100 AS percentage_users_who_viewed_content
    FROM 
    (
        SELECT COUNT(DISTINCT U.USER_CODE) AS total_active_users
        FROM SIMPPLR_COMMON_TENANT.UDL.DAILY_USER_ADOPTION AS U 
        INNER JOIN SIMPPLR_COMMON_TENANT.UDL.USER AS US 
            ON U.USER_CODE = US.CODE
        WHERE US.TENANT_CODE = '{tenantCode}'
          AND U.reporting_date >= '{startDate}'
          AND U.reporting_date <= '{endDate}'
          AND US.status_code = 'US001'
    ) q1,
    (
        SELECT COUNT(DISTINCT dua.user_code) AS users_who_viewed_content
        FROM SIMPPLR_COMMON_TENANT.UDL.DAILY_USER_ADOPTION AS dua
        INNER JOIN SIMPPLR_COMMON_TENANT.UDL.USER AS u 
            ON u.code = dua.user_code
        WHERE dua.unique_content_views_overall > 0
          AND dua.tenant_code = '{tenantCode}'
          AND dua.reporting_date >= '{startDate}'
          AND dua.reporting_date <= '{endDate}'
          AND u.status_code = 'US001'
    ) q2
  `,

  /**
   * Comments Query Template
   * Returns count of comments on content with filters applied
   */
  COMMENTS: `
    select count(INTERACTED_BY_USER_CODE) as views 
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c on c.code = i.content_code
    inner join SIMPPLR_COMMON_TENANT.udl.ref_content_type ct on ct.code = c.content_type_code
    {userJoin}
    where ct.code in ('CT001','CT002','CT003','CT004')
      and i.interaction_type_code = 'IT004'
      and i.interaction_entity_code = 'ET003'
      and i.is_system_feed = 'false'
      and i.interaction_datetime between '{startDate}' AND '{endDate}'
      and c.tenant_code = '{tenantCode}'
      and i.is_deleted = 'False'
      and i.interaction_content_post_first_publish = 'True'
      and i.data_source_code = 'DS002'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Replies Query Template
   * Returns count of replies on content with filters applied
   */
  REPLIES: `
    select count(INTERACTED_BY_USER_CODE) as views 
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c on c.code = i.content_code
    inner join SIMPPLR_COMMON_TENANT.udl.ref_content_type ct on ct.code = c.content_type_code
    {userJoin}
    where ct.code in ('CT001','CT002','CT003','CT004')
      and i.interaction_type_code = 'IT007'
      and i.interaction_entity_code = 'ET003'
      and i.is_system_feed = 'false'
      and i.interaction_datetime between '{startDate}' AND '{endDate}'
      and c.tenant_code = '{tenantCode}'
      and i.is_deleted = 'False'
      and i.interaction_content_post_first_publish = 'True'
      and i.data_source_code = 'DS002'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Shares Query Template
   * Returns count of shares on content with filters applied
   */
  SHARES: `
    select count(INTERACTED_BY_USER_CODE) as views 
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c on c.code = i.content_code
    inner join SIMPPLR_COMMON_TENANT.udl.ref_content_type ct on ct.code = c.content_type_code
    {userJoin}
    where ct.code in ('CT001','CT002','CT003','CT004')
      and i.interaction_type_code = 'IT003'
      and i.interaction_entity_code = 'ET003'
      and i.is_system_feed = 'false'
      and i.interaction_datetime between '{startDate}' AND '{endDate}'
      and c.tenant_code = '{tenantCode}'
      and i.is_deleted = 'False'
      and i.interaction_content_post_first_publish = 'True'
      and i.data_source_code = 'DS002'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Favorites Query Template
   * Returns count of favorites on content with filters applied
   */
  FAVORITES: `
    select count(INTERACTED_BY_USER_CODE) as views 
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c on c.code = i.content_code
    inner join SIMPPLR_COMMON_TENANT.udl.ref_content_type ct on ct.code = c.content_type_code
    {userJoin}
    where ct.code in ('CT001','CT002','CT003','CT004')
      and i.interaction_type_code = 'IT006'
      and i.interaction_entity_code = 'ET003'
      and i.is_system_feed = 'false'
      and i.interaction_datetime between '{startDate}' AND '{endDate}'
      and c.tenant_code = '{tenantCode}'
      and i.is_deleted = 'False'
      and i.interaction_content_post_first_publish = 'True'
      and i.data_source_code = 'DS002'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,
};
