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
};
