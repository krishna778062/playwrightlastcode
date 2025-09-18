export const ReactionSql = {
  totalUsers: `
select count(code) as Reaction_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = 'orgId' 
and interaction_datetime BETWEEN CONCAT(DATEADD(DAY, -29, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59')
and is_system_feed = false
and interaction_type_code = 'IT002';
    `,
};
