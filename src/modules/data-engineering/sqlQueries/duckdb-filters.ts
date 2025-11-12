export const DuckDBFiltersSql = {
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
};
