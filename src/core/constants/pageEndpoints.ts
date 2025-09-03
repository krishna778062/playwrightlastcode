export const PAGE_ENDPOINTS = {
  LOGIN_PAGE: '/login',
  HOME_PAGE: '/home',
  CHATS_PAGE: '/chat/conversations',
  AUDIO_VIDEO_CALL_PAGE: '/call',
  FEATURED_SITES_PAGE: '/sites/featured',
  SITE_PAGE: (siteId: string) => `/site/${siteId}/`,

  // Rewards pages
  MANAGE_REWARDS_PAGE: '/manage/recognition/rewards/overview',
  REWARDS_OPTIONS_PAGE: '/manage/recognition/rewards/reward-options',
  REWARD_STORE_PAGE: '/rewards-store/gift-cards',
  REWARD_STORE_ORDER_HISTORY_PAGE: '/rewards-store/order-history',
  ACCESS_CONTROL_GROUPS_PAGE: '/manage/access-control/groups',
  FEATURE_OWNERS: '/manage/access-control/feature-owners',
  MANAGE_USERS_PAGE: '/manage/users',
  LOGOUT: '/logout',

  // abac pages
  AUDIENCE_PAGE: '/audiences/org',
  AUDIENCE_RULE_PAGE: '/audiences/org/rules',

  // content management pages
  getSiteDashboardPage: (siteId: string) => `/site/${siteId}/dashboard`,
  PAGE_CREATION_PAGE: '/site/:siteId/page/:pageId',
  ALBUM_CREATION_PAGE: '/site/:siteId/album/:albumId',
  EVENT_CREATION_PAGE: '/site/:siteId/event/:eventId',
  
    //Integrations page
  CUSTOM_APPS_INTEGRATION_PAGE: '/manage/app/integrations/custom',
  EXTERNAL_APPS_PAGE: '/people/:userId/edit/external-apps',
  FILE_MANAGEMENT_PAGE: '/manage/app/integrations/files',
  PEOPLE_DATA_PAGE: '/manage/app/integrations/people',
  API_ACTIONS_PAGE: '/manage/app/integrations/api-actions',
  DOMAIN_NAMES_PAGE: '/manage/app/integrations/domains',
  EVENTS_PAGE: '/people/:userId/calendar',
  CUSTOM_APP_TILES_PAGE: '/manage/custom-app-tiles',
};