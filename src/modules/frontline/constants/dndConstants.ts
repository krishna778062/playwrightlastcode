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
  ALL_ORG_DESCRIPTION:
    'Apply these settings to everyone in your organization, except for users with manually defined working hours.',
  AUDIENCE_DESCRIPTION:
    'Apply these settings to specific groups of users. Set working hours manually or sync them using HRIS integrations.',

  // Working days
  WORKING_DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
} as const;

export type DNDMessage = (typeof DND_MESSAGES)[keyof typeof DND_MESSAGES];
