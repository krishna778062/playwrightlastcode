/**
 * API Endpoints configuration
 * Organized by client type and resource
 */

export const API_ENDPOINTS = {
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
    tiles: {
      create: '/v1/content/tiles',
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
      listOfAudiences: '/v1/identity/audience/list',
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
    followersAndFollowingList: (userId: string, size: number = 6, nextPageToken?: number) => {
      let url = `/v1/identity/people/follow/${userId}?size=${size}&types=followers&types=following`;
      if (nextPageToken !== undefined) {
        url += `&nextPageToken=${nextPageToken}`;
      }
      return url;
    },
    validate: '/v2/identity/users/validate',
    login: '/v2/identity/users/login',
    people: '/v2/identity/people',
    v2IdentityProfileQuestionsVerify: '/v2/identity/profile-questions/verify',
    v2IdentityUsersSetPassword: '/v2/identity/users/set-password',
    v2IdentityUsersRegisterProfile: '/v2/identity/users/register-profile',
    roles: '/v1/identity/accounts/roles/list',
  },
  admin: {
    login: '/v2/identity/admin/login',
  },

  site: {
    url: '/v1/content/sites',
    category: '/v1/content/siteCategories/list',
    deactivate: '/v1/content/sites/attributes?attribute=status',
    activate: '/v1/content/sites/attributes?attribute=status',
    updateAccess: '/v1/content/sites/attributes?attribute=access',
    listOfSites: '/v1/content/sites/list',
    updateCategory: '/v1/content/sites/attributes?attribute=category',
    listOfCategories: '/v1/content/siteCategories/list?unrestrictedOnly=true',
    manageMembers: (siteId: string) => `/v1/content/sites/${siteId}/membership/manage`,
    membershipList: (siteId: string) => `/v1/content/sites/${siteId}/members/list`,
    unfeature: (siteId: string) => `/v1/content/sites/${siteId}/featured?action=unfeature`,
    siteDetails: (siteId: string) => `/v1/content/sites/${siteId}`,
    carouselItems: (siteId: string) => `/v1/content/sites/${siteId}/carousel/items/list`,
    requestMembership: `membership/request`,
    acceptMembershipRequest: (siteId: string) => `/v1/content/sites/${siteId}/membership/approval`,
    deleteCarouselItem: (siteId: string, carouselItemId: string) =>
      `/v1/content/sites/${siteId}/carousel/items/${carouselItemId}`,
  },

  content: {
    category: '/pageCategories/list',
    publish: '/content?action=publish',
    approveContent: (siteId: string, contentId: string) =>
      `/v1/content/sites/${siteId}/content/${contentId}?action=updateApprove`,
    updateDetails: (siteId: string, contentId: string) =>
      `/v1/content/sites/${siteId}/content/${contentId}?action=update`,
    delete: (siteId: string, contentId: string) => `/v1/content/sites/${siteId}/content/${contentId}`,
    file: (fileId: string) => `/v1/content/files/${fileId}`,
    signedUrl: '/v1/content/static/signedurl/upload',
    files: '/v1/content/files',
    listFiles: '/v1/content/files/list',
    topics: '/v1/content/topics/manage/list',
    createTopic: '/v1/content/topics',
    deleteTopics: '/v1/content/topics/bulk-delete',
    contentListInSite: '/v1/content/sites/content/list',
    manageContent: (siteId: string, contentId: string) => `/v1/content/sites/${siteId}/content/${contentId}/manage`,
    homeCarouselItems: '/v1/content/carousel/items/list',
    deleteHomeCarouselItem: (carouselItemId: string) => `/v1/content/carousel/items/${carouselItemId}`,
    onboarding: '/onboarding',
    updateDetails: (siteId: string, contentId: string) =>
      `/v1/content/sites/${siteId}/content/${contentId}?action=update`,
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
    update: (feedId: string) => `/v1/wfeed/feeds/${feedId}`,
    feedURL: (feedId: string) => `/feed/${feedId}`,
    comment: (feedId: string) => `/v1/wfeed/feeds/${feedId}/comments`,
    updateComment: (feedId: string, commentId: string) => `/v1/wfeed/feeds/${feedId}/comments/${commentId}`,
    deleteComment: (feedId: string, commentId: string) => `/v1/wfeed/feeds/${feedId}/comments/${commentId}`,
    commentReaction: (feedId: string, commentId: string) => `/v1/wfeed/feeds/${feedId}/comments/${commentId}/reactions`,
    fetchComments: (feedId: string) => `/v1/rfeed/feeds/${feedId}/comments`,
    rudderstack: 'https://rudderstack-data-plane.qa.simpplr.xyz/v1/track',
  },

  socialCampaign: {
    create: '/v1/socialcampaigns',
    list: '/v1/socialcampaigns/list',
    listGet: '/v1/campaign/list',
    get: (campaignId: string) => `/v1/socialcampaigns/${campaignId}`,
    update: (campaignId: string) => `/v1/socialcampaigns/${campaignId}`,
    delete: (campaignId: string) => `/v1/socialcampaigns/${campaignId}`,
    updateStatus: (campaignId: string) => `/v1/socialcampaigns/${campaignId}/status`,
    shareToFeed: (campaignId: string, sharedWith: string) =>
      `/v1/socialcampaigns/${campaignId}/share/feed/${sharedWith}`,
    metadata: '/v1/content/oembed/metadata',
    enableSettings: '/v1/account/appConfig/app.integrations.social.campaigns',
  },
  appConfig: {
    governance: '/v1/account/appConfig/app.setup.governance',
    general: '/v1/account/appConfig/app',
    appConfig: '/v1/account/appConfig',
  },
  tile: {
    create: '/v1/content/tiles',
    siteCreate: (siteId: string) => `/v1/content/sites/${siteId}/tiles`,
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
    list: (pageSize: number) => `/v1/promotions/r/qrcodes?pagesize=${pageSize}`,
  },
  integrations: {
    tiles: '/v1/tiles',
    tilesRootInstances: '/v1/tiles/root/instances',
    tilesInstances: '/v1/tiles/instances',
    contentTiles: '/v1/content/tiles',
    contentTilesList: '/v1/content/tiles/list',
    tilesByConnector: (connectorId: string) => `/v1/tiles?type=app&connectorId=${connectorId}`,
    createTileInstance: (tileId: string) => `/v1/tiles/${tileId}/instances`,
    calendarIntegration: '/v1/account/appConfig/app.integrations.calendar.integration',
    integrationDomains: '/v1/account/integration-domains',
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
