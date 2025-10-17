export const AdoptionSql = {
  /**
   * 
   * select count(distinct user_code) from udl.vw_daily_user_adoption dua 
inner join udl.vw_user_as_is u on dua.user_code=u.code 
where u.tenant_code='ea411953-6702-4a01-8b03-b98a172be511' 
and reporting_date>='2025-08-13' and reporting_date<='2025-09-11' 
and status_code='US001' 
and u.location in () 
and u.department in () 
and u.segment_code in () 
and u.user_category_code in ();
   */
  Total_Users: `
    SELECT COUNT(DISTINCT code) as "Total_Users"
    FROM simpplr_common_tenant.udl.vw_user_as_is
    WHERE tenant_code = '{orgId}'
    AND status_code = 'US001'
    AND created_date BETWEEN '{startDate}' AND '{endDate}'
    `,

  Logged_In_Users: `
    SELECT COUNT(DISTINCT code) as "Logged_In_Users"
    FROM simpplr_common_tenant.udl.vw_user_as_is
    WHERE tenant_code = '{orgId}'
    AND status_code = 'US001'
    AND last_login_date BETWEEN '{startDate}' AND '{endDate}'
    `,

  Contributors_And_Participants: `
    SELECT COUNT(DISTINCT code) as "Contributors_And_Participants"
    FROM simpplr_common_tenant.udl.vw_user_as_is
    WHERE tenant_code = '{orgId}'
    AND status_code = 'US001'
    AND is_contributor = true
    AND is_participant = true
    `,

  App_Web_Page_Views: `
    SELECT COUNT(DISTINCT code) as "App_Web_Page_Views"
    FROM simpplr_common_tenant.udl.vw_user_as_is
    WHERE tenant_code = '{orgId}'
    AND status_code = 'US001'
    AND app_web_page_views > 0
    `,

  Adoption_Leaders: `
    SELECT COUNT(DISTINCT code) as "Adoption_Leaders"
    FROM simpplr_common_tenant.udl.vw_user_as_is
    WHERE tenant_code = '{orgId}'
    AND status_code = 'US001'
    AND adoption_score > 0
    `,

  Adoption_Laggards: `
    SELECT COUNT(DISTINCT code) as "Adoption_Laggards"
    FROM simpplr_common_tenant.udl.vw_user_as_is
    WHERE tenant_code = '{orgId}'
    AND status_code = 'US001'
    AND adoption_score < 0
    `,
};
