/**
 * Test data constants for DND & Manage Preferences feature
 */

export const DND_PAGE_TEXT = {
  // Page heading and description
  HEADING: 'Do not disturb outside work hours',
  DESCRIPTION_LINE_1: 'Enable do not disturb to pause notifications outside work hours.',
  DESCRIPTION_LINE_2: 'Set app restrictions and manage notification preferences to set priority for delivery.',

  // Links/Buttons
  MANAGE_PREFERENCES_BUTTON: 'Manage preferences',
  SAVE_BUTTON: 'Save',

  // Toggle options
  ALL_ORGANIZATION: {
    LABEL: 'All organization',
    HELPER_TEXT:
      'This setting will be applied to all users in org, with the exception of those who have manually configured their working hours.',
  },
  AUDIENCE: {
    LABEL: 'Audience',
    HELPER_TEXT:
      'Set the workdays for a specific audience. You can choose to retrieve this information from the HRIS connector or set it manually. Notifications outside of these selected days will be paused.',
  },

  // All organization DND configuration sections
  SELECT_SOURCE: {
    LABEL: 'Select source',
    SOURCES: {
      UKG: 'UKG',
      MANUAL: 'Manual',
    },
  },
  WORK_DAYS: {
    LABEL: 'Work days',
    OPTIONS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const,
  },
  WORK_HOURS: {
    LABEL: 'Work hours',
    START_TIME_LABEL: 'Work hours start time',
    END_TIME_LABEL: 'Work hours end time',
    HELPER_TEXT: "The selected work hours are applied according to each user's timezone.",
  },
  USER_EDITABLE: {
    LABEL: 'User editable',
    HELPER_TEXT:
      'Checking this will allow all users in the organization to set their own working hours. This will only apply to users who have a manual working hours setup.',
  },

  // Left sidebar menu
  SIDEBAR_MENU: {
    DO_NOT_DISTURB: 'Do not disturb',
  },
} as const;

export const MANAGE_PREFERENCES_PAGE_TEXT = {
  // Page heading and description
  HEADING: 'Manage preferences',
  DESCRIPTION_LINE_1: 'Manage notification preferences during do not disturb hours.',
  DESCRIPTION_LINE_2: 'Choose to get notified immediately (even during DND), after DND ends, or as an email digest.',
  DESCRIPTION_LINE_3:
    'In-app and critical notifications are always delivered to ensure important updates aren’t missed.',

  // Back link
  BACK_LINK: 'Do not disturb',

  // Table columns
  TABLE_COLUMNS: {
    NOTIFICATION: 'Notification',
    CATEGORY: 'Category',
    PRIORITY: 'Priority',
  },

  // Search
  SEARCH: {
    PLACEHOLDER: 'Search…',
    CLEAR_BUTTON: 'Clear',
  },

  // Sort options
  SORT: {
    BUTTON_TEXT: 'Sort by: Category',
    OPTIONS: {
      PRIORITY: 'Priority',
      CATEGORY: 'Category',
      LAST_MODIFIED: 'Last modified',
    },
  },

  // Filters
  FILTERS: {
    BUTTON_TEXT: 'Filters',
    PANEL_HEADER: 'Filters',
    RESET_ALL: 'Reset all',
    SECTIONS: {
      PRIORITY: 'Priority',
      CATEGORY: 'Category',
    },
    PRIORITY_OPTIONS: ['Receive immediately', 'Receive after DND ends', 'Receive as digest after DND ends'],
    CATEGORY_OPTIONS: [
      'App management',
      'Content',
      'Events',
      'Feed',
      'Mobile promotion',
      'Native message',
      'Newsletter',
      'Org communications',
      'Profile & expertise',
      'Rewards',
      'Site management',
      'Sites',
      'System',
    ],
  },
} as const;

// Priority dropdown options for editable notifications
export const PRIORITY_DROPDOWN_OPTIONS = {
  RECEIVE_IMMEDIATELY: 'Receive immediately',
  RECEIVE_AFTER_DND_ENDS: 'Receive after DND ends',
  RECEIVE_AS_DIGEST: 'Receive as digest after DND ends',
} as const;

// System notification tooltip text
export const SYSTEM_NOTIFICATION_TEXT = {
  LOCKED_TOOLTIP:
    'These are critical notifications and can’t  be changed. They’re always delivered to ensure important messages aren’t missed.',
  DEFAULT_PRIORITY: 'Receive immediately',
} as const;

// Search test data
export const MANAGE_PREFERENCES_SEARCH_TERMS = {
  MUST: 'must',
  ALERT: 'alert',
  FOLLOW: 'follow',
} as const;

