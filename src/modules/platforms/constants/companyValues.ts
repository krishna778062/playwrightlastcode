/**
 * Constants for Company Values-related operations
 */

// Company Value Test Data
export const COMPANY_VALUE_TEST_DATA = {
  BASE_NAME: 'Accountability',
  DESCRIPTION: 'Accountability: Each of us is responsible for our words, our actions, and our results.',
  UPDATED_DESCRIPTION: 'UpdateDescription',
  UPDATED_PREFIX: 'UpdateAccountability',
} as const;

// Long test strings for validation
export const COMPANY_VALUE_VALIDATION_STRINGS = {
  LONG_VALUE:
    'TESTING MORE THAN HUNDRED CHARACTERS IN COMPANY VALUE FIELD MUST GIVE ERROR MESSAGE - Must not exceed 100 characters',
  LONG_DESCRIPTION:
    'TESTING MORE THAN FIVE HUNDRED CHARACTERS IN COMPANY VALUE DESCRIPTION FIELD MUST GIVE ERROR MESSAGE - Must not exceed 500 characters  TESTING MORE THAN FIVE HUNDRED CHARACTERS IN COMPANY VALUE DESCRIPTION FIELD MUST GIVE ERROR MESSAGE - Must not exceed 500 characters  TESTING MORE THAN FIVE HUNDRED CHARACTERS IN COMPANY VALUE DESCRIPTION FIELD MUST GIVE ERROR MESSAGE - Must not exceed 500 characters TESTING MORE THAN FIVE HUNDRED CHARACTERS IN COMPANY VALUE DESCRIPTION FIELD MUST GIVE ERROR MESSAGE - Must not exceed 500 characters',
} as const;

// Success Messages
export const COMPANY_VALUE_SUCCESS_MESSAGES = {
  ADDED: 'Company value added successfully',
  UPDATED: 'Company value updated successfully',
  DISABLED: 'Company value disabled successfully',
  ENABLED: 'Company value enabled successfully',
} as const;

// Error Messages
export const COMPANY_VALUE_ERROR_MESSAGES = {
  EXCEED_100_CHARACTERS: 'Must not exceed 100 characters',
  EXCEED_500_CHARACTERS: 'Must not exceed 500 characters',
  VALUE_REQUIRED: 'Value is a required field',
  DUPLICATE: 'Company value already exists',
} as const;

// Modal Text
export const COMPANY_VALUE_MODAL_TEXT = {
  DISABLE_HEADING: 'Disable company value',
  DISABLE_CONFIRMATION: 'Are you sure you want to disable',
  DISABLE_INFO_1:
    'Historical usage data against this company value will remain available in various dashboards on your intranet.',
  DISABLE_INFO_2: 'The company value can be enabled again at a later date.',
} as const;

// Button Names
export const COMPANY_VALUE_BUTTONS = {
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  CLOSE: 'Close',
  ADD: 'Add',
  UPDATE: 'Update',
} as const;

// Three Dots Menu Options
export const COMPANY_VALUE_MENU_OPTIONS = {
  EDIT: 'Edit',
  DISABLE: 'Disable',
  ENABLE: 'Enable',
} as const;
