export const GENERAL_APPLICATION_SETTINGS_MESSAGES = {
  SMS_NOTIFICATION_TOGGLE_DESCRIPTION:
    'SMS notifications are sent to an employee’s mobile phone. When enabled, standard text messaging rates and fees may be charged by the recipients mobile carrier. Select whether these notifications are enabled or not.',

  PUSH_NOTIFICATION_TOGGLE_DESCRIPTION:
    "Push notifications are shown on employee's mobile phone screens. Select whether these notifications are enabled for the native & hybrid mobile apps.",
} as const;

export const DEFAULT_SETTINGS_MESSAGES = {
  EMAIL_NOTIFICATION_DESCRIPTION:
    'The default email notification settings allow you to define which emails new employees will receive from',

  BROWSER_NOTIFICATION_DESCRIPTION:
    'The default browser notifications settings allow you to define which browser notifications new users will receive from',
  SMS_NOTIFICATION_DESCRIPTION:
    'The default SMS notification settings allow you to define which SMS messages new employees will receive from ',
  MOBILE_NOTIFICATION_DESCRIPTION:
    'The default mobile notification settings allow you to define which push notifications new employees will receive from',
  SUMMARIES_DIGEST_DESCRIPTION:
    'The default summaries & digests settings allow you to define which summaries and digests new users will receive from',
  EMAIL_NOTIFICATION_FREQUENCY_DESCRIPTION:
    'Receive email notifications immediately or summarized in a single daily email',

  APPLIED_TO_NEW_USERS_DESCRIPTION: ' notification settings will be applied to all new users.',
} as const;
