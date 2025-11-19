export enum ACG_EDIT_ASSETS {
  FEATURE = 'Edit feature',
  TARGET_AUDIENCE = 'Edit target audience',
  MANAGER = 'Edit manager',
  ADMIN = 'Edit admin',
  ADD_AUDIENCE = 'Add audience',
}

export enum ACG_STATUS {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum ACG_COLUMNS {
  NAME = 'Name',
  FEATURE = 'Feature',
  GROUP_TYPE = 'Group type',
  TARGET_AUDIENCE = 'Target audience',
  MANAGERS = 'Managers',
  ADMINS = 'Admins',
  STATUS = 'Status',
  MODIFIED = 'Modified',
}

export enum ACG_EDIT_ASSETS_SUMMARY_SCREEN {
  EDIT_FEATURE = 'Edit feature',
  EDIT_TARGET_AUDIENCE = 'Edit target audience',
  EDIT_MANAGER = 'Edit manager',
  EDIT_ADMIN = 'Edit admin',
}

export enum ACG_ERROR_MESSAGES_TITLE {
  RBAC = 'This is a default control group and only managers can be modified.',
  ABAC = 'This is a default control group. Only managers and admins can be modified.',
}

export enum ACG_TOOLTIPS {
  RBAC = 'This control group does not support audience based access control. Only managers can be modified.',
  ABAC = 'This is a default control group. Only managers and admins can be modified.',
  FEATURE_CANNOT_BE_EDITED = 'Features are uneditable',
}

export enum ACG_ERROR_MESSAGES_DESCRIPTION {
  RBAC = 'This control group does not support audience based access control. Only managers can be modified.',
  ABAC = 'If you need to edit other fields remove all managers and admins from this control group and create a new one with the specifications you require.',
}

export enum ACG_POPUP_TITLES {
  SUMMARY = 'Summary',
  FEATURE = 'Feature',
  TARGET_AUDIENCE = 'Target audience',
  MANAGERS = 'Managers',
  ADMINS = 'Admins',
}

export enum ACG_ACCESS_CONTROL_TYPE {
  RBAC = 'RBAC',
  ABAC = 'ABAC',
}
