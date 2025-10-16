/**
 * Test data constants for Custom App Tiles functionality
 * Centralized test data for consistent testing across custom app tiles tests
 */
export const CUSTOM_APP_TILES_TEST_DATA = {
  TILE_TYPES: {
    DISPLAY: 'Display',
    FORM: 'Form',
    HYBRID: 'Hybrid',
  },

  APPS: {
    JIRA_CUSTOM_APP_BASIC_AUTH: 'Jira Custom App Basic Auth',
  },

  API_ACTIONS: {
    CREATE_TICKET: 'Create ticket',
  },

  BUTTONS: {
    PREVIEW: 'Preview',
    NEXT: 'Next',
    SAVE: 'Save',
  },

  FORM_FIELDS: {
    TILE_NAME_PREFIX: 'Test Tile',
    TILE_DESCRIPTION_PREFIX: 'Test Description',
  },
} as const;

/**
 * Default test configuration for custom app tiles
 */
export const DEFAULT_CUSTOM_APP_TILE_CONFIG = {
  tileType: CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
  app: CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
  apiAction: CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET,
  previewButton: CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PREVIEW,
  nextButton: CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT,
} as const;
