export const MustReadSql = {
  /**
   * Must Read Content IDs Query Template
   * Returns content IDs for active, non-restricted, currently must-read content.
   */
  MUST_READ_ACTIVE_CONTENT_IDS: `
    select
      c.code,
      coalesce(st.description, 'Blog posts') as site_type_description
    from udl.vw_content_as_is as c
      left join udl.vw_site_as_is as s
        on c.site_code = s.code
      inner join udl.vw_ref_site_type_as_is as st
        on st.code = s.site_type_code
    where c.tenant_code = '{tenantCode}'
      and c.is_must_read = true
      and c.was_must_read = false
      and c.is_restricted = false
      and c.is_content_active = true;
  `,
  /**
   * Must Read Status Query Template
   * Returns must-read status fields for a specific content ID.
   */
  MUST_READ_STATUS_BY_CONTENT_ID: `
    select
      c.code as content_code,
      s.site_name as site_name,
      c.is_must_read as is_must_read,
      c.was_must_read as was_must_read,
      iff(is_must_read = false and was_must_read = true, 1, 0) as is_must_read_expired,
      c.must_read_audience_type_code as must_read_audience_type_code,
      to_char(c.must_read_start_datetime, 'YYYY-MM-DD HH24:MI:SS.FF3') as must_read_start_datetime,
      to_char(coalesce(c.must_read_removed_timestamp, c.must_read_end_datetime), 'YYYY-MM-DD HH24:MI:SS.FF3') as must_read_end_datetime
    from SIMPPLR_COMMON_TENANT.udl.vw_content_as_is as c
      left join SIMPPLR_COMMON_TENANT.udl.vw_site_as_is as s
        on s.code = c.site_code
       and s.tenant_code = c.tenant_code
    where c.tenant_code = '{tenantCode}'
      and c.code = '{contentCode}';
  `,
  /**
   * Must Read Counts Query Template
   * Returns count of users who have marked a content as must-read and count of users who have read the content.
   */
  MUST_READ_COUNTS: `
    select 
    c.code,
    c.title,
    count(cmrm.code) as total_users,
    count(case when cmrm.is_ack = true then cmrm.code end) as read_users
from udl.vw_content_must_read_marked as cmrm
inner join udl.vw_content_as_is as c
    on c.code = cmrm.content_code
inner join udl.vw_user_as_is as u
    on u.code = cmrm.user_code
where cmrm.tenant_code = '{tenantCode}'
    and cmrm.content_code = '{contentCode}'
    and u.status_code = 'US001'
group by 1,2;
  `,
  /**
   * Must Read Audience List Query Template
   * Returns list of audiences for a specific content ID.
   */
  MUST_READ_AUDIENCE_LIST: `
   select 
a.code as audience_code,
a.audience_name,
a.display_name,
a.audience_rule,
a.audience_status,
a.audience_type,
a.description,
count(distinct u.code) as audience_member_count
from udl.vw_entity_audience_mapping as eam
inner join udl.vw_audience_as_is as a
on eam.audience_code = a.code
inner join udl.vw_exploded_must_read_audience as emra
on emra.exploded_audience_code = a.code
inner join udl.audience_members as am
on am.audience_code = a.code
inner join udl.vw_user_as_is as u
on u.code = am.user_code
where eam.tenant_code = '{tenantCode}'
and eam.content_code = '{contentCode}'
and a.is_deleted = false
and am.is_deleted = false
and u.status_code = 'US001'
group by 1,2,3,4,5,6,7;
  `,
  /**
   * Must Read User List Query Template
   * Returns list of users who have marked a content as must-read and list of users who have read the content.
   */
  MUST_READ_USER_LIST: `
   select * from (
    select 
        u.code,
        u.full_name,
        u.department,
        u.profile_image_url_optimized,
        u.title,
        iff(cmrm.is_ack, 'READ', 'UNREAD') as read_status,
        cmrm.ack_confirmation_datetime
    from udl.vw_content_must_read_marked as cmrm
    inner join udl.vw_content_as_is as c
        on c.code = cmrm.content_code
    inner join udl.user as u
        on u.code = cmrm.user_code
    where cmrm.tenant_code = '{tenantCode}'
        and cmrm.content_code = '{contentCode}'
        and u.status_code = 'US001'
         and (
           ('{readStatus}' = 'READ' and cmrm.is_ack = true)
           or ('{readStatus}' = 'UNREAD' and (cmrm.is_ack = false or cmrm.is_ack is null))
         )
         and upper(u.full_name) like upper('%{search}%')
);
  `,
  /**
   * Must Read User Count Query Template
   * Returns count of users who have marked a content as must-read and count of users who have read the content.
   */
  MUST_READ_USER_COUNT: `
      select 
        case
          when '{readStatus}' = 'READ' then
            count(distinct case when cmrm.is_ack = true then u.code else null end)
          else
            count(distinct case when (cmrm.is_ack = false or cmrm.is_ack is null) then u.code else null end)
        end as user_count
      from udl.vw_content_must_read_marked as cmrm
      inner join udl.vw_content_as_is as c
        on c.code = cmrm.content_code
        and c.must_read_marked_code = cmrm.must_read_marked_code
      inner join udl.vw_user_as_is as u
        on u.code = cmrm.user_code
      where cmrm.tenant_code = '{tenantCode}'
        and cmrm.content_code = '{contentCode}'
        and u.status_code = 'US001'
        and lower(u.full_name) like lower('%{search}%');
  `,
  /**
   * Must Read Users CSV Query Template
   * Returns list of users who have marked a content as must-read and list of users who have read the content.
   */
  MUST_READ_USERS_CSV: `
     select 
        u.full_name as user_name,
        u.email,
        iff(cmrm.is_ack, 'READ', 'UNREAD') as read_status,
        to_char(cmrm.ack_confirmation_datetime, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') as confirmation_datetime,
        u.manager_name,
        u.city,
        u.state,
        u.country,
        u.department,
        u.company_name,
        u.division,
        u.title
    from udl.vw_content_must_read_marked as cmrm
    inner join udl.vw_content_as_is as c
        on c.code = cmrm.content_code
    inner join udl.user as u
        on u.code = cmrm.user_code   
    where cmrm.tenant_code = '{tenantCode}'
        and cmrm.content_code = '{contentCode}'
        and u.status_code = 'US001'
        order by u.full_name; 
  `,
};
