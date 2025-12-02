/**
 * Test data constants for Custom Apps functionality
 * Centralized test data for consistent testing across custom apps tests
 */
export const CUSTOM_APPS_TEST_DATA = {
  /**
   * Box OAuth2 App Configuration
   */
  BOX_OAUTH_APP: {
    NAME_PREFIX: 'Box Custom App',
    DESCRIPTION: 'Box Custom App',
    CATEGORY: 'Other',
    LOGO_FILE: 'Jira_Custom_App.jpg',
    CONNECTION_TYPE: 'App level',
    AUTH_TYPE: 'OAuth 2.0',
    SUB_AUTH_TYPE: 'Auth Code',
    CLIENT_ID: 'vi2gno1gm1nwelijoyujzzo46ck4e8my',
    CLIENT_SECRET: 'p0JWVo13f7FMlm3mfBz19FOJoN5wVUYr',
    AUTH_URL: 'https://account.box.com/api/oauth2/authorize',
    TOKEN_URL: 'https://api.box.com/oauth2/token',
    BASE_URL: 'https://api.box.com',
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
  },

  /**
   * App Categories
   */
  CATEGORIES: {
    OTHER: 'Other',
    FILE_STORAGE: 'File storage',
    CALENDAR: 'Calendar',
    CRM: 'CRM',
  },

  /**
   * Connection Types
   */
  CONNECTION_TYPES: {
    APP_LEVEL: 'App level',
    USER_LEVEL: 'User level',
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
    CLIENT_CREDENTIALS: 'Client Credentials',
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
} as const;
