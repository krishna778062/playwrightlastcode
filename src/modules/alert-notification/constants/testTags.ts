export enum AlertNotificationSuiteTags {
  ALERT_NOTIFICATION = '@alert-notification',
  SUBJECT_CUSTOMIZATION = '@subject-customization',
  MOBILE_PROMOTION = '@mobile-promotion',
}

export const TEST_TAGS = {
  ALERT_NOTIFICATION: AlertNotificationSuiteTags.ALERT_NOTIFICATION,
  SUBJECT_CUSTOMIZATION: AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION,
  MOBILE_PROMOTION: AlertNotificationSuiteTags.MOBILE_PROMOTION,
} as const;
