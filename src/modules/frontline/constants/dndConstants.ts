/**
 * Constants for DND and App Restriction messages used in frontline tests
 */
export const DND_MESSAGES = {
  // Page headings and titles
  DND_APP_RESTRICTIONS_TAB: 'DND and app restrictions',
  DND_PAGE_HEADING: 'Do not disturb and app restrictions outside work hours',
  DO_NOT_DISTURB_MENU: 'Do not disturb',

  // Descriptions
  DND_PAGE_DESCRIPTION:
    'Notifications including email, browser, SMS, and mobile push notifications will not be sent outside your work hours, ensuring minimal distractions. Control notifications and app access outside of working hours to reduce distractions. Critical notifications will still reach users.View exclusion list',
  DND_APP_RESTRICTIONS_PAGE_DESCRIPTION:
    'Enable do not disturb to pause notifications outside work hours. Set app restrictions and manage notification preferences to set priority for delivery.',
  ALL_ORG_DESCRIPTION:
    'Apply these settings to everyone in your organization, except for users with manually defined working hours.',
  AUDIENCE_DESCRIPTION:
    'Apply these settings to specific groups of users. Set working hours manually or sync them using HRIS integrations.',

  // Working days and hours
  WORKING_DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  DEFAULT_WORKING_DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  DEFAULT_START_TIME: '00:30',
  DEFAULT_END_TIME: '02:30',

  // Audience DND Settings
  AUDIENCE_DND_HEADING: 'Audience DND and app restrictions settings',
  CHOOSE_SETTINGS_HEADING: 'Choose the settings you want to apply for your organization',
  ENABLE_DND_CHECKBOX_LABEL: 'Enable DND outside working hours',
  ENABLE_RESTRICTION_CHECKBOX_LABEL: 'Enable restrictions outside working hours',
  DND_DESCRIPTION: 'Limit notifications to essential updates only outside working hours',
  RESTRICTION_DESCRIPTION: 'Limit access to the app outside working hours to help maintain compliance',
  SHOW_REMINDER_RADIO: 'Show a reminder (Warning only)',
  BLOCK_ACCESS_RADIO: 'Block access (Complete block)',
  SHOW_REMINDER_HELP_TEXT:
    'Display a message reminding users this is outside their working hours. They can choose to continue.',
  BLOCK_ACCESS_HELP_TEXT:
    "Prevent users from accessing the app outside working hours. They'll see a message and won't be able to proceed.",
  SAVE_BUTTON_DISABLED: 'Save button should be disabled',

  // All organization DND settings
  ALL_ORG_SETTING_HEADER: 'Organization DND and app restrictions settings',
  ORG_SETTING_SOURCE_TEXT: "Select how you would like to set your organization's working hours",
  UKG_SOURCE_OPTION: 'UKG',
  MANUAL_SOURCE_OPTION: 'Manual',
  UKG_DESCRIPTION_TEXT: 'Automatically sync working hours using UKG integration.',
} as const;

export type DNDMessage = (typeof DND_MESSAGES)[keyof typeof DND_MESSAGES];