// Categories for Manage Preferences
export const MANAGE_PREFERENCES_CATEGORIES = {
  APP_MANAGEMENT: 'App management',
  CONTENT: 'Content',
  EVENTS: 'Events',
  FEED: 'Feed',
  MOBILE_PROMOTION: 'Mobile promotion',
  NATIVE_MESSAGE: 'Native message',
  NEWSLETTER: 'Newsletter',
  ORG_COMMUNICATIONS: 'Org communications',
  PROFILE_EXPERTISE: 'Profile & expertise',
  REWARDS: 'Rewards',
  SITE_MANAGEMENT: 'Site management',
  SITES: 'Sites',
  SYSTEM: 'System',
} as const;

// All notification items with their descriptions, categories, and editability
// isEditable: true = can change priority, false = locked to "Receive immediately"
export const MANAGE_PREFERENCES_NOTIFICATIONS = [
  // App management
  {
    name: 'Actionable notifications (all public sites)',
    description: 'Get notified about all actionable events occurring in public sites',
    category: MANAGE_PREFERENCES_CATEGORIES.APP_MANAGEMENT,
    isEditable: true,
  },
  {
    name: 'Content feedback (public sites)',
    description: "Get notified about all 'Not useful' feedback provided in public sites",
    category: MANAGE_PREFERENCES_CATEGORIES.APP_MANAGEMENT,
    isEditable: true,
  },
  {
    name: 'Subscriptions',
    description: 'Get notified if a subscription you created for a private site is approved or rejected',
    category: MANAGE_PREFERENCES_CATEGORIES.APP_MANAGEMENT,
    isEditable: true,
  },
  {
    name: 'Content notifications (all public sites)',
    description: 'Get notified about all content notifications being sent in public sites',
    category: MANAGE_PREFERENCES_CATEGORIES.APP_MANAGEMENT,
    isEditable: true,
  },
  // Content
  {
    name: 'Knowledge content expiration',
    description: 'Knowledge content requires validation periodically to ensure content remains correct',
    category: MANAGE_PREFERENCES_CATEGORIES.CONTENT,
    isEditable: true,
  },
  {
    name: 'Likes or shares on my content',
    description: 'Get notified if someone likes or shares content that you authored',
    category: MANAGE_PREFERENCES_CATEGORIES.CONTENT,
    isEditable: true,
  },
  {
    name: 'Feedback',
    description: 'Get notified if a user gave feedback on content that you authored or have notifications enabled',
    category: MANAGE_PREFERENCES_CATEGORIES.CONTENT,
    isEditable: true,
  },
  {
    name: 'Content notifications',
    description: 'Get notified if an important message has been added to content in a site that you follow',
    category: MANAGE_PREFERENCES_CATEGORIES.CONTENT,
    isEditable: true,
  },
  {
    name: 'Knowledge content validation',
    description: 'Knowledge content requires validation periodically to ensure content remains correct',
    category: MANAGE_PREFERENCES_CATEGORIES.CONTENT,
    isEditable: true,
  },
  {
    name: 'Comments on my content',
    description:
      'Get notified if someone comments directly on content that you authored or have notifications enabled for',
    category: MANAGE_PREFERENCES_CATEGORIES.CONTENT,
    isEditable: true,
  },
  {
    name: 'Content submissions',
    description: 'Get notified if content you have submitted is either approved or rejected',
    category: MANAGE_PREFERENCES_CATEGORIES.CONTENT,
    isEditable: true,
  },
  // Events
  {
    name: 'RSVP confirmation',
    description: "Receive a confirmation email if you successfully RSVP'd to an event",
    category: MANAGE_PREFERENCES_CATEGORIES.EVENTS,
    isEditable: true,
  },
  {
    name: 'Updates and invites to events',
    description: 'Get notified if you are invited to an event, or if an event you organize or attend is updated',
    category: MANAGE_PREFERENCES_CATEGORIES.EVENTS,
    isEditable: true,
  },
  {
    name: 'New responses to events',
    description: 'Get notified if an event you organize receives new responses',
    category: MANAGE_PREFERENCES_CATEGORIES.EVENTS,
    isEditable: true,
  },
  // Feed
  {
    name: 'Replies to my posts or comments',
    description:
      "Get notified if someone replies directly to a post you've made in the feed or a comment  you've made on some content",
    category: MANAGE_PREFERENCES_CATEGORIES.FEED,
    isEditable: true,
  },
  {
    name: 'Mentions or posts to you',
    description: 'Get notified if someone @mentions you in a feed post, comment or reply or posts directly to you',
    category: MANAGE_PREFERENCES_CATEGORIES.FEED,
    isEditable: true,
  },
  {
    name: 'Shares your post',
    description: 'Get notified if someone shares your feed post',
    category: MANAGE_PREFERENCES_CATEGORIES.FEED,
    isEditable: true,
  },
  {
    name: 'Likes your post, reply or comment',
    description: "Get notified if someone likes a feed post, comment or reply that you've written",
    category: MANAGE_PREFERENCES_CATEGORIES.FEED,
    isEditable: true,
  },
  // Mobile promotion - LOCKED
  {
    name: 'Mobile app download prompt',
    description: 'Get notified when a prompt to download the mobile app is triggered',
    category: MANAGE_PREFERENCES_CATEGORIES.MOBILE_PROMOTION,
    isEditable: false,
  },
  // Native message
  {
    name: 'Native message',
    description: 'Notify me when I get a direct message, a mention, or a group chat post.',
    category: MANAGE_PREFERENCES_CATEGORIES.NATIVE_MESSAGE,
    isEditable: true,
  },
  // Newsletter - LOCKED
  {
    name: 'Newsletter',
    description: 'Get notified when you receive a new newsletter',
    category: MANAGE_PREFERENCES_CATEGORIES.NEWSLETTER,
    isEditable: false,
  },
  // Org communications
  {
    name: 'Must reads',
    description: 'Get notified if important content is marked as must-read',
    category: MANAGE_PREFERENCES_CATEGORIES.ORG_COMMUNICATIONS,
    isEditable: true,
  },
  {
    name: 'Alerts',
    description: 'Get notified if an alert is published which applies to you',
    category: MANAGE_PREFERENCES_CATEGORIES.ORG_COMMUNICATIONS,
    isEditable: false, // LOCKED
  },
  // Profile & expertise
  {
    name: 'Expertise',
    description: 'Get notified if someone adds a new expertise to your profile or endorses you',
    category: MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE,
    isEditable: true,
  },
  {
    name: 'Follows',
    description: 'Get notified if someone starts following you',
    category: MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE,
    isEditable: true,
  },
  // Rewards
  {
    name: 'Reward budget',
    description: 'Get notified when reaching and exceeding your annual or quarterly rewards',
    category: MANAGE_PREFERENCES_CATEGORIES.REWARDS,
    isEditable: true,
  },
  // Site management
  {
    name: 'Subscriptions',
    description: 'Get notified if a subscription is created for a private site that you manage which requires approval',
    category: MANAGE_PREFERENCES_CATEGORIES.SITE_MANAGEMENT,
    isEditable: true,
  },
  {
    name: 'Membership requests',
    description: 'Get notified if a user requests access to a site that you manage',
    category: MANAGE_PREFERENCES_CATEGORIES.SITE_MANAGEMENT,
    isEditable: true,
  },
  // Sites
  {
    name: 'Membership requests',
    description: 'Get notified if a request you made to join a site has been approved',
    category: MANAGE_PREFERENCES_CATEGORIES.SITES,
    isEditable: true,
  },
  // System - ALL LOCKED (critical notifications that cannot be changed)
  {
    name: 'SFTP sync and provisioning',
    description: 'Get notified when SFTP user sync or provisioning status is updated.',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'SFTP private key shared',
    description: 'Get notified when an SFTP private key is shared via email',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'SFTP credentials shared',
    description: 'Get notified when SFTP credentials are sent via email',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'User synchronization and provisioning',
    description: "Get notified when a user's sync or provisioning status is updated",
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Account suspension',
    description: 'Get notified when a user account is suspended',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Bulk license exhaustion notification',
    description: 'Get notified when multiple users are affected due to license exhaustion',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'License exhaustion alert',
    description: 'Get notified when a license has been exhausted or the limit is reached',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Integration token expiry',
    description: 'Get notified when an integration token is about to expire',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Help and feedback access',
    description: 'Get notified when help or feedback is accessed from the app',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Welcome email event',
    description: 'Get notified when the welcome email event is triggered for a user',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Welcome email - Single Sign-On',
    description: 'Get notified when a welcome email is sent to a user with Single Sign-On enabled.',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Welcome email - standard login',
    description: 'Get notified when a welcome email is sent to a new user',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Recover multi-factor authentication',
    description: 'Get notified when a user initiates recovery for multi-factor authentication',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Redemption code created',
    description: 'Get notified when a redemption code is generated or shared',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Email delivery test',
    description: 'Get notified when an email delivery test is completed',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Bulk people onboarding',
    description: 'Get notified when the sync status for a bulk people onboarding job is updated',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Reset password',
    description: 'Get notified when a user requests a password reset',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'OTP for password reset',
    description: 'Get notified when a user requests a one-time password',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Historical data ingestion',
    description: 'Get notified when historical data ingestion is completed',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Audience CSV job status',
    description: 'Get notified when the audience CSV job completes or fails',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
  {
    name: 'Bulk topic upload',
    description: 'Get notified when a bulk topic upload is completed',
    category: MANAGE_PREFERENCES_CATEGORIES.SYSTEM,
    isEditable: false,
  },
] as const;
