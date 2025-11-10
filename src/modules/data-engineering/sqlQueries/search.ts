export const SearchSql = {
  Total_Search_Volume: `
SELECT COUNT(*) AS Total_Search_Volume 
FROM udl.vw_search s
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
WHERE s.tenant_code = '{tenantCode}'
  AND DATE(s.search_performed_datetime) >= '{startDate}' 
  AND DATE(s.search_performed_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter};
    `,
  Search_Click_Through_Rate: `
SELECT
    COUNT(sr.search_code) AS click_count,
    COUNT(s.code) AS total_count,
    CONCAT(
        COUNT(sr.search_code),
        ' (',
        2 * ROUND(((COUNT(sr.search_code) * 100.0) / NULLIF(COUNT(DISTINCT s.code),0)) / 2),
        '%)'
    ) AS formatted_result
FROM udl.vw_search s
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
LEFT JOIN udl.vw_search_result_click sr ON s.code = sr.search_code
WHERE s.tenant_code = '{tenantCode}'
  AND DATE(s.search_performed_datetime) >= '{startDate}'
  AND DATE(s.search_performed_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter};
    `,
  No_Results_Search: `
SELECT
  COUNT(CASE WHEN s.has_search_result = FALSE THEN 1 END) AS no_result_count,
  COUNT(*) AS total_count,
  CONCAT(
    COUNT(CASE WHEN s.has_search_result = FALSE THEN 1 END),
    ' (',
    ROUND(
      (COUNT(CASE WHEN s.has_search_result = FALSE THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0),
      2
    ),
    '%)'
  ) AS formatted_result
FROM udl.vw_search s
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
WHERE s.tenant_code = '{tenantCode}'
  AND DATE(s.search_performed_datetime) >= '{startDate}'
  AND DATE(s.search_performed_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter};
`,
  Average_Searches_Per_Logged_In_User: `
SELECT
    CASE
        WHEN q1.distinct_user_count = 0 THEN 0
        ELSE q2.total_count * 1.0 / q1.distinct_user_count
    END AS final_ratio
FROM
    (
        SELECT COUNT(DISTINCT dua.USER_CODE) AS distinct_user_count
        FROM UDL.DAILY_USER_ADOPTION AS dua
        INNER JOIN UDL.USER AS u
            ON dua.USER_CODE = u.CODE
        WHERE u.TENANT_CODE = '{tenantCode}'
          AND dua.reporting_date >= '{startDate}'
          AND dua.reporting_date <= '{endDate}'
          AND dua.HAS_LOGGED_IN = TRUE
          {locationFilter}
          {departmentFilter}
    ) q1,
    (
        SELECT COUNT(s.code) AS total_count
        FROM udl.vw_search s
        INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
        LEFT JOIN udl.vw_search_result_click sr ON s.code = sr.search_code
        WHERE s.tenant_code = '{tenantCode}'
          AND DATE(s.search_performed_datetime) >= '{startDate}'
          AND DATE(s.search_performed_datetime) <= '{endDate}'
          {locationFilter}
          {departmentFilter}
    ) q2;

`,

  Top_Search_Queries: `
SELECT
    s.search_term,
    COUNT(s.search_term) AS total_search,
    COUNT(sr.search_term) AS clickthrough,
    CONCAT(ROUND((COUNT(sr.search_term) * 100.0 / NULLIF(COUNT(s.search_term), 0)), 2), ' %') AS success_rate
FROM udl.vw_search s
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
LEFT JOIN udl.vw_search_result_click sr ON s.code = sr.search_code
WHERE s.tenant_code = '{tenantCode}'
  AND DATE(s.search_performed_datetime) >= '{startDate}'
  AND DATE(s.search_performed_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter}
GROUP BY s.search_term
ORDER BY COUNT(s.search_term) DESC, s.search_term ASC
LIMIT 10;
`,
  Top_Search_Queries_With_No_Clickthrough: `
SELECT
    s.search_term,
    COUNT(s.search_term) AS total_search,
    (COUNT(s.search_term) - COUNT(sr.search_term)) AS no_click_count,
    CONCAT(
        ROUND(((COUNT(s.search_term) - COUNT(sr.search_term)) * 100.0 / NULLIF(COUNT(s.search_term), 0)), 2),
        ' %'
    ) AS no_click_rate
FROM udl.vw_search s
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
LEFT JOIN udl.vw_search_result_click sr ON s.code = sr.search_code
WHERE s.tenant_code = '{tenantCode}'
  AND DATE(s.search_performed_datetime) >= '{startDate}'
  AND DATE(s.search_performed_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter}
GROUP BY s.search_term
ORDER BY total_search DESC, s.search_term ASC
LIMIT 10;
`,
  Top_Clickthrough_Types: `
WITH total_clicks AS (
    SELECT COUNT(*) AS total_clickthrough
    FROM udl.search_result_click sc
    INNER JOIN udl.search s ON sc.search_code = s.code
    INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
    WHERE sc.tenant_code = '{tenantCode}'
      AND DATE(sc.search_result_datetime) >= '{startDate}'
      AND DATE(sc.search_result_datetime) <= '{endDate}'
      {locationFilter}
      {departmentFilter}
)
SELECT
    rt.description AS item_type,
    COUNT(sc.code) AS click_count,
    t.total_clickthrough,
    CONCAT(ROUND((COUNT(sc.code) * 100.0 / NULLIF(t.total_clickthrough, 0)), 1), ' %') AS percentage
FROM udl.search_result_click sc
INNER JOIN udl.ref_item_type rt ON sc.item_type_code = rt.code
INNER JOIN udl.search s ON sc.search_code = s.code
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
CROSS JOIN total_clicks t
WHERE sc.tenant_code = '{tenantCode}'
  AND DATE(sc.search_result_datetime) >= '{startDate}'
  AND DATE(sc.search_result_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter}
GROUP BY rt.description, t.total_clickthrough
ORDER BY click_count DESC
LIMIT 5;
`,
  No_Result_Search_Queries: `
SELECT
    s.search_term,
    COUNT(*) AS failed_search_count,
    (SELECT COUNT(*)
     FROM udl.search s2
     INNER JOIN udl.user u2 ON s2.search_performed_by_user_code = u2.code
     WHERE s2.tenant_code = '{tenantCode}'
       AND s2.search_performed_datetime >= '{startDate}'
       AND s2.search_performed_datetime <= '{endDate}'
       {locationFilter}
       {departmentFilter}
    ) AS total_search_count,
    ROUND((COUNT(*) * 100.0 /
          (SELECT COUNT(*)
           FROM udl.search s3
           INNER JOIN udl.user u3 ON s3.search_performed_by_user_code = u3.code
           WHERE s3.tenant_code = '{tenantCode}'
             AND s3.search_performed_datetime >= '{startDate}'
             AND s3.search_performed_datetime <= '{endDate}'
             {locationFilter}
             {departmentFilter}
          )
    ), 1) AS failure_percentage
FROM udl.search s
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
WHERE s.tenant_code = '{tenantCode}'
  AND s.search_performed_datetime >= '{startDate}'
  AND s.search_performed_datetime <= '{endDate}'
  AND s.has_search_result = false
  {locationFilter}
  {departmentFilter}
GROUP BY s.search_term
ORDER BY failed_search_count DESC
LIMIT 5;
`,
  Most_Searches_Performed_By_Department: `
SELECT
  u.department,
  COUNT(s.code) AS total_searches,
  COUNT(DISTINCT u.code) AS distinct_users,
  (COUNT(s.code) / NULLIF(COUNT(DISTINCT u.code), 0)) AS avg_searches_per_user
FROM udl.search AS s
INNER JOIN udl.user AS u ON s.search_performed_by_user_code = u.code
WHERE s.tenant_code = '{tenantCode}'
  AND DATE(s.search_performed_datetime) >= '{startDate}'
  AND DATE(s.search_performed_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter}
GROUP BY u.department
ORDER BY total_searches DESC
LIMIT 5;
`,
  Search_Usage_Volume_And_Click_Through_Rate: `
SELECT
    DATE(s.search_performed_datetime) AS search_date,
    COUNT(DISTINCT s.code) AS total_search_count,
    COUNT(sr.code) AS total_click_count
FROM udl.search s
INNER JOIN udl.user u ON s.search_performed_by_user_code = u.code
LEFT JOIN udl.search_result_click sr ON s.code = sr.search_code
WHERE s.tenant_code = '{tenantCode}'
  AND DATE(s.search_performed_datetime) >= '{startDate}'
  AND DATE(s.search_performed_datetime) <= '{endDate}'
  {locationFilter}
  {departmentFilter}
GROUP BY DATE(s.search_performed_datetime)
ORDER BY search_date DESC;
`,
};
