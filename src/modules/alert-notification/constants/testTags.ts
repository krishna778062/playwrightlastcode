export enum AlertNotificationSuiteTags {
  ALERT_NOTIFICATION = '@alert-notification',
  SUBJECT_CUSTOMIZATION = '@subject-customization',
  MOBILE_PROMOTION = '@mobile-promotion',
  DEFAULTS_NOTIFICATION_SETTINGS = '@defaults-notification-settings',
  GENERAL_APPLICATION_SETTINGS = '@general-application-settings',
  PROFILE_NOTIFICATION_SETTINGS = '@profile-notification-settings',
}

export const TEST_TAGS = {
  ALERT_NOTIFICATION: AlertNotificationSuiteTags.ALERT_NOTIFICATION,
  SUBJECT_CUSTOMIZATION: AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION,
  MOBILE_PROMOTION: AlertNotificationSuiteTags.MOBILE_PROMOTION,
  DEFAULTS_NOTIFICATION_SETTINGS: AlertNotificationSuiteTags.DEFAULTS_NOTIFICATION_SETTINGS,
  GENERAL_APPLICATION_SETTINGS: AlertNotificationSuiteTags.GENERAL_APPLICATION_SETTINGS,
  PROFILE_NOTIFICATION_SETTINGS: AlertNotificationSuiteTags.PROFILE_NOTIFICATION_SETTINGS,
} as const;
