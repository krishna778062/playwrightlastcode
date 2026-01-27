import { faker } from '@faker-js/faker';

// Simple constants for test data
export const TEST_PREFIXES = {
  TEST_SUBJECT_PREFIX: 'Test Subject',
  MUST_READ_PREFIX: 'Must Read Customization',
  FOLLOW_PREFIX: 'Follow Notification',
  ALERTS_PREFIX: 'Alert Notification',
  FRENCH_PREFIX: 'Sujet français',
} as const;

const TEST_VALUES = {
  FALLBACK_TEST_SUBJECT: 'Fallback test subject',
  VALID_SUBJECT: 'Test custom subject line',
  EMPTY_SUBJECT: '',
} as const;

const TEST_IDS = {
  OVERRIDE_ROW: 'override-row',
  DATA_GRID_ROW: 'dataGridRow-',
} as const;

// Stepper step constants
export const STEPPER_STEPS = {
  SELECT_NOTIFICATION: 'SELECT_NOTIFICATION',
  OVERRIDE_AND_CONFIRMATION: 'OVERRIDE_AND_CONFIRMATION',
  MANAGE_TRANSLATIONS: 'MANAGE_TRANSLATIONS',
} as const;

export type StepperStep = (typeof STEPPER_STEPS)[keyof typeof STEPPER_STEPS];

/**
 * Centralized test data for notification customization
 * Provides consistent test data across all test cases
 */

export const SUBJECT_LINES = {
  MUST_READ: {
    ENGLISH: "A 'must read' requires your attention",
    ENGLISH_EDITED: "A 'must read' requires your attention-edited",
    FRENCH: 'Un « à lire absolument » qui requiert votre attention',
    FRENCH_EDITED: 'Un « à lire absolument » qui requiert votre atten-edited tion',
    FRENCH_MANUAL: 'Mise à jour du PDG — veuillez lire',
    HINDI_MANUAL: 'सीईओ अपडेट – कृपया पढ़ें',
  },
  FOLLOW: {
    ENGLISH: 'Custom follow notification subject',
    ENGLISH_EDITED: 'Custom follow notification subject-edited',
  },
  ALERTS: {
    ENGLISH: 'Custom alert notification subject',
    ENGLISH_EDITED: 'Custom alert notification subject-edited',
  },
  FALLBACK_TEST: {
    ENGLISH: TEST_VALUES.FALLBACK_TEST_SUBJECT,
  },
  VALIDATION: {
    VALID_SUBJECT: TEST_VALUES.VALID_SUBJECT,
    EMPTY_SUBJECT: TEST_VALUES.EMPTY_SUBJECT,
    // Generate a subject line exceeding 120 characters (121 chars)
    SUBJECT_EXCEEDING_120_CHARS: faker.string.alphanumeric(121),
    // Generate a subject line exactly 120 characters
    SUBJECT_EXACTLY_120_CHARS: faker.string.alphanumeric(120),
    // Dynamic template subject with {{count}} token (10 chars) + 110 chars = 120 total
    DYNAMIC_SUBJECT_WITH_TOKEN_120_CHARS: `{{count}} ${faker.string.alphanumeric(110)}`,
  },
} as const;

export const TEMPLATE_DATA = {
  MUST_READ: {
    SINGLE_TEMPLATE: "A 'must read' requires your attention",
    PLURAL_TEMPLATE: "{{count}} 'must read' requires your attention",
    RADIO_NAME: "A 'must read' requires your",
    BUTTON_NAME: 'Must reads',
    BUTTON_NAME_SEARCH: 'Must reads',
  },
  FOLLOW: {
    TEMPLATE: 'started following you',
    RADIO_NAME: 'started following you',
    BUTTON_NAME: 'Follows',
  },
  ALERTS: {
    TEMPLATE: 'New Alert - {{message}}',
    RADIO_NAME: 'New Alert - {{message}}',
    BUTTON_NAME: 'Alerts Get notified if an alert',
    FEATURE_NAME: 'Alerts', // Name shown in listing table (different from BUTTON_NAME)
  },
  DAILY_SUMMARY: {
    TEMPLATE: 'Your summarized email notifications for {{appName}}',
    RADIO_NAME: 'Your summarized email notifications for {{appName}}',
    BUTTON_NAME: 'Daily summary',
  },
  DIGEST_EMAIL: {
    TEMPLATE: 'Your weekly feed digest for {{appName}}',
    RADIO_NAME: 'Your weekly feed digest for {{appName}}',
    BUTTON_NAME: 'Digest email',
  },
} as const;

