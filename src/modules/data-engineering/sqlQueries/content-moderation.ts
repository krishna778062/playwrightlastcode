/**
 * SQL queries for Content Moderation Analytics dashboard
 * These queries are used to validate UI metrics against Snowflake database
 */
export const ContentModerationSql = {
  /**
   * Total Sources query
   * Counts unique interactions of types IT004, IT007, IT008
   * Interaction types represent different moderation sources/actions
   */
  Total_Sources: `
   WITH fc AS (
    SELECT
        c.tenant_code,
        c.code AS source_record_code,
        c.comment_created_on AS source_record_created_datetime,
        c.comment_created_by_code AS author_code
    FROM udl.vw_comment_as_is c
    WHERE c.tenant_code = '{tenantCode}'
    UNION ALL
    SELECT
        f.tenant_code,
        f.code AS source_record_code,
        f.feed_created_on AS source_record_created_datetime,
        f.feed_created_by_code AS author_code
    FROM udl.vw_feed_as_is f
    WHERE f.tenant_code = '{tenantCode}'
)
SELECT
COUNT(DISTINCT CASE
WHEN fc.source_record_created_datetime BETWEEN '{startDate}' AND '{endDate}'
THEN fc.source_record_code END ) AS content_count
FROM fc
INNER JOIN udl.vw_user_as_is u
ON u.code = fc.author_code
AND u.tenant_code = fc.tenant_code;
  `,

  DETECTED: `
  SELECT COUNT(DISTINCT
CASE WHEN m.feed_code != 'N/A' THEN f.code
ELSE c.code END ) AS detected_content_count
FROM simpplr_common_tenant.udl.vw_content_moderation_detail_as_is m
LEFT JOIN simpplr_common_tenant.udl.vw_feed_as_is f
ON m.feed_code = f.code
AND m.feed_code != 'N/A'
LEFT JOIN simpplr_common_tenant.udl.vw_comment_as_is c
ON m.comment_code = c.code
AND m.feed_code = 'N/A'
WHERE m.tenant_code = '{tenantCode}'
AND m.is_system_reported = true
AND m.reported_by_code = 'N/A'
AND m.reported_datetime BETWEEN '{startDate}' AND '{endDate}';
  `,

  REPORTED: `
  SELECT COUNT(DISTINCT
CASE WHEN m.feed_code != 'N/A' THEN f.code
ELSE c.code END ) AS detected_content_count
FROM simpplr_common_tenant.udl.vw_content_moderation_detail_as_is m
LEFT JOIN simpplr_common_tenant.udl.vw_feed_as_is f
ON m.feed_code = f.code
AND m.feed_code != 'N/A'
LEFT JOIN simpplr_common_tenant.udl.vw_comment_as_is c
ON m.comment_code = c.code
AND m.feed_code = 'N/A'
WHERE m.tenant_code = '{tenantCode}'
AND m.is_system_reported = false
AND m.reported_by_code != 'N/A'
AND m.reported_datetime BETWEEN '{startDate}' AND '{endDate}';
  `,

  REMOVED: `
  SELECT COUNT(DISTINCT
CASE WHEN m.feed_code != 'N/A' THEN f.code
ELSE c.code END ) AS detected_content_count
FROM simpplr_common_tenant.udl.vw_content_moderation_detail_as_is m
LEFT JOIN simpplr_common_tenant.udl.vw_feed_as_is f
ON m.feed_code = f.code
AND m.feed_code != 'N/A'
LEFT JOIN simpplr_common_tenant.udl.vw_comment_as_is c
ON m.comment_code = c.code
AND m.feed_code = 'N/A'
WHERE m.tenant_code = '{tenantCode}'
AND moderation_status_code = 'MS003' 
AND m.moderation_datetime BETWEEN '{startDate}' AND '{endDate}';
  `,
} as const;
