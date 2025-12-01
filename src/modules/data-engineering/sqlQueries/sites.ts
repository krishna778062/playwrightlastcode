export const SitesSql = {
  /**
   * Total Sites Query Template
   * Returns count of total sites, public sites, private sites, unlisted sites, and their percentages
   * Note: This query counts all active, non-deleted sites and does not filter by date.
   * Date filters ({startDate}, {endDate}) are included in the placeholder system but are not used in this query.
   */
  TOTAL_SITES: `
    SELECT
      COUNT(CASE WHEN site_type_code IN ('STT001', 'STT002', 'STT003') THEN 1 END) AS total_sites,
      COUNT(CASE WHEN site_type_code = 'STT001' THEN 1 END) AS public_sites,
      COUNT(CASE WHEN site_type_code = 'STT002' THEN 1 END) AS private_sites,
      COUNT(CASE WHEN site_type_code = 'STT003' THEN 1 END) AS unlisted_sites,
      ROUND(COUNT(CASE WHEN site_type_code = 'STT001' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN site_type_code IN ('STT001', 'STT002', 'STT003') THEN 1 END), 0), 0) AS public_percent,
      ROUND(COUNT(CASE WHEN site_type_code = 'STT002' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN site_type_code IN ('STT001', 'STT002', 'STT003') THEN 1 END), 0), 0) AS private_percent,
      ROUND(COUNT(CASE WHEN site_type_code = 'STT003' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN site_type_code IN ('STT001', 'STT002', 'STT003') THEN 1 END), 0), 0) AS unlisted_percent
    FROM SIMPPLR_COMMON_TENANT.UDL.VW_SITE_AS_IS
    WHERE 
      tenant_code = '{tenantCode}'
      AND is_site_active = TRUE
      AND is_deleted = FALSE
  `,

  /**
   * New Sites Last 90 Days Query Template
   * Returns count of sites created in the last 90 days, broken down by site type
   * Note: This query always uses the last 90 days from current date and does not use date filter placeholders.
   */
  NEW_SITES_LAST_90_DAYS: `
    SELECT 
      COUNT(*) AS sites_created_last_90_days,
      COUNT(CASE WHEN site_type_code = 'STT001' THEN 1 END) AS public_sites,
      COUNT(CASE WHEN site_type_code = 'STT002' THEN 1 END) AS private_sites,
      COUNT(CASE WHEN site_type_code = 'STT003' THEN 1 END) AS unlisted_sites
    FROM SIMPPLR_COMMON_TENANT.UDL.vw_site_as_is
    WHERE 
      tenant_code = '{tenantCode}'
      AND is_site_active = TRUE
      AND inactive_date IS NULL
      AND is_deleted = FALSE
      AND site_created_datetime >= DATEADD(day, -90, CURRENT_DATE)
      AND site_created_datetime < CURRENT_DATE + INTERVAL '1 day'
  `,

  /**
   * Featured Sites Query Template
   * Returns count of sites tagged as featured sites
   * Note: This query counts all active, non-deleted featured sites and does not filter by date.
   * Date filters ({startDate}, {endDate}) are included in the placeholder system but are not used in this query.
   */
  FEATURED_SITES: `
    SELECT 
      COUNT(*) AS featured_sites
    FROM SIMPPLR_COMMON_TENANT.UDL.VW_SITE_AS_IS
    WHERE 
      is_feature_site = TRUE
      AND tenant_code = '{tenantCode}'
      AND overall_is_site_active = TRUE
      AND inactive_date IS NULL
  `,

  /**
   * Total Managers Query Template
   * Returns count of distinct managers across all sites
   * Note: This query counts unique managers (users with active status) who are site participants with manager roles.
   * Date filters ({startDate}, {endDate}) are included in the placeholder system but are not used in this query.
   */
  TOTAL_MANAGERS: `
    SELECT 
      COUNT(DISTINCT sp.user_code) AS manager_count
    FROM SIMPPLR_COMMON_TENANT.UDL.vw_site_participants_as_is AS sp
    INNER JOIN SIMPPLR_COMMON_TENANT.UDL.vw_site_as_is AS s
      ON s.code = sp.site_code
    INNER JOIN SIMPPLR_COMMON_TENANT.UDL.vw_user_as_is AS u
      ON u.code = sp.user_code
    WHERE 
      u.status_code = 'US001'
      AND s.overall_is_site_active = TRUE
      AND s.site_type_code IN ('STT001', 'STT002', 'STT003')
      AND sp.tenant_code = '{tenantCode}'
      AND sp.is_deleted = FALSE
      AND sp.site_participant_role_code IN ('SPR001', 'SPR002', 'SPR003', 'SPR004')
      AND sp.relationship_via_code = 'SPRV001'
  `,

  /**
   * Total Sites Distribution Last 90 Days Query Template
   * Returns count of sites created in the last 90 days, broken down by site type
   * Note: This query always uses the last 90 days from current date and does not use date filter placeholders.
   */
  TOTAL_SITES_DISTRIBUTION_LAST_90_DAYS: `
    SELECT 
      COUNT(*) AS sites_created_last_90_days,
      COUNT(CASE WHEN site_type_code = 'STT001' THEN 1 END) AS public_sites,
      COUNT(CASE WHEN site_type_code = 'STT002' THEN 1 END) AS private_sites,
      COUNT(CASE WHEN site_type_code = 'STT003' THEN 1 END) AS unlisted_sites
    FROM SIMPPLR_COMMON_TENANT.UDL.vw_site_as_is
    WHERE 
      tenant_code = '{tenantCode}'
      AND is_site_active = TRUE
      AND inactive_date IS NULL
      AND is_deleted = FALSE
      AND site_created_datetime >= DATEADD(day, -90, CURRENT_DATE)
      AND site_created_datetime < CURRENT_DATE + INTERVAL '1 day'
  `,

  /**
   * Most Popular Sites Query Template
   * Returns list of the most popular sites (up to max 5) based on overall views and user engagement
   * Columns: Site name, Site type, Popularity score
   * Note: This query uses date filters ({startDate}, {endDate}) for interaction datetime filtering.
   */
  MOST_POPULAR_SITES: `
    SELECT *
    FROM (
        SELECT 
            site_code,
            site_name,
            site_type_code,
            total_shares,
            total_views,
            total_likes,
            total_replies,
            total_comments,
            (
                (total_views * 10)
                + (total_likes * 15)
                + (total_replies * 20)
                + (total_comments * 25)
            ) AS total_popularity
        FROM (
            SELECT 
                i.current_site_code AS site_code,
                s.site_name,
                s.site_type_code,
                COUNT(DISTINCT CASE 
                    WHEN interaction_type_code = 'IT001' THEN i.id 
                END) AS total_views,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT002' THEN i.id 
                END) AS total_likes,
                COUNT(CASE 
                    WHEN interaction_type_code IN ('IT004', 'IT008') THEN i.id 
                END) AS total_comments,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT007' THEN i.id 
                END) AS total_replies,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT003' THEN i.id 
                END) AS total_shares,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT006' THEN i.id 
                END) AS total_favourites
            FROM (
                SELECT 
                    *,
                    CASE 
                        WHEN interaction_content_post_first_publish IS NULL THEN 'N/A' 
                        ELSE interaction_content_post_first_publish 
                    END AS interaction_content_post_publish
                FROM SIMPPLR_COMMON_TENANT.UDL.vw_interaction
            ) AS i
            LEFT JOIN SIMPPLR_COMMON_TENANT.UDL.VW_SITE_AS_IS AS s
                ON i.current_site_code = s.code 
                AND s.tenant_code = i.tenant_code
            WHERE 
                s.tenant_code = '{tenantCode}'
                AND s.overall_is_site_active = TRUE
                AND s.site_type_code IN ('STT001', 'STT002', 'STT003')
                AND i.is_deleted = FALSE
                AND i.current_site_code NOT IN ('N/A')
                AND i.interaction_content_post_publish IN (TRUE, 'N/A')
                AND i.is_system_feed = FALSE
                AND i.interaction_datetime >= '{startDate}'
                AND i.interaction_datetime < '{endDate}'
            GROUP BY 
                i.current_site_code, 
                s.site_name, 
                s.site_type_code
        )
    )
    WHERE total_popularity > 0
    ORDER BY total_popularity DESC
    LIMIT 5
  `,

  /**
   * Least Popular Sites Query Template
   * Returns list of the least popular sites (up to max 5) based on overall views and user engagement
   * Columns: Site name, Site type, Popularity score
   * Note: This query uses date filters ({startDate}, {endDate}) for interaction datetime filtering.
   */
  LEAST_POPULAR_SITES: `
    SELECT *
    FROM (
        SELECT 
            site_code,
            site_name,
            site_type_code,
            total_shares,
            total_views,
            total_likes,
            total_replies,
            total_comments,
            (
                (total_views * 10)
                + (total_likes * 15)
                + (total_replies * 20)
                + (total_comments * 25)
            ) AS total_popularity
        FROM (
            SELECT 
                i.current_site_code AS site_code,
                s.site_name,
                s.site_type_code,
                COUNT(DISTINCT CASE 
                    WHEN interaction_type_code = 'IT001' THEN i.id 
                END) AS total_views,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT002' THEN i.id 
                END) AS total_likes,
                COUNT(CASE 
                    WHEN interaction_type_code IN ('IT004', 'IT008') THEN i.id 
                END) AS total_comments,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT007' THEN i.id 
                END) AS total_replies,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT003' THEN i.id 
                END) AS total_shares,
                COUNT(CASE 
                    WHEN interaction_type_code = 'IT006' THEN i.id 
                END) AS total_favourites
            FROM (
                SELECT 
                    *,
                    CASE 
                        WHEN interaction_content_post_first_publish IS NULL THEN 'N/A' 
                        ELSE interaction_content_post_first_publish 
                    END AS interaction_content_post_publish
                FROM SIMPPLR_COMMON_TENANT.UDL.vw_interaction
            ) AS i
            LEFT JOIN SIMPPLR_COMMON_TENANT.UDL.VW_SITE_AS_IS AS s
                ON i.current_site_code = s.code 
                AND s.tenant_code = i.tenant_code
            WHERE 
                s.tenant_code = '{tenantCode}'
                AND s.overall_is_site_active = TRUE
                AND s.site_type_code IN ('STT001', 'STT002', 'STT003')
                AND i.is_deleted = FALSE
                AND i.current_site_code NOT IN ('N/A')
                AND i.interaction_content_post_publish IN (TRUE, 'N/A')
                AND i.is_system_feed = FALSE
                AND i.interaction_datetime >= '{startDate}'
                AND i.interaction_datetime < '{endDate}'
            GROUP BY 
                i.current_site_code, 
                s.site_name, 
                s.site_type_code
        )
    )
    WHERE total_popularity > 0
    ORDER BY total_popularity ASC, site_name ASC
    LIMIT 10
  `,

  /**
   * Most Published Content Query Template
   * Returns list of sites (up to max 5) with most published content
   * Columns: Site name, Page, Event, Album, Content published
   * Note: This query uses date filters ({startDate}, {endDate}) for content_first_published_date filtering.
   */
  MOST_PUBLISHED_CONTENT: `
    SELECT 
        s.site_name,
        s.code,
        COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT002' THEN i.code END) AS pages_count,
        COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT003' THEN i.code END) AS events_count,
        COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT004' THEN i.code END) AS albums_count,
        (
            COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT002' THEN i.code END) +
            COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT003' THEN i.code END) +
            COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT004' THEN i.code END)
        ) AS total_content
    FROM SIMPPLR_COMMON_TENANT.UDL.vw_site_as_is AS s
    INNER JOIN SIMPPLR_COMMON_TENANT.UDL.vw_content_as_was AS i
        ON i.site_code = s.code AND i.tenant_code = s.tenant_code
    WHERE 
        s.tenant_code = '{tenantCode}'
        AND i.content_status_code = 'CS005'
        AND s.overall_is_site_active = TRUE
        AND s.site_type_code IN ('STT001', 'STT002', 'STT003')
        AND i.content_first_published_date >= '{startDate}'
        AND i.content_first_published_date < '{endDate}'
        AND i.site_code != 'N/A'
    GROUP BY s.code, s.site_name
    ORDER BY total_content DESC, s.site_name DESC
  `,

  /**
   * Least Published Content Query Template
   * Returns list of sites (up to max 5) with least published content
   * Columns: Site name, Page, Event, Album, Content published
   * Note: This query uses date filters ({startDate}, {endDate}) for content_first_published_date filtering.
   */
  LEAST_PUBLISHED_CONTENT: `
    SELECT 
        s.site_name,
        s.code,
        COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT002' THEN i.code END) AS pages_count,
        COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT003' THEN i.code END) AS events_count,
        COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT004' THEN i.code END) AS albums_count,
        (
            COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT002' THEN i.code END) +
            COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT003' THEN i.code END) +
            COUNT(DISTINCT CASE WHEN i.content_type_code = 'CT004' THEN i.code END)
        ) AS total_content
    FROM SIMPPLR_COMMON_TENANT.UDL.vw_site_as_is AS s
    INNER JOIN SIMPPLR_COMMON_TENANT.UDL.vw_content_as_was AS i
        ON i.site_code = s.code AND i.tenant_code = s.tenant_code
    WHERE 
        s.tenant_code = '{tenantCode}'
        AND i.content_status_code = 'CS005'
        AND s.overall_is_site_active = TRUE
        AND s.site_type_code IN ('STT001', 'STT002', 'STT003')
        AND i.content_first_published_date >= '{startDate}'
        AND i.content_first_published_date < '{endDate}'
        AND i.site_code != 'N/A'
    GROUP BY s.code, s.site_name
    ORDER BY total_content ASC
  `,

  /**
   * Low Activity Sites Query Template
   * Returns list of sites (up to max 5) with lowest views
   * Columns: Site Name, Site Type, Views
   * Note: This query always uses the last 90 days from current date and does not use date filter placeholders.
   * Uses HAVING total_views > 0 to exclude sites with no views.
   */
  LOW_ACTIVITY_SITES: `
    SELECT 
        s.site_name,
        st.description,
        COUNT(
            CASE 
                WHEN i.interaction_type_code = 'IT001' THEN i.interacted_by_user_code 
            END
        ) AS total_views
    FROM (
        SELECT *,
               CASE 
                   WHEN interaction_content_post_first_publish IS NULL THEN 'N/A' 
                   ELSE interaction_content_post_first_publish 
               END AS interaction_content_post_publish
        FROM SIMPPLR_COMMON_TENANT.UDL.vw_interaction
        WHERE tenant_code = '{tenantCode}'
    ) AS i
    RIGHT JOIN SIMPPLR_COMMON_TENANT.UDL.vw_site_as_is AS s
        ON i.site_code = s.code
    INNER JOIN SIMPPLR_COMMON_TENANT.UDL.vw_ref_site_type_as_is AS st
        ON st.code = s.site_type_code
    WHERE 
        s.tenant_code = '{tenantCode}'
        AND s.is_site_active = TRUE
        AND s.site_type_code IN ('STT001', 'STT002', 'STT003')
        AND i.is_deleted = FALSE
        AND i.site_code != 'N/A'
        AND i.interaction_content_post_publish IN ('true', 'N/A')
        AND i.interaction_datetime >= DATEADD(day, -90, CURRENT_DATE)
        AND i.interaction_datetime < CURRENT_DATE + INTERVAL '1 day'
    GROUP BY s.code, s.site_name, st.description
    ORDER BY total_views ASC
  `,
};