/**
 * Generator helper for dynamic test data
 * Creates unique test data for each test run
 */
export class NotificationTestDataGenerator {
  /**
   * Generates a unique subject line with timestamp
   */
  static generateUniqueSubject(prefix: string = TEST_PREFIXES.TEST_SUBJECT_PREFIX): string {
    return `${prefix} - ${Date.now()}`;
  }

  /**
   * Generates a random subject line using faker
   */
  static generateRandomSubject(): string {
    return `${faker.lorem.words(3)} - ${faker.string.alphanumeric({ length: 6 })}`;
  }

  /**
   * Generates a French translation for testing
   */
  static generateFrenchSubject(): string {
    return `${TEST_PREFIXES.FRENCH_PREFIX} - ${faker.string.alphanumeric({ length: 6 })}`;
  }

  /**
   * Generates test data for specific template
   */
  static generateTemplateSubject(template: 'mustRead' | 'follow' | 'alerts'): string {
    const prefixes = {
      mustRead: TEST_PREFIXES.MUST_READ_PREFIX,
      follow: TEST_PREFIXES.FOLLOW_PREFIX,
      alerts: TEST_PREFIXES.ALERTS_PREFIX,
    };
    return this.generateUniqueSubject(prefixes[template]);
  }

  /**
   * Generates a custom subject line based on template with faker-generated suffix
   * @param baseTemplate - The base template text (e.g., "A 'must read' requires your attention")
   * @returns A unique subject line based on the template
   */
  static generateCustomSubjectLine(baseTemplate: string): string {
    const randomSuffix = faker.string.alphanumeric({ length: 8 });
    return `${baseTemplate} - ${randomSuffix}`;
  }

  /**
   * Generates an edited version of a translated text
   * @param translatedText - The translated text to edit
   * @returns An edited version of the translated text
   */
  static generateEditedTranslation(translatedText: string): string {
    const randomSuffix = faker.string.alphanumeric({ length: 6 });
    return translatedText.replace(/\.$/, `-edited-${randomSuffix}.`);
  }

  /**
   * Generates a versioned subject line (e.g., "A 'must read' requires your attention — v2")
   * @param baseTemplate - The base template text
   * @param version - The version number (e.g., "v2", "v3")
   * @returns A versioned subject line
   */
  static generateVersionedSubjectLine(baseTemplate: string, version: string): string {
    return `${baseTemplate} — ${version}`;
  }

  /**
   * Generates a single test email address
   */
  static generateTestEmail(): string {
    const username = faker.internet.userName().toLowerCase();
    return `${username}@simpplr.com`;
  }

  /**
   * Generates an invalid email for validation testing
   */
  static generateInvalidEmail(): string {
    return faker.string.alphanumeric({ length: 8 });
  }
}

export const LOCATOR_TEST_IDS = {
  OVERRIDE_ROW: TEST_IDS.OVERRIDE_ROW,
  DATA_GRID_ROW: TEST_IDS.DATA_GRID_ROW,
} as const;

export const RADIO_VALUES = {
  SUMMARIZED_DIGEST: 'SUMMARIZED_DIGEST',
} as const;

// Centralized email test data for this module
export const TEST_EMAILS = {
  SINGLE_VALID: 'krishna.singh@simpplr.com',
  SINGLE_INVALID: 'adafadfaf',
  MULTI_VALID_CSV: 'krishna.singh@simpplr.com, krishna.singh+1@simpplr.com, krishna.singh+2@simpplr.com',
} as const;

