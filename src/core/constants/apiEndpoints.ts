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
      v1IdentityAccountsUsersUserId: (userId: string) => `/v1/identity/accounts/users/${userId}`,
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
      v2IdentityAudiencesCategories: '/v2/identity/audiences/categories',
      v2IdentityAudiencesHierarchy: '/v2/identity/audiences/hierarchy',
      v2IdentityAudiences: '/v2/identity/audiences',
      deleteAccessControlGroup: (acgId: string) => `/v2/identity/access-control/groups/${acgId}`,
      listOfAccessControlGroups: '/v2/identity/access-control/groups/list',
      createAccessControlGroup: '/v2/identity/access-control/groups',
      v1AccountSecurityIdpInternal: '/v1/account/security/idp/internal',
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

  content: {
    category: '/pageCategories/list',
    publish: '/content?action=publish',
    delete: (siteId: string, contentId: string) => `/v1/content/sites/${siteId}/content/${contentId}`,
    signedUrl: '/v1/content/static/signedurl/upload',
    files: '/v1/content/files',
    listFiles: '/v1/content/files/list',
  },

  fileUpload: {
    albumImg: 'src/modules/global-search/test-data',
  },

  linkTile: {
    create: (siteId: string) => `/v1/content/sites/${siteId}/tiles`,
    delete: (siteId: string, tileId: string) => `/v1/content/sites/${siteId}/tiles/${tileId}`,
  },

  feed: {
    create: `/v1/wfeed/feeds`,
    delete: (feedId: string) => `/v1/wfeed/feeds/${feedId}`,
  },
  apps: {
    settings: '/v1/account/apps-links-settings',
    list: '/v1/account/launchpad/apps/list',
  },
  search: {
    intranetFile: '/v1/search/intranet-file',
    enterprise: '/search-ai/v1/enterprise/search',
  },
} as const;
