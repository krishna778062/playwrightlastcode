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
    RADIO_NAME: "A 'must read' requires your",
    BUTTON_NAME: 'Must reads Get notified if',
  },
  FOLLOW: {
    RADIO_NAME: 'started following you',
    BUTTON_NAME: 'Follows',
  },
  ALERTS: {
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
  SINGLE_VALID: 'qa.manager@simpplr.com',
  SINGLE_INVALID: 'adafadfaf',
  MULTI_VALID_CSV: 'kr.manager@gmail.com, qa.manager+1@simpplr.com, qa.manager+2@simpplr.com',
} as const;

// Template type constants to avoid hardcoding in test cases
export const TEMPLATE_TYPES = {
  MUST_READ: 'mustRead',
  FOLLOW: 'follow',
  ALERTS: 'alerts',
} as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[keyof typeof TEMPLATE_TYPES];
