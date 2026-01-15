/**
 * API Endpoints configuration
 * Organized by client type and resource
 */

export const RECOGNITION_API_ENDPOINTS = {
  applicationSettings: {
    list: '/v1/account/appConfig/app.setup.recognition',
  },
  tenantConfig: {
    update: '/recognition/tenant/config',
  },
  admin: {
    login: '/v2/identity/admin/login',
  },
  hub: {
    deleteAward: '/recognition/recognition/',
  },
} as const;

export const API_QUERY_PARAMS = {} as const;

export const API_HEADERS = {
  ACCEPT: 'application/json',
  CONTENT_TYPE: 'application/json',
} as const;
