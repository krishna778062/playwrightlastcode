export enum AlertNotificationSuiteTags {
  ALERT_NOTIFICATION = '@alert-notification',
  SUBJECT_CUSTOMIZATION = '@subject-customization',
}

export const TEST_TAGS = {
  ALERT_NOTIFICATION: AlertNotificationSuiteTags.ALERT_NOTIFICATION,
  SUBJECT_CUSTOMIZATION: AlertNotificationSuiteTags.SUBJECT_CUSTOMIZATION,
} as const;
