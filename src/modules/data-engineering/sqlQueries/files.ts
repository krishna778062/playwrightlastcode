export const FilesSql = {
  /**
   * Total Views Query Template
   * Returns count of file views (interactions) for files excluding certain storage types
   * Note: This query filters by interaction type 'IT001' (view) and entity type 'ET006' (file)
   */
  TOTAL_VIEWS: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from simpplr_common_tenant.udl.vw_interaction as i
    inner join simpplr_common_tenant.udl.vw_file_as_is as f
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
  /**
   * Total Downloads Query Template
   * Returns count of file downloads (interactions) for files excluding certain storage types
   * Note: This query filters by interaction type 'IT016' (download) and entity type 'ET006' (file)
   */
  TOTAL_DOWNLOADS: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from simpplr_common_tenant.udl.vw_interaction as i
    inner join simpplr_common_tenant.udl.vw_file_as_is as f
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
  /**
   * Total Favourites Query Template
   * Returns count of files marked as favourites (interactions) for files excluding certain storage types
   * Note: This query filters by interaction type 'IT006' (favourite) and entity type 'ET006' (file)
   */
  TOTAL_FAVOURITES: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from simpplr_common_tenant.udl.vw_interaction as i
    inner join simpplr_common_tenant.udl.vw_file_as_is as f
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
  /**
   * Total Reactions Query Template
   * Returns count of user reactions (interactions) on files excluding certain storage types
   * Note: This query filters by interaction type 'IT002' (reaction) and entity type 'ET006' (file)
   */
  TOTAL_REACTIONS: `
    select COUNT(INTERACTED_BY_USER_CODE) as VIEWS
    from simpplr_common_tenant.udl.vw_interaction as i
    inner join simpplr_common_tenant.udl.vw_file_as_is as f
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
  /**
   * Total Unique Views Query Template
   * Returns count of distinct file views per user per day for files excluding certain storage types
   * Note: This query counts unique combinations of file_code, user_code, and date
   * and filters by interaction type 'IT001' (view) and entity type 'ET006' (file)
   */
  TOTAL_UNIQUE_VIEWS: `
    SELECT
      COUNT(
        DISTINCT
        i.file_code,
        i.interacted_by_user_code,
        DATE(i.interaction_datetime)
      ) AS UNIQUE_FILE_VIEWS
    FROM simpplr_common_tenant.udl.vw_interaction i
    INNER JOIN simpplr_common_tenant.udl.vw_file_as_is f
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