// Page text constants to avoid hardcoded strings in test cases
export const PAGE_TEXT = {
  NOTIFICATION_CUSTOMIZATION: {
    TITLE: 'Notification customization',
    DESCRIPTION:
      "Edit the default subject line for specific email notifications. Use custom text with dynamic variables to better suit your organization's voice.",
    DESCRIPTION_PARTIAL: 'Edit the default subject line for specific email notifications', // First part for partial matching
    ADD_CUSTOMIZATION_BUTTON: 'Add customization',
  },
  ADD_CUSTOMIZATION: {
    TITLE: 'Add customization',
    SUBHEADING:
      'Create custom subject lines for your email notifications. Personalize each message with recipient fields.',
    SUBHEADING_PARTIAL: 'Create custom subject lines for your email notifications', // First part for partial matching
    STEPPER_STEPS: {
      SELECT_NOTIFICATION: 'Select notification',
      OVERRIDE_CONFIRMATION: 'Override and confirmation',
      MANAGE_TRANSLATIONS: 'Manage translations',
    },
    SEARCH_PLACEHOLDER: 'Search…',
    DEFAULTS_BREADCRUMB: 'Defaults',
    BUTTONS: {
      NEXT: 'Next',
      CANCEL: 'Cancel',
    },
  },
} as const;

// Template type constants to avoid hardcoding in test cases
export const TEMPLATE_TYPES = {
  MUST_READ: 'mustRead',
  FOLLOW: 'follow',
  ALERTS: 'alerts',
} as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[keyof typeof TEMPLATE_TYPES];

// UI text constants for Override and confirmation step
export const OVERRIDE_CONFIRMATION_TEXT = {
  SECTION_HEADER: 'Subject line',
  DEFAULT_SUBJECT_LABEL: 'Default subject line',
  CUSTOM_SUBJECT_LABEL: 'Custom subject line',
  HELPER_TEXT: 'Enter the subject line for the email. Personalize it by adding recipient fields.',
  VIEW_BEST_PRACTICES: 'View best practices',
  TIPS_HEADING: 'Tips for Custom Subject Lines',
  TIPS_BULLET_POINTS: [
    'Use dynamic values for personalization (e.g., [Person X] liked [your] post).',
    'Compare with the default to include all key info.',
    'Keep it concise—30–50 characters or under 10 words.',
    'Be clear and action-oriented.',
    'Avoid spammy words and excessive punctuation.',
  ],
} as const;

// Radio button names for subject line options
export const SUBJECT_LINE_RADIO_NAMES = {
  DEFAULT: 'Default subject line',
  CUSTOM: 'Custom subject line',
} as const;

// UI text constants for Manage translations step
export const MANAGE_TRANSLATIONS_TEXT = {
  LANGUAGE_DROPDOWN_LABEL: 'Language',
  DEFAULT_LANGUAGE: 'English (US)',
  DEFAULT_LANGUAGE_BUTTON_NAME: 'Language English (US) (main)',
  CUSTOM_SUBJECT_LABEL: 'Custom subject line',
  CUSTOM_SUBJECT_HELPER: 'Enter the subject line for this notification.',
  SEND_TEST_HEADING: 'Send yourself a test',
  SEND_TEST_HELPER: 'Preview the notification by sending a test to yourself or choose a different email address.',
  DIFFERENT_EMAIL_HELPER: 'Commas can be used to send to multiple recipients.',
  YOUR_EMAIL_OPTION: 'Your email address',
  DIFFERENT_EMAIL_OPTION: 'Different email address',
  SEND_TEST_BUTTON: 'Send test',
  SAVE_BUTTON: 'Save',
  CANCEL_BUTTON: 'Cancel',
  AUTOMATIC_TRANSLATION_TEXT: 'Automatic translations - powered by Google Translate',
  MANUAL_TRANSLATIONS_SWITCH: 'Manual translations',
} as const;

// Language constants for translation testing
export const LANGUAGES = {
  HINDI: 'हिंदी - Hindi',
  FRENCH: 'Français - French',
  SPANISH: 'Español - Spanish',
  ENGLISH_US: 'English (US) (main)',
} as const;

// Languages array for parameterized testing
export const LANGUAGES_FOR_AUTOMATIC_TRANSLATION = [LANGUAGES.HINDI, LANGUAGES.FRENCH] as const;

