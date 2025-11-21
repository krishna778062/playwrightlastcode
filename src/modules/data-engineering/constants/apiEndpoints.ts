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
  },
} as const;

export const DATA_ENGINEERING_API_QUERY_PARAMS = {
  STATUS_ACTIVE: 'status=active',
  STATUS_INACTIVE: 'status=inactive',
} as const;
