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
  getContentPreviewPage: (siteId: string, contentId: string, contentType: string) =>
    `/site/${siteId}/${contentType}/${contentId}`,
  getAlbumCreationPage: (siteId: string) => `/site/${siteId}/album/add`,
  getEventCreationPage: (siteId: string) => `/site/${siteId}/event/add`,
  getPageCreationPage: (siteId: string) => `/site/${siteId}/page/add`,
};