// Expected count constants for search functionality testing
export const EXPECTED_COUNTS = {
  BASE_COUNT: 34, // Total notification types/templates on the Add customization page
  EMPTY_SEARCH: 0, // No results for non-matching search
  MUST_SEARCH: 1, // Expected count for "Must" search on Add customization page
  ALERTS_SEARCH: 1, // Expected count for "Alerts" search on Add customization page
} as const;

// Search term constants for search functionality testing
export const SEARCH_TERMS = {
  MUST: 'Must',
  ALERTS: 'Alerts',
  NO_MATCH: 'XYZ123NonExistent',
} as const;

// Dynamic value constants for testing
export const DYNAMIC_VALUE_TEXT = {
  ADD_DYNAMIC_VALUE_BUTTON: 'Add dynamic value',
  DROPDOWN_TRIGGER: 'Select...',
  DYNAMIC_VALUES_PICKER_TITLE: 'Dynamic values',
  ALERT_MESSAGE_OPTION: 'Alert Message',
  ALERT_MESSAGE_TOKEN: '{{message}}',
  COUNT_TOKEN: '{{count}}',
  RECIPIENT_FIRST_NAME_OPTION: 'Recipient First Name',
  RECIPIENT_LAST_NAME_OPTION: 'Recipient Last Name',
  // Tokens are inferred from implementation; update here if backend token format changes
  RECIPIENT_FIRST_NAME_TOKEN: '{{recipientFirstName}}',
  RECIPIENT_LAST_NAME_TOKEN: '{{recipientLastName}}',
} as const;

// Timestamp constants for "Last modified" field verification
export const TIMESTAMP_TEXT = {
  A_FEW_SECONDS_AGO: 'a few seconds ago',
  IN_A_FEW_SECONDS: 'in a few seconds',
  AGO: 'ago', // Partial match for any timestamp containing "ago"
} as const;

// Notification category names for panel verification
export const NOTIFICATION_CATEGORIES = [
  'Must reads',
  'Alerts',
  'Expertise',
  'Follows',
  'Replies to my posts or comments',
  'Replies to a post you liked',
  'Mentions or posts to you',
  'Replies after you',
  'Likes your post, reply or comment',
  'Shares your post',
  'Membership requests',
  'Knowledge content expiration',
  'Knowledge content validation',
  'Content submissions',
  'Feedback',
  'Content notifications',
  'Comments on my content',
  'Likes or shares on my content',
  'Updates and invites to events',
  'RSVP confirmation',
  'New responses to events',
  'Recognition of direct reports',
  'Award nominations open',
  'Award nominations closing',
  'Managed awards',
  'Recipient of award',
  'Recipient of recognition',
  'Digest email',
  'Personalized content email',
  'Onboarding email',
  'Daily summary',
  'Site analytics report email',
  'Recipient of poll',
] as const;

