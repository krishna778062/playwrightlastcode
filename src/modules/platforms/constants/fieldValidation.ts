/**
 * Field validation constants for form inputs
 * Used across multiple components and popups for consistent validation
 */

export const FIELD_MAX_LENGTHS = {
  // Category field lengths
  CATEGORY_NAME: 100,
  CATEGORY_DESCRIPTION: 1024,

  // Common field lengths - can be extended for other popups
  STANDARD_NAME: 100,
  STANDARD_DESCRIPTION: 1024,
  SHORT_TEXT: 50,
  LONG_TEXT: 2000,
} as const;

export const FIELD_VALIDATION = {
  MAX_LENGTHS: FIELD_MAX_LENGTHS,
} as const;
