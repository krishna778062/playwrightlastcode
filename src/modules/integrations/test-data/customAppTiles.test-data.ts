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
    ZENDESK: 'Zendesk',
  },

  API_ACTIONS: {
    CREATE_TICKET: 'Create ticket',
    LIST_ALL_TICKETS: 'List all tickets',
    GET_PRIORITIES: 'Get Priorities',
    GET_TICKETS: 'Get Tickets',
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
    ICON_URL: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png',
    ICON_URL_2: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    IMAGE_URL: 'newintegrations.qa.simpplr.xyz/content/o',
    CLICK_HERE: 'Click Here',
  },

  TEST_FILES: {
    JIRA_CUSTOM_APP_IMAGE: 'Jira_Custom_App.jpg',
  },

  LINK_COMPONENT: {
    TEXT_STYLES: {
      DATA_LARGE: 'Data large',
      DATA_MEDIUM: 'Data medium',
      DATA_SMALL: 'Data small',
      HEADING_LARGE: 'Heading large',
      HEADING_MEDIUM: 'Heading medium',
      HEADING_SMALL: 'Heading small',
      SECONDARY: 'Secondary',
      BODY: 'Body',
    },
    TEXT_STYLE_HEIGHTS: {
      DATA_LARGE: 18,
      DATA_MEDIUM: 14,
      DATA_SMALL: 10,
      HEADING_LARGE: 28,
      HEADING_MEDIUM: 22,
      HEADING_SMALL: 19,
    },
    ALIGNMENT: {
      LEFT: 'left',
      CENTER: 'center',
      RIGHT: 'right',
    },
    MAX_LINE_COUNT: {
      ONE: '1',
      TWO: '2',
      THREE: '3',
      NONE: 'None',
    },
    COLORS: {
      ADVANCED_COLOR_TYPES: {
        CUSTOM: 'Custom',
        BRAND: 'Brand',
        SYSTEM_DARKEST: 'System darkest',
        SYSTEM_LIGHT: 'System light',
        SYSTEM_DARK: 'System dark',
      },
      HEX: {
        RED: '#FF0000',
        GREEN: '#00FF00',
        BLUE: '#0066CC',
        CYAN: '#00CCFF',
      },
      RGB: {
        RED: 'rgb(255, 0, 0)',
        BLUE: 'rgb(0, 102, 204)',
      },
    },
    URLS: {
      EXAMPLE: 'https://www.example.com',
      GOOGLE: 'https://www.google.com',
      INVALID_FORMAT: 'invalid-url-format',
    },
    VISIBILITY_RULES: {
      ACTIVE_STATUS: "return apiData.status === 'active';",
      ALWAYS_TRUE: 'return true;',
      ALWAYS_FALSE: 'return false;',
      INVALID_SYNTAX: 'return apiData.status ===',
    },
    TRANSFORM_TYPES: {
      VALUE_MAPPING: 'Value mapping',
      CASE_FORMAT: 'Case format',
      DATE_FORMAT: 'Date format',
    },
    CASE_FORMAT_OPTIONS: {
      LOWERCASE: 'Lowercase',
      UPPERCASE: 'Uppercase',
      SENTENCE_CASE: 'Sentence case',
    },
    DATE_FORMAT_OPTIONS: {
      MM_DD_YYYY: 'MM/DD/YYYY',
      MM_DD_YY: 'MM/DD/YY',
      MONTH_DAY_YEAR: 'Month Day, Year',
    },
    TEST_TEXT: {
      DEFAULT_LINK: 'Link…',
      TEST_LINK: 'Test Link',
      PERSISTENT_LINK: 'Persistent Link',
      PRIORITY: 'Priority',
      LONG_TEXT_PREFIX: 'This is a very long link text',
      LONG_TEXT_FULL: 'This is a very long link text that should wrap to multiple lines when None is selected',
      SPECIAL_CHARS: 'Link with special chars: @#$%^&*()_+-=[]{}|;\':",./<>?',
      UNICODE: 'Link with emoji 🚀 and unicode: 中文 العربية русский',
      WHITESPACE: '   \n   \n   ',
      LONG_TEXT_REPEAT_COUNT: 250,
    },
    DATA_BINDING: {
      TICKET_TITLE: 'apiData.ticket.title',
      TICKET_FIELD_OBJECT: 'object ticket_field',
      TICKET_FIELD_TITLE: 'string title',
      TICKET_FIELD_URL: 'string url',
      TICKET_FIELD_CREATED_AT: 'string created_at',
    },
    EXPECTED_VALUES: {
      TRANSFORMED_PRIORITY_LOWERCASE: 'priority',
      TRANSFORMED_PRIORITY_UPPERCASE: 'PRIORITY',
      TRANSFORMED_PRIORITY_SENTENCE: 'Priority',
      TRANSFORMED_DATE_ISO: '2024-10-16T11:51:47Z',
      TRANSFORMED_DATE_MM_DD_YYYY: '10/16/2024',
      TRANSFORMED_DATE_MM_DD_YY: '10/16/24',
      TRANSFORMED_DATE_MONTH_DAY_YEAR: 'Oct 16, 2024',
    },
    DIALOG_TITLES: {
      ADVANCED_SETTINGS: 'Advanced settings',
    },
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
