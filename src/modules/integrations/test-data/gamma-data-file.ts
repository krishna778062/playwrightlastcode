export const OKTA_GROUP = {
  OKTA_LINK: 'https://dev-7599447-admin.okta.com/',
  TOKEN: '00KMwNNDz1XwHwEep76bVu5AsGvLI5I3gobHJxbCje',
  WRONG_TOKEN: '00-DYQQ8ZcekRt2WLvjQ8',
  WRONG_LINK: 'https://admin.okta.com/',
  GROUP_OPTION: 'Use Okta groups',
  DO_NOT_USE_OKTA_GROUPS: 'Do not use Okta groups',
  GROUP_BUTTON: 'Select Okta groups',
  SELECTED_GROUPS_TAB: 'Selected groups',
  GROUP_NAME1: 'Okta Administrators',
  GROUP_NAME2: 'Everyone',
  GROUP_NAME3: 'AutomationTestingGroup01',
  GROUP_NAME4: 'AutomationTestingGroup02',
  DO_NOT_CREATE_AUDIENCES: 'Do not create audiences',
  CREATE_AUDIENCES: 'Create audiences',
} as const;

export const AD_GROUP = {
  AD_GROUP_OPTION: 'Use Microsoft Entra ID groups',
  GROUP_BUTTON: 'Select Microsoft Entra ID groups',
  GROUP_NAME1: 'Analytics-Insights',
  GROUP_NAME2: 'App-Access-Salesforce',
  DONE_BUTTON: 'Done',
  DO_NOT_CREATE_AUDIENCES: 'Do not create audiences',
  CREATE_AUDIENCES: 'Create audiences',
  CONFIRM_MESSAGE: 'Are you sure you want to disconnect Microsoft Entra ID?',
  DISCONNECT_BUTTON_TEXT: 'Disconnect account',
  SOURCE_NAME: 'Microsoft Entra ID',
} as const;
