export const ACTION_LABELS = {
  CREATE: 'Create',
  READ: 'Read',
  UPDATE: 'Update',
  DELETE: 'Delete',
  REMOVE: 'Remove',
  EDIT: 'Edit',
  VIEW: 'View',
  CANCEL: 'Cancel',
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
