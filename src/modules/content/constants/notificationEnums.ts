export enum NotificationType {
  EMAIL = 'email',
  BROWSER = 'browser',
  MOBILE = 'mobile',
}

export enum NotificationUrlPath {
  BROWSER = 'browser',
  NATIVE_APP = 'native-app',
  SMS = 'sms',
}

/**
 * Maps notification type to URL path
 * @param notificationType - The notification type
 * @returns The corresponding URL path
 */
export function getNotificationUrlPath(notificationType: NotificationType): NotificationUrlPath {
  switch (notificationType) {
    case NotificationType.MOBILE:
      return NotificationUrlPath.NATIVE_APP;
    case NotificationType.EMAIL:
      return NotificationUrlPath.BROWSER;
    case NotificationType.BROWSER:
      return NotificationUrlPath.BROWSER;
    default:
      return NotificationUrlPath.BROWSER;
  }
}
