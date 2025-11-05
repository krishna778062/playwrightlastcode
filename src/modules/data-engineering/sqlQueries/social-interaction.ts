export const SocialInteractionSql = {
  Reaction_Count: `
select count(code) as Reaction_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{tenantCode}' 
and interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and is_system_feed = false
and interaction_type_code = 'IT002'
{locationFilter}
{departmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Feed_Posts_Comments_Count: `
select count(code) as Feed_Posts_Comments_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{tenantCode}' 
and interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and is_system_feed = false
and interaction_type_code IN ('IT004','IT008')
{locationFilter}
{departmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Replies_Count: `
select count(code) as Replies_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{tenantCode}' 
and interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and is_system_feed = false
and interaction_type_code = 'IT007'
{locationFilter}
{departmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Shares_Count: `
select count(code) as Shares_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{tenantCode}' 
and interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and is_system_feed = false
and interaction_type_code = 'IT003'
{locationFilter}
{departmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Favorites_Count: `
select count(code) as Favorites_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{tenantCode}' 
and interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and is_system_feed = false
and interaction_type_code = 'IT006'
{locationFilter}
{departmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Active_Campaign_Count: `
select count(distinct sc.code) from udl.social_campaign as sc
where sc.tenant_code = '{tenantCode}'
and sc.is_campaign_active = true
and sc.is_deleted = false
and sc.campaign_created_on between '{startDate}' AND '{endDate}';
    `,

  Social_Campaign_Shares: `
  select 
  case scs.external_application_code
    when 'EA001' then 'Facebook'
    when 'EA002' then 'LinkedIn'
    when 'EA003' then 'Twitter'
  end as "Social platform",
  count(*) as "Share count",
  concat(round((count(*) * 100.0 / (select count(*) from udl.social_campaign_share scs2 
                              join udl.social_campaign sc2 on sc2.code = scs2.social_campaign_code
                              where sc2.tenant_code = '{tenantCode}' 
                                and sc2.is_campaign_active = true 
                                and sc2.is_deleted = false 
                                and scs2.is_deleted = false
                                and scs2.external_application_code in ('EA001','EA002','EA003')
                                and sc2.campaign_created_on between '{startDate}' AND '{endDate}')), 1), '%') as "Platform share contribution (%)"
from udl.social_campaign as sc
inner join udl.social_campaign_share as scs
  on sc.code = scs.social_campaign_code
where sc.tenant_code = '{tenantCode}'
  and sc.is_campaign_active = true
  and sc.is_deleted = false
  and scs.is_deleted = false
  and scs.external_application_code in ('EA001', 'EA002', 'EA003')
  and sc.campaign_created_on between '{startDate}' AND '{endDate}'
group by scs.external_application_code
order by "Share count" desc;
    `,
};
