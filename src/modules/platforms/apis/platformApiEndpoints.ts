/**
 * API Endpoints configuration
 * Organized by client type and resource
 */

export const PLATFORM_API_ENDPOINTS = {
  appManagement: {
    users: {
      add: '/v1/identity/accounts/users',
      getUserId: (firstName: string, lastName: string) => `/v1/chat/search/users?query=${firstName} ${lastName}`,
      delete: (userId: string) => `/v1/identity/accounts/users/${userId}`,
      v1IdentityAccountsUsersUserId: (userId: string) => `/v1/identity/accounts/users/${userId}`,
      v1IdentityAccountsUsersUserIdStatus: (userId: string) => `/v1/identity/accounts/users/${userId}/status`,
      v1IdentityAccountsUsersList: '/v1/identity/accounts/users/list',
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
    people: '/v2/identity/people',
    v2IdentityProfileQuestionsVerify: '/v2/identity/profile-questions/verify',
    v2IdentityUsersSetPassword: '/v2/identity/users/set-password',
    v2IdentityUsersRegisterProfile: '/v2/identity/users/register-profile',
    roles: '/v1/identity/accounts/roles/list',
    expertises: '/v1/identity/expertises',
    endorseUser: (userId: string) => `/v1/identity/people/profile/${userId}/endorse`,
    unendorseUser: (userId: string) => `/v1/identity/people/profile/${userId}/unendorse`,
  },
  admin: {
    login: '/v2/identity/admin/login',
  },

  appConfig: {
    governance: '/v1/account/appConfig/app.setup.governance',
  },
  apps: {
    settings: '/v1/account/apps-links-settings',
    list: '/v1/account/launchpad/apps/list',
  },
  search: {
    intranetFile: '/v1/search/intranet-file',
    enterprise: '/search-ai/v1/enterprise/search',
  },
  externalSearch: {
    config: '/v1/account/appConfig/app.integrations.enterprise.search',
  },
  qr: {
    create: '/v1/promotions/w/qrcodes',
    contentList: '/v1/content/sites/content/list',
    delete: (qrCodeId: string) => `/v1/promotions/w/qrcodes/${qrCodeId}`,
  },
  integrations: {
    tiles: '/v1/tiles',
    tilesRootInstances: '/v1/tiles/root/instances',
    tilesInstances: '/v1/tiles/instances',
    contentTiles: '/v1/content/tiles',
    contentTilesList: '/v1/content/tiles/list',
    tilesByConnector: (connectorId: string) => `/v1/tiles?type=app&connectorId=${connectorId}`,
    createTileInstance: (tileId: string) => `/v1/tiles/${tileId}/instances`,
  },
} as const;

export const API_QUERY_PARAMS = {
  TYPE_APP: 'type=app',
  DASHBOARD_HOME: 'dashboard=home',
  HIDE_TILE_FALSE: 'hideTile=false',
} as const;

export const API_HEADERS = {
  ACCEPT: 'application/json',
  CONTENT_TYPE: 'application/json',
} as const;
