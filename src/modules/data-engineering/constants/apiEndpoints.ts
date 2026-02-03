/**
 * Data Engineering API Endpoints configuration
 * Organized by analytics resource type
 */

export const DATA_ENGINEERING_API_ENDPOINTS = {
  analytics: {
    segments: '/v2/analytics/segments',
    departments: '/v2/analytics/departments',
    locations: '/v2/analytics/locations',
    userCategories: '/v2/analytics/userCategories',
    companyNames: '/v2/analytics/companyNames',
    divisions: '/v2/analytics/divisions',
    batchRunDetails: '/v2/analytics/batchRunDetails',
    contentEngagement: '/v2/analytics/contentEngagement',
    mustReadStatus: '/v2/analytics/mustReadStatus',
    mustReadCounts: '/v2/analytics/mustReadCounts',
    mustReadAudienceList: '/v2/analytics/mustReadAudienceList',
    mustReadUserList: '/v2/analytics/mustReadUserList',
    mustReadUserCount: '/v2/analytics/mustReadUserCount',
    mustReadUsersCsv: '/v2/analytics/mustReadUsersCsv',
  },
} as const;

export const DATA_ENGINEERING_API_QUERY_PARAMS = {
  STATUS_ACTIVE: 'status=active',
  STATUS_INACTIVE: 'status=inactive',
} as const;
