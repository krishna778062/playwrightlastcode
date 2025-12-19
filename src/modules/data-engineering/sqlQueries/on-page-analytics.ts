export const OnPageAnalyticsSql = {
  CONTENT_ENGAGEMENT_DATA: `  
select
count(distinct case when interaction_type_code = 'IT002' and i.interaction_entity_code = 'ET003'  then i.code end) as REACTIONS_COUNT,
count(distinct case when interaction_type_code = 'IT004' and i.interaction_entity_code = 'ET003' then  i.code end) as COMMENT_COUNT,
count(distinct case when interaction_type_code = 'IT007' then  i.code end) as REPLIES_COUNT,
count(distinct case when interaction_type_code = 'IT003' and i.interaction_entity_code = 'ET003' then  i.code end) as SHARES_COUNT,
count(distinct case when interaction_type_code = 'IT006' and i.interaction_entity_code = 'ET003' then  i.code end) as FAVORITES_COUNT
from simpplr_common_tenant.udl.vw_interaction as i
where i.tenant_code = '{tenantCode}'
and i.content_code = '{contentCode}'
and i.is_system_feed = false
and i.is_deleted = false
and i.interaction_content_post_first_publish = true;
  `,
};
