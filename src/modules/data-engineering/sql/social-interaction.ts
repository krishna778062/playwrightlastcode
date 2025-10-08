export const SocialInteractionSql = {
  Reaction_Count: `
select count(code) as Reaction_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{orgId}' 
and interaction_datetime BETWEEN CONCAT(DATEADD(DAY, -{daysToSubtract}, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59')
and is_system_feed = false
and interaction_type_code = 'IT002';
    `,

  Feed_Posts_Comments_Count: `
select count(code) as Feed_Posts_Comments_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{orgId}' 
and interaction_datetime BETWEEN CONCAT(DATEADD(DAY, -{daysToSubtract}, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59')
and is_system_feed = false
and interaction_type_code IN ('IT004','IT008');
    `,

  Replies_Count: `
select count(code) as Replies_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{orgId}' 
and interaction_datetime BETWEEN CONCAT(DATEADD(DAY, -{daysToSubtract}, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59')
and is_system_feed = false
and interaction_type_code = 'IT007';
    `,

  Shares_Count: `
select count(code) as Shares_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{orgId}' 
and interaction_datetime BETWEEN CONCAT(DATEADD(DAY, -{daysToSubtract}, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59')
and is_system_feed = false
and interaction_type_code = 'IT003';
    `,

  Favorites_Count: `
select count(code) as Favorites_Count from simpplr_common_tenant.udl.vw_interaction 
where tenant_code = '{orgId}' 
and interaction_datetime BETWEEN CONCAT(DATEADD(DAY, -{daysToSubtract}, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59')
and is_system_feed = false
and interaction_type_code = 'IT006';
    `,

  Active_Campaign_Count: `
select count(distinct sc.code) from udl.social_campaign as sc
where sc.tenant_code = '{orgId}'
and sc.is_campaign_active = true
and sc.is_deleted = false
and sc.campaign_created_on between CONCAT(DATEADD(DAY, -{daysToSubtract}, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59');
    `,

  Social_Campaign_Shares: `
select sum(case when scs.external_application_code in ('EA001','EA002','EA003') then 1 else 0 end) as TOTAL_SHARE,
sum(case when scs.external_application_code = 'EA001' then 1 else 0 end) as FACEBOOK_SHARE,
sum(case when scs.external_application_code = 'EA002' then 1 else 0 end) as LINKEDIN_SHARE,
sum(case when scs.external_application_code = 'EA003' then 1 else 0 end) as TWITTER_SHARE,
round((FACEBOOK_SHARE/TOTAL_SHARE) * 100,1) as FACEBOOK_PERCENT,
round((LINKEDIN_SHARE/TOTAL_SHARE) * 100,1) as LINKEDIN_PERCENT,
round((TWITTER_SHARE/TOTAL_SHARE) * 100,1) as TWITTER_PERCENT
from udl.social_campaign as sc
left join udl.social_campaign_share as scs
on sc.code = scs.social_campaign_code
where sc.tenant_code = '{orgId}'
and sc.is_campaign_active = true
and sc.is_deleted = false
and scs.is_deleted = false
and sc.campaign_created_on between CONCAT(DATEADD(DAY, -{daysToSubtract}, CURRENT_DATE()), ' 00:00:00') AND CONCAT(CURRENT_DATE(), ' 23:59:59');
    `,
};
