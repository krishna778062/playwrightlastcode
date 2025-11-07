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
};
