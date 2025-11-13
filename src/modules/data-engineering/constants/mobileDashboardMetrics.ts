export const MOBILE_DASHBOARD_METRICS = {
  TOTAL_USERS: {
    title: 'Total users',
    subtitle: 'Total users on the platform',
  },
  MOBILE_LOGGED_IN_USERS: {
    title: 'Mobile logged in users',
    subtitle: 'Total users who logged in atleast once on their mobile device',
  },
  MOBILE_CONTENT_VIEWERS: {
    title: 'Mobile content viewers',
    subtitle: 'Logged-in users who viewed content on their mobile device',
  },
  TOTAL_MOBILE_CONTENT_VIEWS: {
    title: 'Total mobile content views',
    subtitle: 'Total views across all content on mobile devices',
  },
  AVG_MOBILE_CONTENT_VIEWS_PER_USER: {
    title: 'Avg mobile content views per user',
    subtitle: 'Avg mobile content views per logged in user',
  },
  UNIQUE_MOBILE_CONTENT_VIEWS: {
    title: 'Unique mobile content views',
    subtitle: 'The number of unique mobile users who viewed your content',
  },
  MOBILE_DEVICE_LOGINS: {
    title: 'Mobile device logins',
    subtitle: 'App usage by platform: iOS, Android or both',
  },
  MOBILE_CONTENT_VIEWS_BY_TYPE: {
    title: 'Mobile content views by type',
    subtitle: 'Break up of total mobile content views by content type',
  },
  MOBILE_ADOPTION_RATE: {
    title: 'Mobile adoption rate',
    subtitle: 'Percentage of total users who logged in on mobile during the selected time period',
  },
} as const;
