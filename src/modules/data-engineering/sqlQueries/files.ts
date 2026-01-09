export const FilesSql = {
  TOTAL_VIEWS: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from UDL.VW_INTERACTION as i
    inner join UDL.VW_FILE_AS_IS as f
      on i.file_code = f.code
      and i.tenant_code = f.tenant_code
    where i.tenant_code = '{tenantCode}'
      and i.interaction_type_code = 'IT001'
      and i.interaction_entity_code = 'ET006'
      and i.is_deleted = false
      and f.file_storage_type_code != 'FSS005'
      and i.file_code != 'N/A'
      and i.interaction_datetime >= '{startDate}'
      and i.interaction_datetime <= '{endDate}'
  `,

  TOTAL_DOWNLOADS: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from UDL.VW_INTERACTION as i
    inner join UDL.VW_FILE_AS_IS as f
      on i.file_code = f.code
      and i.tenant_code = f.tenant_code
    where i.tenant_code = '{tenantCode}'
      and i.interaction_type_code = 'IT016'
      and i.interaction_entity_code = 'ET006'
      and i.is_deleted = false
      and f.file_storage_type_code != 'FSS005'
      and i.file_code != 'N/A'
      and i.interaction_datetime >= '{startDate}'
      and i.interaction_datetime <= '{endDate}'
  `,

  TOTAL_FAVOURITES: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from UDL.VW_INTERACTION as i
    inner join UDL.VW_FILE_AS_IS as f
      on i.file_code = f.code
      and i.tenant_code = f.tenant_code
    where i.tenant_code = '{tenantCode}'
      and i.interaction_type_code = 'IT006'
      and i.interaction_entity_code = 'ET006'
      and i.is_deleted = false
      and f.file_storage_type_code != 'FSS005'
      and i.file_code != 'N/A'
      and i.interaction_datetime >= '{startDate}'
      and i.interaction_datetime <= '{endDate}'
  `,

  TOTAL_REACTIONS: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from UDL.VW_INTERACTION as i
    inner join UDL.VW_FILE_AS_IS as f
      on i.file_code = f.code
      and i.tenant_code = f.tenant_code
    where i.tenant_code = '{tenantCode}'
      and i.interaction_type_code = 'IT002'
      and i.interaction_entity_code = 'ET006'
      and i.is_deleted = false
      and f.file_storage_type_code != 'FSS005'
      and i.file_code != 'N/A'
      and i.interaction_datetime >= '{startDate}'
      and i.interaction_datetime <= '{endDate}'
  `,

  TOTAL_UNIQUE_VIEWS: `
    SELECT
      COUNT(
        DISTINCT
        i.file_code,
        i.interacted_by_user_code,
        DATE(i.interaction_datetime)
      ) AS UNIQUE_FILE_VIEWS
    FROM UDL.VW_INTERACTION i
    INNER JOIN UDL.VW_FILE_AS_IS f
      ON i.file_code = f.code
      AND i.tenant_code = f.tenant_code
    WHERE i.tenant_code = '{tenantCode}'
      AND i.interaction_type_code = 'IT001'
      AND i.interaction_entity_code = 'ET006'
      AND i.is_deleted = false
      AND f.file_storage_type_code != 'FSS005'
      AND i.file_code != 'N/A'
      AND i.interaction_datetime >= '{startDate}'
      AND i.interaction_datetime <= '{endDate}'
  `,

  DISTRIBUTION_OF_VIEWS_BY_FILE_CATEGORY: `
    WITH base_views AS (
      SELECT
        i.interacted_by_user_code,
        i.file_code,
        f.file_type_code,
        ft.parent_category
      FROM UDL.VW_INTERACTION i
      INNER JOIN UDL.VW_REF_INTERACTION_TYPE_AS_IS it
        ON i.interaction_type_code = it.code
      INNER JOIN UDL.VW_FILE_AS_IS f
        ON i.file_code = f.code
        AND i.tenant_code = f.tenant_code
      LEFT JOIN UDL.VW_REF_FILE_TYPE_AS_IS ft
        ON f.file_type_code = ft.code
      WHERE i.tenant_code = '{tenantCode}'
        AND LOWER(it.description) = 'view'
        AND (
          LOWER(i.file_code) <> 'n/a'
          OR i.file_code IS NULL
        )
        AND i.is_deleted = false
        AND f.is_directory = false
        AND (
          LOWER(f.file_storage_type_code) <> 'fss005'
          OR f.file_storage_type_code IS NULL
        )
        AND i.interaction_datetime >= '{startDate}'
        AND i.interaction_datetime < '{endDate}'
    ),
    category_views AS (
      SELECT
        parent_category,
        COUNT(interacted_by_user_code) AS category_views,
        COUNT(DISTINCT file_code) AS distinct_files
      FROM base_views
      GROUP BY parent_category
    ),
    total_views AS (
      SELECT
        COUNT(interacted_by_user_code) AS total_views
      FROM base_views
    )
    SELECT
      cv.parent_category AS File_category,
      CONCAT(
        ROUND(
          (cv.category_views * 100.0) / NULLIF(tv.total_views, 0),
          1
        ),
        '%'
      ) AS View_contribution,
      cv.category_views AS Total_views,
      REGEXP_REPLACE(
        TO_VARCHAR(
          ROUND(
            cv.category_views / NULLIF(cv.distinct_files, 0),
            2
          )
        ),
        '(\\.0+$)|(\\.?0+$)',
        ''
      ) AS Average_file_views
    FROM category_views cv
    CROSS JOIN total_views tv
    ORDER BY Total_views DESC NULLS LAST
  `,

  DISTRIBUTION_OF_DOWNLOADS_BY_FILE_CATEGORY: `
    WITH base_views AS (
      SELECT
        i.interacted_by_user_code,
        i.file_code,
        f.file_type_code,
        ft.parent_category
      FROM UDL.VW_INTERACTION i
      INNER JOIN UDL.VW_REF_INTERACTION_TYPE_AS_IS it
        ON i.interaction_type_code = it.code
      INNER JOIN UDL.VW_FILE_AS_IS f
        ON i.file_code = f.code
        AND i.tenant_code = f.tenant_code
      LEFT JOIN UDL.VW_REF_FILE_TYPE_AS_IS ft
        ON f.file_type_code = ft.code
      WHERE i.tenant_code = '{tenantCode}'
        AND LOWER(it.description) = 'download'
        AND (
          LOWER(i.file_code) <> 'n/a'
          OR i.file_code IS NULL
        )
        AND i.is_deleted = false
        AND f.is_directory = false
        AND (
          LOWER(f.file_storage_type_code) <> 'fss005'
          OR f.file_storage_type_code IS NULL
        )
        AND i.interaction_datetime >= '{startDate}'
        AND i.interaction_datetime < '{endDate}'
    ),
    category_views AS (
      SELECT
        parent_category,
        COUNT(interacted_by_user_code) AS category_views,
        COUNT(DISTINCT file_code) AS distinct_files
      FROM base_views
      GROUP BY parent_category
    ),
    total_views AS (
      SELECT
        COUNT(interacted_by_user_code) AS total_views
      FROM base_views
    )
    SELECT
      cv.parent_category AS File_category,
      CONCAT(
        ROUND(
          (cv.category_views * 100.0) / NULLIF(tv.total_views, 0),
          1
        ),
        '%'
      ) AS View_contribution,
      cv.category_views AS Total_views,
      REGEXP_REPLACE(
        TO_VARCHAR(
          ROUND(
            cv.category_views / NULLIF(cv.distinct_files, 0),
            2
          )
        ),
        '(\\.0+$)|(\\.?0+$)',
        ''
      ) AS Average_file_views
    FROM category_views cv
    CROSS JOIN total_views tv
    ORDER BY Total_views DESC NULLS LAST
  `,
};
