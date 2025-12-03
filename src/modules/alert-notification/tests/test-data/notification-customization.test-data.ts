import { faker } from '@faker-js/faker';

// Simple constants for test data
const TEST_PREFIXES = {
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
} as const;

// Languages array for parameterized testing
export const LANGUAGES_FOR_AUTOMATIC_TRANSLATION = [LANGUAGES.HINDI, LANGUAGES.FRENCH, LANGUAGES.SPANISH] as const;

// Expected count constants for search functionality testing
export const EXPECTED_COUNTS = {
  BASE_COUNT: 34, // Total notification types/templates on the Add customization page
  EMPTY_SEARCH: 0, // No results for non-matching search
  MUST_SEARCH: 1, // Expected count for "Must" search on Add customization page
  ALERTS_SEARCH: 1, // Expected count for "Alerts" search on Add customization page
} as const;

// Dynamic value constants for testing
export const DYNAMIC_VALUE_TEXT = {
  ADD_DYNAMIC_VALUE_BUTTON: 'Add dynamic value',
  DROPDOWN_TRIGGER: 'Select...',
  DYNAMIC_VALUES_PICKER_TITLE: 'Dynamic values',
  ALERT_MESSAGE_OPTION: 'Alert Message',
  ALERT_MESSAGE_TOKEN: '{{message}}',
} as const;
