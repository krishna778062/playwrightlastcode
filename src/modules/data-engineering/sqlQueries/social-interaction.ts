export const SocialInteractionSql = {
  Reaction_Count: `
select count(i.code) as Reaction_Count 
from simpplr_common_tenant.udl.vw_interaction as i
{userJoin}
where i.tenant_code = '{tenantCode}' 
and i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and i.is_system_feed = false
and i.interaction_type_code = 'IT002'
{locationFilter}
{departmentFilter}
{segmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Feed_Posts_Comments_Count: `
select count(i.code) as Feed_Posts_Comments_Count 
from simpplr_common_tenant.udl.vw_interaction as i
{userJoin}
where i.tenant_code = '{tenantCode}' 
and i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and i.is_system_feed = false
and i.interaction_type_code IN ('IT004','IT008')
{locationFilter}
{departmentFilter}
{segmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Replies_Count: `
select count(i.code) as Replies_Count 
from simpplr_common_tenant.udl.vw_interaction as i
{userJoin}
where i.tenant_code = '{tenantCode}' 
and i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and i.is_system_feed = false
and i.interaction_type_code = 'IT007'
{locationFilter}
{departmentFilter}
{segmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Shares_Count: `
select count(i.code) as Shares_Count 
from simpplr_common_tenant.udl.vw_interaction as i
{userJoin}
where i.tenant_code = '{tenantCode}' 
and i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and i.is_system_feed = false
and i.interaction_type_code = 'IT003'
{locationFilter}
{departmentFilter}
{segmentFilter}
{userCategoryFilter}
{companyNameFilter};
    `,

  Favorites_Count: `
select count(i.code) as Favorites_Count 
from simpplr_common_tenant.udl.vw_interaction as i
{userJoin}
where i.tenant_code = '{tenantCode}' 
and i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and i.is_system_feed = false
and i.interaction_type_code = 'IT006'
{locationFilter}
{departmentFilter}
{segmentFilter}
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
  concat(round((count(*) * 100.0 / (select count(*) from simpplr_common_tenant.udl.social_campaign_share scs2 
                              join simpplr_common_tenant.udl.social_campaign sc2 on sc2.code = scs2.social_campaign_code
                              where sc2.tenant_code = '{tenantCode}' 
                                and sc2.is_campaign_active = true 
                                and sc2.is_deleted = false 
                                and scs2.is_deleted = false
                                and scs2.external_application_code in ('EA001','EA002','EA003')
                                and sc2.campaign_created_on between '{startDate}' AND '{endDate}')), 1), '%') as "Platform share contribution (%)"
from simpplr_common_tenant.udl.social_campaign as sc
left join simpplr_common_tenant.udl.social_campaign_share as scs
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

  Most_Engaged_By_Department: `
select name as "{columnName}",
REACTIONS_COUNT as "Reactions",
FEED_POST_COMMENT_COUNT as "Feed posts & content comments",
REPLIES_COUNT as "Replies",
SHARE_COUNT as "Shares",
FAVORITE_COUNT as "Favorites",
TOTAL_COUNT as "Total engagement"
from(
select u.{userParameter} as name,
count(distinct case when interaction_type_code='IT002'  then i.code end) as REACTIONS_COUNT,
count(distinct case when interaction_type_code in('IT004','IT008') then  i.code end) as FEED_POST_COMMENT_COUNT,
count(distinct case when interaction_type_code='IT007' then  i.code end) as REPLIES_COUNT,
count(distinct case when interaction_type_code='IT003'  then i.code end) as SHARE_COUNT,
count(distinct case when interaction_type_code='IT006'  then i.code end) as FAVORITE_COUNT,
(REACTIONS_COUNT+FEED_POST_COMMENT_COUNT+REPLIES_COUNT+SHARE_COUNT+FAVORITE_COUNT) as TOTAL_COUNT
from SIMPPLR_COMMON_TENANT.udl.vw_interaction as i
inner join SIMPPLR_COMMON_TENANT.udl.vw_user_as_is as u
on u.code=i.interacted_by_user_code
where i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and i.is_system_feed='False' 
and  i.TENANT_CODE = '{tenantCode}'
{locationFilter}
{departmentFilter}
{segmentFilter}
{userCategoryFilter}
{companyNameFilter}
group by 1
having TOTAL_COUNT > 0
) 
order by "Total engagement" desc;
    `,

  Least_Engaged_By_Department: `
select NAME as "{columnName}",
REACTIONS_COUNT as "Reactions",
FEED_POST_COMMENT_COUNT as "Feed posts & content comments",
REPLIES_COUNT as "Replies",
SHARE_COUNT as "Shares",
FAVORITE_COUNT as "Favorites",
TOTAL_COUNT as "Total engagement"
from(
select u.{userParameter} as NAME,
count(distinct case when interaction_type_code='IT002'  then i.code end) as REACTIONS_COUNT,
count(distinct case when interaction_type_code in('IT004','IT008') then  i.code end) as FEED_POST_COMMENT_COUNT,
count(distinct case when interaction_type_code='IT007' then  i.code end) as REPLIES_COUNT,
count(distinct case when interaction_type_code='IT003'  then  i.code end) as SHARE_COUNT,
count(distinct case when interaction_type_code='IT006'  then  i.code end) as FAVORITE_COUNT,
(REACTIONS_COUNT+FEED_POST_COMMENT_COUNT+REPLIES_COUNT+SHARE_COUNT+FAVORITE_COUNT) as TOTAL_COUNT
from SIMPPLR_COMMON_TENANT.udl.vw_interaction as i
inner join SIMPPLR_COMMON_TENANT.udl.vw_user_as_is as u
on u.code=i.interacted_by_user_code
where i.interaction_datetime BETWEEN '{startDate}' AND '{endDate}'
and i.is_system_feed=false 
and  i.TENANT_CODE = '{tenantCode}'
{locationFilter}
{departmentFilter}
{segmentFilter}
{userCategoryFilter}
{companyNameFilter}
group by 1
        having TOTAL_COUNT >= 0
        ) 
        order by "Total engagement" asc;
    `,

  Participant_Engagement_Activity: `
SELECT 
DATE(i.INTERACTION_DATETIME) AS interaction_date,
COUNT(DISTINCT CASE WHEN i.interaction_type_code = 'IT002' THEN i.code END) AS REACTIONS,
COUNT(DISTINCT CASE WHEN i.interaction_type_code in ('IT004','IT008') THEN i.code END) AS FEED_POST_COMMENTS,
COUNT(DISTINCT CASE WHEN i.interaction_type_code = 'IT007' THEN i.code END) AS REPLY,
COUNT(DISTINCT CASE WHEN i.interaction_type_code = 'IT003' THEN i.code END) AS SHARES,
COUNT(DISTINCT CASE WHEN i.interaction_type_code = 'IT006' THEN i.code END) AS FAVORITES
FROM SIMPPLR_COMMON_TENANT.udl.vw_interaction as i
{userJoin}
WHERE i.is_system_feed = false
AND i.TENANT_CODE = '{tenantCode}'
{locationFilter}
{departmentFilter}
{segmentFilter}
{userCategoryFilter}
{companyNameFilter}
AND i.INTERACTION_DATETIME BETWEEN '{startDate}' AND '{endDate}'
GROUP BY interaction_date
ORDER BY interaction_date ASC;
    `,
};
