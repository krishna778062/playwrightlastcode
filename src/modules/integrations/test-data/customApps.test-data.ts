/**
 * Test data constants for Custom Apps functionality
 * Centralized test data for consistent testing across custom apps tests
 */

/**
 * Shared credentials for external services
 */
export const CREDENTIALS = {
  BOX: {
    EMAIL: 'box2@simpplr.com',
    PASSWORD: '_Simp_1234',
  },
  JIRA: {
    USERNAME: 'bot1@simpplr.com',
    PASSWORD: 'test_password_value',
  },
  AUTH0: {
    USERNAME: 'craig.gordon@simpplr.dev',
    PASSWORD: 'Simpplr@1234',
  },
  TRELLO: {
    API_TOKEN: 'test_api_token_value',
  },
} as const;

const DEFAULT_APP_CONFIG = {
  CATEGORY: 'Other',
  LOGO_FILE: 'favicon.png',
} as const;

const BOX_OAUTH_CONFIG = {
  ...DEFAULT_APP_CONFIG,
  DESCRIPTION: 'Box Custom App',
  AUTH_TYPE: 'OAuth 2.0',
  SUB_AUTH_TYPE: 'Auth Code',
  CLIENT_ID: 'vi2gno1gm1nwelijoyujzzo46ck4e8my',
  CLIENT_SECRET: 'p0JWVo13f7FMlm3mfBz19FOJoN5wVUYr',
  AUTH_URL: 'https://account.box.com/api/oauth2/authorize',
  TOKEN_URL: 'https://api.box.com/oauth2/token',
  BASE_URL: 'https://api.box.com',
} as const;

const AUTH0_OAUTH_CONFIG = {
  ...DEFAULT_APP_CONFIG,
  AUTH_TYPE: 'OAuth 2.0',
  SUB_AUTH_TYPE: 'Auth Code with PKCE',
  CLIENT_ID: 'jQ9Iq558XPLKlVdvm9o49jUmFR0yPYaP',
  CLIENT_SECRET: 'tLRFUCQsKKql5UV-x5HST-9Wfq1tXUiIhvjMs-xlI926QEQfjM0calLGq3RB2IOj',
  AUTH_URL: 'https://clyde-noronha.us.auth0.com/authorize?scope=openid',
  TOKEN_URL: 'https://clyde-noronha.us.auth0.com/oauth/token',
  BASE_URL: 'https://clyde-noronha.us.auth0.com',
} as const;

