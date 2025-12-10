export const OnSiteSql = {
  SITE_CREATED: `select TO_CHAR(site_created_datetime, 'DD/MM/YYYY') as "Site created" from UDL.VW_SITE_AS_IS 
        where code= '{siteCode}' and tenant_code='{tenantCode}';`,

  /** Replies from other users-IT007, Feed post and content comments-IT004','IT008 */
  REACTIONS_MADE: `SELECT 
            u.code,
            u.full_name AS "Full name",
            COUNT(i.interacted_by_user_code) AS "Interaction count"
        FROM UDL.VW_INTERACTION i
        INNER JOIN UDL.VW_USER_AS_IS u 
            ON i.interacted_by_user_code = u.code
        INNER JOIN UDL.VW_SITE_AS_IS s
            ON i.site_code=s.code AND s.tenant_code=u.tenant_code
        WHERE 
            u.tenant_code = '{tenantCode}'
            AND i.is_deleted = FALSE
            AND i.is_system_feed = FALSE
            AND i.interaction_type_code IN ('{interactionTypeCode}')
            AND date(i.INTERACTION_DATETIME)>= '{startDate}' AND date(i.INTERACTION_DATETIME)<= '{endDate}' 
            AND i.site_code='{siteCode}'
        GROUP BY 
            u.code, 
            u.full_name
        ORDER BY 
            COUNT(i.interacted_by_user_code) DESC;`,
  /** Replies to others-IT007, Shares received-IT003*/
  REACTIONS_RECEIVED: `SELECT 
        u.code,
        u.full_name AS "Full name",
        COUNT(i.receiver_user_code) AS "Interaction count",
    FROM UDL.VW_INTERACTION i
    INNER JOIN UDL.VW_USER_AS_IS u 
        ON i.receiver_user_code = u.code
    INNER JOIN UDL.VW_SITE_AS_IS s
        ON i.site_code=s.code
    WHERE 
        u.tenant_code = '{tenantCode}'
        AND i.is_deleted = FALSE
        AND i.is_system_feed = FALSE
        AND i.interaction_type_code IN ({interactionTypeCode})
        AND date(i.INTERACTION_DATETIME)>= '{startDate}' AND date(i.INTERACTION_DATETIME)<= '{endDate}' 
        AND i.site_code='{siteCode}'
    GROUP BY 
        u.code,
        u.full_name
    ORDER BY 
        COUNT(i.receiver_user_code) DESC;`,

  MOST_POPULAR: `SELECT 
    c.code,
    c.title as "Title",

    -- Influencer check
    COUNT(
        CASE 
            WHEN SISENSE_IS_INFLUENCER = 1 THEN c.code 
        END
    ) AS s_check,

    -- Total Views
    COUNT(
        CASE
            WHEN i.interaction_type_code = 'IT001'
             AND i.interaction_entity_code = 'ET003' 
            THEN i.interacted_by_user_code
        END
    ) AS total_views,

    -- Likes
    COUNT(
        CASE
            WHEN i.interaction_type_code = 'IT002'
             AND i.interaction_entity_code = 'ET003' 
            THEN i.interacted_by_user_code
        END
    ) AS total_likes,

    -- Replies
    COUNT(
        CASE
            WHEN i.interaction_type_code = 'IT007'
             AND i.interaction_entity_code = 'ET004' 
            THEN i.interacted_by_user_code
        END
    ) AS total_replies,

    -- Comments (excluding system feed)
    COUNT(
        CASE
            WHEN i.interaction_type_code = 'IT004'
             AND i.interaction_entity_code = 'ET003'
             AND i.is_system_feed = FALSE 
            THEN i.interacted_by_user_code
        END
    ) AS total_comments,

    -- Shares
    COUNT(
        CASE
            WHEN i.interaction_type_code = 'IT003'
             AND i.interaction_entity_code = 'ET003' 
            THEN i.interacted_by_user_code
        END
    ) AS total_shares,

    -- Popularity Score Formula
    CASE
        WHEN COUNT(CASE WHEN SISENSE_IS_INFLUENCER = 1 THEN 1 END) >= 1 THEN
            (
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT001' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 10 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT002' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 15 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT007' AND i.interaction_entity_code = 'ET004' THEN 1 END) * 20 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT003' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 20 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT004' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 25 )
            ) * 1.25
        ELSE
            (
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT001' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 10 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT002' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 15 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT007' AND i.interaction_entity_code = 'ET004' THEN 1 END) * 20 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT003' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 20 ) +
                ( COUNT(CASE WHEN i.interaction_type_code = 'IT004' AND i.interaction_entity_code = 'ET003' THEN 1 END) * 25 )
            )
    END as "Popularity score"

FROM udl.vw_content_as_is c

-- Influencer flag based on author
LEFT JOIN (
    SELECT 
        c.code,
        IFF(u.is_influencer, 1, 0) AS SISENSE_IS_INFLUENCER
    FROM udl.vw_user_as_is u
    INNER JOIN udl.vw_content_as_is c 
        ON c.primary_author_code = u.code
) cc 
    ON c.code = cc.code

-- Interaction records for the content
INNER JOIN udl.vw_interaction i 
    ON i.content_code = c.code

-- User performing the interaction
INNER JOIN udl.vw_user_as_is u 
    ON i.interacted_by_user_code = u.code
    AND i.interacted_by_user_code!='N/A'

WHERE 
    DATE(i.interaction_datetime) >= '{startDate}'
    AND DATE(i.interaction_datetime) <= '{endDate}'
    AND i.site_code = '{siteCode}'
    AND i.is_deleted = FALSE
    AND i.is_system_feed = FALSE
    AND i.tenant_code = '{tenantCode}'
GROUP BY 
    c.code,
    c.title

ORDER BY 
    "Popularity score" DESC;`,
};
