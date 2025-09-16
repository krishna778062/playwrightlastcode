export const ACTION_LABELS = {
  CREATE: 'Create',
  READ: 'Read',
  UPDATE: 'Update',
  DELETE: 'Delete',
  REMOVE: 'Remove',
  EDIT: 'Edit',
  VIEW: 'View',
  CANCEL: 'Cancel',
  ENABLE: 'Enable',
  DISABLE: 'Disable',
  ADD: 'Add',
  CONNECT_ACCOUNT: 'Connect account',
  DISCONNECT_ACCOUNT: 'Disconnect account',
} as const;

export const UI_ACTIONS = {
  SAVE: 'Save',
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  EDIT: 'Edit',
  DELETE: 'Delete',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  ADD_TO_HOME: 'Add to home',
  ADD_TO_SITE: 'Add to site dashboard',
} as const;

export const DASHBOARD_BUTTONS = {
  ADD_TILE: 'Add tile',
  APP_TILES: 'App tiles',
  SAVE: 'Save',
  REMOVE: 'Remove',
  DONE: 'Done',
  EDIT: 'Edit',
} as const;

export const ORGANIZATION_SETTINGS = {
  USER_DEFINED: 'User defined',
  APP_MANAGER_DEFINED: 'App manager defined',
} as const;

export const FIELD_NAMES = {
  ORGANIZATION: 'Organization',
  STATUS: 'Status',
  SORT_BY: 'Sort by',
  SORT_ORDER: 'Sort order',
} as const;

export const DEFAULT_SITES = {
  AUTOMATION_PUBLIC: 'Automation_PublicSiteS',
} as const;

export enum ActionType {
  Add = 'Add',
  Create = 'Create',
  Read = 'Read',
  Update = 'Update',
  Edit = 'Edit',
  Delete = 'Delete',
  Remove = 'Remove',
  View = 'View',
  Save = 'Save',
  Submit = 'Submit',
  Cancel = 'Cancel',
  Download = 'Download',
  Upload = 'Upload',
  Closed = 'Closed',
}

export const NAVIGATION_LABELS = {
  MANAGE_APPLICATION_TEXT: 'Application',
  SITES: 'Sites',
  HTML: 'HTML',
  MANAGE_LINK: 'Manage',
  USER_MODE_LABEL: 'User mode',
  MUST_READS_LABEL: 'Must reads',
  FAVORITES_LABEL: 'Favorites',
  MANAGE_LABEL: 'Manage',
  EVENTS_LABEL: 'Events',
  EXIT_APP_SETTINGS_MESSAGE: 'Exit application settings',
  MANAGE_FEATURES_LABEL: 'Manage features',
  APPLICATIONS_LABEL: 'Applications',
  APPLICATION_SETTINGS_LABEL: 'Application settings',
} as const;

export const APP_LABELS = {
  PREBUILT_APP_LABEL: 'Prebuilt app',
  ADD_PREBUILT_APP_LABEL: 'Add prebuilt app',
  ADD_CUSTOM_APP_LABEL: 'Add custom app',
  DELETE_CUSTOM_APP_LABEL: 'Delete custom app',
  ADD_LABEL: 'Add',
  CONNECT_ACCOUNT_LABEL: 'Connect account',
  DISCONNECT_ACCOUNT_LABEL: 'Disconnect account',
  ENABLE_LABEL: 'Enable',
  DISABLE_LABEL: 'Disable',
  DELETE_LABEL: 'Delete',
} as const;

export const AD_GROUP = {
  AD_GROUP_OPTION: 'Use Microsoft Entra ID groups',
  GROUP_BUTTON: 'Select Microsoft Entra ID groups',
  GROUP_NAME1: 'Analytics-Insights',
  GROUP_NAME2: 'App-Access-Salesforce',
  ADDED_MESSAGE: 'Added',
  COUNT: '1',
  DONE_BUTTON: 'Done',
  SAVE_BUTTON: 'Save',
  DO_NOT_CREATE_AUDIENCES: 'Do not create audiences',
  CREATE_AUDIENCES: 'Create audiences',
  TYPE: 'type',
  DISCONNECT_BUTTON: 'Disconnect your Microsoft Entra ID account',
  CONFIRM_MESSAGE: 'Disconnect Microsoft Entra ID account',
} as const;