export const CUSTOM_APPS_TEST_DATA = {
  BOX_OAUTH_APP: {
    ...BOX_OAUTH_CONFIG,
    NAME_PREFIX: 'Box Custom App',
    LOGO_FILE: 'Jira_Custom_App.jpg',
    CONNECTION_TYPE: 'App level',
  },

  BOX_USER_LEVEL_APP: {
    ...BOX_OAUTH_CONFIG,
    NAME_PREFIX: 'BoxUserLevel',
    CONNECTION_TYPE: 'User level',
  },

  BOX_DELETE_ENABLED_APP: {
    ...BOX_OAUTH_CONFIG,
    NAME_PREFIX: 'Box',
    CONNECTION_TYPE: 'App level',
  },

  BOX_APP_AND_USER_LEVEL_APP: {
    ...BOX_OAUTH_CONFIG,
    NAME_PREFIX: 'Box',
    CONNECTION_TYPE: 'App level & user level',
  },

  JIRA_BASIC_AUTH_APP: {
    ...DEFAULT_APP_CONFIG,
    NAME_PREFIX: 'Jira',
    DESCRIPTION: 'Jira Custom App',
    CONNECTION_TYPE: 'App level',
    AUTH_TYPE: 'Basic Auth',
    BASE_URL: 'https://simpplr.atlassian.net',
    USERNAME_LABEL: 'Username',
    PASSWORD_LABEL: 'Password',
  },

  TRELLO_API_TOKEN_APP: {
    ...DEFAULT_APP_CONFIG,
    NAME_PREFIX: 'TrelloAppLevel',
    DESCRIPTION: 'Trello Custom App',
    CONNECTION_TYPE: 'App level',
    AUTH_TYPE: 'API Token',
    BASE_URL: 'https://api.trello.com',
    API_TOKEN_LABEL: 'API Token',
    AUTHORIZATION_HEADER: 'Authorization',
  },

  AUTH0_PKCE_PLAIN_APP: {
    ...AUTH0_OAUTH_CONFIG,
    NAME_PREFIX: 'Auth0',
    DESCRIPTION: 'Auth0 Custom App',
    CONNECTION_TYPE: 'User level',
    CODE_CHALLENGE_METHOD: 'Plain',
  },

  AIRTABLE_PKCE_SHA256_APP: {
    ...DEFAULT_APP_CONFIG,
    NAME_PREFIX: 'Airtable (Staging)',
    DESCRIPTION: 'Airtable (Staging) Custom App',
    CONNECTION_TYPE: 'App level & user level',
    AUTH_TYPE: 'OAuth 2.0',
    SUB_AUTH_TYPE: 'Auth Code with PKCE',
    CODE_CHALLENGE_METHOD: 'SHA-256',
    CLIENT_ID: '21b6baa1-399f-4d8c-aa64-b63bceee744b',
    CLIENT_SECRET: '6528332f1b2eab9c1b92cc5d9372f131bdae2d463d860e83995c6b48fbabb72a',
    AUTH_URL: 'https://airtable.com/oauth2/v1/authorize?scope=data.records:read',
    TOKEN_URL: 'https://airtable.com/oauth2/v1/token',
    BASE_URL: 'https://api.airtable.com',
    TOKEN_REQUEST_HEADERS: 'Content-Type: application/x-www-form-urlencoded',
  },

  /**
   * Field Labels for OAuth form
   */
  FIELD_LABELS: {
    CLIENT_ID: 'Client ID',
    SECRET_KEY: 'Secret key',
    AUTH_URL: 'Auth URL',
    TOKEN_URL: 'Token URL',
    BASE_URL: 'Base URL',
    APP_NAME: 'Custom app name*',
    DESCRIPTION: 'Description*',
    API_TOKEN_LABEL: 'API token label',
    AUTHORIZATION_HEADER: 'Authorization header',
    API_TOKEN: 'API Token',
    USERNAME_LABEL: 'Username label',
    PASSWORD_LABEL: 'Password label',
  },

  /**
   * App Categories
   */
  CATEGORIES: {
    OTHER: 'Other',
    FILE_STORAGE: 'File storage',
    CALENDAR: 'Calendar',
    CRM: 'CRM',
    SUPPORT_TICKETING: 'Support & Ticketing',
  },

  /**
   * Connection Types
   */
  CONNECTION_TYPES: {
    APP_LEVEL: 'App level',
    USER_LEVEL: 'User level',
    APP_AND_USER_LEVEL: 'App level & user level',
  },

  /**
   * Auth Types
   */
  AUTH_TYPES: {
    OAUTH_2: 'OAuth 2.0',
    BASIC_AUTH: 'Basic Auth',
    API_KEY: 'API Key',
  },

  /**
   * Sub Auth Types (for OAuth 2.0)
   */
  SUB_AUTH_TYPES: {
    AUTH_CODE: 'Auth Code',
    AUTH_CODE_WITH_PKCE: 'Auth Code with PKCE',
    CLIENT_CREDENTIALS: 'Client Credentials',
  },

  /**
   * Code Challenge Methods (for PKCE)
   */
  CODE_CHALLENGE_METHODS: {
    PLAIN: 'Plain',
    SHA_256: 'SHA-256',
  },

  /**
   * Test Files
   */
  TEST_FILES: {
    JIRA_LOGO: 'Jira_Custom_App.jpg',
    BOX_LOGO: 'Box_Custom_App.png',
  },

  /**
   * Toast Messages
   */
  TOAST_MESSAGES: {
    APP_ADDED_SUFFIX: 'added',
    CONNECTED_TO_BOX: 'Connected to Box successfully',
  },

  /**
   * Form Field Names (used for verification of enabled/disabled state)
   */
  FORM_FIELD_NAMES: {
    NAME: 'name',
    DESCRIPTION: 'description',
    CATEGORY: 'category',
    CONNECTION_TYPE: 'connectionType',
    AUTH_TYPE: 'authType',
    SUB_AUTH_TYPE: 'subAuthType',
    CLIENT_ID: 'authDetails.clientId',
    CLIENT_SECRET: 'authDetails.clientSecret',
    AUTH_URL: 'authDetails.authUrl',
    TOKEN_URL: 'authDetails.tokenUrl',
    BASE_URL: 'authDetails.baseUrl',
    USERNAME_LABEL: 'authDetails.usernameLabel',
    PASSWORD_LABEL: 'authDetails.passwordLabel',
    API_TOKEN_LABEL: 'authDetails.apiTokenLabel',
    AUTHORIZATION_HEADER: 'authDetails.authorizationHeader',
  },
} as const;