// Notification category headers and subheaders (descriptions)
export const NOTIFICATION_CATEGORY_HEADERS_AND_SUBHEADERS = [
  {
    header: 'Must reads',
    subheader:
      'Get notified if important content is marked as must-read and requires confirmation that you have read it',
  },
  {
    header: 'Alerts',
    subheader: 'Get notified if an alert is published which applies to you',
  },
  {
    header: 'Expertise',
    subheader: 'Get notified if someone adds a new expertise to your profile or endorses you for a new expertise',
  },
  {
    header: 'Follows',
    subheader: 'Get notified if someone starts following you',
  },
  {
    header: 'Replies to my posts or comments',
    subheader:
      "Get notified if someone replies directly to a post you've made in the feed or a comment you've made on some content",
  },
  {
    header: 'Replies to a post you liked',
    subheader: 'Get notified if someone replies on a feed post or comment that you have liked',
  },
  {
    header: 'Mentions or posts to you',
    subheader: 'Get notified if someone @mentions you in a feed post, comment or reply or posts directly to you',
  },
  {
    header: 'Replies after you',
    subheader: 'Get notified if someone replies after you to the same feed post or comment',
  },
  {
    header: 'Likes your post, reply or comment',
    subheader: "Get notified if someone likes a feed post, comment or reply that you've written",
  },
  {
    header: 'Shares your post',
    subheader: 'Get notified if someone shares your feed post',
  },
  {
    header: 'Membership requests',
    subheader: 'Get notified if a request you made to join a site has been approved',
  },
  {
    header: 'Knowledge content expiration',
    subheader:
      'Knowledge content requires validation periodically to ensure content remains correct. These are notifications for when content you manage has been unpublished due to expired validation.',
  },
  {
    header: 'Knowledge content validation',
    subheader:
      'Knowledge content requires validation periodically to ensure content remains correct. These are notifications for when content you manage requires that you review and validate to remain published',
  },
  {
    header: 'Content submissions',
    subheader: 'Get notified if content you have submitted is either approved or rejected',
  },
  {
    header: 'Feedback',
    subheader: 'Get notified if a user gave feedback on content that you authored or have notifications enabled for',
  },
  {
    header: 'Content notifications',
    subheader: 'Get notified if an important message has been added to content in a site that you follow',
  },
  {
    header: 'Comments on my content',
    subheader:
      'Get notified if someone comments directly on content that you authored or have notifications enabled for',
  },
  {
    header: 'Likes or shares on my content',
    subheader: 'Get notified if someone likes or shares content that you authored or have notifications enabled for',
  },
  {
    header: 'Updates and invites to events',
    subheader: 'Get notified if you are invited to an event, or if an event you organize or attend is updated',
  },
  {
    header: 'RSVP confirmation',
    subheader: "Receive a confirmation email if you successfully RSVP'd to an event",
  },
  {
    header: 'New responses to events',
    subheader: 'Get notified if an event you organize receives new responses',
  },
  {
    header: 'Recognition of direct reports',
    subheader: 'Get notified when your direct reports receive recognition',
  },
  {
    header: 'Award nominations open',
    subheader: 'Get notified when an award is available to nominate on',
  },
  {
    header: 'Award nominations closing',
    subheader: 'Get notified that an award you can nominate on is closing soon',
  },
  {
    header: 'Managed awards',
    subheader: 'Get notified of updates on awards you manage',
  },
  {
    header: 'Recipient of award',
    subheader: 'Get notified when you receive an award',
  },
  {
    header: 'Recipient of recognition',
    subheader: 'Get notified when you receive recognition',
  },
  {
    header: 'Digest email',
    subheader: 'A digest email of feed posts and activity from sites a user follows',
  },
  {
    header: 'Personalized content email',
    subheader: 'An email of content recommendations that are most relevant to a user',
  },
  {
    header: 'Onboarding email',
    subheader: 'A summary email of the latest onboarding content curated for new hires',
  },
  {
    header: 'Daily summary',
    subheader: 'Receive email notifications summarized in a single daily email',
  },
  {
    header: 'Site analytics report email',
    subheader: 'Reports and statistics on site engagement managed by a user (sent to site owners and managers)',
  },
  {
    header: 'Recipient of poll',
    subheader: 'Get notified when you receive a poll',
  },
] as const;

// Templates for key notification categories
export const NOTIFICATION_CATEGORY_TEMPLATES = {
  MUST_READS: {
    header: 'Must reads',
    subheader:
      'Get notified if important content is marked as must-read and requires confirmation that you have read it',
    templates: ["A 'must read' requires your attention", "{{count}} 'must read' requires your attention"],
  },
  ALERTS: {
    header: 'Alerts',
    subheader: 'Get notified if an alert is published which applies to you',
    templates: ['New Alert - {{message}}'],
  },
  FOLLOWS: {
    header: 'Follows',
    subheader: 'Get notified if someone starts following you',
    templates: ['{{name}} started following you'],
  },
  DIGEST_EMAIL: {
    header: 'Digest email',
    subheader: 'A digest email of feed posts and activity from sites a user follows',
    templates: ['Your weekly feed digest for {{appName}}', 'Your daily feed digest for {{appName}}'],
  },
  DAILY_SUMMARY: {
    header: 'Daily summary',
    subheader: 'Receive email notifications summarized in a single daily email',
    templates: ['Your summarized email notifications for {{appName}}'],
  },
} as const;
