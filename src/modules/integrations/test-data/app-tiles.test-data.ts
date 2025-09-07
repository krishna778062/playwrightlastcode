/**
 * Centralized connector IDs for all app tile integrations
 * Add new connector IDs here as they are implemented
 */
export const CONNECTOR_IDS = {
  AIRTABLE: '51a2e31b-af80-4bc6-a1ff-8839f2fb6eee',
  EXPENSIFY: 'e576282c-58b3-423b-8b9f-3d6f9f538ded',
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
