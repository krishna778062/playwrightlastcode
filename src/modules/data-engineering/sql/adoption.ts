export const AdoptionSql = {
    totalUsers: `
    SELECT COUNT(DISTINCT code) as "total_users"
    FROM simpplr_common_tenant.udl.vw_user_as_is
    WHERE tenant_code = 'orgId'
    AND status_code = 'US001'
    `,
};