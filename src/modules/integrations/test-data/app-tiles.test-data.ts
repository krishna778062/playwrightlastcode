/**
 * Centralized connector IDs for all app tile integrations
 * Add new connector IDs here as they are implemented
 */
export const CONNECTOR_IDS = {
  AIRTABLE: '51a2e31b-af80-4bc6-a1ff-8839f2fb6eee',
  EXPENSIFY: 'e576282c-58b3-423b-8b9f-3d6f9f538ded',
  GITHUB: '9099f0b6-55ee-425b-b790-3231f750e7c7',
} as const;

/**
 * Tile IDs for specific app tiles
 */
export const TILE_IDS = {
  GITHUB_MY_OPEN_PRS: '8f82cbb1-56a6-4455-80cb-85fcb778fe27',
  GITHUB_PENDING_PR_REVIEWS: '210775b7-9745-455e-9cc4-5653e40211ff',
  EXPENSIFY_REPORT: '82ca87cd-d155-46b5-92db-fcec1caf5f85',
} as const;

/**
 * Airtable tile configuration data
 * Centralized constants for consistent testing
 */
export const AIRTABLE_TILE = {
  TILE: 'Airtable',
  APP_NAME: 'Airtable',
  BASE_NAME: 'Content Calendar',
  USER_DEFINED: 'User defined',
  SORT_ORDER: 'Ascending',
  SORT_BY: 'Task name',
  BASE_ID: 'Content Calendar',
  API_BASE_ID: 'appsnmjNzZl1ygUtg',
  TABLE_ID: 'tbl5wWrenoiBW5ZiI',
} as const;

/**
 * Airtable authentication data
 * Centralized authentication constants for testing
 */
export const AIRTABLE_AUTH_DATA = {
  CODE_CHALLENGE_METHOD: 'S256',
  CLIENT_ID: '21b6baa1-399f-4d8c-aa64-b63bceee744b',
  CLIENT_SECRET: 'B0VuUeyXVKzo0ZZqkoqvjMWXCk18o5hw',
  AUTH_URL: 'https://airtable.com/oauth2/v1/authorize?scope=schema.bases:read%20data.records:read',
  TOKEN_URL: 'https://airtable.com/oauth2/v1/token',
  TOKEN_HEADERS:
    'Authorization:Basic MjFiNmJhYTEtMzk5Zi00ZDhjLWFhNjQtYjYzYmNlZWU3NDRiOjY1MjgzMzJmMWIyZWFiOWMxYjkyY2M1ZDkzNzJmMTMxYmRhZTJkNDYzZDg2MGU4Mzk5NWM2YjQ4ZmJhYmI3MmE=',
  BASE_URL: 'https://api.airtable.com',
  AUTH_CREDENTIALS: {
    EMAIL: 'howard.nelson@simpplr.dev',
    PASSWORD: 'Simpplr@1220167',
  },
} as const;

/**
 * Comprehensive app names for all supported integrations
 */
export const APP_NAMES = {
  EXPENSIFY: 'Expensify',
  AIRTABLE: 'Airtable',
  FRESHSERVICE: 'Freshservice',
  GITHUB: 'GitHub',
} as const;

/**
 * GitHub URLs for testing
 */
export const REDIRECT_URLS = {
  GITHUB: 'https://github.com/',
  EXPENSIFY: 'https://www.expensify.com/',
  AIRTABLE: 'https://airtable.com/',
} as const;

/**
 * GitHub organization names for testing
 */
export const GITHUB_ORGANIZATIONS = {
  SIMPPLR_TEST_ORG: 'simpplr-test-org',
} as const;

/**
 * Expensify authentication data
 */
export const EXPENSIFY_CREDS = {
  USER_ID: 'aa_tushar_roy_simpplr_com',
  USER_SECRET: '1cb6b45720674f10558719c18a17947937fd4723',
} as const;

/**
 * Status values for different app tiles
 */
export const STATUS_VALUES = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
} as const;
