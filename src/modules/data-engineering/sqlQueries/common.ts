export const CommonSql = {
  CONTENT_DATA: `
select c.code,c.title,c.content_url,ct.description as content_type
from simpplr_common_tenant.udl.vw_content_as_is as c
inner join simpplr_common_tenant.udl.vw_site_as_is as s
on c.site_code = s.code
inner join simpplr_common_tenant.udl.vw_ref_site_type_as_is as st
on st.code = s.site_type_code
inner join simpplr_common_tenant.udl.vw_ref_content_type_as_is as ct
on ct.code = c.content_type_code
where c.tenant_code = '{tenantCode}'
and c.is_content_active = true
and s.is_site_active = true
and is_restricted = {isRestricted}
and st.description = '{siteType}'
order by random()
limit 1;
  `,
};
