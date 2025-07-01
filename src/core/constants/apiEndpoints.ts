/**
 * API Endpoints configuration
 * Organized by client type and resource
 */

export const API_ENDPOINTS = {
  appManagement: {
    users: {
      add: '/v1/identity/accounts/users',
      list: '/v1/identity/accounts/users/list',
      getUserId: (firstName: string, lastName: string) => `/v1/chat/search/users?query=${firstName} ${lastName}`,
      delete: (userId: string) => `/v1/identity/accounts/users/${userId}`,
    },
    roles: {
      list: '/v1/identity/accounts/roles/list',
    },
    groups: {
      create: '/v1/chat/conversations',
      addMembers: `/v1/chat/members`,
      search: (searchTerm: string, page = 1, size = 20) =>
        `/v1/chat/conversations/search?query=${searchTerm}&page=${page}&size=${size}&omit=messages&omit=users&omit=attachments`,
      listOfGroups: (page: number, perPage: number) =>
        `/v1/chat/conversations/list?page=${page}&perPage=${perPage}&conversationType=GROUP`,
    },
    identity: {
      listOfAudiences: '/v1/identity/audiences/list',
    },
  },
  identity: {
    validate: '/v2/identity/users/validate',
    login: '/v2/identity/users/login',
  },
  admin: {
    login: '/v2/identity/admin/login',
  },

  site: {
    url: '/v1/content/sites',
    category: '/v1/content/siteCategories/list',
    deactivate: '/v1/content/sites/attributes?attribute=status',
  },
} as const;
