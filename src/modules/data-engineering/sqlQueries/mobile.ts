export const MobileSql = {
  /**
   * Total Users Query Template
   * Returns count of distinct users with filters applied
   * Note: This query counts all active users (STATUS_CODE='US001') and does not filter by date.
   * Date filters ({startDate}, {endDate}) are included in the placeholder system but are not used in this query.
   */
  TOTAL_USERS: `
    select count(u.code) as user_count
    from SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u
    where u.STATUS_CODE = 'US001'
      and u.TENANT_CODE = '{tenantCode}'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Mobile Logged In Users Query Template
   * Returns count of distinct users who logged in at least once on their mobile device
   */
  MOBILE_LOGGED_IN_USERS: `
    select count(distinct case 
        when ul.reporting_date >= '{startDate}' 
             and ul.reporting_date <= '{endDate}'
             and ul.total_logins_mobile > 0 
        then ul.user_code 
    end) as mobile_loggedin_users
    from SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_DAILY_USER_ADOPTION ul 
        on u.code = ul.user_code
    where u.tenant_code = '{tenantCode}'
      and u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Mobile Content Viewers Query Template
   * Returns count of logged-in users who viewed content on their mobile device
   */
  MOBILE_CONTENT_VIEWERS: `
    select count(distinct case 
        when t1.device_type_code in ('DT001', 'DT002')
             and t1.interaction_datetime >= '{startDate}' 
             and t1.interaction_datetime <= '{endDate}'
             and t1.interaction_entity_code = 'ET003'
             and t2.content_type_code in ('CT001', 'CT002', 'CT003', 'CT004')
             and t3.status_code = 'US001'
        then t1.interacted_by_user_code 
    end) as mobile_content_viewers
    from SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS t3
    left join SIMPPLR_COMMON_TENANT.UDL.INTERACTION t1 
        on t1.interacted_by_user_code = t3.code
    left join SIMPPLR_COMMON_TENANT.UDL.VW_CONTENT_AS_IS t2 
        on t1.content_code = t2.code
    where t3.tenant_code = '{tenantCode}'
      and t3.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Total Mobile Content Views Query Template
   * Returns total views across all content on mobile devices
   */
  TOTAL_MOBILE_CONTENT_VIEWS: `
    select count(case when i.interaction_type_code = 'IT001' then i.interacted_by_user_code end) as total_views
    from (
        select concat('i_', code) as i_code,
               tenant_code, 
               site_code, 
               content_code, 
               interaction_type_code, 
               interaction_datetime, 
               interacted_by_user_code,
               device_type_code, 
               utm_source_code, 
               'N\\A' as content_type_code,
               feed_code,
               case when (content_code is not null and content_code != 'N/A')
                   then concat(interacted_by_user_code, content_code)
                   else interacted_by_user_code
               end as unique_user_content_code
        from SIMPPLR_COMMON_TENANT.UDL.VW_INTERACTION
    ) as i
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_CONTENT_AS_IS as c 
        on c.code = i.content_code
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u 
        on u.code = i.interacted_by_user_code
    where c.tenant_code = '{tenantCode}'
      and u.tenant_code = '{tenantCode}'
      and i.interaction_datetime >= '{startDate}'
      and i.interaction_datetime <= '{endDate}'
      and i.interaction_type_code = 'IT001'
      and i.device_type_code in ('DT001', 'DT002')
      and c.content_type_code in ('CT001', 'CT002', 'CT003', 'CT004')
      and u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Avg Mobile Content Views Per User Query Template
   * Returns average mobile content views per logged in user
   */
  AVG_MOBILE_CONTENT_VIEWS_PER_USER: `
    select round(
        case when denominator = 0 then 0 
             else numerator * 1.0 / denominator 
        end, 
        2
    ) as avg_mobile_content_views_per_user
    from (
        select (
            select count(distinct case 
                when ul.reporting_date >= '{startDate}' 
                     and ul.reporting_date <= '{endDate}'
                     and ul.total_logins_mobile > 0
                then ul.user_code 
            end)
            from SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS ua
            inner join SIMPPLR_COMMON_TENANT.UDL.VW_DAILY_USER_ADOPTION ul 
                on ua.code = ul.user_code
            where ua.tenant_code = '{tenantCode}'
              and ua.status_code = 'US001'
              {locationFilter}
              {departmentFilter}
              {segmentFilter}
              {userCategoryFilter}
              {companyNameFilter}
        ) as denominator,
        count(case when i.interaction_type_code = 'IT001' then i.interacted_by_user_code end) as numerator
        from SIMPPLR_COMMON_TENANT.UDL.VW_INTERACTION i
        inner join SIMPPLR_COMMON_TENANT.UDL.VW_CONTENT_AS_IS as c
            on c.code = i.content_code
        inner join SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS as u
            on u.code = i.interacted_by_user_code
        where i.interaction_datetime >= '{startDate}'
          and i.interaction_datetime <= '{endDate}'
          and i.device_type_code in ('DT001', 'DT002')
          and c.tenant_code = '{tenantCode}'
          and u.tenant_code = '{tenantCode}'
          and u.status_code = 'US001'
          {locationFilter}
          {departmentFilter}
          {segmentFilter}
          {userCategoryFilter}
          {companyNameFilter}
    )
  `,

  /**
   * Unique Mobile Content Views Query Template
   * Returns the number of unique mobile users who viewed your content
   */
  UNIQUE_MOBILE_CONTENT_VIEWS: `
    select count(distinct case when i.interaction_type_code = 'IT001' then i.unique_user_content_code end) as unique_views
    from (
        select concat('i_', code) as i_code,
               tenant_code, 
               site_code, 
               content_code, 
               interaction_type_code, 
               interaction_datetime, 
               interacted_by_user_code,
               device_type_code, 
               utm_source_code, 
               'N\\A' as content_type_code,
               feed_code,
               case when (content_code is not null and content_code != 'N/A')
                   then concat(interacted_by_user_code, content_code)
                   else interacted_by_user_code
               end as unique_user_content_code
        from SIMPPLR_COMMON_TENANT.UDL.VW_INTERACTION
    ) as i
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_CONTENT_AS_IS as c 
        on c.code = i.content_code
    inner join SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u 
        on u.code = i.interacted_by_user_code
    where c.tenant_code = '{tenantCode}'
      and u.tenant_code = '{tenantCode}'
      and i.interaction_datetime >= '{startDate}'
      and i.interaction_datetime <= '{endDate}'
      and i.interaction_type_code = 'IT001'
      and i.device_type_code in ('DT001', 'DT002')
      and c.content_type_code in ('CT001', 'CT002', 'CT003', 'CT004')
      and u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Mobile Device Logins Query Template
   * Returns app usage by platform: iOS, Android or both
   */
  MOBILE_DEVICE_LOGINS: `
    SELECT Android_count as Android_only,
      IOS_count as IOS_only, 
      Both_count as Both,
      round(Android_count * 100.0 / Total_count,2) AS Android_percentage,
      round(IOS_count * 100.0 / Total_count,2) AS IOS_percentage,
      round(Both_count * 100.0 / Total_count,2) AS Both_percentage
    FROM (
      SELECT
        SUM(CASE WHEN behaviour = 'Android' THEN 1 else 0 END) AS Android_count,
        SUM(CASE WHEN behaviour = 'IOS' THEN 1 else 0 END) AS IOS_count,
        SUM(CASE WHEN behaviour = 'Both' THEN 1 else 0 END) AS Both_count,
        COUNT(*) AS Total_count 
      FROM (
        SELECT full_name, code, user_code, behaviour
        FROM (
          SELECT * FROM (
            SELECT user_code,
              (CASE
                WHEN SUM(UNIQUE_ANDROID_LOGINS) > 0 AND SUM(UNIQUE_IOS_LOGINS) > 0 THEN 'Both'
                WHEN SUM(UNIQUE_ANDROID_LOGINS) > 0 AND SUM(UNIQUE_IOS_LOGINS) = 0 THEN 'Android'
                WHEN SUM(UNIQUE_ANDROID_LOGINS) = 0 AND SUM(UNIQUE_IOS_LOGINS) > 0 THEN 'IOS'
              END) AS behaviour 
            FROM (
              SELECT * FROM SIMPPLR_COMMON_TENANT.UDL.daily_user_adoption
              WHERE REPORTING_DATE BETWEEN '{startDate}' AND '{endDate}'
                AND tenant_code = '{tenantCode}'
            )
            GROUP BY user_code
          ) AS uda
          INNER JOIN SIMPPLR_COMMON_TENANT.udl.vw_user_as_is AS u ON u.code = uda.user_code
          WHERE u.status_code = 'US001'
            AND behaviour IS NOT NULL
            {locationFilter}
            {departmentFilter}
            {segmentFilter}
            {userCategoryFilter}
            {companyNameFilter}
        ) AS counts
      )
    )
  `,

  /**
   * Mobile Content Views By Type Query Template
   * Returns breakdown of total mobile content views by content type
   */
  MOBILE_CONTENT_VIEWS_BY_TYPE: `
    SELECT 
      sum(case when c.content_type_code ='CT002' then 1 else 0 end) as PAGE_VIEW,
      sum(case when c.content_type_code ='CT003' then 1 else 0 end) as EVENT_VIEW,
      sum(case when c.content_type_code ='CT004' then 1 else 0 end) as ALBUM_VIEW,
      round(sum(case when c.content_type_code ='CT002' then 1 else 0 end) * 100.0 / 
        (sum(case when c.content_type_code ='CT002' then 1 else 0 end) + 
         sum(case when c.content_type_code ='CT003' then 1 else 0 end) + 
         sum(case when c.content_type_code ='CT004' then 1 else 0 end)), 2) AS PAGE_VIEW_PERCENTAGE,
      round(sum(case when c.content_type_code ='CT003' then 1 else 0 end) * 100.0 / 
        (sum(case when c.content_type_code ='CT002' then 1 else 0 end) + 
         sum(case when c.content_type_code ='CT003' then 1 else 0 end) + 
         sum(case when c.content_type_code ='CT004' then 1 else 0 end)), 2) AS EVENT_VIEW_PERCENTAGE,
      round(sum(case when c.content_type_code ='CT004' then 1 else 0 end) * 100.0 / 
        (sum(case when c.content_type_code ='CT002' then 1 else 0 end) + 
         sum(case when c.content_type_code ='CT003' then 1 else 0 end) + 
         sum(case when c.content_type_code ='CT004' then 1 else 0 end)), 2) AS ALBUM_VIEW_PERCENTAGE
    FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction i 
    INNER JOIN SIMPPLR_COMMON_TENANT.udl.vw_content_as_is c 
      ON c.code = i.content_code 
    INNER JOIN SIMPPLR_COMMON_TENANT.udl.vw_user_as_is u 
      ON u.code = i.interacted_by_user_code
    WHERE i.tenant_code = '{tenantCode}'
      AND i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
      AND i.interaction_type_code = 'IT001' 
      AND i.device_type_code IN ('DT001', 'DT002')
      AND u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
  `,

  /**
   * Mobile Content Views Query Template
   * Returns unique mobile content views by date
   */
  MOBILE_CONTENT_VIEWS: `
    SELECT 
      date(i.INTERACTION_DATETIME) as INTERACTION_DATE,
      count(case when i.interaction_type_code='IT001' then i.INTERACTED_BY_USER_CODE end) as TOTAL_VIEWS
    FROM (
      SELECT *, 
        CASE 
          WHEN content_code IS NOT NULL AND content_code != 'N/A' THEN
            CONCAT(interacted_by_user_code, content_code) 
          ELSE 
            interacted_by_user_code
        END AS SISENSE_UNIQUE_USER_CONTENT_CODE 
      FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction
    ) AS i
    INNER JOIN SIMPPLR_COMMON_TENANT.udl.vw_content_as_is AS c
      ON c.code = i.content_code
    INNER JOIN SIMPPLR_COMMON_TENANT.udl.vw_user_as_is AS u
      ON u.code = i.interacted_by_user_code
    WHERE (i.CONTENT_CODE NOT IN ('N/A') OR i.CONTENT_CODE IS NULL)
      AND c.content_type_code IN ('CT001', 'CT002', 'CT003', 'CT004')
      AND i.INTERACTION_DATETIME BETWEEN '{startDate}' AND '{endDate}'
      AND i.tenant_code = '{tenantCode}'
      AND i.device_type_code IN ('DT001', 'DT002')
      AND u.status_code = 'US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
    GROUP BY date(i.INTERACTION_DATETIME)
    ORDER BY date(i.INTERACTION_DATETIME)
  `,

  /**
   * Mobile Adoption Rate Query Template (Bar Chart)
   * Returns percentage of total users who logged in on mobile during the selected time period
   */
  MOBILE_ADOPTION_RATE: `
    SELECT 
      count(distinct case when dua.has_logged_in='TRUE' then dua.user_code end) as mobile_visitor,
      CONCAT(ROUND((COUNT(DISTINCT CASE WHEN dua.has_logged_in = 'TRUE' THEN dua.user_code END) * 100.0) / 
      (SELECT COUNT(DISTINCT ua.code) FROM SIMPPLR_COMMON_TENANT.udl.user ua 
      join SIMPPLR_COMMON_TENANT.udl.daily_user_adoption dua2 on dua2.user_code=ua.code
      where ua.tenant_code = '{tenantCode}'
      AND dua2.reporting_date BETWEEN '{startDate}' AND '{endDate}'
      and ua.status_code='US001'
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}),2), '%') AS user_percentage,
      DATE(dua.reporting_date) AS login_date,
      TO_CHAR(DATE(dua.reporting_date), 'Mon DD, YYYY') AS date_format,
      TO_CHAR(DATE(dua.reporting_date), 'Mon DD') AS date_format_day
    FROM SIMPPLR_COMMON_TENANT.udl.daily_user_adoption dua 
    INNER JOIN SIMPPLR_COMMON_TENANT.udl.user u ON dua.user_code = u.code
    WHERE dua.reporting_date BETWEEN '{startDate}' AND '{endDate}'
      AND dua.tenant_code = '{tenantCode}'
      AND u.status_code = 'US001'
      AND dua.TOTAL_LOGINS_MOBILE > 0
      {locationFilter}
      {departmentFilter}
      {segmentFilter}
      {userCategoryFilter}
      {companyNameFilter}
    GROUP BY dua.reporting_date 
    ORDER BY dua.reporting_date ASC
  `,

  MOBILE_ADOPTION_RATE_CSV: `
 select dua.user_code, u.full_name, u.email, u.title, u.company_name, u.division, u.department, u.city, u.state, u.country,
 max(dua.reporting_date) as date_of_last_login
 from SIMPPLR_COMMON_TENANT.UDL.VW_DAILY_USER_ADOPTION dua
 inner join SIMPPLR_COMMON_TENANT.UDL.VW_USER_AS_IS u
 on dua.user_code = u.code 
 where dua.tenant_code = '{tenantCode}'
 and dua.reporting_date <= '{endDate}' and dua.reporting_date >= '{startDate}'
 and dua.total_logins_mobile > 0
 and dua.is_user_active = true
 and u.status_code = 'US001'
 {locationFilter}
 {departmentFilter}
 {segmentFilter}
 {userCategoryFilter}
 {companyNameFilter}
 group by 1,2,3,4,5,6,7,8,9,10
 order by date_of_last_login desc;
  `,
};
