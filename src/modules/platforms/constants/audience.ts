/**
 * Constants for Audience-related operations
 */

// Audience Types/Attributes
export const AUDIENCE_TYPES = {
  OKTA: 'okta',
  AD_GROUP: 'ad_group',
  MICROSOFT_ENTRA_ID: 'microsoft_entra_id',
  COUNTRY_NAME: 'country_name',
  START_DATE: 'start_date',
} as const;

// Operators
export const OPERATORS = {
  ALL: 'ALL',
  IS: 'IS',
  IS_NOT: 'IS_NOT',
  CONTAINS: 'CONTAINS',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
  BETWEEN: 'BETWEEN',
  ON: 'ON',
  ON_OR_BEFORE: 'ON_OR_BEFORE',
  ON_OR_AFTER: 'ON_OR_AFTER',
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
} as const;

// AD Group Types
export const AD_GROUP_TYPES = {
  ALL: 'ALL',
  DISTRIBUTION: 'distribution',
  SECURITY: 'security',
  MICROSOFT_365: 'microsoft_365',
  MICROSOFT365: 'microsoft365',
  MAIL_SECURITY: 'mail_security',
  MAIL_SECURITY_DASH: 'mail-security',
  BUILT_IN: 'BUILT_IN',
} as const;

// Field Types
export const FIELD_TYPES = {
  REGULAR: 'regular',
  OKTA_GROUP: 'oktaGroup',
  AD_GROUP: 'adGroup',
} as const;

// Test Data Prefixes
export const TEST_DATA_PREFIXES = {
  UI_AUDIENCE: 'UI_',
  API_AUDIENCE: 'API_',
  UI_CATEGORY: '0123_UI_Category_',
  API_CATEGORY: '001_Audience_UI_Category_',
  DESCRIPTION: 'desc-',
  IS_NOT: 'API_IS_NOT_',
  IS: 'API_IS_',
  ALL: 'API_ALL_',
  STARTS_WITH: 'UI_STARTS_WITH_',
  ENDS_WITH: 'UI_ENDS_WITH_',
  CONTAINS: 'UI_CONTAINS_',
  COUNTRY: 'UI_COUNTRY_',
} as const;

// Country Values
export const COUNTRY_VALUES = {
  INDIA: 'India',
} as const;

// Page States
export const PAGE_STATES = {
  DOMCONTENTLOADED: 'domcontentloaded',
} as const;

// Method Names
export const METHOD_NAMES = {
  FILL_COUNTRY_OPERATOR_VALUE: 'fillCountryOperatorValue',
  FILL_DATE_OPERATOR_VALUE: 'fillDateOperatorValue',
} as const;
