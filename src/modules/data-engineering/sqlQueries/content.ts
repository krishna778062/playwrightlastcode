export const ContentSql = {
  /**
   * Total Content Views Query Template
   * Returns count of content views with filters applied
   */
  TOTAL_CONTENT_VIEWS: `
    select TO_CHAR(count(i.code), '999,999,999') as count 
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c on c.code = i.content_code and c.tenant_code = i.tenant_code
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
        TO_CHAR(COUNT(DISTINCT 
            i.interacted_by_user_code || '_' || 
            i.content_code || '_' || 
            CAST(i.interaction_datetime AS DATE)
        ), '999,999,999') AS user_content_day_count
    FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction i
      LEFT JOIN SIMPPLR_COMMON_TENANT.udl.vw_ref_interaction_type_as_is it
        ON i.interaction_type_code = it.code
      RIGHT JOIN SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c
        ON i.tenant_code = c.tenant_code
       AND i.content_code = c.code
       AND i.tenant_code = c.tenant_code
      JOIN SIMPPLR_COMMON_TENANT.udl.vw_ref_content_type_as_is ct
        ON c.content_type_code = ct.code
      LEFT JOIN SIMPPLR_COMMON_TENANT.udl.user as u 
        ON i.interacted_by_user_code = u.code AND i.tenant_code = u.tenant_code
    WHERE i.tenant_code = '{tenantCode}'
      AND i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
      AND i.interaction_type_code = 'IT001'
      AND LOWER(ct.description) IN ('album', 'blog post', 'event', 'page')
      AND i.is_deleted = false
      AND i.interaction_entity_code = 'ET003'
      AND (i.CONTENT_CODE NOT IN ('N/A') OR i.CONTENT_CODE IS NOT NULL)
      AND i.interaction_content_post_first_publish = 'true'
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
    select count(i.code) as views 
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c on c.code = i.content_code and c.tenant_code = i.tenant_code
    inner join SIMPPLR_COMMON_TENANT.udl.ref_content_type ct on ct.code = c.content_type_code
    {userJoin}
    where ct.code in ('CT001','CT002','CT003','CT004')
      and i.interaction_type_code = 'IT007'
      and i.interaction_entity_code = 'ET004'
      and i.is_system_feed = false
      and i.interaction_datetime between '{startDate}' AND '{endDate}'
      and i.tenant_code = '{tenantCode}'
      and i.is_deleted = false
      and i.interaction_content_post_first_publish = true
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

  /**
   * Reactions Query Template
   * Returns count of reactions on content with filters applied
   */
  REACTIONS: `
    select count(i.code) as count
    from SIMPPLR_COMMON_TENANT.udl.vw_interaction i
    inner join SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c
      on c.code = i.content_code
      AND c.tenant_code = i.tenant_code
    {userJoin}
    where i.tenant_code = '{tenantCode}'
      and i.interaction_datetime between '{startDate}' AND '{endDate}'
      and i.interaction_type_code = 'IT002'
      and c.content_type_code in ('CT001','CT002','CT003','CT004')
      and i.interaction_content_post_first_publish = 'true'
      and i.is_deleted = false
      and i.is_system_feed = false
      and i.interaction_entity_code = 'ET003'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Knowledge Pages Query Template
   * Returns count of distinct published knowledge pages
   */
  KNOWLEDGE_PAGES: `
    select count(distinct case when cm.content_status='Published'
    then c.code end) as published
    from SIMPPLR_COMMON_TENANT.udl.content as c 
    inner join SIMPPLR_COMMON_TENANT.udl.content_measures as cm 
      on c.code = cm.content_code
    where c.tenant_code = '{tenantCode}'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Content Referral Sources Query Template
   * Returns referral sources with content items, referrals, and average referrals per content item
   */
  CONTENT_REFERRAL_SOURCES: `
    SELECT 
      u.description AS DESCRIPTION,
      COUNT(DISTINCT c.code) AS CONTENT_ITEMS, 
      COUNT(i.code) AS REFERRALS,
      ROUND(
        CAST(COUNT(i.code) AS NUMBER(18,9)) / 
        NULLIF(CAST(COUNT(DISTINCT c.code) AS NUMBER(18,9)), 0),
        1
      ) AS AVG_REF
    FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    RIGHT JOIN SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c 
      ON c.code = i.content_code and c.tenant_code = i.tenant_code
    INNER JOIN SIMPPLR_COMMON_TENANT.udl.vw_ref_utm_source_as_is u 
      ON i.utm_source_code = u.code
    WHERE 
      c.tenant_code = '{tenantCode}' 
      AND i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
      AND c.content_type_code IN ('CT001','CT002','CT003','CT004') 
      AND i.interaction_content_post_first_publish = 'true'
      AND i.INTERACTION_TYPE_CODE = 'IT001' 
    GROUP BY u.description 
    ORDER BY COUNT(i.code) DESC
  `,

  /**
   * Content Published by Type Query Template
   * Returns count of content published grouped by content type with percentage
   */
  CONTENT_PUBLISHED_BY_TYPE: `
    SELECT
      c.content_type_code AS CONTENT_TYPE_CODE,
      COUNT(c.code) AS COUNT,
      ROUND(
        (COUNT(c.code) * 100.0) / NULLIF(SUM(COUNT(c.code)) OVER (), 0),
        2
      ) AS PERCENTAGE
    FROM
      SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c
    WHERE
      c.content_first_published_date BETWEEN '{startDate}' AND '{endDate}'
      AND c.content_type_code IN ('CT001','CT002','CT003','CT004')
      AND c.tenant_code = '{tenantCode}'
    GROUP BY c.content_type_code
    ORDER BY COUNT(c.code) DESC
  `,

  VIEWS_BY_TYPE: `
    WITH content_agg AS (
      SELECT
        CASE 
          WHEN c.content_type_code = 'CT002' THEN 'Page'
          WHEN c.content_type_code = 'CT003' THEN 'Event'
          WHEN c.content_type_code = 'CT004' THEN 'Album'
          WHEN c.content_type_code = 'CT001' THEN 'Blog Post'
        END AS content_type,
        COUNT(*) AS total_views,
        COUNT(
          DISTINCT 
            i.interacted_by_user_code || '_' ||
            i.content_code || '_' ||
            CAST(i.interaction_datetime AS DATE)
        ) AS unique_views,
        COUNT(DISTINCT c.code) AS total_published_content
      FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction i
      INNER JOIN SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c
        ON c.code = i.content_code
        AND c.tenant_code = i.tenant_code
      {userJoin}
      WHERE i.tenant_code = '{tenantCode}'
        AND i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
        AND i.interaction_type_code = 'IT001'
        AND c.content_type_code IN ('CT001','CT002','CT003','CT004')
        AND i.interaction_content_post_first_publish = 'true'
        AND i.is_deleted = FALSE
        AND i.is_system_feed = FALSE
        AND c.is_deleted = FALSE
        AND i.interaction_entity_code = 'ET003'
        AND (i.content_code NOT IN ('N/A') OR i.content_code IS NOT NULL)
        {locationFilter}
        {departmentFilter}
        {segmentFilter}
        {userCategoryFilter}
        {companyNameFilter}
      GROUP BY c.content_type_code
    ),
    total_views_sum AS (
      SELECT SUM(total_views) AS total_views_all
      FROM content_agg
    )
    SELECT
      ca.content_type AS CONTENT_TYPE,
      ca.total_views AS TOTAL_CONTENT_VIEWS,
      ca.unique_views AS UNIQUE_VIEWS,
      ca.total_published_content AS TOTAL_CONTENT,
      ROUND(ca.total_views * 100.0 / NULLIF(tv.total_views_all, 0), 2) AS VIEWS_CONTRIBUTION,
      ROUND(ca.total_views * 1.0 / NULLIF(ca.total_published_content, 0), 2) AS AVERAGE_CONTENT_VIEWS
    FROM content_agg ca
    CROSS JOIN total_views_sum tv
    ORDER BY ca.content_type
  `,

  ENGAGEMENT_GRAPH: `
    WITH date_series AS (
      SELECT 
        DATEADD(day, seq4(), '{startDate}') AS date
      FROM TABLE(generator(rowcount => 1000))
      WHERE DATEADD(day, seq4(), '{startDate}') <= '{endDate}'
    ),
    interaction_data AS (
      SELECT 
        DATE(interaction_datetime) AS date,
        COUNT(CASE WHEN interaction_type_code = 'IT002' AND interaction_entity_code = 'ET003' THEN interacted_by_user_code END) AS likes,
        COUNT(
          CASE WHEN 
            ((interaction_type_code = 'IT004' AND is_system_feed = 'false')
            OR (interaction_type_code = 'IT008' AND is_system_feed = 'false'))
            AND interaction_entity_code = 'ET003'
          THEN interacted_by_user_code END
        ) AS comment,
        COUNT(CASE WHEN interaction_type_code = 'IT007' AND interaction_entity_code = 'ET004' THEN interacted_by_user_code END) AS replies,
        COUNT(CASE WHEN interaction_type_code = 'IT003' AND interaction_entity_code = 'ET003' THEN interacted_by_user_code END) AS share,
        COUNT(CASE WHEN interaction_type_code = 'IT006' AND interaction_entity_code = 'ET003' THEN interacted_by_user_code END) AS favorite
      FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction AS i
      LEFT JOIN SIMPPLR_COMMON_TENANT.udl.vw_content_as_is AS c
        ON c.code = i.content_code
      WHERE 
        (i.content_code NOT IN ('N/A') OR i.content_code IS NULL)
        AND c.content_type_code IN ('CT001', 'CT002', 'CT003', 'CT004')
        AND interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
        AND c.tenant_code = '{tenantCode}'
        AND i.tenant_code = '{tenantCode}'
        AND i.is_deleted = FALSE
        AND i.interaction_content_post_first_publish = 'true'
        {locationFilter}
        {departmentFilter}
        {segmentFilter}
        {userCategoryFilter}
        {companyNameFilter}
      GROUP BY 1
    )
    SELECT 
      TO_DATE(d.date) AS DATE,
      COALESCE(i.likes, 0) AS LIKES,
      COALESCE(i.comment, 0) AS COMMENT,
      COALESCE(i.replies, 0) AS REPLIES,
      COALESCE(i.share, 0) AS SHARE,
      COALESCE(i.favorite, 0) AS FAVORITE
    FROM date_series d
    LEFT JOIN interaction_data i 
      ON d.date = i.date
    ORDER BY d.date
  `,
};
