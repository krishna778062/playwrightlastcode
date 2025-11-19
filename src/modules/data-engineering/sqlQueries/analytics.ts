export const AnalyticsSql = {
  Active_Segments: `
SELECT DISTINCT segment_code, segment_name 
FROM udl.vw_user_as_is 
WHERE tenant_code = ? 
AND status_code = 'US001'
ORDER BY segment_name
  `,

  Active_Departments: `
SELECT DISTINCT department 
FROM udl.vw_user_as_is 
WHERE tenant_code = ? 
AND status_code = 'US001' 
AND department IS NOT NULL
ORDER BY department
  `,

  Active_Locations: `
SELECT DISTINCT location 
FROM udl.vw_user_as_is 
WHERE tenant_code = ? 
AND status_code = 'US001' 
AND location IS NOT NULL
ORDER BY location
  `,

  Active_User_Categories: `
SELECT DISTINCT user_category_code, user_category_name 
FROM udl.vw_user_as_is 
WHERE tenant_code = ? 
AND status_code = 'US001'
ORDER BY user_category_name
  `,

  Active_Company_Names: `
SELECT DISTINCT company_name 
FROM udl.vw_user_as_is 
WHERE tenant_code = ? 
AND status_code = 'US001' 
AND company_name IS NOT NULL
ORDER BY company_name
  `,

  Active_Divisions: `
SELECT DISTINCT division 
FROM udl.vw_user_as_is 
WHERE tenant_code = ? 
AND status_code = 'US001' 
AND division IS NOT NULL
ORDER BY division
  `,

  ANALYTICS_LAST_UPDATED_DATETIME: `
select batch_name, max(data_process_end_time) as last_batch_end_time from simpplr_common_tenant.execution_run_stats.batch_run
where batch_name in 
('simpplr_core_warehouse_load',
'simpplr_aggregate_warehouse_load',
'simpplr_daily_snapshots_warehouse_load',
'simpplr_employee_listening_warehouse_load',
'simpplr_employee_newsletter_warehouse_load',
'simpplr_integration_warehouse_load',
'simpplr_monthly_snapshots_warehouse_load',
'simpplr_virtual_assistant_warehouse_load',
'simpplr_zeus_aqua_warehouse_load',
'simpplr_zeus_chat_warehouse_load',
'simpplr_zeus_warehouse_load') 
and batch_status ='SUCCESS'
group by 1
order by 1;
  `,
};
