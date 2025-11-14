import { MESSAGES } from '@integrations-constants/messageRepo';

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
    SERVICENOW_CUSTOM_APP: 'Servicenow Custom App',
    AIRTABLE: 'Airtable',
  },

  API_ACTIONS: {
    CREATE_TICKET: 'Create ticket',
    LIST_ALL_TICKETS: 'List all tickets',
  },

  BUTTONS: {
    PREVIEW: 'Preview',
    NEXT: 'Next',
    SAVE: 'Save',
    PUBLISH: 'Publish',
    RUN: 'Run',
    DONE: 'Done',
    GET_API_RESPONSE: 'Get API response',
    CONFIGURE_API_ACTION: 'Configure API action',
    CANCEL: 'Cancel',
    CONFIRM: 'Confirm',
    DELETE: 'Delete',
    EDIT: 'Edit',
    SHOW_MORE: 'Show more',
  },

  FORM_FIELDS: {
    TILE_NAME_PREFIX: 'Test Tile',
    TILE_DESCRIPTION_PREFIX: 'Test Description',
    EMAIL: 'Email',
    SUMMARY: 'Summary',
    DESCRIPTION: 'Description',
  },

  CANVAS_COMPONENTS: {
    IMAGE_TEXT_ROWS: 'Image and text rows',
    IMAGE_TEXT_COLUMNS: 'Image and text columns',
    TEXT_ONLY_ROWS: 'Text-only rows',
    CONTAINER: 'Container',
    TEXT: 'Text',
    IMAGE: 'Image',
    FORM: 'Form',
  },

  IMAGE_SIZES: {
    SMALL: 'Small',
    MEDIUM: 'Medium',
    LARGE: 'Large',
  },

  TEXT_SIZES: {
    DATA_SMALL: 'Small',
    DATA_MEDIUM: 'Medium',
    DATA_LARGE: 'Data large',
  },

  FORM_BEHAVIOR: {
    DISPLAY_IN_TILE: 'Display in tile',
    DISPLAY_IN_OVERLAY: 'Display in overlay',
  },

  TILE_STATUS: {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
  },

  SEARCH_TERMS: {
    JIRA_TEST: 'Test Tile',
    NO_RESULTS: 'mndfg',
    APPS_SEARCH: 'text',
    NO_APPS_RESULTS: 'zxyxz',
  },

  FIELD_TYPES: {
    LABEL: 'Label',
    LINK: 'Link',
    IMAGE: 'Image',
  },

  DYNAMIC_VALUES: {
    ISSUES: 'issues',
    OBJECT_0: 'object 0',
    ID: 'id',
    SELF: 'self',
    ISSUE_ID: 'issueId',
    ISSUE_KEY: 'issueKey',
  },

  INITIAL_DISPLAY_COUNTS: {
    COUNT_8: '8',
  },

  EXTERNAL_URLS: {
    GOOGLE: 'https://www.google.com/',
    CLICK_HERE: 'Click Here',
  },

  TEST_FILES: {
    JIRA_CUSTOM_APP_IMAGE: 'Jira_Custom_App.jpg',
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

/**
 * Form tile configuration
 */
export const FORM_TILE_CONFIG = {
  tileType: CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM,
  app: CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
  apiAction: CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET,
  formBehavior: CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_OVERLAY,
} as const;

/**
 * Display tile configuration
 */
export const DISPLAY_TILE_CONFIG = {
  tileType: CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
  app: CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
  apiAction: CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS,
  canvasComponent: CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.IMAGE_TEXT_ROWS,
} as const;

/**
 * Canvas verification data
 */
export const IMAGE_ASPECT_RATIO_16_9 = {
  SMALL_IMAGE_SIZE: {
    WIDTH: '160',
    HEIGHT: 56,
  },
  MEDIUM_IMAGE_SIZE: {
    WIDTH: '245',
    HEIGHT: 90,
  },
  LARGE_IMAGE_SIZE: {
    WIDTH: '500',
    HEIGHT: 138,
  },
} as const;

export const TEXT_ASPECT_RATIO_16_9 = {
  SMALL_TEXT_SIZE: {
    WIDTH: '160',
    HEIGHT: 56,
  },
  MEDIUM_TEXT_SIZE: {
    WIDTH: '245',
    HEIGHT: 90,
  },
  LARGE_TEXT_SIZE: {
    WIDTH: '502',
    HEIGHT: 49.5,
  },
} as const;

export const IMAGE_ASPECT_RATIO_1_1 = {
  SMALL_IMAGE_SIZE: {
    WIDTH: '90',
    HEIGHT: 56,
  },
  MEDIUM_IMAGE_SIZE: {
    WIDTH: '160',
    HEIGHT: 90,
  },
  LARGE_IMAGE_SIZE: {
    WIDTH: '500',
    HEIGHT: 138,
  },
  EXPECTED_TEXT_COMPONENTS: 3,
  EXPECTED_HEADING_COMPONENTS: 1,
  EXPECTED_BODY_COMPONENTS: 2,
  MIN_ROW_CONTAINER_CHILDREN: 2,
} as const;
/**
 * Test scenarios data
 */
export const TEST_SCENARIOS = [
  {
    name: 'Display Tile with Image and Text Rows',
    description: 'Test display tile with image and text rows template',
    tileType: CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
    app: CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
    apiAction: CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS,
    canvasComponent: CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.IMAGE_TEXT_ROWS,
  },
  {
    name: 'Display Tile with Image and Text Columns',
    description: 'Test display tile with image and text columns template',
    tileType: CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
    app: CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
    apiAction: CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS,
    canvasComponent: CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.IMAGE_TEXT_COLUMNS,
  },
  {
    name: 'Form Tile with Overlay Behavior',
    description: 'Test form tile with overlay behavior',
    tileType: CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM,
    app: CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
    apiAction: CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET,
    formBehavior: CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_OVERLAY,
  },
] as const;
